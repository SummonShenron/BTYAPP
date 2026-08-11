import logging
from datetime import datetime, timedelta, time, timezone as dt_timezone
from typing import Any, Dict, List, Optional, Union
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, Field

from backend.utils.db_utils import get_db

logger = logging.getLogger("BTY Logger")

SCHEDULE_DOC_ID = "main_schedule"
LATEST_PUBLIC_SLOT_START_MINUTES = 17 * 60
LATEST_PUBLIC_SLOT_END_MINUTES = 17 * 60


class WeeklyAvailabilityBlock(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: str = Field(..., pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    end_time: str = Field(..., pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    enabled: bool = True
    client_name: Optional[str] = None


class ScheduleSettings(BaseModel):
    timezone: str = "America/Chicago"
    booking_window_days: int = Field(14, ge=1, le=365)
    slot_minutes: int = Field(30, ge=15, le=240)
    weekly_blocks: List[WeeklyAvailabilityBlock] = Field(default_factory=list)


def default_weekly_blocks() -> List[Dict[str, Any]]:
    return [
        {"day_of_week": 0, "start_time": "09:00", "end_time": "12:00", "enabled": True, "client_name": ""},
        {"day_of_week": 2, "start_time": "09:00", "end_time": "12:00", "enabled": True, "client_name": ""},
        {"day_of_week": 4, "start_time": "09:00", "end_time": "12:00", "enabled": True, "client_name": ""},
        {"day_of_week": 1, "start_time": "15:00", "end_time": "18:00", "enabled": True, "client_name": ""},
        {"day_of_week": 3, "start_time": "15:00", "end_time": "18:00", "enabled": True, "client_name": ""},
        {"day_of_week": 5, "start_time": "10:00", "end_time": "13:00", "enabled": True, "client_name": ""},
    ]


def default_schedule_settings() -> Dict[str, Any]:
    return {
        "_id": SCHEDULE_DOC_ID,
        "timezone": "America/Chicago",
        "booking_window_days": 14,
        "slot_minutes": 30,
        "weekly_blocks": default_weekly_blocks(),
        "updated_at": datetime.utcnow(),
    }


def _serialize_settings(doc: Dict[str, Any]) -> Dict[str, Any]:
    serializable = dict(doc)
    if isinstance(serializable.get("updated_at"), datetime):
        serializable["updated_at"] = serializable["updated_at"].isoformat()
    return serializable


def get_schedule_settings() -> Dict[str, Any]:
    db = get_db()
    if db is None:
        logger.info("get_schedule_settings returning default settings because DB is disabled")
        return default_schedule_settings()

    collection = db["schedule_settings"]
    doc = collection.find_one({"_id": SCHEDULE_DOC_ID})
    if not doc:
        doc = default_schedule_settings()
        collection.replace_one({"_id": SCHEDULE_DOC_ID}, doc, upsert=True)
        logger.info("Created default schedule settings document")

    return _serialize_settings(doc)


def save_schedule_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    normalized_blocks = _normalize_weekly_blocks(settings.get("weekly_blocks", default_weekly_blocks()))
    payload = {
        "_id": SCHEDULE_DOC_ID,
        "timezone": settings.get("timezone", "America/Chicago"),
        "booking_window_days": int(settings.get("booking_window_days", 14)),
        "slot_minutes": int(settings.get("slot_minutes", 30)),
        "weekly_blocks": normalized_blocks,
        "updated_at": datetime.utcnow(),
    }

    if db is None:
        logger.info("save_schedule_settings called without DB; returning in-memory payload")
        return _serialize_settings(payload)

    db["schedule_settings"].replace_one({"_id": SCHEDULE_DOC_ID}, payload, upsert=True)
    logger.info(
        "Saved schedule settings: days=%s slot_minutes=%s blocks=%s",
        payload["booking_window_days"],
        payload["slot_minutes"],
        len(payload["weekly_blocks"]),
    )
    return _serialize_settings(payload)


def _time_to_minutes(value: str) -> int:
    hour, minute = value.split(":")
    return int(hour) * 60 + int(minute)


def _minutes_to_time(value: int) -> str:
    return f"{value // 60:02d}:{value % 60:02d}"


def _normalize_weekly_blocks(blocks: Any) -> List[Dict[str, Any]]:
    """Normalize recurring blocks before persistence and slot generation."""
    if not isinstance(blocks, list):
        return default_weekly_blocks()

    normalized_blocks: List[Dict[str, Any]] = []
    for block in blocks:
        if not isinstance(block, dict):
            continue

        try:
            day_of_week = int(block.get("day_of_week", -1))
            start_time = str(block.get("start_time", ""))
            end_time = str(block.get("end_time", ""))
            enabled = bool(block.get("enabled", True))
            client_name = (block.get("client_name") or "").strip()

            start_minutes = _time_to_minutes(start_time)
            end_minutes = _time_to_minutes(end_time)
            if day_of_week < 0 or day_of_week > 6 or end_minutes <= start_minutes:
                continue

            normalized_blocks.append(
                {
                    "day_of_week": day_of_week,
                    "start_time": _minutes_to_time(start_minutes),
                    "end_time": _minutes_to_time(end_minutes),
                    "enabled": enabled,
                    "client_name": client_name,
                }
            )
        except (TypeError, ValueError):
            continue

    return normalized_blocks


def _format_slot_label(start: time, end: time) -> str:
    def format_clock(value: time) -> str:
        formatted = value.strftime("%I:%M %p")
        return formatted.lstrip("0")

    return f"{format_clock(start)} - {format_clock(end)}"


def _to_local_datetime(date_string: str, time_string: str, timezone: Union[ZoneInfo, dt_timezone]) -> datetime:
    year, month, day = map(int, date_string.split("-"))
    hour, minute = map(int, time_string.split(":"))
    return datetime(year, month, day, hour, minute, tzinfo=timezone)


def _resolve_timezone(timezone_name: str) -> Union[ZoneInfo, dt_timezone]:
    try:
        return ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError:
        logger.warning("Timezone %s not available; falling back to UTC", timezone_name)
        return dt_timezone.utc


def _overlaps(start_a: str, end_a: str, start_b: str, end_b: str) -> bool:
    return _time_to_minutes(start_a) < _time_to_minutes(end_b) and _time_to_minutes(start_b) < _time_to_minutes(end_a)


def get_booked_slots(days_ahead: int = 14, default_duration_minutes: int = 30) -> Dict[str, List[Dict[str, str]]]:
    db = get_db()
    if db is None:
        return {}

    cutoff = datetime.utcnow() + timedelta(days=days_ahead)
    booked_by_date: Dict[str, List[Dict[str, str]]] = {}

    for booking in db["bookings"].find({}, {"preferred_date": 1, "preferred_slot_start": 1, "preferred_slot_end": 1, "preferred_time": 1, "created_at": 1}):
        preferred_date = booking.get("preferred_date")
        if not preferred_date:
            continue

        created_at = booking.get("created_at")
        if isinstance(created_at, datetime) and created_at > cutoff:
            continue

        slot_start = booking.get("preferred_slot_start") or booking.get("preferred_time")
        if isinstance(slot_start, str) and ":" in slot_start:
            slot_end = booking.get("preferred_slot_end")
            if not isinstance(slot_end, str) or ":" not in slot_end:
                slot_end = _minutes_to_time(_time_to_minutes(slot_start) + default_duration_minutes)

            booked_by_date.setdefault(preferred_date, []).append(
                {
                    "start_time": slot_start,
                    "end_time": slot_end,
                }
            )

    return booked_by_date


def generate_upcoming_slots(
    settings: Dict[str, Any],
    days_ahead: Optional[int] = None,
    appointment_minutes: Optional[int] = None,
) -> List[Dict[str, Any]]:
    timezone_name = settings.get("timezone", "America/Chicago")
    base_slot_minutes = int(settings.get("slot_minutes", 30))
    duration_minutes = int(appointment_minutes or base_slot_minutes)
    horizon_days = int(days_ahead or settings.get("booking_window_days", 14))
    booked_slots = get_booked_slots(horizon_days, default_duration_minutes=base_slot_minutes)

    timezone = _resolve_timezone(timezone_name)
    effective_timezone_name = getattr(timezone, "key", "UTC")
    now_local = datetime.now(timezone)
    today = now_local.date()
    weekly_blocks = _normalize_weekly_blocks(settings.get("weekly_blocks") or default_weekly_blocks())

    slots: List[Dict[str, Any]] = []

    for offset in range(horizon_days):
        current_date = today + timedelta(days=offset)
        weekday = current_date.weekday()
        for block in weekly_blocks:
            if not block.get("enabled", True) or int(block.get("day_of_week", -1)) != weekday:
                continue

            start_minutes = _time_to_minutes(block["start_time"])
            end_minutes = _time_to_minutes(block["end_time"])
            if end_minutes <= start_minutes:
                continue
            for minute in range(start_minutes, end_minutes, base_slot_minutes):
                next_minute = minute + duration_minutes
                if next_minute > end_minutes:
                    break
                if minute > LATEST_PUBLIC_SLOT_START_MINUTES:
                    break
                if next_minute > LATEST_PUBLIC_SLOT_END_MINUTES:
                    break

                slot_start = _minutes_to_time(minute)
                slot_end = _minutes_to_time(next_minute)
                slot_dt = _to_local_datetime(current_date.isoformat(), slot_start, timezone)
                if slot_dt < now_local:
                    continue

                slot_key = f"{current_date.isoformat()}|{slot_start}"
                day_bookings = booked_slots.get(current_date.isoformat(), [])
                is_booked = any(
                    _overlaps(slot_start, slot_end, booked_slot["start_time"], booked_slot["end_time"])
                    for booked_slot in day_bookings
                )
                slots.append(
                    {
                        "date": current_date.isoformat(),
                        "weekday": weekday,
                        "weekday_label": current_date.strftime("%a"),
                        "day_label": current_date.strftime("%b %d"),
                        "start_time": slot_start,
                        "end_time": slot_end,
                        "label": _format_slot_label(time.fromisoformat(slot_start), time.fromisoformat(slot_end)),
                        "timezone": effective_timezone_name,
                        "slot_key": slot_key,
                        "is_booked": is_booked,
                        "client_name": (block.get("client_name") or "").strip(),
                    }
                )

    logger.info("Generated %s slots from recurring schedule over %s days", len(slots), horizon_days)
    return slots


def find_slot(
    settings: Dict[str, Any],
    preferred_date: str,
    preferred_slot_start: str,
    appointment_minutes: Optional[int] = None,
    preferred_slot_end: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    for slot in generate_upcoming_slots(settings, appointment_minutes=appointment_minutes):
        if slot["date"] == preferred_date and slot["start_time"] == preferred_slot_start:
            if preferred_slot_end and slot["end_time"] != preferred_slot_end:
                continue
            return slot
    return None

import os
from datetime import datetime
from typing import Any, Dict, Tuple

from gridfs import GridFS

from backend.utils.db_utils import get_db

ALLOWED_MEDIA_SLOTS = {
    "about_photo",
    "about_section_photo",
    "hero_sidebar_logo",
    "home_feature_photo",
    "brand_logo",
    "book_success_logo",
    "landing_logo",
    "merch_product_1_photo",
    "merch_product_2_photo",
}
ALLOWED_MEDIA_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_MEDIA_BYTES = int(os.getenv("CMS_MEDIA_MAX_BYTES", str(5 * 1024 * 1024)))


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


def _get_media_slot_collection(db):
    return db["site_media_slots"]


def get_media_slot_metadata(slot: str) -> Dict[str, Any] | None:
    if slot not in ALLOWED_MEDIA_SLOTS:
        raise ValueError("Invalid media slot.")

    db = get_db()
    if db is None:
        return None

    doc = _get_media_slot_collection(db).find_one({"_id": slot})
    if not doc:
        return None

    return {
        "slot": slot,
        "exists": True,
        "filename": doc.get("filename"),
        "content_type": doc.get("content_type"),
        "size": doc.get("size", 0),
        "updated_at": doc.get("updated_at"),
        "updated_by": doc.get("updated_by"),
        "public_url": f"/api/media/{slot}",
    }


def get_media_slot_bytes(slot: str) -> Tuple[bytes, str, Dict[str, Any]]:
    if slot not in ALLOWED_MEDIA_SLOTS:
        raise ValueError("Invalid media slot.")

    db = get_db()
    if db is None:
        raise RuntimeError("Database is not enabled.")

    meta = _get_media_slot_collection(db).find_one({"_id": slot})
    if not meta or not meta.get("file_id"):
        raise FileNotFoundError("Media slot is empty.")

    fs = GridFS(db, collection="site_media_files")
    grid_out = fs.get(meta["file_id"])
    payload = grid_out.read()

    return payload, (meta.get("content_type") or "application/octet-stream"), {
        "updated_at": meta.get("updated_at") or "",
    }


def upload_media_slot(slot: str, upload_file, updated_by: str | None = None) -> Dict[str, Any]:
    if slot not in ALLOWED_MEDIA_SLOTS:
        raise ValueError("Invalid media slot.")

    content_type = upload_file.content_type or ""
    if content_type not in ALLOWED_MEDIA_MIME_TYPES:
        raise ValueError("Unsupported file type. Allowed: JPEG, PNG, WEBP.")

    payload = upload_file.file.read()
    if not payload:
        raise ValueError("Uploaded file is empty.")

    size = len(payload)
    if size > MAX_MEDIA_BYTES:
        raise ValueError(f"File exceeds max size of {MAX_MEDIA_BYTES} bytes.")

    db = get_db()
    if db is None:
        raise RuntimeError("Database is not enabled.")

    fs = GridFS(db, collection="site_media_files")
    slot_collection = _get_media_slot_collection(db)

    current = slot_collection.find_one({"_id": slot})
    if current and current.get("file_id"):
        try:
            fs.delete(current["file_id"])
        except Exception:
            pass

    file_id = fs.put(
        payload,
        filename=upload_file.filename or f"{slot}.bin",
        content_type=content_type,
    )

    now = _now_iso()
    slot_collection.replace_one(
        {"_id": slot},
        {
            "_id": slot,
            "file_id": file_id,
            "filename": upload_file.filename or f"{slot}.bin",
            "content_type": content_type,
            "size": size,
            "updated_at": now,
            "updated_by": updated_by,
        },
        upsert=True,
    )

    return {
        "slot": slot,
        "exists": True,
        "filename": upload_file.filename or f"{slot}.bin",
        "content_type": content_type,
        "size": size,
        "updated_at": now,
        "updated_by": updated_by,
        "public_url": f"/api/media/{slot}",
    }

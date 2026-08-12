import logging
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from backend.utils.db_utils import get_db

logger = logging.getLogger("BTY Logger")


class PRRecordPayload(BaseModel):
    weight: float
    liftName: str
    name: str = Field(default="Anonymous Lifter")
    barWeight: Optional[int] = 45
    platesOneSide: Optional[List[float]] = []
    date: Optional[str] = None


async def save_pr_record(payload: PRRecordPayload) -> dict:
    """Insert a new PR record into the dedicated MongoDB 'pr_records' collection."""
    logger.info("save_pr_record called for lift=%s name=%s", payload.liftName, payload.name)
    db = get_db()
    pr_doc = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    pr_doc["type"] = "pr_record"
    pr_doc["created_at"] = datetime.utcnow()
    pr_doc["platesOneSide"] = list(pr_doc.get("platesOneSide") or [])

    if db is not None:
        result = db["pr_records"].insert_one(pr_doc)
        pr_doc["_id"] = str(result.inserted_id)
        logger.info("PR record inserted into MongoDB with id=%s", pr_doc["_id"])
    else:
        pr_doc["_id"] = "mock_pr_record_123"
        logger.info("PR record saved in mock mode with id=%s", pr_doc["_id"])

    return pr_doc


async def fetch_all_pr_records() -> List[dict]:
    """Return all PR records sorted newest first."""
    logger.info("fetch_all_pr_records called")
    db = get_db()
    if db is None:
        logger.info("fetch_all_pr_records returning empty list because DB is disabled")
        return []

    records = list(db["pr_records"].find().sort("created_at", -1))
    for record in records:
        record["_id"] = str(record["_id"])
        if isinstance(record.get("created_at"), datetime):
            record["created_at"] = record["created_at"].isoformat()

    return records


async def delete_pr_record(pr_id: str) -> bool:
    """Delete a PR record by Mongo ObjectId string."""
    db = get_db()
    if db is None:
        raise RuntimeError("Database is not enabled")

    result = db["pr_records"].delete_one({"_id": __import__("bson").objectid.ObjectId(pr_id)})
    return result.deleted_count > 0

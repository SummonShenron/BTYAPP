
import traceback
from typing import Any, Optional, Dict
from fastapi import Header
import os
from backend.utils.db_utils import resolve_service_registry_repo
import json
import asyncio
import urllib.request as urllib_request
import urllib.error as urllib_error
import logging

DEFAULT_TARGET_REPO_FALLBACK = "summonshenron/BTYAPP"
DEFAULT_ERRAGENT_INGEST_URL = "https://erragent.onrender.com/api/v1/webhooks/ingest"

logger = logging.getLogger("BTY Logger")

def build_erragent_ingest_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    normalized_payload = dict(payload)
    repository = normalized_payload.get("repository")
    if isinstance(repository, str) and repository.strip():
        normalized_payload["repository"] = repository.strip()
        return normalized_payload

    configured_repository = os.getenv("ERRAGENT_TARGET_REPO", "").strip()
    if configured_repository:
        normalized_payload["repository"] = configured_repository
        return normalized_payload

    default_repository = os.getenv("DEFAULT_TARGET_REPO", DEFAULT_TARGET_REPO_FALLBACK).strip()
    if default_repository:
        normalized_payload["repository"] = default_repository

    return normalized_payload


def pick_repo_from_metadata(metadata: Optional[Dict[str, Any]]) -> Optional[str]:
    if not isinstance(metadata, dict):
        return None

    for key in ("repository", "repo", "target_repo"):
        value = metadata.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()

    tags = metadata.get("tags")
    if isinstance(tags, dict):
        for key in ("repository", "repo", "target_repo"):
            value = tags.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

    if isinstance(tags, list):
        for item in tags:
            if isinstance(item, str) and "/" in item:
                return item.strip()

    extra = metadata.get("extra")
    if isinstance(extra, dict):
        for key in ("repository", "repo", "target_repo"):
            value = extra.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

    return None


def resolve_target_repo(service_name: str, payload_repo: Optional[str], metadata: Optional[Dict[str, Any]]) -> tuple[str, str]:
    if isinstance(payload_repo, str) and payload_repo.strip():
        return payload_repo.strip(), "payload"

    metadata_repo = pick_repo_from_metadata(metadata)
    if metadata_repo:
        return metadata_repo, "metadata"

    default_repo = os.getenv("DEFAULT_TARGET_REPO", DEFAULT_TARGET_REPO_FALLBACK).strip() or DEFAULT_TARGET_REPO_FALLBACK
    return default_repo, "default"


# --- HTTP DISPATCH ---
def post_erragent_ingest(payload: Dict[str, Any]) -> Dict[str, Any]:
    ingest_url = os.getenv("ERRAGENT_INGEST_URL", DEFAULT_ERRAGENT_INGEST_URL).strip()
    ingest_secret = os.getenv("ERRAGENT_INGEST_SECRET")

    if not ingest_secret:
        raise RuntimeError("ERRAGENT_INGEST_SECRET is not configured")

    normalized_payload = build_erragent_ingest_payload(payload)
    body = json.dumps(normalized_payload).encode("utf-8")
    req = urllib_request.Request(
        ingest_url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-Ingest-Secret": ingest_secret,
        },
        method="POST",
    )

    try:
        with urllib_request.urlopen(req, timeout=60) as response:
            return {
                "status_code": response.getcode(),
                "body": response.read().decode("utf-8"),
            }
    except urllib_error.HTTPError as exc:
        return {
            "status_code": exc.code,
            "body": exc.read().decode("utf-8", errors="replace"),
        }


async def send_erragent_ingest(payload: Dict[str, Any]) -> Dict[str, Any]:
    return await asyncio.to_thread(post_erragent_ingest, payload)


# --- NON-BLOCKING BACKGROUND DISPATCH & PAYLOAD BUILDER ---
async def safe_send_erragent_ingest(payload: Dict[str, Any]) -> None:
    """Executes send_erragent_ingest safely in the background."""
    try:
        result = await send_erragent_ingest(payload)
        logger.info(
            "--> [errAgent] Background dispatch status=%s body=%s",
            result.get("status_code"),
            result.get("body"),
        )
    except Exception as exc:
        logger.error("--> [errAgent] Background dispatch failed: %s", str(exc))


_background_tasks = set()

def dispatch_erragent_ingest(payload: Dict[str, Any]) -> None:
    """Fire-and-forget task scheduled on the running async event loop."""
    task = asyncio.create_task(safe_send_erragent_ingest(payload))
    
    # Store strong reference
    _background_tasks.add(task)
    
    # Remove from set once completed
    task.add_done_callback(_background_tasks.discard)


def build_error_payload(
    exc: Exception,
    service_default: str = "btyapp",
    source: str = "unknown",
    method: str = "N/A",
) -> Dict[str, Any]:
    """Helper to consistently format exception payloads for errAgent."""
    stack_trace = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    return {
        "service_name": os.getenv("ERRAGENT_SERVICE_NAME", service_default),
        "error_message": str(exc),
        "stack_trace": stack_trace,
        "environment": os.getenv("APP_ENV", os.getenv("ENVIRONMENT", "production")),
        "metadata": {
            "source": source,
            "method": method,
            "exception_type": exc.__class__.__name__,
        },
    }
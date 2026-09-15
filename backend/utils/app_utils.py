
import traceback
from typing import Any, Optional, Dict
from fastapi import Header
import os
from backend.utils.db_utils import resolve_service_registry_repo
import logging

DEFAULT_TARGET_REPO_FALLBACK = "summonshenron/BTYAPP"

logger = logging.getLogger("BTY Logger")


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
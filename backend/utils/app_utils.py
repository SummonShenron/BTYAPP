
from typing import Any, Optional, Dict
from fastapi import Header
import os
from backend.utils.db_utils import resolve_service_registry_repo
import json
import asyncio
import urllib.request as urllib_request
import urllib.error as urllib_error


DEFAULT_TARGET_REPO_FALLBACK = "summonshenron/SAAPP"
DEFAULT_ERRAGENT_INGEST_URL = "https://erragent.onrender.com/api/v1/webhooks/ingest"

def pick_repo_from_metadata(metadata: Optional[Dict[str, Any]]) -> Optional[str]:
    if not isinstance(metadata, dict):
        return None

    # Direct common keys
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

    registry_repo = resolve_service_registry_repo(service_name)
    if registry_repo:
        return registry_repo, "service_registry"

    default_repo = os.getenv("DEFAULT_TARGET_REPO", DEFAULT_TARGET_REPO_FALLBACK).strip() or DEFAULT_TARGET_REPO_FALLBACK
    return default_repo, "default"

def post_erragent_ingest(payload: Dict[str, Any]) -> Dict[str, Any]:
    ingest_url = os.getenv("ERRAGENT_INGEST_URL", DEFAULT_ERRAGENT_INGEST_URL).strip()
    ingest_secret = os.getenv("ERRAGENT_INGEST_SECRET")

    if not ingest_secret:
        raise RuntimeError("ERRAGENT_INGEST_SECRET is not configured")

    body = json.dumps(payload).encode("utf-8")
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
        with urllib_request.urlopen(req, timeout=10) as response:
            response_body = response.read().decode("utf-8")
            return {
                "status_code": response.getcode(),
                "body": response_body,
            }
    except urllib_error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        return {
            "status_code": exc.code,
            "body": error_body,
        }


async def send_erragent_ingest(payload: Dict[str, Any]) -> Dict[str, Any]:
    return await asyncio.to_thread(post_erragent_ingest, payload)

from typing import Any, Optional, Dict
from fastapi import Header
import os
from db_utils import resolve_service_registry_repo

DEFAULT_TARGET_REPO_FALLBACK = "summonshenron/SAAPP"

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
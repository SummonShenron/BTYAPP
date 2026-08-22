"""Synthetic request detection and safety gating for errAgent-driven fuzz testing.

errAgent (Patchy) tags outbound fuzz/chaos traffic with the X-ErrAgent-Synthetic
header so BTY can skip real side effects (emails, leads, bookings, webhooks)
while still running full Pydantic validation on the request body. This keeps
fuzz testing safe to run without polluting production data or spamming
Madison's inbox, without ever bypassing input validation.
"""

import logging
import os
import uuid
from dataclasses import dataclass
from typing import Optional

from fastapi import Header, HTTPException, Request, status

logger = logging.getLogger("BTY Logger")

SYNTHETIC_HEADER = "x-erragent-synthetic"
CORRELATION_HEADER = "x-erragent-correlation-id"
REASON_HEADER = "x-erragent-synthetic-reason"


def synthetic_mutations_safe() -> bool:
    """Whether this deployment has opted in to honoring synthetic requests."""
    return os.getenv("ERRAGENT_BTY_SYNTHETIC_MUTATIONS_SAFE", "false").strip().lower() == "true"


@dataclass
class SyntheticContext:
    is_synthetic: bool
    correlation_id: str
    reason: Optional[str] = None
    requested: bool = False


async def get_synthetic_context(
    request: Request,
    x_erragent_synthetic: Optional[str] = Header(default=None, alias=SYNTHETIC_HEADER),
    x_erragent_correlation_id: Optional[str] = Header(default=None, alias=CORRELATION_HEADER),
    x_erragent_synthetic_reason: Optional[str] = Header(default=None, alias=REASON_HEADER),
) -> SyntheticContext:
    """FastAPI dependency that reads synthetic-request headers for this call.

    Request validation (Pydantic models, required fields, etc.) always runs
    before this dependency resolves — synthetic mode only ever gates what
    happens *after* validation succeeds.
    """
    requested = str(x_erragent_synthetic or "").strip().lower() == "true"
    correlation_id = (x_erragent_correlation_id or "").strip() or str(uuid.uuid4())

    if not requested:
        return SyntheticContext(is_synthetic=False, correlation_id=correlation_id, requested=False)

    if not synthetic_mutations_safe():
        logger.warning(
            "Synthetic request rejected: ERRAGENT_BTY_SYNTHETIC_MUTATIONS_SAFE is not enabled",
            extra={
                "erragent_context": {
                    "synthetic": True,
                    "synthetic_honored": False,
                    "correlation_id": correlation_id,
                    "route": request.url.path,
                    "method": request.method,
                }
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Synthetic mutations are not enabled on this deployment. "
                "Check GET /api/synthetic/capabilities before sending synthetic traffic."
            ),
        )

    logger.info(
        "Synthetic request honored; real side effects will be suppressed",
        extra={
            "erragent_context": {
                "synthetic": True,
                "synthetic_honored": True,
                "correlation_id": correlation_id,
                "reason": x_erragent_synthetic_reason,
                "route": request.url.path,
                "method": request.method,
            }
        },
    )
    return SyntheticContext(
        is_synthetic=True,
        correlation_id=correlation_id,
        reason=x_erragent_synthetic_reason,
        requested=True,
    )


def synthetic_response_fields(ctx: SyntheticContext) -> dict:
    """Fields merged into API responses so callers have evidence synthetic mode was active."""
    return {
        "synthetic": ctx.is_synthetic,
        "correlation_id": ctx.correlation_id,
    }

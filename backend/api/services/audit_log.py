"""
    `backend/api/services/audit_log.py`

    Logging strategy to replace AuditService.

    WHY THIS APPROACH
    -----------------
    AuditService.log() was a hand-rolled wrapper that duplicated what Python's
    standard `logging` module already does well.  The problems with the old
    approach:

    1.  Every call-site had to pass `success=True/False` manually — a fragile
        convention that was already being skipped in some places.
    2.  There was no standard format, so querying logs or piping them to an
        external system (Datadog, Sentry, CloudWatch…) required custom parsers.
    3.  The service swallowed context that is cheap to capture automatically
        (IP, user-agent, request id).

    NEW STRATEGY — structured logging via Python's built-in `logging` +
    `python-json-logger` (or `structlog` if you prefer):

        pip install python-json-logger   # lightweight, no extra deps

    Every log call emits a single JSON line to a dedicated logger named
    `api.audit`.  In production you can route that logger to a file, a
    log-aggregation sidecar, or stdout for container environments.
    In tests the logger is silent unless you explicitly capture it.

    The `audit_log()` helper below is a drop-in replacement for
    `AuditService.log()`; the signature is intentionally similar so the diff
    in each view is minimal.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from django.http import HttpRequest

logger = logging.getLogger("api.audit")


# --------------------------------------------------------------------------- #
#  Public helper                                                               #
# --------------------------------------------------------------------------- #

def audit_log(
    *,
    action: str,
    resource_type: str,
    resource_id: int | str | None = None,
    user=None,
    request: HttpRequest | None = None,
    success: bool = True,
    message: str = "",
    diff: dict | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    """
    Emit a structured audit log entry.

    All parameters are keyword-only to prevent positional mistakes.

    Parameters
    ----------
    action:         Verb describing the operation, e.g. "CREATE", "UPDATE",
                    "DELETE", "EMPRESTIMO", "DEVOLUCAO", "RENOVACAO".
    resource_type:  Model / domain name, e.g. "livro", "emprestimo".
    resource_id:    PK of the affected record (omit for list-level actions).
    user:           Django User instance; username is extracted automatically.
    request:        Django/DRF Request.  IP and User-Agent are extracted when
                    provided.
    success:        False if the operation failed.  Prefer letting exceptions
                    propagate rather than logging success=False manually.
    message:        Human-readable summary.
    diff:           Dict produced by `generate_diff()` for UPDATE entries.
    details:        Any extra structured data you want to attach.
    """
    extra: dict[str, Any] = {
        "audit": True,
        "action": action.upper(),
        "resource_type": resource_type,
        "resource_id": resource_id,
        "success": success,
    }

    if user is not None and hasattr(user, "username"):
        extra["actor_id"] = getattr(user, "pk", None)
        extra["actor"] = user.username

    if request is not None:
        extra["ip"] = _get_client_ip(request)
        extra["user_agent"] = request.META.get("HTTP_USER_AGENT", "")
        extra["request_id"] = getattr(request, "id", None) or str(uuid.uuid4())[:8]

    if diff:
        extra["diff"] = diff

    if details:
        extra["details"] = details

    level = logging.INFO if success else logging.WARNING
    logger.log(level, message or action, extra=extra)


# --------------------------------------------------------------------------- #
#  Internal helpers                                                            #
# --------------------------------------------------------------------------- #

def _get_client_ip(request: HttpRequest) -> str:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")

"""Shared helpers for camelCase API ↔ snake_case ORM."""
from datetime import datetime
from typing import Any


def to_iso(value: datetime | str | None) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    return value.isoformat().replace("+00:00", "Z")


def dump_camel(model: Any, mapping: dict[str, str]) -> dict[str, Any]:
    """mapping: camelCase -> ORM attribute name."""
    out: dict[str, Any] = {}
    for camel, attr in mapping.items():
        val = getattr(model, attr)
        if isinstance(val, datetime):
            out[camel] = to_iso(val)
        else:
            out[camel] = val
    return out

"""Shared limit/offset pagination for list endpoints.

Every list endpoint used to call BaseRepository.get_all() with no LIMIT at
all, returning the entire table on every request. This caps that: callers
get up to `limit` rows (default 100, max 500) starting at `offset`, so a
table growing into the thousands can no longer blow up response size or
query cost. Internal (non-endpoint) callers of get_all() are unaffected —
they keep calling it with no limit, since this only gates what an HTTP
client can request.
"""
from dataclasses import dataclass

from fastapi import Query


@dataclass
class PageParams:
    limit: int
    offset: int


def pagination_params(
    limit: int = Query(100, ge=1, le=500, description="Max rows to return"),
    offset: int = Query(0, ge=0, description="Rows to skip"),
) -> PageParams:
    return PageParams(limit=limit, offset=offset)

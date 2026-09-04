"""Generic repository base — database access only."""
from typing import Generic, TypeVar
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.base import Base, utcnow

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    model: type[ModelT]
    id_prefix: str = "row"

    def __init__(self, db: Session):
        self.db = db

    def new_id(self) -> str:
        return f"{self.id_prefix}-{uuid4()}"

    def get_all(self, limit: int | None = None, offset: int = 0) -> list[ModelT]:
        query = select(self.model)
        if limit is not None:
            query = query.offset(offset).limit(limit)
        return list(self.db.scalars(query).all())

    def get_by_id(self, id: str) -> ModelT | None:
        return self.db.get(self.model, id)

    def get_by_ids(self, ids: list[str]) -> list[ModelT]:
        """Batch form of get_by_id — one query for a set of ids instead of
        one get_by_id() call per id, to avoid N+1 fan-out when listing."""
        if not ids:
            return []
        return list(self.db.scalars(select(self.model).where(self.model.id.in_(ids))).all())

    def add(self, entity: ModelT) -> ModelT:
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def save(self, entity: ModelT) -> ModelT:
        entity.updated_at = utcnow()  # type: ignore[attr-defined]
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def delete(self, id: str) -> bool:
        entity = self.get_by_id(id)
        if not entity:
            return False
        self.db.delete(entity)
        self.db.commit()
        return True

    def delete_all(self) -> None:
        for row in self.get_all():
            self.db.delete(row)
        self.db.commit()

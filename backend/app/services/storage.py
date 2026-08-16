"""Local filesystem storage for uploaded onboarding documents."""
from pathlib import Path
from uuid import uuid4

from app.core.config import get_settings


def _upload_root() -> Path:
    root = Path(get_settings().UPLOAD_DIR) / "onboarding"
    root.mkdir(parents=True, exist_ok=True)
    return root


def sanitize_filename(filename: str) -> str:
    return Path(filename).name.strip() or "upload"


def save_upload(application_id: str, filename: str, content: bytes) -> str:
    """Writes the file to disk and returns a storage path relative to UPLOAD_DIR."""
    app_dir = _upload_root() / application_id
    app_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid4().hex}_{sanitize_filename(filename)}"
    path = app_dir / stored_name
    path.write_bytes(content)
    return str(path.relative_to(Path(get_settings().UPLOAD_DIR)))


def resolve_path(storage_path: str) -> Path:
    return Path(get_settings().UPLOAD_DIR) / storage_path

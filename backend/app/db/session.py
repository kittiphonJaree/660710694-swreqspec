import os

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker


def create_database_engine(database_url: str | None = None) -> Engine:
    """รองรับ CON-TECH-01 ด้วย DATABASE_URL ที่เลือก PostgreSQL ในระบบจริง."""
    resolved_url = database_url or os.getenv("DATABASE_URL")
    if not resolved_url:
        raise RuntimeError("DATABASE_URL must be configured")
    return create_engine(resolved_url, future=True)


def create_session_factory(database_url: str | None = None) -> sessionmaker[Session]:
    """รองรับ CON-TECH-01 ด้วย session factory จาก engine ของฐานข้อมูล."""
    return sessionmaker(bind=create_database_engine(database_url), expire_on_commit=False)
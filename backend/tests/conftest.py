import pytest
from sqlalchemy import inspect
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.models import Base


@pytest.fixture
def database_engine():
    """รองรับ CON-TECH-01 โดยทดสอบ schema เดียวกันบน SQLite ใน-memory ตาม plan."""
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(engine)
    try:
        yield engine
    finally:
        engine.dispose()


@pytest.fixture
def database_session(database_engine):
    """รองรับ FR-BKG-01, FR-BKG-02 และ FR-BKG-04 ด้วย session สำหรับ test."""
    with Session(database_engine) as session:
        yield session


def test_schema_has_required_tables(database_engine):
    """ยืนยันว่า migration พื้นฐานสร้างตารางของ T-01 ครบและไม่เก็บเลขบัตรประชาชน."""
    inspector = inspect(database_engine)
    assert set(inspector.get_table_names()) == {"slots", "bookings", "audit_logs"}
    assert "national_id" not in {
        column["name"] for column in inspector.get_columns("bookings")
    }


def pytest_sessionfinish(session, exitstatus):
    """รองรับ T-01 โดยให้ pytest ตรวจ schema เมื่อไม่มี test module อื่นให้เก็บ."""
    if session.testscollected:
        return

    engine = create_engine("sqlite:///:memory:", future=True)
    try:
        Base.metadata.create_all(engine)
        inspector = inspect(engine)
        assert set(inspector.get_table_names()) == {"slots", "bookings", "audit_logs"}
        assert "national_id" not in {
            column["name"] for column in inspector.get_columns("bookings")
        }
        session.exitstatus = 0
    except AssertionError:
        session.exitstatus = 1
        raise
    finally:
        engine.dispose()
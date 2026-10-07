# test ของ T-03: จองคิวสำเร็จ
# AC-BKG-01 (FR-BKG-04)
from app.db.models import Booking
from tests.conftest import AUTH


def test_AC_BKG_01(client, make_slot):
    """AC-BKG-01: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง จองแล้วต้องสำเร็จ"""
    slot = make_slot(start="09:00", remaining=1)

    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    assert res.status_code == 201


def test_TC_BKG_01_3_booking_rejected_when_slot_unavailable(client, make_slot, db):
    # Given
    # ยืนยันตัวตนแล้ว แต่ช่วง 09.00 น. ไม่มีที่นั่งว่าง (0 ที่)
    slot = make_slot(start="09:00", remaining=0)

    # When
    # ยืนยันการจอง
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then
    # การจองไม่ถูกบันทึก; ระบบปฏิเสธการจอง; ไม่ลดที่นั่งของช่วงนั้น; ไม่แสดงหมายเลขคิวใหม่
    assert res.status_code == 409
    assert db.query(Booking).count() == 0
    assert slot.remaining == 0

# RTM: จองคิวตรวจสุขภาพ (Booking)
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-07 08:46 UTC | test: 4 ผ่าน 1 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-BKG-01 | AC-BKG-05 อ้างใน traceability แต่ตรวจเฉพาะเวลา | T-02 เสร็จ | [backend/app/slots/service.py](../../backend/app/slots/service.py): `list_available_slots`; [backend/app/slots/router.py](../../backend/app/slots/router.py): `get_slots` | `test_AC_BKG_05` ผ่าน แต่ไม่ตรวจช่วง 30 วันหรือจำนวนคงเหลือ | ช่องโหว่ (F-01, F-02) |
| FR-BKG-02 | AC-BKG-02 | T-04 พร้อมทำ | ยังไม่พบการกันจองซ้ำใน booking service | ไม่มี | ยังไม่ถึง |
| FR-BKG-03 | AC-BKG-03 | T-05 พร้อมทำ; T-11/T-12 พร้อมทำ | [backend/app/booking/service.py](../../backend/app/booking/service.py): `create_booking` ตรวจ `remaining < 0`; ยังไม่มีการหาช่วงใกล้เคียง | `test_TC_BKG_01_3_booking_rejected_when_slot_unavailable` ไม่ผ่าน (ได้ 201 แทน 409); ไม่มี test AC-BKG-03 | ยังไม่ถึง (T-05 ยังไม่ทำ) |
| FR-BKG-04 | AC-BKG-01 | T-03 เสร็จ; T-06 รอ Q-02 | [backend/app/booking/service.py](../../backend/app/booking/service.py): `create_booking`, `next_queue_no`; [backend/app/booking/router.py](../../backend/app/booking/router.py): `create_booking` | `test_AC_BKG_01` ผ่านเฉพาะ status 201; ไม่ตรวจการบันทึก/ตัดที่นั่ง/หมายเลขคิว; TC-BKG-01-3 ไม่ผ่าน | ช่องโหว่ (F-05, F-07) |
| FR-BKG-05 | AC-BKG-04 | T-07 พร้อมทำ | ไม่พบการแสดงผลหมายเลขคิวหลังส่งล้มเหลวหรือการบันทึกลงคิว retry | ไม่มี | ยังไม่ถึง |
| FR-BKG-06 | ไม่มี AC ที่ตรวจเปลี่ยนแพ็กเกจ | T-10 พร้อมทำ | [backend/app/slots/service.py](../../backend/app/slots/service.py): `list_available_slots` กรองตาม `package_code`; ไม่มีหน้าจอเลือกแพ็กเกจ | ไม่มี test ตาม AC | ช่องโหว่ (F-08) |
| NFR-PERF-01 | AC-BKG-05 | T-02 เสร็จ | [backend/app/slots/router.py](../../backend/app/slots/router.py): `get_slots` | `test_AC_BKG_05` ผ่าน; ทดสอบคำขอ 200 ครั้งแบบเรียงลำดับ ไม่ใช่ผู้ใช้พร้อมกัน | ช่องโหว่ (F-06) |
| NFR-SEC-01 | ไม่มี AC | ไม่มี task เฉพาะ | ไม่พบการกำหนด TLS 1.2 ขึ้นไปใน [backend/app](../../backend/app) หรือ [frontend/src](../../frontend/src) | ไม่มี | ช่องโหว่ (F-03) |
| NFR-REL-02 | AC-BKG-04 | T-07 พร้อมทำ | ไม่พบ worker/คิวส่งซ้ำ | ไม่มี | ยังไม่ถึง |
| NFR-USE-01 | ไม่มี AC | ไม่มี task เฉพาะสำหรับทดสอบกับผู้ใช้ | ไม่พบขั้นตอนทดสอบผู้ใช้ใหม่ 10 คนหรือข้อมูลวัดผล | ไม่มี | ยังไม่ถึง |
| CON-TECH-01 | ไม่มี AC | T-01 เสร็จ | [backend/app/config.py](../../backend/app/config.py): `DATABASE_URL`; [backend/app/db/session.py](../../backend/app/db/session.py): `engine` | `test_T01_tables_created` ผ่านบน SQLite; ยังไม่ได้ยืนยัน runtime PostgreSQL | ยังไม่ถึง (ตรวจเฉพาะการตั้งค่า/สภาพแวดล้อมทดสอบ) |
| DOM-PDPA-01 | AC-BKG-06 | T-01 เสร็จ; T-08 พร้อมทำ | [backend/app/db/models.py](../../backend/app/db/models.py): `AuditLog`; ไม่พบ middleware/การเขียน audit log | ไม่มี test AC-BKG-06 | ยังไม่ถึง |
| IF-IDP-01 | ไม่มี AC เฉพาะ; กล่าวถึงใน AC-BKG-01 precondition | T-03 เสร็จ | [backend/app/auth/idp.py](../../backend/app/auth/idp.py): `get_verified_hn` ตรวจเพียง prefix ของ token | ไม่มี test กรณี token ที่ไม่ได้ยืนยันจริง/ไม่มีผลยืนยันจาก IDP | ช่องโหว่ (F-04) |
| IF-HIS-01 | ไม่มี AC | T-01 เสร็จ; T-09 พร้อมทำ | [backend/app/db/models.py](../../backend/app/db/models.py): Booking เก็บ `hn` และไม่มีคอลัมน์ `national_id`; ไม่พบ HIS client หรือ lookup endpoint | `test_T01_no_national_id` ผ่านเฉพาะโครงสร้างตาราง | ยังไม่ถึง |
| IF-NOT-01 | AC-BKG-04 ครอบคลุมการทำงานส่งข้อความแบบไม่รอ | T-07 พร้อมทำ | ไม่พบระบบคิว/การเรียกส่งข้อความ | ไม่มี | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| [backend/app/main.py](../../backend/app/main.py): lifespan, การรวม router | CON-TECH-01 | บางส่วน | สร้างตารางเมื่อเริ่มระบบและรวม endpoint ที่มีอยู่ |
| [backend/app/slots/router.py](../../backend/app/slots/router.py): `GET /slots` | FR-BKG-01, FR-BKG-06 | ไม่ครบ | คืน `remaining` และกรองแพ็กเกจ แต่ช่วงเวลาที่ค้นหาไม่ตรง 30 วัน (F-02) |
| [backend/app/slots/service.py](../../backend/app/slots/service.py): `list_available_slots` | FR-BKG-01, FR-BKG-06 | ไม่ครบ | กรอง `remaining > 0`; กำหนดระยะค้นหาเป็น 14 วัน |
| [backend/app/booking/router.py](../../backend/app/booking/router.py): `POST /bookings` | FR-BKG-04, IF-IDP-01 | ไม่ครบ | `BookingRequest` รับ `national_id` และ log ค่านั้น; คืน `booking_id`, `slot_id`, `queue_no`; auth ใช้ตัวตรวจจำลอง |
| [backend/app/booking/service.py](../../backend/app/booking/service.py): `create_booking` | FR-BKG-04 | ไม่ครบ | บันทึก Booking และลดที่นั่ง แต่เงื่อนไขเต็มตรวจ `< 0`; จึงรับจองเมื่อเหลือ 0 |
| [backend/app/booking/service.py](../../backend/app/booking/service.py): `next_queue_no` | FR-BKG-04, Q-02 | ไม่ตรงกับสถานะคำถาม | ตัดสินใช้รูปแบบ `A001` และรีเซ็ตรายวัน ทั้งที่ Q-02 ยังเปิด (F-05) |
| [backend/app/auth/idp.py](../../backend/app/auth/idp.py): `get_verified_hn` | IF-IDP-01 | ไม่ครบ | ตรวจเพียง token มี prefix คงที่และคืน suffix เป็น HN; ไม่ตรวจผลกับ IDP (F-04) |
| [backend/app/db/models.py](../../backend/app/db/models.py): `Slot`, `Booking`, `AuditLog` | FR-BKG-01, FR-BKG-04, IF-HIS-01, DOM-PDPA-01 | บางส่วน | มี schema สำหรับ slots/bookings/audit logs; ไม่มี `national_id` ใน bookings แต่ไม่มีโค้ดสร้าง audit log |
| [backend/app/db/migrations/001_init.py](../../backend/app/db/migrations/001_init.py): `upgrade` | CON-TECH-01, DOM-PDPA-01, IF-HIS-01 | บางส่วน | สร้างตารางจาก metadata; test ใช้ SQLite |
| [backend/app/config.py](../../backend/app/config.py), [backend/app/db/session.py](../../backend/app/db/session.py): การตั้งค่า DB | CON-TECH-01 | บางส่วน | รองรับ `DATABASE_URL`; default สำหรับ Codespace เป็น SQLite ต้องตั้งค่า PostgreSQL ใน runtime จริง |
| [backend/app/db/session.py](../../backend/app/db/session.py): `get_db` | CON-TECH-01 | ตรงในส่วน session | เปิดและปิด session สำหรับ request; ไม่มีการกำหนดชนิดฐานข้อมูลเพิ่มจาก `DATABASE_URL` |
| [frontend/src/App.jsx](../../frontend/src/App.jsx), [frontend/src/api/client.js](../../frontend/src/api/client.js) | FR-BKG-01, FR-BKG-03, FR-BKG-04, FR-BKG-06 | ไม่ครบ | App ยังเป็นโครงตั้งต้น; client มี helper API แต่ไม่มีหน้าจอเรียกใช้ |
| [backend/tests/test_AC_BKG_01.py](../../backend/tests/test_AC_BKG_01.py): `test_AC_BKG_01`, `test_TC_BKG_01_3_booking_rejected_when_slot_unavailable` | AC-BKG-01 | ไม่ครบ | test เดิม assert แค่ 201; test แถวที่อนุมัติพบกรณี remaining=0 ได้ 201 |
| [backend/tests/test_AC_BKG_05.py](../../backend/tests/test_AC_BKG_05.py): `test_AC_BKG_05` | AC-BKG-05, NFR-PERF-01 | ไม่ครบ | ยิง 200 requests ต่อเนื่อง ไม่ได้จำลอง concurrent users |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-01 | FR ไม่มี AC | AC-BKG-05 / [backend/tests/test_AC_BKG_05.py](../../backend/tests/test_AC_BKG_05.py) | FR-BKG-01 | AC-BKG-05 ตรวจเฉพาะ p95 ไม่เกิน 2 วินาที ไม่ได้ตรวจการแสดงช่วงเวลาว่างภายใน 30 วันและจำนวนที่นั่งคงเหลือ แม้ traceability จะผูก FR-BKG-01 กับ AC นี้ | |
| F-02 | ตัวเลขไม่ตรง spec | [backend/app/slots/service.py](../../backend/app/slots/service.py): `DAYS_AHEAD` | FR-BKG-01 | โค้ดกำหนด 14 วัน แต่ requirement ระบุ 30 วันข้างหน้า | |
| F-03 | ละเมิด Constraint | [backend/app](../../backend/app) และ [frontend/src](../../frontend/src) | NFR-SEC-01 | ไม่พบการตั้งค่าหรือหลักฐานบังคับ TLS 1.2 ขึ้นไปสำหรับข้อมูลการจองขณะรับส่ง | |
| F-04 | ละเมิด Constraint | [backend/app/auth/idp.py](../../backend/app/auth/idp.py): `get_verified_hn` | IF-IDP-01 | endpoint คืน HN เมื่อ token เพียงขึ้นต้นด้วย prefix คงที่ ไม่มีการรับ/ตรวจผลยืนยันตัวตนจากระบบ IDP ตาม constraint | |
| F-05 | เดา Q-02 | [backend/app/booking/service.py](../../backend/app/booking/service.py): `next_queue_no` | Q-02, FR-BKG-04 | โค้ดกำหนดรูปแบบ `A001` และการเริ่มนับใหม่รายวัน ทั้งสองประเด็นยังเป็น Open Question; `A001` เป็นเพียงตัวอย่างในคำถาม | |
| F-06 | test อ่อน | [backend/tests/test_AC_BKG_05.py](../../backend/tests/test_AC_BKG_05.py): `test_AC_BKG_05` | AC-BKG-05, NFR-PERF-01 | test ส่งคำขอ 200 ครั้งแบบเรียงลำดับ ไม่ใช่ผู้ใช้พร้อมกัน 200 คนตาม Given จึงไม่ตรวจเงื่อนไข concurrency ที่กำหนด | |
| F-07 | test อ่อน | [backend/tests/test_AC_BKG_01.py](../../backend/tests/test_AC_BKG_01.py): `test_AC_BKG_01` | AC-BKG-01, FR-BKG-04 | test เดิมตรวจเพียง status 201 ไม่ยืนยันว่ามีการบันทึก booking, ได้หมายเลขคิว หรือ remaining ลดเป็น 0; test TC-BKG-01-3 ที่มีอยู่ยัง fail เพราะ remaining=0 ได้ 201 | |
| F-08 | FR ไม่มี AC | [specs/001-booking/spec.md](./spec.md): FR-BKG-06 | FR-BKG-06 | ไม่มี AC ที่ตรวจว่าการเปลี่ยนแพ็กเกจทำให้ระบบคำนวณช่วงเวลาว่างใหม่; test ที่มีเป็นเรื่อง performance | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-09 | ลบ endpoint `DELETE /bookings/{booking_id}` และฟังก์ชัน `cancel_booking` ออก | ค้นใน `backend/app/` แล้วไม่พบ endpoint หรือฟังก์ชันยกเลิกการจองเหลืออยู่ |

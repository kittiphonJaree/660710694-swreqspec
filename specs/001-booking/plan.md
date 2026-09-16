# แผนงานทางเทคนิค: จองคิวตรวจสุขภาพ (Booking)

## 1. สรุปแนวทาง
- ฟีเจอร์นี้ให้ผู้รับบริการที่ยืนยันตัวตนแล้วเลือกแพ็กเกจ วัน และช่วงเวลาตรวจสุขภาพ จากนั้นระบบจะตรวจสอบความพร้อมและสร้างการจองพร้อมหมายเลขคิว
- ผู้ใช้งานหลักคือ ผู้รับบริการที่ลงทะเบียนและยืนยันตัวตนแล้ว โดยมีการคัดกรองคิวซ้ำในวันเดียวกันและการป้องกันช่วงเวลาที่เต็ม
- ระบบจะใช้ข้อมูลแพ็กเกจและโควตาเพื่อคำนวณช่วงเวลาว่างแบบ real-time และบันทึกการจองแบบ atomic เพื่อป้องกัน double-booking
- หลังยืนยันสำเร็จ ระบบจะบันทึก audit log, ออกหมายเลขคิว และส่งคำขอแจ้งเตือนแบบ asynchronous โดยไม่ทำให้กระบวนการจองชะงัก
- โฟกัสหลักของแผนนี้คือ FR-BKG-01 ถึง FR-BKG-06, NFR-PERF-01, NFR-REL-02 และ Acceptance Criteria ทั้ง 6 ข้อ

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React + Vite | ทีมเลือกเอง ไม่ได้มาจาก spec | สำหรับหน้าจอเลือกแพ็กเกจ วัน และช่วงเวลา พร้อมแสดงคงเหลือและข้อผิดพลาด |
| Python FastAPI | ทีมเลือกเอง ไม่ได้มาจาก spec | สำหรับ API จองคิว ตรวจความพร้อม และบันทึกการจอง |
| MySQL | CON-TECH-01 | ใช้เก็บข้อมูลการจอง, คิว, ช่วงเวลา, และ audit log ตามข้อกำหนด |
| Async notification worker | IF-NOT-01 | ส่ง SMS/LINE แบบ asynchronous โดยแยกออกจาก flow จองหลัก |
| Audit log service | DOM-PDPA-01 | บันทึกผู้เข้าถึง เวลา และรหัสผู้รับบริการสำหรับทุกการเข้าถึงข้อมูลสุขภาพ |
| Identity verification gateway | IF-IDP-01 | ตรวจสอบว่าได้รับผลยืนยันตัวตนแล้วก่อนเข้าถึงข้อมูลผู้รับบริการ |
| HIS integration client | IF-HIS-01 | ดึงข้อมูลผู้รับบริการจาก HIS ด้วยเลขบัตรประชาชน แล้วใช้ HN ในระบบคำขอจอง |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ FR/Constraint |
|---|---|---|
| PatientProfile | patient_id, hn, name, identity_verified_at | IF-IDP-01, IF-HIS-01, FR-BKG-02 |
| Package | package_id, name, duration_minutes, quota_rule | FR-BKG-01, FR-BKG-06 |
| BookingSlot | slot_id, date, start_time, end_time, capacity, remaining_capacity | FR-BKG-01, FR-BKG-03, FR-BKG-04 |
| Booking | booking_id, patient_id, hn, package_id, slot_id, booking_date, queue_number, status, created_at, confirmed_at | FR-BKG-02, FR-BKG-04, FR-BKG-05, AC-BKG-01, AC-BKG-02, AC-BKG-04 |
| QueueNumberSequence | date, package_id, last_number | FR-BKG-04, AC-BKG-01 |
| NotificationRequest | notification_id, booking_id, channel, payload, status, retry_count, next_retry_at | FR-BKG-05, NFR-REL-02 |
| AuditLog | audit_id, accessed_by, access_time, patient_hn, resource_type, action | DOM-PDPA-01, AC-BKG-06 |

หมายเหตุ: ตารางการจองจะเก็บ HN และไม่เก็บเลขบัตรประชาชน ตาม IF-HIS-01 โดยตรง การเก็บเลขบัตรประชาชนจะไม่ถูกยอมให้ในโมเดลนี้

## 4. API / หน้าจอ

### หน้าจอ
- `/booking/package` — เลือกแพ็กเกจ, แสดงโครงสร้างและเงื่อนไขการจอง, รองรับ FR-BKG-01, FR-BKG-06
- `/booking/slots` — แสดงวันและช่วงเวลาว่างพร้อมจำนวนที่นั่งคงเหลือ, รองรับ FR-BKG-01
- `/booking/confirm` — ยืนยันการจอง, แสดงข้อผิดพลาดเมื่อเต็ม, รองรับ FR-BKG-03, FR-BKG-04, FR-BKG-05
- `/booking/result` — แสดงหมายเลขคิวและสถานะส่งข้อความ, รองรับ FR-BKG-02, FR-BKG-05

### API
- GET `/api/slots?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&package_id={id}`
  - Output: list ของวันที่/ช่วงเวลา/remaining_capacity
  - รองรับ: FR-BKG-01, FR-BKG-06
- POST `/api/bookings/validate`
  - Input: patient_id, package_id, slot_id
  - Output: status, duplicate_booking, fallback_slots, error_message
  - รองรับ: FR-BKG-02, FR-BKG-03
- POST `/api/bookings`
  - Input: patient_id, package_id, slot_id
  - Output: booking_id, queue_number, notification_request_id
  - รองรับ: FR-BKG-04, FR-BKG-05, AC-BKG-01, AC-BKG-04
- GET `/api/bookings/{booking_id}`
  - Output: queue_number, status, retry_status
  - รองรับ: FR-BKG-05, NFR-REL-02
- POST `/api/notifications/retry`
  - Input: notification_id
  - Output: retry_result
  - รองรับ: FR-BKG-05, NFR-REL-02

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-TECH-01 | MySQL ถูกใช้เป็น source of truth สำหรับ Booking, Slot และ QueueNumberSequence | ใช้แล้ว |
| DOM-PDPA-01 | AuditLog entity และบันทึก access_time, accessed_by, patient_hn สำหรับทุกการเข้าถึงข้อมูลสุขภาพ | ใช้แล้ว |
| IF-IDP-01 | ขั้นตอนเช็ค identity_verified_at ก่อนเปิดหน้า booking และก่อนสร้าง booking | ใช้แล้ว |
| IF-HIS-01 | PatientProfile ใช้ HN ในฐานข้อมูล booking และบันทึกเลขบัตรประชาชนไม่เก็บใน Booking table | ใช้แล้ว |
| IF-NOT-01 | NotificationRequest ทำงานแยกจาก booking flow และใช้ async worker สำหรับ SMS/LINE | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-BKG-01 | `test_AC_BKG_01_booking_success_records_slot` | ตั้งค่า slot 09.00 มี capacity 1, ทำการยืนยัน booking แล้วตรวจว่า booking ถูกสร้าง, queue number แสดง, remaining_capacity = 0 |
| AC-BKG-02 | `test_AC_BKG_02_reject_duplicate_same_day_queue` | สร้าง booking ที่ยังไม่ใช้ในวันเดียวกัน แล้วลองจองซ้ำในวันเดียวกัน ตรวจว่าได้รับการปฏิเสธและแสดง queue number เดิม |
| AC-BKG-03 | `test_AC_BKG_03_show_fallback_slots_when_full` | ตั้งค่า slot 09.00 capacity = 1 และมีผู้ใช้คนอื่น confirm ก่อน ตรวจว่าแสดง “ช่วงเวลาเต็ม” พร้อม 3 ตัวเลือกและไม่มี booking ซ้อน |
| AC-BKG-04 | `test_AC_BKG_04_retry_notification_then_stop` | จำลองส่งข้อความยืนยันล้มเหลว ตรวจว่าการจองยังบันทึก, queue number แสดง, retry_count ถึง 3 ครั้ง แล้วหยุด และไม่ยกเลิกการจอง |
| AC-BKG-05 | `test_AC_BKG_05_slot_search_p95_under_2s` | ใช้ load test 200 concurrent users ค้นหาช่วงเวลาว่าง ตรวจ p95 <= 2 วินาที |
| AC-BKG-06 | `test_AC_BKG_06_audit_log_written` | เปิดดูข้อมูลการจองของผู้รับบริการ ตรวจว่า audit log ถูกบันทึกด้วย accessed_by, access_time, patient_hn |

## 7. ลำดับงาน

1. ตั้งโครงสร้างระบบและ migration ฐานข้อมูลสำหรับ Booking, Slot, QueueNumberSequence, NotificationRequest, AuditLog — ครอบคลุม FR-BKG-01, FR-BKG-04, DOM-PDPA-01
2. สร้าง API ดึงช่วงเวลาและจำนวนที่นั่งคงเหลือจากแพ็กเกจที่เลือกและวันที่ 30 วันข้างหน้า — FR-BKG-01, AC-BKG-05
3. สร้าง validation สำหรับการจองซ้ำในวันเดียวกันและการป้องกัน slot เต็ม — FR-BKG-02, FR-BKG-03, AC-BKG-02, AC-BKG-03
4. สร้าง flow confirm booking พร้อมคำนวณ queue_number และลด remaining_capacity แบบ atomic — FR-BKG-04, AC-BKG-01
5. สร้าง notification worker สำหรับ SMS/LINE แบบ async และ retry ตามข้อกำหนด 3 ครั้ง/10 นาที — FR-BKG-05, NFR-REL-02, AC-BKG-04
6. สร้างหน้า UI สำหรับเลือกแพ็กเกจ วัน และช่วงเวลา พร้อมผลลัพธ์การจอง และข้อผิดพลาด “ช่วงเวลาเต็ม” — FR-BKG-01, FR-BKG-03, FR-BKG-05
7. เพิ่ม audit log และตรวจสอบการเข้าถึงข้อมูลด้วย HN ตามเงื่อนไข identity/HIS — DOM-PDPA-01, IF-IDP-01, IF-HIS-01, AC-BKG-06
8. ทดสอบครบตาม Acceptance Criteria และประเมินประสิทธิภาพ p95 — AC-BKG-01 ถึง AC-BKG-06

## 8. สิ่งที่ยังไม่ทำ
- Q-01 “ช่วงเวลาใกล้เคียง” นับเฉพาะวันเดียวกัน หรือรวมวันถัดไปด้วย? ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-02 หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง? ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-03 เมื่อผู้รับบริการเปลี่ยนแพ็กเกจ ระดับความพร้อมของช่วงเวลาใช้โควตาของแพ็กเกจที่เลือกเท่านั้น หรือรวมกับโควตารวมของคลินิก? ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-04 เมื่อมีผู้ใช้หลายคนยืนยันพร้อมกันในช่วงเวลาเดียวกัน ต้องใช้หลักเกณฑ์ใดเพื่อป้องกัน double-booking? ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-05 “ช่วงเวลาใกล้เคียง” จากรายการ 3 ตัวเลือก ควรคัดจากช่วงเวลาเดียวกันเท่านั้นหรือรวมช่วงเริ่มต้น/สิ้นสุดตามเวลา? ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ

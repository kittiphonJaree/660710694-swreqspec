# Tasks: จองคิวตรวจสุขภาพ (Booking)

- Feature: จองคิวตรวจสุขภาพ (Booking)
- Spec ID: SPEC-BKG-001
- อ้างอิง: `specs/001-booking/plan.md`
- วันที่: 2569-09-23

มีทั้งหมด 17 tasks โดย 6 tasks ต้องรอคำตอบจาก Open Question `Q-02` ก่อนจึงเริ่มได้
งานเรียงตามการพึ่งพา และงานหน้าจอที่ใช้ API จำลองสามารถเริ่มได้ก่อน API จริง

## รายการ task

### T-01 สร้างตารางข้อมูลการจองและ migration
- รองรับ: CON-TECH-01, IF-HIS-01, DOM-PDPA-01, FR-BKG-01, FR-BKG-02, FR-BKG-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02, T-03, T-04 และ T-08
- ไฟล์ที่แตะ: `backend/app/db/models.py`, `backend/app/db/session.py`, `backend/app/db/migrations/001_init.py`, `backend/tests/conftest.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: migration สร้างตาราง `slots`, `bookings` และ `audit_logs` ได้ และตาราง `bookings` ไม่มีคอลัมน์เลขบัตรประชาชน
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 สร้างการตรวจผลยืนยันตัวตน
- รองรับ: IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03, T-04, T-05, T-06, T-08 และ T-09
- ไฟล์ที่แตะ: `backend/app/auth/idp.py`, `backend/app/main.py`, `backend/tests/test_idp.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: endpoint ที่เข้าถึงข้อมูลผู้รับบริการปฏิเสธคำขอที่ไม่มีผลยืนยันตัวตน และ test ผ่าน
- สถานะ: พร้อมทำ

### T-03 สร้าง API ค้นหาช่วงเวลาว่าง
- รองรับ: FR-BKG-01, FR-BKG-06, ASM-01, ASM-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-10, T-12 และ T-15
- ไฟล์ที่แตะ: `backend/app/slots/service.py`, `backend/app/slots/router.py`, `backend/app/main.py`, `backend/tests/test_slots.py`
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `GET /slots` คืนวันและช่วงเวลาภายใน 30 วันพร้อม `remaining` และเปลี่ยนแพ็กเกจแล้วคำนวณผลใหม่ได้
- สถานะ: พร้อมทำ

### T-04 สร้างการบันทึกการจองและตัดที่นั่ง
- รองรับ: FR-BKG-04, IF-HIS-01, ASM-02
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/app/main.py`, `backend/tests/test_AC_BKG_01.py`
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `test_AC_BKG_01` ผ่าน โดยบันทึกการจองสำเร็จและ `remaining` ลดจาก 1 เป็น 0
- สถานะ: รอ Q-02

### T-05 ป้องกันการจองซ้ำในวันเดียวกัน
- รองรับ: FR-BKG-02, ASM-02, ASM-04
- ตรวจด้วย: AC-BKG-02
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_02.py`
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: `test_AC_BKG_02` ผ่าน โดยคำขอซ้ำถูกปฏิเสธและแสดงหมายเลขคิวเดิม
- สถานะ: รอ Q-02

### T-06 เสนอช่วงเวลาใกล้เคียงเมื่อเต็ม
- รองรับ: FR-BKG-03, ASM-02
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: `backend/app/slots/service.py`, `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_03.py`
- ต้องทำหลัง: T-03, T-04
- เสร็จเมื่อ: `test_AC_BKG_03` ผ่าน โดยตอบ 409 พร้อม 3 ช่วงที่ใกล้ที่สุดภายในวันเดียวกันและวันถัดไป และไม่สร้าง booking ซ้อน
- สถานะ: พร้อมทำ

### T-07 สร้างคิวส่งข้อความแบบ asynchronous
- รองรับ: FR-BKG-05, IF-NOT-01, NFR-REL-02, ASM-03
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: `backend/app/notify/queue.py`, `backend/app/booking/service.py`, `backend/tests/test_AC_BKG_04.py`
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: `test_AC_BKG_04` ผ่าน โดยการจองยังคงอยู่และงานส่งซ้ำถูกกำหนดภายใน 5 นาทีเมื่อระบบแจ้งเตือนไม่ตอบสนอง
- สถานะ: รอ Q-02

### T-08 บันทึก audit log การเข้าถึงข้อมูล
- รองรับ: DOM-PDPA-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: `backend/app/audit/middleware.py`, `backend/app/main.py`, `backend/tests/test_AC_BKG_06.py`
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `test_AC_BKG_06` ผ่าน โดย audit log มีผู้เข้าถึง เวลา และ HN ของผู้รับบริการ
- สถานะ: พร้อมทำ

### T-09 สร้างการค้นหา HN จาก HIS
- รองรับ: IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04 และ T-15
- ไฟล์ที่แตะ: `backend/app/his/client.py`, `backend/app/booking/router.py`, `backend/app/main.py`, `backend/tests/test_his_lookup.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `GET /patients/lookup` ส่งเลขบัตรไปยัง HIS เพื่อรับ HN และไม่เก็บเลขบัตรไว้ในข้อมูลการจอง
- สถานะ: พร้อมทำ

### T-10 ทดสอบประสิทธิภาพการค้นหาช่วงเวลา
- รองรับ: NFR-PERF-01, FR-BKG-01
- ตรวจด้วย: AC-BKG-05
- ไฟล์ที่แตะ: `backend/tests/test_AC_BKG_05.py`
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: `test_AC_BKG_05` วัดการค้นหาพร้อมกัน 200 คนและรายงานค่า p95 ไม่เกิน 2 วินาทีในสภาพแวดล้อมทดสอบ
- สถานะ: พร้อมทำ
    
### T-11 สร้างหน้าจอเลือกแพ็กเกจและช่วงเวลา
- รองรับ: FR-BKG-01, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-12 และ T-15
- ไฟล์ที่แตะ: `frontend/src/pages/SlotPicker.jsx`, `frontend/src/api/client.js`, `frontend/src/App.jsx`, `frontend/src/index.css`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้าจอแสดงช่วงเวลาจาก API จำลองและโหลดช่วงเวลาใหม่เมื่อเปลี่ยนแพ็กเกจ
- สถานะ: เสร็จ รอทีมตรวจ

### T-12 สร้างหน้าจอยืนยันและแนะนำช่วงใหม่
- รองรับ: FR-BKG-03, FR-BKG-04
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: `frontend/src/pages/ConfirmBooking.jsx`, `frontend/src/__tests__/AC-BKG-03.test.jsx`, `frontend/src/App.jsx`
- ต้องทำหลัง: T-11
- เสร็จเมื่อ: `AC-BKG-03.test.jsx` ผ่าน โดยหน้าจอแสดงข้อความช่วงเวลาเต็มและตัวเลือกว่าง 3 รายการจาก API จำลอง
- สถานะ: พร้อมทำ

### T-13 สร้างหน้าจอผลการจอง
- รองรับ: FR-BKG-04, FR-BKG-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14 และ T-15
- ไฟล์ที่แตะ: `frontend/src/pages/BookingResult.jsx`, `frontend/src/App.jsx`
- ต้องทำหลัง: T-11
- เสร็จเมื่อ: หน้าจอแสดงหมายเลขคิวเมื่อการจองสำเร็จ และยังแสดงหมายเลขคิวเมื่อสถานะแจ้งเตือนล้มเหลวจาก API จำลอง
- สถานะ: รอ Q-02

### T-14 ทดสอบเส้นทางหน้าจอผลลัพธ์และข้อความแจ้งเตือน
- รองรับ: FR-BKG-04, FR-BKG-05, IF-NOT-01
- ตรวจด้วย: AC-BKG-01, AC-BKG-04
- ไฟล์ที่แตะ: `frontend/src/__tests__/AC-BKG-01.test.jsx`, `frontend/src/__tests__/AC-BKG-04.test.jsx`, `frontend/src/pages/BookingResult.jsx`
- ต้องทำหลัง: T-12, T-13
- เสร็จเมื่อ: test หน้าจอของ AC-BKG-01 และ AC-BKG-04 ผ่านด้วย API จำลองตามสัญญาใน plan
- สถานะ: รอ Q-02

### T-15 เชื่อมหน้าจอกับ API จริง
- รองรับ: FR-BKG-01, FR-BKG-02, FR-BKG-03, FR-BKG-04, FR-BKG-05, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานเชื่อมระบบของ T-16 และ T-17
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/App.jsx`, `frontend/src/pages/SlotPicker.jsx`, `frontend/src/pages/ConfirmBooking.jsx`, `frontend/src/pages/BookingResult.jsx`
- ต้องทำหลัง: T-03, T-05, T-06, T-07, T-09, T-11, T-12, T-13
- เสร็จเมื่อ: หน้าจอเรียก `GET /slots`, `POST /bookings` และ `GET /bookings/{id}` ผ่าน `/api` ได้ตามสัญญาใน plan
- สถานะ: รอ Q-02

### T-16 ทดสอบการเข้ารหัสการรับส่งข้อมูล
- รองรับ: NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานตรวจคุณภาพของระบบตาม NFR-SEC-01
- ไฟล์ที่แตะ: `backend/app/main.py`, `backend/tests/test_tls_configuration.py`, `frontend/vite.config.js`
- ต้องทำหลัง: T-15
- เสร็จเมื่อ: การตั้งค่า deployment/test ตรวจได้ว่าการรับส่งข้อมูลของระบบใช้ TLS 1.2 ขึ้นไป
- สถานะ: พร้อมทำ

### T-17 ทดสอบ usability การจองภายใน 3 นาที
- รองรับ: NFR-USE-01, ASM-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานทดสอบ NFR-USE-01
- ไฟล์ที่แตะ: `frontend/src/__tests__/usability-booking.test.jsx`, `docs/srs/README.md`
- ต้องทำหลัง: T-15
- เสร็จเมื่อ: มีผลทดสอบกับอาสาสมัครใหม่ 10 คน และอย่างน้อย 8 คนจองสำเร็จภายใน 3 นาทีโดยไม่ขอความช่วยเหลือ
- สถานะ: พร้อมทำ

## ตารางตรวจความครบของ AC

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-BKG-01 | T-04, T-14 |
| AC-BKG-02 | T-05 |
| AC-BKG-03 | T-06, T-12 |
| AC-BKG-04 | T-07, T-14 |
| AC-BKG-05 | T-10 |
| AC-BKG-06 | T-08 |

## ตารางตรวจความครบของ Constraint

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-TECH-01 | T-01 |
| DOM-PDPA-01 | T-01, T-08 |
| IF-IDP-01 | T-02 |
| IF-HIS-01 | T-01, T-09 |
| IF-NOT-01 | T-07, T-14 |

## สิ่งที่ยังไม่ทำ

- Q-02 หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง และมีรูปแบบอย่างไร -> ถามเจ้าหน้าที่เวชระเบียน
  tasks ที่รออยู่: T-04, T-05, T-07, T-13, T-14 และ T-15 เพราะเกี่ยวข้องกับการออกหรือแสดงหมายเลขคิวและผลลัพธ์ที่ต้องใช้หมายเลขคิว
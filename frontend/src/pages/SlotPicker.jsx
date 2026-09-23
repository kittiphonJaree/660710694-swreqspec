import { useEffect, useState } from 'react'

const today = new Date()
const formatDate = (value) => value.toISOString().slice(0, 10)
const maxDate = new Date(today)
maxDate.setDate(maxDate.getDate() + 30)

function formatTime(value) {
  return value.slice(0, 5)
}

export default function SlotPicker({ client }) {
  const [packageCode, setPackageCode] = useState('')
  const [selectedDate, setSelectedDate] = useState(formatDate(today))
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSlots() {
      if (!packageCode.trim()) {
        setSlots([])
        setError('กรอกรหัสแพ็กเกจก่อนเลือกช่วงเวลา')
        return
      }

      setLoading(true)
      setError('')
      try {
        const result = await client.getSlots({
          dateFrom: selectedDate,
          packageCode: packageCode.trim(),
        })
        if (active) setSlots(result.slots ?? result)
      } catch {
        if (active) setError('ไม่สามารถโหลดช่วงเวลาว่างได้')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSlots()
    return () => {
      active = false
    }
  }, [client, packageCode, selectedDate])

  return (
    <main className="booking-shell">
      <section className="booking-intro">
        <p className="eyebrow">HEALTH CHECK BOOKING</p>
        <h1>ระบบจองคิวตรวจสุขภาพ</h1>
        <h2>เลือกแพ็กเกจและช่วงเวลาตรวจ</h2>
        <p>เลือกวันที่ภายใน 30 วันข้างหน้า แล้วตรวจสอบจำนวนที่นั่งคงเหลือก่อนยืนยันการจอง</p>
      </section>

      <section className="picker-panel" aria-labelledby="picker-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">STEP 01</p>
            <h2 id="picker-heading">รายละเอียดการตรวจ</h2>
          </div>
          <span className="date-window">วันนี้ถึง {formatDate(maxDate)}</span>
        </div>

        <div className="picker-controls">
          <label>
            รหัสแพ็กเกจ
            <input
              aria-label="รหัสแพ็กเกจ"
              value={packageCode}
              onChange={(event) => setPackageCode(event.target.value)}
              placeholder="เช่น PACKAGE-A"
            />
          </label>
          <label>
            วันที่ตรวจ
            <input
              aria-label="วันที่ตรวจ"
              type="date"
              min={formatDate(today)}
              max={formatDate(maxDate)}
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>
        </div>

        <div className="slot-heading">
          <div>
            <p className="eyebrow">AVAILABLE SLOTS</p>
            <h2>ช่วงเวลาว่าง</h2>
          </div>
          {loading && <span className="loading-label">กำลังโหลด...</span>}
        </div>

        {error && <p className="feedback" role="status">{error}</p>}
        {!loading && !error && slots.length === 0 && (
          <p className="empty-state">ไม่พบช่วงเวลาว่างสำหรับข้อมูลที่เลือก</p>
        )}
        {!loading && !error && slots.length > 0 && (
          <div className="slot-grid" aria-label="ช่วงเวลาที่ว่าง">
            {slots.map((slot) => (
              <button className="slot-card" key={slot.id} type="button">
                <span className="slot-time">{formatTime(slot.start_time ?? slot.startTime)}</span>
                <span className="slot-capacity">เหลือ {slot.remaining} ที่นั่ง</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
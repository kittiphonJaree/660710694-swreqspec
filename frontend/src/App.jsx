// โครงเริ่มต้นของรายวิชา: ยังไม่มีหน้าจอของ task ใด ๆ
// หน้าจอจริงจะถูกสร้างใน src/pages/ ตาม task ใน tasks.md ทีละหน้า
import SlotPicker from './pages/SlotPicker.jsx'
import { mockApi } from './api/client.js'

export default function App() {
  // รองรับ FR-BKG-01 และ FR-BKG-06 ด้วย API จำลองตามแผนของ T-11
  return <SlotPicker client={mockApi} />
}

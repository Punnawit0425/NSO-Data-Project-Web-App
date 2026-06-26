/**
 * LINE LIFF Configuration
 * ============================================================
 * วิธีตั้งค่า:
 * 1. ไปที่ https://developers.line.biz
 * 2. เข้า Channel ของคุณ → แท็บ "LIFF"
 * 3. คัดลอก LIFF ID (รูปแบบ: 1234567890-AbCdEfGh)
 * 4. วางแทน 'YOUR_LIFF_ID_HERE' ด้านล่าง
 *
 * Endpoint URL ที่ต้องตั้งใน LINE Developers:
 *   http://localhost:5173/line-oa-ui/index.html   (สำหรับ dev)
 *   https://your-domain.com/line-oa-ui/index.html (สำหรับ production)
 * ============================================================
 */

const LIFF_CONFIG = {
  liffId: 'YOUR_LIFF_ID_HERE',    // <-- ใส่ LIFF ID ของคุณตรงนี้
  appName: 'หมู่บ้านสวนสุข N-UIP',
  version: '1.0.0',
};

export default LIFF_CONFIG;

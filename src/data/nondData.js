/* ===================================================================
 *  NonD DATA LAYER (ค่า default สำหรับแดชบอร์ดบทบาท)
 * ===================================================================
 *  - แดชบอร์ดสาธารณะ (Public) ใช้ "ข้อมูลจริง" ดึงสดจาก Google Sheets
 *    ผ่าน services/wasteSheet.js (auto-connect ลิงก์ Publish-to-web CSV)
 *  - ค่าด้านล่างนี้เป็นข้อมูลสาธิตของแดชบอร์ดบทบาท (เทศบาล/หมู่บ้าน/โรงงาน)
 *    ซึ่งชีตปัจจุบันไม่มีข้อมูลรองรับ (เช่น คาร์บอนเครดิต เงินปันผล)
 *  - provinceSummary เป็นค่าเริ่มต้น จะถูกเขียนทับด้วยข้อมูลจริงจากชีต
 *    เมื่อเชื่อมต่อสำเร็จ (ดู App.jsx)
 * =================================================================== */

// -------- คลังข้อมูลสาธิตของแดชบอร์ดบทบาท + ค่าเริ่มต้น provinceSummary --------
export const DEFAULT_DATA = {
  muniCarbon: {
    all: { width: 72.5, actual: '4,351 tCO2e', value: '78,314,400 บาท', factoryShare: '2,611 tCO2e (60%)', villageShare: '1,740 tCO2e (40%)' },
    'muni-1': { width: 85.0, actual: '2,611 tCO2e', value: '47,000,000 บาท', factoryShare: '1,567 tCO2e (60%)', villageShare: '1,044 tCO2e (40%)' },
    other: { width: 57.0, actual: '1,740 tCO2e', value: '31,314,400 บาท', factoryShare: '1,044 tCO2e (60%)', villageShare: '696 tCO2e (40%)' },
  },
  villages: {
    a: { members: '100 หลังคาเรือน', coop: '85%', coopColor: 'emerald', waste: '4,106 กิโลกรัม', income: '36,954 บาท', share: '22,172 บาท' },
    b: { members: '120 หลังคาเรือน', coop: '42%', coopColor: 'amber', waste: '2,435 กิโลกรัม', income: '21,915 บาท', share: '13,149 บาท' },
    c: { members: '90 หลังคาเรือน', coop: '78%', coopColor: 'emerald', waste: '3,389 กิโลกรัม', income: '30,501 บาท', share: '18,301 บาท' },
  },
  provinceSummary: [
    { label: 'ขยะรีไซเคิลสะสมรวม (ปี 2567)', value: '21754 ตัน' },
    { label: 'ขยะนำไปใช้ประโยชน์ (ปี 2567)', value: '1253 ตัน' },
    { label: 'คาร์บอนเครดิตรวม (ปี 2567)', value: '4351 tCO2e' },
    { label: 'ครัวเรือนที่จัดการขยะ (ปี 2567)', value: '450501 ครัวเรือน' },
    { label: 'ขยะมูลฝอยชุมชนทั้งจังหวัด (ปี 2567)', value: '579563 ตัน' },
    { label: 'ขยะติดเชื้อที่จัดการถูกต้อง (ปี 2567)', value: '1545 ตัน' },
    { label: 'สัดส่วนกองทุนหมุนเวียน 40%', value: '78314400 บาท' },
    { label: 'สัดส่วนปันผลคืนชุมชน 60%', value: '117471600 บาท' },
  ],
};

/* ===================================================================
 *  COLLECTOR LAYER (ฟีเจอร์ใหม่ — แรงบันดาลใจจาก nond_charge-keeper.html)
 * ===================================================================
 *  รองรับบทบาทที่ 5 "พนักงานเก็บขยะ" (Collector Terminal) ซึ่งบันทึก
 *  ปริมาณขยะแยกประเภทรายบ้านจากตาชั่งดิจิทัล (จำลอง Bluetooth) แล้ว
 *  "ซิงค์" ข้อมูลขึ้นสู่ส่วนกลาง เพื่อให้นิติบุคคลหมู่บ้านนำไปประเมิน
 *  ค่าปรับ "ขยะเสีย" (ขยะที่คัดแยกผิดจนใช้ประโยชน์ไม่ได้)
 *  ค่าทั้งหมดด้านล่างเป็นข้อมูลสาธิต (ยังไม่มีชีตรองรับ)
 * =================================================================== */

// อัตราค่าปรับขยะเสีย (บาท/กก.) — ใช้ทั้งฝั่ง Collector และ Village
export const PENALTY_RATE_PER_KG = 5;

// รายชื่อหมู่บ้านในพื้นที่ (ใช้ key เดียวกับ DEFAULT_DATA.villages เพื่อความสอดคล้อง)
export const VILLAGE_OPTIONS = [
  { id: 'a', name: 'หมู่บ้านแสนสุขนนท์ A' },
  { id: 'b', name: 'หมู่บ้านนนท์วิลล์ B' },
  { id: 'c', name: 'หมู่บ้านร่มรื่นนนทบุรี C' },
];

// แผนที่ id -> ชื่อหมู่บ้าน (สำหรับแสดงผล/ข้อความ)
export const VILLAGE_NAMES = Object.fromEntries(VILLAGE_OPTIONS.map((v) => [v.id, v.name]));

// ค่าน้ำหนักจำลองจากตาชั่ง Bluetooth (วนซ้ำเมื่อกดปุ่ม "ดึงค่าน้ำหนัก")
export const SIMULATED_SCALE_WEIGHTS = [
  { wet: 1.2, dry: 4.5, hazard: 0, spoiled: 0 },
  { wet: 3.4, dry: 0.5, hazard: 0.2, spoiled: 2.1 },
  { wet: 0.5, dry: 2.0, hazard: 0, spoiled: 0.5 },
];

// บันทึกการจัดเก็บเริ่มต้น (สาธิต) — village ใช้ key 'a'|'b'|'c'
// ชุดนี้สังกัดหมู่บ้าน A เพื่อให้ทั้งหน้า Collector และ Village (แสนสุขนนท์ A) เห็นตรงกัน
export const INITIAL_COLLECTIONS = [
  { id: 'seed-1', time: '08:15:22', houseId: '12/34', village: 'a', wet: 2.5, dry: 1.2, hazard: 0.0, spoiled: 0.0, synced: true },
  { id: 'seed-2', time: '08:20:10', houseId: '12/35', village: 'a', wet: 3.1, dry: 0.5, hazard: 0.1, spoiled: 1.5, synced: true },
  { id: 'seed-3', time: '08:24:45', houseId: '12/36', village: 'a', wet: 1.2, dry: 2.8, hazard: 0.0, spoiled: 0.0, synced: true },
];

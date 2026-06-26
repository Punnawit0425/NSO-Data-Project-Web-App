# NonD — แพลตฟอร์มระบบจัดการขยะและคาร์บอนเครดิตจังหวัดนนทบุรี

เว็บแอป **React (Vite)** สำหรับสาธิตระบบจัดการขยะและคาร์บอนเครดิต
แยกตามบทบาทผู้ใช้ 4 กลุ่ม: หน้าหลักสาธารณะ · เทศบาล · นิติบุคคลหมู่บ้าน · โรงงานอุตสาหกรรม

- โครงสร้างแบบคอมโพเนนต์ — ไม่มี inline `onclick`/`<script>` อีกต่อไป
- ใช้ Tailwind (Play CDN — รองรับคลาสสีแบบ dynamic), `lucide-react`, Google Fonts
- มีฟีเจอร์ AI (Gemini) สำหรับร่างนโยบาย/ประกาศ/รายงาน ESG
- **แดชบอร์ดสาธารณะใช้ข้อมูลจริง** ดึงสดจาก Google Sheets อัตโนมัติ (ดูด้านล่าง)

### การติดตั้งและรัน

```
npm install
npm run dev      # โหมดพัฒนา (http://localhost:5173)
npm run build    # build สำหรับ production -> dist/
npm run preview  # ดูตัวอย่าง build
```

---

## โครงสร้างข้อมูล (Data Layer)

แอปมีแหล่งข้อมูล 2 ส่วน:

1. **แดชบอร์ดสาธารณะ (Public)** — ใช้ **ข้อมูลจริง** ดึงสดจาก Google Sheets อัตโนมัติ
2. **แดชบอร์ดบทบาท** (เทศบาล/หมู่บ้าน/โรงงาน) — ใช้ข้อมูลสาธิตใน `src/data/nondData.js`
   เพราะชีตปัจจุบันยังไม่มีข้อมูลรองรับ (คาร์บอนเครดิต เงินปันผล ฯลฯ)

```
src/services/wasteSheet.js   ← เชื่อม Google Sheets อัตโนมัติ (Publish-to-web CSV)
├── CSV_URL              ← ลิงก์ชีตที่เผยแพร่ (เปลี่ยนได้ที่นี่ที่เดียว)
├── loadWasteData()      ← fetch CSV → parse → aggregate (เรียกครั้งเดียวตอนเปิดหน้า)
└── buildProvinceSummary ← สร้างสรุประดับจังหวัดสำหรับ Export CSV (จากข้อมูลจริง)

src/data/nondData.js         ← DEFAULT_DATA (ข้อมูลสาธิตของแดชบอร์ดบทบาท)
```

ลำดับการทำงานตอนเปิดหน้า (`App` ใน `useEffect`):

1. render ทันทีด้วยสถานะ `wasteStatus = 'loading'`
2. `loadWasteData()` — ดึง CSV จากลิงก์ → แปลง → สรุปผล
3. `setWaste()` + `setWasteStatus('ready')` — `PublicView` วาดกราฟ/การ์ดจากข้อมูลจริง
   (ถ้าเชื่อมต่อไม่สำเร็จ → `wasteStatus = 'error'` แสดงข้อความแจ้งเตือน)

---

## เชื่อมต่อ Google Sheets (อัตโนมัติ ไม่ต้องใช้ API key)

ใช้ลิงก์ **Publish to web (CSV)** ของ Google Sheets ซึ่งส่ง header
`Access-Control-Allow-Origin: *` จึง fetch ได้ตรงจากเบราว์เซอร์และทำงานบน GitHub Pages ได้

### วิธีเปลี่ยนชีต

1. เปิดสเปรดชีต → **File → Share → Publish to web → เลือกแท็บ → CSV → Publish**
2. คัดลอกลิงก์ที่ได้ (รูปแบบ `.../pub?output=csv`)
3. วางลิงก์ลงในตัวแปร `CSV_URL` ใน `src/services/wasteSheet.js`

### สคีมาของชีต (แถวแรก = ชื่อคอลัมน์)

| (ลำดับ) | ปี | เดือน | จังหวัด | อำเภอ | อปท. | ขยะมูลฝอยชุมชน(ตัน) |
|--------|-----|-------|---------|-------|------|----------------------|
| 0 | 2567 | มกราคม | นนทบุรี | เมืองนนทบุรี | เทศบาลนครนนทบุรี | 5388.0 |

- `ปี` = พ.ศ. · `เดือน` = ชื่อเดือนภาษาไทยเต็ม (มกราคม–ธันวาคม)
- `ขยะมูลฝอยชุมชน(ตัน)` = ตัวเลข (คอลัมน์ใดก็ได้ที่ชื่อมีคำว่า "ขยะมูลฝอย")
- ระบบสรุปอัตโนมัติเป็น: ยอดรวมรายปี · แนวโน้มรายเดือน · แยกตามอำเภอ · จำนวน อปท. ที่รายงาน

---

## ข้อควรรู้

- **อ่านอย่างเดียว (read-only)** ลิงก์ Publish-to-web ใช้ดึงข้อมูลเท่านั้น
  หากต้องการเขียนกลับ ต้องใช้ Google Apps Script web-app หรือ Sheets API v4 พร้อมยืนยันตัวตน
- **แดชบอร์ดบทบาท** (เทศบาล/หมู่บ้าน/โรงงาน) ยังเป็นข้อมูลสาธิต — เมื่อมีชีตรองรับ
  สามารถต่อยอดด้วยรูปแบบเดียวกับ `wasteSheet.js` ได้
- ฟีเจอร์ AI ต้องใส่ Gemini API key ที่ฟังก์ชัน `callGemini()` ใน `src/services/gemini.js`
  (ปัจจุบันเว้นว่างไว้สำหรับ runtime injection)

---

## โครงสร้างไฟล์

```
testapp/
├── index.html              # Vite entry (Tailwind CDN, fonts, <div id="root">)
├── vite.config.js
├── package.json
├── README.md               # ไฟล์นี้
├── src/
│   ├── main.jsx            # จุดเริ่ม React
│   ├── App.jsx            # state กลาง (role, data, toast, AI modal) + Context provider
│   ├── index.css         # ฟอนต์ + custom scrollbar
│   ├── appContext.js     # React Context + hook useApp()
│   ├── data/nondData.js  # DEFAULT_DATA (ข้อมูลสาธิตของแดชบอร์ดบทบาท)
│   ├── services/
│   │   ├── wasteSheet.js  # เชื่อม Google Sheets อัตโนมัติ (CSV) + parse/aggregate
│   │   └── gemini.js      # callGemini() + ชุด prompt ของฟีเจอร์ AI
│   └── components/
│       ├── Icon.jsx       # map ชื่อไอคอน -> lucide-react
│       ├── Header.jsx, Footer.jsx, Toast.jsx, AIModal.jsx
│       └── views/         # PublicView, MunicipalityView, VillageView, FactoryView
└── data/                  # ข้อมูลดิบ CSV และสคริปต์ประมวลผล (ที่มาของค่า default)
    ├── clean_recycle.csv
    ├── clean_benefit.csv
    ├── ...
    └── waste_reduction_impact.py
```

โฟลเดอร์ `data/` คือชุดข้อมูลต้นทางที่ใช้คำนวณค่า default ในแอป
เมื่อเชื่อม Google Sheets แล้ว ค่าจากชีตจะเขียนทับค่า default เหล่านี้

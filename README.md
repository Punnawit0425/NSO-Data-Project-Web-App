# NonD — แพลตฟอร์มระบบจัดการขยะและคาร์บอนเครดิตจังหวัดนนทบุรี

เว็บแอป **React (Vite)** สำหรับสาธิตระบบจัดการขยะและคาร์บอนเครดิต
แยกตามบทบาทผู้ใช้ 5 กลุ่ม: หน้าหลักสาธารณะ · เทศบาล · นิติบุคคลหมู่บ้าน · โรงงานอุตสาหกรรม · เจ้าหน้าที่ขนขยะ

- **แดชบอร์ดสาธารณะใช้ข้อมูลจริง** ดึงสดจาก Google Sheets อัตโนมัติ (ดูด้านล่าง)
- **ตัวจำลองพยากรณ์ขยะ (Scenario Simulator)** ด้วย Recharts — `src/model.jsx`
- **หน้า LINE OA / LIFF** สำหรับให้ประชาชนแจ้งปัญหาขยะ — `public/line-oa-ui/`
- ฟีเจอร์ AI (Gemini) สำหรับร่างนโยบาย/ประกาศ/รายงาน ESG
- ชุดข้อมูลดิบ ข้อมูลที่ทำความสะอาดแล้ว และ Jupyter Notebook วิเคราะห์ข้อมูล อยู่ใน `src/`
- ใช้ Tailwind (Play CDN), `lucide-react`, `recharts`, Google Fonts

คำอธิบายกราฟและตัวเลขแต่ละตัวบนหน้าจอ ดูได้ที่ [`explanation.md`](explanation.md)

### การติดตั้งและรัน

```
npm install
npm run dev      # โหมดพัฒนา (http://localhost:5173)
npm run build    # build สำหรับ production -> dist/
npm run preview  # ดูตัวอย่าง build
```

Deploy บน **Vercel** (`base: '/'` ใน `vite.config.js` — เสิร์ฟจาก root)

---

## โครงสร้างไฟล์

```
NSO-data/
├── index.html                 # Vite entry (Tailwind CDN, fonts, <div id="root">)
├── vite.config.js
├── package.json
├── README.md                  # ไฟล์นี้
├── explanation.md             # คำอธิบายกราฟ/ตัวเลขในแอป
├── public/
│   └── line-oa-ui/            # หน้าจำลอง LINE OA + LIFF (HTML/JS ล้วน ไม่ผ่าน React)
│       ├── index.html, app.js, style.css
│       └── liff-config.js     # LIFF ID
└── src/
    ├── main.jsx               # จุดเริ่ม React
    ├── App.jsx                # state กลาง (role, data, toast, AI modal) + Context provider
    ├── appContext.js          # React Context + hook useApp()
    ├── model.jsx              # WasteReductionSimulator (กราฟพยากรณ์ Recharts)
    ├── index.css              # ฟอนต์ + custom scrollbar
    ├── data/nondData.js       # DEFAULT_DATA (ข้อมูลสาธิตของแดชบอร์ดบทบาท)
    ├── services/
    │   ├── wasteSheet.js      # เชื่อม Google Sheets อัตโนมัติ (CSV) + parse/aggregate
    │   └── gemini.js          # callGemini() + ชุด prompt ของฟีเจอร์ AI
    ├── components/
    │   ├── Icon.jsx           # map ชื่อไอคอน -> lucide-react
    │   ├── Header.jsx, Footer.jsx, Toast.jsx, AIModal.jsx
    │   └── views/             # PublicView, MunicipalityView, VillageView,
    │                          # FactoryView, CollectorView
    ├── raw_data/              # ข้อมูลดิบ CSV ต้นทาง (ยังไม่ทำความสะอาด)
    ├── clean_data/            # ข้อมูลที่ทำความสะอาดแล้ว (clean_*.csv)
    │   └── waste_reduction_impact.py   # คำนวณผลกระทบโครงการลดขยะ (Holt-Winters)
    └── jupiter_notebook/      # Notebook วิเคราะห์ข้อมูลแต่ละหัวข้อ + สคริปต์สร้างกราฟ
        ├── *.ipynb            # ทำความสะอาด/สำรวจข้อมูล raw_data -> clean_data
        └── make_*_viz.py, make_waste_composition_pie.py
```

---

## บทบาทผู้ใช้ (Views)

| แท็บ | คอมโพเนนต์ | แหล่งข้อมูล |
|------|-----------|-------------|
| 1. หน้าหลัก (สาธารณะ) | `PublicView` | **ข้อมูลจริง** จาก Google Sheets + ตัวจำลองพยากรณ์ |
| 2. เทศบาล | `MunicipalityView` | ข้อมูลสาธิต `nondData.js` |
| 3. นิติหมู่บ้าน | `VillageView` | ข้อมูลสาธิต + ข้อมูลที่ Collector บันทึก |
| 4. โรงงานอุตสาหกรรม | `FactoryView` | ข้อมูลสาธิต `nondData.js` |
| 5. เจ้าหน้าที่ขนขยะ | `CollectorView` | บันทึกน้ำหนักขยะรายบ้าน → ซิงค์เข้า state กลาง |

แดชบอร์ดบทบาท 2–5 ยังเป็นข้อมูลสาธิต เพราะชีตปัจจุบันยังไม่มีข้อมูลรองรับ
(คาร์บอนเครดิต เงินปันผล ฯลฯ) — เมื่อมีชีตรองรับสามารถต่อยอดด้วยรูปแบบเดียวกับ `wasteSheet.js`

---

## โครงสร้างข้อมูล (Data Layer)

```
src/services/wasteSheet.js   ← เชื่อม Google Sheets อัตโนมัติ (Publish-to-web CSV)
├── CSV_URL              ← ลิงก์ชีตที่เผยแพร่ (เปลี่ยนได้ที่นี่ที่เดียว)
├── loadWasteData()      ← fetch CSV → parse → aggregate (เรียกครั้งเดียวตอนเปิดหน้า)
├── buildMonthlySeries() ← อนุกรมเวลารายเดือน ป้อนให้ตัวจำลองพยากรณ์
└── buildProvinceSummary ← สรุประดับจังหวัดสำหรับ Export CSV

src/data/nondData.js         ← DEFAULT_DATA (ข้อมูลสาธิตของแดชบอร์ดบทบาท)
```

ลำดับการทำงานตอนเปิดหน้า (`App` ใน `useEffect`):

1. render ทันทีด้วยสถานะ `wasteStatus = 'loading'`
2. `loadWasteData()` — ดึง CSV จากลิงก์ → แปลง → สรุปผล
3. `setWaste()` + `setWasteStatus('ready')` — `PublicView` วาดกราฟ/การ์ดจากข้อมูลจริง
   (ถ้าเชื่อมต่อไม่สำเร็จ → `wasteStatus = 'error'` แสดงข้อความแจ้งเตือน)

### ข้อมูลออฟไลน์ (raw_data → clean_data)

ข้อมูลระดับ อปท. ของจังหวัดนนทบุรี (ปี พ.ศ. 2563 ขึ้นไป) ใช้สำหรับวิเคราะห์และคำนวณค่า default ในแอป

| ไฟล์ดิบ (`raw_data/`) | ไฟล์สะอาด (`clean_data/`) | เนื้อหา |
|-------------|---------------|---------|
| `community.csv` | `clean_community.csv` | ขยะมูลฝอยชุมชน (ตัน) รายเดือน |
| `recycle.csv` | `clean_recycle.csv` | ขยะรีไซเคิล (ตัน) |
| `wet.csv` | `clean_wet.csv` | ขยะอินทรีย์/ขยะเปียก (ตัน) |
| `benefit.csv` | `clean_benefit.csv` | ขยะที่นำไปใช้ประโยชน์ |
| `virusdispose.csv` | `clean_virusdispose.csv` | ขยะติดเชื้อ / กำจัดถูกต้อง (ตัน) |
| `pay_garbage.csv` | `clean_pay.csv` | ค่าใช้จ่ายบริหารจัดการขยะ |
| `car.csv` | `clean_car.csv` | พาหนะขนส่งขยะ (คัน) |
| `location.csv` | `clean_location.csv` | สถานที่กำจัดขยะ (แห่ง) |
| `store .csv` | `clean_store.csv` | ครัวเรือนที่กำจัดขยะ |
| `population.csv` | `clean_population.csv` | ประชากร/ความหนาแน่นรายอำเภอ |
| — | `ประเภทมูลฝอย - ตารางองค์ประกอบมูลฝอย_เลขอังกฤษ.csv` | องค์ประกอบมูลฝอย (ร้อยละ) |

แอป React **ไม่ได้** import ไฟล์ CSV เหล่านี้โดยตรง (ข้อมูลสดมาจาก Google Sheets)

### รันสคริปต์วิเคราะห์ (Python)

```
pip install pandas numpy matplotlib statsmodels jupyter
python src/jupiter_notebook/make_density_viz.py
python src/clean_data/waste_reduction_impact.py
```

สคริปต์ `make_*.py` อ้างอิง path จากตำแหน่งไฟล์เอง จึงรันจากโฟลเดอร์ใดก็ได้
ส่วน notebook บางไฟล์ยังอ่านจาก `../data/*.csv` (path เดิม) — ให้เปลี่ยนเป็น `../raw_data/` ก่อนรันซ้ำ

---

## เชื่อมต่อ Google Sheets (อัตโนมัติ ไม่ต้องใช้ API key)

ใช้ลิงก์ **Publish to web (CSV)** ของ Google Sheets ซึ่งส่ง header
`Access-Control-Allow-Origin: *` จึง fetch ได้ตรงจากเบราว์เซอร์

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

**ข้อมูลสำรอง:** หากต้องการ fallback เมื่อโหลดชีตไม่สำเร็จ ดูคอมเมนต์ใน `loadWasteData()`
(ใช้ไฟล์ `src/clean_data/clean_community.csv`)

---

## หน้า LINE OA (`public/line-oa-ui/`)

หน้าจำลองแชต LINE OA ที่เปิดผ่าน LIFF ให้ประชาชนแจ้งปัญหาขยะ (แนบรูป + ประเภท + รายละเอียด)
แล้วส่งเข้า Google Apps Script web-app ซึ่งบันทึกลงชีต

- เข้าได้ที่ `/line-oa-ui/index.html` (มีลิงก์จากหน้า Public)
- ตั้งค่า LIFF ID ใน `public/line-oa-ui/liff-config.js` และ `LIFF_ID` ใน `app.js`
  (ถ้ายังเป็น `YOUR_LIFF_ID_HERE` จะทำงานในโหมด dev)
- Endpoint URL ใน LINE Developers: `https://<โดเมน>/line-oa-ui/index.html`

---

## ความปลอดภัยและค่าตั้งค่า

- **ห้าม commit ไฟล์ `.env`** — `.gitignore` กันไว้แล้ว (ยกเว้น `.env.example`)
- ตัวแปร `VITE_*` ใน `.env` จะถูกฝังลงใน JavaScript ที่ build ออกมา **ทุกคนอ่านได้**
  จึงใช้ได้กับค่าที่ไม่ลับเท่านั้น (เช่น ลิงก์ชีต, LIFF ID)
- **Gemini API key เป็นความลับ** — ห้ามใส่ใน `gemini.js` หรือ `VITE_*` โดยตรง
  ควรเรียกผ่าน serverless function (เช่น `api/gemini.js` บน Vercel) ที่อ่าน `process.env.GEMINI_API_KEY`
  ปัจจุบัน `callGemini()` เว้น key ว่างไว้ ฟีเจอร์ AI จึงยังไม่ทำงานบน production
- ลิงก์ Publish-to-web เป็น **สาธารณะและอ่านอย่างเดียว** — อย่าใส่ข้อมูลส่วนบุคคลในชีตนั้น
- Apps Script endpoint เปิดให้ใครก็ POST ได้ — ควรตรวจสอบ/จำกัดความยาวข้อมูลฝั่ง Apps Script

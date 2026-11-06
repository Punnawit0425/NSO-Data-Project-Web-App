<a id="english"></a>

# NonD — Waste Management & Carbon Credit Platform for Nonthaburi

**English** · [ภาษาไทย](#thai)

A **React (Vite)** web app that demonstrates a waste management and carbon credit system for
Nonthaburi Province, Thailand, with views for 5 user roles: Public · Municipality ·
Village Juristic Office · Industrial Factory · Waste Collector.

- **The public dashboard uses real data**, pulled live from Google Sheets (see below)
- **Waste forecast Scenario Simulator** built with Recharts — `src/components/WasteReductionSimulator.jsx`
- **LINE OA / LIFF page** where residents can report waste problems — `public/line-oa-ui/`
- AI features (Gemini) for drafting policy plans, announcements and ESG reports
- Raw data, cleaned data, Jupyter Notebooks and analysis scripts live in `analysis/` (separate from the app code in `src/`)
- Built with Tailwind (Play CDN), `lucide-react`, `recharts` and Google Fonts

An explanation of every chart and number on screen is in [`explanation.md`](explanation.md) (English · Thai).

### Install and run

```
npm install
npm run dev      # dev mode (http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # preview the build
```

Deployed on **Vercel** (`base: '/'` in `vite.config.js` — served from the root).

---

## Project structure

```
NSO-data/
├── index.html                 # Vite entry (Tailwind CDN, fonts, <div id="root">)
├── vite.config.js
├── package.json
├── README.md                  # this file
├── explanation.md             # explanation of charts/numbers in the app
├── public/
│   └── line-oa-ui/            # LINE OA + LIFF mock page (plain HTML/JS, not React)
│       ├── index.html, app.js, style.css
│       └── liff-config.js     # LIFF ID
├── src/
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # central state (role, data, toast, AI modal) + Context provider
│   ├── appContext.js          # React Context + useApp() hook
│   ├── index.css              # fonts + custom scrollbar
│   ├── data/nondData.js       # DEFAULT_DATA (demo data for the role dashboards)
│   ├── services/
│   │   ├── wasteSheet.js      # automatic Google Sheets connection (CSV) + parse/aggregate
│   │   └── gemini.js          # callGemini() + prompt presets for the AI features
│   └── components/
│       ├── Icon.jsx           # maps icon names -> lucide-react
│       ├── Header.jsx, Footer.jsx, Toast.jsx, AIModal.jsx
│       ├── WasteReductionSimulator.jsx   # forecast Scenario Simulator (Recharts)
│       └── views/             # PublicView, MunicipalityView, VillageView,
│                              # FactoryView, CollectorView
└── analysis/                  # data work — not part of the app bundle
    ├── data/
    │   ├── raw/               # original raw CSV data (not yet cleaned)
    │   └── clean/             # cleaned data (clean_*.csv, waste_composition.csv)
    ├── notebooks/             # one notebook per topic: clean raw -> clean + charts
    ├── scripts/               # make_*_viz.py, waste_reduction_impact.py (Holt-Winters)
    └── figures/               # chart images (.png) produced by notebooks/scripts
```

---

## User roles (views)

| Tab | Component | Data source |
|-----|-----------|-------------|
| 1. Home (public) | `PublicView` | **Real data** from Google Sheets + forecast simulator |
| 2. Municipality | `MunicipalityView` | Demo data from `nondData.js` |
| 3. Village juristic office | `VillageView` | Demo data + data recorded by the Collector |
| 4. Industrial factory | `FactoryView` | Demo data from `nondData.js` |
| 5. Waste collector | `CollectorView` | Records waste weight per household → syncs into central state |

Role dashboards 2–5 still use demo data because the current sheet has no data for them
(carbon credits, dividends, etc.). Once a sheet exists for them, they can be connected the
same way as `wasteSheet.js`.

---

## Data layer

```
src/services/wasteSheet.js   ← automatic Google Sheets connection (Publish-to-web CSV)
├── CSV_URL              ← published sheet link (change it here only)
├── loadWasteData()      ← fetch CSV → parse → aggregate (called once on page load)
├── buildMonthlySeries() ← monthly time series fed to the forecast simulator
└── buildProvinceSummary ← province-level summary for CSV export

src/data/nondData.js         ← DEFAULT_DATA (demo data for the role dashboards)
```

What happens on page load (`App`, inside `useEffect`):

1. Render immediately with `wasteStatus = 'loading'`
2. `loadWasteData()` — fetch the CSV from the link → parse → summarize
3. `setWaste()` + `setWasteStatus('ready')` — `PublicView` draws charts/cards from real data
   (if the connection fails → `wasteStatus = 'error'` and a warning message is shown)

### Offline data (analysis/data/raw → analysis/data/clean)

Local-government-level data for Nonthaburi Province (Buddhist Era year 2563 / 2020 onward),
used for analysis and to compute the app's default values.

| Raw file (`analysis/data/raw/`) | Clean file (`analysis/data/clean/`) | Contents |
|-------------|---------------|---------|
| `community.csv` | `clean_community.csv` | Monthly municipal solid waste (tonnes) |
| `recycle.csv` | `clean_recycle.csv` | Recyclable waste (tonnes) |
| `wet.csv` | `clean_wet.csv` | Organic / wet waste (tonnes) |
| `benefit.csv` | `clean_benefit.csv` | Waste put to beneficial use |
| `virusdispose.csv` | `clean_virusdispose.csv` | Infectious waste / properly disposed (tonnes) |
| `pay_garbage.csv` | `clean_pay.csv` | Waste management costs |
| `car.csv` | `clean_car.csv` | Waste transport vehicles (count) |
| `location.csv` | `clean_location.csv` | Waste disposal sites (count) |
| `store.csv` | `clean_store.csv` | Households with waste disposal |
| `population.csv` | `clean_population.csv` | Population / density by district |
| — | `waste_composition.csv` | Waste composition (percent) |

The React app does **not** import these CSV files directly (live data comes from Google Sheets), except
`clean_community.csv`, which is bundled as backup data.

### Run the analysis scripts (Python)

```
pip install pandas numpy matplotlib seaborn statsmodels jupyter
python analysis/scripts/make_density_viz.py
python analysis/scripts/waste_reduction_impact.py
```

The scripts in `analysis/scripts/` resolve paths relative to their own location, so they can be run
from any folder; they save charts to `analysis/figures/`. The notebooks in `analysis/notebooks/` read from `analysis/data/raw/` and write to `analysis/data/clean/`; each one
explains every step (English first, then Thai), adds charts, and ends with a summary of key
findings. Run them with `analysis/notebooks` as the working directory (also needs `seaborn`).

---

## Google Sheets connection (automatic, no API key needed)

The app uses a Google Sheets **Publish to web (CSV)** link, which sends the
`Access-Control-Allow-Origin: *` header, so the browser can fetch it directly.

### How to switch sheets

1. Open the spreadsheet → **File → Share → Publish to web → pick a tab → CSV → Publish**
2. Copy the link (format `.../pub?output=csv`)
3. Paste it into the `CSV_URL` variable in `src/services/wasteSheet.js`

### Sheet schema (first row = column names)

| (index) | ปี | เดือน | จังหวัด | อำเภอ | อปท. | ขยะมูลฝอยชุมชน(ตัน) |
|--------|-----|-------|---------|-------|------|----------------------|
| 0 | 2567 | มกราคม | นนทบุรี | เมืองนนทบุรี | เทศบาลนครนนทบุรี | 5388.0 |

Column names stay in Thai because the code matches them exactly:
`ปี` = year (Buddhist Era) · `เดือน` = month · `จังหวัด` = province · `อำเภอ` = district ·
`อปท.` = local government organization · `ขยะมูลฝอยชุมชน(ตัน)` = municipal solid waste (tonnes).

- `ปี` uses Buddhist Era years (2567 = 2024 CE) · `เดือน` uses full Thai month names (มกราคม–ธันวาคม)
- `ขยะมูลฝอยชุมชน(ตัน)` = a number (any column whose name contains "ขยะมูลฝอย")
- The app automatically summarizes it into: yearly totals · monthly trend · by district ·
  number of reporting local governments

**Backup data:** if the sheet fails to load (network error, sheet unpublished or empty),
`loadWasteData()` automatically falls back to `analysis/data/clean/clean_community.csv`, which is
bundled into the app. The dashboard then shows an amber "backup data" notice instead of
"connected". The backup is a snapshot, so refresh it when the sheet gets new data.

---

## LINE OA page (`public/line-oa-ui/`)

A mock LINE OA chat page opened through LIFF, where residents report waste problems
(photo + category + details). Reports are sent to a Google Apps Script web app, which saves
them to a sheet.

- Available at `/line-oa-ui/index.html` (linked from the Public page)
- Set the LIFF ID in `public/line-oa-ui/liff-config.js` and `LIFF_ID` in `app.js`
  (while it is still `YOUR_LIFF_ID_HERE`, the page runs in dev mode)
- Endpoint URL in LINE Developers: `https://<domain>/line-oa-ui/index.html`

---

## Security and configuration

- **Never commit `.env` files** — `.gitignore` already blocks them (except `.env.example`)
- `VITE_*` variables in `.env` are embedded in the built JavaScript and **readable by anyone**,
  so use them only for non-secret values (e.g. the sheet link, LIFF ID)
- **The Gemini API key is a secret** — never put it in `gemini.js` or a `VITE_*` variable.
  Call Gemini through a serverless function (e.g. `api/gemini.js` on Vercel) that reads
  `process.env.GEMINI_API_KEY`. `callGemini()` currently leaves the key blank, so the AI
  features do not work in production yet
- The Publish-to-web link is **public and read-only** — do not put personal data in that sheet
- The Apps Script endpoint accepts POSTs from anyone — validate and limit input length on the
  Apps Script side

---
---

<a id="thai"></a>

# NonD — แพลตฟอร์มระบบจัดการขยะและคาร์บอนเครดิตจังหวัดนนทบุรี

[English](#english) · **ภาษาไทย**

เว็บแอป **React (Vite)** สำหรับสาธิตระบบจัดการขยะและคาร์บอนเครดิต
แยกตามบทบาทผู้ใช้ 5 กลุ่ม: หน้าหลักสาธารณะ · เทศบาล · นิติบุคคลหมู่บ้าน · โรงงานอุตสาหกรรม · เจ้าหน้าที่ขนขยะ

- **แดชบอร์ดสาธารณะใช้ข้อมูลจริง** ดึงสดจาก Google Sheets อัตโนมัติ (ดูด้านล่าง)
- **ตัวจำลองพยากรณ์ขยะ (Scenario Simulator)** ด้วย Recharts — `src/components/WasteReductionSimulator.jsx`
- **หน้า LINE OA / LIFF** สำหรับให้ประชาชนแจ้งปัญหาขยะ — `public/line-oa-ui/`
- ฟีเจอร์ AI (Gemini) สำหรับร่างนโยบาย/ประกาศ/รายงาน ESG
- ชุดข้อมูลดิบ ข้อมูลที่ทำความสะอาดแล้ว Jupyter Notebook และสคริปต์วิเคราะห์ข้อมูล อยู่ใน `analysis/` (แยกจากโค้ดแอปใน `src/`)
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
├── src/
│   ├── main.jsx               # จุดเริ่ม React
│   ├── App.jsx                # state กลาง (role, data, toast, AI modal) + Context provider
│   ├── appContext.js          # React Context + hook useApp()
│   ├── index.css              # ฟอนต์ + custom scrollbar
│   ├── data/nondData.js       # DEFAULT_DATA (ข้อมูลสาธิตของแดชบอร์ดบทบาท)
│   ├── services/
│   │   ├── wasteSheet.js      # เชื่อม Google Sheets อัตโนมัติ (CSV) + parse/aggregate
│   │   └── gemini.js          # callGemini() + ชุด prompt ของฟีเจอร์ AI
│   └── components/
│       ├── Icon.jsx           # map ชื่อไอคอน -> lucide-react
│       ├── Header.jsx, Footer.jsx, Toast.jsx, AIModal.jsx
│       ├── WasteReductionSimulator.jsx   # ตัวจำลองพยากรณ์ (Recharts)
│       └── views/             # PublicView, MunicipalityView, VillageView,
│                              # FactoryView, CollectorView
└── analysis/                  # งานวิเคราะห์ข้อมูล — ไม่ได้รวมอยู่ในแอป
    ├── data/
    │   ├── raw/               # ข้อมูลดิบ CSV ต้นทาง (ยังไม่ทำความสะอาด)
    │   └── clean/             # ข้อมูลที่ทำความสะอาดแล้ว (clean_*.csv, waste_composition.csv)
    ├── notebooks/             # Notebook แยกตามหัวข้อ: ทำความสะอาด raw -> clean + กราฟ
    ├── scripts/               # make_*_viz.py, waste_reduction_impact.py (Holt-Winters)
    └── figures/               # รูปกราฟ (.png) ที่สร้างจาก notebook/สคริปต์
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

### ข้อมูลออฟไลน์ (analysis/data/raw → analysis/data/clean)

ข้อมูลระดับ อปท. ของจังหวัดนนทบุรี (ปี พ.ศ. 2563 ขึ้นไป) ใช้สำหรับวิเคราะห์และคำนวณค่า default ในแอป

| ไฟล์ดิบ (`analysis/data/raw/`) | ไฟล์สะอาด (`analysis/data/clean/`) | เนื้อหา |
|-------------|---------------|---------|
| `community.csv` | `clean_community.csv` | ขยะมูลฝอยชุมชน (ตัน) รายเดือน |
| `recycle.csv` | `clean_recycle.csv` | ขยะรีไซเคิล (ตัน) |
| `wet.csv` | `clean_wet.csv` | ขยะอินทรีย์/ขยะเปียก (ตัน) |
| `benefit.csv` | `clean_benefit.csv` | ขยะที่นำไปใช้ประโยชน์ |
| `virusdispose.csv` | `clean_virusdispose.csv` | ขยะติดเชื้อ / กำจัดถูกต้อง (ตัน) |
| `pay_garbage.csv` | `clean_pay.csv` | ค่าใช้จ่ายบริหารจัดการขยะ |
| `car.csv` | `clean_car.csv` | พาหนะขนส่งขยะ (คัน) |
| `location.csv` | `clean_location.csv` | สถานที่กำจัดขยะ (แห่ง) |
| `store.csv` | `clean_store.csv` | ครัวเรือนที่กำจัดขยะ |
| `population.csv` | `clean_population.csv` | ประชากร/ความหนาแน่นรายอำเภอ |
| — | `waste_composition.csv` | องค์ประกอบมูลฝอย (ร้อยละ) |

แอป React **ไม่ได้** import ไฟล์ CSV เหล่านี้โดยตรง (ข้อมูลสดมาจาก Google Sheets) ยกเว้น `clean_community.csv` ที่ฝังไว้เป็นข้อมูลสำรอง

### รันสคริปต์วิเคราะห์ (Python)

```
pip install pandas numpy matplotlib seaborn statsmodels jupyter
python analysis/scripts/make_density_viz.py
python analysis/scripts/waste_reduction_impact.py
```

สคริปต์ใน `analysis/scripts/` อ้างอิง path จากตำแหน่งไฟล์เอง จึงรันจากโฟลเดอร์ใดก็ได้ และบันทึกกราฟลง `analysis/figures/`
ส่วน notebook ใน `analysis/notebooks/` อ่านข้อมูลจาก `analysis/data/raw/` และบันทึกลง `analysis/data/clean/` แต่ละไฟล์มีคำอธิบายทุกขั้นตอน
(ภาษาอังกฤษก่อน ตามด้วยภาษาไทย) พร้อมกราฟ และสรุปข้อค้นพบท้ายไฟล์ — ให้รันโดยใช้ `analysis/notebooks`
เป็น working directory (ต้องติดตั้ง `seaborn` เพิ่ม)

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

**ข้อมูลสำรอง:** หากโหลดชีตไม่สำเร็จ (เน็ตล่ม / ชีตถูกปิด / ชีตว่าง) `loadWasteData()` จะใช้ไฟล์
`analysis/data/clean/clean_community.csv` ที่ฝังไว้ในแอปแทนโดยอัตโนมัติ และแดชบอร์ดจะแสดงข้อความสีเหลือง
"แสดงข้อมูลสำรองในเครื่อง" แทน "เชื่อมต่อแล้ว" — ไฟล์นี้เป็นข้อมูล ณ วันที่บันทึก ควรอัปเดตเมื่อชีตมีข้อมูลใหม่

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

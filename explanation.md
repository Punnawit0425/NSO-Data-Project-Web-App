<a id="english"></a>

# Explanation — Charts and Numbers in the NonD Web App

**English** · [ภาษาไทย](#thai)

This document explains the charts shown in the NonD web app (the waste management and
carbon credit platform for Nonthaburi Province): what each chart is, how it is built, where
its data comes from, and what each number on screen means.

> This document does not change any app code; it is an explanation only.

---

## 1. The app has 2 kinds of charts

### A. Small monthly trend charts (hand-drawn SVG)
- **Where:** `src/components/views/PublicView.jsx`
- **What it is:** a small line chart of monthly municipal solid waste (tonnes) for the selected year
- **How it is built:** it does **not** use a chart library. The function `linePath(values, min, max)`
  turns the 12 monthly values into an SVG `<path>` string by hand
  - x position: `3 + (i / 11) * 94` → spreads the 12 months across the width
  - y position: `38 - ((v - min) / range) * 34` → scales each value to fit the box height
  - The scale is "zoomed in" (starts at `min`, **not** 0) so small changes are easy to see
  - Months with no data (value ≤ 0) break the line into segments instead of dropping it to zero

### B. Forecast / Scenario Simulator (the main chart)
- **Where:** `src/components/WasteReductionSimulator.jsx` (the `WasteReductionSimulator` component), rendered inside
  `PublicView.jsx`
- **Library:** **Recharts** (`recharts` version 3, see `package.json`), using a `ComposedChart`
  that combines **lines** with a **shaded area band**
- This is the main, interactive chart that most people mean when they say "the chart".
  The rest of this document focuses on it

---

## 2. What the main chart shows

The chart compares **waste without the platform** against **waste with the platform**
and forecasts forward. It contains these series:

| Series (label in the chart) | Color / line style | Meaning |
|---|---|---|
| **ข้อมูลจริง** (Actual) | Solid dark line | Measured monthly waste (tonnes) |
| **เส้นฐาน (ไม่ใช้แพลตฟอร์ม)** (Baseline, no platform) | Dashed gray line | Forecast assuming nothing changes |
| **เมื่อใช้แพลตฟอร์ม** (With platform) | Solid green line | Forecast assuming the platform reduces waste |
| **ขยะที่หลีกเลี่ยงได้** (Avoided waste) | Light green shaded band | Gap between the baseline and "with platform" = waste avoided |
| **เริ่มใช้** (Adoption) | Dashed blue vertical line | The month the platform is assumed to start |

The x-axis is time (monthly or yearly); the y-axis is waste in tonnes (shown with `k`, e.g.
`45k` = 45,000 tonnes). A toggle switches between **Monthly** and **Yearly** views.

---

## 3. Where the data comes from

### Real data source
- A **Google Sheet published as CSV** (`CSV_URL` in `src/services/wasteSheet.js`). It is the
  official dataset of **municipal solid waste in Nonthaburi Province** (columns: year, month,
  district, local government, municipal solid waste in tonnes)
- `loadWasteData()` fetches the CSV → `toRecords()` parses it → `aggregate()` summarizes it into
  yearly totals, monthly arrays per year, totals per district, and the number of local governments
- `buildMonthlySeries()` joins each year's monthly data into one continuous time series in
  chronological order (and trims trailing months of the latest year that have no data yet).
  This array is passed to the simulator through the `historical` prop, together with
  `startYearBE` (the starting year in the Buddhist Era)

### Backup / demo data
- If there is no real data (fewer than 12 months loaded), the simulator uses `SAMPLE_HISTORICAL`
  in `src/components/WasteReductionSimulator.jsx` instead — 36 months of made-up sample data — so the component can run
  standalone
- The label above the chart says which source is in use:
  - **"Google Sheets (ข้อมูลจริง N เดือน)"** = real data, N months
  - **"ตัวอย่างสาธิต..."** = demo/sample data

### How the forecast is calculated (`src/components/WasteReductionSimulator.jsx`)
1. `linearTrend()` — fits a linear trend to the historical data by least squares
2. `seasonalIndices()` — multiplicative seasonal indices (period = 12 months, normalized to mean 1)
3. `forecastBaseline()` — forecasts the **baseline** forward = trend × seasonal index
4. `effectiveReduction(m, fullRate, rampMonths)` — the assumed reduction rate ramps up from 0
   to the full rate over `rampMonths`
5. **With platform** = baseline × (1 − effective reduction rate)
6. **Avoided waste** = baseline − with platform (the shaded band)

> ⚠️ Important: the **baseline** is computed from real historical data, but the **reduction rate**
> is **an assumption you set with the slider** — it is *not* learned from data (the app shows a
> yellow warning saying so), because there is no data yet from a period when the platform was
> actually in use.

---

## 4. What each number on screen means

### Summary cards (above the simulator)
| Card | Number | Meaning |
|---|---|---|
| ขยะที่หลีกเลี่ยงได้สะสม (Cumulative avoided waste) | `… ตัน` | **Cumulative avoided waste** over the forecast period (sum of the green band), in tonnes |
| คาร์บอนเครดิตสะสม (ประเมิน) (Estimated cumulative carbon credits) | `… tCO₂e` | Cumulative avoided waste × emission factor = estimated **carbon credits** (tonnes of CO₂ equivalent) |
| เทียบเท่าการปลูกต้นไม้ 🌳 (Tree-planting equivalent) | `… ต้น` | Carbon credits converted to an **equivalent number of trees** (`credits × 1000 kg ÷ 21 kg CO₂ per tree per year`) |
| อัตราการลด ณ สิ้นช่วง (Reduction rate at end of period) | `… %` | The **effective reduction rate at the end of the forecast** (after fully ramping up) |

### Control sliders (adjustable assumptions)
| Control | Range | Meaning |
|---|---|---|
| อัตราการลดขยะที่คาดหวัง (เต็มที่) (Expected full reduction rate) | 0–40% | The full reduction rate the platform is assumed to eventually reach |
| ระยะเวลาปรับตัวจนเต็มที่ (Ramp-up period) | 0–36 months | How long the gradual ramp-up takes before reaching the full rate |
| ช่วงเวลาพยากรณ์ (Forecast horizon) | 12–60 months | How far ahead to forecast |
| ตัวคูณคาร์บอน (Emission Factor) | 0.20–1.60 | tCO₂e avoided per 1 tonne of waste reduced/recycled |

There are also 3 **preset buttons**: ระมัดระวัง / Conservative (10%), ปานกลาง / Moderate (18%),
เชิงรุก / Aggressive (28%).

### Axis numbers / tooltip
- **Y-axis** values are divided by 1000 and suffixed with `k` (e.g. `50k` = 50,000 tonnes)
- The **tooltip** (on hover) shows the exact value of each series for that month/year, in Thai
  number format with tonnes (`… ตัน`), or `—` when a series has no value at that point

### Other numbers on the public page
- The yearly total / monthly value cards and the comparison with the previous year come from
  `aggregate()` (totals per year and per month)
- "อำเภอที่มีปริมาณขยะสูงสุด" (districts with the most waste) shows each district's waste in tonnes,
  with a bar whose width is relative to the largest district that year

---

## 5. One-line summary
The main chart is a **Recharts ComposedChart** that takes **Nonthaburi's real monthly waste data
from a published Google Sheet**, forecasts a **baseline** (trend + seasonality), and overlays an
**assumption-based "with platform" line** and a **shaded "avoided waste" band**. The numbers around
it are cumulative avoided waste (tonnes), estimated carbon credits (tCO₂e), the tree-planting
equivalent, and the reduction rate at the end of the period — all recalculated in real time as
you move the sliders.

---
---

<a id="thai"></a>

# คำอธิบาย — กราฟและตัวเลขในเว็บแอป NonD

[English](#english) · **ภาษาไทย**

เอกสารนี้อธิบายกราฟต่าง ๆ ที่แสดงในเว็บแอป NonD (แพลตฟอร์มระบบจัดการขยะและ
คาร์บอนเครดิตของจังหวัดนนทบุรี) ว่ากราฟคืออะไร สร้างขึ้นมาอย่างไร ใช้ข้อมูลจากไหน
และตัวเลขแต่ละตัวบนหน้าจอหมายถึงอะไร

> เอกสารนี้ไม่ได้แก้ไขโค้ดของแอปแต่อย่างใด เป็นเพียงคำอธิบายเท่านั้น

---

## 1. ในแอปมีกราฟอยู่ 2 แบบ

### A. กราฟแนวโน้มรายเดือนแบบเล็ก (วาดด้วย SVG เอง)
- **อยู่ที่:** `src/components/views/PublicView.jsx`
- **คืออะไร:** เส้นกราฟเล็ก ๆ ที่แสดงปริมาณขยะมูลฝอยชุมชนรายเดือน (หน่วยตัน) ของปีที่เลือก
- **สร้างอย่างไร:** **ไม่ได้** ใช้ไลบรารีกราฟ แต่ใช้ฟังก์ชัน `linePath(values, min, max)`
  ที่นำตัวเลข 12 เดือนมาแปลงเป็นสตริง `<path>` ของ SVG ด้วยมือ
  - ตำแหน่งแกน x: `3 + (i / 11) * 94` → กระจาย 12 เดือนตามความกว้าง
  - ตำแหน่งแกน y: `38 - ((v - min) / range) * 34` → ปรับสเกลแต่ละค่าให้พอดีกับความสูงของกล่อง
  - สเกลแบบ "ซูมเข้า" (เริ่มที่ค่า `min` **ไม่ใช่** 0) เพื่อให้เห็นการเปลี่ยนแปลงเล็ก ๆ ได้ชัด
  - เดือนที่ไม่มีข้อมูล (ค่า ≤ 0) จะตัดเส้นออกเป็นช่วง ๆ แทนที่จะลากดิ่งลงไปที่ศูนย์

### B. ตัวจำลองพยากรณ์ / Scenario Simulator (กราฟหลัก)
- **อยู่ที่:** `src/components/WasteReductionSimulator.jsx` (คอมโพเนนต์ `WasteReductionSimulator`) แสดงผลภายใน
  `PublicView.jsx`
- **ไลบรารี:** **Recharts** (`recharts` เวอร์ชัน 3 ดูใน `package.json`) ใช้ `ComposedChart`
  ที่ผสม **เส้น (lines)** เข้ากับ **แถบพื้นที่แรเงา (area band)**
- นี่คือกราฟหลักที่มีความสามารถและโต้ตอบได้ ซึ่งคนส่วนใหญ่หมายถึงเมื่อพูดว่า "กราฟ"
  เนื้อหาที่เหลือของเอกสารนี้จะเน้นที่กราฟตัวนี้

---

## 2. กราฟหลักแสดงอะไร

กราฟนี้เปรียบเทียบ **ปริมาณขยะถ้าไม่ใช้แพลตฟอร์ม** กับ **ปริมาณขยะเมื่อใช้แพลตฟอร์ม**
แล้วพยากรณ์ไปข้างหน้า ประกอบด้วยชุดข้อมูลเหล่านี้:

| ชุดข้อมูล (ป้ายในกราฟ) | สี / ลักษณะเส้น | ความหมาย |
|---|---|---|
| **ข้อมูลจริง** | เส้นทึบสีเข้ม | ปริมาณขยะรายเดือนที่วัดได้จริง (ตัน) |
| **เส้นฐาน (ไม่ใช้แพลตฟอร์ม)** | เส้นประสีเทา | พยากรณ์โดยสมมติว่าไม่มีอะไรเปลี่ยนแปลง |
| **เมื่อใช้แพลตฟอร์ม** | เส้นทึบสีเขียว | พยากรณ์โดยสมมติว่าแพลตฟอร์มช่วยลดขยะ |
| **ขยะที่หลีกเลี่ยงได้** | แถบแรเงาสีเขียวอ่อน | ช่องว่างระหว่างเส้นฐานกับ "เมื่อใช้แพลตฟอร์ม" = ขยะที่หลีกเลี่ยงได้ |
| **เริ่มใช้** | เส้นแนวตั้งประสีฟ้า | เดือนที่สมมติว่าเริ่มใช้แพลตฟอร์ม |

แกน x คือเวลา (รายเดือนหรือรายปี) แกน y คือปริมาณขยะหน่วยตัน (แสดงเป็น `k` เช่น
`45k` = 45,000 ตัน) มีปุ่มสลับระหว่างมุมมอง **รายเดือน (Monthly)** และ **รายปี (Yearly)**

---

## 3. ใช้ข้อมูลจากไหน

### แหล่งข้อมูลจริง
- มาจาก **Google Sheet ที่เผยแพร่เป็นไฟล์ CSV** (`CSV_URL` ใน
  `src/services/wasteSheet.js`) เป็นชุดข้อมูลทางการของ **ปริมาณขยะมูลฝอยชุมชนจังหวัด
  นนทบุรี** (คอลัมน์: ปี, เดือน, อำเภอ, อปท., ขยะมูลฝอยชุมชนหน่วยตัน)
- `loadWasteData()` ดึง CSV → `toRecords()` แปลงข้อมูล → `aggregate()` สรุปเป็นยอดรวม
  ต่อปี, อาเรย์รายเดือนต่อปี, ยอดรวมต่ออำเภอ และจำนวน อปท.
- `buildMonthlySeries()` นำข้อมูลรายเดือนของแต่ละปีมาต่อกันเป็นอนุกรมเวลาต่อเนื่องเรียง
  ตามลำดับ (และตัดเดือนท้าย ๆ ของปีล่าสุดที่ยังไม่มีข้อมูลออก) อาเรย์นี้จะถูกส่งเข้าไปใน
  ตัวจำลองผ่าน prop `historical` พร้อมกับ `startYearBE` (ปีเริ่มต้นแบบ พ.ศ.)

### ข้อมูลสำรอง / ข้อมูลสาธิต
- ถ้าไม่มีข้อมูลจริง (โหลดได้น้อยกว่า 12 เดือน) ตัวจำลองจะใช้ `SAMPLE_HISTORICAL`
  ใน `src/components/WasteReductionSimulator.jsx` แทน — เป็นข้อมูลตัวอย่าง 36 เดือนที่สมมติขึ้น — เพื่อให้คอมโพเนนต์
  ทำงานได้แบบสแตนด์อโลน
- ป้ายกำกับเหนือกราฟจะบอกว่ากำลังใช้แหล่งข้อมูลใด:
  - **"Google Sheets (ข้อมูลจริง N เดือน)"** = ข้อมูลจริง จำนวน N เดือน
  - **"ตัวอย่างสาธิต..."** = ข้อมูลสาธิต/ตัวอย่าง

### วิธีคำนวณการพยากรณ์ (`src/components/WasteReductionSimulator.jsx`)
1. `linearTrend()` — หาเส้นแนวโน้มเชิงเส้นด้วยวิธีกำลังสองน้อยที่สุดจากข้อมูลในอดีต
2. `seasonalIndices()` — ดัชนีฤดูกาลแบบคูณ (คาบ = 12 เดือน ปรับค่าเฉลี่ยให้เท่ากับ 1)
3. `forecastBaseline()` — พยากรณ์ **เส้นฐาน** ไปข้างหน้า = แนวโน้ม × ดัชนีฤดูกาล
4. `effectiveReduction(m, fullRate, rampMonths)` — อัตราการลดที่สมมติจะค่อย ๆ เพิ่มจาก 0
   ไปจนถึงอัตราเต็มที่ภายในช่วง `rampMonths`
5. ค่า **เมื่อใช้แพลตฟอร์ม** = เส้นฐาน × (1 − อัตราการลดที่มีผลจริง)
6. **ขยะที่หลีกเลี่ยงได้** = เส้นฐาน − เมื่อใช้แพลตฟอร์ม (คือแถบแรเงา)

> ⚠️ สำคัญ: **เส้นฐาน** คำนวณจากข้อมูลจริงในอดีต แต่ **อัตราการลด** เป็น
> **สมมติฐานที่คุณตั้งเองด้วยแถบเลื่อน (slider)** — *ไม่ได้* เรียนรู้จากข้อมูล (แอปจะ
> แสดงคำเตือนสีเหลืองบอกเรื่องนี้ชัดเจน) เพราะยังไม่มีข้อมูลช่วงที่ใช้แพลตฟอร์มจริง

---

## 4. ตัวเลขแต่ละตัวบนหน้าจอหมายถึงอะไร

### การ์ดสรุป (ด้านบนของตัวจำลอง)
| การ์ด | ตัวเลข | ความหมาย |
|---|---|---|
| ขยะที่หลีกเลี่ยงได้สะสม | `… ตัน` | **ขยะที่หลีกเลี่ยงได้สะสม** ตลอดช่วงพยากรณ์ (ผลรวมของแถบสีเขียว) หน่วยตัน |
| คาร์บอนเครดิตสะสม (ประเมิน) | `… tCO₂e` | ขยะที่หลีกเลี่ยงได้สะสม × ตัวคูณคาร์บอน = **คาร์บอนเครดิต** ที่ประเมินได้ (ตันคาร์บอนไดออกไซด์เทียบเท่า) |
| เทียบเท่าการปลูกต้นไม้ 🌳 | `… ต้น` | คาร์บอนเครดิตแปลงเป็น **จำนวนต้นไม้เทียบเท่า** (`เครดิต × 1000 กก. ÷ 21 กก. CO₂ ต่อต้นต่อปี`) |
| อัตราการลด ณ สิ้นช่วง | `… %` | **อัตราการลดที่มีผลจริง ณ สิ้นช่วงพยากรณ์** (หลังจากปรับตัวเต็มที่แล้ว) |

### แถบเลื่อนควบคุม (สมมติฐานที่ปรับได้)
| ตัวควบคุม | ช่วงค่า | ความหมาย |
|---|---|---|
| อัตราการลดขยะที่คาดหวัง (เต็มที่) | 0–40% | อัตราการลดเต็มที่ที่สมมติว่าแพลตฟอร์มจะทำได้ในที่สุด |
| ระยะเวลาปรับตัวจนเต็มที่ | 0–36 เดือน | ระยะเวลาที่ค่อย ๆ ปรับตัวก่อนถึงอัตราเต็มที่ |
| ช่วงเวลาพยากรณ์ | 12–60 เดือน | พยากรณ์ไปข้างหน้าไกลแค่ไหน |
| ตัวคูณคาร์บอน (Emission Factor) | 0.20–1.60 | tCO₂e ที่หลีกเลี่ยงได้ต่อขยะที่ลด/รีไซเคิลได้ 1 ตัน |

นอกจากนี้ยังมี **ปุ่มพรีเซ็ต** 3 ปุ่ม: ระมัดระวัง (10%), ปานกลาง (18%), เชิงรุก (28%)

### ตัวเลขบนแกนกราฟ / ทูลทิป
- ค่าบน **แกน y** แสดงเป็นค่าหารด้วย 1000 พร้อมต่อท้ายด้วย `k` (เช่น `50k` = 50,000 ตัน)
- **ทูลทิป** (เมื่อเลื่อนเมาส์ไปวาง) แสดงค่าที่แน่นอนของแต่ละชุดข้อมูล ณ เดือน/ปีนั้น เป็น
  ตัวเลขรูปแบบไทยหน่วยตัน (`… ตัน`) หรือ `—` เมื่อชุดข้อมูลไม่มีค่า ณ จุดนั้น

### ตัวเลขอื่น ๆ บนหน้าสาธารณะ
- การ์ดยอดรวมรายปี / ค่ารายเดือน และการเปรียบเทียบเทียบกับปีก่อน มาจาก `aggregate()`
  (ยอดรวมต่อปี, ต่อเดือน)
- "อำเภอที่มีปริมาณขยะสูงสุด" แสดงปริมาณขยะของแต่ละอำเภอเป็นตัน พร้อมแถบที่มีความกว้าง
  เทียบกับอำเภอที่มากที่สุดในปีนั้น

---

## 5. สรุปสั้น ๆ บรรทัดเดียว
กราฟหลักคือ **ComposedChart ของ Recharts** ที่นำ **ข้อมูลขยะรายเดือนจริงของนนทบุรีจาก
Google Sheet ที่เผยแพร่ไว้** มาพยากรณ์ **เส้นฐาน** (แนวโน้ม + ฤดูกาล) แล้วซ้อนทับด้วย
**เส้น "เมื่อใช้แพลตฟอร์ม" ที่อิงจากสมมติฐาน** และ **แถบแรเงา "ขยะที่หลีกเลี่ยงได้"**
ส่วนตัวเลขรอบ ๆ คือ ขยะที่หลีกเลี่ยงได้สะสม (ตัน), คาร์บอนเครดิตที่ประเมินได้ (tCO₂e),
จำนวนต้นไม้เทียบเท่า และอัตราการลด ณ สิ้นช่วง — ทั้งหมดคำนวณใหม่แบบเรียลไทม์เมื่อคุณ
เลื่อนแถบเลื่อน

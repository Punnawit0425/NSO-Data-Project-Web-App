/* ===================================================================
 *  wasteSheet — เชื่อมต่อ Google Sheets อัตโนมัติผ่านลิงก์ Publish-to-web (CSV)
 * ===================================================================
 *  แหล่งข้อมูลจริง: ปริมาณขยะมูลฝอยชุมชนจังหวัดนนทบุรี
 *  คอลัมน์: (ลำดับ) | ปี | เดือน | จังหวัด | อำเภอ | อปท. | ขยะมูลฝอยชุมชน(ตัน)
 *
 *  ลิงก์นี้เปิดสาธารณะ (Anyone with the link) และส่ง header
 *  `Access-Control-Allow-Origin: *` จึง fetch ได้ตรงจากเบราว์เซอร์
 *  โดยไม่ต้องใช้ API key และทำงานบน GitHub Pages ได้
 * =================================================================== */

export const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRcxrY5zB49yTU2G4-1wp8qI0a2IH7q0SkvHb7eyZZ66nTiQkX4rjt9wtrFcnjkYIvK_nB9CeWLM0XT/pub?output=csv';

// (สำรอง) ข้อมูลแบ็กอัปในเครื่อง ใช้เมื่อโหลดจาก Google Sheets ไม่สำเร็จ
// คอลัมน์ตรงกับชีตจริง จึงป้อนเข้า toRecords() ได้ทันที
// วิธีเปิดใช้งาน: ยกเลิกคอมเมนต์บรรทัด import ด้านล่าง + บล็อก fallback ใน loadWasteData()
// import BACKUP_CSV from '../data2/clean_community.csv?raw';

const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const MONTH_INDEX = Object.fromEntries(THAI_MONTHS.map((m, i) => [m, i + 1]));

export { THAI_MONTHS };

// ---- CSV parser ที่รองรับ field แบบมี quote / คอมมาในเครื่องหมายคำพูด ----
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ---- แปลง CSV ดิบ -> ระเบียน {year, month, district, lao, waste} ----
function toRecords(text) {
  const rows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ''));
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  const idx = {
    year: headers.indexOf('ปี'),
    month: headers.indexOf('เดือน'),
    district: headers.indexOf('อำเภอ'),
    lao: headers.indexOf('อปท.'),
    waste: headers.findIndex((h) => h.includes('ขยะมูลฝอย')),
  };
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const year = parseInt(r[idx.year], 10);
    const month = MONTH_INDEX[(r[idx.month] || '').trim()] || null;
    const waste = parseFloat(r[idx.waste]);
    if (!year || isNaN(waste)) continue;
    out.push({
      year,
      month,
      district: (r[idx.district] || '').trim(),
      lao: (r[idx.lao] || '').trim(),
      waste,
    });
  }
  return out;
}

// ---- สรุปข้อมูลเป็นโครงสร้างที่หน้าจอใช้ ----
function aggregate(records) {
  const totalByYear = {};
  const monthlyByYear = {}; // year -> [12 ตัวเลข]
  const districtByYear = {}; // year -> { อำเภอ: ตัน }
  const laoByYear = {}; // year -> Set ของ อปท.

  for (const rec of records) {
    const y = String(rec.year);
    totalByYear[y] = (totalByYear[y] || 0) + rec.waste;

    if (!monthlyByYear[y]) monthlyByYear[y] = new Array(12).fill(0);
    if (rec.month) monthlyByYear[y][rec.month - 1] += rec.waste;

    if (!districtByYear[y]) districtByYear[y] = {};
    districtByYear[y][rec.district] = (districtByYear[y][rec.district] || 0) + rec.waste;

    if (!laoByYear[y]) laoByYear[y] = new Set();
    if (rec.lao) laoByYear[y].add(rec.lao);
  }

  const years = Object.keys(totalByYear).map(Number).sort((a, b) => b - a);

  // อำเภอเรียงจากมากไปน้อยต่อปี
  const districtsSortedByYear = {};
  for (const y of Object.keys(districtByYear)) {
    districtsSortedByYear[y] = Object.entries(districtByYear[y])
      .map(([name, tons]) => ({ name, tons }))
      .sort((a, b) => b.tons - a.tons);
  }

  const laoCountByYear = {};
  for (const y of Object.keys(laoByYear)) laoCountByYear[y] = laoByYear[y].size;

  return {
    years, // [2567, 2566, ...] (พ.ศ.)
    totalByYear, // { '2567': 579563.x, ... }
    monthlyByYear, // { '2567': [m1..m12], ... }
    districtsByYear: districtsSortedByYear, // { '2567': [{name,tons}], ... }
    laoCountByYear, // { '2567': 47, ... }
  };
}

// ---- สร้างอนุกรมเวลารายเดือนแบบต่อเนื่อง (chronological) สำหรับฟีเจอร์พยากรณ์ ----
//  นำ monthlyByYear (ปี -> [12]) มาต่อกันเรียงจากปีเก่าสุดไปใหม่สุด
//  แล้วตัด "เดือนท้ายที่ยังไม่มีข้อมูล" (ค่า 0) ของปีล่าสุดออก เพื่อไม่ให้บิดเบือนแนวโน้ม
//  คืนค่า: { series: number[] (ตัน), startYearBE: number } — ใช้ป้อน WasteReductionSimulator
export function buildMonthlySeries(agg) {
  if (!agg || !agg.years || !agg.years.length) return { series: [], startYearBE: null };
  const yearsAsc = [...agg.years].sort((a, b) => a - b);
  const series = [];
  for (const y of yearsAsc) {
    const months = agg.monthlyByYear[String(y)] || new Array(12).fill(0);
    series.push(...months.map((v) => Math.round(v)));
  }
  // ตัดศูนย์ท้ายชุด (เดือนอนาคตของปีล่าสุดที่ยังไม่มีรายงาน)
  while (series.length && series[series.length - 1] === 0) series.pop();
  return { series, startYearBE: yearsAsc[0] };
}

// ---- สร้างสรุประดับจังหวัดสำหรับ Export CSV (จากข้อมูลจริง) ----
export function buildProvinceSummary(agg) {
  const rows = agg.years.map((y) => ({
    label: `ปริมาณขยะมูลฝอยชุมชนทั้งจังหวัด (พ.ศ. ${y})`,
    value: `${Math.round(agg.totalByYear[String(y)]).toLocaleString()} ตัน`,
  }));
  const latest = agg.years[0];
  if (latest && agg.districtsByYear[String(latest)]) {
    for (const d of agg.districtsByYear[String(latest)]) {
      rows.push({ label: `อำเภอ ${d.name} (พ.ศ. ${latest})`, value: `${Math.round(d.tons).toLocaleString()} ตัน` });
    }
  }
  return rows;
}

// ---- โหลดข้อมูลสดจากลิงก์ Google Sheets (auto-connect) ----
export async function loadWasteData() {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const records = toRecords(text);
  if (!records.length) throw new Error('ไม่พบข้อมูลในชีต');
  return aggregate(records);

  /* === (สำรอง) FALLBACK เมื่อ Google Sheets ล่ม — ปัจจุบันปิดไว้ ไม่ทำงาน ===
   * วิธีเปิดใช้งาน:
   *   1) ยกเลิกคอมเมนต์บรรทัด `import BACKUP_CSV ...` ที่ส่วนหัวของไฟล์
   *   2) แทน body ของฟังก์ชันนี้ด้วยรูปแบบ try/catch ด้านล่าง
   *
   * try {
   *   const res = await fetch(CSV_URL);
   *   if (!res.ok) throw new Error(`HTTP ${res.status}`);
   *   const text = await res.text();
   *   const records = toRecords(text);
   *   if (!records.length) throw new Error('ไม่พบข้อมูลในชีต');
   *   return aggregate(records);
   * } catch (err) {
   *   console.warn('[NonD] โหลดจากชีตไม่สำเร็จ ใช้ข้อมูลสำรองจาก src/data2:', err.message);
   *   return aggregate(toRecords(BACKUP_CSV));
   * }
   */
}

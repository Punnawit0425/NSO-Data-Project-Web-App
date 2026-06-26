import React, { useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Sliders, TrendingDown, Leaf, Info, Factory, Calendar } from "lucide-react";

/* ============================================================================
 *  NonD — ตัวจำลองการลดขยะ & คาร์บอนเครดิต (Scenario Simulator)
 * ----------------------------------------------------------------------------
 *
 *  แนวคิด: เราพยากรณ์ "เส้นฐาน" (baseline) จากข้อมูลจริง แล้ว "สมมติ" อัตราการลด
 *  ที่เกิดจากการใช้แพลตฟอร์ม — ค่านี้ไม่ได้เรียนรู้จากข้อมูล แต่เป็นสมมติฐานที่
 *  ปรับได้และควรอ้างอิงเกณฑ์มาตรฐานจริง (ดูหมายเหตุท้ายไฟล์)
 * ========================================================================== */

/* ----------------------------------------------------------------------------
 *  1) ข้อมูลในอดีต (HISTORICAL)
 *  -------------------------------------------------------------------------
 *  ★ ใช้ข้อมูลจริงจาก wasteSheet.js ได้โดยส่งผ่าน prop `historical` + `startYearBE`
 *    (ดู ForecastView.jsx ที่สร้างอนุกรมรายเดือนด้วย buildMonthlySeries())
 *  หากไม่ได้ส่ง prop เข้ามา จะ fallback มาใช้ข้อมูลตัวอย่าง 36 เดือนด้านล่างนี้
 *  (มีแนวโน้มเพิ่มเล็กน้อย + ฤดูกาล) เพื่อให้คอมโพเนนต์ทำงานได้แบบสแตนด์อโลน
 * -------------------------------------------------------------------------- */
const SAMPLE_HISTORICAL = [
  41200, 39800, 44600, 47900, 46100, 43200, 42500, 41800, 40900, 43600, 45200, 49800,
  43100, 41600, 46900, 50100, 48200, 45000, 44100, 43500, 42700, 45600, 47400, 52300,
  45200, 43800, 49100, 52600, 50400, 47100, 46200, 45600, 44700, 47800, 49700, 54900,
];

const SAMPLE_START_YEAR_BE = 2565; // พ.ศ. ของจุดเริ่มข้อมูลตัวอย่าง (มกราคม)
const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

/* ----------------------------------------------------------------------------
 *  2) แกนพยากรณ์ (library-agnostic — ยกออกไปเป็น util ได้)
 * -------------------------------------------------------------------------- */

// แนวโน้มเชิงเส้นด้วยวิธีกำลังสองน้อยที่สุด
function linearTrend(values) {
  const n = values.length;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY);
    den += (i - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: meanY - slope * meanX };
}

// ดัชนีฤดูกาลแบบคูณ (multiplicative), คาบ = 12 เดือน, ปรับให้ค่าเฉลี่ย = 1
function seasonalIndices(values, period = 12) {
  const { slope, intercept } = linearTrend(values);
  const buckets = Array.from({ length: period }, () => []);
  values.forEach((v, i) => {
    const trend = intercept + slope * i;
    if (trend > 0) buckets[i % period].push(v / trend);
  });
  const idx = buckets.map((b) => (b.length ? b.reduce((a, c) => a + c, 0) / b.length : 1));
  const mean = idx.reduce((a, b) => a + b, 0) / period;
  return idx.map((v) => (mean ? v / mean : 1));
}

// พยากรณ์ baseline h เดือนข้างหน้า
function forecastBaseline(values, horizon, period = 12) {
  const { slope, intercept } = linearTrend(values);
  const idx = seasonalIndices(values, period);
  const n = values.length;
  const out = [];
  for (let h = 0; h < horizon; h++) {
    const i = n + h;
    out.push(Math.max(0, (intercept + slope * i) * idx[i % period]));
  }
  return out;
}

// อัตราการลด "ที่มีผลจริง" ณ เดือน m หลังเริ่มใช้ — ค่อย ๆ เพิ่มจนเต็มในช่วงปรับตัว
function effectiveReduction(m, fullRate, rampMonths) {
  if (rampMonths <= 0) return fullRate;
  return fullRate * Math.min(1, (m + 1) / rampMonths);
}

function labelFor(monthIndex, startYearBE) {
  const m = ((monthIndex % 12) + 12) % 12;
  const y = startYearBE + Math.floor(monthIndex / 12);
  return `${THAI_MONTHS[m]} ${y % 100}`;
}

/* ----------------------------------------------------------------------------
 *  3) เกณฑ์มาตรฐาน (ตัวอย่าง — ควรแทนที่ด้วยตัวเลขที่อ้างอิงได้จริง)
 * -------------------------------------------------------------------------- */
const PRESETS = [
  { key: "cons", label: "ระมัดระวัง", rate: 0.1 },
  { key: "mod", label: "ปานกลาง", rate: 0.18 },
  { key: "amb", label: "เชิงรุก", rate: 0.28 },
];

export default function WasteReductionSimulator({ historical, startYearBE, usingLiveData = false }) {
  const [reductionRate, setReductionRate] = useState(0.18); // อัตราการลดเต็มที่
  const [rampMonths, setRampMonths] = useState(12); // ระยะปรับตัว
  const [horizon, setHorizon] = useState(36); // ช่วงพยากรณ์ (เดือน)
  const [emissionFactor, setEmissionFactor] = useState(0.94); // tCO₂e ต่อขยะ 1 ตันที่หลีกเลี่ยง

  // ใช้อนุกรมจริงจากเว็บถ้ามี (ต้องยาวพอจับฤดูกาล) ไม่งั้น fallback เป็นข้อมูลตัวอย่าง
  const series = historical && historical.length >= 12 ? historical : SAMPLE_HISTORICAL;
  const startYear = startYearBE || SAMPLE_START_YEAR_BE;

  const model = useMemo(() => {
    const n = series.length;
    const baseFc = forecastBaseline(series, horizon);

    const rows = [];
    // ส่วนอดีต
    series.forEach((v, i) => {
      rows.push({
        idx: i,
        name: labelFor(i, startYear),
        historical: v,
        baseline: null,
        withPlatform: null,
        withPlatformBase: null,
        avoided: null,
      });
    });
    // จุดเชื่อม (เดือนเริ่มใช้): ให้ทุกเส้นออกจากค่าจริงล่าสุด
    const lastHist = series[n - 1];
    rows[n - 1].baseline = lastHist;
    rows[n - 1].withPlatform = lastHist;
    rows[n - 1].withPlatformBase = lastHist;
    rows[n - 1].avoided = 0;

    // ส่วนพยากรณ์
    let cumAvoided = 0;
    baseFc.forEach((b, h) => {
      const r = effectiveReduction(h, reductionRate, rampMonths);
      const wp = b * (1 - r);
      const avoided = b - wp;
      cumAvoided += avoided;
      rows.push({
        idx: n + h,
        name: labelFor(n + h, startYear),
        historical: null,
        baseline: Math.round(b),
        withPlatform: Math.round(wp),
        withPlatformBase: Math.round(wp), // ขอบล่างของแถบที่แรเงา
        avoided: Math.round(avoided), // ความสูงของแถบ = ขยะที่หลีกเลี่ยงได้
      });
    });

    const finalRate = effectiveReduction(horizon - 1, reductionRate, rampMonths);
    return {
      rows,
      cumAvoided,
      cumCredits: cumAvoided * emissionFactor,
      finalRate,
      launchIdx: n - 1,
    };
  }, [series, startYear, reductionRate, rampMonths, horizon, emissionFactor]);

  const fmt = (x) => Math.round(x).toLocaleString("th-TH");

  return (
    <div className="w-full bg-slate-50 p-5 rounded-2xl text-slate-800">
      {/* หัวข้อ */}
      <div className="flex items-start gap-3 mb-1">
        <div className="mt-0.5 p-2 rounded-xl bg-emerald-100 text-emerald-700">
          <Factory size={20} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            ตัวจำลองการลดขยะ &amp; คาร์บอนเครดิต
          </h2>
          <p className="text-sm text-slate-500">
            พยากรณ์เส้นฐานจากข้อมูลจริง แล้วจำลองผลเมื่อหน่วยงาน/โรงงานใช้แพลตฟอร์ม
          </p>
          <span
            className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
              usingLiveData ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {usingLiveData
              ? `แหล่งข้อมูลเส้นฐาน: Google Sheets (ข้อมูลจริง ${series.length} เดือน)`
              : 'แหล่งข้อมูลเส้นฐาน: ตัวอย่างสาธิต (ยังไม่ได้เชื่อมข้อมูลจริง)'}
          </span>
        </div>
      </div>

      {/* แถบเตือนสมมติฐาน */}
      <div className="flex gap-2 items-start text-[13px] bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 my-4">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          ตัวเลข "การลด" เป็น <b>สมมติฐาน</b> ที่ปรับได้เอง ไม่ได้เรียนรู้จากข้อมูล —
          เพราะยังไม่มีข้อมูลช่วงที่ใช้แพลตฟอร์มจริง ควรตั้งค่าให้อ้างอิงเกณฑ์มาตรฐานจริง
          ส่วน <b>เส้นฐาน</b> มาจากข้อมูลในอดีต (แนวโน้ม + ฤดูกาล)
        </span>
      </div>

      {/* การ์ดสรุป */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <SummaryCard
          icon={<TrendingDown size={18} />}
          tone="emerald"
          label={`ขยะที่หลีกเลี่ยงได้สะสม (${horizon} เดือน)`}
          value={`${fmt(model.cumAvoided)} ตัน`}
        />
        <SummaryCard
          icon={<Leaf size={18} />}
          tone="teal"
          label="คาร์บอนเครดิตสะสม (ประเมิน)"
          value={`${fmt(model.cumCredits)} tCO₂e`}
        />
        <SummaryCard
          icon={<Calendar size={18} />}
          tone="slate"
          label="อัตราการลด ณ สิ้นช่วง"
          value={`${(model.finalRate * 100).toFixed(0)}%`}
        />
      </div>

      {/* กราฟ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={model.rows} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            {/* แสดงป้ายแกน X ทุก ๆ 6 เดือน (interval={5} = ข้าม 5 เดือนระหว่างป้าย) */}
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              interval={5}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              width={38}
            />
            <Tooltip
              formatter={(v, n) => [v == null ? "—" : `${fmt(v)} ตัน`, n]}
              labelStyle={{ color: "#475569" }}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />

            {/* แถบแรเงา = ขยะที่หลีกเลี่ยงได้ (วางบนเส้น withPlatform จนถึง baseline) */}
            <Area
              dataKey="withPlatformBase"
              stackId="band"
              stroke="none"
              fill="transparent"
              legendType="none"
              name="ฐานแถบ"
            />
            <Area
              dataKey="avoided"
              stackId="band"
              stroke="none"
              fill="#34d399"
              fillOpacity={0.28}
              name="ขยะที่หลีกเลี่ยงได้"
            />

            <Line
              dataKey="historical"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
              connectNulls
              name="ข้อมูลจริง"
            />
            <Line
              dataKey="baseline"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              connectNulls
              name="เส้นฐาน (ไม่ใช้แพลตฟอร์ม)"
            />
            <Line
              dataKey="withPlatform"
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
              connectNulls
              name="เมื่อใช้แพลตฟอร์ม"
            />

            <ReferenceLine
              x={model.rows[model.launchIdx]?.name}
              stroke="#0ea5e9"
              strokeDasharray="4 4"
              label={{ value: "เริ่มใช้", position: "top", fill: "#0ea5e9", fontSize: 11 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ตัวควบคุม */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4 text-slate-700">
          <Sliders size={16} />
          <span className="font-medium text-sm">ปรับสมมติฐาน</span>
        </div>

        {/* presets */}
        <div className="flex flex-wrap gap-2 mb-5">
          {PRESETS.map((p) => {
            const active = Math.abs(p.rate - reductionRate) < 0.001;
            return (
              <button
                key={p.key}
                onClick={() => setReductionRate(p.rate)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  active
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"
                }`}
              >
                {p.label} · {(p.rate * 100).toFixed(0)}%
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <Control
            label="อัตราการลดขยะที่คาดหวัง (เต็มที่)"
            value={`${(reductionRate * 100).toFixed(0)}%`}
          >
            <input
              type="range"
              min={0}
              max={0.4}
              step={0.01}
              value={reductionRate}
              onChange={(e) => setReductionRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </Control>

          <Control label="ระยะเวลาปรับตัวจนเต็มที่ (เดือน)" value={`${rampMonths} เดือน`}>
            <input
              type="range"
              min={0}
              max={36}
              step={1}
              value={rampMonths}
              onChange={(e) => setRampMonths(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600"
            />
          </Control>

          <Control label="ช่วงเวลาพยากรณ์ (เดือน)" value={`${horizon} เดือน`}>
            <input
              type="range"
              min={12}
              max={60}
              step={6}
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600"
            />
          </Control>

          <Control
            label="ตัวคูณคาร์บอน (tCO₂e ต่อขยะ 1 ตัน)"
            value={emissionFactor.toFixed(2)}
          >
            <input
              type="range"
              min={0.2}
              max={1.6}
              step={0.02}
              value={emissionFactor}
              onChange={(e) => setEmissionFactor(parseFloat(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </Control>
        </div>
      </div>
    </div>
  );
}

/* ---------- ชิ้นส่วน UI เล็ก ๆ ---------- */
function SummaryCard({ icon, label, value, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    teal: "bg-teal-50 text-teal-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${tones[tone]}`}>{icon}</div>
      <div className="text-xs text-slate-500 mb-1 leading-snug">{label}</div>
      <div className="text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Control({ label, value, children }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-emerald-700 tabular-nums">{value}</span>
      </div>
      {children}
    </div>
  );
}

/* ============================================================================
 *  หมายเหตุการต่อยอด
 * ----------------------------------------------------------------------------
 *  • แทน HISTORICAL ด้วยอนุกรมเวลารายเดือนจริงจาก wasteSheet.js
 *    (loadWasteData() → สร้าง array ของตันรายเดือน เรียงตามเวลา)
 *  • reductionRate / emissionFactor ควรอ้างอิงงานวิจัยหรือโครงการนำร่องจริง
 *    เช่น อัตราการคัดแยกต้นทาง (source separation) ในเมืองที่เทียบเคียงได้
 *  • เมื่อมี "ข้อมูลช่วงนำร่อง" จริง (เขตที่ใช้ vs ไม่ใช้แพลตฟอร์ม)
 *    สามารถเปลี่ยนจากสมมติฐานเป็นการประเมินผลแบบ difference-in-differences ได้
 * ========================================================================== */
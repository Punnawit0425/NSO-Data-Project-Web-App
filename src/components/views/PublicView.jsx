import { useState, useEffect, useMemo } from 'react';
import Icon from '../Icon.jsx';
import { useApp } from '../../appContext.js';
import { THAI_MONTHS, buildMonthlySeries } from '../../services/wasteSheet.js';
import WasteReductionSimulator from '../../model.jsx';

const fmt = (n) => Math.round(n).toLocaleString();

// สร้าง path เส้นกราฟจากชุดตัวเลขรายเดือน (12 ค่า) โดยสเกลตาม domain [min, max]
// (ซูมเข้า: ไม่เริ่มจาก 0) และ "เว้นช่วง" เดือนที่ยังไม่มีข้อมูล (ค่า <= 0) ออกจากเส้น
function linePath(values, min, max) {
  const range = max - min;
  if (range <= 0) return '';
  let started = false;
  const cmds = [];
  values.forEach((v, i) => {
    if (!(v > 0)) {
      started = false; // ขาดช่วง: เริ่มลากเส้นใหม่เมื่อเจอข้อมูลอีกครั้ง
      return;
    }
    const x = 3 + (i / 11) * 94;
    const y = 38 - ((v - min) / range) * 34;
    cmds.push(`${started ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`);
    started = true;
  });
  return cmds.join(' ');
}

export default function PublicView() {
  const { waste, wasteStatus, switchRole, exportData, showToast } = useApp();
  const ready = wasteStatus === 'ready' && waste;

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('all');

  // อนุกรมรายเดือนจริง (ต่อเนื่องทุกปี) สำหรับป้อนตัวจำลองพยากรณ์ที่ย้ายมาจากเซกชัน 6
  const { series: monthlySeries, startYearBE } = useMemo(
    () => (ready ? buildMonthlySeries(waste) : { series: [], startYearBE: null }),
    [ready, waste],
  );
  const usingLiveData = ready && monthlySeries.length >= 12;

  // ตั้งค่าปีเริ่มต้นเป็นปีล่าสุดเมื่อข้อมูลพร้อม
  useEffect(() => {
    if (ready && !year) setYear(String(waste.years[0]));
  }, [ready, waste, year]);

  // ---- คำนวณค่าจากข้อมูลจริง ----
  let view = null;
  if (ready && year) {
    const monthly = waste.monthlyByYear[year] || new Array(12).fill(0);
    const prevKey = String(Number(year) - 1);
    const prevMonthly = waste.monthlyByYear[prevKey];
    const yearTotal = waste.totalByYear[year] || 0;
    const prevTotal = waste.totalByYear[prevKey];
    const monthsWithData = monthly.filter((v) => v > 0).length || 12;

    // การ์ดใบแรกขึ้นกับตัวกรองเดือน
    const selectedValue = month === 'all' ? yearTotal : monthly[Number(month) - 1] || 0;
    const prevValue = month === 'all' ? prevTotal : prevMonthly ? prevMonthly[Number(month) - 1] : undefined;
    const yoy = prevValue ? ((selectedValue - prevValue) / prevValue) * 100 : null;

    const peakIdx = monthly.reduce((best, v, i, a) => (v > a[best] ? i : best), 0);
    const districts = waste.districtsByYear[year] || [];
    const maxDistrict = districts.length ? districts[0].tons : 0;

    // โดเมนแกน Y แบบ "ซูมเข้า": คิดจากเฉพาะเดือนที่มีข้อมูลจริง (>0) ของปีนี้และปีก่อน
    // เพื่อให้เห็นความผันผวนรายเดือนชัดเจน (ไม่บีบให้เริ่มจาก 0)
    const domainValues = [...monthly, ...(prevMonthly || [])].filter((v) => v > 0);
    const rawMin = domainValues.length ? Math.min(...domainValues) : 0;
    const rawMax = domainValues.length ? Math.max(...domainValues) : 0;
    const pad = (rawMax - rawMin) * 0.08 || rawMax * 0.05; // เผื่อขอบบน/ล่าง และกันกรณี min==max
    const chartMin = Math.max(0, Math.floor(rawMin - pad));
    const chartMax = Math.ceil(rawMax + pad) || 1;

    view = {
      monthly,
      prevMonthly,
      prevKey,
      yearTotal,
      monthsWithData,
      selectedValue,
      yoy,
      peakIdx,
      peakValue: monthly[peakIdx],
      districts,
      maxDistrict,
      chartMin,
      chartMax,
      laoCount: waste.laoCountByYear[year] || 0,
      districtCount: districts.length,
    };
  }

  return (
    <section className="space-y-8">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
          <Icon name="globe" className="w-96 h-96" />
        </div>
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Icon name="sparkles" className="w-3.5 h-3.5" /> นวัตกรรมนนทบุรีคาร์บอนต่ำ
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            ร่วมสร้าง<span className="text-emerald-300">นนทบุรีเมืองน่าอยู่ </span>
            <br /> สิ่งแวดล้อมดี 
            <br className="hidden md:block" /> เริ่มต้นที่{' '}
            <span className="/40 text-white">NonD</span>
          </h2>
          <div className="flex items-center gap-2.5 text-emerald-200/90 text-sm md:text-base font-semibold tracking-wide">
            <span className="h-px w-8 bg-emerald-300/60"></span>
            นนท์น่าอยู่ · สิ่งแวดล้อมดี · NonD
          </div>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            ยกระดับการจัดการขยะต้นทางด้วยระบบฐานข้อมูลอัจฉริยะ เปลี่ยนขยะรีไซเคิลสู่งบประมาณหมุนเวียนและคาร์บอนเครดิต
            เพื่อขับเคลื่อนนนทบุรีสู่เมืองคาร์บอนต่ำและลดการฝังกลบอย่างยั่งยืน
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => switchRole('municipality')}
              className="bg-white text-emerald-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm text-sm"
            >
              <Icon name="log-in" className="w-4 h-4" /> เข้าสู่ระบบ · ลงชื่อเข้าใช้
            </button>
            <a
              href="#demo-dashboard"
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm border border-emerald-600/50"
            >
              ดูข้อมูลภาพรวม
            </a>
            {/* ลิงก์ไปหน้าจำลอง LINE OA (โฟลเดอร์ line-oa-ui) */}
            <a
              href="line-oa-ui/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm flex items-center gap-2 shadow-sm hover:opacity-90"
              style={{ backgroundColor: '#06C755' }}
            >
              <svg width="18" height="18" viewBox="0 0 52 52" fill="none" aria-hidden="true">
                <rect width="52" height="52" rx="14" fill="white" />
                <path d="M43.5 24.3C43.5 16.1 35.7 9.4 26 9.4C16.3 9.4 8.5 16.1 8.5 24.3C8.5 31.6 14.9 37.7 23.4 38.9C24 39 24.9 39.3 25.1 39.8C25.3 40.3 25.2 41 25.1 41.5L24.7 43.8C24.6 44.3 24.3 45.6 26 44.9C27.7 44.2 35.5 39.3 38.9 35.4C41.3 32.8 43.5 28.8 43.5 24.3Z" fill="#06C755" />
              </svg>
              เปิดหน้า LINE OA (ตัวอย่าง)
            </a>
          </div>
        </div>
      </div>

      {/* Features & Showcases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
          <div className="bg-teal-50 p-3.5 rounded-xl text-teal-600 h-fit">
            <Icon name="recycle" className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-800">เปลี่ยนขยะเป็นสวัสดิการนนท์</h3>
            <p className="text-slate-500 text-sm leading-relaxed">ขยะแห้งจากชุมชน 60% ปันผลคืนเพื่อช่วยลดค่าส่วนกลางของบ้านเรือน และอีก 40% นำไปใช้ในกองทุนหมุนเวียนบริหารจัดการและพัฒนาสิ่งแวดล้อมจังหวัด</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600 h-fit">
            <Icon name="shield-check" className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-800">คาร์บอนเครดิตชาวนนทบุรี</h3>
            <p className="text-slate-500 text-sm leading-relaxed">คำนวณและสะสมคาร์บอนเครดิตจากกิจกรรมการรีไซเคิลขยะแห้งและขยะอุตสาหกรรมอย่างเป็นระบบตามมาตรฐาน T-VER</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
          <div className="bg-indigo-50 p-3.5 rounded-xl text-indigo-600 h-fit">
            <Icon name="factory" className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-800">เชื่อมโยงอุตสาหกรรมในพื้นที่</h3>
            <p className="text-slate-500 text-sm leading-relaxed">สนับสนุนโรงงานต้นทางในนนทบุรีจัดทำรายงานความยั่งยืนประจำปี (ESG) และร่วมพัฒนาการลดการปล่อยก๊าซเรือนกระจกในห่วงโซ่คุณค่า Scope 3</p>
          </div>
        </div>
      </div>

      {/* Interactive Public Dashboard — ขับเคลื่อนด้วยข้อมูลจริงจาก Google Sheets */}
      <div id="demo-dashboard" className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Icon name="layout-dashboard" className="text-emerald-600 w-5 h-5" />
              แดชบอร์ดสถิติขยะมูลฝอยชุมชนจังหวัดนนทบุรี (NonD Public Dashboard)
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              ข้อมูลจริงเชื่อมตรงจาก Google Sheets
              {wasteStatus === 'loading' && <span className="text-amber-600 font-medium">· กำลังเชื่อมต่อ...</span>}
              {wasteStatus === 'ready' && <span className="text-emerald-600 font-medium">· เชื่อมต่อแล้ว</span>}
              {wasteStatus === 'error' && <span className="text-rose-600 font-medium">· เชื่อมต่อไม่สำเร็จ</span>}
            </p>
          </div>
          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={!ready}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 disabled:opacity-50"
            >
              {ready ? (
                waste.years.map((y) => (
                  <option key={y} value={String(y)}>พ.ศ. {y}</option>
                ))
              ) : (
                <option>—</option>
              )}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={!ready}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 disabled:opacity-50"
            >
              <option value="all">ทุกเดือน (สะสมทั้งปี)</option>
              {THAI_MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <button
              onClick={() => exportData('NonD-Public-Waste-Data')}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Icon name="download" className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        {wasteStatus === 'error' ? (
          <div className="p-10 text-center space-y-2">
            <Icon name="alert-circle" className="w-10 h-10 text-rose-400 inline-block" />
            <p className="text-sm font-semibold text-slate-700">ไม่สามารถเชื่อมต่อข้อมูลจาก Google Sheets ได้</p>
            <p className="text-xs text-slate-400">โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือสิทธิ์การเผยแพร่ของชีต แล้วรีเฟรชอีกครั้ง</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Key Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-emerald-800 font-medium block">
                    ปริมาณขยะมูลฝอยชุมชน {month === 'all' ? '(รวมทั้งปี)' : `(${THAI_MONTHS[Number(month) - 1]})`}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-900">{view ? `${fmt(view.selectedValue)} ตัน` : '—'}</span>
                    {view && view.yoy != null && (
                      <span className={`text-[10px] font-bold px-1 rounded ${view.yoy <= 0 ? 'text-emerald-600 bg-emerald-100/60' : 'text-rose-600 bg-rose-100/60'}`}>
                        {view.yoy > 0 ? '+' : ''}{view.yoy.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-600 block">*เทียบกับ พ.ศ. {view ? view.prevKey : '—'}</span>
                </div>
                <div className="p-3 bg-emerald-500 text-white rounded-xl">
                  <Icon name="trash-2" className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-teal-800 font-medium block">ค่าเฉลี่ยต่อเดือน (ทั้งปี)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-teal-900">{view ? `${fmt(view.yearTotal / view.monthsWithData)} ตัน` : '—'}</span>
                  </div>
                  <span className="text-[10px] text-teal-600 block">จากข้อมูล {view ? view.monthsWithData : 0} เดือน</span>
                </div>
                <div className="p-3 bg-teal-500 text-white rounded-xl">
                  <Icon name="line-chart" className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-blue-800 font-medium block">เดือนที่มีปริมาณสูงสุด</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-900">{view ? THAI_MONTHS[view.peakIdx] : '—'}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 block">{view ? `${fmt(view.peakValue)} ตัน` : ''}</span>
                </div>
                <div className="p-3 bg-blue-500 text-white rounded-xl">
                  <Icon name="trending-up" className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-indigo-800 font-medium block">อปท. ที่รายงานข้อมูล</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-indigo-900">{view ? `${view.laoCount} แห่ง` : '—'}</span>
                  </div>
                  <span className="text-[10px] text-indigo-600 block">ครอบคลุม {view ? view.districtCount : 0} อำเภอในจังหวัดนนทบุรี</span>
                </div>
                <div className="p-3 bg-indigo-500 text-white rounded-xl">
                  <Icon name="building" className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Trend + District breakdown */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-1.5">
                    <Icon name="line-chart" className="text-emerald-600 w-4 h-4" />
                    แนวโน้มปริมาณขยะมูลฝอยชุมชนรายเดือน (Monthly Waste Trend)
                  </h4>
                  <p className="text-xs text-slate-500">เปรียบเทียบรายเดือนของ พ.ศ. {year || '—'} กับปีก่อนหน้า · หน่วย: ตัน</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="w-3.5 h-1.5 bg-emerald-600 rounded-sm"></span> พ.ศ. {year || '—'}</span>
                  <span className="flex items-center gap-1.5"><span className="w-3.5 h-1.5 bg-slate-300 rounded-sm"></span> พ.ศ. {view ? view.prevKey : '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-1">
                  <span className="text-xs font-bold text-slate-500">กราฟเส้นปริมาณขยะรายเดือน (ตัน) · สเกลซูม (ไม่เริ่มจาก 0)</span>
                  <div className="pt-4 h-48 relative border-b border-slate-200">
                    <div className="absolute left-0 right-0 top-0 border-t border-slate-100 text-[9px] text-slate-400 pt-1">
                      {view ? `${fmt(view.chartMax)} ตัน` : ''}
                    </div>
                    <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100 text-[9px] text-slate-400 pt-1">
                      {view ? `${fmt((view.chartMin + view.chartMax) / 2)} ตัน` : ''}
                    </div>
                    <div className="absolute left-0 right-0 bottom-1 text-[9px] text-slate-400">
                      {view ? `${fmt(view.chartMin)} ตัน` : '0 ตัน'}
                    </div>

                    <svg className="w-full h-36 mt-4" viewBox="0 0 100 40" preserveAspectRatio="none">
                      {view && view.prevMonthly && (
                        <path d={linePath(view.prevMonthly, view.chartMin, view.chartMax)} fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      )}
                      {view && (
                        <>
                          <path d={linePath(view.monthly, view.chartMin, view.chartMax)} fill="none" stroke="#059669" strokeWidth="2" />
                          {view.monthly.map((v, i) =>
                            v > 0 ? (
                              <circle
                                key={i}
                                cx={3 + (i / 11) * 94}
                                cy={38 - ((v - view.chartMin) / (view.chartMax - view.chartMin)) * 34}
                                r="1.2"
                                fill="#059669"
                              />
                            ) : null,
                          )}
                        </>
                      )}
                    </svg>
                    <div className="flex justify-between px-1 text-[9px] font-medium text-slate-500 mt-1">
                      <span>ม.ค.</span>
                      <span>เม.ย.</span>
                      <span>ก.ค.</span>
                      <span>ต.ค.</span>
                      <span>ธ.ค.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">อำเภอที่มีปริมาณขยะสูงสุด</h5>
                  {view && view.districts.slice(0, 4).map((d) => (
                    <div key={d.name} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">{d.name}</span>
                        <span className="font-bold text-emerald-700">{fmt(d.tons)} ตัน</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${view.maxDistrict ? (d.tons / view.maxDistrict) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {!view && <p className="text-xs text-slate-400">กำลังโหลดข้อมูล...</p>}
                </div>
              </div>
            </div>

            {/* ===== ตัวจำลองพยากรณ์การลดขยะ & คาร์บอนเครดิต (ย้ายมาจากเซกชัน 6 เดิม) =====
             *  วางต่อจากกราฟ "แนวโน้มปริมาณขยะมูลฝอยชุมชนรายเดือน" ทันที
             *  ป้อนอนุกรมรายเดือนจริงจาก Google Sheets ให้ตัวจำลอง (src/model.jsx)
             *  หากข้อมูลจริงไม่พอ ตัวจำลองจะ fallback ไปใช้ข้อมูลตัวอย่างเอง */}
            <WasteReductionSimulator
              historical={usingLiveData ? monthlySeries : undefined}
              startYearBE={usingLiveData ? startYearBE : undefined}
              usingLiveData={usingLiveData}
            />
          </div>
        )}
      </div>

      {/* Login Portal Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">เข้าสู่ระบบการจัดการหลังบ้าน NonD</h3>
            <p className="text-sm text-slate-500 mt-1">กรุณาเลือกบทบาทของท่านเพื่อเข้าจัดทำข้อมูลขยะ ประชาสัมพันธ์ และตรวจสอบคาร์บอนเครดิต</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => switchRole('municipality')}
              className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Icon name="building" className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block text-sm">เจ้าหน้าที่เทศบาลเมืองนนทบุรี</span>
                  <span className="text-xs text-slate-400">นายกเทศมนตรี / เจ้าหน้าที่ดูแลสิ่งแวดล้อมและขยะ</span>
                </div>
              </div>
              <Icon name="chevron-right" className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </button>
            <button
              onClick={() => switchRole('village')}
              className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-700 p-2.5 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Icon name="home" className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block text-sm">นิติบุคคลหมู่บ้านในนนทบุรี</span>
                  <span className="text-xs text-slate-400">จัดการคัดแยกขยะครัวเรือนนนท์ และดูแลปันผลส่วนกลาง</span>
                </div>
              </div>
              <Icon name="chevron-right" className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </button>
            <button
              onClick={() => switchRole('factory')}
              className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 text-teal-700 p-2.5 rounded-lg group-hover:bg-teal-500 group-hover:text-white transition-all">
                  <Icon name="factory" className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block text-sm">โรงงานอุตสาหกรรมในจังหวัด</span>
                  <span className="text-xs text-slate-400">บันทึกน้ำหนักทิ้ง รับสิทธิ์รายงาน ESG คาร์บอน Scope 3</span>
                </div>
              </div>
              <Icon name="chevron-right" className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
        {/* ช่องทางติดต่อทาง LINE Official (ข้อมูลสมมุติเพื่อการสาธิต) */}
        <div className="p-8 flex flex-col justify-between border-l border-emerald-200 relative overflow-hidden text-white" style={{ backgroundColor: '#06C755' }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md">
              <svg width="14" height="14" viewBox="0 0 52 52" fill="none" aria-hidden="true">
                <rect width="52" height="52" rx="14" fill="white" />
                <path d="M43.5 24.3C43.5 16.1 35.7 9.4 26 9.4C16.3 9.4 8.5 16.1 8.5 24.3C8.5 31.6 14.9 37.7 23.4 38.9C24 39 24.9 39.3 25.1 39.8C25.3 40.3 25.2 41 25.1 41.5L24.7 43.8C24.6 44.3 24.3 45.6 26 44.9C27.7 44.2 35.5 39.3 38.9 35.4C41.3 32.8 43.5 28.8 43.5 24.3Z" fill="#06C755" />
              </svg>
              ช่องทางติดต่อทางไลน์
            </span>
            <h4 className="text-xl font-bold">ปรึกษา / สอบถามผ่าน LINE Official</h4>
            <p className="text-sm text-white/90 leading-relaxed">
              มีคำถามเรื่องการคัดแยกขยะ คาร์บอนเครดิต หรืออยากเริ่มโครงการในชุมชนของท่าน?
              ทักหาทีมงาน NonD นนทบุรีได้โดยตรงผ่าน LINE Official Account ตอบกลับทุกวัน 08:00–18:00 น.
            </p>
            <div className="bg-white/15 rounded-xl p-3 flex items-center gap-3">
              <div className="bg-white text-[#06C755] w-12 h-12 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0">QR</div>
              <div>
                <span className="block text-[11px] text-white/80">LINE ID อย่างเป็นทางการ (สมมุติ)</span>
                <span className="block text-lg font-bold tracking-wide">@nond-nonthaburi</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-8">
            <a
              href="line-oa-ui/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white text-[#06C755] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 52 52" fill="none" aria-hidden="true">
                <rect width="52" height="52" rx="14" fill="#06C755" />
                <path d="M43.5 24.3C43.5 16.1 35.7 9.4 26 9.4C16.3 9.4 8.5 16.1 8.5 24.3C8.5 31.6 14.9 37.7 23.4 38.9C24 39 24.9 39.3 25.1 39.8C25.3 40.3 25.2 41 25.1 41.5L24.7 43.8C24.6 44.3 24.3 45.6 26 44.9C27.7 44.2 35.5 39.3 38.9 35.4C41.3 32.8 43.5 28.8 43.5 24.3Z" fill="white" />
              </svg>
              เพิ่มเพื่อน / เปิดแชต LINE
            </a>
          </div>
        </div>
      </div>

      {/* Contact us & Footer */}
      <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h4 className="text-white font-bold text-lg">ติดต่อทีมงาน NonD เพื่อเริ่มโครงการในเขตเทศบาลนนทบุรีของท่าน</h4>
          <p className="text-xs text-slate-400">ฝ่ายประสานงานส่งเสริมสิ่งแวดล้อมกองสาธารณสุขและเทคโนโลยีสารสนเทศ จังหวัดนนทบุรี</p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <span className="flex items-center gap-1.5"><Icon name="phone" className="w-4 h-4 text-emerald-500" /> โทร: 02-123-4567</span>
            <span className="flex items-center gap-1.5"><Icon name="mail" className="w-4 h-4 text-emerald-500" /> อีเมล: support@nond-lowcarbon.go.th</span>
            <span className="flex items-center gap-1.5"><Icon name="map-pin" className="w-4 h-4 text-emerald-500" /> ศูนย์ศาลากลางจังหวัดนนทบุรี ถนนรัตนาธิเบศร์</span>
          </div>
        </div>
        <div className="flex-shrink-0 bg-slate-800 p-4 rounded-xl border border-slate-700 w-full md:w-auto max-w-sm">
          <span className="text-xs font-bold text-emerald-400 block mb-2">ส่งคำขอหรือสอบถามนโยบาย</span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="เบอร์โทรหรืออีเมลผู้แทนชุมชน"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 flex-grow"
            />
            <button
              onClick={() => showToast('ส่งคำขอประสานงานเรียบร้อย! เจ้าหน้าที่ประจำจังหวัดนนทบุรีจะติดต่อกลับโดยเร็วที่สุด')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-all"
            >
              ส่ง
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

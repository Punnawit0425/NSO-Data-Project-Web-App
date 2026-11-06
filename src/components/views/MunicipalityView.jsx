import { useState } from 'react';
import Icon from '../Icon.jsx';
import { useApp } from '../../appContext.js';

const SUB_TABS = [
  { id: 'main', icon: 'home', label: 'หน้าหลัก (ภาพรวมเทศบาลนนทบุรี)' },
  { id: 'factory', icon: 'factory', label: 'แท็บโรงงาน (ข้อมูลอุตสาหกรรม)' },
  { id: 'community', icon: 'users', label: 'แท็บหมู่บ้าน (ข้อมูลครัวเรือน)' },
  { id: 'waste', icon: 'table-properties', label: 'แท็บข้อมูลขยะ (แยกประเภท & ตีราคา)' },
];

const ACTIVE_SUB = 'muni-sub-btn px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-emerald-600 text-white shadow-sm';
const INACTIVE_SUB = 'muni-sub-btn px-4 py-2 rounded-lg text-sm font-semibold transition-all text-slate-600 hover:bg-slate-100';

export default function MunicipalityView() {
  const { data, exportData, approveFactory, factoryApproved, runAI } = useApp();
  const [subTab, setSubTab] = useState('main');
  const [villageFilter, setVillageFilter] = useState('a');

  const v = data.villages[villageFilter] || data.villages.c;

  return (
    <section className="space-y-6">
      {/* Tab Navigation for Municipality */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-4">
        <div className="flex gap-2">
          {SUB_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setSubTab(tab.id)} className={subTab === tab.id ? ACTIVE_SUB : INACTIVE_SUB}>
              <Icon name={tab.icon} className="w-4 h-4 inline-block mr-1" /> {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            ระบบจัดการ: เทศบาลนครนนทบุรี (นายกเทศมนตรี เข้าระบบ)
          </span>
          <button
            onClick={() => exportData('NonD-Municipality-Report')}
            className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Icon name="download" className="w-3.5 h-3.5" /> Export ทั้งหมด
          </button>
        </div>
      </div>

      {subTab === 'main' && <MuniMain runAI={runAI} approveFactory={approveFactory} />}
      {subTab === 'factory' && <MuniFactory exportData={exportData} factoryApproved={factoryApproved} />}
      {subTab === 'waste' && <MuniWaste />}
      {subTab === 'community' && (
        <MuniCommunity v={v} villages={data.villages} villageFilter={villageFilter} setVillageFilter={setVillageFilter} exportData={exportData} />
      )}
    </section>
  );
}

/* ---------------- SUB-TAB: MAIN ---------------- */
function MuniMain({ runAI, approveFactory }) {
  const { showToast } = useApp();
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">ปริมาณขยะแห้งสะสมรวม (ทุกหมู่บ้าน+โรงงาน)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">21,754 <span className="text-sm font-normal text-slate-500">ตัน</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">-30.6%</span>
            </div>
            <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
              <Icon name="arrow-down-right" className="w-3.5 h-3.5" /> -30.6% เทียบกับปี 2566 (ขยะลดลง = ดี)
            </span>
          </div>
          <div className="absolute right-4 top-4 bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
            <Icon name="recycle" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">อัตราขยะปนเปื้อนเฉลี่ยจังหวัดนนท์</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600">4.2%</span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">-1.2%</span>
            </div>
            <span className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
              <Icon name="alert-triangle" className="w-3.5 h-3.5" /> *สูงผิดปกติในเขตหมู่บ้าน B ด่วน!
            </span>
          </div>
          <div className="absolute right-4 top-4 bg-rose-50 text-rose-600 p-2.5 rounded-xl">
            <Icon name="alert-circle" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">คาร์บอนเครดิตสะสมที่สร้างได้</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">4,351 <span className="text-sm font-normal text-slate-500">tCO2e</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">-30.6%</span>
            </div>
            <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
              <Icon name="check-circle" className="w-3.5 h-3.5" /> รอ อบก. รับรอง 500 tCO2e
            </span>
          </div>
          <div className="absolute right-4 top-4 bg-teal-50 text-teal-600 p-2.5 rounded-xl">
            <Icon name="leaf" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">มูลค่ากองทุนหมุนเวียนจังหวัดนนท์ (ส่วน 40%)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">78,314,400 <span className="text-sm font-normal text-slate-500">บาท</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">-30.6%</span>
            </div>
            <span className="text-xs text-slate-500 block mt-1">จากเงินสะสมกองทุนทั้งหมด 195,786,000 บาท</span>
          </div>
          <div className="absolute right-4 top-4 bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
            <Icon name="wallet" className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* AI INSIGHTS & POLICY ADVISOR */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-6 rounded-2xl text-white shadow-md border border-emerald-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md">วิเคราะห์นนทบุรี</span>
            <h4 className="font-bold text-lg flex items-center gap-1.5 text-emerald-300">✨ NonD AI - ผู้ช่วยวิเคราะห์นโยบายขยะจังหวัดนนทบุรีคาร์บอนต่ำ</h4>
          </div>
          <p className="text-xs text-emerald-100 max-w-3xl leading-relaxed">
            ระบบจะส่งข้อมูลเชิงพื้นที่ ขยะรีไซเคิล 21,754 ตัน (3.8% ของขยะชุมชนรวม 579,563 ตัน) จากฐานข้อมูล 47 อปท. ในเขตนนทบุรี ให้แก่ Gemini 2.5-Flash เพื่อประมวลผลกลยุทธ์ และเขียนแผนนโยบายเพิ่มอัตราการรีไซเคิลของจังหวัดให้แก่ท่านแบบเรียลไทม์
          </p>
        </div>
        <button
          onClick={() => runAI('muniPolicy')}
          className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all flex-shrink-0 shadow-sm"
        >
          <Icon name="sparkles" className="w-4 h-4 text-emerald-600" /> ✨ ร่างนโยบายและนวัตกรรมนนทบุรีคาร์บอนต่ำ
        </button>
      </div>

      {/* Actionable Alerts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
            ระบบแจ้งเตือนและข้อเรียกร้องเร่งด่วนประจำจังหวัด (NonD Actionable Alerts)
          </h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">ล่าสุดวันนี้</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3">
            <div className="bg-amber-100 text-amber-800 p-2 rounded-lg h-fit">
              <Icon name="alert-triangle" className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-800 block">แจ้งเตือนขยะปนเปื้อน</span>
              <p className="text-xs text-amber-900 leading-normal">หมู่บ้าน B นนท์วิลล์ มีอัตราขยะปนเปื้อนติดต่อกัน 3 วัน (ตรวจพบขยะอินทรีย์ปะปนในถุงขาวขุ่นคัดแยก)</p>
              <button
                onClick={() => showToast('แจ้งไปยังนิติหมู่บ้าน B จังหวัดนนทบุรี เรียบร้อยแล้ว!')}
                className="text-xs font-semibold text-amber-900 underline hover:text-amber-950 mt-1.5 block"
              >
                ส่งหนังสือตักเตือนนิติหมู่บ้าน B
              </button>
            </div>
          </div>

          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex gap-3">
            <div className="bg-rose-100 text-rose-800 p-2 rounded-lg h-fit">
              <Icon name="truck" className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-800 block">รถขนส่งนนทบุรีใกล้เต็มความจุ</span>
              <p className="text-xs text-rose-900 leading-normal">รถเก็บขยะประเภทแห้ง ทะเบียน นน-1234 ใกล้พิกัดจำกัด (น้ำหนักปัจจุบัน 950 กก.)</p>
              <button
                onClick={() => showToast('ส่งสัญญาณวิทยุเรียกคนขับรถขนส่งนนท์เข้าศูนย์หลักเรียบร้อย')}
                className="text-xs font-semibold text-rose-900 underline hover:text-rose-950 mt-1.5 block"
              >
                แจ้งรถเลี่ยงไปจุดถ่ายโอนขยะ
              </button>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex gap-3">
            <div className="bg-indigo-100 text-indigo-800 p-2 rounded-lg h-fit">
              <Icon name="file-check-2" className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-800 block">รอรับรองรายงานความยั่งยืน</span>
              <p className="text-xs text-indigo-900 leading-normal">โรงงานประกอบชิ้นส่วนไม้ (โรงงาน B) ได้ยื่นแบบตรวจสอบน้ำหนักขยะเพื่อขอใบรับรองความรับผิดชอบ ESG ประจำเดือน</p>
              <button
                onClick={() => approveFactory('C')}
                className="text-xs font-semibold text-indigo-900 underline hover:text-indigo-950 mt-1.5 block"
              >
                คลิกตรวจสอบและกดยืนยัน
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base">ปริมาณขยะสะสมที่ถูกส่งเข้าระบบรีไซเคิล (Recycling Yield over Time)</h4>
              <p className="text-xs text-slate-500">แสดงผลของการปรับปรุงกระบวนการและจำนวนผู้เข้าร่วมโครงการที่เพิ่มขึ้นในรอบ 4 เดือน</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">หน่วย: ตัน (ข้อมูลปี 2567)</span>
          </div>

          <div className="pt-4 pb-2 h-56 relative">
            <div className="absolute left-0 right-0 top-0 border-t border-slate-100 text-[10px] text-slate-400 pt-1">8,000 ตัน</div>
            <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100 text-[10px] text-slate-400 pt-1">4,000 ตัน</div>
            <div className="absolute left-0 right-0 bottom-6 border-b border-slate-200 text-[10px] text-slate-400 pb-1">0 ตัน</div>

            <svg className="w-full h-44 mt-4" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="muni-grad-recycled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M5 35 Q 35 28 65 18 T 95 6" fill="none" stroke="#059669" strokeWidth="2.5" />
              <path d="M5 35 Q 35 28 65 18 T 95 6 L 95 40 L 5 40 Z" fill="url(#muni-grad-recycled)" />
              <circle cx="5" cy="35" r="1.5" fill="#059669" />
              <circle cx="35" cy="28" r="1.5" fill="#059669" />
              <circle cx="65" cy="18" r="1.5" fill="#059669" />
              <circle cx="95" cy="6" r="2" fill="#059669" stroke="#ffffff" strokeWidth="0.5" />
            </svg>

            <div className="flex justify-between px-2 text-[10px] font-medium text-slate-500 mt-2">
              <span className="w-12 text-center">มกราคม</span>
              <span className="w-12 text-center">กุมภาพันธ์</span>
              <span className="w-12 text-center">มีนาคม</span>
              <span className="w-12 text-center">เมษายน</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base">สถิติเปรียบเทียบอัตราขยะปนเปื้อน (Contamination Rate)</h4>
              <p className="text-xs text-slate-500">มุ่งเน้นเพื่อกระตุ้นและตรวจสอบความถูกต้องของคุณภาพคัดแยกรายชุมชน</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">อัตราปนเปื้อน (%)</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-extrabold">A</span>
                  หมู่บ้านแสนสุขนนท์ A (เกณฑ์ดีเยี่ยม)
                </span>
                <span className="font-extrabold text-emerald-600">1.8%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-[10px] font-extrabold">C</span>
                  หมู่บ้านร่มรื่นนนทบุรี C (ผ่านเกณฑ์)
                </span>
                <span className="font-extrabold text-slate-700">3.5%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-extrabold">B</span>
                  หมู่บ้านนนท์วิลล์ B (เตือน! ต้องปรับปรุง)
                </span>
                <span className="font-extrabold text-rose-600">7.8%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SUB-TAB: FACTORY ---------------- */
function MuniFactory({ exportData, factoryApproved }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Icon name="bar-chart-3" className="w-72 h-72" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">รายงานขยะภาคอุตสาหกรรมนนทบุรีรายปี (Annual ESG Report)</span>
            <h3 className="text-xl font-bold">ข้อมูลสถิติตรวจสอบของภาคโรงงานอุตสาหกรรมในสังกัดเทศบาลนนท์</h3>
            <p className="text-xs text-slate-400 mt-1">ใช้สำหรับการส่งรายงานความยั่งยืนของสถานประกอบการและโรงงาน (ESG และ Carbon Footprint) ประจำปี</p>
          </div>
          <button
            onClick={() => exportData('NonD-Municipal-Annual-Factory-Report')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Icon name="download" className="w-3.5 h-3.5" /> Export สรุปขยะอุตสาหกรรมปีนี้
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 relative z-10">
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 block">น้ำหนักขยะที่นำไปใช้ประโยชน์ทั้งหมด (ปี 2567)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold block text-white">1,253 <span className="text-xs font-normal text-slate-400">ตัน / ปี</span></span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded">-61.9%</span>
            </div>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 block">ปริมาณขยะที่นำไปรีไซเคิลสำเร็จ (Recycled)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold block text-emerald-400">1,145 <span className="text-xs font-normal text-slate-400">ตัน / ปี</span></span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded">-61.9%</span>
            </div>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 block">ปริมาณก๊าซเรือนกระจกที่ลดได้</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold block text-sky-400">229 <span className="text-xs font-normal text-slate-400">ตัน CO2e</span></span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded">-61.9%</span>
            </div>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 block">คาร์บอนเครดิตสะสมที่ได้รับการรับรอง</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold block text-amber-400">229 <span className="text-xs font-normal text-slate-400">ตัน CO2e</span></span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded">-61.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carbon credit benefit allocation table — new 40:40:20 structure
       *  (source 40% / sponsor 40% / municipality 20%) based on nond_charge-keeper.html
       *  Keeps the old behavior: Factory C's status is tied to factoryApproved (the approve button on the main page)
       *
       *  ตารางจัดสรรผลประโยชน์คาร์บอนเครดิต — โครงสร้างใหม่ 40:40:20
       *  (ต้นทาง 40% / ผู้สนับสนุน 40% / เทศบาล 20%) อ้างอิงจาก nond_charge-keeper.html
       *  คงพฤติกรรมเดิม: สถานะของโรงงาน C ผูกกับ factoryApproved (ปุ่มอนุมัติในหน้าหลัก) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
              ตารางจัดสรรผลประโยชน์คาร์บอนเครดิตแยกรายโรงงาน
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">อัปเดตสัดส่วนใหม่</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">ตรวจสอบและควบคุมการจัดสรรเครดิตตามโครงสร้างใหม่ (40:40:20)</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
            <Icon name="pie-chart" className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-slate-600 font-medium">สัดส่วนปัจจุบัน:</span>
            <div className="flex gap-1.5 text-xs font-bold">
              <span className="text-indigo-600">ต้นทาง 40%</span> <span className="text-slate-300">|</span>
              <span className="text-amber-600">ผู้สนับสนุน 40%</span> <span className="text-slate-300">|</span>
              <span className="text-emerald-700">เทศบาล 20%</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 min-w-[200px]">ชื่อโรงงานต้นทาง</th>
                <th className="p-4 text-right whitespace-nowrap">ขยะรวม (กก.)</th>
                <th className="p-4 text-right text-emerald-700 font-extrabold whitespace-nowrap">เครดิตทั้งหมด (tCO2e)</th>
                <th className="p-4 text-right text-indigo-700 whitespace-nowrap bg-indigo-50/50">สัดส่วนโรงงานต้นทาง<br /><span className="text-xs text-indigo-500 font-normal">(40%)</span></th>
                <th className="p-4 text-right text-amber-700 whitespace-nowrap bg-amber-50/50">สัดส่วนผู้สนับสนุน<br /><span className="text-xs text-amber-500 font-normal">(40%)</span></th>
                <th className="p-4 text-right text-emerald-700 whitespace-nowrap bg-emerald-50/50">ถือครองโดยเทศบาล<br /><span className="text-xs text-emerald-500 font-normal">(20%)</span></th>
                <th className="p-4 text-center whitespace-nowrap">สถานะการจัดสรร</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {/* Factory A — total credits 2.40: 40%=0.96, 40%=0.96, 20%=0.48 — โรงงาน A — เครดิตรวม 2.40: 40%=0.96, 40%=0.96, 20%=0.48 */}
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">
                  โรงงานอุตสาหกรรมเหล็กพรีเมียร์ (โรงงาน A)
                  <span className="block font-normal text-slate-400 mt-1">บรรจุภัณฑ์โลหะ</span>
                </td>
                <td className="p-4 text-right font-medium text-slate-600">12,000</td>
                <td className="p-4 text-right text-emerald-600 font-bold bg-slate-50/50">2.40</td>
                <td className="p-4 text-right text-indigo-700 font-bold bg-indigo-50/20">0.96 ตัน</td>
                <td className="p-4 text-right text-amber-700 font-bold bg-amber-50/20">0.96 ตัน</td>
                <td className="p-4 text-right text-emerald-700 font-bold bg-emerald-50/20">0.48 ตัน</td>
                <td className="p-4 text-center">
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold">จัดสรรเสร็จสมบูรณ์</span>
                </td>
              </tr>
              {/* Factory B — total credits 1.90: 40%=0.76, 40%=0.76, 20%=0.38 — โรงงาน B — เครดิตรวม 1.90: 40%=0.76, 40%=0.76, 20%=0.38 */}
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">
                  โรงงานประกอบชิ้นส่วนไม้แปรรูป (โรงงาน B)
                  <span className="block font-normal text-slate-400 mt-1">ไม้และเฟอร์นิเจอร์</span>
                </td>
                <td className="p-4 text-right font-medium text-slate-600">9,500</td>
                <td className="p-4 text-right text-emerald-600 font-bold bg-slate-50/50">1.90</td>
                <td className="p-4 text-right text-indigo-700 font-bold bg-indigo-50/20">0.76 ตัน</td>
                <td className="p-4 text-right text-amber-700 font-bold bg-amber-50/20">0.76 ตัน</td>
                <td className="p-4 text-right text-emerald-700 font-bold bg-emerald-50/20">0.38 ตัน</td>
                <td className="p-4 text-center">
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold">จัดสรรเสร็จสมบูรณ์</span>
                </td>
              </tr>
              {/* Factory C — total credits 1.40: 40%=0.56, 40%=0.56, 20%=0.28 (status tied to factoryApproved) — โรงงาน C — เครดิตรวม 1.40: 40%=0.56, 40%=0.56, 20%=0.28 (สถานะผูกกับ factoryApproved) */}
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">
                  โรงงานผลิตพาเลทพลาสติกยูเนี่ยน (โรงงาน C)
                  <span className="block font-normal text-slate-400 mt-1">เม็ดพลาสติกรีไซเคิล</span>
                </td>
                <td className="p-4 text-right font-medium text-slate-600">7,000</td>
                <td className="p-4 text-right text-emerald-600 font-bold bg-slate-50/50">1.40</td>
                <td className="p-4 text-right text-indigo-700 font-bold bg-indigo-50/20">0.56 ตัน</td>
                <td className="p-4 text-right text-amber-700 font-bold bg-amber-50/20">0.56 ตัน</td>
                <td className="p-4 text-right text-emerald-700 font-bold bg-emerald-50/20">0.28 ตัน</td>
                <td className="p-4 text-center">
                  {factoryApproved ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold">จัดสรรเสร็จสมบูรณ์</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold">รอการรับรอง</span>
                  )}
                </td>
              </tr>
              {/* Summary row — total credits 5.70: 40%=2.28, 40%=2.28, 20%=1.14 — แถวสรุป — รวมเครดิต 5.70: 40%=2.28, 40%=2.28, 20%=1.14 */}
              <tr className="bg-slate-100/50 font-bold border-t-2 border-slate-200">
                <td className="p-4 text-slate-700" colSpan={2}>รวมเครดิตสะสมในระบบ (เฉพาะรอบนี้)</td>
                <td className="p-4 text-right text-emerald-700">5.70 ตัน</td>
                <td className="p-4 text-right text-indigo-700 bg-indigo-50/30">2.28 ตัน</td>
                <td className="p-4 text-right text-amber-700 bg-amber-50/30">2.28 ตัน</td>
                <td className="p-4 text-right text-emerald-700 bg-emerald-50/30">1.14 ตัน</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SUB-TAB: WASTE ---------------- */
function MuniWaste() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              <Icon name="scan-barcode" className="text-emerald-600 w-5 h-5" />
              ข้อมูลแยกแยะขยะรายประเภทและการประเมินมูลค่า (NonD Recyclables Valuation)
            </h4>
            <p className="text-xs text-slate-500">ข้อมูลประเภทขยะที่เก็บกู้กลับคืนมาได้ ราคารับซื้อของตลาด B2B และมูลค่ารวมที่แปลงสภาพกลับคืนมาเป็นเงินทุน</p>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold">อิงตามดัชนีราคารับซื้อสัปดาห์นี้</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <span className="text-xs text-slate-500 block font-semibold">พลาสติกใส/PE</span>
            <span className="text-xl font-bold text-emerald-800">14,771 ตัน</span>
            <span className="text-[10px] text-slate-400 block mt-1">ราคารับซื้อ: 12 บาท / กก.</span>
          </div>
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
            <span className="text-xs text-slate-500 block font-semibold">เศษกระดาษ/กล่อง</span>
            <span className="text-xl font-bold text-amber-800">3,981 ตัน</span>
            <span className="text-[10px] text-slate-400 block mt-1">ราคารับซื้อ: 5 บาท / กก.</span>
          </div>
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <span className="text-xs text-slate-500 block font-semibold">โลหะ/อลูมิเนียม</span>
            <span className="text-xl font-bold text-indigo-800">718 ตัน</span>
            <span className="text-[10px] text-slate-400 block mt-1">ราคารับซื้อ: 35 บาท / กก.</span>
          </div>
          <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100">
            <span className="text-xs text-slate-500 block font-semibold">เศษไม้/วัสดุธรรมชาติ</span>
            <span className="text-xl font-bold text-sky-800">457 ตัน</span>
            <span className="text-[10px] text-slate-400 block mt-1">ราคารับซื้อ: 3 บาท / กก.</span>
          </div>
        </div>

        <div className="border border-slate-100 rounded-xl overflow-hidden mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-100">
                <th className="p-4">ประเภทขยะที่ NonD จัดเก็บสำเร็จ</th>
                <th className="p-4 text-right">ปริมาณรวม (ตัน)</th>
                <th className="p-4 text-right">ราคาตลาด (บาท/กก.)</th>
                <th className="p-4 text-right">แปลงสภาพเป็นเงินขายได้รวม</th>
                <th className="p-4 text-center">คาร์บอนเครดิตเฉลี่ย (ตัน CO2e)</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80">
                <td className="p-4 font-semibold text-slate-800">พลาสติกขวดใส (PET) และพลาสติกแปรรูป</td>
                <td className="p-4 text-right">14,771</td>
                <td className="p-4 text-right">12.00</td>
                <td className="p-4 text-right font-bold text-slate-800">177,252,000 บาท</td>
                <td className="p-4 text-center text-emerald-600 font-bold">2,954.2</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="p-4 font-semibold text-slate-800">กระดาษ ลังกระดาษ และบรรจุภัณฑ์กระดาษ</td>
                <td className="p-4 text-right">3,981</td>
                <td className="p-4 text-right">5.00</td>
                <td className="p-4 text-right font-bold text-slate-800">19,905,000 บาท</td>
                <td className="p-4 text-center text-emerald-600 font-bold">597.2</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="p-4 font-semibold text-slate-800">โลหะ อลูมิเนียมกระป๋อง และเศษเหล็กเบา</td>
                <td className="p-4 text-right">718</td>
                <td className="p-4 text-right">35.00</td>
                <td className="p-4 text-right font-bold text-slate-800">25,130,000 บาท</td>
                <td className="p-4 text-center text-emerald-600 font-bold">646.2</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="p-4 font-semibold text-slate-800">เศษไม้ พาเลทไม้ และวัสดุอินทรีย์ป่าไม้</td>
                <td className="p-4 text-right">457</td>
                <td className="p-4 text-right">3.00</td>
                <td className="p-4 text-right font-bold text-slate-800">1,371,000 บาท</td>
                <td className="p-4 text-center text-emerald-600 font-bold">41.1</td>
              </tr>
              <tr className="bg-emerald-50 text-emerald-950 font-bold border-t border-emerald-100">
                <td className="p-4">รวมมูลค่าหมุนเวียนจังหวัดนนทบุรีสะสม</td>
                <td className="p-4 text-right">19,927</td>
                <td className="p-4 text-right">-</td>
                <td className="p-4 text-right text-lg text-emerald-700">223,658,000 บาท</td>
                <td className="p-4 text-center text-lg text-emerald-700">4,238.7 tCO2e</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SUB-TAB: COMMUNITY ---------------- */
function MuniCommunity({ v, villages, villageFilter, setVillageFilter, exportData }) {
  // ----- Prepare Pie chart data: the 60% dividend returned to villages, split by village -----
  // ----- เตรียมข้อมูล Pie chart: สัดส่วนเงินปันผล 60% คืนหมู่บ้าน แบ่งตามหมู่บ้าน -----
  const toNum = (s) => Number(String(s).replace(/[^\d.]/g, '')) || 0;
  const PIE_COLORS = { a: '#6366f1', b: '#f59e0b', c: '#10b981' };
  const PIE_NAMES = { a: 'แสนสุขนนท์ A', b: 'นนท์วิลล์ B', c: 'ร่มรื่นนนทบุรี C' };
  const shareEntries = Object.entries(villages || {}).map(([id, vv]) => ({
    id,
    name: PIE_NAMES[id] || id,
    color: PIE_COLORS[id] || '#94a3b8',
    value: toNum(vv.share),
  }));
  const shareTotal = shareEntries.reduce((sum, s) => sum + s.value, 0) || 1;
  let pieAcc = 0; // cumulative percent, used as each slice's start point (starting at 12 o'clock) — เปอร์เซ็นต์สะสม เพื่อกำหนดจุดเริ่มของแต่ละชิ้น (เริ่มที่ 12 นาฬิกา)
  const pieSlices = shareEntries.map((s) => {
    const pct = (s.value / shareTotal) * 100;
    const slice = { ...s, pct, offset: 25 - pieAcc };
    pieAcc += pct;
    return slice;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Icon name="line-chart" className="text-emerald-600 w-5 h-5" />
            สถิติการจัดเก็บขยะและการรีไซเคิลชุมชนนนทบุรีสะสมรวม
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">ปริมาณขยะรีไซเคิลที่เก็บได้รวม (ทั้งจังหวัด)</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold block text-slate-800">21,754 <span className="text-xs font-normal text-slate-400">ตัน</span></span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1 rounded">-30.6%</span>
              </div>
            </div>
            <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-100">
              <span className="text-xs text-rose-800 block">ปริมาณขยะติดเชื้อที่จัดการถูกต้อง</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold block text-rose-600">1,545 <span className="text-xs font-normal text-slate-400">ตัน</span></span>
                <span className="text-xs text-rose-600 font-semibold bg-rose-100 px-1 rounded">-7.1%</span>
              </div>
              <span className="text-[10px] text-rose-500 block">*ลดลงจาก 1,662 ตัน ในปี 2566</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Icon name="piggy-bank" className="text-emerald-600 w-5 h-5" />
            สรุปสัดส่วนรายได้กองทุนหมุนเวียนจังหวัดนนท์ (Financial Hub)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">รายได้รวมขาย B2B</span>
              <span className="text-base font-bold text-slate-800 block">195,786,000 บาท</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-[10px] text-emerald-800 block">กองทุนหมุนเวียน (40%)</span>
              <span className="text-base font-bold text-emerald-700 block">78,314,400 บาท</span>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-[10px] text-indigo-800 block">ปันผลคืนชุมชน (60%)</span>
              <span className="text-base font-bold text-indigo-700 block">117,471,600 บาท</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">*ส่วนแบ่งตามข้อตกลงเทศบาลและนิติบุคคลเพื่อรณรงค์ลูกบ้านแยกขยะแห้งให้ได้ประสิทธิภาพสูงสุด</p>
        </div>
      </div>

      {/* Pie chart: share of the dividend returned to villages (60%), split by village — Pie chart: สัดส่วนเงินปันผลคืนหมู่บ้าน (60%) แบ่งตามหมู่บ้าน */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
            <Icon name="pie-chart" className="text-emerald-600 w-5 h-5" />
            สัดส่วนเงินปันผลคืนหมู่บ้าน (60%) แบ่งตามหมู่บ้าน
          </h4>
          <p className="text-xs text-slate-500 mt-1">เปรียบเทียบยอดเงินส่วนแบ่งสะสมที่แต่ละหมู่บ้านได้รับจากการคัดแยกขยะแห้ง</p>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          {/* Donut chart — โดนัทชาร์ต */}
          <div className="relative w-44 h-44 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              {pieSlices.map((s) => (
                <circle
                  key={s.id}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="4"
                  pathLength="100"
                  strokeDasharray={`${s.pct} ${100 - s.pct}`}
                  strokeDashoffset={s.offset}
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-medium">รวมทั้งหมด</span>
              <span className="text-base font-extrabold text-slate-800">{shareTotal.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">บาท</span>
            </div>
          </div>

          {/* Compact legend — numbers sit next to the names instead of being pushed to the far right — Legend แบบกระชับ — ตัวเลขอยู่ชิดชื่อ ไม่ถูกดันไปขวาสุด */}
          <div className="w-full lg:w-auto space-y-2.5">
            {pieSlices.map((s) => (
              <div key={s.id} className="flex items-center gap-2.5 text-xs">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }}></span>
                <span className="font-semibold text-slate-700">หมู่บ้าน{s.name}</span>
                <span className="font-bold text-slate-800">{s.value.toLocaleString()} บาท</span>
                <span className="text-[11px] text-slate-400">({s.pct.toFixed(1)}%)</span>
              </div>
            ))}
          </div>

          {/* Visualization filling the empty right side — horizontal bar chart comparing shares — Visualization เติมพื้นที่ว่างฝั่งขวา — กราฟแท่งแนวนอนเปรียบเทียบสัดส่วน */}
          <div className="flex-1 w-full space-y-3 lg:border-l lg:border-slate-100 lg:pl-8">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              เปรียบเทียบสัดส่วนรายหมู่บ้าน
            </span>
            {pieSlices.map((s) => (
              <div key={s.id} className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-600">หมู่บ้าน{s.name}</span>
                  <span className="font-extrabold" style={{ color: s.color }}>{s.pct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-bold text-slate-800 text-base">ตรวจสอบผลงานเฉพาะเจาะจงรายหมู่บ้าน (Village Filters)</h4>
            <p className="text-xs text-slate-500">เลือกหมู่บ้านที่สังกัดเทศบาลเพื่อตรวจสอบความคืบหน้าแบบเฉพาะเจาะจง</p>
          </div>
          <div className="flex gap-2">
            <select
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
            >
              <option value="a">หมู่บ้านแสนสุขนนท์ A</option>
              <option value="b">หมู่บ้านนนท์วิลล์ B</option>
              <option value="c">หมู่บ้านร่มรื่นนนทบุรี C</option>
            </select>
            <button
              onClick={() => exportData('NonD-Municipal-Community-Specific-Report')}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Icon name="download" className="w-3.5 h-3.5" /> Export เฉพาะหมู่บ้าน
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">สมาชิกที่เข้าร่วม</span>
            <span className="text-xl font-bold text-slate-800">{v.members}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">อัตราความร่วมมือ (Cooperation)</span>
            <span className={`text-xl font-bold text-${v.coopColor}-600`}>{v.coop}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">ขยะแห้งที่คัดแยกได้</span>
            <span className="text-xl font-bold text-slate-800">{v.waste}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">ยอดเงินขายขยะสะสม</span>
            <span className="text-xl font-bold text-slate-800">{v.income}</span>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1 col-span-2 md:col-span-1">
            <span className="text-[11px] text-indigo-500 block font-bold">ส่วนแบ่ง 60% คืนหมู่บ้าน</span>
            <span className="text-xl font-bold text-indigo-700">{v.share}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

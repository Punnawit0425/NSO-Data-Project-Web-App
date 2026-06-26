import { useMemo, useState } from 'react';
import Icon from '../Icon.jsx';
import { useApp } from '../../appContext.js';
import { PENALTY_RATE_PER_KG } from '../../data/nondData.js';

// หมู่บ้านที่นิติบุคคลนี้ดูแล (สอดคล้องกับ header "แสนสุขนนท์ A")
const MANAGED_VILLAGE = 'a';

export default function VillageView() {
  const { exportData, runAI, showToast, collections } = useApp();

  // ฟีเจอร์ใหม่: บันทึกขยะรายบ้านที่ "ซิงค์" มาจากพนักงานเก็บขยะ (เฉพาะหมู่บ้านนี้)
  const houseRecords = useMemo(
    () => collections.filter((r) => r.village === MANAGED_VILLAGE),
    [collections],
  );
  // ติดตามบ้านที่ออกใบแจ้งหนี้ค่าปรับแล้ว (ภายในเซสชัน)
  const [issued, setIssued] = useState(() => new Set());

  const issuePenalty = (houseId, amount) => {
    setIssued((prev) => new Set(prev).add(houseId));
    showToast(`ส่งใบแจ้งหนี้ค่าปรับขยะเสีย ${amount.toFixed(2)} บาท ไปยังบ้านเลขที่ ${houseId} เรียบร้อยแล้ว`);
  };

  return (
    <section className="space-y-6">
      {/* Header Block for Village Profile */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-750 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="bg-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
            <Icon name="shield-check" className="w-3 h-3 inline-block mr-1" /> นิติบุคคลหมู่บ้านจัดสรร (นนทบุรี)
          </span>
          <h2 className="text-2xl font-bold">ยินดีต้อนรับ นิติหมู่บ้านแสนสุขนนท์ A</h2>
          <p className="text-xs text-indigo-100">แผงควบคุมดูแลระบบขยะคัดแยก สิทธิ์คาร์บอน และเงินปันผลลดค่าส่วนกลางสำหรับลูกบ้านนนทบุรี</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-950/80 border border-indigo-700/60 text-white px-3 py-2 rounded-xl font-medium">พื้นที่: โซนนนทบุรีตะวันตก 1</span>
          <button
            onClick={() => exportData('NonD-VillageA-Financial-Report')}
            className="bg-slate-950 hover:bg-slate-900 text-white rounded-lg px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Icon name="download" className="w-3.5 h-3.5" /> Export ข้อมูลสรุปนิติ
          </button>
        </div>
      </div>

      {/* AI PUBLIC RELATIONS & CAMPAIGN COPYWRITER */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-indigo-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md">NonD AI แนะนำ</span>
            <h4 className="font-bold text-lg flex items-center gap-1.5 text-indigo-300">✨ AI ช่วยร่างโพสต์รณรงค์ชุมชนลดขยะปนเปื้อน (NonD AI PR Agent)</h4>
          </div>
          <p className="text-xs text-indigo-100 max-w-3xl leading-relaxed">
            วิเคราะห์ผลงานและปัญหาสิ่งปนเปื้อนในชุมชน เพื่อเขียนประกาศเผยแพร่ลง LINE กลุ่มลูกบ้านหรือประชาสัมพันธ์เสียงตามสาย เพื่อชี้แจงเงินส่วนลดค่าส่วนกลางสะสมที่จะได้สิ้นปี 22,172 บาท
          </p>
        </div>
        <button
          onClick={() => runAI('villageCampaign')}
          className="bg-white hover:bg-indigo-50 text-indigo-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all flex-shrink-0 shadow-sm"
        >
          <Icon name="sparkles" className="w-4 h-4 text-indigo-600" /> ✨ ร่างประกาศรณรงค์ชุมชนนนท์
        </button>
      </div>

      {/* Financial & Reward Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">สะสมเงินปันผลลดค่าส่วนกลาง (60%)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-600">22,172 <span className="text-sm font-normal text-slate-500">บาท</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">+5.3%</span>
            </div>
            <span className="text-xs text-slate-400 block mt-1">จะถูกจัดสรรเพื่อหักค่าส่วนกลางสิ้นปี 2567</span>
          </div>
          <div className="absolute right-4 top-4 bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
            <Icon name="piggy-bank" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">คิดเป็นส่วนลดเฉลี่ยต่อหลังคาเรือน</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">221 <span className="text-sm font-normal text-slate-500">บาท / บ้าน 1 หลัง</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">+5.3%</span>
            </div>
            <span className="text-xs text-emerald-600 block mt-1">*คำนวณจากสมาชิกผู้ร่วมแยกขยะ 100 หลัง</span>
          </div>
          <div className="absolute right-4 top-4 bg-slate-50 text-slate-600 p-2.5 rounded-xl">
            <Icon name="percent" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">ปริมาณขยะแห้งรีไซเคิลสะสมของหมู่บ้าน</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">4,106 <span className="text-sm font-normal text-slate-500">กิโลกรัม</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">+5.3%</span>
            </div>
            <span className="text-xs text-slate-400 block mt-1">เป้าหมายสะสมปีนี้ของหมู่บ้าน: 5,000 กก.</span>
          </div>
          <div className="absolute right-4 top-4 bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
            <Icon name="recycle" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">คาร์บอนเครดิตที่หมู่บ้านเราช่วยสร้าง</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">0.82 <span className="text-sm font-normal text-slate-500">tCO2e</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">+5.3%</span>
            </div>
            <span className="text-xs text-emerald-500 block mt-1">เป็นสิทธิ์สะสมในการสนับสนุนของชุมชน</span>
          </div>
          <div className="absolute right-4 top-4 bg-teal-50 text-teal-600 p-2.5 rounded-xl">
            <Icon name="leaf" className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Engagement + Municipality alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Icon name="user-check" className="text-indigo-600 w-5 h-5" />
            อัตราความร่วมมือและการมีส่วนร่วมชุมชน (Engagement)
          </h3>
          <p className="text-xs text-slate-500">สถิติสะสมสัปดาห์นี้เพื่อประเมินจุดเด่นและจุดแก้ไขของแต่ละบ้านเรือน</p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>อัตราการเข้าร่วม (Participation Rate)</span>
                <span className="text-indigo-600">85% (85 จาก 100 หลังคาเรือน)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>อัตราขยะปนเปื้อน (ขยะเสียมูลค่า)</span>
                <span className="text-rose-600">1.8% (ต่ำมาก - ยอดเยี่ยม!)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '1.8%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">*หากพบการปนเปื้อนปัดเงินปันผลรายซอย ระบบจะแจ้งเตือนนิติเพื่อกระจายกระบอกเสียงความรู้ทันที</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Icon name="bell" className="text-indigo-600 w-5 h-5" />
            กล่องประกาศแจ้งเตือนด่วนส่งจากเทศบาลนนทบุรี
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-3">
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg flex flex-col items-center justify-center font-bold text-xs">
                <span className="text-[9px] uppercase tracking-wider text-indigo-500 font-medium leading-none">JUL</span>
                <span className="text-sm font-black leading-none mt-1">17</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">ตารางรถขยะเข้าเก็บขยะแห้งนนทบุรี</span>
                <p className="text-xs text-slate-500">วันพุธที่ 17 กรกฎาคม เวลา 09:00 - 11:00 น. ขอความร่วมมือนิติประชาสัมพันธ์ให้ลูกบ้านนำขยะรีไซเคิลตั้งไว้นอกรั้ว</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3">
              <div className="bg-rose-100 text-rose-800 p-1.5 rounded-lg">
                <Icon name="alert-triangle" className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-800">! มีสิ่งปนเปื้อนเศษอาหารในเขตโซน ซอย 3</span>
                <p className="text-xs text-rose-700">ทางรถจัดเก็บตรวจพบถุงพลาสติกปนเศษอาหารเหลวจากซอย 3 รบกวนแจ้งประชาสัมพันธ์เน้นย้ำความก้าวหน้านโยบายแห้งสะอาด</p>
                <button
                  onClick={() => showToast('แจ้งเตือนโซน ซอย 3 ไปยังไลน์กลุ่มหมู่บ้านเรียบร้อย!')}
                  className="text-xs font-bold text-rose-800 underline hover:text-rose-900 mt-1 block"
                >
                  รับทราบ และส่งแจ้งเตือนเข้ากลุ่มหมู่บ้านทันที
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cumulative money line chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-800 text-sm md:text-base">กราฟเส้นจำลอง: สัดส่วนการเปลี่ยนขยะแห้งเป็นเงินปันผลสะสม</h4>
            <p className="text-xs text-slate-500">เปรียบเทียบระหว่างปริมาณเงินปันผลสะสมในปัจจุบัน และเส้นแนวโน้มการเติบโตแบบก้าวกระโดดเมื่ออัตราความร่วมมือเพิ่มขึ้น</p>
          </div>
          <span className="text-xs text-indigo-500 font-semibold bg-indigo-50 px-3 py-1 rounded-full">เป้าสะสมปลายปี: 30,000 บาท</span>
        </div>

        <div className="pt-4 pb-2 h-56 relative">
          <div className="absolute left-0 right-0 top-0 border-t border-slate-100 text-[10px] text-slate-400 pt-1">30,000 บาท</div>
          <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100 text-[10px] text-slate-400 pt-1">15,000 บาท</div>
          <div className="absolute left-0 right-0 bottom-6 border-b border-slate-200 text-[10px] text-slate-400 pb-1">0 บาท</div>

          <svg className="w-full h-44 mt-4" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="village-grad-curr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="village-grad-proj" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M5 36 Q 30 30 60 18 T 95 6" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="1.5, 0.8" />
            <path d="M5 36 Q 30 30 60 18 T 95 6 L 95 40 L 5 40 Z" fill="url(#village-grad-proj)" />
            <circle cx="5" cy="36" r="1" fill="#10b981" />
            <circle cx="35" cy="28" r="1" fill="#10b981" />
            <circle cx="65" cy="18" r="1" fill="#10b981" />
            <circle cx="95" cy="6" r="1.5" fill="#10b981" />

            <path d="M5 36 Q 35 28 65 19 T 95 14" fill="none" stroke="#4f46e5" strokeWidth="2.5" />
            <path d="M5 36 Q 35 28 65 19 T 95 14 L 95 40 L 5 40 Z" fill="url(#village-grad-curr)" />
            <circle cx="5" cy="36" r="1.5" fill="#4f46e5" />
            <circle cx="35" cy="28" r="1.5" fill="#4f46e5" />
            <circle cx="65" cy="19" r="1.5" fill="#4f46e5" />
            <circle cx="95" cy="14" r="2" fill="#4f46e5" stroke="#ffffff" strokeWidth="0.5" />
          </svg>

          <div className="flex justify-between px-4 text-[10px] font-medium text-slate-500 mt-2">
            <span>มกราคม</span>
            <span>กุมภาพันธ์</span>
            <span>มีนาคม</span>
            <span>เมษายน (สะสมปัจจุบัน)</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 pt-1">
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-1.5 bg-indigo-600 rounded-sm"></span> เงินปันผลที่เปลี่ยนสภาพได้จริง (Actual)</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-1.5 border border-dashed border-emerald-500 bg-emerald-100 rounded-sm"></span> ทิศทางเป้าหมายเมื่อร่วมมือ 100% (High Cooperation Projection)</span>
        </div>
      </div>

      {/* ============================================================
       *  ฟีเจอร์ใหม่: ตรวจสอบขยะรายบ้าน + จัดการค่าปรับ "ขยะเสีย"
       *  ข้อมูลซิงค์ตรงจากหน้าพนักงานเก็บขยะ (Collector Terminal)
       * ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Icon name="clipboard-list" className="text-indigo-600 w-5 h-5" />
              ตรวจสอบปริมาณขยะรายบ้านและจัดการค่าปรับขยะเสีย
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              ข้อมูลถูกส่งตรงจากรถเก็บขยะ (ตาชั่งดิจิทัล) เพื่อให้นิติบุคคลเรียกเก็บค่าปรับกรณีคัดแยกผิดพลาด
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">อัตราค่าปรับขยะเสีย:</span>
            <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-bold">
              {PENALTY_RATE_PER_KG} บาท / กก.
            </span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-4 border-b border-slate-200">เลขที่บ้าน</th>
                <th className="p-4 text-right border-b border-slate-200">ขยะเปียก</th>
                <th className="p-4 text-right border-b border-slate-200">ขยะแห้ง (ได้เครดิต)</th>
                <th className="p-4 text-right border-b border-slate-200">ขยะอันตราย</th>
                <th className="p-4 text-right border-b border-slate-200 bg-rose-50 text-rose-700">ขยะเสีย (ถูกตีกลับ)</th>
                <th className="p-4 text-right border-b border-slate-200 bg-rose-50 text-rose-700">ประเมินค่าปรับ (บาท)</th>
                <th className="p-4 text-center border-b border-slate-200">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {houseRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-xs text-slate-400">
                    ยังไม่มีข้อมูลการจัดเก็บที่ซิงค์เข้ามา
                  </td>
                </tr>
              )}
              {houseRecords.map((r) => {
                const isPenalty = r.spoiled > 0;
                const penalty = r.spoiled * PENALTY_RATE_PER_KG;
                const alreadyIssued = issued.has(r.houseId);
                return (
                  <tr
                    key={r.id}
                    className={`transition-colors ${isPenalty ? 'hover:bg-rose-50/30 bg-rose-50/10' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-4 font-semibold text-slate-800">{r.houseId}</td>
                    <td className="p-4 text-right text-slate-600">{r.wet.toFixed(2)} กก.</td>
                    <td className="p-4 text-right text-emerald-600 font-bold">{r.dry.toFixed(2)} กก.</td>
                    <td className="p-4 text-right text-slate-600">{r.hazard.toFixed(2)} กก.</td>
                    <td className={`p-4 text-right font-medium ${isPenalty ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                      {r.spoiled.toFixed(2)} กก.
                    </td>
                    <td className={`p-4 text-right ${isPenalty ? 'text-rose-700 font-extrabold text-base' : 'text-slate-400'}`}>
                      {isPenalty ? penalty.toFixed(2) : '-'}
                    </td>
                    <td className="p-4 text-center">
                      {isPenalty ? (
                        alreadyIssued ? (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold inline-flex items-center justify-center gap-1">
                            <Icon name="check" className="w-3 h-3" /> ออกใบแจ้งหนี้แล้ว
                          </span>
                        ) : (
                          <button
                            onClick={() => issuePenalty(r.houseId, penalty)}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all inline-flex items-center justify-center gap-1 mx-auto"
                          >
                            <Icon name="receipt" className="w-3 h-3" /> ออกใบแจ้งหนี้
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold inline-flex items-center justify-center gap-1">
                          <Icon name="check" className="w-3 h-3" /> คัดแยกดีเยี่ยม
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          * ใบแจ้งหนี้ค่าปรับขยะเสียจะถูกรวมเข้าไปในใบแจ้งหนี้ค่าส่วนกลางประจำเดือนของลูกบ้านแต่ละหลังโดยอัตโนมัติ
        </div>
      </div>
    </section>
  );
}

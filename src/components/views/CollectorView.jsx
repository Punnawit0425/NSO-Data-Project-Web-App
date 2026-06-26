import { useMemo, useRef, useState } from 'react';
import Icon from '../Icon.jsx';
import { useApp } from '../../appContext.js';
import { VILLAGE_OPTIONS, VILLAGE_NAMES, SIMULATED_SCALE_WEIGHTS } from '../../data/nondData.js';

/* ===================================================================
 *  CollectorView — บทบาทที่ 5 "พนักงานเก็บขยะ" (Collector Terminal)
 * ===================================================================
 *  ฟีเจอร์ใหม่ (แรงบันดาลใจจาก nond_charge-keeper.html):
 *  - กรองพื้นที่ปฏิบัติงานตามหมู่บ้าน
 *  - จำลองการเชื่อมต่อตาชั่งดิจิทัล (Bluetooth) เพื่อ "ดึงค่าน้ำหนัก"
 *  - บันทึกขยะแยกประเภทรายบ้าน: เปียก / แห้ง / อันตราย / ขยะเสีย
 *  - บันทึกเข้าคลังกลาง (App state) แล้ว "ซิงค์" ให้นิติบุคคลหมู่บ้านนำไปคิดค่าปรับ
 *
 *  ใช้ state กลางร่วมกัน (collections) ผ่าน useApp() — ข้อมูลที่บันทึกที่นี่
 *  จะปรากฏในตารางค่าปรับของหน้านิติบุคคลหมู่บ้านทันที
 * =================================================================== */

const EMPTY_FORM = { houseId: '', wet: '', dry: '', hazard: '', spoiled: '' };
const fmt = (n) => Number(n || 0).toFixed(2);
// แสดงวันที่ ISO (YYYY-MM-DD) เป็นรูปแบบไทย เช่น 25 มิ.ย. 2569
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CollectorView() {
  const { collections, addCollection, showToast } = useApp();

  const [village, setVillage] = useState('a'); // พื้นที่ปฏิบัติงานที่เลือก
  const [dateFilter, setDateFilter] = useState('all'); // ตัวกรองวันที่ ('all' = ทุกวันที่)
  const [form, setForm] = useState(EMPTY_FORM);
  const scaleCounter = useRef(0); // วนค่าน้ำหนักจำลองจากตาชั่ง

  // บันทึกทั้งหมดของหมู่บ้านที่กำลังปฏิบัติงาน (ก่อนกรองวันที่)
  const villageRows = useMemo(() => collections.filter((r) => r.village === village), [collections, village]);
  // รายการวันที่ที่มีข้อมูล (ใช้สร้างตัวเลือกในตัวกรอง) เรียงล่าสุดก่อน
  const dateOptions = useMemo(() => {
    const set = new Set(villageRows.map((r) => r.date).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [villageRows]);
  // เฉพาะบันทึกที่ผ่านตัวกรองวันที่ (ใหม่อยู่บนสุด)
  const rows = useMemo(
    () => villageRows.filter((r) => dateFilter === 'all' || r.date === dateFilter),
    [villageRows, dateFilter],
  );

  // ยอดรวมของรอบการเก็บนี้ (ตาม footer ในไฟล์อ้างอิง)
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          wet: acc.wet + (r.wet || 0),
          dry: acc.dry + (r.dry || 0),
          hazard: acc.hazard + (r.hazard || 0),
          spoiled: acc.spoiled + (r.spoiled || 0),
        }),
        { wet: 0, dry: 0, hazard: 0, spoiled: 0 },
      ),
    [rows],
  );

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // จำลองดึงค่าน้ำหนักจากตาชั่ง Bluetooth (วนชุดค่าจาก data layer)
  const pullBluetoothWeight = () => {
    const w = SIMULATED_SCALE_WEIGHTS[scaleCounter.current % SIMULATED_SCALE_WEIGHTS.length];
    scaleCounter.current += 1;
    setForm((f) => ({
      ...f,
      wet: w.wet.toFixed(2),
      dry: w.dry.toFixed(2),
      hazard: w.hazard.toFixed(2),
      spoiled: w.spoiled.toFixed(2),
    }));
    showToast('ดึงค่าน้ำหนักจากตาชั่ง Bluetooth สำเร็จ');
  };

  // บันทึกรายการ → ส่งเข้าคลังกลางผ่าน addCollection()
  const saveRecord = () => {
    const houseId = form.houseId.trim();
    if (!houseId) {
      showToast('กรุณาระบุเลขที่บ้านก่อนบันทึก', true);
      return;
    }
    addCollection({
      houseId,
      village,
      wet: parseFloat(form.wet) || 0,
      dry: parseFloat(form.dry) || 0,
      hazard: parseFloat(form.hazard) || 0,
      spoiled: parseFloat(form.spoiled) || 0,
    });
    setForm(EMPTY_FORM);
    showToast('บันทึกข้อมูลและส่งไปยังส่วนกลาง (นิติบุคคลหมู่บ้าน) เรียบร้อย');
  };

  return (
    <section className="space-y-6">
      {/* Header Block for Collector Profile */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="truck" className="w-6 h-6 text-emerald-300" />
            ระบบบันทึกข้อมูลเจ้าหน้าที่ขนขยะมูลฝอย (Collector Terminal)
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            รับข้อมูลจากตาชั่งบลูทูธดิจิทัล และบันทึกปริมาณขยะแยกประเภท รวมถึงขยะสูญเสีย (ขยะเสีย)
          </p>
        </div>
        <div className="bg-emerald-800/80 px-4 py-2 rounded-xl border border-emerald-600 text-right flex-shrink-0">
          <span className="block text-[10px] text-emerald-300 font-bold uppercase">เจ้าหน้าที่ขนขยะมูลฝอยประจำรถ</span>
          <span className="block text-sm font-semibold">นายสมหมาย รักสะอาด</span>
          <span className="block text-xs text-emerald-200">ทะเบียน: นน-9999</span>
        </div>
      </div>

      {/* Filter + Data Input Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Area filter + simulated Bluetooth scale */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-grow">
            <div className="space-y-2 flex-grow">
              <label className="text-sm font-bold text-slate-700 block">กรองพื้นที่ปฏิบัติงาน (เลือกหมู่บ้าน)</label>
              <select
                value={village}
                onChange={(e) => {
                  setVillage(e.target.value);
                  setDateFilter('all'); // รีเซ็ตตัวกรองวันที่เมื่อเปลี่ยนหมู่บ้าน
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              >
                {VILLAGE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:w-56">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Icon name="calendar" className="w-4 h-4 text-emerald-600" /> กรองวันที่
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              >
                <option value="all">ทุกวันที่</option>
                {dateOptions.map((d) => (
                  <option key={d} value={d}>{fmtDate(d)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Simulated Bluetooth Connection */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative">
              <Icon name="bluetooth" className="w-6 h-6 text-blue-500" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></span>
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">สถานะตาชั่งดิจิทัล</span>
              <span className="block text-xs font-semibold text-blue-600">เชื่อมต่อแล้ว (Scale-BT-09)</span>
            </div>
            <button
              onClick={pullBluetoothWeight}
              className="ml-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 transition-all"
            >
              ดึงค่าน้ำหนัก
            </button>
          </div>
        </div>

        {/* Input Form (single house entry) */}
        <div className="p-6 bg-white border-b border-slate-200">
          <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Icon name="plus-circle" className="w-4 h-4 text-emerald-600" />
            เพิ่มรายการเก็บขยะบ้านใหม่
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">เลขที่บ้าน / ID</label>
              <input
                type="text"
                value={form.houseId}
                onChange={(e) => setField('houseId', e.target.value)}
                placeholder="เช่น 12/34"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">ขยะเปียก (กก.)</label>
              <input
                type="number"
                value={form.wet}
                onChange={(e) => setField('wet', e.target.value)}
                placeholder="0.00"
                className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-amber-500 text-amber-900"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">ขยะแห้ง (กก.)</label>
              <input
                type="number"
                value={form.dry}
                onChange={(e) => setField('dry', e.target.value)}
                placeholder="0.00"
                className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-emerald-500 text-emerald-900"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">ขยะอันตราย (กก.)</label>
              <input
                type="number"
                value={form.hazard}
                onChange={(e) => setField('hazard', e.target.value)}
                placeholder="0.00"
                className="w-full bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-rose-500 text-rose-900"
              />
            </div>
            <div className="md:col-span-1">
              <label
                className="text-xs font-bold text-rose-600 mb-1 flex items-center gap-1"
                title="ขยะที่ถูกแยกไม่ดีจนนำไปใช้ประโยชน์ไม่ได้"
              >
                <Icon name="alert-triangle" className="w-3 h-3" /> ขยะเสีย (กก.)
              </label>
              <input
                type="number"
                value={form.spoiled}
                onChange={(e) => setField('spoiled', e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-slate-800"
              />
            </div>
            <div className="md:col-span-1">
              <button
                onClick={saveRecord}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-sm"
              >
                บันทึก
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            * ขยะเสีย: หมายถึงขยะที่ถูกแยกไม่ดี ปะปนกันจนทำให้ไม่สามารถนำกลับมาใช้ประโยชน์ได้ (นิติบุคคลจะนำไปประเมินค่าปรับ)
          </p>
        </div>

        {/* Collection Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3 pl-6 border-b border-slate-200">วันที่</th>
                <th className="p-3 border-b border-slate-200">เวลาที่บันทึก</th>
                <th className="p-3 border-b border-slate-200">เลขที่บ้าน / ID</th>
                <th className="p-3 text-right border-b border-slate-200 bg-amber-50/50">ขยะเปียก (กก.)</th>
                <th className="p-3 text-right border-b border-slate-200 bg-emerald-50/50">ขยะแห้ง (กก.)</th>
                <th className="p-3 text-right border-b border-slate-200 bg-rose-50/50">ขยะอันตราย (กก.)</th>
                <th className="p-3 text-right border-b border-slate-200 bg-slate-200/50 text-slate-700">ขยะเสีย (กก.)</th>
                <th className="p-3 text-center border-b border-slate-200">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-xs text-slate-400">
                    ยังไม่มีรายการเก็บขยะในหมู่บ้านนี้ตามวันที่ที่เลือก — กรอกข้อมูลด้านบนหรือปรับตัวกรองวันที่
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const isPenalty = r.spoiled > 0;
                return (
                  <tr
                    key={r.id}
                    className={`transition-colors ${isPenalty ? 'hover:bg-rose-50/30 bg-rose-50/10' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-3 pl-6 text-xs text-slate-500 whitespace-nowrap">{fmtDate(r.date)}</td>
                    <td className="p-3 text-xs text-slate-500">{r.time}</td>
                    <td className="p-3 font-semibold text-slate-800">{r.houseId}</td>
                    <td className="p-3 text-right text-amber-700 font-medium bg-amber-50/20">{fmt(r.wet)}</td>
                    <td className="p-3 text-right text-emerald-700 font-medium bg-emerald-50/20">{fmt(r.dry)}</td>
                    <td className="p-3 text-right text-rose-700 font-medium bg-rose-50/20">{fmt(r.hazard)}</td>
                    <td className={`p-3 text-right font-bold bg-slate-100/30 ${isPenalty ? 'text-rose-600' : 'text-slate-700'}`}>
                      {fmt(r.spoiled)}
                    </td>
                    <td className="p-3 text-center">
                      {r.synced ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">ซิงค์แล้ว</span>
                      ) : (
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold animate-pulse">รอซิงค์...</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-sm">
              <tr>
                <td colSpan={3} className="p-3 pl-6 text-right text-slate-600">
                  รวมรอบการเก็บนี้ ({VILLAGE_NAMES[village]})
                </td>
                <td className="p-3 text-right text-amber-700">{fmt(totals.wet)}</td>
                <td className="p-3 text-right text-emerald-700">{fmt(totals.dry)}</td>
                <td className="p-3 text-right text-rose-700">{fmt(totals.hazard)}</td>
                <td className="p-3 text-right text-slate-800">{fmt(totals.spoiled)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}

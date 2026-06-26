import { useState } from 'react';
import Icon from '../Icon.jsx';
import { useApp } from '../../appContext.js';

const WASTE_TYPES = [
  { factor: '0.0002', label: 'ขยะพลาสติกรวม (PET/PE)' },
  { factor: '0.00015', label: 'เศษกระดาษ / บรรจุภัณฑ์กระดาษ' },
  { factor: '0.00009', label: 'เศษไม้พาเลท / ท่อนไม้' },
  { factor: '0.0009', label: 'อลูมิเนียม / โลหะแปรรูป' },
  { factor: '0.00005', label: 'แก้ว / บรรจุภัณฑ์ขวดแก้ว' },
];

export default function FactoryView() {
  const { exportData, runAI, showToast, factoryApproved } = useApp();
  const [wasteType, setWasteType] = useState('0.0002');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const factor = parseFloat(wasteType);
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      showToast('กรุณาระบุน้ำหนักให้ถูกต้องก่อนคำนวณ', true);
      return;
    }
    const carbonEst = w * factor;
    const cash = Math.round(w * factor * 700);
    setResult({ carbon: `${carbonEst.toFixed(3)} tCO2e`, cash: `${cash.toLocaleString()} บาท` });
    showToast('คำนวณสิทธิ์คาร์บอนเครดิตเบื้องต้นสัญญากับ อบก. เรียบร้อย!');
  };

  return (
    <section className="space-y-6">
      {/* Header Block for Factory Profile */}
      <div className="bg-gradient-to-r from-teal-900 to-teal-750 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="bg-teal-500/30 text-teal-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
            <Icon name="building" className="w-3 h-3 inline-block mr-1" /> โรงงานอุตสาหกรรมในเครือจังหวัดนนทบุรี
          </span>
          <h2 className="text-2xl font-bold">โรงงานผลิตพาเลทพลาสติกยูเนี่ยน (โรงงาน C)</h2>
          <p className="text-xs text-teal-100">ตรวจสอบและพิจารณาจัดสรรสิทธิ์คาร์บอนเครดิตสะสมเพื่อจัดทำสถิติความยั่งยืนองค์กร (ESG/Carbon Footprint)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-teal-950/80 border border-teal-700/60 text-white px-3 py-2 rounded-xl font-medium">ประเภท: เม็ดพลาสติกรีไซเคิล</span>
          <button
            onClick={() => exportData('NonD-FactoryC-ESG-Carbon-Report')}
            className="bg-slate-950 hover:bg-slate-900 text-white rounded-lg px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Icon name="download" className="w-3.5 h-3.5" /> Export เพื่อรายงาน ESG
          </button>
        </div>
      </div>

      {/* AI ESG & CARBON REPORT WRITER */}
      <div className="bg-gradient-to-r from-teal-900 to-teal-950 p-6 rounded-2xl text-white shadow-md border border-teal-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md">NonD AI วิเคราะห์ความยั่งยืน</span>
            <h4 className="font-bold text-lg flex items-center gap-1.5 text-teal-300">✨ AI ช่วยร่างรายงาน ESG & Carbon Scope 3 (NonD AI ESG Writer)</h4>
          </div>
          <p className="text-xs text-teal-100 max-w-3xl leading-relaxed">
            ดึงข้อมูลเชิงลึกด้านขยะอุตสาหกรรมและก๊าซเรือนกระจกที่ลดลง 14% รวมกับสิทธิ์คาร์บอนสะสม 0.70 ตัน CO2e เพื่อสร้างรายงานความยั่งยืนประจำปีตามมาตรฐานสากล สำหรับนำไปเผยแพร่ในรายงานประจำปีของบริษัท
          </p>
        </div>
        <button
          onClick={() => runAI('factoryESG')}
          className="bg-white hover:bg-teal-50 text-teal-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all flex-shrink-0 shadow-sm"
        >
          <Icon name="sparkles" className="w-4 h-4 text-teal-600" /> ✨ ร่างรายงาน ESG ทันที
        </button>
      </div>

      {/* Carbon Credit & Financial Assets cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">คาร์บอนเครดิตสะสมคงเหลือในบัญชี</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-teal-600">0.70 <span className="text-sm font-normal text-slate-500">tCO2e</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">+10.2%</span>
            </div>
            <span className="text-xs text-slate-400 block mt-1">รอการพิจารณารับรองจาก อบก. ไตรมาส 3</span>
          </div>
          <div className="absolute right-4 top-4 bg-teal-50 text-teal-600 p-2.5 rounded-xl">
            <Icon name="award" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">มูลค่าประเมินของเครดิตในพอร์ตปัจจุบัน</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">4,900 <span className="text-sm font-normal text-slate-500">บาท</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">+10.2%</span>
            </div>
            <span className="text-xs text-teal-600 block mt-1">*อิงจากราคาเฉลี่ย T-VER ปัจจุบัน</span>
          </div>
          <div className="absolute right-4 top-4 bg-slate-50 text-slate-600 p-2.5 rounded-xl">
            <Icon name="coins" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">ปริมาณขยะอุตสาหกรรมที่โรงงานส่งมอบ</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">7,000 <span className="text-sm font-normal text-slate-500">กิโลกรัม</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">+14.3%</span>
            </div>
            <span className="text-xs text-slate-400 block mt-1">ประกอบด้วย พาเลทไม้ชำรุด และเศษพลาสติก</span>
          </div>
          <div className="absolute right-4 top-4 bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
            <Icon name="trash-2" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">อัตราลดการปล่อยก๊าซเรือนกระจกองค์กร</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">14% <span className="text-sm font-normal text-slate-500">(Scope 3)</span></span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-1.5 rounded">+1.5%</span>
            </div>
            <span className="text-xs text-emerald-500 block mt-1">บรรลุค่าเป้าหมายความยั่งยืนเฟสที่ 1</span>
          </div>
          <div className="absolute right-4 top-4 bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
            <Icon name="shield-check" className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Calculator + Certification tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carbon Credit Quick Calculator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Icon name="calculator" className="text-teal-600 w-5 h-5" />
            เครื่องคำนวณคาร์บอนเครดิตเบื้องต้น (Carbon Credit Estimator)
          </h3>
          <p className="text-xs text-slate-500">ทดลองคำนวณสิทธิ์คาร์บอนเครดิตสะสมสัญญากับ อบก. โดยเลือกประเภทขยะและระบุน้ำหนักส่งมอบ</p>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">เลือกประเภทขยะอุตสาหกรรม</label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500"
                >
                  {WASTE_TYPES.map((t) => (
                    <option key={t.factor} value={t.factor}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">ระบุน้ำหนักทิ้งสะสม (กิโลกรัม)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="เช่น 2500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full bg-teal-700 hover:bg-teal-600 text-white rounded-lg py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Icon name="calculator" className="w-4 h-4" /> คำนวณคาร์บอนเครดิต
            </button>

            {result && (
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">สิทธิ์คาร์บอนเครดิตสะสมที่คาดว่าจะได้รับ:</span>
                  <span className="font-bold text-emerald-800 text-sm">{result.carbon}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">มูลค่าสิทธิ์ประเมินทางตลาด (อิงเรต 700 บ./ตัน):</span>
                  <span className="font-bold text-emerald-800 text-sm">{result.cash}</span>
                </div>
                <p className="text-[9px] text-slate-400 text-center leading-relaxed mt-1">*อิงจากปัจจัยค่าการลดมลพิษของประเทศไทยร่วมกับ อบก. ค่าจริงอาจเปลี่ยนแปลงตามเงื่อนไขตรวจสอบหน้างาน</p>
              </div>
            )}
          </div>
        </div>

        {/* Certification Tracking */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Icon name="shield-alert" className="text-teal-600 w-5 h-5" />
            สถานะการรับรองเครดิตจาก อบก. (Certification Tracking)
          </h3>
          <p className="text-xs text-slate-500">ติดตามขั้นตอนการพิจารณาตรวจสอบสิทธิ์และรับรองใบประกาศคาร์บอนเครดิต</p>

          <div className="pt-4 space-y-6">
            <div className="flex items-center justify-between">
              {/* Step 1 — always done */}
              <div className="flex flex-col items-center gap-1 text-center w-1/3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Icon name="check" className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">1. ชั่งน้ำหนักเสร็จสิ้น</span>
              </div>
              {/* Connector 1 */}
              <div className="h-1 bg-emerald-500 flex-grow -mt-4"></div>
              {/* Step 2 */}
              <div className="flex flex-col items-center gap-1 text-center w-1/3">
                {factoryApproved ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    <Icon name="check" className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm animate-pulse">
                    <Icon name="clock" className="w-4 h-4" />
                  </div>
                )}
                <span className="text-[10px] font-bold text-slate-800">2. อยู่ระหว่างการตรวจสอบ</span>
              </div>
              {/* Connector 2 */}
              <div className={`h-1 flex-grow -mt-4 ${factoryApproved ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
              {/* Step 3 */}
              <div className="flex flex-col items-center gap-1 text-center w-1/3">
                {factoryApproved ? (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm animate-pulse">
                    <Icon name="clock" className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs">
                    <Icon name="award" className="w-4 h-4" />
                  </div>
                )}
                <span className={`text-[10px] ${factoryApproved ? 'font-bold text-slate-800' : 'font-medium text-slate-400'}`}>3. รออนุมัติออกประกาศ</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="bg-teal-100 text-teal-800 p-2 rounded-xl">
                <Icon name="calendar" className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 block">คาดว่าจะได้รับเครดิตเข้าบัญชีอย่างเป็นทางการ:</span>
                <span className="text-xs font-bold text-slate-800">ไตรมาสที่ 3 / ปี 2569 (สอดคล้องรอบประเมิน อบก. ประจำปี)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Waste & Credit Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-base">ตารางประวัติและสัดส่วนการส่งมอบขยะ (Waste & Credit Log)</h4>
            <p className="text-xs text-slate-500">บันทึกประวัติการส่งมอบขยะแห้งจากโรงงานเข้าสู่โครงการคาร์บอนเครดิตเทศบาลนนทบุรี</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">แสดงผลย้อนหลังล่าสุด</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">วันที่จัดเก็บ</th>
                <th className="p-4">ประเภทขยะที่โรงงานทิ้ง</th>
                <th className="p-4 text-right">น้ำหนักรวม (กก.)</th>
                <th className="p-4 text-right">อัตราคาร์บอนเครดิตสะสม (tCO2e)</th>
                <th className="p-4 text-right">สัดส่วนโรงงานได้รับ (50%)</th>
                <th className="p-4 text-center">สถานะธุรกรรม</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-4 text-slate-600 font-medium">15 พ.ค. 2569</td>
                <td className="p-4">
                  <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-semibold mr-1">พลาสติก</span>
                  พาเลทพลาสติกชำรุดเกรดอุตสาหกรรม
                </td>
                <td className="p-4 text-right font-bold text-slate-800">3,500</td>
                <td className="p-4 text-right text-emerald-600 font-bold">0.70 ตัน</td>
                <td className="p-4 text-right text-teal-600 font-bold">0.35 ตัน</td>
                <td className="p-4 text-center">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-[10px] font-bold">ชั่งน้ำหนักเสร็จสิ้น</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-4 text-slate-600 font-medium">10 เม.ย. 2569</td>
                <td className="p-4">
                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold mr-1">พาเลทไม้</span>
                  เศษไม้โครงสร้างและพาเลทไม้หัก
                </td>
                <td className="p-4 text-right font-bold text-slate-800">2,500</td>
                <td className="p-4 text-right text-emerald-600 font-bold">0.50 ตัน</td>
                <td className="p-4 text-right text-teal-600 font-bold">0.25 ตัน</td>
                <td className="p-4 text-center">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-[10px] font-bold">ชั่งน้ำหนักเสร็จสิ้น</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-4 text-slate-600 font-medium">12 มี.ค. 2569</td>
                <td className="p-4">
                  <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-semibold mr-1">พลาสติก</span>
                  ฟิล์มยืดและบรรจุภัณฑ์ห่อหุ้มวัตถุดิบ
                </td>
                <td className="p-4 text-right font-bold text-slate-800">1,000</td>
                <td className="p-4 text-right text-emerald-600 font-bold">0.20 ตัน</td>
                <td className="p-4 text-right text-teal-600 font-bold">0.10 ตัน</td>
                <td className="p-4 text-center">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-[10px] font-bold">ชั่งน้ำหนักเสร็จสิ้น</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* T-VER Carbon Market Trend */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
              <Icon name="trending-up" className="text-teal-600 w-5 h-5" />
              ราคาตลาดซื้อขายคาร์บอนเครดิตภายนอกโดยสังเขป (T-VER Carbon Market Trend)
            </h3>
            <p className="text-xs text-slate-500">ข้อมูลเสริมภายนอกเพื่อให้ผู้ประกอบการใช้ประเมินสภาวการณ์ตลาดและเปรียบเทียบราคาเสนอซื้อขายจริง</p>
          </div>
          <span className="bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full text-[10px] font-bold">สถิติเสริมตลาดภายนอก</span>
        </div>

        <div className="relative pt-6 h-48 border-b border-slate-200">
          <div className="absolute left-0 right-0 top-0 border-t border-slate-100 text-[9px] text-slate-400">800 บาท/ตัน</div>
          <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100 text-[9px] text-slate-400">500 บาท/ตัน</div>

          <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M0 45 L15 40 L30 42 L45 35 L60 25 L75 18 L90 20 L100 12" fill="none" stroke="#14b8a6" strokeWidth="2" />
            <path d="M0 45 L15 40 L30 42 L45 35 L60 25 L75 18 L90 20 L100 12 L100 50 L0 50 Z" fill="url(#chart-grad)" />
          </svg>

          <div className="absolute right-4 top-10 bg-slate-900 text-white p-1.5 rounded-lg text-[9px] flex flex-col pointer-events-none shadow-md">
            <span className="font-bold">ราคาตลาดเฉลี่ยล่าสุด</span>
            <span className="text-teal-400 font-extrabold">700 บาท / ตัน CO2e</span>
          </div>
        </div>
      </div>
    </section>
  );
}

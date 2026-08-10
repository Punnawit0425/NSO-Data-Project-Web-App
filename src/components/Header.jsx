import Icon from './Icon.jsx';
import { useApp } from '../appContext.js';

const ROLE_TABS = [
  { id: 'public', label: '1. หน้าหลัก (ยังไม่เข้าระบบ)' },
  { id: 'municipality', label: '2. เทศบาล' },
  { id: 'village', label: '3. นิติหมู่บ้าน' },
  { id: 'factory', label: '4. โรงงานอุตสาหกรรม' },
  // ฟีเจอร์ใหม่ — บทบาทที่ 5 พนักงานเก็บขยะ (Collector Terminal)
  { id: 'collector', label: '5. เจ้าหน้าที่ขนขยะมูลฝอย'},
];

const ACTIVE_BTN = 'role-btn px-3 py-1.5 rounded-lg font-medium transition-all duration-200 bg-emerald-500 text-white shadow-sm';
const INACTIVE_BTN = 'role-btn px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-emerald-300 hover:text-white';
// บทบาทใหม่: ไฮไลต์ด้วยกรอบ + ป้าย NEW เมื่อยังไม่ถูกเลือก (สอดคล้องกับไฟล์อ้างอิง)
const INACTIVE_NEW_BTN =
  'role-btn px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-emerald-300 hover:text-white border border-emerald-500 bg-emerald-800/50';

export default function Header() {
  const { role, switchRole } = useApp();

  return (
    <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-white">
            <Icon name="leaf" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black leading-none tracking-wider text-emerald-300">NonD</h1>
            <span className="text-xs text-emerald-100 font-medium">ระบบจัดการขยะและคาร์บอนเครดิตอัจฉริยะ นนทบุรี</span>
          </div>
        </div>

        {/* Role Switcher (Simulating different users as per requirements) */}
        <div className="flex items-center bg-emerald-950/80 p-1.5 rounded-xl border border-emerald-800 text-xs md:text-sm">
          <span className="px-2 text-emerald-400 font-medium hidden lg:inline">สลับบทบาททดสอบ:</span>
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchRole(tab.id)}
              className={role === tab.id ? ACTIVE_BTN : tab.isNew ? INACTIVE_NEW_BTN : INACTIVE_BTN}
            >
              {tab.label}
              {tab.isNew && (
                <span className="ml-1 text-[9px] font-bold align-top text-emerald-200">NEW</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

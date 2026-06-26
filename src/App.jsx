import { useCallback, useEffect, useRef, useState } from 'react';
import { AppContext, ROLE_NAMES } from './appContext.js';
import { DEFAULT_DATA, INITIAL_COLLECTIONS } from './data/nondData.js';
import { loadWasteData, buildProvinceSummary } from './services/wasteSheet.js';
import { callGemini, AI_PRESETS } from './services/gemini.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import AIModal from './components/AIModal.jsx';
import PublicView from './components/views/PublicView.jsx';
import MunicipalityView from './components/views/MunicipalityView.jsx';
import VillageView from './components/views/VillageView.jsx';
import FactoryView from './components/views/FactoryView.jsx';
import CollectorView from './components/views/CollectorView.jsx';

const VIEWS = {
  public: PublicView,
  municipality: MunicipalityView,
  village: VillageView,
  factory: FactoryView,
  collector: CollectorView, // ฟีเจอร์ใหม่: หน้าพนักงานเก็บขยะ
};

// ตัวนับสำหรับสร้าง id ของบันทึกการจัดเก็บใหม่ (ไม่ชนกับ seed-*)
let collectionSeq = 0;

export default function App() {
  const [role, setRole] = useState('public');
  const [data, setData] = useState(DEFAULT_DATA);
  const [waste, setWaste] = useState(null);
  const [wasteStatus, setWasteStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [factoryApproved, setFactoryApproved] = useState(false);
  // ฟีเจอร์ใหม่: คลังบันทึกการจัดเก็บขยะรายบ้าน (ใช้ร่วมกันระหว่างหน้า Collector และ Village)
  const [collections, setCollections] = useState(INITIAL_COLLECTIONS);
  const [toast, setToast] = useState({ text: '', isWarning: false, visible: false });
  const [aiModal, setAiModal] = useState({ open: false, title: '', loading: false, output: '' });
  const toastTimer = useRef(null);

  // ------------------ Toast Message System ------------------
  const showToast = useCallback((text, isWarning = false) => {
    setToast({ text, isWarning, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 4000);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // ------------------ Role Switching ------------------
  const switchRole = useCallback(
    (nextRole) => {
      setRole(nextRole);
      showToast(`สลับไปที่หน้าแผงควบคุมของ: ${ROLE_NAMES[nextRole] || nextRole}`);
    },
    [showToast],
  );

  // ------------------ Municipality action: approve factory report ------------------
  const approveFactory = useCallback(
    (factoryName) => {
      setFactoryApproved(true);
      showToast(
        `อนุมัติและรับรองความถูกต้องของรายงานสิ่งแวดล้อม โรงงาน ${factoryName} สำเร็จ! โอนสิทธิ์สัดส่วนคาร์บอน 50% เรียบร้อย`,
      );
    },
    [showToast],
  );

  // ------------------ Collector action: add a per-house collection record ------------------
  // เพิ่มบันทึกการจัดเก็บใหม่ลงในคลังกลาง (สถานะ synced=false ก่อน แล้วค่อย "ซิงค์")
  // ข้อมูลนี้จะปรากฏทั้งในหน้าพนักงานเก็บขยะและตารางค่าปรับของนิติบุคคลหมู่บ้านทันที
  const addCollection = useCallback((rec) => {
    const id = `rec-${++collectionSeq}-${Date.now()}`;
    const time = new Date().toLocaleTimeString('th-TH', { hour12: false });
    const entry = { id, time, synced: false, ...rec };
    setCollections((prev) => [entry, ...prev]);
    // จำลองการซิงค์ขึ้นส่วนกลางสำเร็จหลัง 1 วินาที (เหมือนไฟล์อ้างอิง)
    setTimeout(() => {
      setCollections((prev) => prev.map((r) => (r.id === id ? { ...r, synced: true } : r)));
    }, 1000);
    return entry;
  }, []);

  // ------------------ Export Logic (CSV from central data store) ------------------
  const exportData = useCallback(
    (fileName) => {
      const header =
        'data:text/csv;charset=utf-8,รายงานสถิติของแพลตฟอร์ม NonD (นนทบุรี)\n' +
        'ประเภทรายงาน,ความสอดคล้องนโยบาย Net Zero นนทบุรีคาร์บอนต่ำ\n';
      const csvContent =
        header + data.provinceSummary.map((r) => `${r.label},${r.value}`).join('\n') + '\n';

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${fileName}_2569.csv`);
      document.body.appendChild(link); // Required for FF
      link.click();
      document.body.removeChild(link);

      showToast(`ระบบ NonD กำลังดำเนินการส่งออกไฟล์ ${fileName}_2569.csv ลงเครื่องของท่านเรียบร้อย!`);
    },
    [data, showToast],
  );

  // ------------------ AI Modal helpers ------------------
  const closeAI = useCallback(() => {
    setAiModal((m) => ({ ...m, open: false }));
  }, []);

  const runAI = useCallback(async (presetKey) => {
    const preset = AI_PRESETS[presetKey];
    if (!preset) return;
    setAiModal({ open: true, title: preset.title, loading: true, output: '' });
    try {
      const text = await callGemini(preset.prompt, preset.system);
      setAiModal((m) => ({ ...m, loading: false, output: text }));
    } catch (error) {
      setAiModal((m) => ({ ...m, loading: false, output: 'เกิดข้อผิดพลาดในการเรียกใช้งาน AI: ' + error.message }));
    }
  }, []);

  // ------------------ Bootstrap: auto-connect to Google Sheets (live CSV) ------------------
  useEffect(() => {
    let active = true;
    loadWasteData()
      .then((agg) => {
        if (!active) return;
        setWaste(agg);
        setWasteStatus('ready');
        // ให้ Export CSV สะท้อนข้อมูลจริงจากชีต
        setData((prev) => ({ ...prev, provinceSummary: buildProvinceSummary(agg) }));
      })
      .catch((err) => {
        if (!active) return;
        console.warn('[NonD] เชื่อมต่อ Google Sheets ไม่สำเร็จ:', err.message);
        setWasteStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const ActiveView = VIEWS[role];

  const ctx = {
    role,
    data,
    waste,
    wasteStatus,
    factoryApproved,
    collections,
    addCollection,
    switchRole,
    showToast,
    exportData,
    approveFactory,
    runAI,
  };

  return (
    <AppContext.Provider value={ctx}>
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6">
        <ActiveView />
      </main>
      <AIModal modal={aiModal} onClose={closeAI} onCopy={showToast} />
      <Toast toast={toast} />
      <Footer />
    </AppContext.Provider>
  );
}

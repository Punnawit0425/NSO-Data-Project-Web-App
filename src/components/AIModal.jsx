import Icon from './Icon.jsx';

// Beautiful interactive modal for showing AI results.
export default function AIModal({ modal, onClose, onCopy }) {
  const { open, title, loading, output } = modal;

  const copyOutput = () => {
    // Temporary textarea fallback to copy text to clipboard.
    const tempInput = document.createElement('textarea');
    tempInput.value = output;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    onCopy('คัดลอกรายงาน AI ของ NonD ไปยังคลิปบอร์ดเรียบร้อย!');
  };

  return (
    <div
      className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 z-50 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transform transition-all duration-300 ${
          open ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-teal-850 text-white">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-xl">
              <Icon name="sparkles" className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-xs text-emerald-200">ขับเคลื่อนด้วยโมเดล Gemini 2.5-Flash</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-all">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Content) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-sm animate-pulse">✨ กำลังประมวลผลวิเคราะห์ข้อมูลความยั่งยืนเมืองนนท์...</p>
                <p className="text-xs text-slate-400">กรุณารอสักครู่ (ระบบประสานงานโครงสร้างมาตรฐานของ อบก. และ T-VER)</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans border border-slate-100 p-4 rounded-xl bg-slate-50/50">
              {output || 'เนื้อหาจะปรากฏตรงนี้...'}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] text-slate-400">เนื้อหาสร้างด้วย AI ควรตรวจสอบความถูกต้องก่อนนำไปอ้างอิงจริง</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={copyOutput}
              className="flex-grow sm:flex-grow-0 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Icon name="copy" className="w-4 h-4" /> คัดลอกข้อความ
            </button>
            <button
              onClick={onClose}
              className="flex-grow sm:flex-grow-0 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

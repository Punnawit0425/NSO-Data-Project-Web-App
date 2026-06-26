import Icon from './Icon.jsx';

// Floating system message toast (replaces browser alerts).
export default function Toast({ toast }) {
  const { text, isWarning, visible } = toast;

  const baseClass =
    'fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform z-50 max-w-sm';
  const visibilityClass = visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none';

  return (
    <div className={`${baseClass} ${visibilityClass}`}>
      <div className={`${isWarning ? 'bg-rose-500' : 'bg-emerald-500'} p-1 rounded-full text-white`}>
        <Icon name={isWarning ? 'alert-triangle' : 'check'} className="w-4 h-4" />
      </div>
      <span className="text-xs font-semibold leading-normal">{text}</span>
    </div>
  );
}

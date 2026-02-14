
import React from 'react';
import { useApp } from '../app/store';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-0 right-0 z-[9999] p-4 space-y-3 w-full max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            relative overflow-hidden group bg-white border rounded-2xl shadow-2xl p-5 flex items-start gap-4 
            animate-in slide-in-from-right-full fade-in duration-500 border-l-4
            ${toast.type === 'success' ? 'border-l-emerald-500' : ''}
            ${toast.type === 'error' ? 'border-l-rose-500' : ''}
            ${toast.type === 'info' ? 'border-l-blue-500' : ''}
          `}
        >
          <div className={`
            p-2 rounded-xl shrink-0
            ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : ''}
            ${toast.type === 'error' ? 'bg-rose-50 text-rose-600' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 text-blue-600' : ''}
          `}>
            {toast.type === 'success' && <CheckCircle2 size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-800 leading-tight">{toast.title}</h4>
            {toast.description && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{toast.description}</p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-300 hover:text-slate-600 transition-colors p-1"
          >
            <X size={16} />
          </button>
          
          {/* Progress bar */}
          <div className={`
            absolute bottom-0 left-0 h-1 bg-slate-100 w-full overflow-hidden
          `}>
            <div className={`
              h-full animate-[progress_5s_linear_forwards]
              ${toast.type === 'success' ? 'bg-emerald-500' : ''}
              ${toast.type === 'error' ? 'bg-rose-500' : ''}
              ${toast.type === 'info' ? 'bg-blue-500' : ''}
            `}></div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;

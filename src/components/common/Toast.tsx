import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const iconConfig = {
          success: {
            icon: CheckCircle2,
            iconClass: 'text-[#4A5D44] dark:text-[#8B9D83]',
            bgClass: 'bg-white dark:bg-[#222821] border-[#8B9D83]/40 shadow-lg',
          },
          error: {
            icon: AlertCircle,
            iconClass: 'text-[#B85D52]',
            bgClass: 'bg-white dark:bg-[#222821] border-[#B85D52]/40 shadow-lg',
          },
          warning: {
            icon: AlertTriangle,
            iconClass: 'text-[#D4A373]',
            bgClass: 'bg-white dark:bg-[#222821] border-[#D4A373]/40 shadow-lg',
          },
          info: {
            icon: Info,
            iconClass: 'text-[#8B9D83]',
            bgClass: 'bg-white dark:bg-[#222821] border-[#E8E2D9] dark:border-[#353E33] shadow-lg',
          },
        }[toast.type];

        const Icon = iconConfig.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border ${iconConfig.bgClass} transition-all duration-200 animate-in slide-in-from-bottom-3`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconConfig.iconClass}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold font-serif text-[#3D3D3D] dark:text-[#F1EFEA] leading-snug">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-[#8C867E] dark:text-[#9DB095] mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#8C867E] hover:text-[#3D3D3D] dark:hover:text-[#F1EFEA] p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { AlertNotification } from '../types';

interface NotificationToastProps {
  notifications: AlertNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div 
      id="notification-container"
      className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {notifications.map((n) => {
        const isError = n.type === 'error';
        const isWarning = n.type === 'warning';
        const isSuccess = n.type === 'success';

        let borderClass = 'border-sky-500/40 bg-slate-900/95 text-sky-200';
        let icon = <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />;

        if (isError) {
          borderClass = 'border-rose-500/60 bg-[#160c10]/95 text-rose-200 shadow-rose-950/40';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
        } else if (isWarning) {
          borderClass = 'border-amber-500/60 bg-[#161208]/95 text-amber-200 shadow-amber-950/40';
          icon = <TriangleAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
        } else if (isSuccess) {
          borderClass = 'border-emerald-500/60 bg-[#0b1612]/95 text-emerald-200 shadow-emerald-950/40';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={n.id}
            id={`toast-${n.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-300 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm tracking-wide text-white">
                {n.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                {n.message}
              </p>
            </div>
            <button
              id={`dismiss-${n.id}`}
              onClick={() => onDismiss(n.id)}
              className="text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded focus:outline-none"
              title="Close alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

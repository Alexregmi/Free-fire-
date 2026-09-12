import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete?: () => void;
  onConfirm?: () => void;
  botUid: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  onConfirm,
  botUid,
}) => {
  if (!isOpen) return null;

  const handleAction = () => {
    if (onConfirmDelete) {
      onConfirmDelete();
    } else if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="delete-bot-modal"
        className="w-full max-w-md bg-[#111723] rounded-xl border border-rose-900/50 shadow-2xl shadow-rose-950/30 overflow-hidden"
      >
        <div className="p-5 border-b border-[#1f2a3c] flex items-center justify-between bg-gradient-to-r from-rose-950/30 to-[#111723]">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-gaming text-white">
              Delete Bot Profile
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm text-slate-300">
          <p>
            Are you sure you want to delete bot profile <strong className="text-amber-400 font-mono-code">{botUid || 'Unconfigured'}</strong>?
          </p>
          <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200/80 leading-relaxed">
            <strong>Warning:</strong> This action will:
            <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-300">
              <li>Immediately stop the bot if currently active</li>
              <li>Clear saved non-sensitive UID and regional configuration</li>
              <li>Reset local runtime logs and session timers</li>
            </ul>
          </div>
        </div>

        <div className="px-5 py-4 bg-[#0c111a] border-t border-[#1f2a3c] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-gaming font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            CANCEL
          </button>
          <button
            id="confirm-delete-btn"
            onClick={handleAction}
            className="px-4 py-2 rounded-lg text-xs font-gaming font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 flex items-center gap-1.5 transition active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>CONFIRM DELETE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

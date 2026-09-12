import React from 'react';
import { Wrench, Edit3, Trash2, Sliders, ShieldAlert } from 'lucide-react';

interface OtherActionsProps {
  onOpenTools: () => void;
  onEditDetails: () => void;
  onDeleteBot: () => void;
}

export const OtherActions: React.FC<OtherActionsProps> = ({
  onOpenTools,
  onEditDetails,
  onDeleteBot,
}) => {
  return (
    <div 
      id="other-actions-card"
      className="bg-[#101622] rounded-xl border border-[#232f45] shadow-xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-[#141c2c] to-[#101622]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-gaming text-white tracking-wide">
              Other Actions
            </h2>
            <p className="text-xs text-slate-400">
              Utility tools, configuration edits & bot cleanup
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 🛠 Open Tools */}
          <button
            id="other-actions-tools-btn"
            onClick={onOpenTools}
            className="p-3.5 rounded-lg bg-[#0e1524] hover:bg-[#162136] border border-[#23334f] text-slate-200 hover:text-white font-gaming font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-slate-950/40"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>🛠 Open Tools</span>
          </button>

          {/* ✏️ Edit Details */}
          <button
            id="other-actions-edit-btn"
            onClick={onEditDetails}
            className="p-3.5 rounded-lg bg-[#0e1524] hover:bg-[#162136] border border-[#23334f] text-slate-200 hover:text-white font-gaming font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-slate-950/40"
          >
            <Edit3 className="w-4 h-4 text-sky-400" />
            <span>✏️ Edit Details</span>
          </button>

          {/* 🗑 Delete Bot */}
          <button
            id="other-actions-delete-btn"
            onClick={onDeleteBot}
            className="p-3.5 rounded-lg bg-[#0e1524] hover:bg-rose-950/50 border border-[#23334f] hover:border-rose-800/60 text-slate-200 hover:text-rose-300 font-gaming font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-slate-950/40"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>🗑 Delete Bot</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Deleting bot clears local non-sensitive configuration only. Confirmation required.</span>
        </p>
      </div>
    </div>
  );
};

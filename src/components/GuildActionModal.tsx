import React, { useState } from 'react';
import { Castle, LogIn, LogOut, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { GuildInfo } from '../types';

interface GuildActionModalProps {
  mode: 'join' | 'leave';
  isOpen: boolean;
  onClose: () => void;
  currentGuild: GuildInfo | null;
  onJoinGuild: (guildId: string) => Promise<void>;
  onLeaveGuild: () => Promise<void>;
}

export const GuildActionModal: React.FC<GuildActionModalProps> = ({
  mode,
  isOpen,
  onClose,
  currentGuild,
  onJoinGuild,
  onLeaveGuild,
}) => {
  const [guildId, setGuildId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = guildId.trim();
    if (!clean) {
      setErrorMsg('Missing Guild ID: Enter 6 to 10 digit Guild ID.');
      return;
    }
    if (!/^\d{6,10}$/.test(clean)) {
      setErrorMsg('Invalid Guild ID: Guild ID must be 6 to 10 numeric digits.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onJoinGuild(clean);
      setGuildId('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to join guild.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onLeaveGuild();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to leave guild.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="guild-action-modal-card"
        className="w-full max-w-md bg-[#111723] rounded-xl border border-[#232f45] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1f2a3c] flex items-center justify-between bg-gradient-to-r from-[#172235] to-[#111723]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              {mode === 'join' ? <LogIn className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold font-gaming text-white">
                {mode === 'join' ? '➕ Join Guild' : '🚪 Leave Guild'}
              </h3>
              <p className="text-xs text-slate-400">
                Guild Gateway Management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'join' ? (
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-gaming font-semibold text-slate-300 uppercase mb-1.5">
                  Target Guild ID
                </label>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={guildId}
                  onChange={(e) => {
                    setGuildId(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Enter 6-10 numeric Guild ID"
                  className="w-full px-3.5 py-2.5 bg-[#080c13] border border-[#1e2a3c] focus:border-amber-500 rounded-lg text-sm font-mono-code text-white placeholder-slate-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Transmits membership application via authorized Free Fire regional API.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-gaming font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-gaming font-bold text-xs shadow-lg transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Application...' : 'SEND GUILD APPLICATION'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Are you sure you want to leave guild <strong className="text-amber-400">{currentGuild?.name || 'Current Guild'}</strong>?
              </p>

              {currentGuild && (
                <div className="p-3 bg-[#080c13] rounded-lg border border-[#1e2a3c] text-xs space-y-1 font-mono-code">
                  <div className="text-slate-400">Guild ID: <span className="text-white">{currentGuild.id}</span></div>
                  <div className="text-slate-400">Level: <span className="text-amber-400">Lv. {currentGuild.level}</span></div>
                  <div className="text-slate-400">Members: <span className="text-white">{currentGuild.membersCount}/{currentGuild.maxMembers}</span></div>
                </div>
              )}

              <p className="text-[11px] text-rose-300/90">
                Warning: Leaving will forfeit accumulated guild daily points and guild tournament tokens.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-gaming font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeaveSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-gaming font-bold text-xs shadow-lg transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing Departure...' : 'CONFIRM LEAVE GUILD'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

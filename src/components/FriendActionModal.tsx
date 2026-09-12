import React, { useState } from 'react';
import { Users, UserPlus, UserMinus, X, Check, AlertCircle, Copy, ShieldCheck } from 'lucide-react';
import { FriendItem } from '../types';

interface FriendActionModalProps {
  mode: 'add' | 'remove' | 'view';
  isOpen: boolean;
  onClose: () => void;
  friends: FriendItem[];
  onAddFriend: (targetUid: string) => Promise<void>;
  onRemoveFriend: (targetUid: string) => Promise<void>;
}

export const FriendActionModal: React.FC<FriendActionModalProps> = ({
  mode,
  isOpen,
  onClose,
  friends,
  onAddFriend,
  onRemoveFriend,
}) => {
  const [targetUid, setTargetUid] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = targetUid.trim();
    if (!clean) {
      setErrorMsg('Missing Target UID: Enter an 8 to 12 digit player UID.');
      return;
    }
    if (!/^\d{8,12}$/.test(clean)) {
      setErrorMsg('Invalid Target UID: Free Fire UID must be 8 to 12 numeric digits.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onAddFriend(clean);
      setTargetUid('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send friend request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSubmit = async (uidToRemove: string) => {
    setIsSubmitting(true);
    try {
      await onRemoveFriend(uidToRemove);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to remove friend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard?.writeText(uid).catch(() => {});
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="friend-action-modal-card"
        className="w-full max-w-lg bg-[#111723] rounded-xl border border-[#232f45] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1f2a3c] flex items-center justify-between bg-gradient-to-r from-[#172235] to-[#111723]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              {mode === 'add' ? <UserPlus className="w-5 h-5" /> : mode === 'remove' ? <UserMinus className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold font-gaming text-white">
                {mode === 'add' ? '➕ Add Friend' : mode === 'remove' ? '➖ Remove Friend' : '👥 View Friend List'}
              </h3>
              <p className="text-xs text-slate-400">
                Authorized Free Fire Player Directory
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE: ADD FRIEND */}
          {mode === 'add' && (
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-gaming font-semibold text-slate-300 uppercase mb-1.5">
                  Target Player UID
                </label>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={targetUid}
                  onChange={(e) => {
                    setTargetUid(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Enter 8-12 digit target UID (e.g. 192847561)"
                  className="w-full px-3.5 py-2.5 bg-[#080c13] border border-[#1e2a3c] focus:border-amber-500 rounded-lg text-sm font-mono-code text-white placeholder-slate-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Target user must be in a supported region. Request is routed via official player API.
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
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-gaming font-bold text-xs shadow-lg transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending Request...' : 'SEND FRIEND REQUEST'}
                </button>
              </div>
            </form>
          )}

          {/* MODE: REMOVE FRIEND */}
          {mode === 'remove' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Select a friend from your authorized list to remove:
              </p>

              {friends.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No friends currently in your list.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {friends.map((f) => (
                    <div
                      key={f.uid}
                      className="p-3 rounded-lg bg-[#080c13] border border-[#1d273a] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-gaming font-bold text-white">{f.name}</span>
                          <span className="text-[10px] font-mono-code text-amber-400">Lv.{f.level}</span>
                        </div>
                        <span className="text-xs font-mono-code text-slate-400">UID: {f.uid}</span>
                      </div>

                      <button
                        onClick={() => handleRemoveSubmit(f.uid)}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 text-xs font-gaming font-semibold transition active:scale-95"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODE: VIEW FRIEND LIST */}
          {mode === 'view' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Displaying {friends.length} Authorized Friends</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono-code">
                  <ShieldCheck className="w-3.5 h-3.5" /> Public Data Only
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {friends.map((f) => (
                  <div
                    key={f.uid}
                    className="p-3 rounded-lg bg-[#080c13] border border-[#1e2a3c] flex items-center justify-between gap-3 hover:border-sky-500/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-950/50 border border-sky-800/40 flex items-center justify-center font-gaming font-bold text-sky-400 text-xs">
                        {f.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-gaming font-bold text-white">{f.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {f.rank}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-code mt-0.5">
                          <span>Lv.{f.level}</span>
                          <span>•</span>
                          <span>UID: {f.uid}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-gaming uppercase px-2 py-0.5 rounded ${
                        f.status === 'online' 
                          ? 'bg-emerald-950 text-emerald-400' 
                          : f.status === 'in-game' 
                          ? 'bg-amber-950 text-amber-400' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {f.status}
                      </span>

                      <button
                        onClick={() => handleCopyUid(f.uid)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Copy UID"
                      >
                        {copiedUid === f.uid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0f18] border-t border-[#1f2a3c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-gaming font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

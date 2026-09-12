import React, { useState } from 'react';
import { 
  User, 
  X, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Award, 
  ThumbsUp, 
  Globe, 
  Hash, 
  RefreshCw, 
  LogOut,
  AlertCircle
} from 'lucide-react';
import { GameAccountInfo as GameAccountInfoType, BotConfig } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountInfo: GameAccountInfoType;
  config: BotConfig;
  isAuthenticated: boolean;
  authenticatedUid: string | null;
  authenticatedRegion: string | null;
  onAuthenticate: (uid: string, region: string, pass: string) => Promise<boolean>;
  onRevokeAuth: () => void;
  onRefreshInfo: () => void;
  isRefreshingInfo?: boolean;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountInfo,
  config,
  isAuthenticated,
  authenticatedUid,
  authenticatedRegion,
  onAuthenticate,
  onRevokeAuth,
  onRefreshInfo,
  isRefreshingInfo = false,
}) => {
  const [authUid, setAuthUid] = useState(config.uid || '');
  const [authRegion, setAuthRegion] = useState(config.region || 'BD');
  const [authPass, setAuthPass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUid.trim()) {
      setLocalError('Please enter your Free Fire UID.');
      return;
    }
    if (!authPass.trim()) {
      setLocalError('Please enter your Free Fire game password/token.');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    try {
      const ok = await onAuthenticate(authUid.trim(), authRegion, authPass);
      if (!ok) {
        setLocalError('Authentication failed. Please verify your credentials.');
      } else {
        setAuthPass('');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="account-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        id="account-modal-container"
        className="w-full max-w-lg bg-[#0e1422] rounded-2xl border border-[#233148] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1c273a] bg-gradient-to-r from-[#141d2f] to-[#0e1422] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-gaming text-white tracking-wide">
                👤 Account Information
              </h2>
              <p className="text-xs text-slate-400">
                Free Fire player profile & credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Game Profile Card */}
          <div className="p-4 rounded-xl bg-[#090d15] border border-[#1b2538] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-gaming text-slate-400 uppercase tracking-wider">
                Authorized Player Profile
              </span>
              <button
                onClick={onRefreshInfo}
                disabled={isRefreshingInfo}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131c2b] hover:bg-[#1a263b] text-slate-300 text-xs font-gaming transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshingInfo ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-[#0d131f] border border-[#1f2c42]">
                <span className="text-[10px] text-slate-400 font-gaming uppercase block">Player Name</span>
                <span className="text-sm font-gaming font-bold text-white truncate block">
                  {accountInfo.playerName || 'Unknown'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0d131f] border border-[#1f2c42]">
                <span className="text-[10px] text-slate-400 font-gaming uppercase block">Level</span>
                <span className="text-sm font-mono-code font-bold text-sky-400 block">
                  {accountInfo.level || 'Lv. --'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0d131f] border border-[#1f2c42]">
                <span className="text-[10px] text-slate-400 font-gaming uppercase block">Saved UID</span>
                <span className="text-sm font-mono-code font-bold text-amber-400 truncate block">
                  {authenticatedUid || config.uid}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0d131f] border border-[#1f2c42]">
                <span className="text-[10px] text-slate-400 font-gaming uppercase block">Region</span>
                <span className="text-sm font-gaming font-bold text-emerald-400 truncate block">
                  {authenticatedRegion || config.region}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="p-2.5 rounded-lg bg-[#0d131f] border border-[#1f2c42]">
              <span className="text-[10px] text-slate-400 font-gaming uppercase block mb-1">In-Game Signature / Bio</span>
              <p className="text-xs font-mono-code text-slate-300 italic">
                "{accountInfo.bio || 'No signature set.'}"
              </p>
            </div>
          </div>

          {/* Authentication State */}
          <div className="p-4 rounded-xl bg-[#090d15] border border-[#1b2538] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <Unlock className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-rose-400" />
                )}
                <span className="text-xs font-gaming font-bold uppercase tracking-wider text-white">
                  Free Fire Account Gateway
                </span>
              </div>
              <span className={`text-[11px] font-mono-code font-bold px-2 py-0.5 rounded border ${
                isAuthenticated 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
              }`}>
                {isAuthenticated ? '🟢 AUTHENTICATED' : '🔒 BOT LOCKED'}
              </span>
            </div>

            {isAuthenticated ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-300">
                  Your Free Fire account is linked and ready. Bot commands and Tools actions are fully authorized.
                </p>
                <button
                  onClick={onRevokeAuth}
                  className="w-full py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-600/40 text-rose-300 font-gaming text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Revoke Authentication / Switch Account</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3 pt-1">
                <p className="text-xs text-slate-400">
                  Please authenticate with your Free Fire credentials to unlock the Bot and Tools features.
                </p>

                {localError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-600/50 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{localError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-gaming text-slate-400 block mb-1">
                      Free Fire UID
                    </label>
                    <input
                      type="text"
                      value={authUid}
                      onChange={(e) => setAuthUid(e.target.value)}
                      placeholder="e.g. 1029384756"
                      className="w-full px-3 py-2 rounded-lg bg-[#0e1422] border border-[#223148] text-white text-xs font-mono-code focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-gaming text-slate-400 block mb-1">
                      Free Fire Password / Security Key
                    </label>
                    <input
                      type="password"
                      value={authPass}
                      onChange={(e) => setAuthPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 rounded-lg bg-[#0e1422] border border-[#223148] text-white text-xs font-mono-code focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-gaming text-xs font-bold transition shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : '🔓 Authenticate Free Fire Account'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#1c273a] bg-[#0b0f17] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#141d2f] hover:bg-[#1a263b] text-slate-300 font-gaming text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

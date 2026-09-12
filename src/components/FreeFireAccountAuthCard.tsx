import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, ShieldCheck, CheckCircle2, AlertCircle, Key, Globe, Hash, RefreshCw } from 'lucide-react';
import { FF_REGIONS } from '../data/constants';

interface FreeFireAccountAuthCardProps {
  isAuthenticated: boolean;
  authenticatedUid: string | null;
  authenticatedRegion: string | null;
  botStatus: 'OFFLINE' | 'STARTING' | 'ONLINE' | 'ERROR';
  onAuthenticate: (uid: string, password: string, region: string) => Promise<boolean>;
  onRevokeAuth: () => Promise<void>;
  authErrorMessage: string | null;
  isAuthenticating: boolean;
}

export const FreeFireAccountAuthCard: React.FC<FreeFireAccountAuthCardProps> = ({
  isAuthenticated,
  authenticatedUid,
  authenticatedRegion,
  botStatus,
  onAuthenticate,
  onRevokeAuth,
  authErrorMessage,
  isAuthenticating,
}) => {
  const [uidInput, setUidInput] = useState(authenticatedUid || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [regionInput, setRegionInput] = useState(authenticatedRegion || 'SG');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Clear errors when typing
  const handleUidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUidInput(e.target.value);
    setValidationError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordInput(e.target.value);
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanUid = uidInput.trim();
    const cleanPassword = passwordInput.trim();

    // RULE 1: If UID is empty
    if (!cleanUid) {
      setValidationError('Free Fire UID is required.');
      return;
    }

    // RULE 2: If authentication credential is missing
    if (!cleanPassword) {
      setValidationError('Account authentication is required before using the bot.');
      return;
    }

    // Call authentication handler
    const success = await onAuthenticate(cleanUid, cleanPassword, regionInput);

    // SECURITY MANDATE: Never display the password after submission!
    // Never retain password in frontend JavaScript state!
    setPasswordInput('');

    if (!success) {
      // Handled by authErrorMessage
    }
  };

  const activeError = validationError || authErrorMessage;

  return (
    <div
      id="ff-account-auth-card"
      className={`rounded-2xl border transition-all duration-300 shadow-2xl overflow-hidden ${
        isAuthenticated
          ? 'bg-[#0c1424] border-emerald-500/40 shadow-emerald-950/20'
          : 'bg-[#101626] border-amber-500/40 shadow-amber-950/20'
      }`}
    >
      {/* Top Banner Header */}
      <div
        className={`px-5 py-4 border-b flex items-center justify-between ${
          isAuthenticated
            ? 'bg-gradient-to-r from-emerald-950/60 via-[#0e1e32] to-[#0c1424] border-emerald-500/30'
            : 'bg-gradient-to-r from-amber-950/60 via-[#18233a] to-[#101626] border-amber-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg ${
              isAuthenticated
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-emerald-500/30'
                : 'bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isAuthenticated ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-gaming text-white tracking-wide flex items-center gap-2">
              <span>🔐 Free Fire Account Required</span>
            </h2>
            <p className="text-xs text-slate-300">
              The bot must NOT work without the user's Free Fire account authentication.
            </p>
          </div>
        </div>

        {/* Status Lock Pill */}
        <div className="shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-gaming font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>🔓 BOT READY</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-gaming font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>🔒 BOT LOCKED</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Dynamic Status Display Box */}
        {isAuthenticated ? (
          /* AUTHENTICATED STATE */
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-gaming font-bold text-sm text-emerald-300">
                  🟢 Account Authenticated
                </span>
              </div>
              <span className="text-[11px] font-mono-code text-emerald-400 bg-emerald-900/40 px-2.5 py-0.5 rounded border border-emerald-700/50">
                Official Gateway Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-[#070b13] border border-[#1b263b]">
                <span className="text-[10px] font-gaming text-slate-400 block uppercase">
                  Authenticated UID
                </span>
                <span className="text-sm font-mono-code font-bold text-amber-300">
                  {authenticatedUid}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#070b13] border border-[#1b263b]">
                <span className="text-[10px] font-gaming text-slate-400 block uppercase">
                  Server Region
                </span>
                <span className="text-sm font-gaming font-bold text-sky-300">
                  {authenticatedRegion || 'SG'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-900/40 text-xs">
              <span className="text-slate-300 text-[11px]">
                Bot is authorized and unlocked for execution.
              </span>
              <button
                type="button"
                onClick={onRevokeAuth}
                className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-gaming text-xs font-bold transition flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Bot & De-authenticate</span>
              </button>
            </div>
          </div>
        ) : (
          /* UN-AUTHENTICATED FORM STATE */
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Error Message Box according to user specifications */}
            {activeError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border-2 border-rose-500/60 text-xs text-rose-200 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-gaming font-bold text-sm text-rose-300">
                  <span>🔴</span>
                  <span>{activeError.includes('failed') ? 'Bot OFFLINE' : 'Bot cannot start'}</span>
                </div>
                <p className="font-mono-code text-rose-100 pl-6">
                  {activeError}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* UID / Guest ID */}
              <div>
                <label
                  htmlFor="auth-ff-uid"
                  className="block text-xs font-gaming font-semibold tracking-wider text-slate-300 uppercase mb-1.5"
                >
                  UID / Guest ID <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-ff-uid"
                    type="text"
                    inputMode="numeric"
                    value={uidInput}
                    onChange={handleUidChange}
                    placeholder="Enter UID (e.g. 1029384756)"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#080d17] border border-[#1f2b41] focus:border-amber-400 rounded-xl text-xs font-mono-code text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              {/* Password / Passport (Secure password field) */}
              <div>
                <label
                  htmlFor="auth-ff-password"
                  className="block text-xs font-gaming font-semibold tracking-wider text-slate-300 uppercase mb-1.5"
                >
                  Password / Passport <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-ff-password"
                    type="password"
                    autoComplete="new-password"
                    value={passwordInput}
                    onChange={handlePasswordChange}
                    placeholder="Enter Password / Passport"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#080d17] border border-[#1f2b41] focus:border-amber-400 rounded-xl text-xs font-mono-code text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              {/* Region */}
              <div>
                <label
                  htmlFor="auth-ff-region"
                  className="block text-xs font-gaming font-semibold tracking-wider text-slate-300 uppercase mb-1.5"
                >
                  Region <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <select
                    id="auth-ff-region"
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#080d17] border border-[#1f2b41] focus:border-amber-400 rounded-xl text-xs font-gaming text-white focus:outline-none focus:ring-1 focus:ring-amber-400 transition appearance-none"
                  >
                    {FF_REGIONS.map((r) => (
                      <option key={r.code} value={r.code} className="bg-slate-900 text-white">
                        {r.flag} {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Authenticate Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                id="btn-authenticate-account"
                type="submit"
                disabled={isAuthenticating}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-gaming font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AUTHENTICATING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>AUTHENTICATE ACCOUNT</span>
                  </>
                )}
              </button>

              {/* Security guarantee note */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Password is sent strictly to backend authentication gateway and never stored in frontend.
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

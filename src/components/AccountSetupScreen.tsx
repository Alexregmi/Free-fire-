import React, { useState } from 'react';
import { Flame, ShieldCheck, Hash, Globe, KeyRound, Save, AlertCircle, ArrowRight } from 'lucide-react';
import { FF_REGIONS } from '../data/constants';
import { BotConfig } from '../types';

interface AccountSetupScreenProps {
  currentConfig: BotConfig;
  onSaveAccount: (config: BotConfig) => void;
  onCancel?: () => void;
  isInitialSetup?: boolean;
}

export const AccountSetupScreen: React.FC<AccountSetupScreenProps> = ({
  currentConfig,
  onSaveAccount,
  onCancel,
  isInitialSetup = false,
}) => {
  const [uid, setUid] = useState(currentConfig?.uid || '');
  const [region, setRegion] = useState(currentConfig?.region || 'BD');
  const [ownerUid, setOwnerUid] = useState(currentConfig?.ownerUid || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUid = uid.trim();
    const cleanOwner = ownerUid.trim();

    if (!cleanUid) {
      setErrorMsg('Missing UID: Please enter your Free Fire player UID or Guest ID.');
      return;
    }

    if (!/^\d{8,12}$/.test(cleanUid)) {
      setErrorMsg('Invalid UID: Free Fire UID must consist of 8 to 12 numeric digits (e.g. 1029384756).');
      return;
    }

    if (!region) {
      setErrorMsg('Invalid Region: Please select a valid Free Fire regional server.');
      return;
    }

    if (cleanOwner && !/^\d{8,12}$/.test(cleanOwner)) {
      setErrorMsg('Invalid Owner UID: Owner UID must be 8 to 12 numeric digits.');
      return;
    }

    setErrorMsg(null);
    onSaveAccount({
      ...currentConfig,
      uid: cleanUid,
      region,
      ownerUid: cleanOwner || cleanUid,
      botUid: `BOT-${cleanUid.slice(-4)}-${region}`,
    });
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <div 
        id="account-setup-card"
        className="bg-[#101622] rounded-2xl border border-[#232f45] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1e293b] bg-gradient-to-r from-[#172235] to-[#101622] text-center relative">
          <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-3">
            <Flame className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-gaming text-white tracking-wide">
            Free Fire Account
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure your player UID and regional server routing
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-[11px] text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Password Policy · Public UID Identification Only</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* UID / Guest ID */}
          <div>
            <label 
              htmlFor="setup-input-uid"
              className="block text-xs font-gaming font-semibold tracking-wider text-slate-300 uppercase mb-1.5"
            >
              UID / Guest ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Hash className="w-4 h-4" />
              </div>
              <input
                id="setup-input-uid"
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                value={uid}
                onChange={(e) => {
                  setUid(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter UID (e.g. 1029384756)"
                className="w-full pl-10 pr-4 py-3 bg-[#0a0e16] border border-[#1e2a3c] focus:border-amber-500 rounded-xl text-sm font-mono-code text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Your in-game numeric player ID. Never share sensitive credentials.
            </p>
          </div>

          {/* Region */}
          <div>
            <label 
              htmlFor="setup-input-region"
              className="block text-xs font-gaming font-semibold tracking-wider text-slate-300 uppercase mb-1.5"
            >
              Region
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <select
                id="setup-input-region"
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full pl-10 pr-4 py-3 bg-[#0a0e16] border border-[#1e2a3c] focus:border-amber-500 rounded-xl text-sm font-gaming text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition appearance-none"
              >
                {FF_REGIONS.map((r) => (
                  <option key={r.code} value={r.code} className="bg-slate-900 text-white">
                    {r.flag} {r.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Supported regions: BD (Bangladesh), NP (Nepal), IN (India), SG (Singapore), etc.
            </p>
          </div>

          {/* Owner UID */}
          <div>
            <label 
              htmlFor="setup-input-owner"
              className="block text-xs font-gaming font-semibold tracking-wider text-slate-300 uppercase mb-1.5"
            >
              Owner UID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="setup-input-owner"
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                value={ownerUid}
                onChange={(e) => {
                  setOwnerUid(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter Owner UID (Default is Player UID)"
                className="w-full pl-10 pr-4 py-3 bg-[#0a0e16] border border-[#1e2a3c] focus:border-amber-500 rounded-xl text-sm font-mono-code text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Identifies the authorized administrator of this panel instance.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-3 space-y-2">
            <button
              id="save-account-btn-setup"
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-gaming font-bold text-sm tracking-wider shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition active:scale-[0.99]"
            >
              <Save className="w-4 h-4" />
              <span>💾 SAVE ACCOUNT</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </button>

            {onCancel && !isInitialSetup && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 text-xs font-gaming text-slate-400 hover:text-white transition"
              >
                Cancel and return to Dashboard
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

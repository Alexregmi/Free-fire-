import React, { useState } from 'react';
import { UserCheck, ShieldAlert, Save, Globe, Hash, ShieldCheck, KeyRound } from 'lucide-react';
import { FF_REGIONS } from '../data/constants';
import { BotConfig } from '../types';

interface UserDetailsProps {
  config: BotConfig;
  onSaveConfig: (updated: BotConfig) => void;
  onValidationError: (field: string, message: string) => void;
}

export const UserDetails: React.FC<UserDetailsProps> = ({
  config,
  onSaveConfig,
  onValidationError,
}) => {
  const [uidInput, setUidInput] = useState(config?.uid || '');
  const [regionInput, setRegionInput] = useState(config?.region || 'BD');
  const [ownerUidInput, setOwnerUidInput] = useState(config?.ownerUid || '');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUid = uidInput.trim();
    const trimmedOwnerUid = ownerUidInput.trim();

    if (!trimmedUid) {
      onValidationError('UID', 'Missing UID. Please enter a Free Fire Player UID or Guest ID.');
      return;
    }

    if (!/^\d{8,12}$/.test(trimmedUid)) {
      onValidationError(
        'Invalid UID',
        'Invalid UID format. Free Fire player UIDs must contain 8 to 12 numeric digits (e.g. 1029384756).'
      );
      return;
    }

    if (!regionInput) {
      onValidationError('Invalid Region', 'Invalid region. Please select a valid Free Fire regional server.');
      return;
    }

    if (trimmedOwnerUid && !/^\d{8,12}$/.test(trimmedOwnerUid)) {
      onValidationError(
        'Invalid Owner UID',
        'Owner UID must contain 8 to 12 numeric digits.'
      );
      return;
    }

    const updated: BotConfig = {
      ...config,
      uid: trimmedUid,
      region: regionInput,
      ownerUid: trimmedOwnerUid || trimmedUid,
      botUid: `BOT-${trimmedUid.slice(-4)}-${regionInput}`,
    };

    onSaveConfig(updated);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  return (
    <div 
      id="user-details-card"
      className="bg-[#101622] rounded-xl border border-[#232f45] shadow-xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-[#141c2c] to-[#101622]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-gaming text-white tracking-wide">
              User Details
            </h2>
            <p className="text-xs text-slate-400">
              Edit bot details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>No Password Required</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* UID / Guest ID */}
        <div>
          <label 
            htmlFor="input-uid"
            className="block text-xs font-gaming font-semibold tracking-wide text-slate-300 uppercase mb-1.5"
          >
            UID / Guest ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Hash className="w-4 h-4" />
            </div>
            <input
              id="input-uid"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={uidInput}
              onChange={(e) => setUidInput(e.target.value)}
              placeholder="Enter UID (e.g., 1029384756)"
              className="w-full pl-9 pr-4 py-2.5 bg-[#0a0e16] border border-[#1e2a3c] focus:border-amber-500 rounded-lg text-sm font-mono-code text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Official 8-12 digit Free Fire numeric identifier found on in-game profile.
          </p>
        </div>

        {/* Region Selector */}
        <div>
          <label 
            htmlFor="input-region"
            className="block text-xs font-gaming font-semibold tracking-wide text-slate-300 uppercase mb-1.5"
          >
            Region
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Globe className="w-4 h-4" />
            </div>
            <select
              id="input-region"
              value={regionInput}
              onChange={(e) => setRegionInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#0a0e16] border border-[#1e2a3c] focus:border-amber-500 rounded-lg text-sm font-gaming text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition appearance-none"
            >
              <option value="" disabled>Select Region</option>
              {FF_REGIONS.map((r) => (
                <option key={r.code} value={r.code} className="bg-slate-900 text-white">
                  {r.flag} {r.name} · {r.serverNode}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Connects panel queries to the nearest regional TCP relay node.
          </p>
        </div>

        {/* Owner UID */}
        <div>
          <label 
            htmlFor="input-owner-uid"
            className="block text-xs font-gaming font-semibold tracking-wide text-slate-300 uppercase mb-1.5"
          >
            Owner UID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="input-owner-uid"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={ownerUidInput}
              onChange={(e) => setOwnerUidInput(e.target.value)}
              placeholder="Enter Owner UID (e.g., 1029384756)"
              className="w-full pl-9 pr-4 py-2.5 bg-[#0a0e16] border border-[#1e2a3c] focus:border-amber-500 rounded-lg text-sm font-mono-code text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Panel administrator or account master UID for privileged bot control commands.
          </p>
        </div>

        {/* Privacy & Anti-Credential Banner */}
        <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 text-xs text-amber-300/80 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Security Notice:</strong> This panel never asks for your password, social login, or access tokens. Only non-sensitive public UIDs and regional routing flags are stored locally.
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            id="save-account-btn"
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-gaming font-bold text-sm tracking-wider shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 active:scale-[0.99] transition"
          >
            <span>💾 SAVE ACCOUNT</span>
          </button>
          {isSavedRecently && (
            <p className="text-center text-xs text-emerald-400 mt-2 font-medium">
              ✓ Account configuration saved successfully!
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Save, 
  ShieldCheck, 
  Radio, 
  Clock, 
  Globe, 
  Hash, 
  Cpu, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { BotConfig } from '../types';
import { FF_REGIONS } from '../data/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BotConfig;
  onSaveConfig: (updated: BotConfig) => void;
  demoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  demoMode,
  onToggleDemoMode,
}) => {
  const [uid, setUid] = useState(config.uid || '');
  const [region, setRegion] = useState(config.region || 'BD');
  const [autoReconnect, setAutoReconnect] = useState(config.autoReconnect ?? true);
  const [heartbeatInterval, setHeartbeatInterval] = useState(config.heartbeatIntervalSec || 5);
  const [localDemoMode, setLocalDemoMode] = useState(demoMode);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUid = uid.trim();
    if (!cleanUid) {
      setErrorMsg('UID is required.');
      return;
    }
    if (!/^\d{8,12}$/.test(cleanUid)) {
      setErrorMsg('UID must contain 8 to 12 numeric digits.');
      return;
    }

    setErrorMsg(null);
    const updated: BotConfig = {
      ...config,
      uid: cleanUid,
      region,
      ownerUid: cleanUid,
      botUid: `BOT-${cleanUid.slice(-4)}-${region}`,
      autoReconnect,
      heartbeatIntervalSec: heartbeatInterval,
      demoMode: localDemoMode,
    };

    onSaveConfig(updated);
    onToggleDemoMode(localDemoMode);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div 
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        id="settings-modal-container"
        className="w-full max-w-lg bg-[#0e1422] rounded-2xl border border-[#233148] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1c273a] bg-gradient-to-r from-[#141d2f] to-[#0e1422] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-gaming text-white tracking-wide">
                ⚙️ Settings
              </h2>
              <p className="text-xs text-slate-400">
                System parameters & connection options
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-600/50 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-600/50 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Settings saved successfully!</span>
            </div>
          )}

          {/* UID & Region */}
          <div className="space-y-3 p-4 rounded-xl bg-[#090d15] border border-[#1b2538]">
            <span className="text-xs font-gaming font-bold uppercase tracking-wider text-slate-300 block">
              Default Game Profile Config
            </span>

            <div>
              <label className="text-[11px] font-gaming text-slate-400 block mb-1">
                Saved UID
              </label>
              <input
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0e1422] border border-[#223148] text-white text-xs font-mono-code focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-gaming text-slate-400 block mb-1">
                Regional Server Gateway
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0e1422] border border-[#223148] text-white text-xs font-gaming focus:outline-none focus:border-amber-500"
              >
                {FF_REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag} {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Network & Daemon Settings */}
          <div className="space-y-3 p-4 rounded-xl bg-[#090d15] border border-[#1b2538]">
            <span className="text-xs font-gaming font-bold uppercase tracking-wider text-slate-300 block">
              Connection & Automation Options
            </span>

            {/* Auto Reconnect */}
            <label className="flex items-center justify-between cursor-pointer py-1">
              <div>
                <span className="text-xs font-gaming text-white block">Auto Reconnect</span>
                <span className="text-[10px] text-slate-400">Automatically re-establish connection if dropped</span>
              </div>
              <input
                type="checkbox"
                checked={autoReconnect}
                onChange={(e) => setAutoReconnect(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0e1422] border-[#223148] text-amber-500 focus:ring-0 focus:ring-offset-0"
              />
            </label>

            {/* Heartbeat Interval */}
            <div className="pt-2 border-t border-[#162030]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-gaming text-white">Heartbeat Interval</span>
                <span className="text-xs font-mono-code text-amber-400">{heartbeatInterval}s</span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                step={1}
                value={heartbeatInterval}
                onChange={(e) => setHeartbeatInterval(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-[#0e1422] rounded cursor-pointer"
              />
            </div>

            {/* Mode Switch: Demo Mode vs Real Gateway */}
            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#162030]">
              <div>
                <span className="text-xs font-gaming text-white block">Simulation / Demo Mode</span>
                <span className="text-[10px] text-slate-400">Safe sandbox for preview environments</span>
              </div>
              <input
                type="checkbox"
                checked={localDemoMode}
                onChange={(e) => setLocalDemoMode(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0e1422] border-[#223148] text-amber-500 focus:ring-0"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#141d2f] hover:bg-[#1a263b] text-slate-300 font-gaming text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-gaming text-xs font-bold transition shadow-lg flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

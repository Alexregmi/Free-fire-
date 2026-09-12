import React from 'react';
import { Play, Square, RotateCw, Gamepad2, Radio, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { BotConfig, BotStatus, TcpStatus } from '../types';

interface BotControlsProps {
  config: BotConfig;
  botStatus: BotStatus;
  tcpStatus: TcpStatus;
  onStartBot: () => void;
  onStopBot: () => void;
  onRestartBot: () => void;
  demoMode: boolean;
  isAuthenticated: boolean;
  authenticatedUid: string | null;
  onOpenAuth?: () => void;
}

export const BotControls: React.FC<BotControlsProps> = ({
  config,
  botStatus,
  tcpStatus,
  onStartBot,
  onStopBot,
  onRestartBot,
  demoMode,
  isAuthenticated,
  authenticatedUid,
  onOpenAuth,
}) => {
  const isOnline = botStatus === 'ONLINE';
  const isStarting = botStatus === 'STARTING';
  const isOffline = botStatus === 'OFFLINE';
  const noBackend = tcpStatus === 'DISCONNECTED' && !demoMode;

  return (
    <div 
      id="bot-controls-card"
      className="bg-[#101622] rounded-xl border border-[#232f45] shadow-xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-[#141c2c] to-[#101622]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-gaming text-white tracking-wide">
              🎮 Bot Controls
            </h2>
            <p className="text-xs text-slate-400">
              Runtime actions & authentication lock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <span className="flex items-center gap-1.5 text-xs font-gaming font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/50 shadow-sm">
              <Unlock className="w-3.5 h-3.5" />
              <span>🔓 BOT READY</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-gaming font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded border border-rose-500/50 shadow-sm animate-pulse">
              <Lock className="w-3.5 h-3.5" />
              <span>🔒 BOT LOCKED</span>
            </span>
          )}

          <span className="text-[11px] font-mono-code text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
            STATE: <span className={isOnline ? 'text-emerald-400 font-bold' : isStarting ? 'text-amber-400 font-bold' : 'text-slate-300'}>{botStatus}</span>
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* BOT LOCK BANNER - When account is not authenticated */}
        {!isAuthenticated && (
          <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-600/50 text-xs text-rose-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-gaming font-bold text-sm text-rose-300">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>🔒 BOT LOCKED: Authentication Required</span>
              </div>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-gaming font-bold text-[11px] transition shadow"
                >
                  Authenticate Now
                </button>
              )}
            </div>
            <p className="text-slate-300 text-[11px]">
              The bot must NOT work without the user's Free Fire account authentication. Please authenticate your UID and password above before starting.
            </p>
          </div>
        )}

        {/* If there is no real backend, show requirement */}
        {noBackend && (
          <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 space-y-1">
            <div className="flex items-center gap-2 font-gaming font-bold text-sm text-rose-400">
              <span>🔴</span>
              <span>OFFLINE</span>
            </div>
            <p className="font-mono-code">No bot backend connected.</p>
          </div>
        )}

        {/* Readout specs: Saved UID, Region, Bot UID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#0a0e16] rounded-lg border border-[#1e2a3c]">
          <div>
            <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
              {isAuthenticated ? 'Authenticated UID' : 'Target UID'}
            </span>
            <span className="text-sm font-mono-code font-bold text-amber-400 break-all">
              {authenticatedUid || config?.uid || <span className="text-slate-500 italic">Not authenticated</span>}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
              Region
            </span>
            <span className="text-sm font-gaming font-bold text-sky-400">
              {config?.region || <span className="text-slate-500 italic">Not set</span>}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
              Bot Lock Status
            </span>
            <span className={`text-sm font-gaming font-bold ${isAuthenticated ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isAuthenticated ? '🔓 UNLOCKED (READY)' : '🔒 LOCKED'}
            </span>
          </div>
        </div>

        {/* Action Buttons: START BOT, STOP BOT, RESTART BOT */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* ▶ START BOT (DISABLED WHEN LOCKED) */}
          <button
            id="start-bot-btn"
            onClick={onStartBot}
            disabled={!isAuthenticated || isStarting}
            title={!isAuthenticated ? 'Bot locked: Account authentication required' : 'Start Bot process'}
            className={`py-3 px-4 rounded-lg font-gaming font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${
              !isAuthenticated
                ? 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed shadow-none'
                : isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50 hover:bg-emerald-900/60 shadow-emerald-950/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/30'
            } ${isStarting ? 'opacity-60 cursor-wait' : ''}`}
          >
            {!isAuthenticated ? (
              <>
                <Lock className="w-4 h-4 text-slate-500" />
                <span>🔒 BOT LOCKED</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isStarting ? 'STARTING...' : '▶ START BOT'}</span>
              </>
            )}
          </button>

          {/* ⏹ STOP BOT */}
          <button
            id="stop-bot-btn"
            onClick={onStopBot}
            disabled={isStarting || !isAuthenticated}
            className={`py-3 px-4 rounded-lg font-gaming font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${
              !isAuthenticated
                ? 'bg-slate-800/50 text-slate-600 border border-slate-700/40 cursor-not-allowed'
                : isOffline
                ? 'bg-rose-950/60 text-rose-300 border border-rose-600/50 hover:bg-rose-900/60 shadow-rose-950/40'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-700/30'
            } ${isStarting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Square className="w-4 h-4 fill-current" />
            <span>⏹ STOP BOT</span>
          </button>

          {/* 🔄 RESTART BOT */}
          <button
            id="restart-bot-btn"
            onClick={onRestartBot}
            disabled={isStarting || !isAuthenticated}
            className={`py-3 px-4 rounded-lg font-gaming font-bold text-sm tracking-wider flex items-center justify-center gap-2 bg-[#1a2336] text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-950/20 active:scale-[0.98] transition ${
              !isAuthenticated
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-[#222e47] disabled:opacity-50'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isStarting ? 'animate-spin' : ''}`} />
            <span>🔄 RESTART BOT</span>
          </button>
        </div>

        {/* Status prompt / hints */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${tcpStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>TCP Relay: <strong className="font-mono-code text-slate-200">{tcpStatus}</strong></span>
          </div>
          <span className="text-[11px] text-slate-400">
            {isAuthenticated ? '🟢 Authentication Verified' : '🔴 Authentication Missing'}
          </span>
        </div>
      </div>
    </div>
  );
};


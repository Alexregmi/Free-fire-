import React from 'react';
import { 
  Bot, 
  Clock, 
  Hourglass, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { BotStatus } from '../types';
import { formatRuntime } from '../utils/helpers';

interface BotControlPanelProps {
  botStatus: BotStatus;
  runtimeSeconds: number;
  bankedHours: number;
  tasksCompletedToday: number;
  maxDailyTasks?: number;
  onExtendTimeClick: () => void;
  demoMode: boolean;
}

export const BotControlPanel: React.FC<BotControlPanelProps> = ({
  botStatus,
  runtimeSeconds,
  bankedHours,
  tasksCompletedToday,
  maxDailyTasks = 5,
  onExtendTimeClick,
  demoMode,
}) => {
  const getStatusDisplay = () => {
    switch (botStatus) {
      case 'ONLINE':
        return { icon: '🟢', text: 'ONLINE', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40 glow-emerald' };
      case 'STARTING':
        return { icon: '🟡', text: 'STARTING', color: 'text-amber-400 bg-amber-950/40 border-amber-500/40 glow-orange' };
      case 'ERROR':
        return { icon: '⚠️', text: 'ERROR', color: 'text-rose-400 bg-rose-950/40 border-rose-500/40 glow-crimson' };
      case 'OFFLINE':
      default:
        return { icon: '🔴', text: 'OFFLINE', color: 'text-rose-400 bg-rose-950/30 border-rose-900/40' };
    }
  };

  const status = getStatusDisplay();

  return (
    <div 
      id="bot-control-panel-card"
      className="bg-[#101622] rounded-xl border border-[#232f45] shadow-xl overflow-hidden"
    >
      {/* Header with 🤖 Bot Control Panel */}
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-[#141c2c] to-[#101622]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-gaming text-white tracking-wide flex items-center gap-2">
              <span>🤖</span> <span>Bot Control Panel</span>
            </h2>
            <p className="text-xs text-slate-400">
              Operational telemetry & session quota monitor
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-gaming font-bold tracking-wider border ${status.color}`}>
            <span>{status.icon}</span>
            <span>{status.text}</span>
          </span>
        </div>
      </div>

      {/* 4 Core Metrics Grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Bot Status */}
        <div 
          id="status-bot-metric"
          className="p-4 rounded-lg bg-[#0b0f17] border border-[#1b2537] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-gaming tracking-wide uppercase">Bot Status</span>
            <span>{status.icon}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl">{status.icon}</span>
            <span className="text-2xl font-bold font-gaming tracking-wider text-white">
              {status.text}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{demoMode ? 'Simulated Local Process' : 'Live Node Process'}</span>
          </div>
        </div>

        {/* Metric 2: Runtime */}
        <div 
          id="status-runtime-metric"
          className="p-4 rounded-lg bg-[#0b0f17] border border-[#1b2537] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-gaming tracking-wide uppercase">Runtime</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono-code text-white tracking-wide">
              {formatRuntime(runtimeSeconds)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className={botStatus === 'ONLINE' ? 'text-emerald-400' : 'text-slate-500'}>
              {botStatus === 'ONLINE' ? '● Session in Progress' : '○ Standby Timer'}
            </span>
          </div>
        </div>

        {/* Metric 3: Expires */}
        <div 
          id="status-expires-metric"
          className="p-4 rounded-lg bg-[#0b0f17] border border-[#1b2537] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-gaming tracking-wide uppercase">Expires</span>
            <Hourglass className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-gaming text-amber-300 tracking-wide">
              {bankedHours.toFixed(1)}h banked
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Limit: 24.0h max</span>
            <span className="font-mono-code text-amber-400/90">{Math.round((bankedHours / 24) * 100)}%</span>
          </div>
        </div>

        {/* Metric 4: Tasks Today */}
        <div 
          id="status-tasks-metric"
          className="p-4 rounded-lg bg-[#0b0f17] border border-[#1b2537] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-gaming tracking-wide uppercase">Tasks Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono-code text-white tracking-wide">
              {tasksCompletedToday}/{maxDailyTasks}
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (tasksCompletedToday / maxDailyTasks) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task & Time Reward Action Strip */}
      <div className="px-5 py-4 bg-[#0d131e] border-t border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white font-gaming">
                Ready for a new task
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-code bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reward: <span className="text-amber-400 font-semibold font-mono-code">+2.0h</span> · Max 24.0h
            </p>
          </div>
        </div>

        <button
          id="extend-time-btn"
          onClick={onExtendTimeClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-gaming font-bold text-sm tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition"
        >
          <span>⏱ EXTEND TIME</span>
          <ChevronRight className="w-4 h-4 opacity-80" />
        </button>
      </div>
    </div>
  );
};

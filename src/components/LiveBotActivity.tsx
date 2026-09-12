import React, { useRef, useEffect, useState } from 'react';
import { 
  Activity, 
  Terminal, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  Radio, 
  ArrowDownCircle,
  AlertTriangle
} from 'lucide-react';
import { BotStatus, ConsoleLogEntry } from '../types';

interface LiveBotActivityProps {
  botStatus: BotStatus;
  activity: string;
  lastUpdate: string;
  heartbeatSeconds: number;
  logs: ConsoleLogEntry[];
  onRefreshLogs: () => void;
  onClearLogs: () => void;
  onCopyLogs: () => void;
  demoMode: boolean;
}

export const LiveBotActivity: React.FC<LiveBotActivityProps> = ({
  botStatus,
  activity,
  lastUpdate,
  heartbeatSeconds,
  logs,
  onRefreshLogs,
  onClearLogs,
  onCopyLogs,
  demoMode,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    onCopyLogs();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (botStatus) {
      case 'ONLINE':
        return {
          icon: '🟢',
          text: 'ONLINE',
          color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40 glow-emerald',
          sub: 'Bot is running',
        };
      case 'STARTING':
        return {
          icon: '🟡',
          text: 'STARTING',
          color: 'text-amber-400 bg-amber-950/40 border-amber-500/40 glow-orange',
          sub: 'Bot is starting',
        };
      case 'ERROR':
        return {
          icon: '⚠️',
          text: 'ERROR',
          color: 'text-rose-400 bg-rose-950/40 border-rose-500/40 glow-crimson',
          sub: 'Something went wrong',
        };
      case 'OFFLINE':
      default:
        return {
          icon: '🔴',
          text: 'OFFLINE',
          color: 'text-rose-400 bg-rose-950/30 border-rose-900/40',
          sub: 'Bot is stopped',
        };
    }
  };

  const currentBadge = getStatusBadge();

  return (
    <div 
      id="live-bot-activity-card"
      className="bg-[#0e1422] rounded-xl border border-[#233148] shadow-2xl overflow-hidden"
    >
      {/* Large Header Section */}
      <div className="px-6 py-5 border-b border-[#1c273a] bg-gradient-to-r from-[#141d2f] to-[#0e1422] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-gaming text-white tracking-wider flex items-center gap-2">
              <span>{currentBadge.icon}</span>
              <span>LIVE BOT ACTIVITY</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live daemon telemetry, task scheduler, and terminal output
            </p>
          </div>
        </div>

        {/* Status Indicators Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-gaming bg-[#090d15] px-3.5 py-2 rounded-lg border border-[#1b2537]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span>🟢</span> <span>ONLINE = Bot is running</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-amber-400">
            <span>🟡</span> <span>STARTING = Bot is starting</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-rose-400">
            <span>🔴</span> <span>OFFLINE = Bot is stopped</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-orange-400">
            <span>⚠️</span> <span>ERROR = Error</span>
          </span>
        </div>
      </div>

      {/* 4 Telemetry Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#0a0f18] border-b border-[#1a2538]">
        {/* Metric 1: Bot Status */}
        <div className="p-3.5 rounded-lg bg-[#0d1320] border border-[#1d293d]">
          <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
            Bot Status
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-base">{currentBadge.icon}</span>
            <span className="font-gaming font-bold text-sm tracking-wide text-white">
              {currentBadge.text}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {currentBadge.sub}
          </span>
        </div>

        {/* Metric 2: Activity */}
        <div className="p-3.5 rounded-lg bg-[#0d1320] border border-[#1d293d]">
          <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
            Activity
          </span>
          <div className="mt-1 font-mono-code text-sm font-semibold text-amber-300 truncate">
            {activity}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {botStatus === 'ONLINE' ? 'Worker process active' : 'Waiting for Start Bot'}
          </span>
        </div>

        {/* Metric 3: Last Update */}
        <div className="p-3.5 rounded-lg bg-[#0d1320] border border-[#1d293d]">
          <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
            Last Update
          </span>
          <div className="mt-1 font-mono-code text-sm font-semibold text-sky-400">
            {lastUpdate}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Telemetry sync
          </span>
        </div>

        {/* Metric 4: Last Heartbeat */}
        <div className="p-3.5 rounded-lg bg-[#0d1320] border border-[#1d293d]">
          <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
            Last Heartbeat
          </span>
          <div className="mt-1 font-mono-code text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>{heartbeatSeconds} seconds ago</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Keep-alive pulse
          </span>
        </div>
      </div>

      {/* Terminal Title Bar & Action Buttons */}
      <div className="px-5 py-3 bg-[#0c121e] border-b border-[#1a2538] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-gaming font-bold tracking-wider text-slate-200">
            SCROLLING LIVE CONSOLE
          </span>
          {demoMode && (
            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Demo Feed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 🔄 Refresh Logs */}
          <button
            id="activity-refresh-logs-btn"
            onClick={onRefreshLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#162132] hover:bg-[#1f2d45] border border-[#2a3c5a] text-slate-200 text-xs font-gaming font-semibold transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>🔄 Refresh Logs</span>
          </button>

          {/* 🧹 Clear Logs */}
          <button
            id="activity-clear-logs-btn"
            onClick={onClearLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#162132] hover:bg-rose-950/60 border border-[#2a3c5a] hover:border-rose-700/50 text-slate-300 hover:text-rose-300 text-xs font-gaming font-semibold transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>🧹 Clear Logs</span>
          </button>

          {/* 📋 Copy Logs */}
          <button
            id="activity-copy-logs-btn"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#162132] hover:bg-[#1f2d45] border border-[#2a3c5a] text-slate-200 text-xs font-gaming font-semibold transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : '📋 Copy Logs'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Window */}
      <div 
        ref={terminalRef}
        id="live-activity-terminal"
        className="p-4 sm:p-5 font-mono-code text-xs bg-[#070b12] min-h-[280px] max-h-[420px] overflow-y-auto space-y-1.5 select-text"
      >
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">No events logged yet. Waiting for bot activity...</p>
        ) : (
          logs.map((log) => {
            const isOnline = log.message.includes('🟢');
            const isStop = log.message.includes('🔴') || log.message.includes('🟡');
            const isTask = log.message.includes('🎮') || log.message.includes('✅') || log.message.includes('⚙️');
            const isError = log.message.includes('⚠️') || log.message.includes('Error');

            let textColor = 'text-slate-300';
            if (isOnline) textColor = 'text-emerald-400';
            else if (isError) textColor = 'text-rose-400';
            else if (isTask) textColor = 'text-sky-300';
            else if (isStop) textColor = 'text-amber-300';

            return (
              <div 
                key={log.id} 
                className="flex items-start gap-2 px-1.5 py-0.5 rounded hover:bg-slate-900/60 transition"
              >
                <span className="text-slate-600 select-none text-[11px] shrink-0 font-mono-code">
                  [{log.timestamp}]
                </span>
                <span className={`break-all ${textColor}`}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Status Footer */}
      <div className="px-5 py-2.5 bg-[#090e17] border-t border-[#1a2538] flex items-center justify-between text-[11px] text-slate-400 font-mono-code">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Event Channel: Active</span>
          <span className="text-slate-600">|</span>
          <span>{logs.length} logged entries</span>
        </div>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-1 hover:text-white transition ${
            autoScroll ? 'text-amber-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <ArrowDownCircle className="w-3 h-3" />
          <span>Auto-scroll: {autoScroll ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
};

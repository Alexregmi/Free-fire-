import React, { useRef, useEffect, useState } from 'react';
import { Terminal, RefreshCw, Trash2, Copy, Check, ArrowDownCircle, ShieldCheck } from 'lucide-react';
import { ConsoleLogEntry } from '../types';

interface LiveConsoleProps {
  logs: ConsoleLogEntry[];
  onRefreshLogs: () => void;
  onClearLogs: () => void;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({
  logs,
  onRefreshLogs,
  onClearLogs,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    const fullText = logs.map((l) => `${l.timestamp} ${l.message}`).join('\n');
    navigator.clipboard?.writeText(fullText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSourceColor = (msg: string) => {
    if (msg.includes('[Bot] Status: ONLINE')) return 'text-emerald-400 font-bold';
    if (msg.includes('[Bot] Status: OFFLINE')) return 'text-rose-400 font-bold';
    if (msg.includes('[Bot] Starting...') || msg.includes('[Bot] Stopping...')) return 'text-amber-400';
    if (msg.startsWith('[Error]')) return 'text-rose-400';
    if (msg.startsWith('[TCP]')) return 'text-sky-400';
    if (msg.startsWith('[Task]')) return 'text-purple-400';
    if (msg.startsWith('[System]')) return 'text-teal-300';
    return 'text-slate-300';
  };

  return (
    <div 
      id="console-card"
      className="bg-[#0b0e14] rounded-xl border border-[#232f45] shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Terminal Title Bar */}
      <div className="px-5 py-3.5 border-b border-[#1b2434] flex flex-wrap items-center justify-between gap-3 bg-[#0e1420]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-gaming font-bold tracking-wider text-white">
              Console
            </span>
            <span className="text-[10px] font-gaming px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              LIVE BOT STATUS
            </span>
          </div>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center gap-2">
          {/* Refresh Logs Button */}
          <button
            id="refresh-logs-btn"
            onClick={onRefreshLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#162132] hover:bg-[#1f2d45] border border-[#2a3c5a] text-slate-200 text-xs font-gaming font-semibold transition active:scale-95"
            title="Refresh logs from daemon buffer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>🔄 Refresh Logs</span>
          </button>

          {/* Copy Logs */}
          <button
            id="copy-logs-btn"
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-[#162132] hover:bg-[#1f2d45] border border-[#2a3c5a] text-slate-300 transition"
            title="Copy entire console log"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Logs */}
          <button
            id="clear-logs-btn"
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-[#162132] hover:bg-rose-950/50 border border-[#2a3c5a] hover:border-rose-700/50 text-slate-400 hover:text-rose-300 transition"
            title="Clear current terminal window"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div 
        id="console-viewport"
        className="p-4 sm:p-5 font-mono-code text-xs bg-[#070a10] min-h-[260px] max-h-[380px] overflow-y-auto space-y-1.5 border-b border-[#1b2434] select-text"
      >
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">No console logs recorded yet. Waiting for signals...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed hover:bg-slate-900/40 px-1 py-0.5 rounded transition">
              <span className="text-slate-600 select-none text-[11px] shrink-0">
                [{log.timestamp}]
              </span>
              <span className={`break-all ${getSourceColor(log.message)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer */}
      <div className="px-5 py-2.5 bg-[#090d14] flex items-center justify-between text-[11px] text-slate-400 font-mono-code">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SOCKET: LISTEN / TCP</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>{logs.length} entries</span>
        </div>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-1 hover:text-white transition ${
            autoScroll ? 'text-amber-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <ArrowDownCircle className="w-3 h-3" />
          <span>Auto-scroll: {autoScroll ? 'ON' : 'PAUSED'}</span>
        </button>
      </div>
    </div>
  );
};

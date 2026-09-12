import React from 'react';
import { Network, Wifi, WifiOff, Server, ShieldCheck, Activity } from 'lucide-react';
import { TcpStatus } from '../types';

interface TcpStatusCardProps {
  tcpStatus: TcpStatus;
  serverNode: string;
  latencyMs: number;
  packetsReceived: number;
  packetsSent: number;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const TcpStatusCard: React.FC<TcpStatusCardProps> = ({
  tcpStatus,
  serverNode,
  latencyMs,
  packetsReceived,
  packetsSent,
  onConnect,
  onDisconnect,
}) => {
  const isConnected = tcpStatus === 'CONNECTED';
  const isConnecting = tcpStatus === 'CONNECTING';

  return (
    <div 
      id="tcp-connection-card"
      className="bg-[#101622] rounded-xl border border-[#232f45] shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-[#141c2c] to-[#101622]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-gaming text-white tracking-wide flex items-center gap-2">
              <span>🔌</span> <span>TCP Connection</span>
            </h2>
            <p className="text-xs text-slate-400">
              Legitimate backend gateway bridge
            </p>
          </div>
        </div>

        {/* Status: 🔴 DISCONNECTED / 🟢 CONNECTED */}
        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-gaming font-bold tracking-wider border ${
            isConnected
              ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40'
              : isConnecting
              ? 'text-amber-400 bg-amber-950/40 border-amber-500/40'
              : 'text-rose-400 bg-rose-950/40 border-rose-900/40'
          }`}>
            <span>{isConnected ? '🟢' : isConnecting ? '🟡' : '🔴'}</span>
            <span>{isConnected ? 'CONNECTED' : isConnecting ? 'CONNECTING...' : 'DISCONNECTED'}</span>
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* 3 Metric Rows: Connection, Server, Latency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Connection */}
          <div className="p-3 bg-[#0a0e16] rounded-lg border border-[#1e2a3c]">
            <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
              Connection
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-gaming font-bold text-emerald-400">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-gaming font-bold text-rose-400">Disconnected</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono-code">
              TLS 1.3 / TCP Socket
            </span>
          </div>

          {/* Server */}
          <div className="p-3 bg-[#0a0e16] rounded-lg border border-[#1e2a3c]">
            <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
              Server
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-mono-code font-bold text-slate-200 truncate">
                {isConnected ? serverNode : 'Not connected'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono-code">
              Port 443 / Authorized Relay
            </span>
          </div>

          {/* Latency */}
          <div className="p-3 bg-[#0a0e16] rounded-lg border border-[#1e2a3c]">
            <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
              Latency
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-mono-code font-bold text-amber-300">
                {isConnected ? `${latencyMs} ms` : '--'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono-code">
              Packets: {isConnected ? `${packetsReceived} rx / ${packetsSent} tx` : 'Idle'}
            </span>
          </div>
        </div>

        {/* Buttons: CONNECT, DISCONNECT */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            id="tcp-connect-btn"
            onClick={onConnect}
            disabled={isConnected || isConnecting}
            className={`py-2.5 px-4 rounded-lg font-gaming font-bold text-xs tracking-wider flex items-center justify-center gap-2 border transition active:scale-95 ${
              isConnected
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-950/50'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>CONNECT</span>
          </button>

          <button
            id="tcp-disconnect-btn"
            onClick={onDisconnect}
            disabled={!isConnected || isConnecting}
            className={`py-2.5 px-4 rounded-lg font-gaming font-bold text-xs tracking-wider flex items-center justify-center gap-2 border transition active:scale-95 ${
              !isConnected
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-800/60'
            }`}
          >
            <WifiOff className="w-4 h-4" />
            <span>DISCONNECT</span>
          </button>
        </div>

        {/* Security Rule & Mandatory Disclaimer */}
        <div className="p-2.5 rounded-lg bg-[#0a0e16] border border-[#1b2537] text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Security Notice:</strong> The TCP system must only communicate with the website's legitimate backend service. Do NOT connect to private Free Fire traffic or attempt to manipulate the game's network protocol.
          </p>
        </div>
      </div>
    </div>
  );
};

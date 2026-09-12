import React from 'react';
import { AlertTriangle, Info, ToggleLeft, ToggleRight } from 'lucide-react';

interface DemoModeBannerProps {
  demoMode: boolean;
  onToggleDemoMode: () => void;
  tcpConnected: boolean;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  demoMode,
  onToggleDemoMode,
  tcpConnected,
}) => {
  return (
    <div 
      id="demo-mode-banner"
      className="bg-[#181206] border-b border-amber-500/40 px-4 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      <div className="flex items-center gap-2.5">
        <span className="p-1 rounded bg-amber-500/20 text-amber-400">
          <AlertTriangle className="w-4 h-4" />
        </span>
        <div>
          <span className="font-gaming font-bold tracking-wider text-amber-300 mr-2">
            🟡 DEMO MODE
          </span>
          <span className="text-slate-300">
            Backend connection required for real account/API actions. Interface demonstrates client-side controls and simulated events.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-400 font-mono-code hidden sm:inline">
          {tcpConnected ? 'Relay Handshake: Simulated OK' : 'Relay: Offline'}
        </span>
        <button
          onClick={onToggleDemoMode}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-gaming font-semibold text-[11px] transition"
          title="Toggle between Demo Mode and Production Gateway mode"
        >
          {demoMode ? (
            <>
              <ToggleRight className="w-4 h-4 text-amber-400" />
              <span>DEMO ON</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-slate-400" />
              <span>LIVE API</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

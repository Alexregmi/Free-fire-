import React, { useState } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Radio, 
  Send, 
  Volume2, 
  VolumeX, 
  Zap, 
  ShieldCheck, 
  Crown, 
  Users, 
  Flame, 
  Gamepad2,
  Tv
} from 'lucide-react';
import { FreeFireInGameHUD } from './FreeFireInGameHUD';
import { FF_EMOTES_DATABASE } from '../data/emotesData';
import { brainEngine } from '../services/brainEngine';

interface FreeFireInGameFloatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedUid: string;
  region: string;
  onLogMessage: (msg: string, type?: any) => void;
  onShowNotification: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
}

export const FreeFireInGameFloatingModal: React.FC<FreeFireInGameFloatingModalProps> = ({
  isOpen,
  onClose,
  savedUid,
  region,
  onLogMessage,
  onShowNotification,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`w-full ${isFullscreen ? 'h-full max-w-none' : 'max-w-6xl max-h-[92vh]'} flex flex-col bg-[#080d16] border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden transition-all duration-300`}
      >
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-[#0d1524] border-b border-[#1c2942] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-gaming font-bold text-white tracking-wide">
                  🎮 FREE FIRE IN-GAME CLIENT VIEW
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-gaming font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  OB54 LIVE
                </span>
                <span className="text-[10px] font-mono-code text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  TCP :39004
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-gaming">
                Simulating Free Fire Mobile & Emulator in-game execution for UID {savedUid} ({region})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-[#141f33] hover:bg-[#1d2d4a] text-slate-300 hover:text-white transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen In-Game View'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-800/50 transition"
              title="Close In-Game HUD"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Free Fire In-Game HUD Component */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#05080e]">
          <FreeFireInGameHUD
            botUid={savedUid}
            botNickname={`Phoenix_${savedUid.slice(-4)}`}
            onLogMessage={(msg) => onLogMessage(msg, 'task')}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[#090f1b] border-t border-[#172338] flex flex-wrap items-center justify-between gap-3 text-xs font-gaming text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TCP Relay Socket Connected to Free Fire Regional Bridge</span>
          </div>
          <div className="flex items-center gap-3 font-mono-code text-[11px]">
            <span>Proto: sQ_pb2</span>
            <span>Packet Delay: 18ms</span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-gaming font-bold transition"
            >
              Close In-Game HUD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

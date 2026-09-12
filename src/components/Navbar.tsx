import React, { useState } from 'react';
import { 
  Flame, 
  Menu, 
  Wifi, 
  WifiOff, 
  User, 
  ChevronDown, 
  Sliders, 
  ShieldCheck, 
  ExternalLink,
  Edit3,
  RefreshCw,
  Gamepad2
} from 'lucide-react';
import { BotStatus, TcpStatus } from '../types';

interface NavbarProps {
  onToggleSidebarMobile: () => void;
  botStatus: BotStatus;
  tcpStatus: TcpStatus;
  savedUid: string;
  region: string;
  onOpenSettings: () => void;
  onRefreshAll: () => void;
  isAuthenticated?: boolean;
  onOpenAuth?: () => void;
  onOpenInGameMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebarMobile,
  botStatus,
  tcpStatus,
  savedUid,
  region,
  onOpenSettings,
  onRefreshAll,
  isAuthenticated = false,
  onOpenAuth,
  onOpenInGameMode,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const isOnline = botStatus === 'ONLINE';
  const isTcpConnected = tcpStatus === 'CONNECTED';

  return (
    <header 
      id="app-topbar"
      className="h-16 bg-[#0c111c] border-b border-[#1a2538] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md"
    >
      {/* Left: Mobile hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
          <span className="font-gaming font-bold text-base sm:text-lg text-white tracking-wider">
            🔥 Free Fire Bot Panel
          </span>
        </div>
      </div>

      {/* Right: In Free Fire Button, Auth Lock, Connection, UID, Region, Profile menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* IN FREE FIRE GAME BUTTON */}
        {onOpenInGameMode && (
          <button
            onClick={onOpenInGameMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-gaming text-xs font-bold shadow-md shadow-orange-500/20 transition active:scale-95"
            title="Open In-Game Free Fire Floating Client HUD"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">🎮 In Free Fire</span>
            <span className="sm:hidden">Game</span>
          </button>
        )}

        {/* Auth Lock Pill */}
        {isAuthenticated ? (
          <div 
            id="topbar-auth-badge"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs font-gaming text-emerald-300 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="hidden sm:inline">🔓 BOT READY</span>
          </div>
        ) : (
          <button
            id="topbar-auth-badge-locked"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/50 text-xs font-gaming text-rose-300 shadow-sm transition animate-pulse"
            title="Click to authenticate Free Fire account"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>🔒 BOT LOCKED</span>
          </button>
        )}

        {/* Connection status indicator */}
        <div 
          id="topbar-connection-badge"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080c14] border border-[#1a2538] text-xs font-gaming"
        >
          <span className="text-slate-400">TCP:</span>
          {isTcpConnected ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span>🟢</span> <span>Online</span>
            </span>
          ) : (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <span>🔴</span> <span>Offline</span>
            </span>
          )}
        </div>

        {/* UID Badge (Hidden on very small screens) */}
        <div 
          id="topbar-uid-badge"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080c14] border border-[#1a2538] text-xs"
        >
          <span className="text-slate-400 font-gaming">UID:</span>
          <span className="font-mono-code font-bold text-amber-400 truncate max-w-[120px]">
            {savedUid || 'Not Set'}
          </span>
        </div>

        {/* Region Badge */}
        <div 
          id="topbar-region-badge"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080c14] border border-[#1a2538] text-xs"
        >
          <span className="text-slate-400 font-gaming">Region:</span>
          <span className="font-gaming font-semibold text-sky-400">
            {region || 'SG'}
          </span>
        </div>

        {/* Refresh All icon */}
        <button
          onClick={onRefreshAll}
          className="p-2 rounded-lg bg-[#141b2b] hover:bg-[#1d273e] text-slate-300 hover:text-white border border-[#22314c] transition"
          title="Refresh All Telemetry"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
        </button>

        {/* Profile menu */}
        <div className="relative">
          <button
            id="topbar-profile-menu-btn"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-[#141b2b] hover:bg-[#1c273e] border border-[#22314c] transition text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-gaming font-bold text-xs">
              {savedUid ? savedUid.slice(-2) : 'FF'}
            </div>
            <span className="text-xs font-gaming text-slate-200 hidden sm:inline">
              Operator
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div 
              id="topbar-profile-dropdown"
              className="absolute right-0 mt-2 w-56 bg-[#111724] rounded-xl border border-[#232f45] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-3.5 py-2 border-b border-[#1e2a3c] mb-1">
                <p className="text-xs font-gaming font-bold text-white">
                  Free Fire Controller
                </p>
                <p className="text-[11px] font-mono-code text-amber-400 truncate mt-0.5">
                  UID: {savedUid || 'Unconfigured'}
                </p>
                <p className="text-[10px] text-slate-400 font-gaming">
                  Region: {region}
                </p>
              </div>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onOpenSettings();
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-gaming text-slate-300 hover:text-white hover:bg-[#1a2436] flex items-center gap-2 transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                <span>Account Setup & Details</span>
              </button>

              <div className="my-1 border-t border-[#1e2a3c]" />

              <div className="px-3.5 py-1.5 text-[10px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Password Architecture</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

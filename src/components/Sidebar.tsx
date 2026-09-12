import React from 'react';
import { 
  Flame, 
  LayoutDashboard, 
  Brain,
  Bot, 
  Network, 
  Wrench, 
  Users, 
  Castle, 
  User, 
  Terminal, 
  Settings, 
  X, 
  ShieldCheck,
  Trophy,
  Gamepad2
} from 'lucide-react';
import { BotStatus } from '../types';

export type NavTab = 
  | 'dashboard'
  | 'the-brain'
  | 'bot-control'
  | 'freefire-stats'
  | 'tcp-connection'
  | 'tools-center'
  | 'friends'
  | 'guild'
  | 'account-info'
  | 'live-console'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  botStatus: BotStatus;
  savedUid: string;
  region: string;
  isAuthenticated?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  botStatus,
  savedUid,
  region,
  isAuthenticated = false,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'the-brain' as NavTab, label: '🧠 The Brain', icon: Brain },
    { id: 'freefire-stats' as NavTab, label: '📈 Free Fire Stats API', icon: Trophy },
    { id: 'bot-control' as NavTab, label: '🤖 Bot Control', icon: Bot },
    { id: 'tcp-connection' as NavTab, label: '🔌 TCP Connection', icon: Network },
    { id: 'tools-center' as NavTab, label: '🛠 Tools Center', icon: Wrench },
    { id: 'friends' as NavTab, label: '👥 Friends', icon: Users },
    { id: 'guild' as NavTab, label: '🏰 Guild', icon: Castle },
    { id: 'account-info' as NavTab, label: '📊 Account Info', icon: User },
    { id: 'live-console' as NavTab, label: '📜 Live Console', icon: Terminal },
    { id: 'settings' as NavTab, label: '⚙️ Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside 
        id="app-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-[#0a0e17] border-r border-[#1a2538] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-[#1a2538] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold font-gaming text-white tracking-wider">
                  🔥 Free Fire Bot
                </h1>
                <span className="text-[10px] font-mono-code text-amber-400">
                  v3.4.0 · AI Control
                </span>
              </div>
            </div>

            <button 
              onClick={onCloseMobile}
              className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-gaming font-semibold tracking-wide transition group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.id === 'bot-control' && (
                    <span
                      className={`text-[9px] font-gaming px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isAuthenticated
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-600/40'
                      }`}
                    >
                      {isAuthenticated ? 'READY' : 'LOCKED'}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Security Badge */}
        <div className="p-4 border-t border-[#1a2538] bg-[#070b12] space-y-2.5">
          <div className="p-2.5 rounded-lg bg-[#0e1422] border border-[#1b2537]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-gaming">AUTH STATE</span>
              <span
                className={`font-mono-code font-bold ${
                  isAuthenticated ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isAuthenticated ? '🟢 AUTHENTICATED' : '🔒 BOT LOCKED'}
              </span>
            </div>
            <div className="font-mono-code text-xs font-bold text-amber-300 truncate mt-0.5">
              UID: {savedUid || 'Not set'}
            </div>
            <div className="text-[10px] text-slate-400 font-gaming mt-0.5">
              Region: {region}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-gaming">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Official Gateway Auth</span>
          </div>
        </div>
      </aside>
    </>
  );
};

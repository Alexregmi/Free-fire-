import React, { useState } from 'react';
import { 
  Wrench, 
  Users, 
  ShieldAlert, 
  Castle, 
  UserPlus, 
  UserMinus, 
  List, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Info,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { ToolResponseState, FriendItem, GuildInfo } from '../types';

interface ToolsCenterProps {
  toolResponse: ToolResponseState;
  onAddFriendClick: () => void;
  onRemoveFriendClick: () => void;
  onViewFriendsClick: () => void;
  onJoinGuildClick: () => void;
  onLeaveGuildClick: () => void;
  currentGuild: GuildInfo | null;
  friendCount: number;
}

export const ToolsCenter: React.FC<ToolsCenterProps> = ({
  toolResponse,
  onAddFriendClick,
  onRemoveFriendClick,
  onViewFriendsClick,
  onJoinGuildClick,
  onLeaveGuildClick,
  currentGuild,
  friendCount,
}) => {
  return (
    <div 
      id="tools-center-section"
      className="bg-[#101622] rounded-xl border border-[#232f45] shadow-xl overflow-hidden"
    >
      {/* Tools Center Main Header */}
      <div className="px-6 py-4 border-b border-[#1e293b] bg-gradient-to-r from-[#172235] to-[#101622] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-gaming text-white tracking-wide">
              🛠️ Tools Center
            </h2>
            <p className="text-xs text-slate-400">
              Manage your account
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono-code bg-[#0b0e15] px-3 py-1.5 rounded-lg border border-[#1a2538]">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>Authorized Game Direct APIs</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Two Columns: Friend Manager & Guild Manager */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sub-section 1: 👥 Friend Manager */}
          <div 
            id="friend-manager-card"
            className="p-5 rounded-xl bg-[#0a0f18] border border-[#1d273a] flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-400" />
                  <h3 className="font-gaming font-bold text-sm text-white tracking-wide">
                    👥 Friend Manager
                  </h3>
                </div>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                  {friendCount} Friends
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Friend actions
              </p>

              {/* Friend Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* ➕ Add Friend */}
                <button
                  id="add-friend-btn"
                  onClick={onAddFriendClick}
                  className="py-2.5 px-3 rounded-lg bg-[#141e2e] hover:bg-[#1c2a40] text-sky-300 border border-sky-500/30 font-gaming font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5 text-sky-400" />
                  <span>➕ Add Friend</span>
                </button>

                {/* ➖ Remove Friend */}
                <button
                  id="remove-friend-btn"
                  onClick={onRemoveFriendClick}
                  className="py-2.5 px-3 rounded-lg bg-[#141e2e] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-[#25354e] hover:border-rose-800/40 font-gaming font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <UserMinus className="w-3.5 h-3.5 text-rose-400" />
                  <span>➖ Remove Friend</span>
                </button>

                {/* 👥 View Friend List */}
                <button
                  id="view-friends-btn"
                  onClick={onViewFriendsClick}
                  className="py-2.5 px-3 rounded-lg bg-[#141e2e] hover:bg-[#1c2a40] text-slate-200 border border-[#25354e] font-gaming font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <List className="w-3.5 h-3.5 text-amber-400" />
                  <span>👥 View Friend List</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Validates target UID and dispatches request strictly via authorized public player gateway.
            </p>
          </div>

          {/* Sub-section 2: 🏰 Guild Manager */}
          <div 
            id="guild-manager-card"
            className="p-5 rounded-xl bg-[#0a0f18] border border-[#1d273a] flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Castle className="w-5 h-5 text-amber-400" />
                  <h3 className="font-gaming font-bold text-sm text-white tracking-wide">
                    🏰 Guild Manager
                  </h3>
                </div>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {currentGuild ? currentGuild.name : 'No Guild'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Guild actions
              </p>

              {/* Guild Status info */}
              {currentGuild && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-[#0d1421] border border-[#1d2b3f] text-xs flex items-center justify-between">
                  <span className="text-slate-300 font-gaming">Current: <strong className="text-white">{currentGuild.name}</strong></span>
                  <span className="text-amber-400 font-mono-code">Lv. {currentGuild.level} ({currentGuild.membersCount}/{currentGuild.maxMembers})</span>
                </div>
              )}

              {/* Guild Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* ➕ Join Guild */}
                <button
                  id="join-guild-btn"
                  onClick={onJoinGuildClick}
                  className="py-2.5 px-3 rounded-lg bg-[#141e2e] hover:bg-[#1c2a40] text-amber-300 border border-amber-500/30 font-gaming font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>➕ Join Guild</span>
                </button>

                {/* 🚪 Leave Guild */}
                <button
                  id="leave-guild-btn"
                  onClick={onLeaveGuildClick}
                  disabled={!currentGuild}
                  className="py-2.5 px-3 rounded-lg bg-[#141e2e] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-[#25354e] hover:border-rose-800/40 font-gaming font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>🚪 Leave Guild</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Requires valid 6-10 digit Guild ID and checks official quota limits.
            </p>
          </div>
        </div>

        {/* Sub-section 3: Tool Response (at the bottom of Tools Center) */}
        <div 
          id="tool-response-panel"
          className="p-4 rounded-xl bg-[#090d15] border border-[#1b2538] space-y-2.5"
        >
          <div className="flex items-center justify-between border-b border-[#162030] pb-2">
            <span className="text-xs font-gaming font-bold uppercase tracking-wider text-slate-300">
              Tool Response
            </span>
            {toolResponse.timestamp && (
              <span className="text-[11px] font-mono-code text-slate-500">
                {toolResponse.timestamp}
              </span>
            )}
          </div>

          {toolResponse.status === 'idle' ? (
            <div className="py-2 text-xs text-slate-400 space-y-1">
              <p className="font-gaming font-semibold text-slate-300">
                Awaiting action
              </p>
              <p className="text-slate-500">
                Run a tool action to see the response.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-gaming">Action:</span>
                <span className="font-mono-code font-bold text-white">
                  {toolResponse.action}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 font-gaming">Status:</span>
                <span className={`font-mono-code font-bold ${
                  toolResponse.status === 'processing'
                    ? 'text-amber-400 animate-pulse'
                    : toolResponse.status === 'success'
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}>
                  {toolResponse.status === 'processing' ? 'Processing...' : toolResponse.status.toUpperCase()}
                </span>
              </div>

              <div className="pt-1">
                {toolResponse.status === 'processing' && (
                  <p className="text-amber-300/90 font-mono-code flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Response: {toolResponse.response}</span>
                  </p>
                )}

                {toolResponse.status === 'success' && (
                  <p className="text-emerald-300 font-mono-code flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>✅ {toolResponse.response}</span>
                  </p>
                )}

                {toolResponse.status === 'error' && (
                  <div className="space-y-1">
                    <p className="text-rose-300 font-mono-code flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>⚠️ {toolResponse.response}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 pl-5">
                      Please check the UID, connection, or API status.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

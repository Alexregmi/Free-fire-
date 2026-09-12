import React, { useState } from 'react';
import { User, RefreshCw, Copy, Check, ShieldCheck, Award, ThumbsUp } from 'lucide-react';
import { GameAccountInfo as GameAccountInfoType } from '../types';

interface GameAccountInfoProps {
  accountInfo: GameAccountInfoType;
  savedUid: string;
  selectedRegion: string;
  onRefreshInfo: () => void;
  isLoading?: boolean;
}

export const GameAccountInfo: React.FC<GameAccountInfoProps> = ({
  accountInfo,
  savedUid,
  selectedRegion,
  onRefreshInfo,
  isLoading = false,
}) => {
  const [copiedBio, setCopiedBio] = useState(false);

  const handleCopyBio = () => {
    const textToCopy = accountInfo.bio || 'No bio found.';
    navigator.clipboard?.writeText(textToCopy).catch(() => {});
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2000);
  };

  return (
    <div 
      id="game-account-info-card"
      className="bg-[#101622] rounded-xl border border-[#232f45] shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-[#141c2c] to-[#101622]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-gaming text-white tracking-wide flex items-center gap-2">
              <span>📊</span> <span>Game Account Info</span>
            </h2>
            <p className="text-xs text-slate-400">
              Authorized public player profile metadata
            </p>
          </div>
        </div>

        {/* Button: 🔄 Refresh Info */}
        <button
          id="refresh-account-info-btn"
          onClick={onRefreshInfo}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182335] hover:bg-[#202f48] border border-[#2a3c5a] text-slate-200 text-xs font-gaming font-semibold transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>🔄 Refresh Info</span>
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Player Name */}
          <div className="p-3 bg-[#0a0e16] rounded-lg border border-[#1e2a3c]">
            <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
              Player Name
            </span>
            <span className="text-sm font-gaming font-bold text-white mt-1 block">
              {accountInfo.playerName || 'Unknown'}
            </span>
          </div>

          {/* UID */}
          <div className="p-3 bg-[#0a0e16] rounded-lg border border-[#1e2a3c]">
            <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
              UID
            </span>
            <span className="text-sm font-mono-code font-bold text-amber-400 mt-1 block break-all">
              {savedUid || 'Saved UID'}
            </span>
          </div>

          {/* Level */}
          <div className="p-3 bg-[#0a0e16] rounded-lg border border-[#1e2a3c]">
            <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
              Level
            </span>
            <span className="text-sm font-mono-code font-bold text-sky-400 mt-1 block">
              {accountInfo.level || 'Unknown'}
            </span>
          </div>

          {/* Region */}
          <div className="p-3 bg-[#0a0e16] rounded-lg border border-[#1e2a3c]">
            <span className="text-[11px] font-gaming text-slate-400 block uppercase tracking-wider">
              Region
            </span>
            <span className="text-sm font-gaming font-bold text-slate-200 mt-1 block">
              {selectedRegion || 'Selected Region'}
            </span>
          </div>
        </div>

        {/* Bio Section with Button: 📋 COPY BIO */}
        <div className="p-3.5 bg-[#0a0e16] rounded-lg border border-[#1e2a3c] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-gaming text-slate-400 uppercase tracking-wider">
              Bio
            </span>
            <button
              id="copy-bio-btn"
              onClick={handleCopyBio}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#162132] hover:bg-[#1f2e46] text-amber-300 hover:text-amber-200 text-xs font-gaming transition active:scale-95 border border-amber-500/30"
            >
              {copiedBio ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedBio ? 'Copied' : '📋 COPY BIO'}</span>
            </button>
          </div>

          <div className="p-2.5 rounded bg-[#070a10] border border-[#182335] text-xs font-mono-code text-slate-300 min-h-[40px] flex items-center">
            {accountInfo.bio || 'No bio found.'}
          </div>
        </div>

        {/* Extra authorized fields when available */}
        {accountInfo.rank && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono-code">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Award className="w-4 h-4" />
              <span>Rank: {accountInfo.rank}</span>
            </span>
            {accountInfo.likes !== undefined && (
              <span className="flex items-center gap-1.5 text-rose-400">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{accountInfo.likes.toLocaleString()} Likes</span>
              </span>
            )}
          </div>
        )}

        {/* Mandatory Security Notice */}
        <div className="p-2 rounded bg-[#090d15] border border-[#1a2538] text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Only show information obtained through an authorized API or information supplied by the user.</span>
        </div>
      </div>
    </div>
  );
};

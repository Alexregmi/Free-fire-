import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Heart, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  Crosshair, 
  Award, 
  Crown, 
  Users, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Flame
} from 'lucide-react';
import { FreeFireFullStats } from '../types';
import { freeFireStatsApi } from '../services/freeFireStatsApi';

interface FreeFireAccountStatsViewerProps {
  currentUid: string;
  currentRegion: string;
  onShowNotification: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  onLogMessage: (msg: string, type?: any) => void;
}

export const FreeFireAccountStatsViewer: React.FC<FreeFireAccountStatsViewerProps> = ({
  currentUid,
  currentRegion,
  onShowNotification,
  onLogMessage,
}) => {
  const [searchUid, setSearchUid] = useState(currentUid || '1029384756');
  const [searchRegion, setSearchRegion] = useState(currentRegion || 'SG');
  const [stats, setStats] = useState<FreeFireFullStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingLike, setIsSendingLike] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{ valid: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'br' | 'cs' | 'pet' | 'guild'>('br');

  const fetchStats = async (uidToFetch = searchUid, regionToFetch = searchRegion) => {
    if (!uidToFetch) return;
    setIsLoading(true);
    setValidationStatus(null);
    onLogMessage(`[API] Querying Free Fire Account Info & Stats for UID ${uidToFetch}...`, 'info');

    try {
      // 1. UID validation
      const validation = await freeFireStatsApi.validateUid(uidToFetch, regionToFetch);
      setValidationStatus({ valid: validation.valid, message: validation.message });

      // 2. Full Account Stats
      const data = await freeFireStatsApi.getFullStats(uidToFetch, regionToFetch);
      setStats(data);
      onLogMessage(`[API] Free Fire Account stats synchronized for ${data.nickname} (Lv. ${data.level})`, 'online');
    } catch (err: any) {
      onShowNotification('error', 'Query Failed', err?.message || 'Failed to fetch player stats.');
      onLogMessage(`[API] Query failed: ${err?.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(currentUid || '1029384756', currentRegion || 'SG');
  }, [currentUid, currentRegion]);

  const handleSendLike = async () => {
    if (!stats?.uid) return;
    setIsSendingLike(true);
    onLogMessage(`[API] Dispatching In-Game Profile Like to UID ${stats.uid}...`, 'task');

    try {
      const res = await freeFireStatsApi.sendInGameLike(stats.uid, stats.region);
      if (res.success) {
        setStats((prev) => prev ? { ...prev, likes: res.currentLikes } : prev);
        onShowNotification('success', 'In-Game Like Sent! 💖', res.message);
        onLogMessage(res.message, 'online');
      } else {
        onShowNotification('warning', 'Daily Limit Reached', res.message);
        onLogMessage(`[API] ${res.message}`, 'offline');
      }
    } catch (err: any) {
      onShowNotification('error', 'Like Failed', err?.message || 'Unable to send in-game like.');
    } finally {
      setIsSendingLike(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="p-5 rounded-2xl bg-[#0c1322] border border-[#1b273d] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-gaming text-amber-400 font-bold uppercase tracking-wider">
                Official Free Fire API Integration
              </span>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                OB54 READY
              </span>
            </div>
            <h2 className="text-xl font-bold font-gaming text-white mt-1">
              📊 Free Fire Account Info & Battle Stats
            </h2>
            <p className="text-xs text-slate-400 font-gaming mt-0.5">
              Powered by HL Gaming Free Fire API (All-in-One). Look up any global Free Fire player stats and send in-game likes.
            </p>
          </div>

          <button
            onClick={() => fetchStats()}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-[#152033] hover:bg-[#1e2e4a] border border-[#233554] text-slate-200 font-gaming text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {/* Search Form */}
        <div className="mt-4 pt-4 border-t border-[#19253a] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchUid}
              onChange={(e) => setSearchUid(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="Enter Free Fire UID (e.g. 1029384756)"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080d16] border border-[#1d2a40] text-amber-300 font-mono-code text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={searchRegion}
            onChange={(e) => setSearchRegion(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#080d16] border border-[#1d2a40] text-slate-200 font-gaming text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="SG">Singapore (SG)</option>
            <option value="BD">Bangladesh (BD)</option>
            <option value="IND">India (IND)</option>
            <option value="ID">Indonesia (ID)</option>
            <option value="BR">Brazil (BR)</option>
            <option value="NA">North America (NA)</option>
            <option value="ME">Middle East (ME)</option>
            <option value="PK">Pakistan (PK)</option>
          </select>

          <button
            onClick={() => fetchStats()}
            disabled={isLoading || !searchUid}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-gaming text-xs font-bold shadow-md shadow-orange-500/20 transition active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Fetching...' : 'Query Player'}
          </button>
        </div>

        {validationStatus && (
          <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-gaming flex items-center gap-2 ${
            validationStatus.valid ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
          }`}>
            {validationStatus.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{validationStatus.message}</span>
          </div>
        )}
      </div>

      {stats && (
        <>
          {/* Player Overview Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#0e1729] to-[#0a0f1c] border border-amber-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Profile Bio & Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-0.5 shadow-xl shadow-orange-500/30 shrink-0">
                  <div className="w-full h-full bg-[#090e18] rounded-[14px] flex flex-col items-center justify-center text-amber-400 font-gaming">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <span className="text-[10px] font-bold mt-0.5">Lv.{stats.level}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-gaming text-white tracking-wide">
                      {stats.nickname}
                    </h3>
                    <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[#182338] text-amber-300 border border-[#233554]">
                      UID: {stats.uid}
                    </span>
                    <span className="text-xs font-gaming px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                      {stats.region}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic mt-1 font-sans">
                    "{stats.bio}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-gaming text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Created: {stats.createdAt}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Credit Score: <strong className="text-emerald-300">{stats.creditScore}/100</strong></span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Likes Counter & Like Generator Button */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-xl bg-[#080d16] border border-[#1e2a40] text-center">
                  <div className="text-[10px] font-gaming text-slate-400 uppercase">Total Likes</div>
                  <div className="text-lg font-mono-code font-bold text-rose-400 flex items-center justify-center gap-1">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    <span>{stats.likes.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleSendLike}
                  disabled={isSendingLike}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-gaming text-xs font-bold shadow-lg shadow-rose-600/30 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  title="Send in-game profile like via Free Fire Likes API"
                >
                  <Heart className={`w-4 h-4 fill-current ${isSendingLike ? 'animate-ping' : ''}`} />
                  <span>{isSendingLike ? 'Sending Like...' : '💖 Send In-Game Like (+1)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subtabs: Battle Royale Ranked vs Clash Squad vs Pet vs Guild */}
          <div className="flex items-center gap-2 border-b border-[#1b263b] pb-2">
            {[
              { id: 'br', label: '🏆 Battle Royale Ranked', icon: Trophy },
              { id: 'cs', label: '⚔️ Clash Squad Ranked', icon: Crosshair },
              { id: 'pet', label: '🐺 Equipped Pet', icon: Award },
              { id: 'guild', label: '🏰 Guild Details', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-gaming font-semibold flex items-center gap-2 transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                      : 'bg-[#0e1422] text-slate-400 hover:text-white border border-[#1c273c]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Battle Royale Stats */}
          {activeTab === 'br' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">BR Rank</span>
                <div className="text-base font-bold font-gaming text-amber-400 mt-1">
                  {stats.brRanked.rankName}
                </div>
                <span className="text-[10px] font-mono-code text-slate-400">{stats.brRanked.rankPoints} Points</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">K/D Ratio</span>
                <div className="text-2xl font-mono-code font-bold text-white mt-1">
                  {stats.brRanked.kdRatio}
                </div>
                <span className="text-[10px] text-emerald-400 font-gaming">Elite Combat</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">Win Rate</span>
                <div className="text-2xl font-mono-code font-bold text-emerald-400 mt-1">
                  {stats.brRanked.winRate}
                </div>
                <span className="text-[10px] text-slate-400 font-gaming">{stats.brRanked.wins} / {stats.brRanked.gamesPlayed} Matches</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">Headshot Rate</span>
                <div className="text-2xl font-mono-code font-bold text-rose-400 mt-1">
                  {stats.brRanked.headshotRate}
                </div>
                <span className="text-[10px] text-slate-400 font-gaming">{stats.brRanked.headshots} Headshot Kills</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">Total Kills</span>
                <div className="text-xl font-mono-code font-bold text-amber-300 mt-1">
                  {stats.brRanked.kills.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-gaming">Avg Dmg: {stats.brRanked.avgDamage}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">Top 10 Finishes</span>
                <div className="text-xl font-mono-code font-bold text-sky-400 mt-1">
                  {stats.brRanked.top10}
                </div>
                <span className="text-[10px] text-slate-400 font-gaming">Survival Mastery</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">Most Kills in 1 Match</span>
                <div className="text-xl font-mono-code font-bold text-red-400 mt-1">
                  {stats.brRanked.mostKillsInGame} Kills
                </div>
                <span className="text-[10px] text-slate-400 font-gaming">Booyah Record</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">Active Season</span>
                <div className="text-xs font-bold font-gaming text-amber-300 mt-1">
                  {stats.brRanked.season}
                </div>
                <span className="text-[10px] text-emerald-400 font-gaming">OB54 Patch Verified</span>
              </div>
            </div>
          )}

          {/* Tab 2: Clash Squad Ranked */}
          {activeTab === 'cs' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">CS Rank</span>
                <div className="text-base font-bold font-gaming text-amber-400 mt-1">
                  {stats.csRanked.rankName}
                </div>
                <span className="text-[10px] font-mono-code text-slate-400">⭐ {stats.csRanked.stars} Stars</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">CS Win Rate</span>
                <div className="text-2xl font-mono-code font-bold text-emerald-400 mt-1">
                  {stats.csRanked.winRate}
                </div>
                <span className="text-[10px] text-slate-400 font-gaming">{stats.csRanked.wins} / {stats.csRanked.gamesPlayed} Matches</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">MVP Count</span>
                <div className="text-2xl font-mono-code font-bold text-amber-400 mt-1">
                  {stats.csRanked.mvpCount}
                </div>
                <span className="text-[10px] text-slate-400 font-gaming">Squad Leader</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1524] border border-[#1b273d]">
                <span className="text-[11px] font-gaming text-slate-400">Quadra Kills</span>
                <div className="text-2xl font-mono-code font-bold text-rose-400 mt-1">
                  {stats.csRanked.quadraKills}
                </div>
                <span className="text-[10px] text-slate-400 font-gaming">4K Ace Squad Wipes</span>
              </div>
            </div>
          )}

          {/* Tab 3: Pet Info */}
          {activeTab === 'pet' && (
            <div className="p-6 rounded-2xl bg-[#0e1524] border border-[#1b273d] flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-4xl shadow-inner shrink-0">
                {stats.equippedPet.icon}
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-gaming text-amber-400 uppercase font-bold">Equipped Free Fire Pet</div>
                <h4 className="text-lg font-bold font-gaming text-white">
                  {stats.equippedPet.name} ({stats.equippedPet.petType})
                </h4>
                <p className="text-xs font-gaming text-slate-300">
                  <strong className="text-amber-300">Skill: {stats.equippedPet.skillName}</strong> — {stats.equippedPet.skillDescription}
                </p>
                <div className="text-xs font-mono-code text-slate-400 pt-1">
                  Level: Lv.{stats.equippedPet.level} · Pet EXP: {stats.equippedPet.exp}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Guild Details */}
          {activeTab === 'guild' && (
            <div className="p-6 rounded-2xl bg-[#0e1524] border border-[#1b273d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-gaming text-amber-400 font-bold uppercase">Member of Free Fire Guild</span>
                <h4 className="text-xl font-bold font-gaming text-white mt-0.5">
                  {stats.guild.name}
                </h4>
                <p className="text-xs font-mono-code text-slate-400 mt-0.5">
                  Guild ID: {stats.guild.id} · Leader: {stats.guild.leaderName}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-3.5 py-2 rounded-xl bg-[#080d16] border border-[#1b273d] text-center">
                  <div className="text-[10px] font-gaming text-slate-400">Level</div>
                  <div className="text-base font-bold font-gaming text-amber-400">Lv.{stats.guild.level}</div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-[#080d16] border border-[#1b273d] text-center">
                  <div className="text-[10px] font-gaming text-slate-400">Members</div>
                  <div className="text-base font-bold font-gaming text-white">{stats.guild.members}/{stats.guild.maxMembers}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

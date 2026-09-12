import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Zap, 
  Sparkles, 
  Radio, 
  Send, 
  Play, 
  Square, 
  RotateCw, 
  Sliders, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  MessageSquare, 
  Flame, 
  ShieldCheck, 
  Layers, 
  Volume2, 
  Clock, 
  Copy, 
  Check, 
  ChevronRight, 
  Cpu,
  Gamepad2,
  Smartphone
} from 'lucide-react';

import { 
  BrainMode, 
  BrainTriggerConfig, 
  BrainTelemetry, 
  EmoteItem, 
  ProtoPacketEntry, 
  EmoteMacro 
} from '../types';
import { FF_EMOTES_DATABASE, INITIAL_EMOTE_MACROS } from '../data/emotesData';
import { brainEngine } from '../services/brainEngine';
import { FreeFireInGameHUD } from './FreeFireInGameHUD';
import { FreeFirePythonBotRunner } from './FreeFirePythonBotRunner';

interface BrainViewProps {
  savedUid: string;
  region: string;
  onLogMessage: (msg: string, type?: any) => void;
  onShowNotification: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  demoMode: boolean;
}

type BrainSubTab = 'ingame-hud' | 'python-bot' | 'emotes' | 'rules' | 'packets' | 'macros';

export const BrainView: React.FC<BrainViewProps> = ({
  savedUid,
  region,
  onLogMessage,
  onShowNotification,
  demoMode,
}) => {
  // State: default to the real Free Fire In-Game HUD
  const [activeSubTab, setActiveSubTab] = useState<BrainSubTab>('ingame-hud');
  const [telemetry, setTelemetry] = useState<BrainTelemetry>(brainEngine.getTelemetry());
  const [rulesConfig, setRulesConfig] = useState<BrainTriggerConfig>(brainEngine.getConfig());
  const [packets, setPackets] = useState<ProtoPacketEntry[]>(brainEngine.getPackets());
  
  // Emotes filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [triggeringEmoteId, setTriggeringEmoteId] = useState<string | null>(null);
  const [lastDispatchedPacket, setLastDispatchedPacket] = useState<ProtoPacketEntry | null>(null);

  // Macro playback state
  const [runningMacroId, setRunningMacroId] = useState<string | null>(null);
  const [macroStepProgress, setMacroStepProgress] = useState<string | null>(null);

  // Selected Packet for detail modal
  const [selectedPacket, setSelectedPacket] = useState<ProtoPacketEntry | null>(null);
  const [copiedHex, setCopiedHex] = useState(false);

  // Subscribe to brain telemetry & packet updates
  useEffect(() => {
    const unsubPackets = brainEngine.onPacket((pkt) => {
      setPackets(brainEngine.getPackets());
      if (pkt.protoType === 'sQ_pb2' && pkt.direction === 'OUT') {
        setLastDispatchedPacket(pkt);
      }
    });

    const unsubTelemetry = brainEngine.onTelemetry((tel) => {
      setTelemetry(tel);
    });

    return () => {
      unsubPackets();
      unsubTelemetry();
    };
  }, []);

  // Handlers
  const handleToggleBrain = () => {
    const nextState = !telemetry.brainActive;
    brainEngine.toggleBrain(nextState);
    onLogMessage(
      nextState ? '🧠 Brain ➔ Autonomous Emote engine activated.' : '🧠 Brain ➔ Autonomous Emote engine paused.',
      nextState ? 'online' : 'offline'
    );
    onShowNotification(
      nextState ? 'success' : 'info',
      nextState ? 'Brain Activated 🧠' : 'Brain Paused 💤',
      nextState 
        ? 'TCP Emote listener & autonomous decision loops are running.' 
        : 'Automated emote responses suspended.'
    );
  };

  const handleSelectMode = (mode: BrainMode) => {
    brainEngine.setMode(mode);
    onLogMessage(`🧠 Brain Mode set to: ${mode.toUpperCase()}`, 'info');
    onShowNotification('info', 'Brain Mode Changed', `Switched AI behavioral profile to ${mode}`);
  };

  const handleTriggerEmote = async (emote: EmoteItem) => {
    try {
      setTriggeringEmoteId(emote.id);
      const res = await brainEngine.triggerEmote(emote, 'manual');
      onLogMessage(`[sQ_pb2] 🎮 Emote Dispatched: ${emote.icon} ${emote.name} (ID ${emote.emoteId})`, 'task');
      onShowNotification('success', `${emote.icon} Emote Dispatched!`, `${emote.name} [ID: ${emote.emoteId}] broadcast over TCP relay.`);
    } catch (err: any) {
      onShowNotification('warning', 'Trigger Blocked', err?.message || 'Unable to trigger emote.');
    } finally {
      setTimeout(() => setTriggeringEmoteId(null), 400);
    }
  };

  const handleUpdateRule = (key: keyof BrainTriggerConfig, value: any) => {
    const updated = brainEngine.updateConfig({ [key]: value });
    setRulesConfig(updated);
    onLogMessage(`[Brain Config] Updated ${key} = ${value}`, 'info');
  };

  const handleRunMacro = async (macro: EmoteMacro) => {
    if (runningMacroId) return;

    setRunningMacroId(macro.id);
    onLogMessage(`[Macro] Starting combo "${macro.name}" (${macro.emoteIds.length} emotes)`, 'task');
    onShowNotification('info', 'Running Macro Combo', `${macro.name} started.`);

    try {
      await brainEngine.executeMacro(macro, (step, total, emoteName) => {
        setMacroStepProgress(`Playing step ${step}/${total}: ${emoteName}`);
      });
      onLogMessage(`[Macro] Finished combo "${macro.name}" successfully.`, 'online');
      onShowNotification('success', 'Macro Complete', `All emotes in "${macro.name}" executed.`);
    } catch (err: any) {
      onShowNotification('error', 'Macro Failed', err?.message || 'Macro execution stopped.');
    } finally {
      setRunningMacroId(null);
      setMacroStepProgress(null);
    }
  };

  const handleCopyPacketHex = (hex: string) => {
    navigator.clipboard?.writeText(hex).catch(() => {});
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 1500);
    onShowNotification('info', 'Hex Copied', 'Protobuf payload bytes copied.');
  };

  // Filtered Emotes list
  const filteredEmotes = FF_EMOTES_DATABASE.filter((emote) => {
    const matchesCategory = selectedCategory === 'all' || emote.category === selectedCategory;
    const matchesSearch = 
      emote.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emote.emoteId.includes(searchQuery) ||
      emote.command.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. BRAIN HERO BANNER & AI NEURAL CONTROLLER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1626] via-[#10192d] to-[#0c1322] border border-[#233552] p-5 sm:p-6 shadow-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Identity and Brain status */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
                telemetry.brainActive
                  ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 shadow-orange-500/25 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-slate-800 text-slate-500 ring-1 ring-slate-700'
              }`}>
                <Brain className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0e1626] ${
                telemetry.brainActive ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
              }`} />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0e1626] ${
                telemetry.brainActive ? 'bg-emerald-400' : 'bg-rose-500'
              }`} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-gaming font-bold text-white tracking-wide flex items-center gap-2">
                  <span>THE BRAIN 🧠</span>
                  <span className="text-xs font-mono-code font-normal px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    FREE-FIRE-TCP-EMOTE
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-300 font-gaming mt-1 max-w-xl">
                Autonomous TCP Emote Controller, Whisper & Squad Proto Message Decoder, and Real-time Emote Dispatcher for Free Fire OB54.
              </p>

              {/* Status pills */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-gaming font-bold ${
                  telemetry.brainActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${telemetry.brainActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  {telemetry.brainActive ? 'BRAIN ACTIVE & LISTENING' : 'BRAIN SLEEPING / PAUSED'}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono-code bg-[#141e33] text-sky-400 border border-[#233554]">
                  <Radio className="w-3 h-3 text-sky-400" />
                  Mode: <strong className="capitalize">{telemetry.currentMode.replace('-', ' ')}</strong>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono-code bg-[#141e33] text-amber-300 border border-[#233554]">
                  <Flame className="w-3 h-3 text-amber-400" />
                  UID: {savedUid || 'Guest'} · {region}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Master Brain Control button & Mode pills */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <button
              id="master-brain-toggle-btn"
              onClick={handleToggleBrain}
              className={`px-5 py-2.5 rounded-xl font-gaming font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
                telemetry.brainActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-orange-500/20'
              }`}
            >
              {telemetry.brainActive ? (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>⚡ BRAIN RUNNING (PAUSE)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>▶ RESUME BRAIN 🧠</span>
                </>
              )}
            </button>

            {/* Mode selection buttons */}
            <div className="flex items-center gap-1 p-1 bg-[#090e18] rounded-xl border border-[#1e2c45] overflow-x-auto max-w-full">
              {[
                { id: 'smart-auto' as BrainMode, label: '🧠 Smart', title: 'Smart Auto' },
                { id: 'toxic-flex' as BrainMode, label: '👑 Flex', title: 'Toxic Flex' },
                { id: 'aggressive-taunt' as BrainMode, label: '⚔️ Taunt', title: 'Aggressive Taunt' },
                { id: 'friendly-squad' as BrainMode, label: '🤝 Squad', title: 'Friendly Squad' },
                { id: 'stealth-anti-ban' as BrainMode, label: '🛡️ Stealth', title: 'Anti-Ban Jitter' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMode(m.id)}
                  title={m.title}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-gaming font-semibold whitespace-nowrap transition ${
                    telemetry.currentMode === m.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Brain Telemetry quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1a2840]">
          <div className="p-3 rounded-xl bg-[#090e18] border border-[#1a263c]">
            <span className="text-[10px] text-slate-400 font-gaming uppercase block">
              Emotes Dispatched
            </span>
            <span className="text-xl font-bold font-gaming text-amber-400 mt-0.5 block">
              {telemetry.emotesTriggered}
            </span>
            <span className="text-[10px] text-slate-500 font-mono-code">
              Via TCP (sQ_pb2)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#090e18] border border-[#1a263c]">
            <span className="text-[10px] text-slate-400 font-gaming uppercase block">
              Whispers Decoded
            </span>
            <span className="text-xl font-bold font-gaming text-sky-400 mt-0.5 block">
              {telemetry.whispersDecoded}
            </span>
            <span className="text-[10px] text-slate-500 font-mono-code">
              DecodeWhisperMsg
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#090e18] border border-[#1a263c]">
            <span className="text-[10px] text-slate-400 font-gaming uppercase block">
              Packets Processed
            </span>
            <span className="text-xl font-bold font-gaming text-emerald-400 mt-0.5 block">
              {telemetry.packetsProcessed}
            </span>
            <span className="text-[10px] text-slate-500 font-mono-code">
              xC4 Stream Cipher
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#090e18] border border-[#1a263c]">
            <span className="text-[10px] text-slate-400 font-gaming uppercase block">
              Last Emote
            </span>
            <span className="text-sm font-bold font-gaming text-white truncate mt-0.5 block">
              {telemetry.lastEmoteName || 'None'}
            </span>
            <span className="text-[10px] text-amber-400 font-mono-code">
              {telemetry.lastEmoteTime || 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0a0f19] rounded-xl border border-[#1c283d] overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('ingame-hud')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-gaming font-bold tracking-wide whitespace-nowrap transition ${
            activeSubTab === 'ingame-hud'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>🎮 In-Game Free Fire Screen (OB54 HUD)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('python-bot')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-gaming font-bold tracking-wide whitespace-nowrap transition ${
            activeSubTab === 'python-bot'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>🐍 Run in Real Game (Python & Termux)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('emotes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-gaming font-bold tracking-wide whitespace-nowrap transition ${
            activeSubTab === 'emotes'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <span>🕹️ Emote Remote Pad</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-gaming font-bold tracking-wide whitespace-nowrap transition ${
            activeSubTab === 'rules'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>⚙️ AI Trigger Rules</span>
        </button>

        <button
          onClick={() => setActiveSubTab('packets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-gaming font-bold tracking-wide whitespace-nowrap transition ${
            activeSubTab === 'packets'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>📡 TCP & Proto Inspector</span>
        </button>

        <button
          onClick={() => setActiveSubTab('macros')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-gaming font-bold tracking-wide whitespace-nowrap transition ${
            activeSubTab === 'macros'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>🎛️ Emote Combo Macros</span>
        </button>
      </div>

      {/* 3. TAB CONTENT PANE */}

      {/* PANE 1: AUTHENTIC FREE FIRE IN-GAME CLIENT HUD */}
      {activeSubTab === 'ingame-hud' && (
        <FreeFireInGameHUD
          botUid={savedUid}
          botNickname="FF_BRAIN_BOT"
          onLogMessage={onLogMessage}
        />
      )}

      {/* PANE 2: RUN IN REAL FREE FIRE GAME (PYTHON / TERMUX BOT RUNNER) */}
      {activeSubTab === 'python-bot' && (
        <FreeFirePythonBotRunner
          savedUid={savedUid}
          onShowNotification={onShowNotification}
        />
      )}

      {/* PANE 1: EMOTE REMOTE PAD */}
      {activeSubTab === 'emotes' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="p-4 rounded-xl bg-[#0b101c] border border-[#1b263b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Free Fire emotes by name, ID (e.g. 900000012), or command (!throne)..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#070b13] border border-[#1e2a40] text-xs font-mono-code text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Emotes' },
                { id: 'flex', label: '👑 Flex' },
                { id: 'taunt', label: '😂 Taunt' },
                { id: 'romantic', label: '🌹 Romantic' },
                { id: 'dance', label: '💃 Dance' },
                { id: 'celebration', label: '🏆 Celebration' },
                { id: 'classic', label: '👋 Classic' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-gaming whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-400 hover:text-white bg-[#070b13] border border-[#192438]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Macro Bar */}
          <div className="p-3.5 rounded-xl bg-[#0d1424] border border-[#1f2d45] flex items-center justify-between gap-3 overflow-x-auto">
            <span className="text-xs font-gaming font-bold text-amber-400 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Macros:</span>
            </span>
            <div className="flex items-center gap-2">
              {INITIAL_EMOTE_MACROS.map((macro) => (
                <button
                  key={macro.id}
                  onClick={() => handleRunMacro(macro)}
                  disabled={Boolean(runningMacroId)}
                  className="px-3 py-1 rounded-lg bg-[#141e33] hover:bg-[#1a2844] text-slate-200 border border-[#243452] text-xs font-gaming whitespace-nowrap flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <span>{macro.icon}</span>
                  <span>{macro.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Macro running banner */}
          {runningMacroId && (
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-xs font-gaming text-amber-300">
                <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>{macroStepProgress || 'Executing combo macro sequence...'}</span>
              </div>
              <span className="text-[10px] font-mono-code text-amber-200">
                Auto-Timing with Anti-ban Jitter
              </span>
            </div>
          )}

          {/* Emotes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEmotes.map((emote) => {
              const isTriggering = triggeringEmoteId === emote.id;
              const rarityColor = 
                emote.rarity === 'Mythic' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
                emote.rarity === 'Legendary' ? 'text-purple-400 border-purple-500/40 bg-purple-500/10' :
                emote.rarity === 'Epic' ? 'text-sky-400 border-sky-500/40 bg-sky-500/10' :
                'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';

              return (
                <div
                  key={emote.id}
                  className="group relative rounded-xl bg-[#0d1322] border border-[#1e2a40] hover:border-amber-500/50 p-4 transition flex flex-col justify-between space-y-3 shadow-lg hover:shadow-amber-500/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-xl bg-[#141c2e] border border-[#23314c] flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition">
                      {emote.icon}
                    </div>
                    <span className={`text-[10px] font-gaming uppercase px-2 py-0.5 rounded border ${rarityColor}`}>
                      {emote.rarity}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-gaming font-bold text-white group-hover:text-amber-300 transition">
                      {emote.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {emote.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#182338] space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono-code text-slate-400">
                      <span>ID: <strong className="text-amber-400">{emote.emoteId}</strong></span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 font-semibold">{emote.command}</span>
                    </div>

                    <button
                      onClick={() => handleTriggerEmote(emote)}
                      disabled={isTriggering || !telemetry.brainActive}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-gaming font-bold tracking-wide flex items-center justify-center gap-1.5 shadow transition active:scale-95 ${
                        isTriggering
                          ? 'bg-amber-400 text-slate-950 animate-bounce'
                          : !telemetry.brainActive
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-orange-500/10'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{isTriggering ? 'DISPATCHING...' : 'TRIGGER EMOTE'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEmotes.length === 0 && (
            <div className="p-12 text-center rounded-xl bg-[#0b101c] border border-[#1b263b] text-slate-400">
              <p className="font-gaming text-sm">No Free Fire emotes found matching "{searchQuery}".</p>
            </div>
          )}
        </div>
      )}

      {/* PANE 4: AI TRIGGER RULES */}
      {activeSubTab === 'rules' && (
        <div className="p-6 rounded-2xl bg-[#0b101c] border border-[#1e2a40] space-y-6">
          <div>
            <h3 className="text-base font-gaming font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Autonomous Trigger Rules & Behavior Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure how the Free Fire Emote Brain automatically reacts to in-game events, lobby states, and communication packets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rule 1: Whisper Command Listener */}
            <div className="p-4 rounded-xl bg-[#070b13] border border-[#1b263b] flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-gaming font-bold text-white block">
                  Whisper Commands (DecodeWhisperMsg.proto)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Allows friends and squadmates to trigger emotes by whispering <code className="text-amber-400">!throne</code>, <code className="text-amber-400">!lol</code>, etc.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rulesConfig.whisperCommandsEnabled}
                onChange={(e) => handleUpdateRule('whisperCommandsEnabled', e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
              />
            </div>

            {/* Rule 2: Team Chat Commands */}
            <div className="p-4 rounded-xl bg-[#070b13] border border-[#1b263b] flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-gaming font-bold text-white block">
                  Team Message Listener (Team_msg.proto)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Executes emotes when commands are posted in Squad / Guild lobby text chat.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rulesConfig.teamChatCommandsEnabled}
                onChange={(e) => handleUpdateRule('teamChatCommandsEnabled', e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
              />
            </div>

            {/* Rule 3: Auto Booyah Celebration */}
            <div className="p-4 rounded-xl bg-[#070b13] border border-[#1b263b] flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-gaming font-bold text-white block">
                  Auto Booyah Celebration
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically plays Booyah / FFWC Throne upon winning match conclusion.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rulesConfig.autoBooyahEnabled}
                onChange={(e) => handleUpdateRule('autoBooyahEnabled', e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
              />
            </div>

            {/* Rule 4: Auto Knock / Kill Taunt */}
            <div className="p-4 rounded-xl bg-[#070b13] border border-[#1b263b] flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-gaming font-bold text-white block">
                  Auto Kill / Elimination Taunt
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Immediately fires LOL or Dab emote upon confirming a knock or enemy kill.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rulesConfig.autoKillEnabled}
                onChange={(e) => handleUpdateRule('autoKillEnabled', e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
              />
            </div>

            {/* Rule 5: Idle Lobby Loop */}
            <div className="p-4 rounded-xl bg-[#070b13] border border-[#1b263b] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-gaming font-bold text-white block">
                    Idle Lobby Emote Loop
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Periodically plays random emotes while idling in lobby.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={rulesConfig.idleLobbyLoopEnabled}
                  onChange={(e) => handleUpdateRule('idleLobbyLoopEnabled', e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
                />
              </div>

              {rulesConfig.idleLobbyLoopEnabled && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400 mb-1">
                    <span>Loop Interval</span>
                    <span className="text-amber-400 font-bold">{rulesConfig.loopIntervalSec} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="60"
                    step="1"
                    value={rulesConfig.loopIntervalSec}
                    onChange={(e) => handleUpdateRule('loopIntervalSec', parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Rule 6: Anti-Ban Jitter & Obfuscation */}
            <div className="p-4 rounded-xl bg-[#070b13] border border-[#1b263b] space-y-3">
              <div>
                <span className="text-xs font-gaming font-bold text-white block">
                  Anti-Ban Timing Jitter (network_utils.py)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Adds randomized microsecond delay before dispatching sQ_pb2 packets to emulate natural human input patterns.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400 mb-1">
                  <span>Random Jitter Window</span>
                  <span className="text-emerald-400 font-bold">±{rulesConfig.antiBanJitterMs} ms</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="5"
                  value={rulesConfig.antiBanJitterMs}
                  onChange={(e) => handleUpdateRule('antiBanJitterMs', parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANE 4: PROTOBUF & TCP PACKET INSPECTOR */}
      {activeSubTab === 'packets' && (
        <div className="p-6 rounded-2xl bg-[#0b101c] border border-[#1e2a40] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c283c] pb-3">
            <div>
              <h3 className="text-base font-gaming font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Live TCP & Protobuf Packet Stream</span>
              </h3>
              <p className="text-xs text-slate-400">
                Inspect binary serialization packets handled by the Brain: <code className="text-amber-400">sQ_pb2</code>, <code className="text-sky-400">DecodeWhisperMsg</code>, <code className="text-purple-400">GenWhisperMsg</code>, <code className="text-emerald-400">Team_msg</code>, and <code className="text-orange-400">MajorLoginReq</code>.
              </p>
            </div>
            <span className="text-xs font-mono-code px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              {packets.length} Packets Logged
            </span>
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {packets.map((pkt) => (
              <div
                key={pkt.id}
                onClick={() => setSelectedPacket(pkt)}
                className="p-3.5 rounded-xl bg-[#070b13] hover:bg-[#0c1220] border border-[#1c273c] hover:border-amber-500/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded font-bold ${
                      pkt.direction === 'IN' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {pkt.direction === 'IN' ? '⬇ INCOMING' : '⬆ OUTGOING'}
                    </span>

                    <span className="text-xs font-mono-code font-bold text-white">
                      {pkt.protoType}
                    </span>

                    <span className="text-[11px] text-slate-500 font-mono-code">
                      {pkt.timestamp}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono-code">
                      ({pkt.byteLength} bytes)
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono-code truncate max-w-xl">
                    {pkt.actionSummary}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[10px] font-mono-code px-2 py-1 rounded bg-[#131b2c] text-amber-300 border border-[#202d48]">
                    {pkt.rawHex.slice(0, 17)}...
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PANE 5: EMOTE COMBO MACROS */}
      {activeSubTab === 'macros' && (
        <div className="p-6 rounded-2xl bg-[#0b101c] border border-[#1e2a40] space-y-6">
          <div>
            <h3 className="text-base font-gaming font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Emote Combo Macros & Chaining Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Chain multiple high-tier Free Fire emotes together into timed automated combos executed by the Brain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_EMOTE_MACROS.map((macro) => {
              const isRunning = runningMacroId === macro.id;

              return (
                <div
                  key={macro.id}
                  className="p-5 rounded-xl bg-[#070b13] border border-[#1d293f] flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#121929] border border-[#202c44] flex items-center justify-center text-2xl">
                        {macro.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-gaming font-bold text-white">
                          {macro.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {macro.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chain steps */}
                  <div className="p-3 rounded-lg bg-[#0c1220] border border-[#182338] flex items-center gap-2 overflow-x-auto">
                    {macro.emoteIds.map((id, index) => {
                      const emote = FF_EMOTES_DATABASE.find((e) => e.emoteId === id);
                      return (
                        <React.Fragment key={id}>
                          <div className="px-2 py-1 rounded bg-[#151f33] border border-[#233352] text-xs font-gaming text-slate-200 whitespace-nowrap flex items-center gap-1">
                            <span>{emote?.icon || '🎮'}</span>
                            <span>{emote?.name || id}</span>
                          </div>
                          {index < macro.emoteIds.length - 1 && (
                            <span className="text-amber-500 font-bold text-xs">➔</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#182338]">
                    <span className="text-[11px] font-mono-code text-slate-400">
                      Interval: <strong className="text-amber-300">{(macro.delayBetweenMs / 1000).toFixed(1)}s</strong>
                    </span>

                    <button
                      onClick={() => handleRunMacro(macro)}
                      disabled={Boolean(runningMacroId) || !telemetry.brainActive}
                      className={`px-4 py-2 rounded-lg font-gaming font-bold text-xs flex items-center gap-1.5 transition shadow active:scale-95 ${
                        isRunning
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : !telemetry.brainActive
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 shadow-orange-500/10'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isRunning ? 'PLAYING COMBO...' : 'PLAY COMBO'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PACKET DETAIL MODAL */}
      {selectedPacket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#0c1220] rounded-2xl border border-[#233552] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1d293f] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h3 className="font-gaming font-bold text-white text-base">
                  Protobuf Packet Inspector ({selectedPacket.protoType})
                </h3>
              </div>
              <button
                onClick={() => setSelectedPacket(null)}
                className="text-slate-400 hover:text-white font-gaming text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono-code">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#070a13] border border-[#1b263b]">
                  <span className="text-[10px] text-slate-400 uppercase font-gaming block">Direction</span>
                  <span className="text-amber-400 font-bold">{selectedPacket.direction}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#070a13] border border-[#1b263b]">
                  <span className="text-[10px] text-slate-400 uppercase font-gaming block">Timestamp</span>
                  <span className="text-slate-200">{selectedPacket.timestamp}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#070a13] border border-[#1b263b]">
                <span className="text-[10px] text-slate-400 uppercase font-gaming block mb-1">Parsed Action Summary</span>
                <p className="text-slate-200">{selectedPacket.actionSummary}</p>
              </div>

              <div className="p-3 rounded-lg bg-[#070a13] border border-[#1b263b]">
                <span className="text-[10px] text-slate-400 uppercase font-gaming block mb-1">Protobuf Decoded Representation</span>
                <pre className="text-emerald-400 text-[11px] whitespace-pre-wrap break-all">
                  {selectedPacket.payloadText}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-[#070a13] border border-[#1b263b]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 uppercase font-gaming">Raw Encrypted Hex (xC4 Payload)</span>
                  <button
                    onClick={() => handleCopyPacketHex(selectedPacket.rawHex)}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    {copiedHex ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHex ? 'Copied' : 'Copy Hex'}</span>
                  </button>
                </div>
                <div className="text-amber-300/90 text-[11px] tracking-wider font-mono-code break-all bg-black/40 p-2 rounded">
                  {selectedPacket.rawHex}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPacket(null)}
                className="px-4 py-2 rounded-lg bg-[#141e33] hover:bg-[#1d2b48] text-slate-200 font-gaming text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

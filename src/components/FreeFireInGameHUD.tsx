import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  Play, 
  Zap, 
  ShieldCheck, 
  Crown, 
  Users, 
  Wifi, 
  Battery, 
  Terminal,
  MessageSquare,
  Flame,
  Radio,
  Gamepad2
} from 'lucide-react';
import { FF_EMOTES_DATABASE } from '../data/emotesData';
import { brainEngine } from '../services/brainEngine';
import { MessageBoxDialogue, EmoteItem } from '../types';

interface FreeFireInGameHUDProps {
  botUid?: string;
  botNickname?: string;
  onLogMessage?: (msg: string) => void;
}

export const FreeFireInGameHUD: React.FC<FreeFireInGameHUDProps> = ({
  botUid = '984712039',
  botNickname = 'FF_BRAIN_BOT',
  onLogMessage,
}) => {
  const [chatChannel, setChatChannel] = useState<'whisper' | 'team' | 'guild' | 'world'>('whisper');
  const [inGameWhisperInput, setInGameWhisperInput] = useState('');
  const [activeEmote, setActiveEmote] = useState<EmoteItem>(FF_EMOTES_DATABASE[0]); // FFWC Throne
  const [isEmoting, setIsEmoting] = useState(false);
  const [inGameDialogues, setInGameDialogues] = useState<MessageBoxDialogue[]>(brainEngine.getDialogues());
  const [isBotSpeakingInGame, setIsBotSpeakingInGame] = useState(false);
  const [voiceSoundEnabled, setVoiceSoundEnabled] = useState(brainEngine.isVoiceEnabled());
  const [inGameNotification, setInGameNotification] = useState<string | null>('Connected to Free Fire OB54 Game Server [TCP :39004]');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to brain dialogues
  useEffect(() => {
    const unsub = brainEngine.onDialogue((latest, all) => {
      setInGameDialogues(all);
      if (latest.sender === 'bot') {
        setIsBotSpeakingInGame(true);
        setInGameNotification(`💬 [In-Game Whisper] ${botNickname}: ${latest.text.slice(0, 50)}...`);
        const timer = setTimeout(() => {
          setIsBotSpeakingInGame(false);
          setInGameNotification(null);
        }, 4000);
        return () => clearTimeout(timer);
      }
    });
    return unsub;
  }, [botNickname]);

  // Auto-scroll chat box
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [inGameDialogues, isBotSpeakingInGame]);

  const handleSendInGameWhisper = async (cmdToSend?: string) => {
    const text = (cmdToSend || inGameWhisperInput).trim();
    if (!text) return;

    if (!cmdToSend) {
      setInGameWhisperInput('');
    }

    setInGameNotification(`📥 In-Game Packet: Player whispered "${text}"`);
    
    try {
      const res = await brainEngine.processIncomingWhisper('1029384756', 'Viper_FF', text);
      if (res.triggeredEmote) {
        setActiveEmote(res.triggeredEmote);
        setIsEmoting(true);
        setTimeout(() => setIsEmoting(false), 5000);
      }
      if (onLogMessage) {
        onLogMessage(`[In-Game Free Fire] Intercepted whisper "${text}" -> Dispatching sQ_pb2 emote`);
      }
    } catch {
      // Handled
    }
  };

  const handleTriggerInGameEmoteDirect = async (emote: EmoteItem) => {
    setActiveEmote(emote);
    setIsEmoting(true);
    try {
      await brainEngine.triggerEmote(emote, 'manual');
      setInGameNotification(`🎮 [In-Game Emote] ${emote.icon} ${emote.name} (sQ_pb2 ID: ${emote.emoteId}) executed in Free Fire!`);
      setTimeout(() => setIsEmoting(false), 5000);
    } catch {
      setIsEmoting(false);
    }
  };

  const toggleVoice = () => {
    const next = !voiceSoundEnabled;
    setVoiceSoundEnabled(next);
    brainEngine.setVoiceEnabled(next);
  };

  return (
    <div className="space-y-4">
      {/* Scope Clarification Alert */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#131f36] to-sky-500/15 border border-amber-500/30 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Gamepad2 className="w-4 h-4" />
          </span>
          <p className="text-xs text-slate-200">
            <strong className="text-amber-400 font-gaming">IN THE FREE FIRE GAME CLIENT (NOT A WEBSITE):</strong>{' '}
            This HUD simulates how your bot looks and acts <strong>inside the real Free Fire Mobile / PC game screen</strong>. When another player in Free Fire types <code className="text-amber-300 font-mono-code font-bold">/help</code>, the bot responds directly in their in-game chat box and performs the emote live in their game lobby!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className={`px-3 py-1.5 rounded-lg border text-xs font-gaming font-bold transition flex items-center gap-1.5 ${
              voiceSoundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            {voiceSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{voiceSoundEnabled ? 'In-Game Sound ON' : 'Sound Muted'}</span>
          </button>
        </div>
      </div>

      {/* 16:9 FREE FIRE IN-GAME CLIENT CONTAINER */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#ff9d00]/50 shadow-2xl bg-[#060a12] select-none">
        {/* Glow Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none z-10" />

        {/* Top Free Fire In-Game Status Bar */}
        <div className="relative z-20 px-4 py-2.5 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between border-b border-white/10 text-xs">
          {/* Top Left: Player Profile Badge */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-orange-600 to-amber-900 border border-amber-300 flex items-center justify-center text-xl shadow-md">
                🤖
              </div>
              <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-red-600 text-[8px] font-gaming font-bold text-white border border-red-400">
                Lv.75
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-gaming font-bold text-white text-sm tracking-wider flex items-center gap-1">
                  <span>{botNickname}</span>
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-gaming bg-amber-500/30 text-amber-300 border border-amber-500/50">
                  GRANDMASTER 99★
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono-code flex items-center gap-2">
                <span>UID: {botUid}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">OB54 REGION: IND</span>
              </div>
            </div>
          </div>

          {/* Top Center: In-Game Notification Marquee / Banner */}
          {inGameNotification && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-amber-500/40 text-[11px] text-amber-300 font-gaming animate-pulse">
              <Radio className="w-3 h-3 text-amber-400 animate-ping" />
              <span>{inGameNotification}</span>
            </div>
          )}

          {/* Top Right: Free Fire Currencies & Ping */}
          <div className="flex items-center gap-3">
            {/* Diamonds */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/50 border border-cyan-500/30 text-cyan-300 font-mono-code text-[11px]">
              <span>💎</span>
              <span className="font-bold">99,999</span>
            </div>
            {/* Gold */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/50 border border-amber-500/30 text-amber-300 font-mono-code text-[11px]">
              <span>🪙</span>
              <span className="font-bold">888,888</span>
            </div>
            {/* Ping */}
            <div className="flex items-center gap-1 text-emerald-400 font-mono-code text-[10px]">
              <Wifi className="w-3 h-3" />
              <span>28ms</span>
            </div>
          </div>
        </div>

        {/* Free Fire Lobby Scene (Character + Podium + Emote Wheel) */}
        <div className="relative min-h-[440px] md:min-h-[500px] flex items-end justify-between p-4 md:p-6 overflow-hidden">
          {/* Free Fire Game Lobby Futuristic Background Canvas */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#182a47] via-[#091122] to-[#04070e]">
            {/* Hexagon tech grid overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ff9d00_1px,transparent_1px)] [background-size:24px_24px]" />
            
            {/* Stage spotlights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-amber-500/20 via-orange-500/5 to-transparent blur-2xl pointer-events-none" />
          </div>

          {/* CENTER: Free Fire 3D Character & Emote Stage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            {/* Character Stage Podium */}
            <div className="relative flex flex-col items-center mt-12">
              {/* Active Emote Visual Aura & Golden Particle Sparks */}
              {isEmoting && (
                <div className="absolute -top-24 flex flex-col items-center animate-bounce z-20">
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-gaming font-extrabold text-xs shadow-xl shadow-amber-500/50 border-2 border-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>EMOTE IN FREE FIRE: {activeEmote.name.toUpperCase()}</span>
                  </div>
                  <div className="w-2 h-2 bg-amber-400 rotate-45 -mt-1 shadow-md"></div>
                </div>
              )}

              {/* Bot Character Model Simulation */}
              <div className={`relative transition-transform duration-500 ${isEmoting ? 'scale-110' : 'scale-100'}`}>
                {/* Visual Character Illustration */}
                <div className="w-36 h-56 md:w-44 md:h-64 rounded-2xl bg-gradient-to-t from-slate-900 via-slate-800 to-amber-950/40 border-2 border-amber-500/40 shadow-2xl flex flex-col items-center justify-between p-3 relative overflow-hidden backdrop-blur-sm">
                  {/* Cyber Armor details */}
                  <div className="w-full flex justify-between items-center text-[10px] text-amber-400 font-gaming">
                    <span>OB54 BOT</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>

                  {/* Character Avatar / Emote Stance */}
                  <div className="flex flex-col items-center my-auto">
                    <div className="text-6xl md:text-7xl filter drop-shadow-[0_10px_10px_rgba(245,158,11,0.5)] transition-transform duration-300">
                      {isEmoting ? activeEmote.icon : '🤖'}
                    </div>
                    <span className="mt-2 text-xs font-gaming font-bold text-white tracking-wider">
                      {isEmoting ? activeEmote.name : 'Viper Cybernetic'}
                    </span>
                    <span className="text-[9px] font-mono-code text-amber-300">
                      Proto: sQ_pb2 ({activeEmote.emoteId})
                    </span>
                  </div>

                  {/* Bot Equalizer Voice waves if speaking in-game */}
                  {isBotSpeakingInGame ? (
                    <div className="w-full py-1 rounded bg-amber-500/20 border border-amber-400/40 flex items-center justify-center gap-1 text-[9px] font-gaming text-amber-300 animate-pulse">
                      <span className="w-1 h-3 bg-amber-400 animate-bounce"></span>
                      <span className="w-1 h-4 bg-amber-400 animate-bounce delay-75"></span>
                      <span className="w-1 h-2 bg-amber-400 animate-bounce delay-150"></span>
                      <span>TALKING IN GAME</span>
                    </div>
                  ) : (
                    <div className="text-[9px] font-gaming text-slate-400">
                      STANDBY IN LOBBY
                    </div>
                  )}
                </div>

                {/* Golden Throne / Pedestal glow */}
                <div className="w-48 h-8 rounded-full bg-amber-500/30 blur-md mx-auto -mt-3"></div>
                <div className="w-40 h-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 border border-amber-300 mx-auto -mt-2 shadow-lg shadow-amber-500/50"></div>
              </div>

              {/* Lobby Pedestal Disc */}
              <div className="w-56 md:w-64 h-8 rounded-[100%] bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 border-2 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.3)] mt-1 flex items-center justify-center">
                <span className="text-[9px] font-gaming text-amber-400 tracking-widest font-bold">
                  FREE FIRE LOBBY PEDESTAL
                </span>
              </div>
            </div>
          </div>

          {/* LEFT: THE AUTHENTIC FREE FIRE IN-GAME CHAT BOX */}
          <div className="relative z-20 w-full sm:w-[360px] md:w-[410px] rounded-xl bg-black/85 border border-amber-500/40 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
            {/* Free Fire Chat Header with Channels: World, Guild, Team, Whisper */}
            <div className="bg-gradient-to-r from-[#172033] via-[#0f172a] to-[#121a2c] p-2 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {(['whisper', 'team', 'guild', 'world'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChatChannel(ch)}
                    className={`px-2 py-0.5 rounded text-[10px] font-gaming uppercase tracking-wider transition ${
                      chatChannel === ch
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white bg-slate-800/40'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              <span className="text-[10px] font-gaming text-amber-400 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>IN-GAME CHAT</span>
              </span>
            </div>

            {/* In-Game Free Fire Chat Feed */}
            <div 
              ref={chatScrollRef}
              className="p-3 space-y-2 max-h-[190px] min-h-[150px] overflow-y-auto text-xs font-sans bg-black/50"
            >
              {/* Default Welcome from game */}
              <div className="text-[10px] font-mono-code text-slate-400 p-1.5 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-amber-400 font-bold">[SYSTEM]:</span> Free Fire Bot connected via TCP socket. Say <span className="text-white font-bold">/help</span> to view in-game commands.
              </div>

              {inGameDialogues.map((dlg) => {
                const isBot = dlg.sender === 'bot';
                if (dlg.sender === 'system') return null;

                return (
                  <div key={dlg.id} className="space-y-0.5 leading-snug">
                    <div className="flex items-center gap-1.5 text-[10px] font-gaming">
                      <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                        [WHISPER]
                      </span>
                      <span className={isBot ? 'text-amber-400 font-bold' : 'text-sky-300 font-bold'}>
                        {isBot ? `🤖 ${botNickname}` : `👤 ${dlg.senderName || 'Viper_FF'}`}
                      </span>
                      <span className="text-slate-500 text-[9px] font-mono-code">
                        {dlg.timestamp}
                      </span>
                    </div>

                    <div className={`p-2 rounded-lg text-xs ${
                      isBot 
                        ? 'bg-[#182338] text-amber-100 border-l-2 border-amber-400' 
                        : 'bg-[#0f172a] text-sky-100 border-l-2 border-sky-400'
                    }`}>
                      <p className="whitespace-pre-line break-words font-mono-code text-[11px] leading-relaxed">
                        {dlg.text}
                      </p>

                      {/* In-game action shortcuts */}
                      {isBot && dlg.actions && (
                        <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex flex-wrap gap-1">
                          {dlg.actions.map((act) => (
                            <button
                              key={act.command}
                              onClick={() => handleSendInGameWhisper(act.command)}
                              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-[10px] font-gaming transition active:scale-95 flex items-center gap-1"
                            >
                              <span>{act.icon}</span>
                              <span>{act.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick in-game whisper command hotbar */}
            <div className="px-2 py-1 bg-[#0b101c] border-t border-slate-800 flex items-center gap-1 overflow-x-auto text-[10px]">
              <span className="text-amber-400 font-gaming font-bold mr-1 shrink-0">Whisper:</span>
              {[
                { cmd: '/help', label: '❓ /help' },
                { cmd: '/throne', label: '👑 /throne' },
                { cmd: '/lol', label: '😂 /lol' },
                { cmd: '/flower', label: '🌹 /flower' },
                { cmd: '/flag', label: '🏴 /flag' },
                { cmd: '/glory', label: '🏆 /glory' },
              ].map((c) => (
                <button
                  key={c.cmd}
                  onClick={() => handleSendInGameWhisper(c.cmd)}
                  className="px-1.5 py-0.5 rounded bg-[#131b2d] hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-mono-code whitespace-nowrap transition active:scale-95"
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* In-game chat input box */}
            <div className="p-2 bg-[#080d16] border-t border-amber-500/30 flex items-center gap-2">
              <input
                type="text"
                value={inGameWhisperInput}
                onChange={(e) => setInGameWhisperInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendInGameWhisper()}
                placeholder="Whisper /help, /throne, /lol to bot..."
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-black border border-[#22334f] text-xs font-mono-code text-amber-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => handleSendInGameWhisper()}
                disabled={!inGameWhisperInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-gaming font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow"
              >
                <Send className="w-3 h-3" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* RIGHT: FREE FIRE IN-GAME SQUAD SLOTS & QUICK EMOTE WHEEL */}
          <div className="relative z-20 hidden md:flex flex-col gap-3">
            {/* Squad Slots in Game Lobby */}
            <div className="p-3 rounded-xl bg-black/80 border border-amber-500/30 backdrop-blur-md space-y-2 w-48">
              <span className="text-[10px] font-gaming text-amber-400 font-bold block uppercase tracking-wider">
                Lobby Squad (4/4)
              </span>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-gaming">
                  <div className="flex items-center gap-1.5 text-white">
                    <span>👑</span>
                    <span className="font-bold truncate max-w-[80px]">{botNickname}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">READY</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800 text-[10px] font-gaming">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span>🛡️</span>
                    <span className="truncate max-w-[80px]">Viper_FF</span>
                  </div>
                  <span className="text-emerald-400">READY</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/40 border border-slate-800/60 text-[10px] font-gaming text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span>➕</span>
                    <span>Invite Slot 3</span>
                  </div>
                  <span className="text-slate-600">OPEN</span>
                </div>
              </div>
            </div>

            {/* In-Game Emote Radial Shortcuts */}
            <div className="p-3 rounded-xl bg-black/80 border border-amber-500/30 backdrop-blur-md space-y-2 w-48">
              <span className="text-[10px] font-gaming text-amber-400 font-bold block uppercase tracking-wider">
                In-Game Emote Wheel
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {FF_EMOTES_DATABASE.slice(0, 6).map((emote) => (
                  <button
                    key={emote.id}
                    onClick={() => handleTriggerInGameEmoteDirect(emote)}
                    title={`Play ${emote.name} in Free Fire Game`}
                    className={`p-2 rounded-lg border text-center transition active:scale-95 ${
                      activeEmote.id === emote.id && isEmoting
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-lg shadow-amber-500/40'
                        : 'bg-[#101726] hover:bg-[#1a253c] text-white border-slate-700'
                    }`}
                  >
                    <span className="text-lg block">{emote.icon}</span>
                    <span className="text-[9px] font-gaming truncate block mt-0.5">
                      {emote.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Free Fire Bottom HUD Bar: Mode Select + Start Match Button */}
        <div className="relative z-20 px-4 py-3 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-slate-950 font-gaming font-extrabold text-xs flex items-center gap-1.5 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>BATTLE ROYALE - RANKED</span>
            </div>
            <span className="hidden sm:inline text-xs font-mono-code text-slate-400">
              OB54 Server Active • Auto-Emote TCP Listener Listening
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendInGameWhisper('/help')}
              className="px-3.5 py-2 rounded-xl bg-[#141e33] hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-gaming font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <span>❓ Tell Bot "/help"</span>
            </button>

            <button
              onClick={() => handleTriggerInGameEmoteDirect(FF_EMOTES_DATABASE[0])}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-gaming font-extrabold text-xs shadow-lg shadow-amber-500/30 flex items-center gap-2 transition active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START / EMOTE IN GAME</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

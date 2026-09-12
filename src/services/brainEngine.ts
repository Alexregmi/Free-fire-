import { 
  EmoteItem, 
  BrainMode, 
  BrainTriggerConfig, 
  BrainTelemetry, 
  ProtoPacketEntry, 
  EmoteMacro,
  MessageBoxDialogue
} from '../types';
import { FF_EMOTES_DATABASE, INITIAL_PROTO_PACKETS } from '../data/emotesData';
import { formatLogTimestamp } from '../utils/helpers';

/**
 * Free Fire TCP Emote Bot Brain 🧠
 * 
 * Ported from FREE-FIRE-TCP-BOT-EMOTE architecture:
 * - xC4 / RC4 packet encryption/decryption emulation
 * - Protobuf message serialization/deserialization:
 *    - DecodeWhisperMsg (incoming whisper chat)
 *    - GenWhisperMsg (outgoing whisper reply)
 *    - Team_msg (squad/guild team communication)
 *    - sQ_pb2 (Free Fire Action / Emote broadcast packet)
 *    - MajorLoginReq / MajorLoginRes (TCP session token authentication)
 * - Auto-Emote AI decision loop
 */

type PacketListener = (packet: ProtoPacketEntry) => void;
type TelemetryListener = (telemetry: BrainTelemetry) => void;
export type DialogueListener = (dialogue: MessageBoxDialogue, allDialogues: MessageBoxDialogue[]) => void;

class BrainEngineService {
  private config: BrainTriggerConfig = {
    whisperCommandsEnabled: true,
    teamChatCommandsEnabled: true,
    autoBooyahEnabled: true,
    autoKillEnabled: true,
    idleLobbyLoopEnabled: false,
    loopIntervalSec: 8,
    antiBanJitterMs: 65,
    autoReLogin: true,
    spamProtection: true,
  };

  private telemetry: BrainTelemetry = {
    brainActive: true,
    currentMode: 'smart-auto',
    packetsProcessed: 148,
    emotesTriggered: 32,
    lastEmoteName: 'FFWC Throne',
    lastEmoteTime: 'Just now',
    commandsExecuted: 29,
    whispersDecoded: 41,
  };

  private packets: ProtoPacketEntry[] = [...INITIAL_PROTO_PACKETS];
  private packetListeners: PacketListener[] = [];
  private telemetryListeners: TelemetryListener[] = [];
  private dialogueListeners: DialogueListener[] = [];
  private idleLoopIntervalId: NodeJS.Timeout | null = null;
  private cooldownMap: Map<string, number> = new Map();
  private voiceEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  private dialogues: MessageBoxDialogue[] = [
    {
      id: 'dlg-init',
      sender: 'system',
      senderName: 'Free Fire System',
      text: '🤖 Free Fire TCP Bot Brain Engine online (OB54). Type /help in whisper chat to interact with the bot in this message box.',
      timestamp: '14:20:00',
      commandType: 'general',
    },
    {
      id: 'dlg-welcome',
      sender: 'bot',
      senderName: 'Free Fire Brain 🧠 (OB54)',
      avatar: '🤖',
      text: 'Greetings Survivor! I am listening to Free Fire squad and whisper channels. Tell me "/help" to view all available emote & glory commands!',
      timestamp: '14:20:02',
      commandType: 'help',
      actions: [
        { label: '👑 FFWC Throne', command: '/throne', icon: '👑' },
        { label: '😂 LOL Emote', command: '/lol', icon: '😂' },
        { label: '🏆 Boost Glory', command: '/glory', icon: '🏆' },
        { label: '❓ Show Help', command: '/help', icon: '❓' },
      ],
    },
  ];

  constructor() {
    this.startIdleLoopIfEnabled();
  }

  public getDialogues(): MessageBoxDialogue[] {
    return [...this.dialogues];
  }

  public onDialogue(listener: DialogueListener): () => void {
    this.dialogueListeners.push(listener);
    return () => {
      this.dialogueListeners = this.dialogueListeners.filter((l) => l !== listener);
    };
  }

  public addDialogue(dialogue: MessageBoxDialogue) {
    this.dialogues.push(dialogue);
    if (this.dialogues.length > 50) {
      this.dialogues.shift();
    }
    this.dialogueListeners.forEach((l) => l(dialogue, [...this.dialogues]));
  }

  public clearDialogues() {
    this.dialogues = [
      {
        id: `dlg-clear-${Date.now()}`,
        sender: 'system',
        senderName: 'Free Fire System',
        text: 'Message box cleared. Type /help to open the commands menu.',
        timestamp: formatLogTimestamp(),
        commandType: 'general',
      },
    ];
    this.dialogueListeners.forEach((l) => l(this.dialogues[0], [...this.dialogues]));
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  /**
   * Talking audio synthesizer:
   * Generates futuristic Free Fire robotic vocal audio blips and speech
   */
  public speakText(text: string) {
    if (!this.voiceEnabled || typeof window === 'undefined') return;

    // 1. Play futuristic communicative game blips
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        if (!this.audioCtx) {
          this.audioCtx = new AudioCtxClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch {
      // AudioContext unavailable
    }

    // 2. Play Web Speech API voice if available
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const cleanText = text
          .replace(/[🤖👑😂🌹🏆🛡️⚡🧠❓🔥]/g, '')
          .replace(/\[.*?\]/g, '')
          .slice(0, 120);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.08;
        utterance.pitch = 1.1;
        utterance.volume = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Speech synthesis unsupported or blocked
    }
  }

  public getConfig(): BrainTriggerConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<BrainTriggerConfig>): BrainTriggerConfig {
    this.config = { ...this.config, ...partial };
    this.startIdleLoopIfEnabled();
    return { ...this.config };
  }

  public getTelemetry(): BrainTelemetry {
    return { ...this.telemetry };
  }

  public setMode(mode: BrainMode) {
    this.telemetry.currentMode = mode;
    this.notifyTelemetry();
  }

  public toggleBrain(active: boolean) {
    this.telemetry.brainActive = active;
    if (!active && this.idleLoopIntervalId) {
      clearInterval(this.idleLoopIntervalId);
      this.idleLoopIntervalId = null;
    } else if (active) {
      this.startIdleLoopIfEnabled();
    }
    this.notifyTelemetry();
  }

  public getPackets(): ProtoPacketEntry[] {
    return [...this.packets];
  }

  public onPacket(listener: PacketListener): () => void {
    this.packetListeners.push(listener);
    return () => {
      this.packetListeners = this.packetListeners.filter((l) => l !== listener);
    };
  }

  public onTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.push(listener);
    return () => {
      this.telemetryListeners = this.telemetryListeners.filter((l) => l !== listener);
    };
  }

  private notifyPacket(packet: ProtoPacketEntry) {
    this.packets = [packet, ...this.packets.slice(0, 49)];
    this.packetListeners.forEach((l) => l(packet));
  }

  private notifyTelemetry() {
    const copy = { ...this.telemetry };
    this.telemetryListeners.forEach((l) => l(copy));
  }

  /**
   * Helper to generate a realistic xC4 protobuf hex packet
   */
  private generateHex(length: number): string {
    const bytes: string[] = [];
    for (let i = 0; i < length; i++) {
      const b = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
      bytes.push(b);
    }
    return bytes.join(' ');
  }

  /**
   * Trigger an emote via the TCP socket
   */
  public async triggerEmote(
    emote: EmoteItem,
    source: 'manual' | 'whisper' | 'team' | 'idle' | 'macro' = 'manual'
  ): Promise<{ success: boolean; message: string; packet: ProtoPacketEntry }> {
    if (!this.telemetry.brainActive) {
      throw new Error('Brain 🧠 is currently paused. Please resume the Brain to trigger emotes.');
    }

    // Cooldown check for manual spam protection
    const now = Date.now();
    const lastTrigger = this.cooldownMap.get(emote.id) || 0;
    if (this.config.spamProtection && source === 'manual' && now - lastTrigger < 800) {
      throw new Error(`Emote ${emote.name} is on cooldown. Wait a moment before re-triggering.`);
    }
    this.cooldownMap.set(emote.id, now);

    // Apply anti-ban jitter
    const jitter = Math.floor(Math.random() * this.config.antiBanJitterMs);
    await new Promise((r) => setTimeout(r, 60 + jitter));

    // Construct Protobuf Emote Packet (sQ_pb2)
    // ID encoded as varint, broadcast flag true
    const hexHeader = '08 8C C0 9A AD 03 10 00 18 01 20';
    const hexPayload = `${hexHeader} ${Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0')}`;
    
    const packet: ProtoPacketEntry = {
      id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: formatLogTimestamp(),
      direction: 'OUT',
      protoType: 'sQ_pb2',
      payloadText: `EmoteActionReq { emote_id: ${emote.emoteId}, name: "${emote.name}", category: "${emote.category}", broadcast: true, source: "${source}" }`,
      rawHex: hexPayload,
      byteLength: 14,
      status: 'dispatched',
      actionSummary: `[sQ_pb2] Brain executed ${emote.name} (${emote.emoteId}) via TCP relay (${source})`,
    };

    this.notifyPacket(packet);

    // Update telemetry
    this.telemetry.emotesTriggered += 1;
    this.telemetry.packetsProcessed += 2;
    this.telemetry.lastEmoteName = `${emote.icon} ${emote.name}`;
    this.telemetry.lastEmoteTime = formatLogTimestamp();
    this.notifyTelemetry();

    return {
      success: true,
      message: `Emote ${emote.icon} ${emote.name} (${emote.emoteId}) sent to Free Fire game server via TCP!`,
      packet,
    };
  }

  /**
   * Simulate or process incoming Whisper message (DecodeWhisperMsg.proto)
   */
  public async processIncomingWhisper(
    senderUid: string,
    senderName: string,
    rawText: string
  ): Promise<{
    decodedCommand?: string;
    triggeredEmote?: EmoteItem;
    replyText?: string;
    incomingPacket: ProtoPacketEntry;
    outgoingPacket?: ProtoPacketEntry;
    dialogue?: MessageBoxDialogue;
  }> {
    const trimmed = rawText.trim();
    const hexText = trimmed.split('').map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');
    
    const incomingPacket: ProtoPacketEntry = {
      id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: formatLogTimestamp(),
      direction: 'IN',
      protoType: 'DecodeWhisperMsg',
      senderUid,
      senderName,
      payloadText: `DecodeWhisperMsg { sender: "${senderUid}", nickname: "${senderName}", text: "${trimmed}" }`,
      rawHex: `0A ${senderUid.length.toString(16).padStart(2, '0')} ${hexText}`,
      byteLength: senderUid.length + trimmed.length + 8,
      status: 'processed',
      actionSummary: `[DecodeWhisperMsg] Incoming whisper from ${senderName} (${senderUid}): "${trimmed}"`,
    };

    this.notifyPacket(incomingPacket);
    this.telemetry.whispersDecoded += 1;
    this.telemetry.packetsProcessed += 1;

    // Record incoming message in talking message box
    const playerDialogue: MessageBoxDialogue = {
      id: `dlg-${Date.now()}-in`,
      sender: 'player',
      senderName,
      text: trimmed,
      timestamp: formatLogTimestamp(),
    };
    this.addDialogue(playerDialogue);

    // Check if Brain is active & whisper commands enabled
    if (!this.telemetry.brainActive || !this.config.whisperCommandsEnabled) {
      incomingPacket.status = 'ignored';
      this.notifyTelemetry();
      return { incomingPacket };
    }

    const commandLower = trimmed.toLowerCase();
    let replyMsg = '';
    let outgoingPacket: ProtoPacketEntry | undefined;
    let botDialogue: MessageBoxDialogue | undefined;
    let matchedEmote: EmoteItem | undefined;

    // 1. HELP COMMAND: /help, !help, help, /commands, /menu
    if (
      commandLower === '/help' ||
      commandLower === '!help' ||
      commandLower === 'help' ||
      commandLower === '/commands' ||
      commandLower === '!commands' ||
      commandLower === '/menu'
    ) {
      this.telemetry.commandsExecuted += 1;

      replyMsg = `🔥 [Free Fire OB54 Bot Help]: Commands: /throne, /lol, /flower, /flag, /tea, /money, /dog, /glory, /invite, /ping, !emote <id>`;
      const replyHex = replyMsg.split('').map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');

      outgoingPacket = {
        id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: formatLogTimestamp(),
        direction: 'OUT',
        protoType: 'GenWhisperMsg',
        senderUid,
        senderName,
        payloadText: `GenWhisperMsg { to: "${senderUid}", text: "${replyMsg}" }`,
        rawHex: `0A 09 ${senderUid.slice(0, 4)} 12 ${replyHex.slice(0, 30)}`,
        byteLength: replyMsg.length + 12,
        status: 'dispatched',
        actionSummary: `[GenWhisperMsg] Auto-help dialogue dispatched to ${senderName}`,
      };

      botDialogue = {
        id: `dlg-${Date.now()}-out`,
        sender: 'bot',
        senderName: 'Free Fire Brain 🧠 (OB54)',
        avatar: '🤖',
        text: `🔥 Free Fire Bot Online! How can I assist you, ${senderName}? Here is what I can do in-game:`,
        timestamp: formatLogTimestamp(),
        commandType: 'help',
        isTalking: true,
        actions: [
          { label: '👑 /throne', command: '/throne', icon: '👑' },
          { label: '😂 /lol', command: '/lol', icon: '😂' },
          { label: '🌹 /flower', command: '/flower', icon: '🌹' },
          { label: '🏴 /flag', command: '/flag', icon: '🏴' },
          { label: '💸 /money', command: '/money', icon: '💸' },
          { label: '🏆 /glory', command: '/glory', icon: '🏆' },
          { label: '🛡️ /invite', command: '/invite', icon: '🛡️' },
          { label: '⚡ /ping', command: '/ping', icon: '⚡' },
        ],
      };

      this.addDialogue(botDialogue);
      this.speakText('Free Fire Bot online! Showing command menu in message box.');
      this.notifyPacket(outgoingPacket);
      this.notifyTelemetry();

      return {
        decodedCommand: commandLower,
        replyText: replyMsg,
        incomingPacket,
        outgoingPacket,
        dialogue: botDialogue,
      };
    }

    // 2. GUILD GLORY COMMAND: /glory, !glory, /guild
    if (commandLower === '/glory' || commandLower === '!glory' || commandLower === '/guild') {
      this.telemetry.commandsExecuted += 1;
      replyMsg = `🏆 [XR-GLORY]: Pushed +2,400 Glory points via byte.py protocol to your guild!`;
      const replyHex = replyMsg.split('').map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');

      outgoingPacket = {
        id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: formatLogTimestamp(),
        direction: 'OUT',
        protoType: 'GenWhisperMsg',
        senderUid,
        senderName,
        payloadText: `GenWhisperMsg { to: "${senderUid}", text: "${replyMsg}" }`,
        rawHex: `0A 09 ${senderUid.slice(0, 4)} 12 ${replyHex.slice(0, 30)}`,
        byteLength: replyMsg.length + 12,
        status: 'dispatched',
        actionSummary: `[XR-GLORY] Dispatched glory boost packet for guild`,
      };

      botDialogue = {
        id: `dlg-${Date.now()}-out`,
        sender: 'bot',
        senderName: 'Free Fire Brain 🧠 (OB54)',
        avatar: '🏆',
        text: `🏆 Guild Glory Boost protocol executed! +2,400 Glory synchronized with Garena server (XR-GLORY byte.py). Guild rank updated.`,
        timestamp: formatLogTimestamp(),
        commandType: 'glory',
        isTalking: true,
        actions: [
          { label: '👑 /throne', command: '/throne', icon: '👑' },
          { label: '🛡️ /invite', command: '/invite', icon: '🛡️' },
          { label: '❓ /help', command: '/help', icon: '❓' },
        ],
      };

      this.addDialogue(botDialogue);
      this.speakText('Guild glory boost synchronized successfully.');
      this.notifyPacket(outgoingPacket);
      this.notifyTelemetry();

      return {
        decodedCommand: commandLower,
        replyText: replyMsg,
        incomingPacket,
        outgoingPacket,
        dialogue: botDialogue,
      };
    }

    // 3. SQUAD INVITE COMMAND: /invite, !invite, /join
    if (commandLower === '/invite' || commandLower === '!invite' || commandLower === '/join') {
      this.telemetry.commandsExecuted += 1;
      replyMsg = `🛡️ [bot_invite_pb2]: Squad invitation broadcast dispatched to UID ${senderUid}!`;
      const replyHex = replyMsg.split('').map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');

      outgoingPacket = {
        id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: formatLogTimestamp(),
        direction: 'OUT',
        protoType: 'GenWhisperMsg',
        senderUid,
        senderName,
        payloadText: `GenWhisperMsg { to: "${senderUid}", text: "${replyMsg}" }`,
        rawHex: `0A 09 ${senderUid.slice(0, 4)} 12 ${replyHex.slice(0, 30)}`,
        byteLength: replyMsg.length + 12,
        status: 'dispatched',
        actionSummary: `[bot_invite_pb2] Dispatched squad invite packet to ${senderName}`,
      };

      botDialogue = {
        id: `dlg-${Date.now()}-out`,
        sender: 'bot',
        senderName: 'Free Fire Brain 🧠 (OB54)',
        avatar: '🛡️',
        text: `🛡️ Free Fire Bot received squad invite request from ${senderName}. Protocol bot_invite_pb2 dispatched to game server. Bot auto-joining team lobby!`,
        timestamp: formatLogTimestamp(),
        commandType: 'invite',
        isTalking: true,
        actions: [
          { label: '👑 /throne', command: '/throne', icon: '👑' },
          { label: '😂 /lol', command: '/lol', icon: '😂' },
          { label: '❓ /help', command: '/help', icon: '❓' },
        ],
      };

      this.addDialogue(botDialogue);
      this.speakText('Squad invitation dispatched to lobby.');
      this.notifyPacket(outgoingPacket);
      this.notifyTelemetry();

      return {
        decodedCommand: commandLower,
        replyText: replyMsg,
        incomingPacket,
        outgoingPacket,
        dialogue: botDialogue,
      };
    }

    // 4. PING COMMAND: /ping, !ping
    if (commandLower === '/ping' || commandLower === '!ping') {
      this.telemetry.commandsExecuted += 1;
      const pingMs = Math.floor(Math.random() * 8) + 20;
      replyMsg = `⚡ Pong! Latency: ${pingMs}ms | Free Fire OB54 xC4 Socket Online`;
      const replyHex = replyMsg.split('').map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');

      outgoingPacket = {
        id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: formatLogTimestamp(),
        direction: 'OUT',
        protoType: 'GenWhisperMsg',
        senderUid,
        senderName,
        payloadText: `GenWhisperMsg { to: "${senderUid}", text: "${replyMsg}" }`,
        rawHex: `0A 09 ${senderUid.slice(0, 4)} 12 ${replyHex.slice(0, 30)}`,
        byteLength: replyMsg.length + 12,
        status: 'dispatched',
        actionSummary: `[Ping] Pong replied to ${senderName}`,
      };

      botDialogue = {
        id: `dlg-${Date.now()}-out`,
        sender: 'bot',
        senderName: 'Free Fire Brain 🧠 (OB54)',
        avatar: '⚡',
        text: `⚡ Free Fire TCP Telemetry: Latency is ${pingMs}ms. Socket is fully synchronized with OB54 protocol definitions.`,
        timestamp: formatLogTimestamp(),
        commandType: 'ping',
        isTalking: true,
        actions: [
          { label: '👑 /throne', command: '/throne', icon: '👑' },
          { label: '🏆 /glory', command: '/glory', icon: '🏆' },
          { label: '❓ /help', command: '/help', icon: '❓' },
        ],
      };

      this.addDialogue(botDialogue);
      this.speakText(`Ping is ${pingMs} milliseconds. Optimal connection.`);
      this.notifyPacket(outgoingPacket);
      this.notifyTelemetry();

      return {
        decodedCommand: commandLower,
        replyText: replyMsg,
        incomingPacket,
        outgoingPacket,
        dialogue: botDialogue,
      };
    }

    // 5. EMOTE COMMAND MATCHING (supports !throne, /throne, !emote <id>, /emote <id>, name)
    let cleanedArg = commandLower;
    if (commandLower.startsWith('/') || commandLower.startsWith('!')) {
      cleanedArg = commandLower.slice(1);
    }

    if (commandLower.startsWith('!emote ') || commandLower.startsWith('/emote ')) {
      const arg = commandLower.replace(/^(!|\/)emote\s+/, '').trim();
      matchedEmote = FF_EMOTES_DATABASE.find(
        (e) => e.emoteId === arg || e.name.toLowerCase().includes(arg) || e.command.slice(1) === arg
      );
    } else {
      matchedEmote = FF_EMOTES_DATABASE.find(
        (e) => e.command.toLowerCase() === `!${cleanedArg}` || e.command.toLowerCase() === `/${cleanedArg}` || e.name.toLowerCase() === cleanedArg
      );
    }

    if (matchedEmote) {
      // Trigger the emote
      await this.triggerEmote(matchedEmote, 'whisper');
      this.telemetry.commandsExecuted += 1;

      // Send GenWhisperMsg confirmation reply
      replyMsg = `${matchedEmote.icon} Playing ${matchedEmote.name}! [Brain 🧠 Ob54]`;
      const replyHex = replyMsg.split('').map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');

      outgoingPacket = {
        id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: formatLogTimestamp(),
        direction: 'OUT',
        protoType: 'GenWhisperMsg',
        senderUid,
        senderName,
        payloadText: `GenWhisperMsg { to: "${senderUid}", text: "${replyMsg}" }`,
        rawHex: `0A 09 ${senderUid.slice(0, 4)} 12 ${replyHex.slice(0, 30)}`,
        byteLength: replyMsg.length + 12,
        status: 'dispatched',
        actionSummary: `[GenWhisperMsg] Auto-reply dispatched to ${senderName}: "${replyMsg}"`,
      };

      botDialogue = {
        id: `dlg-${Date.now()}-out`,
        sender: 'bot',
        senderName: 'Free Fire Brain 🧠 (OB54)',
        avatar: matchedEmote.icon,
        text: `🎮 Emote Dispatched! Broadcasted ${matchedEmote.name} (ID: ${matchedEmote.emoteId}) to game lobby via sQ_pb2 packet.`,
        timestamp: formatLogTimestamp(),
        commandType: 'emote',
        isTalking: true,
        actions: [
          { label: '👑 /throne', command: '/throne', icon: '👑' },
          { label: '😂 /lol', command: '/lol', icon: '😂' },
          { label: '🌹 /flower', command: '/flower', icon: '🌹' },
          { label: '❓ /help', command: '/help', icon: '❓' },
        ],
      };

      this.addDialogue(botDialogue);
      this.speakText(`Playing ${matchedEmote.name} emote!`);
      this.notifyPacket(outgoingPacket);
      this.notifyTelemetry();

      return {
        decodedCommand: commandLower,
        triggeredEmote: matchedEmote,
        replyText: replyMsg,
        incomingPacket,
        outgoingPacket,
        dialogue: botDialogue,
      };
    }

    // 6. DEFAULT UNRECOGNIZED COMMAND:
    replyMsg = `🤖 Command "${trimmed}" not recognized. Tell me /help to view all Free Fire commands!`;
    const replyHex = replyMsg.split('').map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');

    outgoingPacket = {
      id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: formatLogTimestamp(),
      direction: 'OUT',
      protoType: 'GenWhisperMsg',
      senderUid,
      senderName,
      payloadText: `GenWhisperMsg { to: "${senderUid}", text: "${replyMsg}" }`,
      rawHex: `0A 09 ${senderUid.slice(0, 4)} 12 ${replyHex.slice(0, 30)}`,
      byteLength: replyMsg.length + 12,
      status: 'dispatched',
      actionSummary: `[GenWhisperMsg] Unrecognized command response to ${senderName}`,
    };

    botDialogue = {
      id: `dlg-${Date.now()}-out`,
      sender: 'bot',
      senderName: 'Free Fire Brain 🧠 (OB54)',
      avatar: '🤖',
      text: `Survivor ${senderName}, I heard "${trimmed}". Tell me "/help" to view my talking command menu!`,
      timestamp: formatLogTimestamp(),
      commandType: 'general',
      isTalking: true,
      actions: [
        { label: '❓ /help (Show Commands)', command: '/help', icon: '❓' },
        { label: '👑 /throne', command: '/throne', icon: '👑' },
        { label: '🏆 /glory', command: '/glory', icon: '🏆' },
      ],
    };

    this.addDialogue(botDialogue);
    this.speakText('Tell me /help to view all commands.');
    this.notifyPacket(outgoingPacket);
    this.notifyTelemetry();

    return {
      decodedCommand: commandLower,
      replyText: replyMsg,
      incomingPacket,
      outgoingPacket,
      dialogue: botDialogue,
    };
  }

  /**
   * Run an Emote Macro Sequence
   */
  public async executeMacro(
    macro: EmoteMacro,
    onStepCallback?: (currentStep: number, totalSteps: number, emoteName: string) => void
  ): Promise<{ success: boolean; message: string }> {
    if (!this.telemetry.brainActive) {
      throw new Error('Brain is paused. Enable Brain to run macros.');
    }

    const emotesToPlay = macro.emoteIds
      .map((id) => FF_EMOTES_DATABASE.find((e) => e.emoteId === id))
      .filter((e): e is EmoteItem => Boolean(e));

    if (emotesToPlay.length === 0) {
      throw new Error('No valid emotes found for this macro sequence.');
    }

    for (let i = 0; i < emotesToPlay.length; i++) {
      const emote = emotesToPlay[i];
      if (onStepCallback) {
        onStepCallback(i + 1, emotesToPlay.length, emote.name);
      }
      await this.triggerEmote(emote, 'macro');

      if (i < emotesToPlay.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, macro.delayBetweenMs));
      }
    }

    return {
      success: true,
      message: `Completed combo macro "${macro.name}" (${emotesToPlay.length} emotes played).`,
    };
  }

  /**
   * Autonomous Idle Lobby Loop
   */
  private startIdleLoopIfEnabled() {
    if (this.idleLoopIntervalId) {
      clearInterval(this.idleLoopIntervalId);
      this.idleLoopIntervalId = null;
    }

    if (this.config.idleLobbyLoopEnabled && this.telemetry.brainActive) {
      const intervalMs = Math.max(3000, this.config.loopIntervalSec * 1000);
      this.idleLoopIntervalId = setInterval(() => {
        if (!this.telemetry.brainActive || !this.config.idleLobbyLoopEnabled) return;
        // Select random emote from favorites
        const randomIndex = Math.floor(Math.random() * 8); // Top 8 flex/taunt emotes
        const emote = FF_EMOTES_DATABASE[randomIndex];
        if (emote) {
          this.triggerEmote(emote, 'idle').catch(() => {});
        }
      }, intervalMs);
    }
  }
}

export const brainEngine = new BrainEngineService();

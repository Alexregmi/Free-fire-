export type BotStatus = 'OFFLINE' | 'STARTING' | 'ONLINE' | 'ERROR';

export type TcpStatus = 'DISCONNECTED' | 'CONNECTED' | 'CONNECTING';

export interface RegionOption {
  code: string;
  name: string;
  flag: string;
  serverNode: string;
  pingMs: number;
}

export interface BotConfig {
  uid: string;
  region: string;
  ownerUid: string;
  botUid: string;
  autoReconnect: boolean;
  heartbeatIntervalSec: number;
  demoMode: boolean;
}

export interface GameAccountInfo {
  playerName: string;
  uid: string;
  level: string;
  region: string;
  bio: string;
  rank?: string;
  likes?: number;
  lastUpdated?: string;
}

export interface ConsoleLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type?: 'online' | 'starting' | 'offline' | 'error' | 'task' | 'info';
}

export interface PanelTaskItem {
  id: string;
  title: string;
  description: string;
  rewardHours: number;
  completed: boolean;
}

export interface AlertNotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
}

export interface FriendItem {
  uid: string;
  name: string;
  level: number;
  region: string;
  status: 'online' | 'in-game' | 'offline';
  rank: string;
}

export interface GuildInfo {
  id: string;
  name: string;
  level: number;
  leaderUid: string;
  membersCount: number;
  maxMembers: number;
  region: string;
  notice: string;
}

export interface ToolResponseState {
  action: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  response: string;
  timestamp?: string;
  details?: string;
}

export interface LiveActivityState {
  status: BotStatus;
  activity: string;
  lastUpdate: string;
  lastHeartbeatSeconds: number;
}

export type BrainMode = 
  | 'smart-auto'
  | 'aggressive-taunt'
  | 'friendly-squad'
  | 'toxic-flex'
  | 'stealth-anti-ban'
  | 'manual';

export interface EmoteItem {
  id: string;
  name: string;
  emoteId: string;
  category: 'flex' | 'dance' | 'taunt' | 'romantic' | 'celebration' | 'classic';
  rarity: 'Mythic' | 'Legendary' | 'Epic' | 'Rare' | 'Common';
  icon: string;
  description: string;
  command: string;
  cooldownMs: number;
}

export interface BrainTriggerConfig {
  whisperCommandsEnabled: boolean;
  teamChatCommandsEnabled: boolean;
  autoBooyahEnabled: boolean;
  autoKillEnabled: boolean;
  idleLobbyLoopEnabled: boolean;
  loopIntervalSec: number;
  antiBanJitterMs: number;
  autoReLogin: boolean;
  spamProtection: boolean;
}

export interface BrainTelemetry {
  brainActive: boolean;
  currentMode: BrainMode;
  packetsProcessed: number;
  emotesTriggered: number;
  lastEmoteName: string;
  lastEmoteTime: string;
  commandsExecuted: number;
  whispersDecoded: number;
}

export interface ProtoPacketEntry {
  id: string;
  timestamp: string;
  direction: 'IN' | 'OUT';
  protoType: 'DecodeWhisperMsg' | 'GenWhisperMsg' | 'Team_msg' | 'sQ_pb2' | 'MajorLoginReq' | 'MajorLoginRes';
  senderUid?: string;
  senderName?: string;
  payloadText?: string;
  rawHex: string;
  byteLength: number;
  status: 'processed' | 'dispatched' | 'ignored' | 'queued';
  actionSummary: string;
}

export interface EmoteMacro {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoteIds: string[];
  delayBetweenMs: number;
}

export interface MessageBoxDialogue {
  id: string;
  sender: 'player' | 'bot' | 'system';
  senderName: string;
  avatar?: string;
  text: string;
  timestamp: string;
  commandType?: 'help' | 'emote' | 'glory' | 'invite' | 'ping' | 'mode' | 'general';
  actions?: { label: string; command: string; icon?: string }[];
  isTalking?: boolean;
}

export interface FreeFireBRStats {
  rankName: string;
  rankPoints: number;
  season: string;
  gamesPlayed: number;
  wins: number;
  winRate: string;
  kills: number;
  kdRatio: number;
  headshots: number;
  headshotRate: string;
  top10: number;
  avgDamage: number;
  mostKillsInGame: number;
}

export interface FreeFireCSStats {
  rankName: string;
  stars: number;
  gamesPlayed: number;
  wins: number;
  winRate: string;
  kills: number;
  kdRatio: number;
  headshots: number;
  headshotRate: string;
  mvpCount: number;
  quadraKills: number;
  tripleKills: number;
}

export interface FreeFirePetInfo {
  name: string;
  petType: string;
  level: number;
  exp: number;
  skillName: string;
  skillDescription: string;
  icon?: string;
}

export interface FreeFireFullStats {
  uid: string;
  nickname: string;
  level: number;
  exp: number;
  region: string;
  bio: string;
  likes: number;
  creditScore: number;
  avatarId: string;
  bannerId: string;
  createdAt: string;
  lastLogin: string;
  brRanked: FreeFireBRStats;
  csRanked: FreeFireCSStats;
  equippedPet: FreeFirePetInfo;
  guild: {
    id: string;
    name: string;
    level: number;
    members: number;
    maxMembers: number;
    leaderName: string;
  };
}

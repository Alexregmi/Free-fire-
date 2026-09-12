import { RegionOption, PanelTaskItem, FriendItem, GuildInfo, ConsoleLogEntry } from '../types';

export const FF_REGIONS: RegionOption[] = [
  { code: 'BD', name: 'BD - Bangladesh', flag: '🇧🇩', serverNode: 'bd-relay-01.fftcp.net', pingMs: 24 },
  { code: 'NP', name: 'NP - Nepal', flag: '🇳🇵', serverNode: 'np-relay-01.fftcp.net', pingMs: 32 },
  { code: 'IN', name: 'IN - India', flag: '🇮🇳', serverNode: 'in-relay-02.fftcp.net', pingMs: 28 },
  { code: 'SG', name: 'SG - Singapore', flag: '🇸🇬', serverNode: 'sg-relay-01.fftcp.net', pingMs: 22 },
  { code: 'ID', name: 'ID - Indonesia', flag: '🇮🇩', serverNode: 'id-relay-03.fftcp.net', pingMs: 42 },
  { code: 'BR', name: 'BR - Brazil', flag: '🇧🇷', serverNode: 'br-relay-01.fftcp.net', pingMs: 135 },
  { code: 'EU', name: 'EU - Europe', flag: '🇪🇺', serverNode: 'eu-relay-01.fftcp.net', pingMs: 82 },
  { code: 'NA', name: 'NA - North America', flag: '🇺🇸', serverNode: 'na-relay-01.fftcp.net', pingMs: 95 },
  { code: 'ME', name: 'ME - Middle East', flag: '🇦🇪', serverNode: 'me-relay-02.fftcp.net', pingMs: 68 },
  { code: 'PK', name: 'PK - Pakistan', flag: '🇵🇰', serverNode: 'pk-relay-01.fftcp.net', pingMs: 46 },
  { code: 'SAC', name: 'SAC - South America', flag: '🌎', serverNode: 'sac-relay-01.fftcp.net', pingMs: 150 },
  { code: 'RU', name: 'RU - Russia/CIS', flag: '🌐', serverNode: 'ru-relay-01.fftcp.net', pingMs: 90 },
];

export const INITIAL_TASKS: PanelTaskItem[] = [
  {
    id: 'task-1',
    title: 'Daily TCP Keep-Alive Handshake',
    description: 'Verify packet ping and TLS certificate on the selected regional relay.',
    rewardHours: 2.0,
    completed: false,
  },
  {
    id: 'task-2',
    title: 'UID Checksum & Region Synchronize',
    description: 'Validate format integrity across authorized public player directories.',
    rewardHours: 2.0,
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Daemon Heartbeat Health Check',
    description: 'Verify 5-second pulse monitor and memory cache buffer.',
    rewardHours: 2.0,
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Security Compliance Audit',
    description: 'Ensure 0 access tokens, passwords, or cookies are retained in memory.',
    rewardHours: 2.0,
    completed: false,
  },
  {
    id: 'task-5',
    title: 'Terminal Telemetry Optimization',
    description: 'Flush expired log lines and archive session diagnostics.',
    rewardHours: 2.0,
    completed: false,
  },
];

export const INITIAL_FRIENDS: FriendItem[] = [
  { uid: '1849204857', name: 'Thunder_Strike', level: 71, region: 'BD - Bangladesh', status: 'online', rank: 'Heroic' },
  { uid: '2093847291', name: 'Kestrel_99', level: 65, region: 'SG - Singapore', status: 'in-game', rank: 'Diamond IV' },
  { uid: '3049281746', name: 'Shadow_Ninja', level: 58, region: 'IN - India', status: 'offline', rank: 'Platinum II' },
  { uid: '4920194820', name: 'Valkyrie_Queen', level: 69, region: 'NP - Nepal', status: 'online', rank: 'Master' },
];

export const INITIAL_GUILD: GuildInfo = {
  id: '80492817',
  name: 'TEAM_PHOENIX',
  level: 4,
  leaderUid: '1029384756',
  membersCount: 38,
  maxMembers: 50,
  region: 'BD - Bangladesh',
  notice: 'Welcome to Team Phoenix! Daily activity required. No unauthorized mods.',
};

export const INITIAL_LOGS: ConsoleLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '19:50:10',
    message: '[System] Panel initialized',
    type: 'info',
  },
  {
    id: 'log-2',
    timestamp: '19:50:11',
    message: '[System] Waiting for bot...',
    type: 'info',
  },
  {
    id: 'log-3',
    timestamp: '19:50:12',
    message: '[Bot] Status: OFFLINE',
    type: 'offline',
  },
  {
    id: 'log-4',
    timestamp: '19:50:13',
    message: '[System] Ready.',
    type: 'info',
  },
];

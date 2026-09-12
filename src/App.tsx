import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DemoModeBanner } from './components/DemoModeBanner';
import { AccountSetupScreen } from './components/AccountSetupScreen';
import { BotControlPanel } from './components/BotControlPanel';
import { BotControls } from './components/BotControls';
import { TcpStatusCard } from './components/TcpStatusCard';
import { LiveBotActivity } from './components/LiveBotActivity';
import { GameAccountInfo } from './components/GameAccountInfo';
import { ToolsCenter } from './components/ToolsCenter';
import { TaskSystemSection } from './components/TaskSystemSection';
import { OtherActions } from './components/OtherActions';
import { FriendActionModal } from './components/FriendActionModal';
import { GuildActionModal } from './components/GuildActionModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ToolsModal } from './components/ToolsModal';
import { NotificationToast } from './components/NotificationToast';
import { BrainView } from './components/BrainView';
import { FreeFireAccountAuthCard } from './components/FreeFireAccountAuthCard';
import { WebsiteLoginModal } from './components/WebsiteLoginModal';
import { FreeFireAccountStatsViewer } from './components/FreeFireAccountStatsViewer';
import { FreeFireInGameFloatingModal } from './components/FreeFireInGameFloatingModal';
import { Brain, Sparkles, Zap, ChevronRight, Gamepad2, Trophy } from 'lucide-react';
import { brainEngine } from './services/brainEngine';
import { FF_EMOTES_DATABASE } from './data/emotesData';

import { 
  BotConfig, 
  BotStatus, 
  TcpStatus, 
  GameAccountInfo as GameAccountInfoType, 
  ConsoleLogEntry, 
  AlertNotification,
  PanelTaskItem,
  FriendItem,
  GuildInfo,
  ToolResponseState
} from './types';
import { FF_REGIONS, INITIAL_LOGS, INITIAL_TASKS, INITIAL_FRIENDS, INITIAL_GUILD } from './data/constants';
import { createAlert, formatLogTimestamp, validateUid } from './utils/helpers';
import { botApi } from './services/botApi';

const STORAGE_KEY = 'ff_ai_bot_panel_config_v2';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Demo Mode state
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Website Login Flow
  const [isWebsiteLoggedIn, setIsWebsiteLoggedIn] = useState<boolean>(true);
  const [websiteUser, setWebsiteUser] = useState<string>('FF_Commander');

  // Free Fire Account Authentication State
  // Mandatory: The bot must NOT work without the user's Free Fire account authentication.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authenticatedUid, setAuthenticatedUid] = useState<string | null>(null);
  const [authenticatedRegion, setAuthenticatedRegion] = useState<string | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Bot Config (Strictly non-sensitive data)
  const [config, setConfig] = useState<BotConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          uid: parsed.uid || '1029384756',
          region: parsed.region || 'BD',
          ownerUid: parsed.ownerUid || '1029384756',
          botUid: parsed.botUid || 'BOT-4756-BD',
          autoReconnect: true,
          heartbeatIntervalSec: 5,
          demoMode: true,
        };
      }
    } catch {
      // fallback
    }
    return {
      uid: '1029384756',
      region: 'BD',
      ownerUid: '1029384756',
      botUid: 'BOT-4756-BD',
      autoReconnect: true,
      heartbeatIntervalSec: 5,
      demoMode: true,
    };
  });

  // Bot Lifecycle Status: OFFLINE | STARTING | ONLINE | ERROR
  const [botStatus, setBotStatus] = useState<BotStatus>('OFFLINE');
  const [runtimeSeconds, setRuntimeSeconds] = useState(0);
  const [bankedHours, setBankedHours] = useState(4.0);
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0);
  const [tasks, setTasks] = useState<PanelTaskItem[]>(INITIAL_TASKS);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);

  // TCP Relay Status: DISCONNECTED | CONNECTED | CONNECTING
  const [tcpStatus, setTcpStatus] = useState<TcpStatus>('CONNECTED');
  const [latencyMs, setLatencyMs] = useState(24);
  const [packetsReceived, setPacketsReceived] = useState(148);
  const [packetsSent, setPacketsSent] = useState(142);

  // Live Activity Telemetry
  const [activityText, setActivityText] = useState('Idle (Standby)');
  const [lastUpdateTime, setLastUpdateTime] = useState('Just now');
  const [heartbeatSeconds, setHeartbeatSeconds] = useState(5);

  // Game Account Profile Info
  const [accountInfo, setAccountInfo] = useState<GameAccountInfoType>({
    playerName: 'Phoenix_FF',
    uid: '1029384756',
    level: 'Lv. 68',
    region: 'BD - Bangladesh',
    bio: '🔥 Booyah or Nothing! Squad Captain.',
    rank: 'Heroic ⭐⭐',
    likes: 1842,
  });
  const [isRefreshingAccount, setIsRefreshingAccount] = useState(false);

  // Friend & Guild state
  const [friends, setFriends] = useState<FriendItem[]>(INITIAL_FRIENDS);
  const [guild, setGuild] = useState<GuildInfo | null>(INITIAL_GUILD);

  // Tool Response State
  const [toolResponse, setToolResponse] = useState<ToolResponseState>({
    action: '',
    status: 'idle',
    response: '',
  });

  // Console Logs
  const [logs, setLogs] = useState<ConsoleLogEntry[]>(INITIAL_LOGS);

  // Notifications
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);

  // Modals
  const [friendModalMode, setFriendModalMode] = useState<'add' | 'remove' | 'view' | null>(null);
  const [guildModalMode, setGuildModalMode] = useState<'join' | 'leave' | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isInGameModalOpen, setIsInGameModalOpen] = useState(false);

  // -------------------------------------------------------------
  // Helpers & Log Appender
  // -------------------------------------------------------------
  const addLog = (message: string, type: ConsoleLogEntry['type'] = 'info') => {
    const newEntry: ConsoleLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: formatLogTimestamp(),
      message,
      type,
    };
    setLogs((prev) => [...prev, newEntry]);
    setLastUpdateTime(formatLogTimestamp());
  };

  const addNotification = (type: AlertNotification['type'], title: string, message: string) => {
    const alert = createAlert(type, title, message);
    setNotifications((prev) => [alert, ...prev.slice(0, 4)]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // -------------------------------------------------------------
  // Persist Non-Sensitive Configuration
  // -------------------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // storage unavailable
    }
  }, [config]);

  // -------------------------------------------------------------
  // Timer Loops: Runtime, Heartbeat & Packet Emulation
  // -------------------------------------------------------------
  useEffect(() => {
    let runtimeInterval: NodeJS.Timeout | null = null;
    if (botStatus === 'ONLINE') {
      runtimeInterval = setInterval(() => {
        setRuntimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (runtimeInterval) clearInterval(runtimeInterval);
    };
  }, [botStatus]);

  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      setHeartbeatSeconds((prev) => {
        if (prev <= 1) {
          if (tcpStatus === 'CONNECTED') {
            setPacketsSent((p) => p + 1);
            setPacketsReceived((p) => p + 1);
          }
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(heartbeatInterval);
  }, [tcpStatus]);

  // Periodic simulated activity cycle in Demo Mode when online
  useEffect(() => {
    if (botStatus !== 'ONLINE') return;

    const activities = [
      'Working...',
      'Checking bot status...',
      'Processing task...',
      'Waiting for next task',
      'Telemetry synchronized',
    ];

    let cycleIndex = 0;
    const taskCycle = setInterval(() => {
      cycleIndex = (cycleIndex + 1) % activities.length;
      setActivityText(activities[cycleIndex]);

      if (cycleIndex === 1) {
        addLog('🔄 Checking bot status...', 'info');
      } else if (cycleIndex === 2) {
        addLog('⚙️ Processing task...', 'task');
      } else if (cycleIndex === 3) {
        addLog('✅ Bot is working normally', 'online');
      }
    }, 12000);

    return () => clearInterval(taskCycle);
  }, [botStatus]);

  // -------------------------------------------------------------
  // Free Fire Account Authentication & Session Verification
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const checkInitialSession = async () => {
      try {
        const session = await botApi.getAuthSession();
        if (!isMounted) return;
        if (session.authenticated && session.uid) {
          setIsAuthenticated(true);
          setAuthenticatedUid(session.uid);
          setAuthenticatedRegion(session.region || 'SG');
          if (session.botRunning) {
            setBotStatus('ONLINE');
            setActivityText('Working...');
          } else {
            setBotStatus('OFFLINE');
            setActivityText('Bot Ready (Standby)');
          }
        } else {
          setIsAuthenticated(false);
          setAuthenticatedUid(null);
          setBotStatus('OFFLINE');
          setActivityText('Locked - Authentication Required');
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setAuthenticatedUid(null);
          setBotStatus('OFFLINE');
        }
      }
    };
    checkInitialSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthenticateAccount = async (uid: string, password: string, region: string): Promise<boolean> => {
    setIsAuthenticating(true);
    setAuthErrorMessage(null);

    try {
      const res = await botApi.authenticateAccount(uid, password, region);
      if (res.authenticated) {
        setIsAuthenticated(true);
        setAuthenticatedUid(res.uid);
        setAuthenticatedRegion(res.region);
        setConfig((prev) => ({
          ...prev,
          uid: res.uid,
          region: res.region,
          ownerUid: res.uid,
          botUid: `BOT-${res.uid.slice(-4)}-${res.region}`,
        }));
        setAuthErrorMessage(null);
        setActivityText('Bot Ready (Standby)');
        addLog(`🟢 Account Authenticated: Free Fire UID ${res.uid} (${res.region})`, 'online');
        addLog('🔓 BOT READY: Start Bot button is now enabled.', 'online');
        addNotification('success', 'Account Authenticated', `Free Fire UID ${res.uid} verified.`);
        return true;
      }
      return false;
    } catch (err: any) {
      setIsAuthenticated(false);
      setAuthenticatedUid(null);
      setBotStatus('OFFLINE');
      setActivityText('Authentication failed - Locked');
      const msg = err?.message || 'Authentication failed. Please check your account details.';
      setAuthErrorMessage(msg);
      addLog(`🔴 ${msg.includes('failed') ? 'Bot OFFLINE: ' : ''}${msg}`, 'error');
      addNotification('error', 'Authentication Failed', msg);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRevokeAuth = async () => {
    try {
      await botApi.revokeAuth();
    } catch {
      // fallback
    }
    setIsAuthenticated(false);
    setAuthenticatedUid(null);
    setBotStatus('OFFLINE');
    setActivityText('Locked - Authentication Required');
    addLog('🔒 Bot Locked: Free Fire account authentication revoked.', 'offline');
    addLog('🔴 Bot OFFLINE', 'offline');
    addNotification('info', 'Bot Locked', 'Account authentication removed. Start Bot is disabled.');
  };

  // -------------------------------------------------------------
  // Bot Runtime Actions: START, STOP, RESTART
  // -------------------------------------------------------------
  const handleStartBot = async () => {
    if (botStatus === 'ONLINE') {
      addNotification('warning', 'Bot Already Running', 'The bot process is already running.');
      return;
    }

    // MANDATORY USER REQUIREMENT: The bot must NOT work without user's Free Fire account authentication
    if (!isAuthenticated || !authenticatedUid) {
      setBotStatus('OFFLINE');
      setActivityText('Locked - Authentication Required');
      addLog('🔴 Bot cannot start: Account authentication is required before using the bot.', 'error');
      addLog('🔒 BOT LOCKED', 'offline');
      addNotification('error', 'Bot Locked', 'Account authentication is required before using the bot.');
      setActiveTab('bot-control');
      return;
    }

    if (tcpStatus === 'DISCONNECTED' && !demoMode) {
      addNotification('error', 'Backend Offline', 'Cannot start bot while TCP relay is disconnected.');
      setBotStatus('ERROR');
      addLog('⚠️ Connection problem: TCP relay disconnected', 'error');
      return;
    }

    try {
      setBotStatus('STARTING');
      setActivityText('Starting bot process...');
      addLog('🟡 Starting...', 'starting');

      const targetUid = authenticatedUid || config.uid;
      const targetRegion = authenticatedRegion || config.region;
      await botApi.startBot(targetUid, targetRegion);

      setBotStatus('ONLINE');
      setActivityText('Working...');
      addLog('🟢 Bot started successfully', 'online');
      addLog('✅ Backend confirms bot is running.', 'online');
      addLog('🟢 ONLINE', 'online');
      addNotification('success', 'Bot Started', `Backend confirms bot is running for UID ${targetUid}`);
    } catch (err: any) {
      setBotStatus('OFFLINE');
      setActivityText('Startup failed');
      addLog(`🔴 Startup failed: ${err?.message || 'Authentication required'}`, 'error');
      addNotification('error', 'Startup Failed', err?.message || 'Failed to start bot.');
    }
  };

  const handleStopBot = async () => {
    if (botStatus === 'OFFLINE') {
      addNotification('warning', 'Bot Already Stopped', 'The bot is already in OFFLINE state.');
      return;
    }

    try {
      addLog('🟡 Stop command received', 'starting');
      await botApi.stopBot();
      setBotStatus('OFFLINE');
      setActivityText(isAuthenticated ? 'Bot Ready (Standby)' : 'Locked - Authentication Required');
      addLog('🔴 Bot stopped', 'offline');
      addLog('⏸️ Waiting for Start Bot', 'info');
      addNotification('info', 'Bot Stopped', 'Bot process terminated safely.');
    } catch (err: any) {
      setBotStatus('OFFLINE');
      addLog('🔴 Bot stopped', 'offline');
    }
  };

  const handleRestartBot = async () => {
    if (!isAuthenticated || !authenticatedUid) {
      addNotification('error', 'Bot Locked', 'Account authentication is required before using the bot.');
      return;
    }
    try {
      addLog('🟡 Stop command received for restart', 'starting');
      setBotStatus('STARTING');
      setActivityText('Restarting backend process...');
      addLog('🔄 Restarting bot daemon...', 'starting');

      const targetUid = authenticatedUid || config.uid;
      const targetRegion = authenticatedRegion || config.region;
      await botApi.restartBot(targetUid, targetRegion);

      setBotStatus('ONLINE');
      setActivityText('Working...');
      addLog('🟢 Bot restarted successfully', 'online');
      addLog('✅ Backend confirms bot is running.', 'online');
      addLog('🟢 ONLINE', 'online');
      addNotification('success', 'Bot Restarted', 'Daemon process restarted successfully.');
    } catch (err: any) {
      setBotStatus('OFFLINE');
      addLog(`⚠️ Error during restart: ${err?.message}`, 'error');
      addNotification('error', 'Restart Failed', err?.message || 'Failed to restart.');
    }
  };

  // -------------------------------------------------------------
  // TCP Relay Connection Controls
  // -------------------------------------------------------------
  const handleTcpConnect = async () => {
    if (tcpStatus === 'CONNECTED') return;
    setTcpStatus('CONNECTING');
    addLog('[TCP] Initiating TLS handshake with regional relay...', 'info');

    const selectedRegionObj = FF_REGIONS.find((r) => r.code === config.region) || FF_REGIONS[0];
    try {
      const res = await botApi.connectBackend(selectedRegionObj.serverNode);
      setTcpStatus('CONNECTED');
      setLatencyMs(selectedRegionObj.pingMs);
      addLog(`[TCP] Connected: ${res.message}`, 'online');
      addNotification('success', 'TCP Connected', `Linked to ${selectedRegionObj.serverNode}`);
    } catch (err: any) {
      setTcpStatus('DISCONNECTED');
      addLog(`[TCP] Connection failed: ${err?.message}`, 'error');
      addNotification('error', 'Connection Failed', 'Unable to establish TCP relay bridge.');
    }
  };

  const handleTcpDisconnect = async () => {
    if (tcpStatus === 'DISCONNECTED') return;
    try {
      await botApi.disconnectBackend();
      setTcpStatus('DISCONNECTED');
      if (botStatus === 'ONLINE') {
        setBotStatus('OFFLINE');
      }
      addLog('[TCP] Disconnected from relay server.', 'offline');
      addNotification('info', 'TCP Disconnected', 'Relay socket closed.');
    } catch {
      setTcpStatus('DISCONNECTED');
    }
  };

  // -------------------------------------------------------------
  // Account Information Refresh
  // -------------------------------------------------------------
  const handleRefreshAccountInfo = async () => {
    if (!config.uid) {
      addNotification('error', 'Missing UID', 'Please specify UID in account setup.');
      return;
    }
    if (tcpStatus === 'DISCONNECTED' && !demoMode) {
      addNotification('error', 'API Unavailable', 'Backend connection required for profile queries.');
      return;
    }

    setIsRefreshingAccount(true);
    addLog(`[API] Querying public profile for UID ${config.uid}...`, 'info');
    try {
      const selectedRegionObj = FF_REGIONS.find((r) => r.code === config.region) || FF_REGIONS[0];
      const data = await botApi.getAccountInfo(config.uid, selectedRegionObj.name);
      setAccountInfo(data);
      addLog('[API] Public profile synchronized.', 'online');
      addNotification('success', 'Profile Updated', 'Authorized player info refreshed.');
    } catch (err: any) {
      addLog(`[API] Lookup failed: ${err?.message}`, 'error');
      addNotification('error', 'API Unavailable', err?.message || 'Failed to query player info.');
    } finally {
      setIsRefreshingAccount(false);
    }
  };

  // -------------------------------------------------------------
  // Extend Time & Task Execution
  // -------------------------------------------------------------
  const handleExtendTime = () => {
    if (bankedHours >= 24.0) {
      addNotification('warning', 'Maximum Bank Reached', 'Session bank is already at maximum 24.0h limit.');
      return;
    }
    const newBank = Math.min(24.0, bankedHours + 2.0);
    setBankedHours(newBank);
    addLog(`[System] Extended runtime bank (+2.0h). Total: ${newBank.toFixed(1)}h banked.`, 'info');
    addNotification('success', 'Time Extended', `+2.0h banked. Total: ${newBank.toFixed(1)}h`);
  };

  const handleExecuteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.completed) {
      addNotification('info', 'Task Already Completed', 'This daily task was already executed.');
      return;
    }

    if (bankedHours >= 24.0) {
      addNotification('warning', 'Bank Full', 'Bank limit is at maximum 24.0h.');
      return;
    }

    setProcessingTaskId(taskId);
    addLog(`🎮 Task started: ${task.title}`, 'task');
    addLog('⚙️ Processing task...', 'task');

    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
      );
      setTasksCompletedToday((prev) => Math.min(5, prev + 1));
      setBankedHours((prev) => Math.min(24.0, prev + task.rewardHours));
      setProcessingTaskId(null);

      addLog(`✅ Task completed: ${task.title}`, 'online');
      addLog('🔄 Waiting for next task', 'info');
      addNotification('success', 'Task Completed', `${task.title} (+${task.rewardHours}h reward)`);
    }, 1400);
  };

  // -------------------------------------------------------------
  // Tool Center Handlers (Friend & Guild)
  // -------------------------------------------------------------
  const handleAddFriendAction = async (targetUid: string) => {
    setToolResponse({
      action: 'Add Friend',
      status: 'processing',
      response: 'Waiting for API response.',
      timestamp: formatLogTimestamp(),
    });

    try {
      const res = await botApi.addFriend(targetUid);
      if (res.friend) {
        setFriends((prev) => [res.friend!, ...prev]);
      }
      setToolResponse({
        action: 'Add Friend',
        status: 'success',
        response: 'Action completed successfully.',
        timestamp: formatLogTimestamp(),
        details: res.message,
      });
      addLog(`[Tools] Add Friend: ${res.message}`, 'online');
      addNotification('success', 'Friend Added', res.message);
    } catch (err: any) {
      setToolResponse({
        action: 'Add Friend',
        status: 'error',
        response: 'Action failed.',
        timestamp: formatLogTimestamp(),
        details: err?.message,
      });
      addLog(`[Tools] Add Friend Failed: ${err?.message}`, 'error');
      addNotification('error', 'Action Failed', err?.message || 'Please check the UID, connection, or API status.');
      throw err;
    }
  };

  const handleRemoveFriendAction = async (targetUid: string) => {
    setToolResponse({
      action: 'Remove Friend',
      status: 'processing',
      response: 'Waiting for API response.',
      timestamp: formatLogTimestamp(),
    });

    try {
      const res = await botApi.removeFriend(targetUid);
      setFriends((prev) => prev.filter((f) => f.uid !== targetUid));
      setToolResponse({
        action: 'Remove Friend',
        status: 'success',
        response: 'Action completed successfully.',
        timestamp: formatLogTimestamp(),
        details: res.message,
      });
      addLog(`[Tools] Remove Friend: ${res.message}`, 'online');
      addNotification('info', 'Friend Removed', res.message);
    } catch (err: any) {
      setToolResponse({
        action: 'Remove Friend',
        status: 'error',
        response: 'Action failed.',
        timestamp: formatLogTimestamp(),
        details: err?.message,
      });
      addLog(`[Tools] Remove Friend Failed: ${err?.message}`, 'error');
      addNotification('error', 'Action Failed', err?.message || 'Please check the UID, connection, or API status.');
      throw err;
    }
  };

  const handleJoinGuildAction = async (guildId: string) => {
    setToolResponse({
      action: 'Join Guild',
      status: 'processing',
      response: 'Waiting for API response.',
      timestamp: formatLogTimestamp(),
    });

    try {
      const res = await botApi.joinGuild(guildId);
      if (res.guild) {
        setGuild(res.guild);
      }
      setToolResponse({
        action: 'Join Guild',
        status: 'success',
        response: 'Action completed successfully.',
        timestamp: formatLogTimestamp(),
        details: res.message,
      });
      addLog(`[Tools] Join Guild: ${res.message}`, 'online');
      addNotification('success', 'Guild Application Sent', res.message);
    } catch (err: any) {
      setToolResponse({
        action: 'Join Guild',
        status: 'error',
        response: 'Action failed.',
        timestamp: formatLogTimestamp(),
        details: err?.message,
      });
      addLog(`[Tools] Join Guild Failed: ${err?.message}`, 'error');
      addNotification('error', 'Action Failed', err?.message || 'Please check the Guild ID, connection, or API status.');
      throw err;
    }
  };

  const handleLeaveGuildAction = async () => {
    setToolResponse({
      action: 'Leave Guild',
      status: 'processing',
      response: 'Waiting for API response.',
      timestamp: formatLogTimestamp(),
    });

    try {
      const res = await botApi.leaveGuild();
      setGuild(null);
      setToolResponse({
        action: 'Leave Guild',
        status: 'success',
        response: 'Action completed successfully.',
        timestamp: formatLogTimestamp(),
        details: res.message,
      });
      addLog(`[Tools] Leave Guild: ${res.message}`, 'online');
      addNotification('info', 'Guild Departed', res.message);
    } catch (err: any) {
      setToolResponse({
        action: 'Leave Guild',
        status: 'error',
        response: 'Action failed.',
        timestamp: formatLogTimestamp(),
        details: err?.message,
      });
      addLog(`[Tools] Leave Guild Failed: ${err?.message}`, 'error');
      addNotification('error', 'Action Failed', err?.message || 'Unable to leave guild.');
      throw err;
    }
  };

  // -------------------------------------------------------------
  // Delete Bot Handler
  // -------------------------------------------------------------
  const handleConfirmDeleteBot = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig({
      uid: '',
      region: 'BD',
      ownerUid: '',
      botUid: '',
      autoReconnect: true,
      heartbeatIntervalSec: 5,
      demoMode: true,
    });
    setBotStatus('OFFLINE');
    setRuntimeSeconds(0);
    setBankedHours(0);
    setTasksCompletedToday(0);
    setLogs([
      {
        id: `del-${Date.now()}`,
        timestamp: formatLogTimestamp(),
        message: '[System] Bot configuration deleted. Returned to setup mode.',
        type: 'info',
      },
    ]);
    setIsDeleteModalOpen(false);
    setActiveTab('settings');
    addNotification('info', 'Bot Configuration Deleted', 'Local configuration cleared safely.');
  };

  // -------------------------------------------------------------
  // Clear / Copy Logs
  // -------------------------------------------------------------
  const handleClearLogs = () => {
    setLogs([
      {
        id: `clr-${Date.now()}`,
        timestamp: formatLogTimestamp(),
        message: '[System] Console logs cleared.',
        type: 'info',
      },
    ]);
    addNotification('info', 'Logs Cleared', 'Terminal output buffer refreshed.');
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard?.writeText(text).catch(() => {});
    addNotification('success', 'Logs Copied', 'Console buffer copied to clipboard.');
  };

  // Current selected region display
  const currentRegionOption = FF_REGIONS.find((r) => r.code === config.region) || FF_REGIONS[0];

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Global Demo Mode Banner */}
      <DemoModeBanner
        demoMode={demoMode}
        onToggleDemoMode={() => {
          setDemoMode(!demoMode);
          addNotification(
            'info',
            !demoMode ? 'Demo Mode Activated' : 'Live API Mode',
            !demoMode 
              ? 'Simulation enabled. All operations are safe and client-side.' 
              : 'Direct API mode enabled. Live backend connection required.'
          );
        }}
        tcpConnected={tcpStatus === 'CONNECTED'}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          currentTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          botStatus={botStatus}
          savedUid={authenticatedUid || config.uid}
          region={authenticatedRegion || config.region}
          isAuthenticated={isAuthenticated}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-[calc(100vh-38px)]">
          {/* Top Bar */}
          <Navbar
            onToggleSidebarMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            botStatus={botStatus}
            tcpStatus={tcpStatus}
            savedUid={authenticatedUid || config.uid}
            region={authenticatedRegion || config.region}
            onOpenSettings={() => setActiveTab('settings')}
            onRefreshAll={() => {
              handleRefreshAccountInfo();
              addLog('[System] Global telemetry refreshed.', 'info');
            }}
            isAuthenticated={isAuthenticated}
            onOpenAuth={() => setActiveTab('bot-control')}
            onOpenInGameMode={() => setIsInGameModalOpen(true)}
          />

          {/* Primary View Router */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* VIEW 1: ACCOUNT SETUP / SETTINGS */}
            {activeTab === 'settings' || !config.uid ? (
              <div className="space-y-6">
                <AccountSetupScreen
                  currentConfig={config}
                  onSaveAccount={(newConfig) => {
                    setConfig(newConfig);
                    setActiveTab('dashboard');
                    addLog(`[Config] Saved Free Fire Account: UID ${newConfig.uid} (${newConfig.region})`, 'info');
                    addNotification('success', 'Account Saved', `UID ${newConfig.uid} registered for ${newConfig.region}`);
                  }}
                  onCancel={config.uid ? () => setActiveTab('dashboard') : undefined}
                  isInitialSetup={!config.uid}
                />
              </div>
            ) : activeTab === 'freefire-stats' ? (
              /* VIEW: FREE FIRE ACCOUNT INFO & STATS API (HL Gaming Integration) */
              <div className="space-y-6">
                <FreeFireAccountStatsViewer
                  currentUid={authenticatedUid || config.uid}
                  currentRegion={authenticatedRegion || config.region}
                  onShowNotification={addNotification}
                  onLogMessage={addLog}
                />
              </div>
            ) : activeTab === 'the-brain' ? (
              /* VIEW: THE BRAIN 🧠 (FREE FIRE TCP EMOTE & AI ENGINE) */
              <div className="space-y-6">
                <BrainView
                  savedUid={config.uid}
                  region={config.region}
                  onLogMessage={addLog}
                  onShowNotification={addNotification}
                  demoMode={demoMode}
                />
              </div>
            ) : activeTab === 'friends' ? (
              /* VIEW 2: FRIENDS DEDICATED VIEW */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-gaming text-white">
                      👥 Friend Manager
                    </h2>
                    <p className="text-xs text-slate-400">
                      Authorized public directory interaction for Free Fire players
                    </p>
                  </div>
                  <button
                    onClick={() => setFriendModalMode('add')}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 font-gaming text-xs font-bold text-white shadow-lg transition active:scale-95"
                  >
                    ➕ Add Friend
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((f) => (
                    <div
                      key={f.uid}
                      className="p-4 rounded-xl bg-[#101622] border border-[#202c40] flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-gaming font-bold text-white text-sm">
                            {f.name}
                          </h3>
                          <p className="font-mono-code text-xs text-amber-400 mt-0.5">
                            UID: {f.uid}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {f.rank}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Level: {f.level}</span>
                        <span className={`text-[10px] font-gaming uppercase px-2 py-0.5 rounded ${
                          f.status === 'online' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {f.status}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[#1a2538] flex justify-end">
                        <button
                          onClick={() => handleRemoveFriendAction(f.uid)}
                          className="text-xs font-gaming text-rose-400 hover:text-rose-300 transition"
                        >
                          Remove Friend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'guild' ? (
              /* VIEW 3: GUILD DEDICATED VIEW */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-gaming text-white">
                      🏰 Guild Manager
                    </h2>
                    <p className="text-xs text-slate-400">
                      Guild membership directory and tournament points
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGuildModalMode('join')}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 font-gaming text-xs font-bold text-slate-950 shadow-lg transition active:scale-95"
                    >
                      ➕ Join Guild
                    </button>
                    {guild && (
                      <button
                        onClick={() => setGuildModalMode('leave')}
                        className="px-4 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 font-gaming text-xs font-bold text-rose-300 transition active:scale-95"
                      >
                        🚪 Leave Guild
                      </button>
                    )}
                  </div>
                </div>

                {guild ? (
                  <div className="p-6 rounded-2xl bg-[#101622] border border-[#232f45] shadow-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c273a] pb-4">
                      <div>
                        <span className="text-xs font-gaming text-amber-400 uppercase tracking-wider">
                          Active Free Fire Guild
                        </span>
                        <h3 className="text-2xl font-gaming font-bold text-white mt-1">
                          {guild.name}
                        </h3>
                        <p className="text-xs font-mono-code text-slate-400 mt-0.5">
                          Guild ID: {guild.id} · Region: {guild.region}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-[#090d15] border border-[#1b2537] text-center">
                          <span className="text-[10px] text-slate-400 uppercase block font-gaming">Level</span>
                          <span className="text-lg font-bold font-gaming text-amber-400">Lv. {guild.level}</span>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-[#090d15] border border-[#1b2537] text-center">
                          <span className="text-[10px] text-slate-400 uppercase block font-gaming">Members</span>
                          <span className="text-lg font-bold font-mono-code text-white">{guild.membersCount}/{guild.maxMembers}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0a0e16] border border-[#1d273a]">
                      <span className="text-xs font-gaming font-bold text-slate-300 uppercase tracking-wide block mb-1">
                        Guild Announcement Notice
                      </span>
                      <p className="text-xs font-mono-code text-slate-300">
                        {guild.notice}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-[#101622] border border-[#232f45] space-y-3">
                    <p className="text-slate-400 font-gaming text-sm">
                      You are not currently enrolled in any Free Fire guild.
                    </p>
                    <button
                      onClick={() => setGuildModalMode('join')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-gaming font-bold text-xs"
                    >
                      ➕ Join a Guild Now
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === 'account-info' ? (
              /* VIEW 4: ACCOUNT INFO DEDICATED VIEW */
              <div className="space-y-6">
                <GameAccountInfo
                  accountInfo={accountInfo}
                  savedUid={config.uid}
                  selectedRegion={currentRegionOption.name}
                  onRefreshInfo={handleRefreshAccountInfo}
                  isLoading={isRefreshingAccount}
                />
              </div>
            ) : activeTab === 'live-console' ? (
              /* VIEW 5: LIVE CONSOLE VIEW */
              <div className="space-y-6">
                <LiveBotActivity
                  botStatus={botStatus}
                  activity={activityText}
                  lastUpdate={lastUpdateTime}
                  heartbeatSeconds={heartbeatSeconds}
                  logs={logs}
                  onRefreshLogs={() => {
                    addLog('🔄 Checking bot status...', 'info');
                    addNotification('info', 'Logs Refreshed', 'Refreshed daemon event buffer.');
                  }}
                  onClearLogs={handleClearLogs}
                  onCopyLogs={handleCopyLogs}
                  demoMode={demoMode}
                />
              </div>
            ) : activeTab === 'tcp-connection' ? (
              /* VIEW 6: TCP CONNECTION VIEW */
              <div className="space-y-6">
                <TcpStatusCard
                  tcpStatus={tcpStatus}
                  serverNode={currentRegionOption.serverNode}
                  latencyMs={latencyMs}
                  packetsReceived={packetsReceived}
                  packetsSent={packetsSent}
                  onConnect={handleTcpConnect}
                  onDisconnect={handleTcpDisconnect}
                />
              </div>
            ) : activeTab === 'tools-center' ? (
              /* VIEW 7: TOOLS CENTER VIEW */
              <div className="space-y-6">
                <ToolsCenter
                  toolResponse={toolResponse}
                  onAddFriendClick={() => setFriendModalMode('add')}
                  onRemoveFriendClick={() => setFriendModalMode('remove')}
                  onViewFriendsClick={() => setFriendModalMode('view')}
                  onJoinGuildClick={() => setGuildModalMode('join')}
                  onLeaveGuildClick={() => setGuildModalMode('leave')}
                  currentGuild={guild}
                  friendCount={friends.length}
                />
              </div>
            ) : activeTab === 'bot-control' ? (
              /* VIEW 8: BOT CONTROL VIEW */
              <div className="space-y-6">
                {/* 🔐 Free Fire Account Required Authentication Header */}
                <FreeFireAccountAuthCard
                  isAuthenticated={isAuthenticated}
                  authenticatedUid={authenticatedUid}
                  authenticatedRegion={authenticatedRegion}
                  botStatus={botStatus}
                  onAuthenticate={handleAuthenticateAccount}
                  onRevokeAuth={handleRevokeAuth}
                  authErrorMessage={authErrorMessage}
                  isAuthenticating={isAuthenticating}
                />

                <BotControlPanel
                  botStatus={botStatus}
                  runtimeSeconds={runtimeSeconds}
                  bankedHours={bankedHours}
                  tasksCompletedToday={tasksCompletedToday}
                  onExtendTimeClick={handleExtendTime}
                  demoMode={demoMode}
                />
                <BotControls
                  config={config}
                  botStatus={botStatus}
                  tcpStatus={tcpStatus}
                  onStartBot={handleStartBot}
                  onStopBot={handleStopBot}
                  onRestartBot={handleRestartBot}
                  demoMode={demoMode}
                  isAuthenticated={isAuthenticated}
                  authenticatedUid={authenticatedUid}
                  onOpenAuth={() => setActiveTab('bot-control')}
                />
              </div>
            ) : (
              /* DEFAULT VIEW: COMPLETE DASHBOARD */
              <div className="space-y-6">
                {/* 🔐 Free Fire Account Required Authentication Header */}
                <FreeFireAccountAuthCard
                  isAuthenticated={isAuthenticated}
                  authenticatedUid={authenticatedUid}
                  authenticatedRegion={authenticatedRegion}
                  botStatus={botStatus}
                  onAuthenticate={handleAuthenticateAccount}
                  onRevokeAuth={handleRevokeAuth}
                  authErrorMessage={authErrorMessage}
                  isAuthenticating={isAuthenticating}
                />

                {/* 1. Bot Control Panel (Status, Runtime, Expires, Tasks) */}
                <BotControlPanel
                  botStatus={botStatus}
                  runtimeSeconds={runtimeSeconds}
                  bankedHours={bankedHours}
                  tasksCompletedToday={tasksCompletedToday}
                  onExtendTimeClick={handleExtendTime}
                  demoMode={demoMode}
                />

                {/* 🧠 THE BRAIN QUICK EMOTE CONTROLLER WIDGET */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d1422] via-[#0f182a] to-[#0d1422] border border-amber-500/30 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-gaming font-bold text-white tracking-wide">
                            THE BRAIN 🧠 · TCP EMOTE ENGINE
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-gaming font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ONLINE
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-gaming mt-0.5">
                          Autonomous Free Fire OB54 emote dispatcher with whisper & squad proto parsing.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveTab('the-brain')}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-gaming font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>Open In-Game Free Fire Brain 🧠</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 6 Quick 1-Click Emotes */}
                  <div className="mt-3.5 pt-3 border-t border-[#1b263b] flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[11px] font-gaming text-amber-400/90 whitespace-nowrap mr-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>Quick Emotes:</span>
                    </span>
                    {FF_EMOTES_DATABASE.slice(0, 6).map((emote) => (
                      <button
                        key={emote.id}
                        onClick={async () => {
                          try {
                            await brainEngine.triggerEmote(emote, 'manual');
                            addLog(`[sQ_pb2] 🎮 Emote Triggered: ${emote.icon} ${emote.name} (ID: ${emote.emoteId})`, 'task');
                            addNotification('success', `${emote.icon} Emote Dispatched`, `${emote.name} executed over TCP relay.`);
                          } catch (err: any) {
                            addNotification('warning', 'Emote Blocked', err?.message || 'Failed to dispatch emote.');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#141d30] hover:bg-[#1b2844] border border-[#22314e] text-xs font-gaming text-slate-200 hover:text-white whitespace-nowrap flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                        title={emote.description}
                      >
                        <span>{emote.icon}</span>
                        <span>{emote.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2-Column Grid: Bot Controls + TCP Connection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bot Controls (Start, Stop, Restart) */}
                  <BotControls
                    config={config}
                    botStatus={botStatus}
                    tcpStatus={tcpStatus}
                    onStartBot={handleStartBot}
                    onStopBot={handleStopBot}
                    onRestartBot={handleRestartBot}
                    demoMode={demoMode}
                    isAuthenticated={isAuthenticated}
                    authenticatedUid={authenticatedUid}
                    onOpenAuth={() => setActiveTab('bot-control')}
                  />

                  {/* TCP Connection Card */}
                  <TcpStatusCard
                    tcpStatus={tcpStatus}
                    serverNode={currentRegionOption.serverNode}
                    latencyMs={latencyMs}
                    packetsReceived={packetsReceived}
                    packetsSent={packetsSent}
                    onConnect={handleTcpConnect}
                    onDisconnect={handleTcpDisconnect}
                  />
                </div>

                {/* 3. Live Bot Activity (Status, Activity, Last Update, Heartbeat, Console) */}
                <LiveBotActivity
                  botStatus={botStatus}
                  activity={activityText}
                  lastUpdate={lastUpdateTime}
                  heartbeatSeconds={heartbeatSeconds}
                  logs={logs}
                  onRefreshLogs={() => {
                    addLog('🔄 Checking bot status...', 'info');
                    addNotification('info', 'Logs Refreshed', 'Refreshed daemon event buffer.');
                  }}
                  onClearLogs={handleClearLogs}
                  onCopyLogs={handleCopyLogs}
                  demoMode={demoMode}
                />

                {/* 2-Column Grid: Game Account Info + Task System */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Game Account Info */}
                  <GameAccountInfo
                    accountInfo={accountInfo}
                    savedUid={config.uid}
                    selectedRegion={currentRegionOption.name}
                    onRefreshInfo={handleRefreshAccountInfo}
                    isLoading={isRefreshingAccount}
                  />

                  {/* Task System Section */}
                  <TaskSystemSection
                    tasks={tasks}
                    tasksCompletedToday={tasksCompletedToday}
                    bankedHours={bankedHours}
                    onExecuteTask={handleExecuteTask}
                    isProcessingTask={processingTaskId}
                    demoMode={demoMode}
                  />
                </div>

                {/* 4. Tools Center (Friend Manager, Guild Manager, Tool Response) */}
                <ToolsCenter
                  toolResponse={toolResponse}
                  onAddFriendClick={() => setFriendModalMode('add')}
                  onRemoveFriendClick={() => setFriendModalMode('remove')}
                  onViewFriendsClick={() => setFriendModalMode('view')}
                  onJoinGuildClick={() => setGuildModalMode('join')}
                  onLeaveGuildClick={() => setGuildModalMode('leave')}
                  currentGuild={guild}
                  friendCount={friends.length}
                />

                {/* 5. Other Actions (Open Tools, Edit Details, Delete Bot) */}
                <OtherActions
                  onOpenTools={() => setIsToolsModalOpen(true)}
                  onEditDetails={() => setActiveTab('settings')}
                  onDeleteBot={() => setIsDeleteModalOpen(true)}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Floating Notifications / Error Toasts */}
      <NotificationToast
        notifications={notifications}
        onDismiss={removeNotification}
      />

      {/* Friend Action Modal (Add, Remove, View List) */}
      {friendModalMode && (
        <FriendActionModal
          mode={friendModalMode}
          isOpen={!!friendModalMode}
          onClose={() => setFriendModalMode(null)}
          friends={friends}
          onAddFriend={handleAddFriendAction}
          onRemoveFriend={handleRemoveFriendAction}
        />
      )}

      {/* Guild Action Modal (Join, Leave) */}
      {guildModalMode && (
        <GuildActionModal
          mode={guildModalMode}
          isOpen={!!guildModalMode}
          onClose={() => setGuildModalMode(null)}
          currentGuild={guild}
          onJoinGuild={handleJoinGuildAction}
          onLeaveGuild={handleLeaveGuildAction}
        />
      )}

      {/* Delete Bot Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteBot}
        botUid={config?.botUid || (config?.uid && config.uid.length >= 4 ? `BOT-${config.uid.slice(-4)}-${config.region || 'BD'}` : 'BOT-STANDBY')}
      />

      {/* Extra Utility Tools Modal */}
      <ToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        currentConfig={config}
        config={config}
        onApplyConfig={(newCfg) => setConfig(newCfg)}
        onLogMessage={(msg) => addLog(msg, 'info')}
      />

      {/* Free Fire In-Game Floating HUD Client Modal */}
      <FreeFireInGameFloatingModal
        isOpen={isInGameModalOpen}
        onClose={() => setIsInGameModalOpen(false)}
        savedUid={authenticatedUid || config.uid}
        region={authenticatedRegion || config.region}
        onLogMessage={addLog}
        onShowNotification={addNotification}
      />

      {/* Floating In-Game Free Fire Quick Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          id="floating-in-game-hud-btn"
          onClick={() => setIsInGameModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-gaming text-xs font-bold shadow-2xl shadow-orange-500/40 border border-amber-300/30 transition transform hover:scale-105 active:scale-95"
          title="Open Free Fire In-Game HUD overlay"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
          </span>
          <Gamepad2 className="w-4 h-4" />
          <span>🎮 IN FREE FIRE (LIVE HUD)</span>
        </button>
      </div>

      {/* Website Operator Login Portal Modal */}
      {!isWebsiteLoggedIn && (
        <WebsiteLoginModal
          onLogin={(user) => {
            setWebsiteUser(user);
            setIsWebsiteLoggedIn(true);
            addLog(`[Auth] Operator ${user} logged into control portal.`, 'online');
            addNotification('info', 'Portal Authenticated', `Welcome back, ${user}. Next: Authenticate Free Fire Account.`);
          }}
        />
      )}
    </div>
  );
}

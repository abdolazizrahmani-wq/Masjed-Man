/**
 * Central State & Business Logic Provider for Masjed-e Man (دارالقرآن کنخ)
 */

import React, { createContext, useContext, useEffect, useRef, useState, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Activity,
  AppNotification,
  AppSettings,
  AppTheme,
  AttendanceRecord,
  AuditLog,
  Badge,
  FontSize,
  MonthlyPeriod,
  Mosque,
  MotivationalQuote,
  PointTransaction,
  Reward,
  RewardWinner,
  StudentBadge,
  SyncStatus,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_ACTIVITIES,
  INITIAL_ATTENDANCES,
  INITIAL_BADGES,
  INITIAL_MOSQUES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PERIODS,
  INITIAL_QUOTES,
  INITIAL_REWARDS,
  INITIAL_SETTINGS,
  INITIAL_STUDENT_BADGES,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
} from '../utils/initialData';
import { dbSaveAttendance, dbSaveAuditLog, dbUpdateAttendanceStatus } from '../utils/indexedDB';
import {
  SHAMSI_MONTH_NAMES,
  getCurrentJalali,
  getJalaliMonthLength,
  getShamsiDateString,
  toPersianDigits,
} from '../utils/jalali';
import { isArray, loadJSON, loadString, onStorageWriteError, removeKey, saveJSON, saveString } from '../utils/storage';
import { generateTempPassword, hashPassword, verifyPassword } from '../utils/password';
import { isValidNationalCode, isValidPassword, normalizeDigits } from '../utils/validators';
import { isBackendConfigured, pushAttendances } from '../utils/syncApi';

const SESSION_KEY = 'mm_session_uid';
const LOGIN_GUARD_KEY = 'mm_login_guard';
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;
const MAX_AUDIT_LOGS = 500;

/** Non-privileged placeholder used only while nobody is signed in. */
const GUEST_USER: User = {
  id: 'guest',
  username: 'guest',
  fullName: 'مهمان',
  role: 'student',
  referralCode: 'GUEST',
  status: 'inactive',
  createdAt: '',
};

const uid = (prefix: string): string =>
  `${prefix}-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;

/** Strips plaintext password so it never gets persisted. */
const stripPlain = (u: User): User => {
  const { password: _ignored, ...rest } = u;
  return rest;
};

interface AppContextType {
  currentUser: User;
  users: User[];
  mosques: Mosque[];
  activities: Activity[];
  attendances: AttendanceRecord[];
  transactions: PointTransaction[];
  periods: MonthlyPeriod[];
  rewards: Reward[];
  winners: RewardWinner[];
  badges: Badge[];
  studentBadges: StudentBadge[];
  notifications: AppNotification[];
  quotes: MotivationalQuote[];
  settings: AppSettings;
  auditLogs: AuditLog[];
  
  // Offline & Sync
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  syncStatus: SyncStatus;
  pendingOfflineCount: number;
  syncOfflineQueue: () => Promise<{ success: boolean; syncedCount: number }>;
  isSyncing: boolean;
  isBackendConfigured: boolean;
  storageWarning: boolean;
  dismissStorageWarning: () => void;

  // UI & Personalization
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  fontSize: FontSize;
  setFontSize: (f: FontSize) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Actions
  recordAttendanceBatch: (params: {
    studentIds: string[];
    activityId: string;
    attendanceMosqueId: string;
    customShamsiDate?: string;
  }) => { success: boolean; message: string; recordedCount: number; skippedCount: number };
  
  adjustStudentPoints: (studentId: string, amount: number, reason: string) => void;
  registerStudent: (student: Omit<User, 'id' | 'referralCode' | 'createdAt' | 'status'>, referralCodeInput?: string) => Promise<{ success: boolean; message: string }>;
  approveStudentRegistration: (studentId: string) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => { success: boolean; message: string };
  transferStudentMosque: (studentId: string, newMosqueId: string, reason: string) => void;
  
  addMosque: (mosque: Omit<Mosque, 'id' | 'createdAt' | 'qrCodeKey'>) => void;
  updateMosque: (mosque: Mosque) => void;
  toggleMosqueActive: (id: string) => void;
  deleteMosque: (id: string) => { success: boolean; message: string };

  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (activity: Activity) => void;
  toggleActivity: (id: string) => void;
  deleteActivity: (id: string) => { success: boolean; message: string };

  addReward: (reward: Omit<Reward, 'id'>) => void;
  updateReward: (reward: Reward) => void;
  toggleRewardWinnerDelivered: (winnerId: string) => void;

  addQuote: (text: string, source?: string) => void;
  updateQuote: (quote: MotivationalQuote) => void;
  deleteQuote: (id: string) => void;

  updateSettings: (newSettings: Partial<AppSettings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Stats & Leaderboards
  getStudentMonthlyPoints: (studentId: string) => number;
  getStudentTotalPoints: (studentId: string) => number;
  getStudentDaysAttendedMonth: (studentId: string) => number;
  getStudentRankInMosque: (studentId: string, mosqueId?: string) => { rank: number; total: number };
  getStudentRankInVillage: (studentId: string) => { rank: number; total: number };
  getMosqueLeaderboard: (mosqueId: string, periodId?: string) => { student: User; points: number; rank: number }[];
  getVillageLeaderboard: (periodId?: string) => { student: User; points: number; rank: number; mosqueName: string }[];
  
  // Auth
  isAuthenticated: boolean;
  /** True on a brand-new install (no users yet): the app must show the first-admin setup screen. */
  needsSetup: boolean;
  createFirstAdmin: (data: { fullName: string; nationalCode: string; password: string; email?: string }) => Promise<{ success: boolean; message: string }>;
  login: (nationalCodeOrUser: string, passwordInput: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  /** Public "forgot password": notifies the administrator; never reveals whether the account exists. */
  requestPasswordReset: (identifier: string) => { success: boolean; message: string };
  /** Admin-only: sets a new random temporary password and returns it once. */
  adminResetPassword: (userId: string) => Promise<{ success: boolean; message: string; newPassword?: string }>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; message: string }>;

  // Export
  exportAttendanceToExcel: (filteredList?: AttendanceRecord[]) => void;
}

const DEFAULT_WINNERS: RewardWinner[] = [];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Appearance (persisted)
  const [theme, setThemeState] = useState<AppTheme>(() => (loadString('mm_theme') as AppTheme) || 'emerald');
  const [darkMode, setDarkModeState] = useState<boolean>(() => loadString('mm_dark_mode') === 'true');
  const [fontSize, setFontSizeState] = useState<FontSize>(() => (loadString('mm_font_size') as FontSize) || 'medium');
  const [activeTab, setActiveTab] = useState<string>('home');

  // Network & Sync
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isRealOnline, setIsRealOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [storageWarning, setStorageWarning] = useState<boolean>(false);

  // Entities state (all reads are corruption-safe)
  const [users, setUsers] = useState<User[]>(() => {
    // "mm_users" always held the most recent full list; "mm_users_v2" is the legacy read key.
    return (
      loadJSON<User[] | null>('mm_users', null, isArray) ??
      loadJSON<User[] | null>('mm_users_v2', null, isArray) ??
      INITIAL_USERS
    );
  });

  // Session = only the signed-in user's id. The user object itself is always derived from `users`.
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => loadString(SESSION_KEY));
  const sessionUser = useMemo(
    () => (sessionUserId ? users.find(u => u.id === sessionUserId && u.status === 'active') ?? null : null),
    [sessionUserId, users]
  );
  const isAuthenticated = sessionUser !== null;
  const currentUser: User = sessionUser ?? GUEST_USER;

  const [mosques, setMosques] = useState<Mosque[]>(() => loadJSON('mm_mosques', INITIAL_MOSQUES, isArray));
  const [activities, setActivities] = useState<Activity[]>(() => loadJSON('mm_activities', INITIAL_ACTIVITIES, isArray));
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() =>
    loadJSON('mm_attendances', INITIAL_ATTENDANCES, isArray)
  );
  const [transactions, setTransactions] = useState<PointTransaction[]>(() =>
    loadJSON('mm_transactions', INITIAL_TRANSACTIONS, isArray)
  );
  const [rewards, setRewards] = useState<Reward[]>(() => loadJSON('mm_rewards', INITIAL_REWARDS, isArray));

  const [winners, setWinners] = useState<RewardWinner[]>(() =>
    loadJSON<RewardWinner[]>('mm_winners', DEFAULT_WINNERS, isArray)
  );

  const [badges] = useState<Badge[]>(INITIAL_BADGES);
  const [studentBadges, setStudentBadges] = useState<StudentBadge[]>(() =>
    loadJSON('mm_student_badges', INITIAL_STUDENT_BADGES, isArray)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadJSON('mm_notifications', INITIAL_NOTIFICATIONS, isArray)
  );
  const [quotes, setQuotes] = useState<MotivationalQuote[]>(() => loadJSON('mm_quotes', INITIAL_QUOTES, isArray));
  const [settings, setSettings] = useState<AppSettings>(() =>
    ({ ...INITIAL_SETTINGS, ...loadJSON<Partial<AppSettings>>('mm_settings', {}) })
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadJSON<AuditLog[]>('mm_audit_logs', [], isArray)
  );

  // Always-fresh view of attendances, updated synchronously to prevent double-recording on rapid taps.
  const attendancesRef = useRef<AttendanceRecord[]>(attendances);
  useEffect(() => {
    attendancesRef.current = attendances;
  }, [attendances]);

  // Monthly periods are derived from today's Jalali date + existing data (never hard-coded).
  const [todayKey, setTodayKey] = useState<string>(() => getShamsiDateString());
  useEffect(() => {
    const id = setInterval(() => setTodayKey(getShamsiDateString()), 60_000);
    return () => clearInterval(id);
  }, []);

  const periods: MonthlyPeriod[] = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const [cy, cm] = todayKey.split('/').map(Number);
    const keys = new Set<string>([`${cy}/${pad(cm)}`]);
    INITIAL_PERIODS.forEach(p => keys.add(`${p.year}/${pad(p.month)}`));
    transactions.forEach(t => keys.add(t.shamsiDate.slice(0, 7)));
    attendances.forEach(a => keys.add(a.shamsiDate.slice(0, 7)));

    return Array.from(keys)
      .filter(k => /^\d{4}\/\d{2}$/.test(k))
      .sort()
      .reverse()
      .map(k => {
        const [y, m] = k.split('/').map(Number);
        const monthName = SHAMSI_MONTH_NAMES[m - 1] || '';
        return {
          id: `period-${y}-${pad(m)}`,
          title: `دوره ${monthName} ${toPersianDigits(y)}`,
          year: y,
          month: m,
          monthName,
          startDate: `${k}/01`,
          endDate: `${k}/${pad(getJalaliMonthLength(y, m))}`,
          isCurrent: y === cy && m === cm,
        };
      });
  }, [todayKey, transactions, attendances]);

  // One-time cleanup of legacy session keys (the old format stored the whole user object, including role).
  useEffect(() => {
    removeKey('mm_current_user');
    removeKey('mm_authenticated');
  }, []);

  // Surface storage failures (quota exceeded / blocked storage) instead of silently losing data.
  useEffect(() => onStorageWriteError(() => setStorageWarning(true)), []);

  // Migrate any legacy plaintext passwords to salted hashes.
  useEffect(() => {
    const legacy = users.filter(u => u.password && !u.passwordHash);
    if (legacy.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const hashed = await Promise.all(
          legacy.map(async u => ({ id: u.id, ...(await hashPassword(u.password as string)) }))
        );
        if (cancelled) return;
        setUsers(prev =>
          prev.map(u => {
            const h = hashed.find(x => x.id === u.id);
            return h ? { ...stripPlain(u), passwordHash: h.passwordHash, passwordSalt: h.passwordSalt } : u;
          })
        );
      } catch {
        // crypto unavailable (non-HTTPS); keep legacy value until it is.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [users]);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsRealOnline(true);
    const handleOffline = () => setIsRealOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOnline = isRealOnline && !isSimulatedOffline;

  // Sync state tracking
  const pendingOfflineCount = useMemo(() => {
    return attendances.filter(a => a.syncStatus === 'pending' || a.syncStatus === 'error').length;
  }, [attendances]);

  const syncStatus: SyncStatus = useMemo(() => {
    const hasError = attendances.some(a => a.syncStatus === 'error');
    if (hasError) return 'error';
    if (pendingOfflineCount > 0) return 'pending';
    return 'synced';
  }, [attendances, pendingOfflineCount]);

  // Persist entities
  useEffect(() => {
    // keep plaintext only for legacy rows that are still waiting to be hashed
    saveJSON('mm_users', users.map(u => (u.password && !u.passwordHash ? u : stripPlain(u))));
    removeKey('mm_users_v2');
  }, [users]);

  useEffect(() => {
    saveJSON('mm_mosques', mosques);
  }, [mosques]);

  useEffect(() => {
    saveJSON('mm_activities', activities);
  }, [activities]);

  useEffect(() => {
    saveJSON('mm_attendances', attendances);
  }, [attendances]);

  useEffect(() => {
    saveJSON('mm_transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    saveJSON('mm_rewards', rewards);
  }, [rewards]);

  useEffect(() => {
    saveJSON('mm_winners', winners);
  }, [winners]);

  useEffect(() => {
    saveJSON('mm_student_badges', studentBadges);
  }, [studentBadges]);

  useEffect(() => {
    saveJSON('mm_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    saveJSON('mm_quotes', quotes);
  }, [quotes]);

  useEffect(() => {
    saveJSON('mm_settings', settings);
  }, [settings]);

  useEffect(() => {
    saveJSON('mm_audit_logs', auditLogs);
  }, [auditLogs]);

  // Apply Theme & Dark mode to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveString('mm_theme', theme);

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveString('mm_dark_mode', String(darkMode));

    document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-xlarge');
    document.documentElement.classList.add(`font-size-${fontSize}`);
    saveString('mm_font_size', fontSize);
  }, [theme, darkMode, fontSize]);

  const setTheme = (t: AppTheme) => setThemeState(t);
  const setDarkMode = (d: boolean) => setDarkModeState(d);
  const setFontSize = (f: FontSize) => setFontSizeState(f);
  const dismissStorageWarning = () => setStorageWarning(false);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline(prev => !prev);
  };

  // Role helpers (UI also hides these actions; the checks here are defence in depth, not real security)
  const actorIsAdmin = isAuthenticated && currentUser.role === 'admin';
  const actorIsStaff = isAuthenticated && (currentUser.role === 'admin' || currentUser.role === 'manager');
  const denied = { success: false, message: 'شما اجازه‌ی انجام این عملیات را ندارید.' };

  // Log audit helper
  const recordAudit = (action: string, targetEntity: string, targetId: string, details: string) => {
    const log: AuditLog = {
      id: uid('audit'),
      action,
      performedBy: currentUser.fullName,
      performedByRole: currentUser.role === 'admin' ? 'مدیر کل' : currentUser.role === 'manager' ? 'مسئول مسجد' : 'کاربر',
      targetEntity,
      targetId,
      details,
      timestamp: new Date().toISOString(),
      shamsiDate: getShamsiDateString(),
    };
    setAuditLogs(prev => [log, ...prev].slice(0, MAX_AUDIT_LOGS));
    void dbSaveAuditLog(log).catch(() => {});
  };

  // Sync offline queue (real HTTP push when VITE_API_URL is set; local-only mode otherwise)
  const syncingRef = useRef(false);
  const syncOfflineQueue = async () => {
    if (!isOnline || syncingRef.current) {
      return { success: false, syncedCount: 0 };
    }
    const queue = attendancesRef.current.filter(a => a.syncStatus === 'pending' || a.syncStatus === 'error');
    if (queue.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    syncingRef.current = true;
    setIsSyncing(true);

    try {
      const result = await pushAttendances(queue);
      const syncedSet = new Set(result.synced);
      const failedMap = new Map(result.failed.map(f => [f.clientUuid, f.error] as const));

      const next = attendancesRef.current.map(a => {
        if (syncedSet.has(a.clientUuid)) {
          return { ...a, syncStatus: 'synced' as SyncStatus, syncError: undefined };
        }
        if (failedMap.has(a.clientUuid)) {
          return { ...a, syncStatus: 'error' as SyncStatus, syncError: failedMap.get(a.clientUuid) };
        }
        return a;
      });
      attendancesRef.current = next;
      setAttendances(next);

      syncedSet.forEach(id => void dbUpdateAttendanceStatus(id, 'synced'));
      failedMap.forEach((err, id) => void dbUpdateAttendanceStatus(id, 'error', err));

      const syncedCount = syncedSet.size;
      if (syncedCount > 0) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.9 } });

        const notif: AppNotification = {
          id: uid('notif'),
          recipientUserId: currentUser.id,
          title: isBackendConfigured ? 'همگام‌سازی اطلاعات موفقیت‌آمیز بود' : 'رکوردهای حضور ذخیره شد',
          message: isBackendConfigured
            ? `${toPersianDigits(syncedCount)} رکورد حضور با سرور دارالقرآن کنخ با موفقیت همگام شد.`
            : `${toPersianDigits(syncedCount)} رکورد حضور ثبت‌شده در حالت آفلاین، روی همین دستگاه ذخیره شد.`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications(prev => [notif, ...prev]);
      }

      return { success: result.failed.length === 0, syncedCount };
    } catch {
      return { success: false, syncedCount: 0 };
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  };

  // Automatically attempt sync when coming online / when new pending records appear
  useEffect(() => {
    if (isOnline && isAuthenticated && pendingOfflineCount > 0) {
      void syncOfflineQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, isAuthenticated, pendingOfflineCount]);

  // Points Calculation Helpers
  const getStudentTotalPoints = (studentId: string): number => {
    return transactions
      .filter(t => t.studentId === studentId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const periodPrefix = (periodId?: string): string => {
    const period =
      (periodId ? periods.find(p => p.id === periodId) : undefined) || periods.find(p => p.isCurrent) || periods[0];
    return period ? `${period.year}/${String(period.month).padStart(2, '0')}` : '';
  };

  const pointsForPeriod = (studentId: string, periodId?: string): number => {
    const prefix = periodPrefix(periodId);
    return transactions
      .filter(t => t.studentId === studentId && (!prefix || t.shamsiDate.startsWith(prefix)))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getStudentMonthlyPoints = (studentId: string): number => pointsForPeriod(studentId);

  const getStudentDaysAttendedMonth = (studentId: string): number => {
    const prefix = periodPrefix();

    const daysSet = new Set<string>();
    attendances
      .filter(a => a.studentId === studentId && (!prefix || a.shamsiDate.startsWith(prefix)))
      .forEach(a => daysSet.add(a.shamsiDate));

    return daysSet.size;
  };

  /** Sorts descending and assigns competition ranks (ties share a rank). */
  const assignRanks = <T extends { points: number; rank: number }>(list: T[]): T[] => {
    list.sort((a, b) => b.points - a.points);
    let currentRank = 1;
    for (let i = 0; i < list.length; i++) {
      if (i > 0 && list[i].points < list[i - 1].points) {
        currentRank = i + 1;
      }
      list[i].rank = currentRank;
    }
    return list;
  };

  const getVillageLeaderboard = (periodId?: string) => {
    const activeStudents = users.filter(u => u.role === 'student' && u.status === 'active');
    return assignRanks<{ student: User; points: number; mosqueName: string; rank: number }>(
      activeStudents.map((student: User) => {
        const mosque = mosques.find(m => m.id === student.mosqueId);
        return {
          student,
          points: pointsForPeriod(student.id, periodId),
          mosqueName: mosque ? mosque.name : 'نامشخص',
          rank: 1,
        };
      })
    );
  };

  const getMosqueLeaderboard = (mosqueId: string, periodId?: string) => {
    const mosqueStudents = users.filter(u => u.role === 'student' && u.mosqueId === mosqueId && u.status === 'active');
    return assignRanks<{ student: User; points: number; rank: number }>(
      mosqueStudents.map((student: User) => ({
        student,
        points: pointsForPeriod(student.id, periodId),
        rank: 1,
      }))
    );
  };

  const getStudentRankInVillage = (studentId: string) => {
    const lb = getVillageLeaderboard();
    const entry = lb.find(e => e.student.id === studentId);
    return {
      rank: entry ? entry.rank : lb.length + 1,
      total: lb.length,
    };
  };

  const getStudentRankInMosque = (studentId: string, mosqueId?: string) => {
    const student = users.find(u => u.id === studentId);
    const targetMosqueId = mosqueId || student?.mosqueId;
    if (!targetMosqueId) return { rank: 1, total: 1 };

    const lb = getMosqueLeaderboard(targetMosqueId);
    const entry = lb.find(e => e.student.id === studentId);
    return {
      rank: entry ? entry.rank : lb.length + 1,
      total: lb.length,
    };
  };

  // Record Attendance Batch
  const recordAttendanceBatch = ({
    studentIds,
    activityId,
    attendanceMosqueId,
    customShamsiDate,
  }: {
    studentIds: string[];
    activityId: string;
    attendanceMosqueId: string;
    customShamsiDate?: string;
  }) => {
    if (!actorIsStaff) {
      return { success: false, message: denied.message, recordedCount: 0, skippedCount: 0 };
    }

    const activity = activities.find(a => a.id === activityId);
    const attendanceMosque = mosques.find(m => m.id === attendanceMosqueId);

    if (!activity || !attendanceMosque) {
      return { success: false, message: 'فعالیت یا مسجد نامعتبر است', recordedCount: 0, skippedCount: 0 };
    }
    if (!activity.active || !attendanceMosque.active) {
      return { success: false, message: 'فعالیت یا مسجد انتخاب‌شده غیرفعال است.', recordedCount: 0, skippedCount: 0 };
    }

    const shamsiDate = customShamsiDate || getShamsiDateString();
    const monthPrefix = shamsiDate.slice(0, 7);
    const existingAll = attendancesRef.current; // always-fresh, so rapid double taps cannot double-record
    const newRecords: AttendanceRecord[] = [];
    const newTransactions: PointTransaction[] = [];
    let skipped = 0;

    const syncStatus: SyncStatus = isOnline && !isBackendConfigured ? 'synced' : 'pending';

    for (const studentId of Array.from(new Set(studentIds))) {
      const student = users.find(u => u.id === studentId);
      if (!student || student.role !== 'student' || student.status !== 'active') continue;

      // Daily limit for this activity
      const existingToday = existingAll.filter(
        a => a.studentId === studentId && a.activityId === activityId && a.shamsiDate === shamsiDate
      );
      if (activity.dailyMaxTimes > 0 && existingToday.length >= activity.dailyMaxTimes) {
        skipped++;
        continue;
      }

      // Monthly points cap for this activity (if configured)
      const points = activity.defaultPoints; // Historical point value captured at this moment
      if (activity.monthlyMaxPoints && activity.monthlyMaxPoints > 0) {
        const monthSum = existingAll
          .filter(a => a.studentId === studentId && a.activityId === activityId && a.shamsiDate.startsWith(monthPrefix))
          .reduce((sum, a) => sum + a.points, 0);
        if (monthSum + points > activity.monthlyMaxPoints) {
          skipped++;
          continue;
        }
      }

      const clientUuid = uid('att-uuid');
      const recId = uid('att');
      const isGuest = student.mosqueId !== attendanceMosqueId;
      const nowIso = new Date().toISOString();

      const record: AttendanceRecord = {
        id: recId,
        clientUuid,
        studentId,
        studentName: student.fullName,
        studentMosqueId: student.mosqueId || attendanceMosqueId,
        attendanceMosqueId,
        attendanceMosqueName: attendanceMosque.name,
        activityId,
        activityName: activity.name,
        points,
        shamsiDate,
        realActivityTime: `${shamsiDate} ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
        recordedAt: nowIso,
        recordedByManagerId: currentUser.id,
        recordedByManagerName: currentUser.fullName,
        syncStatus,
        isGuestAttendance: isGuest,
      };

      const tx: PointTransaction = {
        id: uid('tx'),
        studentId,
        studentName: student.fullName,
        amount: points,
        type: 'activity',
        referenceId: recId,
        reason: `${activity.name} در ${attendanceMosque.name} ${isGuest ? '(مهمان)' : ''}`,
        shamsiDate,
        performedBy: currentUser.fullName,
        createdAt: nowIso,
      };

      newRecords.push(record);
      newTransactions.push(tx);

      // Async DB write (failures fall back inside the helper)
      void dbSaveAttendance(record).catch(() => {});

      // Referral reward: inviter is rewarded on the invited student's very first attendance
      if (student.referredBy) {
        const hasPrior = existingAll.some(a => a.studentId === studentId);
        if (!hasPrior) {
          const inviter = users.find(u => u.referralCode === student.referredBy);
          if (inviter) {
            const referralBonus = settings.defaultReferralPoints;
            newTransactions.push({
              id: uid('tx-ref'),
              studentId: inviter.id,
              studentName: inviter.fullName,
              amount: referralBonus,
              type: 'referral',
              reason: `پاداش دعوت دوست (${student.fullName}) پس از اولین حضور در مسجد`,
              shamsiDate,
              performedBy: 'سیستم دارالقرآن کنخ',
              createdAt: nowIso,
            });

            setNotifications(prev => [
              {
                id: uid('notif-ref'),
                recipientUserId: inviter.id,
                title: 'پاداش دعوت دوست واریز شد',
                message: `${toPersianDigits(referralBonus)} امتیاز بابت اولین حضور ${student.fullName} به حساب شما افزوده شد!`,
                type: 'award',
                read: false,
                createdAt: nowIso,
                linkTab: 'referrals',
              },
              ...prev,
            ]);
          }
        }
      }

      // Check badge milestones
      checkAndAwardBadges(studentId, points);
    }

    if (newRecords.length > 0) {
      attendancesRef.current = [...newRecords, ...attendancesRef.current];
      setAttendances(attendancesRef.current);
      setTransactions(prev => [...newTransactions, ...prev]);

      // Confetti on success
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
      });

      recordAudit(
        'ثبت حضور گروهی',
        'AttendanceRecord',
        attendanceMosqueId,
        `ثبت حضور ${toPersianDigits(newRecords.length)} نفر در ${activity.name} مسجد ${attendanceMosque.name} (${syncStatus === 'synced' ? 'ذخیره شد' : 'در صف همگام‌سازی'})`
      );
    }

    return {
      success: newRecords.length > 0,
      message:
        newRecords.length > 0
          ? `ثبت حضور ${toPersianDigits(newRecords.length)} دانش‌آموز با موفقیت انجام شد.` +
            (skipped > 0 ? ` (${toPersianDigits(skipped)} نفر قبلاً ثبت شده بودند یا به سقف مجاز رسیده بودند)` : '')
          : skipped > 0
            ? `هیچ رکوردی ثبت نشد؛ ${toPersianDigits(skipped)} نفر قبلاً ثبت شده بودند یا به سقف مجاز رسیده بودند.`
            : 'هیچ دانش‌آموز فعالی برای ثبت انتخاب نشده است.',
      recordedCount: newRecords.length,
      skippedCount: skipped,
    };
  };

  const checkAndAwardBadges = (studentId: string, addedPoints: number) => {
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    const monthlyPoints = getStudentMonthlyPoints(studentId) + addedPoints;
    const studentBadgeIds = new Set(studentBadges.filter(sb => sb.studentId === studentId).map(sb => sb.badgeId));

    // Star badge: monthly points > 200
    if (monthlyPoints >= 200 && !studentBadgeIds.has('badge-star')) {
      const newSb: StudentBadge = {
        id: uid('sb'),
        studentId,
        badgeId: 'badge-star',
        earnedAtShamsi: getShamsiDateString(),
      };
      setStudentBadges(prev => [...prev, newSb]);

      const notif: AppNotification = {
        id: uid('notif-badge'),
        recipientUserId: studentId,
        title: 'تبریک! نشان جدید دریافت کردید',
        message: 'شما نشان درخشان «ستاره مسجد» را کسب کردید.',
        type: 'award',
        read: false,
        createdAt: new Date().toISOString(),
        linkTab: 'badges',
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  // Adjust Points manually with required reason
  const adjustStudentPoints = (studentId: string, amount: number, reason: string) => {
    if (!actorIsAdmin) return;
    if (!Number.isFinite(amount) || amount === 0 || !reason.trim()) return;
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    const tx: PointTransaction = {
      id: uid('tx-adj'),
      studentId,
      studentName: student.fullName,
      amount,
      type: 'adjustment',
      reason: `تعدیل توسط ${currentUser.fullName}: ${reason}`,
      shamsiDate: getShamsiDateString(),
      performedBy: currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [tx, ...prev]);

    recordAudit(
      'تعدیل امتیاز دستی',
      'Student',
      studentId,
      `تغییر امتیاز دانش‌آموز ${student.fullName} به میزان ${toPersianDigits(amount)} امتیاز. دلیل: ${reason}`
    );

    const notif: AppNotification = {
      id: uid('notif-adj'),
      recipientUserId: studentId,
      title: amount >= 0 ? 'افزایش امتیاز تشویقی' : 'کسر امتیاز',
      message: `${toPersianDigits(Math.abs(amount))} امتیاز ${amount >= 0 ? 'به حساب شما افزوده شد' : 'از حساب شما کسر شد'}. دلیل: ${reason}`,
      type: amount >= 0 ? 'success' : 'warning',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Student registration (also used by admins/managers to create accounts)
  const generateReferralCode = (): string => {
    for (let i = 0; i < 50; i++) {
      const code = `KAN-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!users.some(u => u.referralCode === code)) return code;
    }
    return `KAN-${Date.now().toString().slice(-6)}`;
  };

  const registerStudent = async (
    studentData: Omit<User, 'id' | 'referralCode' | 'createdAt' | 'status'>,
    referralCodeInput?: string
  ) => {
    const fail = (message: string) => ({ success: false, message });

    const nationalCode = normalizeDigits(studentData.nationalCode ?? '');
    const username = normalizeDigits(studentData.username || nationalCode);
    const plainPassword = normalizeDigits(studentData.password ?? '');

    if (!/^\d{10}$/.test(nationalCode)) return fail('کد ملی باید دقیقاً ۱۰ رقم باشد.');
    if (!isValidPassword(plainPassword)) return fail('رمز ورود باید دقیقاً ۸ رقم (عدد) باشد.');
    if (!studentData.fullName.trim()) return fail('نام و نام خانوادگی الزامی است.');
    if (
      users.some(
        u =>
          u.nationalCode === nationalCode ||
          u.username === username ||
          u.username === nationalCode ||
          u.nationalCode === username
      )
    ) {
      return fail('کاربری با این کد ملی یا نام کاربری قبلاً ثبت شده است.');
    }

    // Who may create which role: admin → any, manager → student/parent, everyone else → student only
    const requestedRole = studentData.role;
    const role: UserRole = actorIsAdmin
      ? requestedRole
      : actorIsStaff && requestedRole === 'parent'
        ? 'parent'
        : 'student';
    const isDirectRegistration = !actorIsStaff;

    // Verify referral code if provided
    let verifiedReferrer: string | undefined = undefined;
    if (referralCodeInput && referralCodeInput.trim()) {
      const trimmed = referralCodeInput.trim().toUpperCase();
      const inviter = users.find(u => u.referralCode === trimmed);
      if (inviter) {
        verifiedReferrer = trimmed;
      }
    }

    let hashed: { passwordHash: string; passwordSalt: string };
    try {
      hashed = await hashPassword(plainPassword);
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'ثبت رمز عبور ممکن نشد.');
    }

    const { password: _plain, ...safeData } = studentData;
    const newStudent: User = {
      ...safeData,
      nationalCode,
      username,
      role,
      ...hashed,
      id: uid('user-std'),
      referralCode: generateReferralCode(),
      referredBy: verifiedReferrer,
      status: isDirectRegistration ? 'pending' : 'active', // Direct registration requires manager/admin approval
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newStudent]);

    recordAudit(
      'ثبت‌نام دانش‌آموز',
      'User',
      newStudent.id,
      `ثبت‌نام دانش‌آموز ${newStudent.fullName} در مسجد ${mosques.find(m => m.id === newStudent.mosqueId)?.name || 'پیش‌فرض'} (وضعیت: ${newStudent.status === 'pending' ? 'در انتظار تأیید' : 'فعال'})`
    );

    // Notify mosque managers / admin if pending
    if (newStudent.status === 'pending') {
      const mgrNotif: AppNotification = {
        id: uid('notif-reg'),
        recipientUserId: 'managers',
        title: 'درخواست ثبت‌نام جدید',
        message: `دانش‌آموز ${newStudent.fullName} ثبت‌نام کرده و در انتظار تأیید شماست.`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        linkTab: 'students',
      };
      setNotifications(prev => [mgrNotif, ...prev]);
    }

    return {
      success: true,
      message: isDirectRegistration
        ? 'ثبت‌نام شما با موفقیت انجام شد و پس از تأیید مسئول مسجد فعال خواهد شد.'
        : 'دانش‌آموز جدید با موفقیت ثبت شد.',
    };
  };

  const approveStudentRegistration = (studentId: string) => {
    if (!actorIsStaff) return;
    setUsers(prev =>
      prev.map(u => (u.id === studentId ? { ...u, status: 'active' } : u))
    );

    const student = users.find(u => u.id === studentId);
    if (student) {
      recordAudit('تأیید عضویت', 'User', studentId, `تأیید ثبت‌نام دانش‌آموز ${student.fullName}`);

      const notif: AppNotification = {
        id: uid('notif-appr'),
        recipientUserId: studentId,
        title: 'ثبت‌نام شما تأیید شد!',
        message: 'عضویت شما در سامانه دارالقرآن کنخ تأیید شد. اکنون می‌توانید امتیازات خود را مشاهده کنید.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const updateUser = (updatedUser: User) => {
    if (!actorIsStaff) return;
    const existing = users.find(u => u.id === updatedUser.id);
    if (!existing) return;

    // Credentials and (for non-admins) role can never be changed through this path.
    const merged: User = {
      ...stripPlain(updatedUser),
      passwordHash: existing.passwordHash,
      passwordSalt: existing.passwordSalt,
      role: actorIsAdmin ? updatedUser.role : existing.role,
    };
    setUsers(prev => prev.map(u => (u.id === merged.id ? merged : u)));
    recordAudit('ویرایش کاربر', 'User', merged.id, `ویرایش اطلاعات کاربر ${merged.fullName}`);
  };

  const deleteUser = (userId: string) => {
    if (!actorIsAdmin) return denied;
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, message: 'کاربر یافت نشد' };
    if (target.id === currentUser.id) return { success: false, message: 'حذف حساب کاربری خودتان ممکن نیست.' };
    if (target.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
      return { success: false, message: 'آخرین مدیر کل سیستم قابل حذف نیست.' };
    }

    // Remove the user and everything that belongs to them, so no orphan records remain.
    setUsers(prev =>
      prev
        .filter(u => u.id !== userId)
        .map(u => (u.childrenIds?.includes(userId) ? { ...u, childrenIds: u.childrenIds.filter(id => id !== userId) } : u))
    );
    const removedAttendance = attendancesRef.current.filter(a => a.studentId === userId);
    attendancesRef.current = attendancesRef.current.filter(a => a.studentId !== userId);
    setAttendances(attendancesRef.current);
    setTransactions(prev => prev.filter(t => t.studentId !== userId));
    setStudentBadges(prev => prev.filter(sb => sb.studentId !== userId));
    setNotifications(prev => prev.filter(n => n.recipientUserId !== userId));
    setWinners(prev => prev.filter(w => w.studentId !== userId));

    recordAudit(
      'حذف کاربر',
      'User',
      userId,
      `حذف حساب کاربری ${target.fullName} (${target.role}) به همراه ${toPersianDigits(removedAttendance.length)} رکورد حضور`
    );
    return { success: true, message: 'کاربر و تمام سوابق او با موفقیت حذف شد' };
  };

  const transferStudentMosque = (studentId: string, newMosqueId: string, reason: string) => {
    if (!actorIsStaff) return;
    const student = users.find(u => u.id === studentId);
    const newMosque = mosques.find(m => m.id === newMosqueId);
    if (!student || !newMosque) return;

    const oldMosqueName = mosques.find(m => m.id === student.mosqueId)?.name || 'نامشخص';

    setUsers(prev =>
      prev.map(u => (u.id === studentId ? { ...u, mosqueId: newMosqueId } : u))
    );

    recordAudit(
      'انتقال دانش‌آموز',
      'Student',
      studentId,
      `انتقال ${student.fullName} از ${oldMosqueName} به ${newMosque.name}. دلیل: ${reason}`
    );

    const notif: AppNotification = {
      id: uid('notif-trans'),
      recipientUserId: studentId,
      title: 'انتقال به مسجد جدید',
      message: `مسجد اصلی شما با موفقیت به ${newMosque.name} تغییر یافت. تمام امتیازات قبلی شما محفوظ است.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Mosques Management
  const addMosque = (mosqueData: Omit<Mosque, 'id' | 'createdAt' | 'qrCodeKey'>) => {
    if (!actorIsAdmin) return;
    const id = uid('mosque');
    const qrCodeKey = `KANKH-MSQ-${uid('k').slice(2, 14).toUpperCase()}`;
    const newMosque: Mosque = {
      ...mosqueData,
      id,
      qrCodeKey,
      createdAt: new Date().toISOString(),
    };
    setMosques(prev => [...prev, newMosque]);
    recordAudit('افزودن مسجد جدید', 'Mosque', id, `ایجاد مسجد ${newMosque.name} با مدیریت ${newMosque.managerName}`);
  };

  const updateMosque = (updated: Mosque) => {
    if (!actorIsAdmin) return;
    setMosques(prev => prev.map(m => (m.id === updated.id ? updated : m)));
    recordAudit('ویرایش اطلاعات مسجد', 'Mosque', updated.id, `ویرایش مسجد ${updated.name}`);
  };

  const toggleMosqueActive = (id: string) => {
    if (!actorIsAdmin) return;
    setMosques(prev =>
      prev.map(m => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const deleteMosque = (id: string) => {
    if (!actorIsAdmin) return denied;
    const mosque = mosques.find(m => m.id === id);
    if (!mosque) return { success: false, message: 'مسجد یافت نشد' };

    // Check if students belong to this mosque
    const memberStudents = users.filter(u => u.mosqueId === id);
    if (memberStudents.length > 0) {
      return {
        success: false,
        message: `امکان حذف این مسجد وجود ندارد زیرا ${toPersianDigits(memberStudents.length)} دانش‌آموز عضو آن هستند. ابتدا آنان را انتقال دهید.`,
      };
    }

    setMosques(prev => prev.filter(m => m.id !== id));
    recordAudit('حذف مسجد', 'Mosque', id, `حذف مسجد ${mosque.name}`);
    return { success: true, message: `مسجد ${mosque.name} با موفقیت حذف شد` };
  };

  // Activities Management
  const addActivity = (actData: Omit<Activity, 'id'>) => {
    if (!actorIsAdmin) return;
    const id = uid('act');
    const newAct: Activity = { ...actData, id };
    setActivities(prev => [...prev, newAct]);
    recordAudit('افزودن فعالیت جدید', 'Activity', id, `ایجاد فعالیت ${newAct.name} با امتیاز پایه ${toPersianDigits(newAct.defaultPoints)}`);
  };

  const updateActivity = (updated: Activity) => {
    if (!actorIsAdmin) return;
    setActivities(prev => prev.map(a => (a.id === updated.id ? updated : a)));
    recordAudit('ویرایش فعالیت', 'Activity', updated.id, `به‌روزرسانی فعالیت ${updated.name} (امتیاز: ${toPersianDigits(updated.defaultPoints)})`);
  };

  const toggleActivity = (id: string) => {
    if (!actorIsAdmin) return;
    setActivities(prev =>
      prev.map(a => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const deleteActivity = (id: string) => {
    if (!actorIsAdmin) return denied;
    const act = activities.find(a => a.id === id);
    setActivities(prev => prev.filter(a => a.id !== id));
    recordAudit('حذف فعالیت', 'Activity', id, `حذف فعالیت ${act?.name}`);
    return { success: true, message: 'فعالیت با موفقیت حذف شد' };
  };

  // Rewards
  const addReward = (rData: Omit<Reward, 'id'>) => {
    if (!actorIsAdmin) return;
    const id = uid('reward');
    setRewards(prev => [...prev, { ...rData, id }]);
    recordAudit('تعریف جوایز ماهانه', 'Reward', id, `تعریف جوایز دوره ${rData.periodTitle}`);
  };

  const updateReward = (updated: Reward) => {
    if (!actorIsAdmin) return;
    setRewards(prev => prev.map(r => (r.id === updated.id ? updated : r)));
  };

  const toggleRewardWinnerDelivered = (winnerId: string) => {
    if (!actorIsStaff) return;
    setWinners(prev =>
      prev.map(w =>
        w.id === winnerId
          ? {
              ...w,
              delivered: !w.delivered,
              deliveredAt: !w.delivered ? getShamsiDateString() : undefined,
            }
          : w
      )
    );
  };

  // Quotes
  const addQuote = (text: string, source?: string) => {
    if (!actorIsAdmin) return;
    const newQ: MotivationalQuote = { id: uid('q'), text, source, active: true };
    setQuotes(prev => [...prev, newQ]);
  };

  const updateQuote = (updated: MotivationalQuote) => {
    if (!actorIsAdmin) return;
    setQuotes(prev => prev.map(q => (q.id === updated.id ? updated : q)));
  };

  const deleteQuote = (id: string) => {
    if (!actorIsAdmin) return;
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    if (!actorIsAdmin) return;
    setSettings(prev => ({ ...prev, ...newSettings }));
    recordAudit('تغییر تنظیمات سیستم', 'AppSettings', 'global', JSON.stringify(newSettings));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Export to Excel / CSV with UTF-8 BOM
  const exportAttendanceToExcel = (filteredList?: AttendanceRecord[]) => {
    const records = filteredList || attendances;
    const headers = [
      'شناسه رکورد',
      'نام و نام خانوادگی دانش‌آموز',
      'مسجد اصلی دانش‌آموز',
      'مسجد محل حضور',
      'نوع فعالیت',
      'امتیاز مکتسبه',
      'تاریخ شمسی',
      'ساعت حضور',
      'مسئول ثبت‌کننده',
      'وضعیت همگام‌سازی',
      'حضور به عنوان مهمان',
    ];

    const rows = records.map(r => {
      const studentMosque = mosques.find(m => m.id === r.studentMosqueId)?.name || 'نامشخص';
      return [
        `"${r.id}"`,
        `"${r.studentName}"`,
        `"${studentMosque}"`,
        `"${r.attendanceMosqueName}"`,
        `"${r.activityName}"`,
        r.points,
        `"${r.shamsiDate}"`,
        `"${r.realActivityTime.split(' ')[1] || ''}"`,
        `"${r.recordedByManagerName}"`,
        `"${r.syncStatus === 'synced' ? 'همگام‌شده' : 'در صف آفلاین'}"`,
        `"${r.isGuestAttendance ? 'بله' : 'خیر'}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gozaresh_Hozour_MasjedMan_${getShamsiDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auth functions
  const login = async (nationalCodeOrUser: string, passwordInput: string) => {
    const guard = loadJSON<{ count: number; lockedUntil: number }>(LOGIN_GUARD_KEY, { count: 0, lockedUntil: 0 });
    if (guard.lockedUntil > Date.now()) {
      const minutes = Math.ceil((guard.lockedUntil - Date.now()) / 60000);
      return {
        success: false,
        message: `به‌دلیل تلاش‌های ناموفق متعدد، ورود موقتاً مسدود است. ${toPersianDigits(minutes)} دقیقه دیگر دوباره تلاش کنید.`,
      };
    }

    // Accept Persian/Arabic digits typed on phone keyboards
    const cleanId = normalizeDigits(nationalCodeOrUser);
    const cleanPass = normalizeDigits(passwordInput);

    const found = users.find(u => u.nationalCode === cleanId || u.username === cleanId);

    let passwordOk = false;
    if (found) {
      try {
        if (found.passwordHash && found.passwordSalt) {
          passwordOk = await verifyPassword(cleanPass, found.passwordHash, found.passwordSalt);
        } else if (found.password) {
          passwordOk = found.password === cleanPass; // legacy row, migrated to a hash right after load
        }
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : 'بررسی رمز عبور ممکن نشد.' };
      }
    }

    if (!found || !passwordOk) {
      const count = guard.count + 1;
      saveJSON(LOGIN_GUARD_KEY, {
        count: count >= MAX_FAILED_LOGINS ? 0 : count,
        lockedUntil: count >= MAX_FAILED_LOGINS ? Date.now() + LOCKOUT_MS : 0,
      });
      return { success: false, message: 'کد ملی یا رمز عبور ۸ رقمی واردشده معتبر نمی‌باشد.' };
    }

    if (found.status === 'pending') {
      return { success: false, message: 'ثبت‌نام شما هنوز توسط مسئول مسجد تأیید نشده است. لطفاً بعد از تأیید دوباره وارد شوید.' };
    }
    if (found.status !== 'active') {
      return { success: false, message: 'حساب کاربری شما غیرفعال است. با مدیر دارالقرآن تماس بگیرید.' };
    }

    saveJSON(LOGIN_GUARD_KEY, { count: 0, lockedUntil: 0 });
    saveString(SESSION_KEY, found.id);
    setSessionUserId(found.id);
    setActiveTab('home');
    return { success: true, user: found };
  };

  const needsSetup = users.length === 0;

  const createFirstAdmin = async (data: { fullName: string; nationalCode: string; password: string; email?: string }) => {
    const fail = (message: string) => ({ success: false, message });
    if (users.length > 0) return fail('سامانه قبلاً راه‌اندازی شده است.');

    const nationalCode = normalizeDigits(data.nationalCode);
    const password = normalizeDigits(data.password);
    if (!data.fullName.trim()) return fail('نام و نام خانوادگی را وارد کنید.');
    if (!isValidNationalCode(nationalCode)) return fail('کد ملی معتبر نیست. ۱۰ رقم صحیح وارد کنید.');
    if (!isValidPassword(password)) return fail('رمز ورود باید دقیقاً ۸ رقم (عدد) باشد.');

    try {
      const hashed = await hashPassword(password);
      const admin: User = {
        id: uid('user-admin'),
        username: nationalCode,
        nationalCode,
        fullName: data.fullName.trim(),
        email: data.email?.trim() || undefined,
        role: 'admin',
        referralCode: 'KAN-ADMIN',
        avatarUrl: 'avatar-dome',
        status: 'active',
        createdAt: new Date().toISOString(),
        ...hashed,
      };
      setUsers([admin]);
      saveString(SESSION_KEY, admin.id);
      setSessionUserId(admin.id);
      setActiveTab('home');
      return { success: true, message: 'مدیر سامانه ساخته شد.' };
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'ساخت حساب ممکن نشد.');
    }
  };

  const logout = () => {
    removeKey(SESSION_KEY);
    setSessionUserId(null);
    setActiveTab('home');
  };

  const requestPasswordReset = (identifier: string) => {
    const clean = normalizeDigits(identifier).toLowerCase();
    const user = clean
      ? users.find(
          u => (u.email && u.email.toLowerCase() === clean) || u.nationalCode === clean || u.username === clean
        )
      : undefined;

    if (user) {
      const title = 'درخواست بازیابی رمز عبور';
      const already = notifications.some(
        n => n.recipientUserId === 'admins' && !n.read && n.title === title && n.message.includes(user.nationalCode || user.username)
      );
      if (!already) {
        setNotifications(prev => [
          {
            id: uid('notif-pwreset'),
            recipientUserId: 'admins',
            title,
            message: `${user.fullName} (کد ملی/نام کاربری: ${user.nationalCode || user.username}) درخواست رمز جدید کرده است.`,
            type: 'warning',
            read: false,
            createdAt: new Date().toISOString(),
            linkTab: 'students',
          },
          ...prev,
        ]);
      }
    }

    // Same answer whether or not the account exists (prevents account enumeration).
    return {
      success: true,
      message: 'درخواست شما برای مدیر دارالقرآن ثبت شد. پس از بررسی، رمز موقت جدید را به‌صورت حضوری یا تلفنی به شما اعلام می‌کند.',
    };
  };

  const adminResetPassword = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, message: 'کاربر یافت نشد.' };

    const managerMayReset =
      currentUser.role === 'manager' &&
      actorIsStaff &&
      target.role === 'student' &&
      target.mosqueId === currentUser.mosqueId;
    if (!actorIsAdmin && !managerMayReset) return denied;

    try {
      const newPassword = generateTempPassword();
      const hashed = await hashPassword(newPassword);
      setUsers(prev => prev.map(u => (u.id === userId ? { ...stripPlain(u), ...hashed } : u)));
      recordAudit('بازنشانی رمز عبور', 'User', userId, `رمز عبور ${target.fullName} توسط ${currentUser.fullName} بازنشانی شد`);
      return {
        success: true,
        message: `رمز موقت جدید برای ${target.fullName} ساخته شد. آن را فقط به خود فرد اعلام کنید و از او بخواهید در پروفایل تغییر دهد.`,
        newPassword,
      };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'بازنشانی رمز ممکن نشد.' };
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!isAuthenticated) return denied;

    // Self-service profile edits are limited to these fields (never role, status, mosque, ids...).
    const allowedFields: (keyof User)[] = [
      'fullName', 'fatherName', 'nationalCode', 'email', 'phone', 'parentPhone',
      'birthDate', 'grade', 'school', 'avatarUrl', 'bio',
    ];
    const safe: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) safe[key] = updates[key];
    }

    if (typeof safe.nationalCode === 'string') {
      const nc = normalizeDigits(safe.nationalCode);
      if (!nc) {
        delete safe.nationalCode;
      } else {
        if (!/^\d{10}$/.test(nc)) return { success: false, message: 'کد ملی باید دقیقاً ۱۰ رقم باشد.' };
        if (users.some(u => u.id !== currentUser.id && (u.nationalCode === nc || u.username === nc))) {
          return { success: false, message: 'این کد ملی برای کاربر دیگری ثبت شده است.' };
        }
        safe.nationalCode = nc;
      }
    }

    let hashed: { passwordHash: string; passwordSalt: string } | undefined;
    if (updates.password) {
      const plain = normalizeDigits(updates.password);
      if (!isValidPassword(plain)) return { success: false, message: 'رمز عبور باید دقیقاً ۸ رقم (عدد) باشد.' };
      try {
        hashed = await hashPassword(plain);
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : 'ثبت رمز عبور ممکن نشد.' };
      }
    }

    const me = currentUser.id;
    setUsers(prev =>
      prev.map(u => (u.id === me ? stripPlain({ ...u, ...(safe as Partial<User>), ...(hashed ?? {}) }) : u))
    );
    recordAudit('ویرایش و تکمیل پروفایل', 'User', me, `به‌روزرسانی مشخصات فردی ${currentUser.fullName}`);
    return { success: true, message: 'مشخصات پروفایل با موفقیت به‌روزرسانی شد.' };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        mosques,
        activities,
        attendances,
        transactions,
        periods,
        rewards,
        winners,
        badges,
        studentBadges,
        notifications,
        quotes,
        settings,
        auditLogs,

        // Auth
        isAuthenticated,
        needsSetup,
        createFirstAdmin,
        login,
        logout,
        requestPasswordReset,
        adminResetPassword,
        updateUserProfile,

        isOnline,
        isSimulatedOffline,
        toggleSimulatedOffline,
        syncStatus,
        pendingOfflineCount,
        syncOfflineQueue,
        isSyncing,
        isBackendConfigured,
        storageWarning,
        dismissStorageWarning,

        theme,
        setTheme,
        darkMode,
        setDarkMode,
        fontSize,
        setFontSize,
        activeTab,
        setActiveTab,

        recordAttendanceBatch,
        adjustStudentPoints,
        registerStudent,
        approveStudentRegistration,
        updateUser,
        deleteUser,
        transferStudentMosque,

        addMosque,
        updateMosque,
        toggleMosqueActive,
        deleteMosque,

        addActivity,
        updateActivity,
        toggleActivity,
        deleteActivity,

        addReward,
        updateReward,
        toggleRewardWinnerDelivered,

        addQuote,
        updateQuote,
        deleteQuote,

        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,

        getStudentMonthlyPoints,
        getStudentTotalPoints,
        getStudentDaysAttendedMonth,
        getStudentRankInMosque,
        getStudentRankInVillage,
        getMosqueLeaderboard,
        getVillageLeaderboard,

        exportAttendanceToExcel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

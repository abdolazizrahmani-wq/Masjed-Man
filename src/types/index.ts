/**
 * Data types and interfaces for Masjed-e Man (دارالقرآن کنخ)
 */

export type UserRole = 'admin' | 'manager' | 'student' | 'parent';

export type SyncStatus = 'synced' | 'pending' | 'error';

export type ActivityCategory = 'prayer' | 'quran' | 'special' | 'cultural';

export type AppTheme = 'emerald' | 'golden' | 'sky' | 'night' | 'classic';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface User {
  id: string;
  username: string; // nationalCode or custom username
  nationalCode?: string; // کد ملی ۱۰ رقمی (نام کاربری اصلی ورود)
  password?: string; // فقط ورودی موقت یا داده‌ی قدیمی؛ ذخیره‌ی دائمی نمی‌شود (به‌جای آن هش ذخیره می‌شود)
  passwordHash?: string; // هش PBKDF2 رمز ۸ رقمی
  passwordSalt?: string;
  email?: string; // ایمیل جهت بازیابی رمز عبور
  fullName: string;
  fatherName?: string;
  role: UserRole;
  mosqueId?: string; // primary mosque id
  phone?: string;
  parentPhone?: string;
  birthDate?: string; // Shamsi or YYYY-MM-DD
  grade?: string; // e.g. "پایه ششم", "پایه هفتم"
  school?: string; // e.g. "مدرسه راهنمایی کنخ"
  avatarUrl?: string; // preset or avatar key
  bio?: string;
  referralCode: string;
  referredBy?: string; // referral code of the inviter
  status: 'active' | 'pending' | 'inactive';
  childrenIds?: string[]; // for parents: IDs of their children
  createdAt: string;
}

export interface Mosque {
  id: string;
  name: string;
  village: string; // e.g. "کنخ"
  managerId: string;
  managerName: string;
  active: boolean;
  address?: string;
  qrCodeKey: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  name: string;
  defaultPoints: number;
  category: ActivityCategory;
  active: boolean;
  dailyMaxTimes: number; // e.g., 1 for Fajr prayer
  monthlyMaxPoints?: number;
  description?: string;
}

export interface AttendanceRecord {
  id: string;
  clientUuid: string; // unique UUID to prevent double calculation
  studentId: string;
  studentName: string;
  studentMosqueId: string; // primary mosque of the student
  attendanceMosqueId: string; // actual venue of attendance
  attendanceMosqueName: string;
  activityId: string;
  activityName: string;
  points: number; // immutable historical points
  shamsiDate: string; // e.g. "1405/08/15"
  realActivityTime: string; // e.g. "1405/08/15 05:45"
  recordedAt: string; // timestamp when record was saved
  recordedByManagerId: string;
  recordedByManagerName: string;
  syncStatus: SyncStatus;
  syncError?: string;
  isGuestAttendance: boolean; // true if attended outside student's primary mosque
}

export interface PointTransaction {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  type: 'activity' | 'referral' | 'badge' | 'adjustment';
  referenceId?: string; // e.g. attendance record id
  reason: string;
  shamsiDate: string;
  performedBy: string;
  createdAt: string;
}

export interface MonthlyPeriod {
  id: string;
  title: string;
  year: number;
  month: number;
  monthName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface PrizeTier {
  rank: number;
  prizeName: string;
}

export interface Reward {
  id: string;
  periodId: string;
  periodTitle: string;
  title: string;
  description: string;
  place1Prize: string;
  place2Prize: string;
  place3Prize: string;
  place4Prize?: string;
  place5Prize?: string;
  prizes?: PrizeTier[]; // جوایز پویا از ۳ تا ۲۰ رتبه برتر
  ceremonyPlace: string;
  status: 'active' | 'completed';
}

export interface RewardWinner {
  id: string;
  periodId: string;
  studentId: string;
  studentName: string;
  mosqueName: string;
  rank: number;
  points: number;
  prizeName: string;
  delivered: boolean;
  deliveredAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteriaText: string;
  category: 'prayer' | 'quran' | 'referral' | 'consistency';
}

export interface StudentBadge {
  id: string;
  studentId: string;
  badgeId: string;
  earnedAtShamsi: string;
}

export interface AppNotification {
  id: string;
  recipientUserId: string | 'all' | 'managers';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'award';
  read: boolean;
  createdAt: string;
  linkTab?: string;
}

export interface MotivationalQuote {
  id: string;
  text: string;
  source?: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  performedByRole: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
  shamsiDate: string;
}

export interface AppSettings {
  qrEnabled: boolean;
  defaultReferralPoints: number;
  currentPeriodId: string;
  quotesEnabled: boolean;
  allowGuestAttendance: boolean;
}

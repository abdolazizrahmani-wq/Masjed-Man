import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  UserCheck,
  Moon,
  Sun,
  Palette,
  RefreshCw,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toPersianDigits, formatRelativePersianTime } from '../utils/jalali';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    syncStatus,
    pendingOfflineCount,
    syncOfflineQueue,
    isSyncing,
    isSimulatedOffline,
    toggleSimulatedOffline,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    darkMode,
    setDarkMode,
    setActiveTab,
    logout,
  } = useApp();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Filter notifications for current user or all
  const userNotifs = notifications.filter(
    n =>
      n.recipientUserId === 'all' ||
      n.recipientUserId === currentUser.id ||
      ((currentUser.role === 'manager' || currentUser.role === 'admin') && n.recipientUserId === 'managers') ||
      (currentUser.role === 'admin' && n.recipientUserId === 'admins')
  );
  const unreadCount = userNotifs.filter(n => !n.read).length;

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'مدیر کل دارالقرآن';
      case 'manager':
        return 'مسئول مسجد';
      case 'student':
        return 'دانش‌آموز';
      case 'parent':
        return 'ولی دانش‌آموز';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Brand Zone */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 dark:from-emerald-700 dark:to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-900/20 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C10.5 4 8 6 8 9C8 10.6 9 12 10.5 12.7V22H13.5V12.7C15 12 16 10.6 16 9C16 6 13.5 4 12 2M4 14V22H7V14.8C5.8 15.3 5 16.5 5 18H4M17 14.8V22H20V14C19 14 18.2 15.3 17 14.8Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-emerald-900 dark:text-emerald-300 tracking-tight">
                  مسجد من
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
                  دارالقرآن کنخ
                </span>
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[170px] sm:max-w-none">
                {currentUser.fullName} ({getRoleTitle(currentUser.role)})
              </span>
            </div>
          </div>

          {/* Action Zone: Sync Status, Offline Toggle, Notifications, Role Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Sync State Badge & Manual Sync Trigger */}
            <button
              onClick={() => syncOfflineQueue()}
              disabled={isSyncing}
              title={
                syncStatus === 'synced'
                  ? 'اطلاعات با سرور همگام است'
                  : syncStatus === 'pending'
                  ? `${toPersianDigits(pendingOfflineCount)} مورد در انتظار همگام‌سازی (کلیک برای ارسال)`
                  : 'خطا در همگام‌سازی (کلیک برای تلاش مجدد)'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                syncStatus === 'synced'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100'
                  : syncStatus === 'pending'
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 hover:bg-amber-100 animate-pulse'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {syncStatus === 'synced'
                  ? 'همگام'
                  : `${toPersianDigits(pendingOfflineCount)} در صف`}
              </span>
            </button>

            {/* Offline Simulation Toggle */}
            <button
              onClick={toggleSimulatedOffline}
              title={isSimulatedOffline ? 'حالت آزمایشی آفلاین فعال است (کلیک برای آنلاین شدن)' : 'تست حالت آفلاین'}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center ${
                isSimulatedOffline
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isSimulatedOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifDrawer(true)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="اعلان‌ها"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {toPersianDigits(unreadCount)}
                </span>
              )}
            </button>

            {/* Personal Profile Button */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-900/20 active:scale-95"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs overflow-hidden shrink-0">
                {currentUser.avatarUrl?.startsWith('data:image') || currentUser.avatarUrl?.startsWith('http') ? (
                  <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : currentUser.avatarUrl === 'avatar-dome' ? '🕌' :
                 currentUser.avatarUrl === 'avatar-quran' ? '📖' :
                 currentUser.avatarUrl === 'avatar-star' ? '⭐' :
                 currentUser.avatarUrl === 'avatar-minaret' ? '🕋' :
                 currentUser.fullName.charAt(0)}
              </div>
              <span className="hidden sm:inline">پروفایل شخصی</span>
            </button>

            {/* Prominent Header Logout Button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              title="خروج از حساب کاربری"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all active:scale-95 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        {/* Offline Warning Banner if simulated or real offline */}
        {isSimulatedOffline && (
          <div className="bg-amber-500 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
            <WifiOff className="w-3.5 h-3.5" />
            <span>حالت شبیه‌سازی آفلاین فعال است. تمامی حضورها در دیتابیس محلی (IndexedDB) ذخیره و با اتصال مجدد همگام می‌شوند.</span>
            <button
              onClick={toggleSimulatedOffline}
              className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[11px] underline"
            >
              خروج از آفلاین
            </button>
          </div>
        )}
      </header>

      {/* Notifications Drawer */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl p-4 flex flex-col animate-slide-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  اعلان‌های من
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    علامت‌گذاری همه به عنوان خوانده‌شده
                  </button>
                )}
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {userNotifs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  اعلان جدیدی وجود ندارد.
                </div>
              ) : (
                userNotifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.linkTab) {
                        setActiveTab(n.linkTab);
                        setShowNotifDrawer(false);
                      }
                    }}
                    className={`p-3 rounded-xl border text-right cursor-pointer transition-colors ${
                      n.read
                        ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 opacity-80'
                        : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatRelativePersianTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowNotifDrawer(false)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal in Header */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-right">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                خروج از حساب کاربری
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                آیا از خروج از سامانه «مسجد من» دارالقرآن کنخ اطمینان دارید؟
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="flex-1 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors"
              >
                خروج قطعی
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

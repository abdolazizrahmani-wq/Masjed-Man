import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  Trophy,
  Calendar,
  Award,
  Users,
  Gift,
  QrCode,
  Sliders,
  Building2,
  FileSpreadsheet,
  Activity as ActivityIcon,
  UserCheck,
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  History,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const Navigation: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, logout } = useApp();
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  // Define tab items for each role
  const getNavItems = (): { primary: NavItem[]; secondary: NavItem[] } => {
    switch (currentUser.role) {
      case 'student':
        return {
          primary: [
            { id: 'home', label: 'داشبورد', icon: Home },
            { id: 'history', label: 'امتیازات', icon: History },
            { id: 'rankings', label: 'رتبه‌بندی', icon: Trophy },
            { id: 'calendar', label: 'تقویم', icon: Calendar },
          ],
          secondary: [
            { id: 'badges', label: 'نشان‌ها و افتخارات', icon: Award },
            { id: 'referrals', label: 'دعوت دوستان', icon: Users },
            { id: 'rewards', label: 'جوایز ماهانه', icon: Gift },
            { id: 'qr', label: 'اسکن QR کد مسجد', icon: QrCode },
            { id: 'profile', label: 'پروفایل شخصی', icon: UserCheck },
          ],
        };

      case 'manager':
        return {
          primary: [
            { id: 'home', label: 'داشبورد', icon: Home },
            { id: 'attendance', label: 'ثبت حضور', icon: CheckSquare },
            { id: 'students', label: 'دانش‌آموزان', icon: Users },
            { id: 'rankings', label: 'رتبه‌بندی', icon: Trophy },
          ],
          secondary: [
            { id: 'reports', label: 'گزارش‌ها و خروجی', icon: FileSpreadsheet },
            { id: 'qr', label: 'QR کد مسجد', icon: QrCode },
            { id: 'rewards', label: 'جوایز مسابقه', icon: Gift },
            { id: 'profile', label: 'پروفایل شخصی', icon: UserCheck },
          ],
        };

      case 'admin':
        return {
          primary: [
            { id: 'home', label: 'داشبورد', icon: Home },
            { id: 'attendance', label: 'ثبت حضور', icon: CheckSquare },
            { id: 'mosques', label: 'مساجد', icon: Building2 },
            { id: 'activities', label: 'فعالیت‌ها', icon: ActivityIcon },
          ],
          secondary: [
            { id: 'students', label: 'کاربران و مسئولان', icon: Users },
            { id: 'rankings', label: 'رتبه‌بندی روستا', icon: Trophy },
            { id: 'rewards', label: 'مدیریت جوایز', icon: Gift },
            { id: 'reports', label: 'گزارش‌های جامع', icon: FileSpreadsheet },
            { id: 'settings', label: 'تنظیمات سیستم', icon: ShieldCheck },
            { id: 'profile', label: 'پروفایل شخصی', icon: UserCheck },
          ],
        };

      case 'parent':
        return {
          primary: [
            { id: 'home', label: 'وضعیت فرزند', icon: Home },
            { id: 'history', label: 'ریز سوابق', icon: History },
            { id: 'calendar', label: 'تقویم حضور', icon: Calendar },
            { id: 'rankings', label: 'رتبه فرزند', icon: Trophy },
          ],
          secondary: [
            { id: 'rewards', label: 'جوایز ماهانه', icon: Gift },
            { id: 'profile', label: 'پروفایل شخصی', icon: UserCheck },
          ],
        };
    }
  };

  const { primary, secondary } = getNavItems();
  const allItems = [...primary, ...secondary];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setShowMoreSheet(false);
  };

  return (
    <>
      {/* Desktop / Tablet Sub-Navbar */}
      <nav className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-2">
          {allItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {primary.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors relative ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </button>
            );
          })}

          {/* "بیشتر" (More) Tab Button */}
          <button
            onClick={() => setShowMoreSheet(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
              secondary.some(s => s.id === activeTab)
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">سایر بخش‌ها</span>
          </button>
        </div>
      </div>

      {/* Mobile "More" Bottom Sheet Drawer */}
      {showMoreSheet && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* Grab handle */}
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                سایر بخش‌ها و امکانات
              </h3>
              <button
                onClick={() => setShowMoreSheet(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {secondary.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-right transition-all ${
                      isActive
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Logout button in mobile more sheet */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowMoreSheet(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب کاربری</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

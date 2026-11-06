/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { PWAInstallButton } from './components/PWAInstallButton';
import { LoginView } from './components/auth/LoginView';
import { SetupView } from './components/auth/SetupView';

// Dashboards
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { ManagerDashboard } from './components/dashboards/ManagerDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';

// Features
import { AttendanceMarking } from './components/attendance/AttendanceMarking';
import { StudentPointsHistory } from './components/attendance/StudentPointsHistory';
import { Leaderboards } from './components/rankings/Leaderboards';
import { AttendanceCalendar } from './components/attendance/AttendanceCalendar';
import { BadgesView } from './components/badges/BadgesView';
import { ReferralView } from './components/referrals/ReferralView';
import { RewardsView } from './components/rewards/RewardsView';
import { MosquesManagement } from './components/mosques/MosquesManagement';
import { ActivitiesManagement } from './components/activities/ActivitiesManagement';
import { StudentsManagement } from './components/students/StudentsManagement';
import { ReportsView } from './components/reports/ReportsView';
import { QRCodeView } from './components/qr/QRCodeView';
import { AppearanceSettings } from './components/settings/AppearanceSettings';
import { SystemSettings } from './components/admin/SystemSettings';
import { PersonalProfileView } from './components/profile/PersonalProfileView';

const MainContent: React.FC = () => {
  const { currentUser, activeTab, isAuthenticated, needsSetup, storageWarning, dismissStorageWarning } = useApp();

  // If user is not authenticated, show the Login page
  if (!isAuthenticated) {
    return needsSetup ? <SetupView /> : <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        switch (currentUser.role) {
          case 'student':
            return <StudentDashboard />;
          case 'manager':
            return <ManagerDashboard />;
          case 'admin':
            return <AdminDashboard />;
          case 'parent':
            return <ParentDashboard />;
        }
        break;

      case 'profile':
        return <PersonalProfileView />;

      case 'attendance':
        return <AttendanceMarking />;

      case 'history':
        return <StudentPointsHistory />;

      case 'rankings':
        return <Leaderboards />;

      case 'calendar':
        return <AttendanceCalendar />;

      case 'badges':
        return <BadgesView />;

      case 'referrals':
        return <ReferralView />;

      case 'rewards':
        return <RewardsView />;

      case 'mosques':
        return <MosquesManagement />;

      case 'activities':
        return <ActivitiesManagement />;

      case 'students':
        return <StudentsManagement />;

      case 'reports':
        return <ReportsView />;

      case 'qr':
        return <QRCodeView />;

      case 'appearance':
        return <AppearanceSettings />;

      case 'settings':
        return <SystemSettings />;

      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Header />
      <Navigation />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-20 md:pb-10">
        {storageWarning && (
          <div
            role="alert"
            className="no-print mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-start justify-between gap-3"
          >
            <span>
              هشدار: حافظه‌ی مرورگر پر یا غیرقابل‌نوشتن است و تغییرات اخیر ذخیره نشده‌اند. از بخش «گزارش‌ها» یک خروجی
              بگیرید و فضای دستگاه را آزاد کنید.
            </span>
            <button onClick={dismissStorageWarning} className="shrink-0 underline">
              متوجه شدم
            </button>
          </div>
        )}

        {/* Top PWA Install Bar for Mobile */}
        <div className="no-print mb-4 flex items-center justify-between">
          <PWAInstallButton />
        </div>

        {renderActiveView()}
      </main>

      {/* Quiet Mobile-friendly Footer */}
      <footer className="no-print py-4 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>سامانه «مسجد من» · دارالقرآن کنخ (مدیر: ابوطالب هدایتیان)</span>
          <span>پشتیبانی کامل از کارکرد آفلاین و تقویم شمسی</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

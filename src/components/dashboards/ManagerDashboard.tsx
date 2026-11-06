import React from 'react';
import {
  CheckSquare,
  Users,
  Trophy,
  Clock,
  UserPlus,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, getShamsiDateString, formatShamsiDateHuman } from '../../utils/jalali';

export const ManagerDashboard: React.FC = () => {
  const {
    currentUser,
    mosques,
    users,
    attendances,
    approveStudentRegistration,
    getMosqueLeaderboard,
    setActiveTab,
  } = useApp();

  const managerMosque = mosques.find(m => m.id === currentUser.mosqueId) || mosques[0];
  const todayShamsi = getShamsiDateString();

  // Mosque students
  const mosqueStudents = users.filter(
    u => u.role === 'student' && u.mosqueId === managerMosque.id && u.status === 'active'
  );

  // Pending students for this mosque
  const pendingStudents = users.filter(
    u => u.role === 'student' && u.mosqueId === managerMosque.id && u.status === 'pending'
  );

  // Today's attendances recorded at this mosque
  const todayMosqueAttendances = attendances.filter(
    a => a.attendanceMosqueId === managerMosque.id && a.shamsiDate === todayShamsi
  );

  // Mosque leaderboard top 3
  const topStudents = getMosqueLeaderboard(managerMosque.id).slice(0, 3);

  return (
    <div className="space-y-5 pb-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200">
                پنل مدیریت مسجد
              </span>
              <span className="text-xs text-emerald-300">
                امروز: {todayShamsi}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
              {managerMosque.name} · روستای کنخ
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              مسئول محترم: {currentUser.fullName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-950/20 transition-all shrink-0 active:scale-95"
            >
              <CheckSquare className="w-4 h-4" />
              <span>ثبت حضور سریع نماز و قرآن</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-xs text-emerald-200 block">دانش‌آموزان مسجد</span>
            <span className="text-2xl font-black text-white font-farsi-num mt-1">
              {toPersianDigits(mosqueStudents.length)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-xs text-emerald-200 block">حضورهای امروز</span>
            <span className="text-2xl font-black text-amber-300 font-farsi-num mt-1">
              {toPersianDigits(todayMosqueAttendances.length)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-xs text-emerald-200 block">در انتظار تأیید</span>
            <span className="text-2xl font-black text-rose-300 font-farsi-num mt-1">
              {toPersianDigits(pendingStudents.length)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-xs text-emerald-200 block">وضعیت مسجد</span>
            <span className="text-sm font-bold text-emerald-300 mt-2 block">
              {managerMosque.active ? 'فعال و دایر' : 'غیرفعال'}
            </span>
          </div>
        </div>
      </div>

      {/* Pending Registrations Awaiting Approval */}
      {pendingStudents.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>درخواست‌های ثبت‌نام جدید در انتظار تأیید شما ({toPersianDigits(pendingStudents.length)} نفر)</span>
          </div>
          <div className="space-y-2">
            {pendingStudents.map(std => (
              <div
                key={std.id}
                className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {std.fullName} ({std.grade || 'دانش‌آموز'})
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    نام پدر: {std.fatherName || '—'} · شماره ولی: {toPersianDigits(std.parentPhone || std.phone || '—')}
                  </div>
                </div>
                <button
                  onClick={() => approveStudentRegistration(std.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>تأیید عضویت</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Students of this Mosque */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                نفرات برتر {managerMosque.name} در ماه جاری
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('rankings')}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>مشاهده رتبه‌بندی کامل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topStudents.map((item, idx) => (
              <div
                key={item.student.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-900'
                        : 'bg-amber-700 text-white'
                    }`}
                  >
                    {toPersianDigits(idx + 1)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.student.fullName}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.student.grade || 'دانش‌آموز'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-farsi-num">
                  {toPersianDigits(item.points)} امتیاز
                </span>
              </div>
            ))}
            {topStudents.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">
                هنوز امتیازی برای دانش‌آموزان این مسجد ثبت نشده است.
              </p>
            )}
          </div>
        </div>

        {/* Quick Operations & Tools */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            عملیات و دسترسی‌های سریع
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTab('attendance')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-right space-y-1 transition-all"
            >
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">ثبت حضور جماعت</div>
              <p className="text-[11px] text-slate-500">انتخاب سریع نمازها و قرآن</p>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-right space-y-1 transition-all"
            >
              <Users className="w-5 h-5 text-emerald-600" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">لیست دانش‌آموزان</div>
              <p className="text-[11px] text-slate-500">ثبت‌نام جدید و مدیریت اعضا</p>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-right space-y-1 transition-all"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">گزارش و اکسل</div>
              <p className="text-[11px] text-slate-500">خروجی اکسل و نسخه چاپی</p>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-right space-y-1 transition-all"
            >
              <Building2 className="w-5 h-5 text-emerald-600" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">QR کد مسجد</div>
              <p className="text-[11px] text-slate-500">نمایش و چاپ بارکد مسجد</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

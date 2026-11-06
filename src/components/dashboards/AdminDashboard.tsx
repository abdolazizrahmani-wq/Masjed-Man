import React from 'react';
import {
  Building2,
  Users,
  CheckSquare,
  Trophy,
  Activity as ActivityIcon,
  Gift,
  ShieldAlert,
  FileSpreadsheet,
  TrendingUp,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, getShamsiDateString } from '../../utils/jalali';

export const AdminDashboard: React.FC = () => {
  const {
    mosques,
    users,
    attendances,
    activities,
    rewards,
    getVillageLeaderboard,
    setActiveTab,
  } = useApp();

  const totalMosques = mosques.length;
  const activeMosques = mosques.filter(m => m.active).length;
  const allStudents = users.filter(u => u.role === 'student');
  const activeStudents = allStudents.filter(u => u.status === 'active');
  const pendingStudents = allStudents.filter(u => u.status === 'pending');
  const totalManagers = users.filter(u => u.role === 'manager').length;
  const totalAttendances = attendances.length;

  // Village Top 5
  const villageTop = getVillageLeaderboard().slice(0, 5);

  // Comparative Mosques stats
  const mosquesStats = mosques.map(m => {
    const studentsInMosque = allStudents.filter(s => s.mosqueId === m.id);
    const mosqueAttendances = attendances.filter(a => a.attendanceMosqueId === m.id);
    const totalPointsEarned = attendances
      .filter(a => a.attendanceMosqueId === m.id)
      .reduce((sum, a) => sum + a.points, 0);

    return {
      mosque: m,
      studentCount: studentsInMosque.length,
      attendanceCount: mosqueAttendances.length,
      totalPoints: totalPointsEarned,
    };
  });

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Admin Welcome & Status Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600/40 text-emerald-300 border border-emerald-500/30">
                سامانه جامع دارالقرآن کنخ
              </span>
              <span className="text-xs text-slate-300 font-medium">
                نسخه رسمی · آبان ۱۴۰۵
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
              داشبورد مدیریت کل مساجد روستای کنخ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              نظارت بر ۵ مسجد، حلقات قرآنی، نمازهای پنج‌گانه و رتبه‌بندی نونهالان و نوجوانان
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('mosques')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>مدیریت مساجد</span>
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
            >
              <ActivityIcon className="w-3.5 h-3.5" />
              <span>مدیریت فعالیت‌ها</span>
            </button>
          </div>
        </div>

        {/* 4 Primary Top Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-center">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/5">
            <span className="text-xs text-slate-300 block">مساجد فعال</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-farsi-num mt-1">
              {toPersianDigits(activeMosques)}{' '}
              <span className="text-xs text-slate-400 font-normal">از {toPersianDigits(totalMosques)}</span>
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/5">
            <span className="text-xs text-slate-300 block">دانش‌آموزان فعال</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-farsi-num mt-1">
              {toPersianDigits(activeStudents.length)}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/5">
            <span className="text-xs text-slate-300 block">کل حضورهای ثبت‌شده</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-farsi-num mt-1">
              {toPersianDigits(totalAttendances)}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/5">
            <span className="text-xs text-slate-300 block">مسئولان مساجد</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-farsi-num mt-1">
              {toPersianDigits(totalManagers)}
            </span>
          </div>
        </div>
      </div>

      {/* Pending Approval Notice if any */}
      {pendingStudents.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              !
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                تعداد {toPersianDigits(pendingStudents.length)} دانش‌آموز جدید در انتظار بررسی و تأیید عضویت هستند.
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                می‌توانید از بخش مدیریت کاربران این درخواست‌ها را بررسی و تأیید فرمایید.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('students')}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors"
          >
            بررسی اعضا
          </button>
        </div>
      )}

      {/* Comparative Mosque Statistics Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              آمار مقایسه‌ای مساجد روستای کنخ
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('mosques')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>مدیریت مساجد</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 pb-2">
                <th className="py-2.5 px-3 font-semibold">نام مسجد</th>
                <th className="py-2.5 px-3 font-semibold">مسئول مسجد</th>
                <th className="py-2.5 px-3 font-semibold text-center">دانش‌آموزان عضو</th>
                <th className="py-2.5 px-3 font-semibold text-center">حضورهای ثبت‌شده</th>
                <th className="py-2.5 px-3 font-semibold text-center">مجموع امتیاز</th>
                <th className="py-2.5 px-3 font-semibold text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mosquesStats.map(stat => (
                <tr key={stat.mosque.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {stat.mosque.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {stat.mosque.managerName}
                  </td>
                  <td className="py-3 px-3 text-center font-farsi-num font-bold text-slate-800 dark:text-slate-200">
                    {toPersianDigits(stat.studentCount)}
                  </td>
                  <td className="py-3 px-3 text-center font-farsi-num font-bold text-emerald-600 dark:text-emerald-400">
                    {toPersianDigits(stat.attendanceCount)}
                  </td>
                  <td className="py-3 px-3 text-center font-farsi-num font-bold text-amber-600 dark:text-amber-400">
                    {toPersianDigits(stat.totalPoints)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        stat.mosque.active
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {stat.mosque.active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns: Village Leaderboard Top 5 & Admin Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Village Top Students */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                نفرات برتر کل روستای کنخ (ماه جاری)
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

          <div className="space-y-2">
            {villageTop.map((item, idx) => (
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
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {toPersianDigits(idx + 1)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.student.fullName}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.mosqueName} · {item.student.grade || 'دانش‌آموز'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-farsi-num">
                  {toPersianDigits(item.points)} امتیاز
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Admin Tools */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            ابزارهای راهبردی دارالقرآن
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTab('attendance')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-right space-y-1 transition-all"
            >
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">ثبت حضور و امتیاز</div>
              <p className="text-[11px] text-slate-500">ثبت حضور در هر یک از مساجد</p>
            </button>

            <button
              onClick={() => setActiveTab('rewards')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-right space-y-1 transition-all"
            >
              <Gift className="w-5 h-5 text-amber-500" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">مدیریت جوایز</div>
              <p className="text-[11px] text-slate-500">تعریف مسابقه ماه و اهدای جوایز</p>
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
              onClick={() => setActiveTab('settings')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-right space-y-1 transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">تنظیمات و QR</div>
              <p className="text-[11px] text-slate-500">کنترل QR کد و لاگ‌های امنیتی</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

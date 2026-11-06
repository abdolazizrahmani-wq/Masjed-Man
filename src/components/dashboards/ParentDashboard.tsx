import React, { useState } from 'react';
import {
  Users,
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  Gift,
  MapPin,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, formatShamsiDateHuman } from '../../utils/jalali';

export const ParentDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    mosques,
    attendances,
    rewards,
    winners,
    getStudentMonthlyPoints,
    getStudentTotalPoints,
    getStudentRankInMosque,
    getStudentRankInVillage,
    getStudentDaysAttendedMonth,
    setActiveTab,
  } = useApp();

  // Connected children for this parent
  const connectedChildren = users.filter(
    u => currentUser.childrenIds && currentUser.childrenIds.includes(u.id)
  );

  const [selectedChildId, setSelectedChildId] = useState<string>(
    connectedChildren.length > 0 ? connectedChildren[0].id : ''
  );

  const selectedChild = users.find(u => u.id === selectedChildId) || connectedChildren[0];

  const childMosque = selectedChild
    ? mosques.find(m => m.id === selectedChild.mosqueId)
    : null;

  const monthlyPoints = selectedChild ? getStudentMonthlyPoints(selectedChild.id) : 0;
  const totalPoints = selectedChild ? getStudentTotalPoints(selectedChild.id) : 0;
  const daysAttended = selectedChild ? getStudentDaysAttendedMonth(selectedChild.id) : 0;
  const mosqueRank = selectedChild ? getStudentRankInMosque(selectedChild.id) : { rank: 1, total: 1 };
  const villageRank = selectedChild ? getStudentRankInVillage(selectedChild.id) : { rank: 1, total: 1 };

  // Child's recent attendances
  const childAttendances = selectedChild
    ? attendances.filter(a => a.studentId === selectedChild.id).slice(0, 5)
    : [];

  // Child prizes
  const childPrizes = selectedChild
    ? winners.filter(w => w.studentId === selectedChild.id)
    : [];

  return (
    <div className="space-y-5 pb-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-800/60 text-teal-200 border border-teal-600/30">
            پنل اولیای گرامی
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            سلام {currentUser.fullName} گرامی
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1">
            مشاهده آنلاین وضعیت حضور، امتیازات، رتبه و فعالیت‌های قرآنی فرزندان در مساجد کنخ
          </p>
        </div>

        {/* Child selector tabs if multiple children */}
        {connectedChildren.length > 1 && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <span className="text-xs text-teal-200">انتخاب فرزند:</span>
            {connectedChildren.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChildId(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedChild?.id === c.id
                    ? 'bg-white text-teal-950 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {c.fullName}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedChild ? (
        <>
          {/* Child Score & Rank Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  کارنامه ماهانه: {selectedChild.fullName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  عضو {childMosque ? childMosque.name : 'مسجد جامع'} · {selectedChild.grade || 'دانش‌آموز'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block">امتیاز ماه جاری</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-farsi-num">
                    {toPersianDigits(monthlyPoints)} امتیاز
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">رتبه در مسجد</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-farsi-num mt-1">
                  {toPersianDigits(mosqueRank.rank)}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">از {toPersianDigits(mosqueRank.total)}</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">رتبه در کل روستا</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-farsi-num mt-1">
                  {toPersianDigits(villageRank.rank)}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">از {toPersianDigits(villageRank.total)}</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">روزهای حضور</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-200 font-farsi-num mt-1">
                  {toPersianDigits(daysAttended)} روز
                </span>
              </div>
            </div>
          </div>

          {/* Recent Attendances */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  آخرین نمازها و برنامه‌های ثبت‌شده برای فرزند
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>تقویم کامل ماه</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {childAttendances.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  هنوز حضوری برای این ماه ثبت نشده است.
                </p>
              ) : (
                childAttendances.map(a => (
                  <div
                    key={a.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {a.activityName}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {a.attendanceMosqueName}
                        </span>
                        <span>·</span>
                        <span>{formatShamsiDateHuman(a.shamsiDate)}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-farsi-num">
                      +{toPersianDigits(a.points)} امتیاز
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Won prizes notice if any */}
          {childPrizes.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <Gift className="w-5 h-5 text-amber-600" />
                <span>جوایز و افتخارات کسب‌شده توسط فرزند</span>
              </div>
              <div className="space-y-2">
                {childPrizes.map(p => (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-amber-200 dark:border-amber-900 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {p.prizeName} (رتبه {toPersianDigits(p.rank)})
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        وضعیت تحویل: {p.delivered ? 'تحویل داده شد ✓' : 'در انتظار مراسم اهدا'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 font-farsi-num">
                      {toPersianDigits(p.points)} امتیاز
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 text-xs">
          هنوز فرزندی به حساب شما متصل نشده است. اتصال فرزند از طریق تأیید مدیر کل دارالقرآن انجام می‌شود.
        </div>
      )}
    </div>
  );
};

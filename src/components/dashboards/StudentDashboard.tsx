import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Calendar,
  Sparkles,
  Users,
  Gift,
  ArrowUpRight,
  TrendingUp,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, formatShamsiDateHuman } from '../../utils/jalali';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    mosques,
    attendances,
    transactions,
    rewards,
    quotes,
    studentBadges,
    badges,
    getStudentMonthlyPoints,
    getStudentTotalPoints,
    getStudentDaysAttendedMonth,
    getStudentRankInMosque,
    getStudentRankInVillage,
    setActiveTab,
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);

  const studentMosque = mosques.find(m => m.id === currentUser.mosqueId);
  const monthlyPoints = getStudentMonthlyPoints(currentUser.id);
  const totalPoints = getStudentTotalPoints(currentUser.id);
  const daysAttended = getStudentDaysAttendedMonth(currentUser.id);
  const mosqueRank = getStudentRankInMosque(currentUser.id);
  const villageRank = getStudentRankInVillage(currentUser.id);

  // Recent transactions for this student
  const studentAttendances = attendances
    .filter(a => a.studentId === currentUser.id)
    .slice(0, 5);

  // Active motivational quote
  const activeQuotes = quotes.filter(q => q.active);
  const randomQuote = activeQuotes.length > 0 ? activeQuotes[0] : null;

  // Active prize
  const activeReward = rewards.find(r => r.status === 'active');

  // Earned badges
  const earnedBadgeIds = new Set(
    studentBadges.filter(sb => sb.studentId === currentUser.id).map(sb => sb.badgeId)
  );
  const userBadgesList = badges.filter(b => earnedBadgeIds.has(b.id));

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(
      `سلام! من در برنامه «مسجد من» دارالقرآن کنخ عضو شدم. شما هم با کد معرف من (${currentUser.referralCode}) عضو شو تا با هم در نمازها و فعالیت‌های قرآنی رقابت کنیم و جایزه ببریم!`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-5 pb-8 animate-fade-in">
      {/* Motivational Quote Banner */}
      {randomQuote && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white shadow-md relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-28 h-28 bg-emerald-700/30 rounded-full blur-xl" />
          <div className="relative z-10 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium leading-relaxed text-emerald-50">
                «{randomQuote.text}»
              </p>
              {randomQuote.source && (
                <span className="text-[11px] text-amber-300 font-semibold block mt-1">
                  — {randomQuote.source}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            سلام {currentUser.fullName} عزیز 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            عضو {studentMosque ? studentMosque.name : 'مسجد جامع'} · روستای کنخ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('history')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            سوابق کامل امتیازات
          </button>
        </div>
      </div>

      {/* Hero Points & Ranking Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 shadow-xl shadow-emerald-950/20">
        {/* Subtle decorative geometric overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-200 tracking-wider">
              امتیاز ماه جاری (آبان ۱۴۰۵)
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
              <Trophy className="w-3.5 h-3.5" />
              <span>کل سوابق: {toPersianDigits(totalPoints)}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-black font-farsi-num tracking-tight text-white drop-shadow-sm">
              {toPersianDigits(monthlyPoints)}
            </span>
            <span className="text-base text-emerald-200 font-bold">امتیاز</span>
          </div>

          {/* Quick 3-Metric Strip */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/15 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5">
              <span className="block text-[11px] text-emerald-200 font-medium">رتبه در مسجد</span>
              <span className="text-lg font-black text-amber-300 font-farsi-num mt-0.5">
                {toPersianDigits(mosqueRank.rank)}{' '}
                <span className="text-[10px] text-white/80 font-normal">از {toPersianDigits(mosqueRank.total)}</span>
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5">
              <span className="block text-[11px] text-emerald-200 font-medium">رتبه در کل روستا</span>
              <span className="text-lg font-black text-amber-300 font-farsi-num mt-0.5">
                {toPersianDigits(villageRank.rank)}{' '}
                <span className="text-[10px] text-white/80 font-normal">از {toPersianDigits(villageRank.total)}</span>
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5">
              <span className="block text-[11px] text-emerald-200 font-medium">روزهای حضور</span>
              <span className="text-lg font-black text-white font-farsi-num mt-0.5">
                {toPersianDigits(daysAttended)}{' '}
                <span className="text-[10px] text-emerald-200 font-normal">روز</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Reward Banner */}
      {activeReward && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/20 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                مسابقه ماه جاری
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                {activeReward.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                جایزه نفر اول: <strong className="text-amber-800 dark:text-amber-300">{activeReward.place1Prize}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('rewards')}
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors"
          >
            مشاهده جوایز
          </button>
        </div>
      )}

      {/* Two Column Grid on Tablet/Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Activities Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                آخرین فعالیت‌های ثبت‌شده
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>تقویم حضور</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {studentAttendances.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                هنوز فعالیتی برای این ماه ثبت نشده است. با حضور در نمازهای جماعت مسجد امتیاز کسب کنید!
              </p>
            ) : (
              studentAttendances.map(a => (
                <div
                  key={a.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {a.activityName}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {a.attendanceMosqueName}
                          {a.isGuestAttendance && ' (مهمان)'}
                        </span>
                        <span>·</span>
                        <span>{formatShamsiDateHuman(a.shamsiDate)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-farsi-num shrink-0">
                    +{toPersianDigits(a.points)} امتیاز
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invite Friends / Referral Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                دعوت از دوستان و کسب ۵۰ امتیاز هدیه
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              کد اختصاصی خود را با دوستان و هم‌کلاسی‌های روستای کنخ به اشتراک بگذارید. با اولین حضور آنان در مسجد، ۵۰ امتیاز ویژه دریافت کنید!
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-dashed border-emerald-400 dark:border-emerald-600 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">کد معرف اختصاصی شما:</span>
                <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-300 tracking-wider">
                  {currentUser.referralCode}
                </span>
              </div>
              <button
                onClick={handleCopyInvite}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'کپی شد!' : 'کپی متن دعوت'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              مشاهده وضعیت دعوت‌ها
            </span>
            <button
              onClick={() => setActiveTab('referrals')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>لیست دعوت‌شده‌ها</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Earned Badges Showcase */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              افتخارات و نشان‌های من ({toPersianDigits(userBadgesList.length)} نشان)
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('badges')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>مشاهده همه نشان‌ها</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {userBadgesList.map(b => (
            <div
              key={b.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-1.5"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center font-bold text-sm shadow-xs">
                ★
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                {b.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {b.description}
              </p>
            </div>
          ))}
          {userBadgesList.length === 0 && (
            <div className="col-span-full py-4 text-center text-xs text-slate-400">
              هنوز نشانی کسب نکرده‌اید. با حضور مستمر در نماز صبح و حلقات قرآن نشان‌ها فعال می‌شوند.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

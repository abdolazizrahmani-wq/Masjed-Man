import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, formatShamsiDateHuman } from '../../utils/jalali';

export const ReferralView: React.FC = () => {
  const { currentUser, users, attendances, transactions, settings } = useApp();
  const [copied, setCopied] = useState(false);

  // Find users who used this student's referral code
  const invitedStudents = users.filter(u => u.referredBy === currentUser.referralCode);

  const inviteBonus = settings.defaultReferralPoints;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `سلام دوست عزیز! من در سامانه «مسجد من» دارالقرآن کنخ ثبت‌نام کردم. بیا با هم در نمازهای جماعت و برنامه‌های قرآنی شرکت کنیم و جایزه ببریم!\nکد معرف من: ${currentUser.referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'دعوت به برنامه مسجد من',
        text,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          سامانه دعوت دوستان به مساجد کنخ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          دوستان و هم‌کلاسی‌های خود را به مسجد دعوت کنید و با اولین حضور آنان در مسجد {toPersianDigits(inviteBonus)} امتیاز پاداش بگیرید!
        </p>
      </div>

      {/* Hero Invite Code Box */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md inline-block">
              کد دعوت اختصاصی شما
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest mt-3 text-amber-300">
              {currentUser.referralCode}
            </div>
            <p className="text-xs text-emerald-100 mt-2">
              این کد را هنگام ثبت‌نام به دوستان خود بدهید تا به عنوان معرف شما ثبت شوند.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-2xl bg-white text-emerald-950 font-extrabold text-xs flex items-center gap-2 shadow-md hover:bg-emerald-50 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'کپی شد!' : 'کپی کد معرف'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>ارسال دعوت</span>
            </button>
          </div>
        </div>

        {/* 3 Rules of Referral */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span>هر دانش‌آموز فقط یک معرف می‌تواند داشته باشد.</span>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span>پاداش ۵۰ امتیازی بلافاصله پس از اولین حضور واقعی در مسجد واریز می‌شود.</span>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span>امکان دعوت از تعداد نامحدود دوستان در روستای کنخ وجود دارد.</span>
          </div>
        </div>
      </div>

      {/* Invited Friends List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>فهرست دوستان دعوت‌شده ({toPersianDigits(invitedStudents.length)} نفر)</span>
          </h3>
          <span className="text-xs font-black text-emerald-600 font-farsi-num">
            مجموع پاداش‌ها: +{toPersianDigits(invitedStudents.filter(s => attendances.some(a => a.studentId === s.id)).length * inviteBonus)} امتیاز
          </span>
        </div>

        <div className="space-y-2.5">
          {invitedStudents.map(student => {
            const hasAttended = attendances.some(a => a.studentId === student.id);
            const firstAttendance = attendances.find(a => a.studentId === student.id);

            return (
              <div
                key={student.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {student.fullName} ({student.grade || 'دانش‌آموز'})
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {hasAttended
                      ? `اولین حضور در مسجد: ${formatShamsiDateHuman(firstAttendance?.shamsiDate || '')} (${firstAttendance?.attendanceMosqueName})`
                      : 'ثبت‌نام کرده است · هنوز اولین حضور در مسجد ثبت نشده است'}
                  </div>
                </div>

                <div className="text-left shrink-0">
                  {hasAttended ? (
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-farsi-num flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      +{toPersianDigits(inviteBonus)} امتیاز واریز شد
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      در انتظار اولین حضور
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {invitedStudents.length === 0 && (
            <p className="text-xs text-slate-400 py-8 text-center">
              شما هنوز دوستی را دعوت نکرده‌اید. با اشتراک کد معرف، اولین امتیاز هدیه را کسب کنید!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

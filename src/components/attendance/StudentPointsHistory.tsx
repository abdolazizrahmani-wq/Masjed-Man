import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  Sparkles,
  MapPin,
  Calendar,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, formatShamsiDateHuman } from '../../utils/jalali';

export const StudentPointsHistory: React.FC = () => {
  const { currentUser, users, transactions, getStudentTotalPoints, getStudentMonthlyPoints } = useApp();

  const targetStudent =
    currentUser.role === 'parent' && currentUser.childrenIds && currentUser.childrenIds.length > 0
      ? users.find(u => u.id === currentUser.childrenIds![0]) || currentUser
      : currentUser;

  const [typeFilter, setTypeFilter] = useState<string>('all');

  const studentTransactions = transactions.filter(t => {
    const matchesStudent = t.studentId === targetStudent.id;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesStudent && matchesType;
  });

  const totalPoints = getStudentTotalPoints(targetStudent.id);
  const monthlyPoints = getStudentMonthlyPoints(targetStudent.id);

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          ریز سوابق امتیازات {targetStudent.fullName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          مشاهده لحظه‌ای تمامی امتیازات مکتسبه از نمازهای جماعت، حلقات قرآنی و پاداش دعوت دوستان
        </p>
      </div>

      {/* 2 KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">امتیاز ماه جاری (آبان)</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-farsi-num mt-1 block">
            +{toPersianDigits(monthlyPoints)} امتیاز
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">کل امتیازات ذخیره‌شده</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-500 font-farsi-num mt-1 block">
            {toPersianDigits(totalPoints)} امتیاز
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'همه تراکنش‌ها' },
          { id: 'activity', label: 'نمازها و قرآن' },
          { id: 'referral', label: 'پاداش دعوت دوستان' },
          { id: 'adjustment', label: 'تعدیل‌های تشویقی' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              typeFilter === tab.id
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          <span>تراکنش‌های ثبت‌شده ({toPersianDigits(studentTransactions.length)} مورد)</span>
        </h3>

        <div className="space-y-2">
          {studentTransactions.map(tx => (
            <div
              key={tx.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    tx.amount >= 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {tx.amount >= 0 ? '+' : '—'}
                </div>

                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {tx.reason}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{formatShamsiDateHuman(tx.shamsiDate)}</span>
                    <span>·</span>
                    <span>ثبت توسط: {tx.performedBy}</span>
                  </div>
                </div>
              </div>

              <span
                className={`text-xs sm:text-sm font-black font-farsi-num shrink-0 ${
                  tx.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                }`}
              >
                {tx.amount >= 0 ? `+${toPersianDigits(tx.amount)}` : toPersianDigits(tx.amount)} امتیاز
              </span>
            </div>
          ))}

          {studentTransactions.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              هیچ سابقه امتیازی در این دسته‌بندی یافت نشد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Trophy,
  Building2,
  Calendar,
  Sparkles,
  Medal,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';
import { publicName } from '../../utils/publicName';

export const Leaderboards: React.FC = () => {
  const {
    currentUser,
    mosques,
    periods,
    getVillageLeaderboard,
    getMosqueLeaderboard,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'village' | 'mosque'>('village');
  const [selectedMosqueId, setSelectedMosqueId] = useState<string>(
    currentUser.mosqueId || mosques[0]?.id || ''
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    periods.find(p => p.isCurrent)?.id || periods[0]?.id || ''
  );

  const isStaffViewer = currentUser.role === 'admin' || currentUser.role === 'manager';
  const labelFor = (u: { id: string; fullName: string }) =>
    isStaffViewer || u.id === currentUser.id ? u.fullName : publicName(u.fullName);

  const villageList = getVillageLeaderboard(selectedPeriodId);
  const mosqueList = getMosqueLeaderboard(selectedMosqueId, selectedPeriodId);
  const activeMosque = mosques.find(m => m.id === selectedMosqueId);

  const displayList = activeTab === 'village' ? villageList : mosqueList;
  const top3 = displayList.slice(0, 3);
  const remaining = displayList.slice(3);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            جدول رتبه‌بندی و رقابت ماهانه
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            مشاهده نفرات برتر مساجد پنج‌گانه دارالقرآن روستای کنخ بر اساس امتیازات ماه جاری
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <select
            value={selectedPeriodId}
            onChange={e => setSelectedPeriodId(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} {p.isCurrent ? '(دوره جاری)' : '(آرشیو)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tab Switcher: Village vs Mosque */}
      <div className="flex items-center justify-center p-1 bg-slate-200/60 dark:bg-slate-800 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('village')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
            activeTab === 'village'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          نفرات برتر کل روستای کنخ
        </button>
        <button
          onClick={() => setActiveTab('mosque')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
            activeTab === 'mosque'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          نفرات برتر مسجد
        </button>
      </div>

      {/* Mosque Selector if in Mosque Tab */}
      {activeTab === 'mosque' && (
        <div className="flex items-center justify-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <select
            value={selectedMosqueId}
            onChange={e => setSelectedMosqueId(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            {mosques.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Top 3 Podium (1st, 2nd, 3rd) */}
      {top3.length > 0 && (
        <div className="pt-4 pb-2">
          <div className="flex items-end justify-center gap-2 sm:gap-4 max-w-lg mx-auto">
            {/* Rank 2 (Silver) */}
            {top3[1] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border-2 border-slate-300 flex items-center justify-center font-black text-slate-800 text-base shadow-md">
                    {top3[1].student.fullName.charAt(0)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs border border-white">
                    ۲
                  </span>
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[100px] text-center">
                  {labelFor(top3[1].student)}
                </span>
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 font-farsi-num mt-0.5">
                  {toPersianDigits(top3[1].points)} امتیاز
                </span>
                <div className="w-full h-24 bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-t-2xl mt-3 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-sm">
                  مقام دوم
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            {top3[0] && (
              <div className="flex-1 flex flex-col items-center -mt-6">
                <div className="relative mb-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-3 border-amber-300 flex items-center justify-center font-black text-amber-950 text-xl shadow-lg ring-4 ring-amber-400/20">
                    {top3[0].student.fullName.charAt(0)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md border-2 border-white">
                    ۱
                  </span>
                </div>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[120px] text-center">
                  {labelFor(top3[0].student)}
                </span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-farsi-num mt-0.5">
                  {toPersianDigits(top3[0].points)} امتیاز
                </span>
                <div className="w-full h-32 bg-gradient-to-t from-amber-400 via-amber-300 to-amber-200 dark:from-amber-600 dark:to-amber-500 rounded-t-2xl mt-3 flex items-center justify-center font-black text-amber-950 text-base shadow-md">
                  قهرمان اول
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3[2] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-800 to-amber-600 border-2 border-amber-700 flex items-center justify-center font-black text-white text-base shadow-md">
                    {top3[2].student.fullName.charAt(0)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-xs border border-white">
                    ۳
                  </span>
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[100px] text-center">
                  {labelFor(top3[2].student)}
                </span>
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 font-farsi-num mt-0.5">
                  {toPersianDigits(top3[2].points)} امتیاز
                </span>
                <div className="w-full h-18 bg-gradient-to-t from-amber-800 to-amber-700 dark:from-amber-900 dark:to-amber-800 rounded-t-2xl mt-3 flex items-center justify-center font-black text-amber-100 text-xs">
                  مقام سوم
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          جدول جامع امتیازات {activeTab === 'village' ? 'کل روستای کنخ' : activeMosque?.name}
        </h3>

        <div className="space-y-2">
          {displayList.map(item => {
            const isMe = currentUser.id === item.student.id;
            const studentMosque = mosques.find(m => m.id === item.student.mosqueId);

            return (
              <div
                key={item.student.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isMe
                    ? 'border-emerald-600 bg-emerald-50/90 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      item.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : item.rank === 2
                        ? 'bg-slate-300 text-slate-900 shadow-xs'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {toPersianDigits(item.rank)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {labelFor(item.student)}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                          شما
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {studentMosque?.name} · {item.student.grade || 'دانش‌آموز'}
                    </div>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-farsi-num block">
                    {toPersianDigits(item.points)}
                  </span>
                  <span className="text-[10px] text-slate-400">امتیاز</span>
                </div>
              </div>
            );
          })}

          {displayList.length === 0 && (
            <p className="text-xs text-slate-400 py-8 text-center">
              هنوز هیچ امتیازی در این دوره ثبت نشده است.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

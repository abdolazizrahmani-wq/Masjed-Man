import React, { useState } from 'react';
import {
  Gift,
  Trophy,
  Plus,
  CheckCircle,
  Calendar,
  Building2,
  Clock,
  Award,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Reward } from '../../types';
import { toPersianDigits, getShamsiDateString } from '../../utils/jalali';
import { publicName } from '../../utils/publicName';

export const RewardsView: React.FC = () => {
  const {
    currentUser,
    rewards,
    winners,
    periods,
    addReward,
    toggleRewardWinnerDelivered,
    getVillageLeaderboard,
  } = useApp();
  const isStaffViewer = currentUser.role === 'admin' || currentUser.role === 'manager';

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [periodTitle, setPeriodTitle] = useState('آبان ماه ۱۴۰۵');
  const [description, setDescription] = useState('');
  const [prizeList, setPrizeList] = useState<string[]>([
    'یک دستگاه دوچرخه کوهستان حرفه‌ای',
    'ساعت هوشمند ورزشی ضدآب',
    'تبلت ویژه مطالعه قرآن کریم',
    'بسته ورزشی کامل با آرم دارالقرآن',
    'بن کتاب و نوشت‌افزار ۲ میلیون ریالی',
  ]);
  const [ceremonyPlace, setCeremonyPlace] = useState('مسجد ابوبکر صدیق - نماز جمعه');
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeReward = rewards.find(r => r.status === 'active') || rewards[0];
  
  const activePrizes = activeReward?.prizes && activeReward.prizes.length > 0
    ? activeReward.prizes
    : [
        { rank: 1, prizeName: activeReward?.place1Prize || 'دوچرخه' },
        { rank: 2, prizeName: activeReward?.place2Prize || 'ساعت هوشمند' },
        { rank: 3, prizeName: activeReward?.place3Prize || 'تبلت قرآنی' },
        ...(activeReward?.place4Prize ? [{ rank: 4, prizeName: activeReward.place4Prize }] : []),
        ...(activeReward?.place5Prize ? [{ rank: 5, prizeName: activeReward.place5Prize }] : []),
      ];

  const villageTop = getVillageLeaderboard().slice(0, Math.max(5, activePrizes.length));

  const handleAddPrize = () => {
    if (prizeList.length < 20) {
      setPrizeList([...prizeList, `جایزه رتبه ${toPersianDigits(prizeList.length + 1)} دارالقرآن`]);
    }
  };

  const handleRemovePrize = (index: number) => {
    if (prizeList.length > 3) {
      setPrizeList(prizeList.filter((_, idx) => idx !== index));
    }
  };

  const handleUpdatePrize = (index: number, val: string) => {
    const updated = [...prizeList];
    updated[index] = val;
    setPrizeList(updated);
  };

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dynamicPrizes = prizeList.map((p, idx) => ({
      rank: idx + 1,
      prizeName: p.trim() || `جایزه رتبه ${toPersianDigits(idx + 1)}`,
    }));

    addReward({
      periodId: `period-${Date.now()}`,
      periodTitle,
      title: title.trim(),
      description: description.trim() || 'مسابقه ماهانه دارالقرآن کنخ برای تشویق حضور در مساجد',
      place1Prize: prizeList[0] || 'دوچرخه',
      place2Prize: prizeList[1] || 'ساعت هوشمند',
      place3Prize: prizeList[2] || 'تبلت قرآنی',
      place4Prize: prizeList[3],
      place5Prize: prizeList[4],
      prizes: dynamicPrizes,
      ceremonyPlace,
      status: 'active',
    });

    setFeedback(`دوره مسابقه با موفقیت به همراه ${toPersianDigits(dynamicPrizes.length)} جایزه نفیس منتشر شد.`);
    setShowAddModal(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            جوایز و مسابقات ماهانه دارالقرآن کنخ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            اهدای هدایای نفیس به قهرمانان نماز جماعت و فعالیت‌های قرآنی در پایان هر ماه
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => {
              setTitle('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف دوره مسابقه جدید</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300">
          {feedback}
        </div>
      )}

      {/* Hero Prize Showcase */}
      {activeReward && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md inline-block w-fit">
                {activeReward.periodTitle}
              </span>
              <span className="text-xs text-amber-200 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                محل مراسم اهدا: {activeReward.ceremonyPlace}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                {activeReward.title}
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 mt-2 max-w-2xl leading-relaxed">
                {activeReward.description}
              </p>
            </div>

            {/* Dynamic Prize Tiers Cards (from 3 up to 20 prizes) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-200">
                  فهرست {toPersianDigits(activePrizes.length)} جایزه اعلام‌شده برای این دوره:
                </span>
                <span className="text-[11px] text-amber-300">
                  اهدای جوایز به {toPersianDigits(activePrizes.length)} نفر اول روستا
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2 border-t border-white/20">
                {activePrizes.map(p => (
                  <div
                    key={p.rank}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center space-y-1"
                  >
                    <span className="text-[11px] font-black text-amber-300 block">
                      {p.rank === 1 ? '🥇 نفر اول روستا' :
                       p.rank === 2 ? '🥈 نفر دوم روستا' :
                       p.rank === 3 ? '🥉 نفر سوم روستا' :
                       `🎖️ رتبه ${toPersianDigits(p.rank)}`}
                    </span>
                    <span className="text-xs font-extrabold text-white block mt-1 line-clamp-2">
                      {p.prizeName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Projected Winners for this Month */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              پیشتازان کسب جوایز ماه جاری (بر اساس امتیازات فعلی)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            برندگان قطعی در پایان ماه مشخص و اعلام خواهند شد
          </span>
        </div>

        <div className="space-y-2">
          {villageTop.map((item, idx) => {
            const matchedPrize = activePrizes.find(p => p.rank === idx + 1);
            const prizeLabel = matchedPrize ? matchedPrize.prizeName : 'هدیه تشویقی دارالقرآن کنخ';

            return (
              <div
                key={item.student.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-900'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-emerald-800 text-white'
                    }`}
                  >
                    {toPersianDigits(idx + 1)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {isStaffViewer || item.student.id === currentUser.id ? item.student.fullName : publicName(item.student.fullName)} ({item.mosqueName})
                    </h4>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                      جایزه احتمالی: {prizeLabel}
                    </span>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-farsi-num shrink-0">
                  {toPersianDigits(item.points)} امتیاز
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Winners Archive & Delivery Status */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          سوابق تحویل جوایز دوره‌های پیشین
        </h3>

        <div className="space-y-2.5">
          {winners.map(w => (
            <div
              key={w.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {isStaffViewer || w.studentId === currentUser.id ? w.studentName : publicName(w.studentName)} · {w.mosqueName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                    رتبه {toPersianDigits(w.rank)} (امتیاز: {toPersianDigits(w.points)})
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  جایزه: <strong className="text-slate-800 dark:text-slate-200">{w.prizeName}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold ${
                    w.delivered ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {w.delivered ? `تحویل داده شد ✓ (${w.deliveredAt || 'مهر ۱۴۰۵'})` : 'در انتظار مراسم اهدا'}
                </span>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => toggleRewardWinnerDelivered(w.id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
                  >
                    {w.delivered ? 'لغو وضعیت تحویل' : 'علامت تحویل شد'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                تعریف مسابقه ماهانه و جوایز
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReward} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  عنوان مسابقه: *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: مسابقه بهار قرآنی کنخ - آذر ماه ۱۴۰۵"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ماه و سال دوره:
                </label>
                <input
                  type="text"
                  value={periodTitle}
                  onChange={e => setPeriodTitle(e.target.value)}
                  placeholder="مثال: آذر ماه ۱۴۰۵"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                      تعریف جوایز نفرات برتر (از ۳ تا ۲۰ جایزه):
                    </span>
                    <span className="text-[11px] text-slate-500">
                      تعداد جوایز کنونی: {toPersianDigits(prizeList.length)} جایزه
                    </span>
                  </div>

                  {prizeList.length < 20 && (
                    <button
                      type="button"
                      onClick={handleAddPrize}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن جایزه (+)</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {prizeList.map((prize, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 w-20 shrink-0">
                        {idx === 0 ? '🥇 نفر اول:' :
                         idx === 1 ? '🥈 نفر دوم:' :
                         idx === 2 ? '🥉 نفر سوم:' :
                         `رتبه ${toPersianDigits(idx + 1)}:`}
                      </span>
                      <input
                        type="text"
                        required
                        value={prize}
                        onChange={e => handleUpdatePrize(idx, e.target.value)}
                        placeholder={`عنوان جایزه رتبه ${toPersianDigits(idx + 1)}`}
                        className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      {prizeList.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePrize(idx)}
                          title="حذف این جایزه"
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {prizeList.length < 20 ? (
                  <button
                    type="button"
                    onClick={handleAddPrize}
                    className="w-full py-2 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن جایزه برای نفر {toPersianDigits(prizeList.length + 1)} روستا (+)</span>
                  </button>
                ) : (
                  <p className="text-[11px] text-amber-600 text-center font-bold">
                    حداکثر سقف مجاز (۲۰ جایزه) تکمیل شد.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  محل و زمان اهدا:
                </label>
                <input
                  type="text"
                  value={ceremonyPlace}
                  onChange={e => setCeremonyPlace(e.target.value)}
                  placeholder="مثال: مسجد ابوبکر صدیق - نماز جمعه"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm"
                >
                  ذخیره و انتشار مسابقه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

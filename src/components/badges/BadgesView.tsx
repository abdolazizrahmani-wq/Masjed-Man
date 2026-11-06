import React from 'react';
import {
  Award,
  Star,
  CheckCircle,
  Lock,
  Sunrise,
  BookOpen,
  Trophy,
  Users,
  HeartHandshake,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, formatShamsiDateHuman } from '../../utils/jalali';

export const BadgesView: React.FC = () => {
  const { currentUser, badges, studentBadges } = useApp();

  const userEarnedMap = new Map<string, string>();
  studentBadges
    .filter(sb => sb.studentId === currentUser.id)
    .forEach(sb => userEarnedMap.set(sb.badgeId, sb.earnedAtShamsi));

  const getBadgeIcon = (iconName: string, isEarned: boolean) => {
    const props = { className: `w-6 h-6 ${isEarned ? 'text-amber-500' : 'text-slate-400'}` };
    switch (iconName) {
      case 'star':
        return <Star {...props} />;
      case 'sunrise':
        return <Sunrise {...props} />;
      case 'book-open':
        return <BookOpen {...props} />;
      case 'trophy':
        return <Trophy {...props} />;
      case 'users':
        return <Users {...props} />;
      case 'heart-handshake':
        return <HeartHandshake {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          نشان‌ها و مدال‌های افتخار
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          دستاوردها و نشان‌های معنوی برای قدردانی از استمرار، نظم در نماز صبح و حلقات قرآنی
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map(b => {
          const isEarned = userEarnedMap.has(b.id);
          const earnedDate = userEarnedMap.get(b.id);

          return (
            <div
              key={b.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                isEarned
                  ? 'bg-gradient-to-br from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-900 border-amber-300 dark:border-amber-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isEarned
                        ? 'bg-amber-100 dark:bg-amber-950/60 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {getBadgeIcon(b.icon, isEarned)}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                      isEarned
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isEarned ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>کسب شده</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>قفل</span>
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {b.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between">
                <span className="text-slate-400">شرط دریافت:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {b.criteriaText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

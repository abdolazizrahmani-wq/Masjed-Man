import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getCurrentJalali,
  getDaysInCurrentShamsiMonth,
  toPersianDigits,
  formatShamsiDateHuman,
  SHAMSI_MONTH_NAMES,
} from '../../utils/jalali';

export const AttendanceCalendar: React.FC = () => {
  const {
    currentUser,
    users,
    attendances,
    getStudentDaysAttendedMonth,
    getStudentMonthlyPoints,
  } = useApp();

  // If user is parent, show their first child
  const targetStudent =
    currentUser.role === 'parent' && currentUser.childrenIds && currentUser.childrenIds.length > 0
      ? users.find(u => u.id === currentUser.childrenIds![0]) || currentUser
      : currentUser;

  const currentJalali = getCurrentJalali();
  const [activeYear] = useState(currentJalali.jy);
  const [activeMonth] = useState(currentJalali.jm);

  const daysList = getDaysInCurrentShamsiMonth(activeYear, activeMonth);

  // Student attendances in this month
  const monthPrefix = `${activeYear}/${String(activeMonth).padStart(2, '0')}`;
  const studentMonthAttendances = attendances.filter(
    a => a.studentId === targetStudent.id && a.shamsiDate.startsWith(monthPrefix)
  );

  const [selectedDayStr, setSelectedDayStr] = useState<string>(
    `${activeYear}/${String(activeMonth).padStart(2, '0')}/${String(currentJalali.jd).padStart(2, '0')}`
  );

  const selectedDayAttendances = studentMonthAttendances.filter(
    a => a.shamsiDate === selectedDayStr
  );

  const daysAttendedSet = new Set(studentMonthAttendances.map(a => a.shamsiDate));
  const daysAttendedCount = daysAttendedSet.size;
  const monthTotalPoints = studentMonthAttendances.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          تقویم حضور و روزشمار ماهانه
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          مشاهده روزهای حضور {targetStudent.fullName} در مساجد و نمازهای جماعت در {SHAMSI_MONTH_NAMES[activeMonth - 1]} {toPersianDigits(activeYear)}
        </p>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">روزهای حضور در مسجد</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-farsi-num mt-1 block">
            {toPersianDigits(daysAttendedCount)}{' '}
            <span className="text-xs text-slate-400 font-normal">از {toPersianDigits(daysList.length)} روز</span>
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">مجموع امتیاز این ماه</span>
          <span className="text-2xl font-black text-amber-500 font-farsi-num mt-1 block">
            +{toPersianDigits(monthTotalPoints)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">درصد حضور در ماه</span>
          <span className="text-2xl font-black text-teal-600 dark:text-teal-400 font-farsi-num mt-1 block">
            {toPersianDigits(Math.round((daysAttendedCount / daysList.length) * 100))}٪
          </span>
        </div>
      </div>

      {/* Calendar Days Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span>تقویم {SHAMSI_MONTH_NAMES[activeMonth - 1]} ماه {toPersianDigits(activeYear)}</span>
          </h3>
          <span className="text-xs text-slate-400">
            برای مشاهده جزئیات روی هر روز کلیک فرمایید
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
          {daysList.map(({ day, dateStr }) => {
            const hasAttended = daysAttendedSet.has(dateStr);
            const isSelected = selectedDayStr === dateStr;
            const isToday =
              dateStr ===
              `${activeYear}/${String(activeMonth).padStart(2, '0')}/${String(currentJalali.jd).padStart(2, '0')}`;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDayStr(dateStr)}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[64px] ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 border-emerald-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                } ${
                  hasAttended
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black font-farsi-num">
                    {toPersianDigits(day)}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="امروز" />
                  )}
                </div>

                <div className="mt-1">
                  {hasAttended ? (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block bg-emerald-100/60 dark:bg-emerald-900/40 px-1 rounded">
                      حاضر ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 block">—</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>جزئیات حضور در روز: {formatShamsiDateHuman(selectedDayStr)}</span>
          </h3>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-farsi-num">
            {toPersianDigits(selectedDayAttendances.length)} برنامه ثبت‌شده
          </span>
        </div>

        <div className="space-y-2.5">
          {selectedDayAttendances.map(a => (
            <div
              key={a.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {a.activityName}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {a.attendanceMosqueName}
                      {a.isGuestAttendance && ' (مهمان)'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      ساعت: {toPersianDigits(a.realActivityTime.split(' ')[1] || '—')}
                    </span>
                    <span>·</span>
                    <span>ثبت‌کننده: {a.recordedByManagerName}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-farsi-num shrink-0">
                +{toPersianDigits(a.points)} امتیاز
              </span>
            </div>
          ))}

          {selectedDayAttendances.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              در این روز هیچ حضوری برای دانش‌آموز ثبت نشده است.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

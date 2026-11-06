import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Calendar,
  Building2,
  Check,
  AlertCircle,
  WifiOff,
  Sparkles,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, getShamsiDateString } from '../../utils/jalali';

export const AttendanceMarking: React.FC = () => {
  const {
    currentUser,
    mosques,
    activities,
    users,
    attendances,
    recordAttendanceBatch,
    isOnline,
  } = useApp();

  const defaultMosqueId = currentUser.mosqueId || mosques[0]?.id || '';
  const [selectedActivityId, setSelectedActivityId] = useState<string>(activities[0]?.id || '');
  const [selectedMosqueId, setSelectedMosqueId] = useState<string>(defaultMosqueId);
  const [selectedDate, setSelectedDate] = useState<string>(getShamsiDateString());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mosqueFilter, setMosqueFilter] = useState<string>(currentUser.role === 'admin' ? 'all' : defaultMosqueId);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedActivity = activities.find(a => a.id === selectedActivityId);
  const activeMosque = mosques.find(m => m.id === selectedMosqueId);

  // Active students filtered
  const activeStudents = users.filter(u => u.role === 'student' && u.status === 'active');
  const filteredStudents = activeStudents.filter(s => {
    const matchesMosque = mosqueFilter === 'all' || s.mosqueId === mosqueFilter;
    const matchesSearch =
      s.fullName.includes(searchQuery) ||
      (s.grade && s.grade.includes(searchQuery)) ||
      (s.school && s.school.includes(searchQuery));
    return matchesMosque && matchesSearch;
  });

  // Check if a student is already marked today for this activity
  const isAlreadyMarked = (studentId: string) => {
    if (!selectedActivity) return false;
    const existing = attendances.filter(
      a =>
        a.studentId === studentId &&
        a.activityId === selectedActivityId &&
        a.shamsiDate === selectedDate
    );
    return selectedActivity.dailyMaxTimes > 0 && existing.length >= selectedActivity.dailyMaxTimes;
  };

  const handleToggleStudent = (studentId: string) => {
    if (isAlreadyMarked(studentId)) return;

    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const validIds = filteredStudents
      .filter(s => !isAlreadyMarked(s.id))
      .map(s => s.id);

    if (selectedStudentIds.length === validIds.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(validIds);
    }
  };

  const handleSubmit = () => {
    if (selectedStudentIds.length === 0) {
      setFeedbackMessage({ type: 'error', text: 'لطفاً حداقل یک دانش‌آموز را انتخاب فرمایید.' });
      return;
    }

    const res = recordAttendanceBatch({
      studentIds: selectedStudentIds,
      activityId: selectedActivityId,
      attendanceMosqueId: selectedMosqueId,
      customShamsiDate: selectedDate,
    });

    if (res.success) {
      setFeedbackMessage({
        type: 'success',
        text: res.message + (!isOnline ? ' (در حافظه محلی ذخیره شد و پس از اتصال همگام می‌شود)' : ''),
      });
      setSelectedStudentIds([]);
      setTimeout(() => setFeedbackMessage(null), 5000);
    } else {
      setFeedbackMessage({ type: 'error', text: res.message });
    }
  };

  const calculatedPoints = (selectedActivity?.defaultPoints || 0) * selectedStudentIds.length;

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          ثبت حضور نماز جماعت و فعالیت‌های قرآنی
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          سامانه سریع ثبت حضور دانش‌آموزان در مساجد کنخ با امکان کارکرد آفلاین
        </p>
      </div>

      {/* Step 1: Activity Selector Carousel / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>۱. انتخاب نوع نماز یا برنامه:</span>
          </label>
          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 font-farsi-num">
            امتیاز هر نفر: {toPersianDigits(selectedActivity?.defaultPoints || 0)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {activities.filter(a => a.active).map(act => {
            const isSelected = act.id === selectedActivityId;
            return (
              <button
                key={act.id}
                onClick={() => {
                  setSelectedActivityId(act.id);
                  setSelectedStudentIds([]);
                }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs truncate">{act.name}</div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {act.category === 'prayer' ? 'نماز' : act.category === 'quran' ? 'قرآن' : 'ویژه'}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-farsi-num">
                    {toPersianDigits(act.defaultPoints)} امت
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Date & Venue Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mosque Venue Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>۲. مسجد محل برگزاری:</span>
          </label>
          <select
            value={selectedMosqueId}
            onChange={e => setSelectedMosqueId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {mosques.filter(m => m.active).map(m => (
              <option key={m.id} value={m.id}>
                {m.name} {m.id === defaultMosqueId ? '(مسجد شما)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>۳. تاریخ برگزاری (شمسی):</span>
          </label>
          <input
            type="text"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            placeholder="مثال: 1405/08/15"
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 font-farsi-num focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Step 3: Student Selection List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              ۴. انتخاب دانش‌آموزان حاضر ({toPersianDigits(selectedStudentIds.length)} نفر انتخاب شده)
            </h3>
          </div>

          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            {selectedStudentIds.length > 0 ? 'لغو انتخاب همه' : 'انتخاب همه افراد مجاز'}
          </button>
        </div>

        {/* Search and Mosque Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام دانش‌آموز، پایه، مدرسه..."
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={mosqueFilter}
              onChange={e => setMosqueFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">نمایش دانش‌آموزان تمام مساجد روستا</option>
              {mosques.map(m => (
                <option key={m.id} value={m.id}>
                  فقط اعضای {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto p-1">
          {filteredStudents.map(student => {
            const isSelected = selectedStudentIds.includes(student.id);
            const marked = isAlreadyMarked(student.id);
            const studentMosque = mosques.find(m => m.id === student.mosqueId);
            const isGuest = student.mosqueId !== selectedMosqueId;

            return (
              <div
                key={student.id}
                onClick={() => handleToggleStudent(student.id)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                  marked
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/20 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      marked
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        : isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {marked ? '✓' : isSelected ? '✓' : ''}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {student.fullName}
                      </span>
                      {isGuest && (
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                          مهمان
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {studentMosque?.name} · {student.grade || 'دانش‌آموز'}
                    </div>
                  </div>
                </div>

                {marked && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    قبلاً ثبت شد
                  </span>
                )}
              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              هیچ دانش‌آموزی با این مشخصات یافت نشد.
            </div>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Sticky Bottom Submit Button */}
      <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-30 px-4 max-w-4xl mx-auto pointer-events-none">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-between gap-4 pointer-events-auto">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              خلاصه حضور:
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {toPersianDigits(selectedStudentIds.length)} نفر ({selectedActivity?.name})
            </span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mr-2 font-farsi-num">
              مجموع: +{toPersianDigits(calculatedPoints)} امتیاز
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedStudentIds.length === 0}
            className={`px-6 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-md ${
              selectedStudentIds.length > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/20 active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>ثبت نهایی حضور</span>
          </button>
        </div>
      </div>
    </div>
  );
};

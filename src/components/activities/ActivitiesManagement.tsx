import React, { useState } from 'react';
import {
  Activity as ActivityIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Activity, ActivityCategory } from '../../types';
import { toPersianDigits } from '../../utils/jalali';

export const ActivitiesManagement: React.FC = () => {
  const { activities, addActivity, updateActivity, toggleActivity, deleteActivity, currentUser } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [defaultPoints, setDefaultPoints] = useState<number>(20);
  const [category, setCategory] = useState<ActivityCategory>('prayer');
  const [dailyMaxTimes, setDailyMaxTimes] = useState<number>(1);
  const [description, setDescription] = useState('');

  const openAdd = () => {
    setName('');
    setDefaultPoints(20);
    setCategory('prayer');
    setDailyMaxTimes(1);
    setDescription('');
    setShowAddModal(true);
  };

  const openEdit = (act: Activity) => {
    setEditingActivity(act);
    setName(act.name);
    setDefaultPoints(act.defaultPoints);
    setCategory(act.category);
    setDailyMaxTimes(act.dailyMaxTimes);
    setDescription(act.description || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingActivity) {
      updateActivity({
        ...editingActivity,
        name: name.trim(),
        defaultPoints: Number(defaultPoints),
        category,
        dailyMaxTimes: Number(dailyMaxTimes),
        description: description.trim(),
      });
      setFeedback(`فعالیت «${name}» با موفقیت ویرایش شد. سوابق گذشته بدون تغییر حفظ شدند.`);
      setEditingActivity(null);
    } else {
      addActivity({
        name: name.trim(),
        defaultPoints: Number(defaultPoints),
        category,
        dailyMaxTimes: Number(dailyMaxTimes),
        description: description.trim(),
        active: true,
      });
      setFeedback(`فعالیت جدید «${name}» با موفقیت اضافه شد.`);
      setShowAddModal(false);
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = () => {
    if (!deletingActivity) return;
    deleteActivity(deletingActivity.id);
    setFeedback(`فعالیت «${deletingActivity.name}» حذف شد.`);
    setDeletingActivity(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const getCategoryTitle = (cat: ActivityCategory) => {
    switch (cat) {
      case 'prayer':
        return 'نمازهای جماعت';
      case 'quran':
        return 'حلقات و فعالیت‌های قرآنی';
      case 'special':
        return 'برنامه‌های ویژه مسجد';
      case 'cultural':
        return 'فعالیت‌های فرهنگی و تربیتی';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            مدیریت فعالیت‌ها و جدول امتیازات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            تعریف، ویرایش و تنظیم امتیاز هر فعالیت (تغییر امتیاز بر سوابق ثبت‌شده گذشته تأثیری نخواهد داشت)
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف فعالیت جدید</span>
          </button>
        )}
      </div>

      {/* Immutability Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
          <strong>اصل عدم تغییر سوابق گذشته:</strong> هنگام ثبت هر حضور، امتیاز در همان لحظه در پرونده ذخیره می‌شود؛ چنانچه بعداً امتیاز پایه‌ای فعالیتی را افزایش یا کاهش دهید، امتیازات پیشین دانش‌آموزان کاملاً محفوظ و بدون تغییر می‌مانند.
        </p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300">
          {feedback}
        </div>
      )}

      {/* Activities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map(act => (
          <div
            key={act.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {act.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {getCategoryTitle(act.category)}
                    </span>
                  </div>
                  {act.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {act.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleActivity(act.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    act.active
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {act.active ? 'فعال' : 'غیرفعال'}
                </button>
              </div>

              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">امتیاز مصوب:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-black font-farsi-num">
                    +{toPersianDigits(act.defaultPoints)} امتیاز
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">سقف ثبت در روز:</span>
                  <strong className="text-slate-700 dark:text-slate-200 font-farsi-num">
                    {act.dailyMaxTimes > 0 ? `${toPersianDigits(act.dailyMaxTimes)} بار در روز` : 'بدون سقف'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Actions for Admin */}
            {currentUser.role === 'admin' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEdit(act)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>ویرایش</span>
                </button>
                <button
                  onClick={() => setDeletingActivity(act)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Add/Edit Activity */}
      {(showAddModal || editingActivity) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingActivity ? `ویرایش ${editingActivity.name}` : 'افزودن فعالیت و برنامه جدید'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingActivity(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  نام فعالیت:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: نماز وتر و تهجد"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    مقدار امتیاز:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    required
                    value={defaultPoints}
                    onChange={e => setDefaultPoints(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 font-farsi-num focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    سقف مجاز روزانه:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={dailyMaxTimes}
                    onChange={e => setDailyMaxTimes(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 font-farsi-num focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  دسته‌بندی:
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ActivityCategory)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="prayer">نمازهای جماعت</option>
                  <option value="quran">حلقات قرآن دارالقرآن</option>
                  <option value="special">برنامه‌های ویژه مسجد</option>
                  <option value="cultural">فعالیت‌های فرهنگی و تربیتی</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  توضیحات و راهنما:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="توضیحات تکمیلی پیرامون نحوه حضور..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingActivity(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm"
                >
                  {editingActivity ? 'ذخیره تغییرات' : 'افزودن فعالیت'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                تأیید حذف {deletingActivity.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                آیا از حذف این فعالیت اطمینان دارید؟ سوابق حضور گذشته مرتبط با این فعالیت در دیتابیس محفوظ خواهند ماند.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setDeletingActivity(null)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
              >
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

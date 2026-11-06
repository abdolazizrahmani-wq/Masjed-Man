import React from 'react';
import {
  Palette,
  Moon,
  Sun,
  Type,
  Sparkles,
  Check,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppTheme, FontSize } from '../../types';

export const AppearanceSettings: React.FC = () => {
  const {
    theme,
    setTheme,
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    settings,
    updateSettings,
    currentUser,
  } = useApp();

  const themes: { id: AppTheme; name: string; desc: string; colorClass: string }[] = [
    {
      id: 'emerald',
      name: 'زمردی (اصلی)',
      desc: 'سبز تیره اسلامی و سفید',
      colorClass: 'bg-emerald-700',
    },
    {
      id: 'golden',
      name: 'طلایی و کهربایی',
      desc: 'کرم و طلایی معنوی',
      colorClass: 'bg-amber-600',
    },
    {
      id: 'sky',
      name: 'آسمانی',
      desc: 'آبی نیلگون و سفید',
      colorClass: 'bg-sky-600',
    },
    {
      id: 'night',
      name: 'شبانه',
      desc: 'سرمه‌ای و تیره وقار',
      colorClass: 'bg-slate-800',
    },
    {
      id: 'classic',
      name: 'کلاسیک ملایم',
      desc: 'سبز فیروزه‌ای و روشن',
      colorClass: 'bg-teal-600',
    },
  ];

  const fontSizes: { id: FontSize; label: string; preview: string }[] = [
    { id: 'small', label: 'کوچک', preview: 'متن نمونه کوچک' },
    { id: 'medium', label: 'متوسط (پیش‌فرض)', preview: 'متن نمونه استاندارد' },
    { id: 'large', label: 'بزرگ', preview: 'متن نمونه بزرگ و واضح' },
    { id: 'xlarge', label: 'خیلی بزرگ', preview: 'متن درشت و بسیار خوانا' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          تنظیمات ظاهری و شخصی‌سازی برنامه
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          تنظیمات رنگ‌بندی، حالت شب و روز و اندازه خط برای حساب {currentUser.fullName}
        </p>
      </div>

      {/* 5 Color Themes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            ۱. انتخاب تم رنگی برنامه (۵ تم اختصاصی)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {themes.map(t => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl ${t.colorClass} shadow-xs shrink-0`} />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                      {t.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.desc}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Light / Dark Mode */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                ۲. حالت تاریک (Dark Mode)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مناسب برای استفاده شبانه در مسجد و کاهش مصرف باتری گوشی
              </p>
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              darkMode
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            {darkMode ? 'فعال (تاریک)' : 'غیرفعال (روشن)'}
          </button>
        </div>
      </div>

      {/* Font Size Scaling */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            ۳. اندازه خط و نوشته‌ها (Font Size)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {fontSizes.map(f => {
            const isSelected = fontSize === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-black'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-xs font-bold block">{f.label}</span>
                <span className="text-[10px] text-slate-400 mt-1 block truncate">
                  {f.preview}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Motivational Quotes Display Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                ۴. نمایش جملات انگیزشی روز
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                نمایش جملات کوتاه دینی و تربیتی در صفحه اصلی
              </p>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ quotesEnabled: !settings.quotesEnabled })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              settings.quotesEnabled
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {settings.quotesEnabled ? 'فعال' : 'غیرفعال'}
          </button>
        </div>
      </div>
    </div>
  );
};

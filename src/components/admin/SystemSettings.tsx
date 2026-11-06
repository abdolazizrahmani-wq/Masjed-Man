import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MotivationalQuote } from '../../types';
import { toPersianDigits, formatShamsiDateHuman } from '../../utils/jalali';

export const SystemSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    quotes,
    addQuote,
    updateQuote,
    deleteQuote,
    auditLogs,
  } = useApp();

  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteSource, setNewQuoteSource] = useState('');
  const [refPoints, setRefPoints] = useState<number>(settings.defaultReferralPoints);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;

    addQuote(newQuoteText.trim(), newQuoteSource.trim() || undefined);
    setNewQuoteText('');
    setNewQuoteSource('');
    setFeedback('جمله جدید با موفقیت اضافه شد.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveReferralPoints = () => {
    updateSettings({ defaultReferralPoints: Number(refPoints) });
    setFeedback('امتیاز پاداش دعوت دوستان به‌روزرسانی شد.');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          تنظیمات عمومی، جملات انگیزشی و گزارش نظارتی (Audit)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          تنظیم پارامترهای سراسری دارالقرآن کنخ، جملات روز و ثبت امنیتی رخدادها
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300">
          {feedback}
        </div>
      )}

      {/* Referral & QR Global Parameters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>پارامترهای پایه سیستم</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              امتیاز پاداش دعوت هر دوست (Referral Bonus):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                max={200}
                value={refPoints}
                onChange={e => setRefPoints(parseInt(e.target.value, 10))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-farsi-num w-28"
              />
              <button
                onClick={handleSaveReferralPoints}
                className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
              >
                ذخیره
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              این امتیاز پس از اولین حضور واقعی دوست دعوت‌شده در مسجد واریز می‌شود.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                وضعیت سامانه بارکد (QR Code):
              </label>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {settings.qrEnabled ? 'فعال در سراسر مساجد' : 'غیرفعال (ثبت فقط توسط مسئول)'}
              </span>
            </div>
            <button
              onClick={() => updateSettings({ qrEnabled: !settings.qrEnabled })}
              className={`px-3 py-2 rounded-xl text-xs font-bold ${
                settings.qrEnabled
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-700 text-white'
              }`}
            >
              {settings.qrEnabled ? 'غیرفعال کن' : 'فعال کن'}
            </button>
          </div>
        </div>
      </div>

      {/* Motivational Quotes Management */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            مدیریت جملات کوتاه و احادیث صفحه اصلی
          </h3>
        </div>

        {/* Add Quote Form */}
        <form onSubmit={handleAddQuote} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            required
            value={newQuoteText}
            onChange={e => setNewQuoteText(e.target.value)}
            placeholder="متن جمله انگیزشی یا حدیث..."
            className="sm:col-span-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newQuoteSource}
              onChange={e => setNewQuoteSource(e.target.value)}
              placeholder="منبع (اختیاری)"
              className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0"
            >
              افزودن
            </button>
          </div>
        </form>

        <div className="space-y-2 pt-2">
          {quotes.map(q => (
            <div
              key={q.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  «{q.text}»
                </span>
                {q.source && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 block">
                    — {q.source}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQuote({ ...q, active: !q.active })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    q.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {q.active ? 'فعال' : 'غیرفعال'}
                </button>
                <button
                  onClick={() => deleteQuote(q.id)}
                  className="p-1 text-rose-500 hover:text-rose-700"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs Viewer */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              سوابق و لاگ‌های امنیتی و مدیریتی (Audit Logs)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            ثبت غیرقابل تغییر تمام عملیات حساس
          </span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {auditLogs.map(log => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {log.action}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                    توسط: {log.performedBy} ({log.performedByRole})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {log.details}
                </p>
              </div>

              <span className="text-[10px] text-slate-400 shrink-0 font-farsi-num">
                {log.shamsiDate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

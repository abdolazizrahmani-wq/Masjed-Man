import React, { useState } from 'react';
import {
  QrCode,
  Building2,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, getShamsiDateString } from '../../utils/jalali';

export const QRCodeView: React.FC = () => {
  const {
    currentUser,
    mosques,
    settings,
    updateSettings,
    recordAttendanceBatch,
    activities,
  } = useApp();

  const [selectedMosqueId, setSelectedMosqueId] = useState<string>(
    currentUser.mosqueId || mosques[0]?.id || ''
  );
  const [scanSimulatedSuccess, setScanSimulatedSuccess] = useState<string | null>(null);

  const activeMosque = mosques.find(m => m.id === selectedMosqueId) || mosques[0];
  const isQrEnabled = settings.qrEnabled;

  const handleSimulateScan = () => {
    if (!isQrEnabled) return;

    // Simulate scanning mosque QR code and registering Fajr / current prayer
    const defaultAct = activities[0];
    const res = recordAttendanceBatch({
      studentIds: [currentUser.id],
      activityId: defaultAct.id,
      attendanceMosqueId: activeMosque.id,
      customShamsiDate: getShamsiDateString(),
    });

    if (res.success) {
      setScanSimulatedSuccess(`بارکد مسجد «${activeMosque.name}» با موفقیت اسکن شد و حضور شما در ${defaultAct.name} ثبت گردید!`);
    } else {
      setScanSimulatedSuccess(res.message);
    }

    setTimeout(() => setScanSimulatedSuccess(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          سیستم ثبت حضور هوشمند با QR Code مساجد
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          اسکن بارکد اختصاصی مساجد پنج‌گانه کنخ جهت ثبت مستقیم حضور در نمازها
        </p>
      </div>

      {/* Admin QR Control Switch */}
      {currentUser.role === 'admin' && (
        <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                کنترل فعال‌سازی قابلیت QR Code مساجد (اختیار مدیر کل)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                وضعیت کنونی سیستم: <strong className={isQrEnabled ? 'text-emerald-600' : 'text-rose-500'}>{isQrEnabled ? 'فعال و مجاز' : 'غیرفعال به صورت پیش‌فرض'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ qrEnabled: !isQrEnabled })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isQrEnabled
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isQrEnabled ? 'غیرفعال‌سازی QR Code' : 'فعال‌سازی QR Code مساجد'}
          </button>
        </div>
      )}

      {/* Notice if disabled */}
      {!isQrEnabled && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <ShieldAlert className="w-5 h-5" />
            <span>قابلیت اسکن QR Code در حال حاضر توسط دارالقرآن کنخ غیرفعال است.</span>
          </div>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            مطابق ضوابط، در صورت غیرفعال بودن این بخش، ثبت حضور توسط مسئولان مساجد به صورت دستی و با سرعت بالا انجام می‌پذیرد. تنها مدیر کل دارالقرآن صلاحیت فعال‌سازی این بخش را داراست.
          </p>
        </div>
      )}

      {scanSimulatedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300">
          {scanSimulatedSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Printable Mosque QR Code Card (for Mosque display) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              بارکد رسمی و قابل چاپ مسجد
            </h3>
            <select
              value={selectedMosqueId}
              onChange={e => setSelectedMosqueId(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            >
              {mosques.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stylized QR Code Graphic */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-emerald-500/50 inline-block mx-auto shadow-sm">
            <div className="w-48 h-48 bg-slate-950 dark:bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-white relative">
              {/* Center Islamic Emblem */}
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md mb-2">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {activeMosque.qrCodeKey}
              </span>
              <span className="text-[10px] text-slate-300 mt-1">
                {activeMosque.name} · کنخ
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            این بارکد را می‌توانید در ورودی یا تابلوی اعلانات مسجد نصب فرمایید تا دانش‌آموزان حضور خود را ثبت کنند.
          </p>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl"
          >
            چاپ بارکد مسجد
          </button>
        </div>

        {/* Student Scanner Simulation */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                دوربین اسکن بارکد (ویژه دانش‌آموزان)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هنگام ورود به مسجد، دوربین گوشی خود را مقابل بارکد نصب‌شده بگیرید تا حضور شما در نماز ثبت شود.
            </p>

            <div className="h-48 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Camera className="w-8 h-8 animate-pulse text-emerald-600" />
              <span className="text-xs font-bold">
                {isQrEnabled ? 'آماده اسکن بارکد مسجد' : 'قابلیت توسط مدیر غیرفعال است'}
              </span>
            </div>
          </div>

          <button
            onClick={handleSimulateScan}
            disabled={!isQrEnabled}
            className={`w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              isQrEnabled
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>آزمایش اسکن بارکد {activeMosque.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

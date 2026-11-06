import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  FileText,
  Eye,
  X,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord } from '../../types';
import { toPersianDigits, formatShamsiDateHuman, getShamsiDateString } from '../../utils/jalali';

export const ReportsView: React.FC = () => {
  const {
    attendances,
    mosques,
    activities,
    users,
    exportAttendanceToExcel,
  } = useApp();

  const [filterMosqueId, setFilterMosqueId] = useState<string>('all');
  const [filterActivityId, setFilterActivityId] = useState<string>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  const students = users.filter(u => u.role === 'student');

  // Filter attendances
  const filteredRecords = attendances.filter(record => {
    const matchesMosque = filterMosqueId === 'all' || record.attendanceMosqueId === filterMosqueId;
    const matchesActivity = filterActivityId === 'all' || record.activityId === filterActivityId;
    const matchesStudent = filterStudentId === 'all' || record.studentId === filterStudentId;
    const matchesFrom = !filterDateFrom || record.shamsiDate >= filterDateFrom;
    const matchesTo = !filterDateTo || record.shamsiDate <= filterDateTo;

    return matchesMosque && matchesActivity && matchesStudent && matchesFrom && matchesTo;
  });

  const totalPoints = filteredRecords.reduce((sum, r) => sum + r.points, 0);

  const generatePrintableHtml = () => {
    const activeMosque = mosques.find(m => m.id === filterMosqueId);
    const mosqueTitle = activeMosque ? activeMosque.name : 'تمامی مساجد پنج‌گانه کنخ';

    const tableRows = filteredRecords
      .map(
        (r, idx) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${r.studentName}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${r.attendanceMosqueName} ${r.isGuestAttendance ? '(مهمان)' : ''}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${r.activityName}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${r.shamsiDate}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #047857;">+${r.points}</td>
      </tr>
    `
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>گزارش رسمی دارالقرآن کنخ - ${getShamsiDateString()}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;800;900&display=swap');
    body {
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.6;
    }
    @page {
      size: A4;
      margin: 15mm;
    }
    .header {
      border-bottom: 3px double #065f46;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    .title {
      text-align: center;
      margin: 10px 0 4px;
      font-size: 20px;
      font-weight: 900;
      color: #064e3b;
    }
    .subtitle {
      text-align: center;
      font-size: 12px;
      color: #475569;
    }
    .meta-box {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 16px;
      margin-bottom: 16px;
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 30px;
    }
    th {
      background: #065f46;
      color: #ffffff;
      padding: 9px 10px;
      text-align: right;
      font-weight: 800;
    }
    th.center {
      text-align: center;
    }
    .signatures {
      display: flex;
      justify-content: space-around;
      margin-top: 40px;
      page-break-inside: avoid;
    }
    .sig-block {
      text-align: center;
      font-size: 12px;
      width: 200px;
    }
    .sig-title {
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 45px;
    }
    .sig-name {
      font-weight: bold;
      color: #334155;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <div>سامانه هوشمند «مسجد من»</div>
      <div style="font-weight: bold; font-size: 13px; color: #1e293b;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      <div>تاریخ گزارش: ${getShamsiDateString()}</div>
    </div>
    <div class="title">گزارش رسمی حضور و فعالیت‌های قرآنی دارالقرآن کنخ</div>
    <div class="subtitle">روستای کنخ · بخش مهران · شهرستان بندر لنگه · استان هرمزگان</div>
  </div>

  <div class="meta-box">
    <div><strong>محدوده مسجد:</strong> ${mosqueTitle}</div>
    <div><strong>تعداد رکوردها:</strong> ${filteredRecords.length} فقره</div>
    <div><strong>مجموع امتیازات کسب‌شده:</strong> ${totalPoints} امتیاز</div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="center" style="width: 40px;">ردیف</th>
        <th>نام و نام خانوادگی دانش‌آموز</th>
        <th>مسجد محل حضور</th>
        <th>عنوان فعالیت / نماز</th>
        <th class="center">تاریخ شمسی</th>
        <th class="center">امتیاز</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-title">مهر و امضای مسئول مسجد</div>
      <div class="sig-name">...................................................</div>
    </div>
    <div class="sig-block">
      <div class="sig-title">مهر و امضای مدیر کل دارالقرآن کنخ</div>
      <div class="sig-name">استاد ابوطالب هدایتیان</div>
    </div>
  </div>

  <script>
    // Auto-trigger print when opened as standalone page
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;
  };

  const handleDownloadHtmlPdf = () => {
    const htmlContent = generatePrintableHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gozaresh_DarolQuran_Kankh_${getShamsiDateString().replace(/\//g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenPrintWindow = () => {
    const htmlContent = generatePrintableHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const newWin = window.open(url, '_blank');
    if (!newWin) {
      // Fallback if popups are blocked: download the file
      handleDownloadHtmlPdf();
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Non-print Header & Filter Controls */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              گزارش‌ها و خروجی‌های آماری دارالقرآن کنخ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              فیلتر پیشرفته بر اساس مسجد، دانش‌آموز، فعالیت و تاریخ با قابلیت دریافت فایل Excel و چاپ رسمی PDF
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportAttendanceToExcel(filteredRecords)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>خروجی اکسل (Excel)</span>
            </button>

            <button
              onClick={() => setShowPdfModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>پیش‌نمایش سند PDF</span>
            </button>

            <button
              onClick={handleDownloadHtmlPdf}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل چاپی (PDF)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>فیلترهای گزارش:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">مسجد:</label>
              <select
                value={filterMosqueId}
                onChange={e => setFilterMosqueId(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">تمام مساجد روستای کنخ</option>
                {mosques.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">نوع برنامه / نماز:</label>
              <select
                value={filterActivityId}
                onChange={e => setFilterActivityId(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">تمام فعالیت‌ها و نمازها</option>
                {activities.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">دانش‌آموز خاص:</label>
              <select
                value={filterStudentId}
                onChange={e => setFilterStudentId(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">همه دانش‌آموزان</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({mosques.find(m => m.id === s.mosqueId)?.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">عملیات:</label>
              <button
                onClick={() => {
                  setFilterMosqueId('all');
                  setFilterActivityId('all');
                  setFilterStudentId('all');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}
                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>
        </div>

        {/* 2 Summary KPI Cards */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">تعداد رکوردهای منطبق</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-farsi-num mt-1 block">
              {toPersianDigits(filteredRecords.length)} مورد
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">مجموع کل امتیازات مکتسبه</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-farsi-num mt-1 block">
              +{toPersianDigits(totalPoints)} امتیاز
            </span>
          </div>
        </div>
      </div>

      {/* Printable Report Canvas (Formally Styled with Headers, Watermark, Islamic Frame) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Official Letterhead */}
        <div className="border-b-2 border-emerald-800 pb-4 text-center space-y-1.5 relative">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>سامانه هوشمند «مسجد من»</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            <span>تاریخ چاپ: {getShamsiDateString()}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-emerald-900 dark:text-emerald-300">
            گزارش رسمی حضور و فعالیت‌های قرآنی دارالقرآن کنخ
          </h2>
          <p className="text-xs text-slate-500">
            روستای کنخ · شهرستان بندرلنگه · استان هرمزگان
          </p>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <th className="py-2.5 px-3 font-extrabold">ردیف</th>
                <th className="py-2.5 px-3 font-extrabold">نام دانش‌آموز</th>
                <th className="py-2.5 px-3 font-extrabold">مسجد محل حضور</th>
                <th className="py-2.5 px-3 font-extrabold">نوع برنامه</th>
                <th className="py-2.5 px-3 font-extrabold text-center">تاریخ</th>
                <th className="py-2.5 px-3 font-extrabold text-center">امتیاز</th>
                <th className="py-2.5 px-3 font-extrabold text-center">وضعیت همگام‌سازی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-farsi-num text-slate-400">
                    {toPersianDigits(idx + 1)}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                    {r.studentName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                    {r.attendanceMosqueName} {r.isGuestAttendance && '(مهمان)'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">
                    {r.activityName}
                  </td>
                  <td className="py-2.5 px-3 text-center font-farsi-num text-slate-600 dark:text-slate-300">
                    {r.shamsiDate}
                  </td>
                  <td className="py-2.5 px-3 text-center font-black font-farsi-num text-emerald-600 dark:text-emerald-400">
                    +{toPersianDigits(r.points)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.syncStatus === 'synced'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {r.syncStatus === 'synced' ? 'همگام' : 'در صف آفلاین'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Printable Official Signature Blocks */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-center text-xs text-slate-600 dark:text-slate-300">
          <div>
            <span className="font-bold block">مهر و امضای مسئول مسجد</span>
            <span className="text-[11px] text-slate-400 mt-8 block">...................................................</span>
          </div>

          <div>
            <span className="font-bold block">مهر و امضای مدیر کل دارالقرآن کنخ</span>
            <span className="text-[11px] text-slate-400 mt-8 block">استاد ابوطالب هدایتیان</span>
          </div>
        </div>
      </div>

      {/* Interactive PDF & Print Preview Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in text-right">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Modal Actions Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    پیش‌نمایش سند رسمی چاپی / PDF دارالقرآن کنخ
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    قالب استاندارد قطع A4 جهت چاپ یا ذخیره PDF
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadHtmlPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل (HTML / PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPrintWindow}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ در صفحه جدید</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Sheet Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
              <div className="bg-white text-slate-900 w-full max-w-2xl p-8 rounded-2xl shadow-lg border border-slate-200 space-y-6 text-xs font-sans">
                {/* Official Letterhead */}
                <div className="border-b-2 border-emerald-800 pb-4 text-center space-y-1 relative">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>سامانه هوشمند «مسجد من»</span>
                    <span className="font-bold text-slate-800">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
                    <span>تاریخ: {getShamsiDateString()}</span>
                  </div>
                  <h2 className="text-lg font-black text-emerald-900 mt-2">
                    گزارش رسمی حضور و فعالیت‌های قرآنی دارالقرآن کنخ
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    روستای کنخ · بخش مهران · شهرستان بندرلنگه · استان هرمزگان
                  </p>
                </div>

                {/* Summary Metadata */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <strong>مسجد:</strong> {filterMosqueId === 'all' ? 'تمام مساجد کنخ' : mosques.find(m => m.id === filterMosqueId)?.name}
                  </div>
                  <div>
                    <strong>تعداد موارد:</strong> {toPersianDigits(filteredRecords.length)} فقره
                  </div>
                  <div>
                    <strong>مجموع امتیازات:</strong> <span className="font-bold text-emerald-700">+{toPersianDigits(totalPoints)}</span>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-emerald-800 text-white">
                        <th className="p-2 text-center w-10">ردیف</th>
                        <th className="p-2">نام دانش‌آموز</th>
                        <th className="p-2">مسجد</th>
                        <th className="p-2">نوع برنامه</th>
                        <th className="p-2 text-center">تاریخ شمسی</th>
                        <th className="p-2 text-center">امتیاز</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredRecords.slice(0, 30).map((r, idx) => (
                        <tr key={r.id}>
                          <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2 font-bold">{r.studentName}</td>
                          <td className="p-2">{r.attendanceMosqueName}</td>
                          <td className="p-2">{r.activityName}</td>
                          <td className="p-2 text-center font-mono">{r.shamsiDate}</td>
                          <td className="p-2 text-center font-bold text-emerald-700">+{r.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredRecords.length > 30 && (
                    <div className="text-center text-[10px] text-slate-400 py-2">
                      (نمایش ۳۰ ردیف اول در پیش‌نمایش · در فایل دانلودی تمام {toPersianDigits(filteredRecords.length)} ردیف موجود است)
                    </div>
                  )}
                </div>

                {/* Signatures */}
                <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <span className="font-bold block text-slate-700">مهر و امضای مسئول مسجد</span>
                    <span className="text-[11px] text-slate-400 mt-6 block">...................................................</span>
                  </div>

                  <div>
                    <span className="font-bold block text-slate-700">مهر و امضای مدیر کل دارالقرآن کنخ</span>
                    <span className="text-xs font-bold text-slate-900 mt-6 block">استاد ابوطالب هدایتیان</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Modal Bar */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                این سند دارای شماره رهگیری و مورد تأیید دارالقرآن کنخ می‌باشد.
              </span>
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

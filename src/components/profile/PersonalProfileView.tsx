import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  BookOpen,
  KeyRound,
  Palette,
  Moon,
  Sun,
  Type,
  LogOut,
  Save,
  Check,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppTheme, FontSize } from '../../types';
import { toEnglishDigits, toPersianDigits } from '../../utils/jalali';

export const PersonalProfileView: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    mosques,
    theme,
    setTheme,
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    logout,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [fatherName, setFatherName] = useState(currentUser.fatherName || '');
  const [nationalCode, setNationalCode] = useState(currentUser.nationalCode || currentUser.username);
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [parentPhone, setParentPhone] = useState(currentUser.parentPhone || '');
  const [grade, setGrade] = useState(currentUser.grade || '');
  const [school, setSchool] = useState(currentUser.school || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatarUrl || 'avatar-dome');

  // Change password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback('حجم تصویر بیش از ۵ مگابایت است. لطفاً عکس کوچک‌تری انتخاب نمایید.');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(dataUrl);
          setFeedback('عکس شخصی با موفقیت بارگذاری شد. جهت ذخیره، دکمه ذخیره تغییرات را بزنید.');
          setTimeout(() => setFeedback(null), 4000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const avatarsList = [
    { id: 'avatar-dome', label: 'گنبد مسجد', icon: '🕌' },
    { id: 'avatar-minaret', label: 'مناره نور', icon: '🕋' },
    { id: 'avatar-quran', label: 'قرآن کریم', icon: '📖' },
    { id: 'avatar-star', label: 'ستاره ایمان', icon: '⭐' },
    { id: 'avatar-moon', label: 'هلال ماه', icon: '🌙' },
    { id: 'avatar-student-boy1', label: 'دانش‌آموز ۱', icon: '👦' },
    { id: 'avatar-student-boy2', label: 'دانش‌آموز ۲', icon: '🧑' },
    { id: 'avatar-parent', label: 'ولی و بزرگتر', icon: '🧔' },
  ];

  const themes: { id: AppTheme; name: string; colorClass: string }[] = [
    { id: 'emerald', name: 'زمردی (اصلی)', colorClass: 'bg-emerald-700' },
    { id: 'golden', name: 'طلایی و کرم', colorClass: 'bg-amber-600' },
    { id: 'sky', name: 'آسمانی', colorClass: 'bg-sky-600' },
    { id: 'night', name: 'شبانه', colorClass: 'bg-slate-800' },
    { id: 'classic', name: 'کلاسیک', colorClass: 'bg-teal-600' },
  ];

  const fontSizes: { id: FontSize; label: string }[] = [
    { id: 'small', label: 'کوچک' },
    { id: 'medium', label: 'متوسط' },
    { id: 'large', label: 'بزرگ' },
    { id: 'xlarge', label: 'خیلی بزرگ' },
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    if (newPassword && !/^\d{8}$/.test(toEnglishDigits(newPassword.trim()))) {
      setFeedback('رمز عبور باید دقیقاً ۸ رقم (عدد) باشد.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setFeedback('رمز عبور جدید با تکرار آن یکسان نمی‌باشد.');
      return;
    }

    const res = await updateUserProfile({
      fullName: fullName.trim(),
      fatherName: fatherName.trim(),
      nationalCode: nationalCode.trim(),
      email: email.trim(),
      phone: phone.trim(),
      parentPhone: parentPhone.trim(),
      grade: grade.trim(),
      school: school.trim(),
      bio: bio.trim(),
      avatarUrl: avatar,
      ...(newPassword ? { password: newPassword.trim() } : {}),
    });

    setFeedback(
      res.success && newPassword
        ? 'مشخصات پروفایل و رمز عبور با موفقیت به‌روزرسانی شد.'
        : res.message
    );
    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدیر کل دارالقرآن کنخ';
      case 'manager':
        return 'مسئول مسجد';
      case 'student':
        return 'دانش‌آموز';
      case 'parent':
        return 'ولی دانش‌آموز';
      default:
        return 'کاربر';
    }
  };

  const currentMosque = mosques.find(m => m.id === currentUser.mosqueId);

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-4xl mx-auto text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            پروفایل شخصی و تنظیمات حساب
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ویرایش اطلاعات فردی، شماره‌های تماس، ایمیل بازیابی رمز و تم ظاهری
          </p>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>خروج از حساب</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300">
          {feedback}
        </div>
      )}

      {/* Hero Profile Overview Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-white/10 border-2 border-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-lg shrink-0">
            {avatar.startsWith('data:image') || avatar.startsWith('http') ? (
              <img src={avatar} alt="پروفایل" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">{avatarsList.find(a => a.id === avatar)?.icon || '🕌'}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                {currentUser.fullName}
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600/60 text-emerald-200 border border-emerald-400/30">
                {getRoleTitle(currentUser.role)}
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-1">
              کد ملی: <span className="font-mono">{currentUser.nationalCode}</span> · کد معرف: <span className="font-mono text-amber-300">{currentUser.referralCode}</span>
            </p>
            {currentMosque && (
              <span className="text-[11px] text-emerald-200 mt-1 block">
                عضو رسمی {currentMosque.name} · روستای کنخ
              </span>
            )}
          </div>
        </div>

        {/* High-visibility Logout button right in hero overview */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-950/40 transition-all active:scale-95 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>خروج از حساب کاربری</span>
        </button>
      </div>

      {/* Avatar & Photo Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>تصویر پروفایل شخصی یا نماد آواتار:</span>
        </h3>

        {/* Personal Photo Uploader */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {avatar.startsWith('data:image') || avatar.startsWith('http') ? (
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0">
                <img src={avatar} alt="عکس شخصی" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                <Camera className="w-6 h-6" />
              </div>
            )}
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                {avatar.startsWith('data:image') || avatar.startsWith('http')
                  ? 'عکس شخصی شما فعال است'
                  : 'بارگذاری عکس شخصی (از گالری گوشی یا دوربین)'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                می‌توانید تصویر چهره خود را آپلود کنید (بهینه‌سازی خودکار اندازه)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>{avatar.startsWith('data:image') || avatar.startsWith('http') ? 'تغییر عکس شخصی' : 'انتخاب عکس از گوشی'}</span>
            </button>

            {(avatar.startsWith('data:image') || avatar.startsWith('http')) && (
              <button
                type="button"
                onClick={() => setAvatar('avatar-dome')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-xs font-bold transition-colors"
                title="حذف عکس و بازگشت به آواتارها"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف عکس</span>
              </button>
            )}
          </div>
        </div>

        {/* Preset Islamic & Student Avatars */}
        <div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
            یا انتخاب از نمادهای مذهبی و قرآنی:
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {avatarsList.map(item => {
              const isSelected = avatar === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAvatar(item.id)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>مشخصات فردی و تحصیلی:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                نام و نام خانوادگی: *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                نام پدر:
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={e => setFatherName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                کد ملی (۱۰ رقم - نام کاربری):
              </label>
              <input
                type="text"
                value={nationalCode}
                onChange={e => setNationalCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                نشانی ایمیل (جهت بازیابی رمز عبور): *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                شماره تماس دانش‌آموز:
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="09170000000"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-left"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                شماره تماس ولی:
              </label>
              <input
                type="tel"
                value={parentPhone}
                onChange={e => setParentPhone(e.target.value)}
                placeholder="09170000000"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-left"
              />
            </div>

            {currentUser.role === 'student' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    پایه تحصیلی:
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    placeholder="مثال: پایه هشتم"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نام مدرسه در کنخ:
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={e => setSchool(e.target.value)}
                    placeholder="مثال: مدرسه شهید کنخی"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                یادداشت شخصی و معرفی (Bio):
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="علاقه‌مندی‌ها، جزء‌های حفظ‌شده، یا سخن دل..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>تغییر رمز عبور شخصی (۸ رقمی):</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                رمز عبور جدید (دقیقاً ۸ رقم):
              </label>
              <input
                type="password"
                maxLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="۸ رقم جدید"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                تکرار رمز عبور جدید:
              </label>
              <input
                type="password"
                maxLength={8}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="تکرار ۸ رقم"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Integrated Appearance Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            <span>تنظیمات ظاهری و تم رنگی اختصاصی شما:</span>
          </h3>

          <div className="space-y-4">
            {/* Color themes */}
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-2">تم رنگی برنامه:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {themes.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${
                      theme === t.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${t.colorClass}`} />
                    <span className="text-xs text-slate-800 dark:text-slate-200">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dark mode & font size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">حالت شب و روز:</span>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    darkMode ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {darkMode ? 'حالت شب (تاریک)' : 'حالت روز (روشن)'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">اندازه قلم:</span>
                <div className="flex items-center gap-1">
                  {fontSizes.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontSize(f.id)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        fontSize === f.id
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره تمامی تغییرات پروفایل</span>
          </button>
        </div>
      </form>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              خروج از حساب کاربری
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              آیا مایل به خروج از حساب کاربری خود هستید؟ پس از خروج، مجدداً با کد ملی و رمز عبور وارد خواهید شد.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
              >
                خروج قطعی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

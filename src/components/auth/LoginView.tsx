import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Mail,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isValidEmail, isValidNationalCode, isValidPassword, isValidPhone, normalizeDigits } from '../../utils/validators';

export const LoginView: React.FC = () => {
  const { login, requestPasswordReset, registerStudent, mosques } = useApp();

  const [nationalCode, setNationalCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmailOrId, setForgotEmailOrId] = useState('');
  const [forgotFeedback, setForgotFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Direct registration modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regFatherName, setRegFatherName] = useState('');
  const [regNationalCode, setRegNationalCode] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMosqueId, setRegMosqueId] = useState(mosques[0]?.id || '');
  const [regGrade, setRegGrade] = useState('پایه هفتم');
  const [regSchool, setRegSchool] = useState('مدرسه کنخ');
  const [regPassword, setRegPassword] = useState('');
  const [regFeedback, setRegFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regConsent, setRegConsent] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nationalCode.trim()) {
      setErrorMessage('لطفاً کد ملی خود را وارد نمایید.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('لطفاً رمز عبور ۸ رقمی خود را وارد نمایید.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(nationalCode, password);
      if (!res.success) {
        setErrorMessage(res.message || 'کد ملی یا رمز عبور اشتباه است.');
      }
    } catch {
      setErrorMessage('ورود با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmailOrId.trim()) return;

    const res = requestPasswordReset(forgotEmailOrId);
    setForgotFeedback({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegFeedback(null);

    if (!regFullName.trim()) {
      setRegFeedback({ ok: false, text: 'لطفاً نام و نام خانوادگی را وارد فرمایید.' });
      return;
    }
    if (!isValidNationalCode(regNationalCode)) {
      setRegFeedback({ ok: false, text: 'کد ملی واردشده معتبر نیست. ۱۰ رقم صحیح وارد کنید.' });
      return;
    }
    if (!isValidPassword(regPassword)) {
      setRegFeedback({ ok: false, text: 'رمز ورود باید دقیقاً ۸ رقم (عدد) باشد.' });
      return;
    }
    if (!isValidEmail(regEmail)) {
      setRegFeedback({ ok: false, text: 'نشانی ایمیل معتبر نیست.' });
      return;
    }
    if (!regConsent) {
      setRegFeedback({ ok: false, text: 'برای ثبت‌نام، رضایت ولی/سرپرست لازم است. کادر تأیید را علامت بزنید.' });
      return;
    }
    if (!isValidPhone(regPhone)) {
      setRegFeedback({ ok: false, text: 'شماره تماس معتبر نیست (مثال: 09170000000).' });
      return;
    }

    setIsRegistering(true);
    try {
      const code = normalizeDigits(regNationalCode);
      const res = await registerStudent({
        fullName: regFullName.trim(),
        fatherName: regFatherName.trim(),
        nationalCode: code,
        username: code,
        password: normalizeDigits(regPassword),
        email: regEmail.trim() || undefined,
        phone: normalizeDigits(regPhone) || undefined,
        role: 'student',
        mosqueId: regMosqueId,
        grade: regGrade,
        school: regSchool,
      });

      setRegFeedback({ ok: res.success, text: res.message });
      if (res.success) {
        setTimeout(() => {
          setShowRegisterModal(false);
          setNationalCode(code);
          setPassword('');
          setRegPassword('');
          setRegFullName('');
          setRegFatherName('');
          setRegNationalCode('');
          setRegPhone('');
          setRegEmail('');
          setRegConsent(false);
        }, 2500);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-600 selection:text-white">
      {/* Decorative ambient lights */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6 animate-fade-in">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 mx-auto shadow-xl shadow-emerald-900/40">
            <div className="w-full h-full bg-emerald-950 rounded-[22px] flex items-center justify-center text-amber-300">
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C10.5 4 8 6 8 9C8 10.6 9 12 10.5 12.7V22H13.5V12.7C15 12 16 10.6 16 9C16 6 13.5 4 12 2M4 14V22H7V14.8C5.8 15.3 5 16.5 5 18H4M17 14.8V22H20V14C19 14 18.2 15.3 17 14.8Z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            سامانه مسجد من
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
              دارالقرآن کنخ
            </span>
            <span className="text-xs text-slate-400">
              روستای کنخ · هرمزگان
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            مدیر دارالقرآن: استاد ابوطالب هدایتیان
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 dark:border-slate-800 shadow-2xl space-y-5">
          <div className="text-right border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              ورود به سامانه
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              کد ملی (نام کاربری) و رمز ورود ۸ رقمی خود را وارد فرمایید:
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-right">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                کد ملی (نام کاربری):
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="username"
                  value={nationalCode}
                  onChange={e => setNationalCode(e.target.value)}
                  placeholder="مثال: 3480011223"
                  className="w-full pr-10 pl-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  رمز ورود (۸ رقمی):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotFeedback(null);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  فراموشی رمز عبور؟
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={12}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="رمز ۸ رقمی"
                  className="w-full pr-10 pl-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'در حال بررسی...' : 'ورود به حساب کاربری'}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">حساب کاربری ندارید؟</span>
            <button
              onClick={() => {
                setRegFeedback(null);
                setShowRegisterModal(true);
              }}
              className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ثبت‌نام دانش‌آموز جدید</span>
            </button>
          </div>
        </div>


      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                <span>درخواست بازیابی رمز عبور</span>
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ایمیل یا کد ملی ثبت‌شده خود را وارد کنید تا درخواست شما برای مدیر دارالقرآن ثبت شود. مدیر پس از بررسی، رمز موقت جدید را به شما اعلام می‌کند:
            </p>

            {forgotFeedback && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold ${
                  forgotFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                }`}
              >
                <p>{forgotFeedback.text}</p>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="text"
                required
                value={forgotEmailOrId}
                onChange={e => setForgotEmailOrId(e.target.value)}
                placeholder="نشانی ایمیل یا کد ملی شما..."
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                dir="ltr"
              />

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  بستن
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm"
                >
                  ثبت درخواست بازیابی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Student Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                ثبت‌نام مستقیم دانش‌آموز در دارالقرآن کنخ
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {regFeedback && (
              <div
                role="alert"
                className={`p-3.5 rounded-2xl text-xs font-bold border ${
                  regFeedback.ok
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300'
                }`}
              >
                {regFeedback.text}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نام و نام خانوادگی: *
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="مثال: سلمان کنخی"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نام پدر:
                  </label>
                  <input
                    type="text"
                    value={regFatherName}
                    onChange={e => setRegFatherName(e.target.value)}
                    placeholder="مثال: یوسف"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    کد ملی (۱۰ رقم - نام کاربری): *
                  </label>
                  <input
                    type="text"
                    required
                    value={regNationalCode}
                    onChange={e => setRegNationalCode(e.target.value)}
                    placeholder="مثال: 3480099881"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    رمز ورود شخصی (۸ رقم): *
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    autoComplete="new-password"
                    maxLength={8}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="مثال: 14050000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ایمیل (جهت بازیابی رمز عبور):
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    شماره تماس (اختیاری):
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="09170000000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-left"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  مسجد اصلی در روستای کنخ:
                </label>
                <select
                  value={regMosqueId}
                  onChange={e => setRegMosqueId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {mosques.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  checked={regConsent}
                  onChange={e => setRegConsent(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  تأیید می‌کنم که ولی/سرپرست دانش‌آموز از ثبت اطلاعات او (نام، کد ملی، مسجد و حضورها) در این سامانه آگاه است و
                  رضایت دارد. نام دانش‌آموز در جدول رتبه‌بندی برای دیگران به‌صورت کوتاه‌شده نمایش داده می‌شود.
                </span>
              </label>

              <p className="text-[11px] text-slate-400">
                عضویت پس از ثبت‌نام، با تأیید مسئول مسجد فعال خواهد شد.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl shadow-sm"
                >
                  {isRegistering ? 'در حال ثبت...' : 'ثبت‌نام در سامانه'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { KeyRound, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isValidEmail, isValidNationalCode, isValidPassword } from '../../utils/validators';

/** Shown only on a brand-new install (no users yet): creates the real administrator. */
export const SetupView: React.FC = () => {
  const { createFirstAdmin } = useApp();

  const [fullName, setFullName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError('نام و نام خانوادگی را وارد کنید.');
    if (!isValidNationalCode(nationalCode)) return setError('کد ملی معتبر نیست. ۱۰ رقم صحیح وارد کنید.');
    if (!isValidEmail(email)) return setError('نشانی ایمیل معتبر نیست.');
    if (!isValidPassword(password)) return setError('رمز ورود باید دقیقاً ۸ رقم (عدد) باشد.');
    if (password !== confirm) return setError('رمز و تکرار آن یکسان نیستند.');

    setBusy(true);
    try {
      const res = await createFirstAdmin({ fullName, nationalCode, password, email });
      if (!res.success) setError(res.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full pr-10 pl-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-emerald-700 mx-auto flex items-center justify-center text-amber-300 shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">راه‌اندازی سامانه «مسجد من»</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            این اولین اجراست. حساب مدیر کل را بسازید؛ بعد از آن می‌توانید مساجد، مسئولان و دانش‌آموزان را اضافه کنید.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 border border-white/20 dark:border-slate-800 shadow-2xl space-y-4 text-right"
        >
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              نام و نام خانوادگی مدیر:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              <input className={inputClass} value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              کد ملی (نام کاربری ورود):
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              <input
                className={`${inputClass} font-mono`}
                inputMode="numeric"
                autoComplete="username"
                value={nationalCode}
                onChange={e => setNationalCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              ایمیل (اختیاری):
            </label>
            <input
              type="email"
              dir="ltr"
              className="w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">رمز ۸ رقمی:</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={8}
                  className={`${inputClass} font-mono`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">تکرار رمز:</label>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={8}
                className="w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-extrabold text-sm shadow-lg transition-all"
          >
            {busy ? 'در حال ساخت...' : 'ساخت حساب مدیر و ورود'}
          </button>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            رمز را جایی امن یادداشت کنید. اگر فراموش شود، بدون سرور راه بازیابی ندارد.
          </p>
        </form>
      </div>
    </div>
  );
};

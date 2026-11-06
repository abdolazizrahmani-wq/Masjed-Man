import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Sliders,
  Award,
  Clock,
  History,
  Phone,
  BookOpen,
  Edit2,
  Trash2,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { toPersianDigits, formatShamsiDateHuman } from '../../utils/jalali';
import { generateTempPassword } from '../../utils/password';
import { isValidNationalCode, isValidPassword, normalizeDigits } from '../../utils/validators';

export const StudentsManagement: React.FC = () => {
  const {
    users,
    mosques,
    transactions,
    currentUser,
    approveStudentRegistration,
    registerStudent,
    adminResetPassword,
    updateUser,
    deleteUser,
    transferStudentMosque,
    adjustStudentPoints,
    getStudentMonthlyPoints,
    getStudentTotalPoints,
  } = useApp();

  const [roleFilter, setRoleFilter] = useState<string>('student');
  const [mosqueFilter, setMosqueFilter] = useState<string>(
    currentUser.role === 'manager' && currentUser.mosqueId ? currentUser.mosqueId : 'all'
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [transferringUser, setTransferringUser] = useState<User | null>(null);
  const [newMosqueId, setNewMosqueId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('');

  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [resetInfo, setResetInfo] = useState<{ name: string; password: string; message: string } | null>(null);

  // Form state for new student / user
  const [formFullName, setFormFullName] = useState('');
  const [formFatherName, setFormFatherName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formMosqueId, setFormMosqueId] = useState<string>(mosques[0]?.id || '');
  const [formNationalCode, setFormNationalCode] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formGrade, setFormGrade] = useState('پایه هفتم');
  const [formSchool, setFormSchool] = useState('مدرسه کنخ');
  const [formReferralInput, setFormReferralInput] = useState('');

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesMosque = mosqueFilter === 'all' || u.mosqueId === mosqueFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesSearch =
      u.fullName.includes(searchQuery) ||
      u.username.includes(searchQuery) ||
      (u.nationalCode && u.nationalCode.includes(searchQuery)) ||
      (u.fatherName && u.fatherName.includes(searchQuery)) ||
      (u.referralCode && u.referralCode.includes(searchQuery));

    return matchesRole && matchesMosque && matchesStatus && matchesSearch;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) return;

    const typedCode = normalizeDigits(formNationalCode);
    if (typedCode && !isValidNationalCode(typedCode)) {
      setFeedback('کد ملی واردشده معتبر نیست. ۱۰ رقم صحیح وارد کنید یا فیلد را خالی بگذارید.');
      setTimeout(() => setFeedback(null), 5000);
      return;
    }
    const typedPassword = normalizeDigits(formPassword);
    if (typedPassword && !isValidPassword(typedPassword)) {
      setFeedback('رمز ورود باید دقیقاً ۸ رقم (عدد) باشد یا فیلد را خالی بگذارید.');
      setTimeout(() => setFeedback(null), 5000);
      return;
    }

    // Auto-generate a unique internal code when none is typed (no real national code available)
    let finalNationalCode = typedCode;
    if (!finalNationalCode) {
      do {
        finalNationalCode = `348${Math.floor(1000000 + Math.random() * 9000000)}`;
      } while (users.some(u => u.nationalCode === finalNationalCode || u.username === finalNationalCode));
    }
    const generatedPassword = typedPassword ? null : generateTempPassword();
    const finalPassword = typedPassword || (generatedPassword as string);

    const res = await registerStudent(
      {
        fullName: formFullName.trim(),
        fatherName: formFatherName.trim(),
        username: formUsername.trim() || finalNationalCode,
        nationalCode: finalNationalCode,
        password: finalPassword,
        role: formRole,
        mosqueId: formMosqueId,
        phone: formPhone.trim() || undefined,
        parentPhone: formParentPhone.trim() || undefined,
        grade: formGrade,
        school: formSchool,
      },
      formReferralInput
    );

    if (res.success && generatedPassword) {
      // The auto-generated password is shown exactly once, so it is never lost.
      setResetInfo({
        name: formFullName.trim(),
        password: generatedPassword,
        message: `کاربر ساخته شد. کد ملی/نام کاربری: ${finalNationalCode}`,
      });
    } else {
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 4000);
    }

    if (res.success) {
      setShowAddModal(false);
      setFormNationalCode('');
      setFormPassword('');
    }
  };

  const handleResetPassword = async (u: User) => {
    if (!window.confirm(`رمز ورود «${u.fullName}» بازنشانی و یک رمز موقت جدید ساخته شود؟`)) return;
    const res = await adminResetPassword(u.id);
    if (res.success && res.newPassword) {
      setResetInfo({ name: u.fullName, password: res.newPassword, message: res.message });
    } else {
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringUser || !newMosqueId) return;

    transferStudentMosque(transferringUser.id, newMosqueId, transferReason || 'تغییر محل سکونت یا درخواست ولی');
    setFeedback(`دانش‌آموز ${transferringUser.fullName} با موفقیت به مسجد جدید منتقل شد.`);
    setTransferringUser(null);
    setTransferReason('');
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAdjustPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser || !adjustReason.trim()) {
      setFeedback('ذکر دلیل برای تغییر امتیاز اجباری است.');
      setTimeout(() => setFeedback(null), 4000);
      return;
    }
    if (!Number.isFinite(Number(adjustAmount)) || Number(adjustAmount) === 0) {
      setFeedback('مقدار تعدیل امتیاز باید عددی غیر از صفر باشد.');
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    adjustStudentPoints(adjustingUser.id, Number(adjustAmount), adjustReason.trim());
    setFeedback(`امتیاز دانش‌آموز ${adjustingUser.fullName} به میزان ${toPersianDigits(adjustAmount)} تعدیل گردید.`);
    setAdjustingUser(null);
    setAdjustReason('');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            مدیریت کاربران، دانش‌آموزان و اولیا
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ثبت‌نام جدید، تأیید اعضا، انتقال بین مساجد کنخ و تعدیل امتیاز با ثبت سوابق
          </p>
        </div>

        <button
          onClick={() => {
            setFormFullName('');
            setFormFatherName('');
            setFormUsername('');
            setFormPhone('');
            setFormParentPhone('');
            setFormReferralInput('');
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>ثبت‌نام کاربر جدید</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300">
          {feedback}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام، کد معرف..."
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="all">تمام نقش‌ها</option>
              <option value="student">دانش‌آموزان</option>
              <option value="manager">مسئولان مساجد</option>
              <option value="parent">اولیا و والدین</option>
              <option value="admin">مدیران کل</option>
            </select>
          </div>

          {/* Mosque Filter */}
          <div>
            <select
              value={mosqueFilter}
              onChange={e => setMosqueFilter(e.target.value)}
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

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="pending">در انتظار تأیید</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-2.5">
        {filteredUsers.map(u => {
          const userMosque = mosques.find(m => m.id === u.mosqueId);
          const monthlyPts = getStudentMonthlyPoints(u.id);
          const totalPts = getStudentTotalPoints(u.id);

          return (
            <div
              key={u.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-sm shrink-0">
                  {u.fullName.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {u.fullName}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        u.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {u.status === 'pending' ? 'در انتظار تأیید' : 'فعال'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      کد: {u.referralCode}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span>{userMosque ? userMosque.name : 'بدون مسجد'}</span>
                    <span>·</span>
                    <span>پدر: {u.fatherName || '—'}</span>
                    {u.grade && (
                      <>
                        <span>·</span>
                        <span>{u.grade}</span>
                      </>
                    )}
                    {u.phone && (
                      <>
                        <span>·</span>
                        <span className="font-farsi-num">{toPersianDigits(u.phone)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Points */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                {u.role === 'student' && (
                  <div className="text-left shrink-0">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-farsi-num block">
                      {toPersianDigits(monthlyPts)} امتیاز ماه
                    </span>
                    <span className="text-[10px] text-slate-400 font-farsi-num">
                      کل: {toPersianDigits(totalPts)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  {u.status === 'pending' && (
                    <button
                      onClick={() => approveStudentRegistration(u.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>تأیید</span>
                    </button>
                  )}

                  {u.id !== currentUser.id &&
                    (currentUser.role === 'admin' ||
                      (currentUser.role === 'manager' && u.role === 'student' && u.mosqueId === currentUser.mosqueId)) && (
                      <button
                        onClick={() => handleResetPassword(u)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="بازنشانی رمز عبور (ساخت رمز موقت)"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    )}

                  {u.role === 'student' && (
                    <>
                      <button
                        onClick={() => {
                          setTransferringUser(u);
                          setNewMosqueId(u.mosqueId || mosques[0]?.id || '');
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="انتقال به مسجد دیگر"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setAdjustingUser(u);
                            setAdjustAmount(15);
                            setAdjustReason('');
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="تعدیل یا تغییر امتیاز با ذکر دلیل"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => setInspectingUser(u)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="سوابق امتیازات"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-xs text-slate-400">
            هیچ کاربری با شرایط جستجو یافت نشد.
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                ثبت‌نام کاربر / دانش‌آموز جدید
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نام و نام خانوادگی: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={e => setFormFullName(e.target.value)}
                    placeholder="مثال: علی احمدی"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نام پدر:
                  </label>
                  <input
                    type="text"
                    value={formFatherName}
                    onChange={e => setFormFatherName(e.target.value)}
                    placeholder="مثال: محمد"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    کد ملی ۱۰ رقمی (نام کاربری جهت ورود):
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formNationalCode}
                    onChange={e => setFormNationalCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="مثال: 3480011223 (یا خالی برای خودکار)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    رمز ورود ۸ رقمی:
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="مثال: 14051001 (یا خالی برای خودکار)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نام کاربری مستعار (اختیاری):
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    placeholder="مثال: ali_ahmadi"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نقش کاربری:
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="student">دانش‌آموز</option>
                    <option value="parent">ولی دانش‌آموز</option>
                    {currentUser.role === 'admin' && <option value="manager">مسئول مسجد</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  مسجد اصلی در روستای کنخ:
                </label>
                <select
                  value={formMosqueId}
                  onChange={e => setFormMosqueId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {mosques.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {formRole === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      پایه تحصیلی:
                    </label>
                    <input
                      type="text"
                      value={formGrade}
                      onChange={e => setFormGrade(e.target.value)}
                      placeholder="مثال: پایه هشتم"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      نام مدرسه:
                    </label>
                    <input
                      type="text"
                      value={formSchool}
                      onChange={e => setFormSchool(e.target.value)}
                      placeholder="مثال: مدرسه شهید کنخی"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    شماره تماس (اختیاری):
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="مثال: 09171234567"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    کد معرف / دعوت‌کننده (اختیاری):
                  </label>
                  <input
                    type="text"
                    value={formReferralInput}
                    onChange={e => setFormReferralInput(e.target.value)}
                    placeholder="مثال: KAN-7011"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono uppercase text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm"
                >
                  ثبت کاربر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Mosque Modal */}
      {transferringUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                انتقال دانش‌آموز {transferringUser.fullName}
              </h3>
              <button
                onClick={() => setTransferringUser(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  مسجد مقصد در روستای کنخ:
                </label>
                <select
                  value={newMosqueId}
                  onChange={e => setNewMosqueId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {mosques.map(m => (
                    <option key={m.id} value={m.id} disabled={m.id === transferringUser.mosqueId}>
                      {m.name} {m.id === transferringUser.mosqueId ? '(مسجد کنونی)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  دلیل انتقال (جهت ثبت در سوابق):
                </label>
                <textarea
                  rows={2}
                  required
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="مثال: تغییر محل سکونت به محله ساحلی یا تقاضای کتبی ولی"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                ✓ تمام سوابق و امتیازات قبلی دانش‌آموز حفظ خواهد شد.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferringUser(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm"
                >
                  تأیید انتقال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Points Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                تعدیل امتیاز {adjustingUser.fullName}
              </h3>
              <button
                onClick={() => setAdjustingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustPoints} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  میزان تغییر امتیاز (مثبت برای افزایش تشویقی، منفی برای کسر):
                </label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-slate-800 dark:text-slate-200 font-farsi-num"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  دلیل تغییر امتیاز (اجباری - ثبت در سوابق مدیریتی): *
                </label>
                <textarea
                  rows={2}
                  required
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="مثال: پاداش حفظ سوره واقعه در دارالقرآن کنخ"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm"
                >
                  ثبت تعدیل امتیاز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect User Points History Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  سوابق امتیازات: {inspectingUser.fullName}
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-farsi-num">
                  مجموع: {toPersianDigits(getStudentTotalPoints(inspectingUser.id))} امتیاز
                </span>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {transactions
                .filter(t => t.studentId === inspectingUser.id)
                .map(t => (
                  <div
                    key={t.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {t.reason}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {formatShamsiDateHuman(t.shamsiDate)} · ثبت: {t.performedBy}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-black font-farsi-num ${
                        t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                      }`}
                    >
                      {t.amount >= 0 ? `+${toPersianDigits(t.amount)}` : toPersianDigits(t.amount)} امتیاز
                    </span>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setInspectingUser(null)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* One-time temporary password */}
      {resetInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-right">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <span>رمز موقت {resetInfo.name}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{resetInfo.message}</p>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-center">
              <span className="text-[10px] text-slate-500 block mb-1">این رمز فقط همین یک بار نمایش داده می‌شود:</span>
              <strong dir="ltr" className="text-xl font-mono font-black tracking-widest text-emerald-700 dark:text-emerald-300 select-text">
                {resetInfo.password}
              </strong>
            </div>
            <button
              onClick={() => setResetInfo(null)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
            >
              رمز را یادداشت کردم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

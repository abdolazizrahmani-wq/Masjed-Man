import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  MapPin,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Mosque } from '../../types';
import { toPersianDigits } from '../../utils/jalali';

export const MosquesManagement: React.FC = () => {
  const {
    mosques,
    users,
    attendances,
    addMosque,
    updateMosque,
    toggleMosqueActive,
    deleteMosque,
    currentUser,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMosque, setEditingMosque] = useState<Mosque | null>(null);
  const [deletingMosque, setDeletingMosque] = useState<Mosque | null>(null);
  const [selectedMosqueStudents, setSelectedMosqueStudents] = useState<Mosque | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formManagerName, setFormManagerName] = useState('');
  const [formManagerId, setFormManagerId] = useState('');

  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  const openAdd = () => {
    setFormName('');
    setFormAddress('روستای کنخ');
    setFormManagerName(managers[0]?.fullName || 'کاکا محمد عبداللهی');
    setFormManagerId(managers[0]?.id || '');
    setShowAddModal(true);
  };

  const openEdit = (m: Mosque) => {
    setEditingMosque(m);
    setFormName(m.name);
    setFormAddress(m.address || 'روستای کنخ');
    setFormManagerName(m.managerName);
    setFormManagerId(m.managerId);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const finalManagerName = formManagerName.trim() || 'مسئول مسجد کنخ';
    let finalManagerId = formManagerId;
    const matchedMgr = managers.find(m => m.fullName === finalManagerName);
    if (matchedMgr) {
      finalManagerId = matchedMgr.id;
    } else if (!finalManagerId) {
      finalManagerId = `mgr-${Date.now()}`;
    }

    if (editingMosque) {
      updateMosque({
        ...editingMosque,
        name: formName.trim(),
        address: formAddress.trim(),
        managerName: finalManagerName,
        managerId: finalManagerId,
      });
      setFeedback(`اطلاعات مسجد «${formName}» با نام مسئول «${finalManagerName}» به‌روزرسانی شد.`);
      setEditingMosque(null);
    } else {
      addMosque({
        name: formName.trim(),
        village: 'کنخ',
        address: formAddress.trim(),
        managerName: finalManagerName,
        managerId: finalManagerId,
        active: true,
      });
      setFeedback(`مسجد جدید «${formName}» با مسئول «${finalManagerName}» با موفقیت افزوده شد.`);
      setShowAddModal(false);
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = () => {
    if (!deletingMosque) return;
    const res = deleteMosque(deletingMosque.id);
    setFeedback(res.message);
    setDeletingMosque(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            مدیریت مساجد روستای کنخ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            تعریف مساجد جدید، انتصاب مسئولان، تنظیم آدرس و نظارت بر اعضای مساجد پنج‌گانه
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن مسجد جدید</span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          {feedback}
        </div>
      )}

      {/* Mosques Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mosques.map(mosque => {
          const studentCount = users.filter(u => u.mosqueId === mosque.id && u.role === 'student').length;
          const attendanceCount = attendances.filter(a => a.attendanceMosqueId === mosque.id).length;

          return (
            <div
              key={mosque.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {mosque.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {mosque.address || 'روستای کنخ'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleMosqueActive(mosque.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      mosque.active
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {mosque.active ? 'فعال' : 'غیرفعال'}
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">مسئول مسجد:</span>
                    <strong className="text-slate-800 dark:text-slate-100">{mosque.managerName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">دانش‌آموزان عضو:</span>
                    <strong className="font-farsi-num">{toPersianDigits(studentCount)} نفر</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">حضورهای ثبت‌شده:</span>
                    <strong className="font-farsi-num text-emerald-600 dark:text-emerald-400">
                      {toPersianDigits(attendanceCount)} مورد
                    </strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedMosqueStudents(mosque)}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>مشاهده اعضا</span>
                </button>

                {currentUser.role === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(mosque)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="ویرایش اطلاعات مسجد"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingMosque(mosque)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="حذف مسجد"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingMosque) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingMosque ? `ویرایش ${editingMosque.name}` : 'افزودن مسجد جدید به دارالقرآن کنخ'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMosque(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  نام مسجد:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="مثال: مسجد بلال حبشی"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  آدرس و موقعیت در روستا:
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  placeholder="مثال: روستای کنخ، خیابان ساحلی"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  نام و نام خانوادگی مسئول مسجد (قابل ویرایش مستقیم): *
                </label>
                <input
                  type="text"
                  required
                  value={formManagerName}
                  onChange={e => setFormManagerName(e.target.value)}
                  placeholder="مثال: کاکا محمد عبداللهی یا نام مسئول جدید"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>یا انتخاب سریع از لیست:</span>
                  <select
                    value={managers.some(m => m.fullName === formManagerName) ? formManagerName : ''}
                    onChange={e => {
                      if (e.target.value) {
                        setFormManagerName(e.target.value);
                        const mgr = managers.find(m => m.fullName === e.target.value);
                        if (mgr) setFormManagerId(mgr.id);
                      }
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                  >
                    <option value="">(انتخاب مسئول ثبت‌شده)</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.fullName}>
                        {m.fullName} ({m.role === 'admin' ? 'مدیر دارالقرآن' : 'مسئول مسجد'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMosque(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm"
                >
                  {editingMosque ? 'ذخیره تغییرات' : 'افزودن مسجد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMosque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                تأیید حذف {deletingMosque.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                آیا از حذف این مسجد اطمینان دارید؟ در صورت وجود دانش‌آموزان عضو، ابتدا باید آنان را به مسجد دیگری منتقل فرمایید.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setDeletingMosque(null)}
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

      {/* Mosque Students Drawer / Modal */}
      {selectedMosqueStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  دانش‌آموزان عضو {selectedMosqueStudents.name}
                </h3>
                <span className="text-xs text-slate-400">
                  مسئول: {selectedMosqueStudents.managerName}
                </span>
              </div>
              <button
                onClick={() => setSelectedMosqueStudents(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {users
                .filter(u => u.mosqueId === selectedMosqueStudents.id && u.role === 'student')
                .map(std => (
                  <div
                    key={std.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        {std.fullName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {std.grade || 'دانش‌آموز'} · پدر: {std.fatherName || '—'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 font-farsi-num">
                      کد: {std.referralCode}
                    </span>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setSelectedMosqueStudents(null)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

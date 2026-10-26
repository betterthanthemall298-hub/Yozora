import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { StoreSection } from '../types';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  X,
  Package,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

export const AdminSectionsManager: React.FC = () => {
  const {
    sections,
    products,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    resetSectionsToDefault,
    openDeleteModal
  } = useStore();

  // New section form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit section modal/inline state
  const [editingSection, setEditingSection] = useState<StoreSection | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editActive, setEditActive] = useState(true);

  // Calculate product counts per section
  const getProductCountForSection = (secId: string) => {
    return products.filter((p) => {
      if (p.sectionId) return p.sectionId === secId;
      // Fallback: untagged products default to 'ready_prints'
      return secId === 'ready_prints';
    }).length;
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      await addSection({
        name: newName.trim(),
        subtitle: newSubtitle.trim() || undefined,
        badge: newBadge.trim() || undefined,
        order: sections.length,
        active: true
      });
      setNewName('');
      setNewSubtitle('');
      setNewBadge('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Error creating section:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (sec: StoreSection) => {
    setEditingSection(sec);
    setEditName(sec.name);
    setEditSubtitle(sec.subtitle || '');
    setEditBadge(sec.badge || '');
    setEditActive(sec.active !== false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editName.trim()) return;

    try {
      await updateSection(editingSection.id, {
        name: editName.trim(),
        subtitle: editSubtitle.trim() || undefined,
        badge: editBadge.trim() || undefined,
        active: editActive
      });
      setEditingSection(null);
    } catch (err) {
      console.error('Error updating section:', err);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const items = [...sections];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    await reorderSections(items);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= sections.length - 1) return;
    const items = [...sections];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    await reorderSections(items);
  };

  const handleDelete = (sec: StoreSection) => {
    const count = getProductCountForSection(sec.id);
    openDeleteModal({
      title: 'تأكيد حذف القسم',
      description:
        count > 0
          ? `هذا القسم يحتوي على (${count}) قطع هودي. عند حذفه ستتحول هذه القطع تلقائياً إلى قسم الطبعات الجاهزة.`
          : 'هل أنت متأكد من رغبتك في حذف هذا القسم؟ لن يظهر في واجهة المتجر بعد الآن.',
      itemLabel: sec.name,
      onConfirm: async () => {
        await deleteSection(sec.id);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-stone-900 border border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Layers className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-stone-100">
              إدارة أقسام المتجر (Store Sections)
            </h3>
          </div>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            تحكم في تنظيم وعرض تشكيلة الهوديز. يمكنك إضافة أقسام مخصصة، تعديل المسميات والشارات، وترتيب ظهورها على الصفحة الرئيسية بسهولة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة قسم جديد</span>
          </button>

          <button
            type="button"
            onClick={() => {
              openDeleteModal({
                title: 'استعادة الأقسام الافتراضية',
                description:
                  'سيتم إعادة ضبط الأقسام إلى الترتيب الأساسي: «الطبعات الجاهزة» أولاً ثم «الطبعات الخاصة» ثانياً.',
                itemLabel: 'الأقسام الافتراضية',
                onConfirm: async () => {
                  await resetSectionsToDefault();
                }
              });
            }}
            className="px-3.5 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="إعادة التعيين إلى الطبعات الجاهزة والخاصة"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
            <span>استعادة الافتراضي</span>
          </button>
        </div>
      </div>

      {/* Info Notice about fixed and dynamic sections */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-stone-300 text-xs flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-400">هيكل الصفحة الرئيسية الثابت والديناميكي:</p>
          <p className="text-stone-400 text-[11px] leading-relaxed">
            • <strong>الجزء الثابت العلوي:</strong> سلايدر المنتجات المميزة (Hero Coverflow).<br />
            • <strong>الأقسام التفاعلية في المنتصف:</strong> تبدأ بـ <strong>«الطبعات الجاهزة»</strong> ثم <strong>«الطبعات الخاصة»</strong> ثم أي أقسام إضافية تنشئها مرتبة حسب اختيارك.<br />
            • <strong>الجزء الثابت السفلي:</strong> قسم «قريباً» ومعرض «آراء العملاء المصورة».
          </p>
        </div>
      </div>

      {/* Add New Section Modal / Expandable Card */}
      {showAddForm && (
        <form
          onSubmit={handleCreateSection}
          className="p-5 rounded-2xl bg-stone-950 border border-amber-500/30 shadow-xl space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>إضافة قسم جديد للمتجر</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-stone-300 font-medium mb-1">
                اسم القسم <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: طبعات الشتاء الحصرية"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 font-medium mb-1">
                الشارة الترويجية (Badge - اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: خصم 20% أو إصدار محدود"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs text-stone-300 font-medium mb-1">
                الوصف الترويجي القصير (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: تشكيلة فاخرة مجهزة بأعلى دقة طباعة وتطريز"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newName.trim()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ القسم'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((sec, index) => {
          const productCount = getProductCountForSection(sec.id);
          const isTopDefault = sec.id === 'ready_prints';
          const isSecondDefault = sec.id === 'custom_prints';

          return (
            <div
              key={sec.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                sec.active !== false
                  ? 'bg-stone-950/90 border-stone-800 hover:border-stone-700'
                  : 'bg-stone-950/40 border-stone-900 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Section Details */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-xs font-black text-amber-400 shrink-0 mt-0.5">
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-stone-100">
                        {sec.name}
                      </h4>

                      {sec.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black">
                          {sec.badge}
                        </span>
                      )}

                      {isTopDefault && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-stone-400 text-[10px]">
                          القسم العلوي الافتراضي
                        </span>
                      )}

                      {isSecondDefault && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-stone-400 text-[10px]">
                          القسم الثاني الافتراضي
                        </span>
                      )}

                      {sec.active === false && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>مخفي من المتجر</span>
                        </span>
                      )}
                    </div>

                    {sec.subtitle && (
                      <p className="text-xs text-stone-400 mt-1 max-w-xl">
                        {sec.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-stone-400">
                      <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                        <Package className="w-3.5 h-3.5" />
                        <span>{productCount} قطع هودي مسجلة في هذا القسم</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controls (Move Up/Down, Toggle, Edit, Delete) */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {/* Move Up */}
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title="تحريك لأعلى"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sections.length - 1}
                    className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title="تحريك لأسفل"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => updateSection(sec.id, { active: sec.active === false })}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      sec.active !== false
                        ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-amber-400'
                        : 'bg-rose-950/40 border-rose-900/60 text-rose-400'
                    }`}
                    title={sec.active !== false ? 'إخفاء القسم من المتجر' : 'إظهار القسم في المتجر'}
                  >
                    {sec.active !== false ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(sec)}
                    className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title="تعديل بيانات القسم"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(sec)}
                    className="p-2 rounded-xl bg-stone-900 hover:bg-rose-950/50 border border-stone-800 hover:border-rose-800/60 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="حذف القسم"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h4 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                <span>تعديل القسم: {editingSection.name}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">
                  اسم القسم <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">
                  الشارة الترويجية (Badge)
                </label>
                <input
                  type="text"
                  placeholder="مثال: الأكثر مبيعاً أو جديد"
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">
                  الوصف الترويجي
                </label>
                <textarea
                  rows={2}
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  id="edit-section-active"
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-800 bg-stone-950 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="edit-section-active" className="text-xs text-stone-300 cursor-pointer">
                  تفعيل القسم وإظهاره في المتجر
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={!editName.trim()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

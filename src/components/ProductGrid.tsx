import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ProductCard } from './ProductCard';
import { HoodieSize, Product, StoreSection } from '../types';
import { isComingSoon } from '../utils/product';
import { Sparkles, Layers, Search, PlusCircle, ArrowDown } from 'lucide-react';
import { INITIAL_SECTIONS } from '../data/initialData';

export const ProductGrid: React.FC = () => {
  const {
    products,
    sections: storedSections,
    searchQuery,
    setSearchQuery,
    selectedSizeFilter,
    setSelectedSizeFilter,
    isAdminLoggedIn,
    setActiveView
  } = useStore();

  // Ensure sections array is valid and sorted by order
  const activeSections: StoreSection[] = useMemo(() => {
    const raw = Array.isArray(storedSections) && storedSections.length > 0 ? storedSections : INITIAL_SECTIONS;
    return raw
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [storedSections]);

  // Filter products by search and size (excluding coming soon items)
  const availableProducts = useMemo(() => {
    return products.filter((p) => {
      if (isComingSoon(p)) return false;

      // Size Filter
      if (selectedSizeFilter !== 'ALL') {
        const stock = p.sizesStock[selectedSizeFilter] || 0;
        if (stock <= 0) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSubtitle = (p.subtitle || '').toLowerCase().includes(query);
        const matchDesc = (p.description || '').toLowerCase().includes(query);
        if (!matchName && !matchSubtitle && !matchDesc) return false;
      }

      return true;
    });
  }, [products, selectedSizeFilter, searchQuery]);

  // Group products by section
  const sectionProductsMap = useMemo(() => {
    const map = new Map<string, Product[]>();
    const defaultSectionId = activeSections[0]?.id || 'ready_prints';

    // Initialize all active sections
    activeSections.forEach((sec) => map.set(sec.id, []));

    // Place each product in its section
    availableProducts.forEach((p) => {
      let targetSectionId = p.sectionId;

      // Fallback matching if sectionId isn't explicitly set
      if (!targetSectionId || !map.has(targetSectionId)) {
        targetSectionId = defaultSectionId;
      }

      if (map.has(targetSectionId)) {
        map.get(targetSectionId)!.push(p);
      } else if (map.has(defaultSectionId)) {
        map.get(defaultSectionId)!.push(p);
      }
    });

    return map;
  }, [availableProducts, activeSections]);

  const totalMatchingProducts = availableProducts.length;

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`store-section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="hoodies-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Sections Quick Filter / Jump Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-stone-800/60">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-stone-400 shrink-0 ml-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>الأقسام:</span>
          </span>
          {activeSections.map((sec, idx) => {
            const count = sectionProductsMap.get(sec.id)?.length || 0;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 bg-stone-900 border border-stone-800 text-stone-200 hover:border-amber-500/50 hover:text-amber-400 active:scale-95"
              >
                <span>{sec.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-400">
                  {count}
                </span>
                {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>
            );
          })}
        </div>

        {/* Size Filters */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-stone-400 ml-1">المقاس:</span>
          {(['ALL', 'M', 'L', 'XL', '2XL'] as (HoodieSize | 'ALL')[]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSizeFilter(size)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedSizeFilter === size
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {size === 'ALL' ? 'الكل' : size}
            </button>
          ))}
        </div>
      </div>

      {/* When search active but zero products found across all sections */}
      {searchQuery.trim() !== '' && totalMatchingProducts === 0 ? (
        <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-12 text-center text-stone-400 space-y-4 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-center mx-auto text-amber-500">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-200">لا توجد نتائج مطابقة لبحثك</h3>
            <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
              لم نعثر على أي هودي يطابق &quot;{searchQuery}&quot; في أي من الأقسام.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedSizeFilter('ALL');
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-black hover:bg-amber-400 transition-transform active:scale-95 cursor-pointer shadow-lg"
          >
            إعادة تعيين البحث
          </button>
        </div>
      ) : (
        /* Render Each Section in Order */
        <div className="space-y-16 sm:space-y-20">
          {activeSections.map((section, index) => {
            const sectionProducts = sectionProductsMap.get(section.id) || [];
            const isFirst = index === 0;

            return (
              <section
                key={section.id}
                id={`store-section-${section.id}`}
                className="scroll-mt-24 transition-all"
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isFirst
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                            : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {section.badge || (isFirst ? 'جاهز للشحن' : 'إصدار حصري')}
                      </span>
                      <span className="text-xs font-bold text-stone-400">
                        ({sectionProducts.length} {sectionProducts.length === 1 ? 'قطعة' : 'قطع'})
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight flex items-center gap-3">
                      <span>{section.name}</span>
                    </h2>

                    {section.subtitle && (
                      <p className="text-xs sm:text-sm text-stone-400 mt-1.5 max-w-2xl leading-relaxed">
                        {section.subtitle}
                      </p>
                    )}
                  </div>

                  {sectionProducts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-amber-400 transition-colors"
                    >
                      <span>تصفح قطع القسم</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Products Grid for this section */}
                {sectionProducts.length === 0 ? (
                  <div className="bg-stone-900/30 border border-stone-800/80 rounded-2xl p-8 sm:p-10 text-center text-stone-400">
                    <div className="w-12 h-12 rounded-xl bg-stone-800/50 border border-stone-700/40 flex items-center justify-center mx-auto text-amber-400 mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-stone-200">
                      قريباً في قسم «{section.name}»
                    </h4>
                    <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      نعمل حالياً على تجهيز أحدث القطع والتصاميم الحصرية لهذا القسم. ترقبوا الإطلاق قريباً.
                    </p>
                    {isAdminLoggedIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('admin');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>إضافة هودي لهذا القسم الآن</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {sectionProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {/* Elegant separator if not the last section */}
                {index < activeSections.length - 1 && (
                  <div className="mt-14 sm:mt-18 pt-6 border-b border-stone-800/60" />
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

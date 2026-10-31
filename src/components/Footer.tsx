import React from 'react';
import { useStore } from '../store/useStore';
import {
  Lock,
  ArrowUp,
  Instagram,
  ShoppingBag
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, settings } = useStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const storeInitial = (settings.storeName || 'B').trim().charAt(0).toUpperCase();

  return (
    <footer className="bg-stone-950 border-t border-stone-800/80 pt-12 pb-8 text-stone-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-stone-800/80">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {settings.brandLogo ? (
                <div className="h-9 flex items-center justify-center">
                  <img
                    src={settings.brandLogo}
                    alt={settings.storeName || 'Brand Logo'}
                    className="max-h-9 max-w-[120px] object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-600/40 flex items-center justify-center">
                  <span className="font-serif font-black text-amber-400 text-lg">{storeInitial}</span>
                </div>
              )}
              <span className="text-lg font-black text-stone-100 tracking-wider">
                {settings.storeName || 'Yozora Hoodies'}
              </span>
            </div>
            <p className="text-stone-400 text-xs max-w-sm leading-relaxed">
              علامة تجارية متخصصة في صناعة أفخر أنواع الهوديز من القطن المصري الخالص بأعلى معايير الجودة والتصميم العصري.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-200 text-sm">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('home');
                    scrollToTop();
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('catalog');
                    scrollToTop();
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  التشكيلة الكاملة
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('cart');
                    scrollToTop();
                  }}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>سلة المشتريات</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('tracking');
                    scrollToTop();
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  تتبع طلبك
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('reviews');
                    scrollToTop();
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  آراء وتجارب المشترين
                </button>
              </li>
              <li className="pt-2">
                <button
                  id="footer-admin-login-btn"
                  type="button"
                  onClick={() => {
                    setActiveView('admin');
                    scrollToTop();
                  }}
                  className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>دخول الإدارة</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Centered Social Media Section */}
        <div className="py-8 border-b border-stone-800/80 flex flex-col items-center justify-center text-center">
          <span className="text-xs sm:text-sm font-bold text-stone-200 mb-3 tracking-wide">
            تابعنا على منصات التواصل الاجتماعي
          </span>
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {/* Instagram */}
            <a
              id="footer-social-instagram"
              href={settings.instagramUrl || 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-2xl bg-stone-900 border border-stone-800 hover:border-rose-600/70 hover:bg-rose-950/40 text-stone-300 hover:text-rose-400 flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-105"
              title="إنستغرام"
            >
              <Instagram className="w-5 h-5" />
            </a>

            {/* TikTok */}
            <a
              id="footer-social-tiktok"
              href={settings.tiktokUrl || 'https://tiktok.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-2xl bg-stone-900 border border-stone-800 hover:border-cyan-600/70 hover:bg-cyan-950/40 text-stone-300 hover:text-cyan-400 flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-105"
              title="تيك توك"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.28 6.28 0 0 0 1.87-4.47V8.52a8.27 8.27 0 0 0 4.9 1.62V6.69z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
          <p>© 2026 جميع الحقوق محفوظة لمتجر (Yozora Hoodies). صُمم بكل فخر في مصر.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1 hover:text-stone-300 transition-colors"
          >
            <span>للأعلى</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

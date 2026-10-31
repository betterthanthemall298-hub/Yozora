import React from 'react';
import { useStore } from '../store/useStore';

export const FloatingWhatsAppButton: React.FC = () => {
  const { settings } = useStore();

  const rawWaNumber = settings.whatsappNumber || '01000000000';
  const cleanWaDigits = rawWaNumber.replace(/[^0-9]/g, '');
  const waPhone = cleanWaDigits.startsWith('20')
    ? cleanWaDigits
    : '20' + cleanWaDigits.replace(/^0+/, '');

  const defaultGreeting = encodeURIComponent(
    `مرحباً ${settings.storeName || 'Yozora'}! أود الاستفسار عن الهوديز والمنتجات المتوفرة.`
  );

  // Always prefer direct phone API so that the prefilled text is never dropped by WhatsApp shortlinks
  const whatsappHref = waPhone
    ? `https://api.whatsapp.com/send?phone=${waPhone}&text=${defaultGreeting}`
    : (settings.whatsappUrl || 'https://wa.me');

  return (
    <aside aria-label="محادثة واتساب المباشرة">
      <a
        id="floating-whatsapp-btn"
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا عبر واتساب"
        title="تواصل معنا عبر واتساب"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[90] flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white shadow-xl shadow-emerald-950/60 border-2 border-white/20 transition-all duration-300 hover:scale-105 group select-none cursor-pointer"
      >
        {/* Official WhatsApp SVG Icon */}
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow relative z-10 transition-transform group-hover:scale-105"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>

        {/* Hover Label for Desktop */}
        <span className="hidden md:group-hover:flex absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-stone-900/95 text-stone-100 text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-700/80 shadow-xl pointer-events-none items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200">
          <span>تواصل معنا عبر واتساب</span>
          <span className="w-2 h-2 rounded-full bg-[#25D366]" />
        </span>
      </a>
    </aside>
  );
};

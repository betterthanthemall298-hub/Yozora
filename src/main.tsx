import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { triggerNewOrderNotification } from './lib/notifications';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Yozora Uncaught Error:', error, errorInfo);
    // If a dynamic import failed due to network / reload, auto-reload once to self-heal
    if (
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('dynamically imported module')
    ) {
      const reloadedKey = 'yozora_chunk_reload_' + window.location.pathname;
      if (!sessionStorage.getItem(reloadedKey)) {
        sessionStorage.setItem(reloadedKey, '1');
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    try {
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center font-['Cairo',system-ui,sans-serif]" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
            <span className="text-2xl font-black text-amber-500 tracking-wider">YOZORA</span>
          </div>
          <h1 className="text-xl font-bold text-stone-100 mb-2">تعذر تحميل متجر يوزورا (Yozora) حالياً</h1>
          <p className="text-sm text-stone-400 max-w-sm mb-6 leading-relaxed">
            حدث خطأ غير متوقع أثناء معالجة الصفحة، يرجى إعادة تحميل الصفحة للمتابعة.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            إعادة تحميل المتجر
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Handle Vite dynamic import errors globally
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    window.location.reload();
  });
}

// Register Service Worker for Mobile Notifications & Background Support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Yozora Service Worker registered:', reg.scope);
        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn('Yozora Service Worker registration failed:', err);
      });
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NEW_ORDER_PUSH_RECEIVED') {
      const payload = event.data.payload || {};
      triggerNewOrderNotification(
        payload.orderNumber || '101',
        payload.customerName || 'عميل جديد',
        payload.total || 0,
        payload.governorate,
        payload.itemsCount,
        payload.itemsSummary
      );
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);

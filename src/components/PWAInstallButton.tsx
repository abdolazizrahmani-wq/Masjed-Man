import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) return null;

  // Chromium / Android
  if (deferredPrompt) {
    return (
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        <span>نصب برنامه روی گوشی</span>
      </button>
    );
  }

  // iOS Safari
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>نصب در آیفون</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  راهنمای نصب «مسجد من» در آیفون
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    ۱
                  </span>
                  <span>
                    در مرورگر Safari دکمه <strong>Share (اشتراک‌گذاری)</strong> در پایین صفحه را لمس فرمایید.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    ۲
                  </span>
                  <span>
                    گزینه <strong>Add to Home Screen (افزودن به صفحه اصلی)</strong> را انتخاب کنید.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    ۳
                  </span>
                  <span>
                    آیکون اختصاصی «مسجد من» به صفحه گوشی شما افزوده شده و به صورت تمام‌صفحه و آفلاین اجرا خواهد شد.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

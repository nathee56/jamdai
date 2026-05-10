'use client';

import { useState, useEffect } from 'react';

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    }
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else if (isIOS) {
      alert("สำหรับการติดตั้งบน iOS (iPhone/iPad):\n1. แตะปุ่ม Share (สี่เหลี่ยมมีลูกศรชี้ขึ้น)\n2. เลือก 'Add to Home Screen' (เพิ่มไปยังหน้าจอโฮม)");
    } else {
      alert("เบราว์เซอร์ของคุณอาจไม่รองรับการติดตั้งอัตโนมัติ กรุณาติดตั้งผ่านเมนูของเบราว์เซอร์ (ไอคอน 3 จุด -> Install App หรือ Add to Home screen)");
    }
  };

  return { installPrompt, isInstalled, installApp, isIOS };
}

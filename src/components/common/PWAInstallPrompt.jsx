import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    const isAppStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone || document.referrer.includes("android-app://");
    setIsStandalone(isAppStandalone);

    if (isAppStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // iOS doesn't support beforeinstallprompt, so we just show the manual instructions
      setShowPrompt(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // It's up to the user to tap share -> add to home screen
      return;
    }

    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-[9999]"
      >
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl shrink-0">
            <Download size={24} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-slate-800">Install App</h3>
            <p className="text-sm text-gray-500 mt-1">
              {isIOS 
                ? "To install, tap the Share button below and select 'Add to Home Screen'."
                : "Install our app for a faster, app-like experience."}
            </p>
            
            {!isIOS && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  Install Now
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

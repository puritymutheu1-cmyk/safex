import { useState, useEffect } from "react";

const KEY = "safex-install-dismissed";
const WEEK = 7 * 24 * 60 * 60 * 1000;

function dismissedRecently() {
  try {
    const t = Number(localStorage.getItem(KEY));
    return t > 0 && Date.now() - t < WEEK;
  } catch {
    return false;
  }
}

function rememberDismiss() {
  try { localStorage.setItem(KEY, String(Date.now())); } catch {}
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [hint, setHint] = useState("");

  const ua = window.navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isMobile = /android|iphone|ipad|ipod/i.test(ua);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  useEffect(() => {
    const force = new URLSearchParams(window.location.search).get("install") === "1";
    if (!force && (standalone || dismissedRecently())) return;
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    if (window.__installEvent) setDeferred(window.__installEvent);
    window.addEventListener("beforeinstallprompt", onPrompt);
    const timer = setTimeout(() => setShow(true), 800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  const close = () => {
    rememberDismiss();
    setShow(false);
  };

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      rememberDismiss();
      setShow(false);
    } else {
      setHint(
        isIOS
          ? "Tap the Share button, then Add to Home Screen."
          : "Open your browser menu (the three dots), then tap Install app or Add to Home screen."
      );
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3">
      <div className="animate-sheet max-w-md mx-auto bg-surface border border-border rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-primary flex items-center justify-center text-xl font-bold text-white">
            S
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm">Safex</p>
            <p className="text-xs text-text-muted">Install the app for a faster, full-screen experience.</p>
          </div>
        </div>
        {hint && <p className="text-xs text-text-muted mt-3">{hint}</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={close} className="flex-1 border border-border rounded-lg py-2.5 text-sm text-text-muted">
            Continue on web
          </button>
          <button onClick={install} className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-semibold">
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

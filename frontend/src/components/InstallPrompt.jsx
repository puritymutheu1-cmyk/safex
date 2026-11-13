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

function shouldShow() {
  const force = new URLSearchParams(window.location.search).get("install") === "1";
  if (force) return true;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  return !standalone && !dismissedRecently();
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(window.__installEvent || null);
  const [show, setShow] = useState(shouldShow);
  const [hint, setHint] = useState("");
  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
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
    <div className="w-full bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-3">
        <button
          onClick={close}
          aria-label="Continue on web"
          className="text-text-muted hover:text-text text-lg px-1"
        >
          ✕
        </button>
        <div className="w-10 h-10 shrink-0 rounded-lg bg-primary flex items-center justify-center font-bold text-white">
          S
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-tight">Safex</p>
          <p className="text-xs text-text-muted truncate">Install the app for a faster experience</p>
        </div>
        <button
          onClick={install}
          className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full px-5 py-1.5"
        >
          Install
        </button>
      </div>
      {hint && <p className="px-4 pb-2 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

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
    <div className="animate-fade fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center text-3xl font-bold text-white mb-4">
          S
        </div>
        <h2 className="text-xl font-bold mb-1">Safex</h2>
        <p className="text-sm text-text-muted mb-6">
          Install the app for a faster, full-screen experience, or continue on the website.
        </p>
        {hint && <p className="text-xs text-text-muted mb-4">{hint}</p>}
        <button
          onClick={install}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl py-3"
        >
          Install app
        </button>
        <button
          onClick={close}
          className="w-full mt-3 border border-border rounded-xl py-3 text-sm text-text-muted"
        >
          Continue on web
        </button>
      </div>
    </div>
  );
}

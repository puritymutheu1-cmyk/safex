import { useState, useEffect } from "react";

const KEY = "safex-install-dismissed";

function read() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
function write() {
  try { localStorage.setItem(KEY, "1"); } catch {}
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  useEffect(() => {
    const force = new URLSearchParams(window.location.search).get("install") === "1";
    if (!force && (standalone || read())) return;
    let timer;
    const arm = (e) => {
      setDeferred(e);
      timer = setTimeout(() => setShow(true), 1200);
    };
    const onPrompt = (e) => {
      e.preventDefault();
      arm(e);
    };
    if (window.__installEvent) arm(window.__installEvent);
    window.addEventListener("beforeinstallprompt", onPrompt);
    if (isIOS || force) timer = setTimeout(() => setShow(true), 1200);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  const dismiss = () => {
    write();
    setShow(false);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    write();
    setShow(false);
  };

  if (!show) return null;

  const perks = [
    ["Open in one tap", "Safex sits on your home screen like any other app."],
    ["Full-screen and fast", "No browser bar, so trades get the whole screen."],
    ["Pay the way you already do", "Offers in KES with M-Pesa, Airtel Money or bank transfer."],
  ];
  const steps = isIOS
    ? ["Tap the Share button", "Choose Add to Home Screen", "Tap Add"]
    : ["Open your browser menu (the three dots)", "Choose Install app or Add to Home screen", "Confirm"];

  return (
    <div className="animate-fade fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="animate-sheet relative w-full max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/30 to-transparent pointer-events-none" />

        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-background/60 text-text-muted hover:text-text flex items-center justify-center"
        >
          ✕
        </button>

        <div className="relative px-6 pt-10 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/40 flex items-center justify-center text-3xl font-bold text-white mb-5">
            S
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-1">Trade crypto, straight from your phone</h2>
          <p className="text-text-muted text-sm mb-6">Install Safex for the fastest way back to your offers and trades.</p>

          <ul className="space-y-4 mb-7">
            {perks.map(([title, text]) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center">✓</span>
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-text-muted text-xs leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          {deferred ? (
            <>
              <button
                onClick={install}
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl py-3.5 shadow-lg shadow-primary/30 transition"
              >
                Install app
              </button>
              <button onClick={dismiss} className="w-full mt-3 text-sm text-text-muted hover:text-text py-2">
                Continue on web
              </button>
            </>
          ) : (
            <>
              <ol className="space-y-2 mb-5">
                {steps.map((s, i) => (
                  <li key={s} className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <button onClick={dismiss} className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl py-3.5 transition">
                Got it
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

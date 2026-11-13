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
    if (standalone || read()) return;
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    if (isIOS) setShow(true);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
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

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white">
            S
          </div>
          <div>
            <p className="font-semibold">Get the Safex app</p>
            <p className="text-xs text-text-muted">Install it for quick access, or keep using the website.</p>
          </div>
        </div>
        {deferred ? (
          <div className="flex gap-2">
            <button onClick={dismiss} className="flex-1 border border-border rounded-lg py-2 text-sm">
              Continue on web
            </button>
            <button onClick={install} className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-2 text-sm font-medium">
              Install app
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-text-muted mb-3">
              On iPhone: tap the Share button, then <b>Add to Home Screen</b>.
            </p>
            <button onClick={dismiss} className="w-full border border-border rounded-lg py-2 text-sm">
              Continue on web
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

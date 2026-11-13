import { useState, useEffect } from "react";

const KEY = "safex-install-dismissed";
const WEEK = 7 * 24 * 60 * 60 * 1000;

function dismissedRecently() {
  try {
    const t = Number(sessionStorage.getItem(KEY));
    return t > 0 && Date.now() - t < WEEK;
  } catch {
    return false;
  }
}

function rememberDismiss() {
  try { sessionStorage.setItem(KEY, String(Date.now())); } catch {}
}

function shouldShow() {
  try {
    const force = new URLSearchParams(window.location.search).get("install") === "1";
    if (force) return true;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    return !standalone && !dismissedRecently();
  } catch {
    return true;
  }
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

  const overlay = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.88)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
  };
  const card = {
    width: "100%", maxWidth: 360, background: "#161a1e",
    border: "1px solid #2b3139", borderRadius: 16, padding: 24,
    textAlign: "center", color: "#eaecef",
  };
  const logo = {
    width: 64, height: 64, margin: "0 auto 16px", borderRadius: 16,
    background: "#7c3aed", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff",
  };
  const installBtn = {
    width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
    background: "#7c3aed", color: "#fff", fontWeight: 600, fontSize: 16,
  };
  const continueBtn = {
    width: "100%", marginTop: 12, padding: "12px 0", borderRadius: 12,
    border: "1px solid #2b3139", background: "transparent",
    color: "#848e9c", fontSize: 14,
  };

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={logo}>S</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Safex</h2>
        <p style={{ fontSize: 14, color: "#848e9c", margin: "0 0 20px" }}>
          Install the app for a faster, full-screen experience, or continue on the website.
        </p>
        {hint && <p style={{ fontSize: 12, color: "#848e9c", margin: "0 0 16px" }}>{hint}</p>}
        <button onClick={install} style={installBtn}>Install app</button>
        <button onClick={close} style={continueBtn}>Continue on web</button>
      </div>
    </div>
  );
}

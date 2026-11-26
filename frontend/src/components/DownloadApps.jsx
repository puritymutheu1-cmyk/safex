export default function DownloadApps() {
  async function install() {
    const e = window.__installEvent;
    if (e) {
      e.prompt();
      await e.userChoice;
      window.__installEvent = null;
    } else {
      alert("Open your browser menu, then tap 'Install app' or 'Add to Home screen'.");
    }
  }
  const card = "rounded-2xl border border-border bg-surface p-5 flex flex-col items-center text-center gap-3";
  const btn = "rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5";
  return (
    <section className="px-4 py-12 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center">Download Safex</h2>
      <p className="text-text-muted text-center mt-2 mb-8">Trade from any device. Pick yours.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={card}>
          <h3 className="font-semibold">iOS</h3>
          <img src="/qr.png" alt="QR code" className="w-24 h-24 rounded-lg bg-white p-1" />
          <p className="text-sm text-text-muted">Scan the QR, open in Safari, tap Share, then Add to Home Screen.</p>
        </div>
        <div className={card}>
          <h3 className="font-semibold">Android</h3>
          <p className="text-sm text-text-muted">One-tap install, no app store needed.</p>
          <button onClick={install} className={btn}>Install now</button>
        </div>
        <div className={card}>
          <h3 className="font-semibold">Desktop</h3>
          <p className="text-sm text-text-muted">Use Safex right in your browser.</p>
          <a href="/" className={btn}>Open web</a>
        </div>
      </div>
    </section>
  );
}

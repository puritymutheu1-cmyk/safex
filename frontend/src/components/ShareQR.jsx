import { QRCodeSVG } from "qrcode.react";

export default function ShareQR({ url = "https://safexapp.netlify.app", size = 150 }) {
  return (
    <div className="inline-block bg-white p-3 rounded-xl">
      <QRCodeSVG value={url} size={size} />
      <p className="text-black text-xs text-center mt-2">Scan to open Safex</p>
    </div>
  );
}

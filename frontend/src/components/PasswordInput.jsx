import { useState } from "react";

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className="w-full border rounded-lg px-4 py-2 pr-16"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-2 text-sm text-purple-600"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

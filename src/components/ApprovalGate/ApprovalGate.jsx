import { useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { VALID_CODES } from "./validCodes";

function Orb({ cls }) {
  const styles = {
    "gate-orb-1":
      "absolute rounded-full pointer-events-none w-72 h-72 -top-20 -left-20 bg-[radial-gradient(circle,#ff993330,transparent_70%)]",
    "gate-orb-2":
      "absolute rounded-full pointer-events-none w-56 h-56 -bottom-16 -right-16 bg-[radial-gradient(circle,#33669930,transparent_70%)]",
  };
  return (
    <div
      className={`${styles[cls]} animate-[orbFloat_5s_ease-in-out_infinite]`}
    />
  );
}

export default function ApprovalGate({ user, onSignOut }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleActivate = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    if (!VALID_CODES.includes(trimmed)) {
      setStatus("invalid");
      setError("Invalid code");
      return;
    }

    setStatus("loading");

    try {
      const codeRef = doc(db, "codes", trimmed);
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists()) {
        setStatus("used");
        setError("Invalid code");
        return;
      }

      await setDoc(codeRef, { used: true });
      await setDoc(
        doc(db, "users", user.uid),
        { approved: true },
        { merge: true },
      );

      setStatus("success");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setStatus("invalid");
      setError("Something went wrong, try again");
    }
  };

  return (
    <>
      <style>{`
        @keyframes orbFloat{0%,100%{transform:scale(1) translate(0,0);}50%{transform:scale(1.2) translate(8px,-8px);}}
        @keyframes slideIn{0%{opacity:0;transform:translateY(20px) scale(.97);}100%{opacity:1;transform:translateY(0) scale(1);}}
        .gate-orb-1{animation:orbFloat 5s ease-in-out infinite;}
        .gate-orb-2{animation:orbFloat 6s ease-in-out infinite reverse;}
        .gate-wrap{animation:slideIn .4s ease both;}
      `}</style>

      <div className="gate-wrap rounded-3xl p-8 sm:p-10 mb-5 relative overflow-hidden text-center bg-[#003366]">
        <div className="gate-orb-1 absolute rounded-full pointer-events-none w-72 h-72 -top-20 -left-20 bg-[radial-gradient(circle,#ff993330,transparent_70%)]" />
        <div className="gate-orb-2 absolute rounded-full pointer-events-none w-56 h-56 -bottom-16 -right-16 bg-[radial-gradient(circle,#33669930,transparent_70%)]" />

        <div className="relative z-10">
          {/* Cross icon */}
          <div className="flex justify-center mb-6">
            <div className="relative w-14 h-14">
              <div className="absolute left-1/2 top-[5%] -translate-x-1/2 w-2 h-[90%] bg-[#ff9933] rounded-md opacity-50" />
              <div className="absolute top-[28%] left-[5%] w-[90%] h-2 bg-[#ff9933] rounded-md opacity-50" />
            </div>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest bg-[#ff993320] border border-[#ff993333] text-[#ff9933]">
              🔐 Activation Required
            </span>
          </div>

          <h3 className="text-white font-bold mb-2 text-2xl">
            Enter Your Code
          </h3>

          <p className="text-white/50 text-sm mb-3 leading-relaxed max-w-xs mx-auto">
            To access the app, you need to purchase the product first — then
            enter the activation code you received.
          </p>
          <a
            href="https://www.galilee-eg.com/products"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold mb-6 transition-all hover:scale-105"
            style={{
              background: "rgba(255,153,51,.15)",
              border: "1px solid #ff993366",
              color: "#ff9933",
            }}
          >
            Buy the product
          </a>

          {status === "success" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-14 h-14 mx-auto">
                <div className="absolute left-1/2 top-[5%] -translate-x-1/2 w-2 h-[90%] bg-[#ff9933] rounded-md" />
                <div className="absolute top-[28%] left-[5%] w-[90%] h-2 bg-[#ff9933] rounded-md" />
              </div>
              <p className="text-white font-semibold">Activated! Loading...</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 justify-center mb-3">
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setStatus("idle");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                  placeholder="Enter code"
                  className={`rounded-xl px-4 py-3 text-center text-white font-bold text-base outline-none w-40
                     bg-white/10 tracking-widest border ${status === "invalid" || status === "used" ? "border-red-500" : "border-[#ff993344]"}`}
                />
                <button
                  onClick={handleActivate}
                  disabled={status === "loading"}
                  className="rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105 active:scale-95 bg-[#ff993330] border border-[#ff993366] text-[#ff9933]"
                >
                  {status === "loading" ? "..." : "Activate"}
                </button>
              </div>

              {(status === "invalid" || status === "used") && (
                <p className="text-sm mb-3 text-red-400">{error}</p>
              )}
            </>
          )}

          <div className="mt-7 pt-5 border-t border-white/5">
            <button
              onClick={onSignOut}
              className="text-xs text-white hover:opacity-70 transition-all"
            >
              Sign out from {user?.displayName}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

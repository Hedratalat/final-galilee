import { useState } from "react";
import { useNavigate } from "react-router-dom";

const WHATSAPP_NUMBER = "201027539203";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello, I have purchased one of your products and would like to activate my Prayer Streak account. Account name: ",
);

function Orb({ cls, w, h, bg, s }) {
  return (
    <div
      className={`${cls} absolute rounded-full pointer-events-none`}
      style={{ width: w, height: h, background: bg, ...s }}
    />
  );
}

export default function ApprovalGate({ user, onSignOut }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("question"); // "question" | "waiting"

  const handleYes = () => {
    const name = user?.displayName || "User";
    const email = user?.email || "No email";
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `Hello, I have purchased one of your products and would like to activate my Prayer Streak account.\n\nAccount name: ${name}\nEmail: ${email}`,
    )}`;
    window.open(url, "_blank");
    setStep("waiting");
  };

  const handleNo = () => {
    navigate("/products");
  };

  return (
    <>
      <style>{`
        @keyframes orbFloat{0%,100%{transform:scale(1) translate(0,0);}50%{transform:scale(1.2) translate(8px,-8px);}}
        @keyframes slideIn{0%{opacity:0;transform:translateY(20px) scale(.97);}100%{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes pulse{0%,100%{opacity:.6;}50%{opacity:1;}}
        .gate-orb-1{animation:orbFloat 5s ease-in-out infinite;}
        .gate-orb-2{animation:orbFloat 6s ease-in-out infinite reverse;}
        .gate-wrap{animation:slideIn .4s ease both;}
        .gate-dot{animation:pulse 2s ease-in-out infinite;}
      `}</style>

      <div
        className="gate-wrap rounded-3xl p-8 sm:p-10 mb-5 relative overflow-hidden text-center"
        style={{ background: "#003366" }}
      >
        <Orb
          cls="gate-orb-1"
          w={280}
          h={280}
          bg="radial-gradient(circle,#ff993330,transparent 70%)"
          s={{ top: -80, left: -80 }}
        />
        <Orb
          cls="gate-orb-2"
          w={220}
          h={220}
          bg="radial-gradient(circle,#33669930,transparent 70%)"
          s={{ bottom: -60, right: -60 }}
        />

        <div className="relative" style={{ zIndex: 10 }}>
          {/* ── Cross icon ── */}
          <div className="flex justify-center mb-6">
            <div style={{ position: "relative", width: 52, height: 52 }}>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "5%",
                  transform: "translateX(-50%)",
                  width: 8,
                  height: "90%",
                  background: "#ff9933",
                  borderRadius: 4,
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "28%",
                  left: "5%",
                  width: "90%",
                  height: 8,
                  background: "#ff9933",
                  borderRadius: 4,
                  opacity: 0.5,
                }}
              />
            </div>
          </div>

          {step === "question" ? (
            <>
              {/* Lock badge */}
              <div className="flex justify-center mb-4">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest"
                  style={{
                    background: "rgba(255,153,51,.12)",
                    border: "1px solid #ff993333",
                    color: "#ff9933",
                  }}
                >
                  🔐 Restricted Access
                </span>
              </div>

              <h3
                className="text-white font-bold mb-2"
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(1.3rem,3vw,1.7rem)",
                }}
              >
                Members Only
              </h3>

              <p className="text-white/50 text-sm mb-6 leading-relaxed max-w-xs mx-auto">
                This page is exclusively available to our product owners.
              </p>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6 max-w-xs mx-auto">
                <div style={{ flex: 1, height: 1, background: "#ffffff0f" }} />
                <span
                  className="text-xs"
                  style={{ color: "#ff9933", letterSpacing: 2 }}
                >
                  DID YOU PURCHASE?
                </span>
                <div style={{ flex: 1, height: 1, background: "#ffffff0f" }} />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={handleYes}
                  className="flex items-center gap-2 rounded-2xl px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(255,153,51,.18)",
                    border: "1px solid #ff993366",
                    color: "#ff9933",
                    fontSize: "clamp(.85rem,1.5vw,1rem)",
                  }}
                >
                  ✅ Yes, I purchased
                </button>
                <button
                  onClick={handleNo}
                  className="flex items-center gap-2 rounded-2xl px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid #ffffff18",
                    color: "#ffffff70",
                    fontSize: "clamp(.85rem,1.5vw,1rem)",
                  }}
                >
                  🛒 No — Show me products
                </button>
              </div>
            </>
          ) : (
            <>
              {/* WhatsApp sent state */}
              <div
                className="inline-flex items-center justify-center rounded-full mb-5"
                style={{
                  width: 68,
                  height: 68,
                  background: "rgba(37,211,102,.1)",
                  border: "2px solid #25d36640",
                }}
              >
                <span style={{ fontSize: 30 }}>💬</span>
              </div>

              <h3
                className="text-white font-bold mb-3"
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(1.1rem,2.5vw,1.4rem)",
                }}
              >
                WhatsApp Opened ✝
              </h3>

              <p className="text-white/50 text-sm mb-1 leading-relaxed max-w-xs mx-auto">
                Send your message to the admin and your account will be
                activated shortly.
              </p>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 my-4">
                <div
                  className="gate-dot w-2 h-2 rounded-full"
                  style={{ background: "#25d366" }}
                />
                <span className="text-xs" style={{ color: "#ffffff40" }}>
                  Waiting for activation...
                </span>
              </div>

              <p className="text-white/30 text-xs mb-6">
                After activation, refresh this page
              </p>

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={handleYes}
                  className="rounded-2xl px-6 py-2 text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: "rgba(37,211,102,.13)",
                    border: "1px solid #25d36640",
                    color: "#25d366",
                  }}
                >
                  📲 Reopen WhatsApp
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-2xl px-6 py-2 text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: "rgba(255,153,51,.12)",
                    border: "1px solid #ff993330",
                    color: "#ff9933",
                  }}
                >
                  🔄 Refresh Page
                </button>
              </div>

              <button
                onClick={() => setStep("question")}
                className="mt-5 text-xs underline"
                style={{ color: "#ffffff25" }}
              >
                ← Back
              </button>
            </>
          )}

          {/* Sign out */}
          <div
            className="mt-7 pt-5"
            style={{ borderTop: "1px solid #ffffff08" }}
          >
            <button
              onClick={onSignOut}
              className="text-xs transition-all hover:opacity-70"
              style={{ color: "#ffffff28" }}
            >
              Sign out from {user?.displayName}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

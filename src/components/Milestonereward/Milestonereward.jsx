import { useState, useEffect } from "react";

/* ─── milestone data ─── */
const MILESTONE_DATA = {
  10: {
    emoji: "📖",
    title: "Bookmark Gift",
    reward: "Free Bookmark",
    desc: "You've unlocked a FREE Bookmark gift",
    instruction:
      "Take a screenshot and send it via WhatsApp or Messenger to claim your gift 🎁📸",
    color: "#ff9933",
    glow: "#ff993366",
    bg: "linear-gradient(135deg, #ff993322, #33669922)",
    badge: "🎁",
  },
  50: {
    emoji: "✨",
    title: "Sticker Gift",
    reward: "Free Sticker",
    desc: "You've unlocked a FREE sticker gift",
    instruction:
      "Take a screenshot and send it via WhatsApp or Messenger to claim your gift 📸",
    color: "#a78bfa",
    glow: "#a78bfa66",
    bg: "linear-gradient(135deg, #a78bfa22, #33669922)",
    badge: "🎀",
  },
  80: {
    emoji: "🌟",
    title: "Sticker Gift",
    reward: "Premium Sticker",
    desc: "You've unlocked a FREE premium sticker",
    instruction:
      "Take a screenshot and send it via WhatsApp or Messenger to claim your gift 📸",
    color: "#34d399",
    glow: "#34d39966",
    bg: "linear-gradient(135deg, #34d39922, #33669922)",
    badge: "⭐",
  },
  120: {
    emoji: "💎",
    title: "5% Discount",
    reward: "5% OFF your order",
    desc: "You've earned a 5% discount on your order",
    instruction:
      "Take a screenshot and send it via WhatsApp or Messenger to claim your discount 📸",
    color: "#60a5fa",
    glow: "#60a5fa66",
    bg: "linear-gradient(135deg, #60a5fa22, #33669922)",
    badge: "💰",
  },
  200: {
    emoji: "👑",
    title: "10% Discount",
    reward: "10% OFF your order",
    desc: "You've earned a 10% discount on your order",
    instruction:
      "Take a screenshot and send it via WhatsApp or Messenger to claim your discount 📸",
    color: "#fbbf24",
    glow: "#fbbf2466",
    bg: "linear-gradient(135deg, #fbbf2422, #33669922)",
    badge: "🏅",
  },
  250: {
    emoji: "🔥",
    title: "15% Discount",
    reward: "15% OFF your order",
    desc: "Legendary You've earned a 15% discount on your order",
    instruction:
      "Take a screenshot and send it via WhatsApp or Messenger to claim your discount 📸",
    color: "#f87171",
    glow: "#f8717166",
    bg: "linear-gradient(135deg, #f8717122, #33669922)",
    badge: "🏆",
  },
};

const MILESTONES = [10, 50, 80, 120, 200, 250];

/* ─── confetti burst ─── */
function burst(color) {
  const cont = document.createElement("div");
  cont.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
  document.body.appendChild(cont);
  const style = document.createElement("style");
  style.textContent = `@keyframes _cf{0%{transform:translateY(0) rotate(0) scale(1);opacity:1;}100%{transform:translateY(-120vh) rotate(900deg) scale(.4);opacity:0;}}`;
  document.head.appendChild(style);
  const cols = [color, "#ffffff", "#336699", "#ffd480", "#a78bfa"];
  for (let i = 0; i < 70; i++) {
    const c = document.createElement("div");
    const col = cols[Math.floor(Math.random() * cols.length)];
    const sz = Math.random() * 12 + 5;
    c.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:110%;width:${sz}px;height:${sz}px;background:${col};border-radius:${Math.random() > 0.5 ? "50%" : "3px"};animation:_cf ${(Math.random() * 2 + 1).toFixed(2)}s ease-in ${(Math.random() * 2).toFixed(2)}s 1 forwards;`;
    cont.appendChild(c);
  }
  setTimeout(() => {
    cont.remove();
    style.remove();
  }, 6000);
}

/* ─── popup ─── */
function MilestonePopup({ milestone, onClose }) {
  const data = MILESTONE_DATA[milestone];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    burst(data.color);
  }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 350);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes popIn { 0%{transform:scale(.6) translateY(40px);opacity:0} 70%{transform:scale(1.06) translateY(-4px)} 100%{transform:scale(1) translateY(0);opacity:1} }
        @keyframes popOut { to{transform:scale(.7) translateY(30px);opacity:0} }
        @keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes floatEmoji { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.6);opacity:0} }
        @keyframes spin-slow { to{transform:rotate(360deg)} }
        .mp-popup { animation: popIn .45s cubic-bezier(.22,1,.36,1) both; }
        .mp-popup.out { animation: popOut .3s ease forwards; }
        .mp-emoji { animation: floatEmoji 3s ease-in-out infinite; display:inline-block; }
        .mp-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .mp-ring { animation: pulse-ring 2s ease-out infinite; }
        .mp-ring2 { animation: pulse-ring 2s ease-out .8s infinite; }
        .mp-badge-spin { animation: spin-slow 8s linear infinite; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "rgba(4,8,20,.88)",
          backdropFilter: "blur(8px)",
          transition: "opacity .35s",
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Popup */}
      <div
        className={`mp-popup${!visible ? " out" : ""}`}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: 400,
            background: "#0a1628",
            border: `1.5px solid ${data.color}44`,
            borderRadius: 28,
            padding: "2.5rem 2rem 2rem",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 0 80px ${data.glow}, 0 0 200px ${data.glow}44`,
          }}
        >
          {/* Orbs */}
          <div
            style={{
              position: "absolute",
              top: -80,
              left: -80,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${data.color}22, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, #33669930, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Close */}
          <button
            onClick={close}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)",
              color: "#ffffff80",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>

          {/* Emoji + rings */}
          <div
            style={{
              position: "relative",
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div
              className="mp-ring"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 110,
                height: 110,
                borderRadius: "50%",
                border: `2px solid ${data.color}44`,
              }}
            />
            <div
              className="mp-ring2"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 110,
                height: 110,
                borderRadius: "50%",
                border: `2px solid ${data.color}22`,
              }}
            />
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: data.bg,
                border: `2px solid ${data.color}55`,
                boxShadow: `0 0 30px ${data.glow}`,
                position: "relative",
              }}
            >
              <span className="mp-emoji" style={{ fontSize: "2.5rem" }}>
                {data.emoji}
              </span>
              <span
                className="mp-badge-spin"
                style={{
                  position: "absolute",
                  bottom: -6,
                  right: -6,
                  fontSize: "1.2rem",
                  filter: "drop-shadow(0 0 6px #fff8)",
                }}
              >
                {data.badge}
              </span>
            </div>
          </div>

          {/* Streak badge */}
          <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 16px",
                borderRadius: 20,
                background: `${data.color}22`,
                border: `1px solid ${data.color}55`,
                color: data.color,
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              🔥 {milestone} DAYS STREAK
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              textAlign: "center",
              fontFamily: "'Cinzel', serif",
              fontWeight: 900,
              fontSize: "clamp(1.4rem,4vw,1.8rem)",
              color: data.color,
              margin: "0 0 1rem",
              textShadow: `0 0 20px ${data.glow}`,
            }}
          >
            {data.title}
          </h2>

          {/* Reward pill */}
          <div style={{ textAlign: "center", margin: "0 0 1rem" }}>
            <div
              style={{
                display: "inline-block",
                padding: "12px 28px",
                borderRadius: 16,
                background: data.bg,
                border: `1.5px solid ${data.color}66`,
                boxShadow: `0 0 24px ${data.glow}44`,
              }}
            >
              <p
                className="mp-shimmer"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "clamp(1.1rem,3vw,1.35rem)",
                  fontWeight: 700,
                  color: "#fff",
                  margin: 0,
                }}
              >
                {data.reward}
              </p>
            </div>
          </div>

          {/* Desc */}
          <p
            style={{
              textAlign: "center",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
              color: "#ffffff90",
              marginBottom: "1.25rem",
              lineHeight: 1.6,
            }}
          >
            {data.desc}
          </p>

          {/* Instruction box */}
          <div
            style={{
              borderRadius: 14,
              padding: "14px 18px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.1)",
              textAlign: "center",
              marginBottom: "1.25rem",
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.88rem",
                color: "#ffffffb0",
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              {data.instruction}
            </p>
          </div>

          {/* Button */}
          <button
            onClick={close}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 16,
              background: `linear-gradient(135deg, ${data.color}cc, ${data.color}88)`,
              border: "none",
              color: "#fff",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
              boxShadow: `0 4px 24px ${data.glow}`,
              transition: "transform .15s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Got it — Save Screenshot 📸
          </button>

          {/* Reopen hint */}
          <p
            style={{
              textAlign: "center",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.72rem",
              color: "#ffffff40",
              margin: "0.75rem 0 0",
            }}
          >
            You can reopen this anytime from the Milestones section
          </p>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   EXPORT
   Replace the old Milestones block in Streak.jsx with:
     <MilestoneReward streak={streak} />
══════════════════════════════════════════════════════ */
export default function MilestoneReward({ streak = 0 }) {
  const [activePopup, setActivePopup] = useState(null);
  const [shown, setShown] = useState({});

  // Auto-show popup exactly when milestone is hit
  useEffect(() => {
    for (const m of MILESTONES) {
      if (streak === m && !shown[m]) {
        setActivePopup(m);
        setShown((prev) => ({ ...prev, [m]: true }));
        break;
      }
    }
  }, [streak]);

  return (
    <>
      {/* ── Milestones card — same old shape, just a gift hint added ── */}
      <div
        className="rounded-3xl p-8 sm:p-10 mb-5 relative overflow-hidden"
        style={{ background: "#003366" }}
      >
        <div
          className="absolute rounded-full pointer-events-none anim-orb-1"
          style={{
            width: 280,
            height: 280,
            background: "radial-gradient(circle,#ff993330,transparent 70%)",
            top: -80,
            left: -80,
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none anim-orb-2"
          style={{
            width: 220,
            height: 220,
            background: "radial-gradient(circle,#33669930,transparent 70%)",
            bottom: -60,
            right: -60,
          }}
        />

        <div className="relative text-center" style={{ zIndex: 10 }}>
          <p
            className="text-xs uppercase mt-3"
            style={{
              color: "#ffffff70",
              letterSpacing: "0.3em",
              marginBottom: "0.5rem",
            }}
          >
            Milestones
          </p>
          {/* subtle gift hint */}
          <p
            style={{
              color: "#ff993388",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              marginBottom: "1.25rem",
            }}
          >
            🎁 Reach a milestone to unlock a special reward
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            {MILESTONES.map((m) => {
              const reached = streak >= m;
              const data = MILESTONE_DATA[m];
              return (
                <div
                  key={m}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm transition-all duration-300"
                    style={{
                      border: `1px solid ${reached ? "#ff993355" : "#33669944"}`,
                      color: reached ? "#ff9933" : "#ffffff70",
                      background: reached
                        ? "rgba(255,153,51,.1)"
                        : "rgba(255,255,255,.04)",
                      boxShadow: reached ? "0 0 14px #ff993322" : "none",
                      fontSize: "clamp(.7rem,1.3vw,.9rem)",
                      cursor: reached ? "pointer" : "default",
                    }}
                    onClick={() => reached && setActivePopup(m)}
                  >
                    {reached ? "🏆" : "🔒"} {m} days
                  </div>
                  {reached && (
                    <button
                      onClick={() => setActivePopup(m)}
                      style={{
                        fontSize: "0.62rem",
                        color: data.color,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        letterSpacing: "0.05em",
                        opacity: 0.8,
                      }}
                    >
                      View gift {data.badge}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* popup */}
      {activePopup && (
        <MilestonePopup
          milestone={activePopup}
          onClose={() => setActivePopup(null)}
        />
      )}
    </>
  );
}

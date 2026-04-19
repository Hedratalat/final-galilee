import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MILESTONES = [3, 7, 14, 30, 40, 100];
const COLORS = [
  { r: 255, g: 153, b: 51 },
  { r: 51, g: 102, b: 153 },
  { r: 255, g: 255, b: 255 },
  { r: 0, g: 51, b: 102 },
];

function mkParticle(side, W, H) {
  const sideW = 160;
  const x = side === "left" ? Math.random() * sideW : W - Math.random() * sideW;
  return {
    x,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 3 + 0.8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.7 + 0.2,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.02 + 0.005,
    side,
  };
}

function ParticleCanvas({ side }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const SIDE_W = 190;

    function resize() {
      canvas.width = SIDE_W;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const particles = [];
    for (let i = 0; i < 70; i++) {
      particles.push(mkParticle(side, SIDE_W, window.innerHeight));
    }

    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const grad = ctx.createLinearGradient(
        side === "left" ? 0 : W,
        0,
        side === "left" ? W : 0,
        0,
      );
      grad.addColorStop(0, "#0a0f1eff");
      grad.addColorStop(1, "#0a0f1e00");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i],
            b = particles[j];
          const dx = a.x - b.x,
            dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "#ff993322";
            ctx.globalAlpha = (1 - dist / 80) * 0.35;
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      particles.forEach((p, i) => {
        p.pulse += p.pulseSpeed;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        const { r, g, b } = p.color;
        if (p.r > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},0.05)`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(
          p.x,
          p.y,
          p.r * (0.9 + 0.2 * Math.sin(p.pulse)),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
          particles[i] = mkParticle(side, W, H);
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [side]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        [side]: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "190px",
      }}
    />
  );
}

export default function Streak() {
  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("xn_streak_react") || "null",
      );
      if (saved) return saved;
    } catch (e) {}
    return {
      streak: 7,
      todayDone: false,
      weekHistory: [true, true, true, true, true, false, true],
    };
  });

  const [bumping, setBumping] = useState(false);
  const [toast, setToast] = useState({ msg: "", show: false });

  useEffect(() => {
    try {
      localStorage.setItem("xn_streak_react", JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  function showToast(msg) {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3200);
  }

  function celebrate() {
    const colors = ["#ff9933", "#ffffff", "#336699", "#ffd480"];
    const cont = document.createElement("div");
    cont.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:600;overflow:hidden;";
    document.body.appendChild(cont);
    const style = document.createElement("style");
    style.textContent =
      "@keyframes confUp{0%{transform:translateY(0)rotate(0);opacity:1;}100%{transform:translateY(-110vh)rotate(720deg);opacity:0;}}";
    document.head.appendChild(style);
    for (let i = 0; i < 90; i++) {
      const c = document.createElement("div");
      const col = colors[Math.floor(Math.random() * colors.length)];
      const sz = Math.random() * 10 + 5;
      c.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:105%;width:${sz}px;height:${sz}px;background:${col};border-radius:${Math.random() > 0.5 ? "50%" : "3px"};animation:confUp ${(Math.random() * 1.5 + 1).toFixed(2)}s ease-in ${(Math.random() * 1.8).toFixed(2)}s 1 forwards;`;
      cont.appendChild(c);
    }
    setTimeout(() => {
      cont.remove();
      style.remove();
    }, 5000);
  }

  function markPrayer() {
    if (state.todayDone) return;
    const today = new Date().getDay();
    setState((prev) => ({
      ...prev,
      todayDone: true,
      streak: prev.streak + 1,
      weekHistory: prev.weekHistory.map((v, i) => (i === today ? true : v)),
    }));
    setBumping(true);
    setTimeout(() => setBumping(false), 400);
    celebrate();
    showToast(`🙏 God bless you! ${state.streak + 1} days strong!`);
  }

  const today = new Date().getDay();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
        body { background: #0a0f1e; font-family: 'Inter', sans-serif; }

        .cross-icon { display: inline-block; width: 64px; height: 64px; position: relative; animation: floatCross 4s ease-in-out infinite; }
        .cross-icon::before { content: ''; position: absolute; left: 50%; top: 8%; transform: translateX(-50%); width: 11px; height: 84%; background: #ff9933; border-radius: 6px; }
        .cross-icon::after { content: ''; position: absolute; top: 26%; left: 8%; width: 84%; height: 11px; background: #ff9933; border-radius: 6px; }
        .cross-glow { position: absolute; inset: -16px; border-radius: 50%; background: radial-gradient(circle, #ff993330, transparent 70%); animation: glowPulse 3s ease-in-out infinite; }
        @keyframes floatCross { 0%,100%{ transform: translateY(0) rotate(-2deg); } 50%{ transform: translateY(-10px) rotate(2deg); } }
        @keyframes glowPulse { 0%,100%{ transform: scale(1); opacity: .7; } 50%{ transform: scale(1.4); opacity: 1; } }

        .orb { position: absolute; border-radius: 50%; pointer-events: none; }
        .o1 { width: 280px; height: 280px; background: radial-gradient(circle, #ff993330, transparent 70%); top: -80px; left: -80px; animation: orbFloat 5s ease-in-out infinite; }
        .o2 { width: 220px; height: 220px; background: radial-gradient(circle, #33669930, transparent 70%); bottom: -60px; right: -60px; animation: orbFloat 6s ease-in-out infinite reverse; }
        .o3 { width: 150px; height: 150px; background: radial-gradient(circle, #ff993318, transparent 70%); top: 40%; right: 10%; animation: orbFloat 4s ease-in-out 1s infinite; }
        @keyframes orbFloat { 0%,100%{ transform: scale(1) translate(0,0); } 50%{ transform: scale(1.2) translate(8px,-8px); } }

        .flame { animation: flameDance .5s ease-in-out infinite alternate; display: inline-block; }
        @keyframes flameDance { 0%{ transform: rotate(-8deg) scale(1); } 100%{ transform: rotate(8deg) scale(1.12); } }

        .streak-number { font-family: 'Playfair Display', serif; font-weight: 700; color: #ff9933; line-height: 1; transition: transform .35s cubic-bezier(.34,1.56,.64,1); font-size: clamp(4rem, 10vw, 7rem); }
        .streak-number.bump { transform: scale(1.25); }

        .dot { border-radius: 50%; border: 2px solid #336699; display: flex; align-items: center; justify-content: center; transition: all .4s; background: rgba(255,255,255,.05); color: transparent; }
        .dot.done { background: #ff9933; border-color: #ff9933; color: #fff; box-shadow: 0 0 16px #ff993388; }
        .dot.today { border-color: #ffffff60; animation: todayRing 2s ease-in-out infinite; }
        @keyframes todayRing { 0%,100%{ box-shadow: 0 0 0 4px rgba(255,255,255,.15); } 50%{ box-shadow: 0 0 0 8px rgba(255,255,255,.07); } }

        .btn-ring { position: absolute; border-radius: 50%; border: 1px solid #ff993322; animation: ringExpand 2s ease-out infinite; pointer-events: none; }
        .btn-ring2 { animation-delay: 1s; }
        @keyframes ringExpand { 0%{ transform: scale(.85); opacity: .8; } 100%{ transform: scale(1.5); opacity: 0; } }

        .toast { background: #003366; color: #fff; border: 1px solid #ff993344; border-radius: 16px; padding: 14px 28px; font-size: 1rem; opacity: 0; transform: translateY(20px); transition: all .4s cubic-bezier(.34,1.56,.64,1); white-space: nowrap; }
        .toast.show { opacity: 1; transform: translateY(0); }

        .pray-btn:hover:not(:disabled) { transform: scale(1.07); }
        .pray-btn:active:not(:disabled) { transform: scale(0.96); }
      `}</style>

      <Navbar />
      <ParticleCanvas side="left" />
      <ParticleCanvas side="right" />

      <div className="flex min-h-screen relative">
        {/* Left spacer */}
        <div className="hidden lg:block w-40 shrink-0 z-10" />

        {/* Main content */}
        <div className="flex-1 z-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            {/* Header */}
            <div className="text-center pb-8 pt-4">
              <div className="inline-block relative mb-4">
                <div className="cross-glow" />
                <div className="cross-icon" />
              </div>
              <h1
                className="font-bold text-white tracking-wide"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                }}
              >
                Prayer Streak
              </h1>
              <p
                className="text-xs tracking-widest uppercase mt-2"
                style={{ color: "#336699", letterSpacing: "0.25em" }}
              >
                Daily devotion tracker
              </p>
            </div>

            {/* Streak Card */}
            <div
              className="rounded-3xl p-8 sm:p-10 mb-5 relative overflow-hidden"
              style={{ background: "#003366" }}
            >
              <div className="orb o1" />
              <div className="orb o2" />
              <div className="orb o3" />
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-6">
                  <span
                    className="flame"
                    style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
                  >
                    🔥
                  </span>
                  <div className={`streak-number${bumping ? " bump" : ""}`}>
                    {state.streak}
                  </div>
                </div>
                <p
                  className="text-xs tracking-widest uppercase mt-3"
                  style={{ color: "#ffffff70", letterSpacing: "0.3em" }}
                >
                  days in a row
                </p>

                {/* Week dots */}
                <div className="flex justify-center gap-2 sm:gap-3 mt-6 flex-wrap">
                  {DAYS.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`dot${state.weekHistory[i] ? " done" : ""}${i === today ? " today" : ""}`}
                        style={{
                          width: "clamp(32px,5vw,48px)",
                          height: "clamp(32px,5vw,48px)",
                          fontSize: "clamp(.7rem,1.5vw,1rem)",
                        }}
                      >
                        {state.weekHistory[i] ? "✓" : ""}
                      </div>
                      <span
                        className="text-xs"
                        style={{
                          color: "#ffffff50",
                          fontSize: "clamp(.55rem,1.2vw,.75rem)",
                          letterSpacing: 1,
                        }}
                      >
                        {d}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pray Card */}
            <div
              className="rounded-3xl p-8 sm:p-10 mb-5 relative overflow-hidden"
              style={{ background: "#003366" }}
            >
              <div className="orb o1" />
              <div className="orb o2" />
              <div className="relative z-10 text-center">
                <p
                  className="text-xs tracking-widest uppercase mb-6"
                  style={{ color: "#ffffff70", letterSpacing: "0.3em" }}
                >
                  Today's prayer
                </p>
                <div className="relative inline-flex items-center justify-center my-2">
                  <div
                    className="btn-ring"
                    style={{
                      width: "clamp(160px,22vw,200px)",
                      height: "clamp(160px,22vw,200px)",
                    }}
                  />
                  <div
                    className="btn-ring btn-ring2"
                    style={{
                      width: "clamp(160px,22vw,200px)",
                      height: "clamp(160px,22vw,200px)",
                    }}
                  />
                  <button
                    onClick={markPrayer}
                    disabled={state.todayDone}
                    className="pray-btn flex flex-col items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      width: "clamp(130px,18vw,170px)",
                      height: "clamp(130px,18vw,170px)",
                      border: `3px solid ${state.todayDone ? "#ff9933" : "#ff993366"}`,
                      background: state.todayDone
                        ? "rgba(255,153,51,.25)"
                        : "rgba(255,153,51,.1)",
                      boxShadow: state.todayDone
                        ? "0 0 40px #ff993555"
                        : "none",
                      cursor: state.todayDone ? "default" : "pointer",
                      gap: 8,
                    }}
                  >
                    {/* Cross icon */}
                    <div
                      className="relative"
                      style={{
                        width: "clamp(32px,4vw,44px)",
                        height: "clamp(32px,4vw,44px)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "5%",
                          transform: "translateX(-50%)",
                          width: 7,
                          height: "90%",
                          background: "#ff9933",
                          borderRadius: 4,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "28%",
                          left: "5%",
                          width: "90%",
                          height: 7,
                          background: "#ff9933",
                          borderRadius: 4,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "clamp(.65rem,1.2vw,.85rem)",
                        letterSpacing: 3,
                        color: "#ff9933",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      {state.todayDone ? "Done" : "Pray"}
                    </span>
                  </button>
                </div>

                {state.todayDone && (
                  <div className="mt-5">
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium"
                      style={{
                        background: "rgba(255,153,51,.15)",
                        border: "1px solid #ff993344",
                        color: "#ff9933",
                      }}
                    >
                      ✓ Prayed today — streak +1!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Milestones Card */}
            <div
              className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
              style={{ background: "#003366" }}
            >
              <div className="orb o1" />
              <div className="orb o2" />
              <div className="relative z-10 text-center">
                <p
                  className="text-xs tracking-widest uppercase mb-5"
                  style={{ color: "#ffffff70", letterSpacing: "0.3em" }}
                >
                  Milestones
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {MILESTONES.map((m) => {
                    const reached = state.streak >= m;
                    return (
                      <div
                        key={m}
                        className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm transition-all duration-300"
                        style={{
                          border: `1px solid ${reached ? "#ff993355" : "#33669944"}`,
                          color: reached ? "#ff9933" : "#ffffff70",
                          background: reached
                            ? "rgba(255,153,51,.1)"
                            : "rgba(255,255,255,.04)",
                          boxShadow: reached ? "0 0 14px #ff993322" : "none",
                          fontSize: "clamp(.7rem,1.3vw,.9rem)",
                        }}
                      >
                        {reached ? "🏆" : "🔒"} {m} days
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right spacer */}
        <div className="hidden lg:block w-40 shrink-0 z-10" />
      </div>

      {/* Toast */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className={`toast${toast.show ? " show" : ""}`}>{toast.msg}</div>
      </div>

      <Footer />
    </>
  );
}

import { useEffect } from "react";

export default function BlessingCelebration({ streak, onClose }) {
  const particles = ["#ff9933", "#ffffff", "#336699", "#ffd480"];

  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[500]"
      style={{
        background: "rgba(0,0,0,.75)",
        animation: "blessOverlayIn .35s ease both",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes blessOverlayIn{0%{opacity:0;}100%{opacity:1;}}
        @keyframes blessCardIn{0%{opacity:0;transform:scale(.7) translateY(30px);}60%{transform:scale(1.05) translateY(-4px);}100%{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes blessGlow{0%,100%{box-shadow:0 0 60px #ff993355,0 0 120px #ff993322;}50%{box-shadow:0 0 80px #ff993388,0 0 160px #ff993344;}}
        @keyframes blessRing{0%{transform:scale(.85);opacity:.9;}100%{transform:scale(1.8);opacity:0;}}
        @keyframes blessFire{0%{transform:rotate(-6deg) scale(1);}100%{transform:rotate(6deg) scale(1.1);}}
        @keyframes blessParticle{0%{transform:translate(0,0) rotate(0deg);opacity:1;}100%{transform:translate(var(--tx),var(--ty)) rotate(720deg);opacity:0;}}
        @keyframes blessTextIn{0%{opacity:0;transform:translateY(12px);}100%{opacity:1;transform:translateY(0);}}
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative text-center rounded-[28px] w-[90vw] max-w-[340px] px-12 py-10"
        style={{
          background: "linear-gradient(145deg,#003d80,#001f4d)",
          border: "1px solid #ff993366",
          animation:
            "blessCardIn .55s cubic-bezier(.34,1.56,.64,1) both, blessGlow 3s ease-in-out 1s infinite",
        }}
      >
        {/* Rings */}
        {[0, 1].map((i) => (
          <div
            key={i}
            className="absolute pointer-events-none rounded-full"
            style={{
              inset: -20,
              border: "2px solid #ff993333",
              animation: `blessRing 2.2s ease-out ${i}s infinite`,
            }}
          />
        ))}

        {/* Particles */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute pointer-events-none rounded-full w-2 h-2"
            style={{
              background:
                particles[Math.floor(Math.random() * particles.length)],
              left: `${45 + Math.random() * 10}%`,
              top: `${35 + Math.random() * 15}%`,
              "--tx": `${(Math.random() - 0.5) * 280}px`,
              "--ty": `${-(Math.random() * 220 + 60)}px`,
              animation: `blessParticle ${(Math.random() * 0.8 + 0.9).toFixed(2)}s ease-out ${(Math.random() * 0.3).toFixed(2)}s both`,
            }}
          />
        ))}

        {/* Fire */}
        <div
          className="text-[52px] leading-none"
          style={{ animation: "blessFire .5s ease-in-out infinite alternate" }}
        >
          🔥
        </div>

        {/* Streak number */}
        <div
          className="text-[72px] font-bold leading-none mt-2 mb-1"
          style={{
            fontFamily: "'Playfair Display',serif",
            color: "#ff9933",
            animation: "blessTextIn .4s ease .2s both",
          }}
        >
          {streak}
        </div>

        {/* Label */}
        <div
          className="text-[11px] uppercase tracking-[.3em]"
          style={{
            color: "#ffffff60",
            animation: "blessTextIn .4s ease .3s both",
          }}
        >
          days in a row
        </div>

        {/* Message */}
        <p
          className="text-[15px] italic leading-relaxed mt-4"
          style={{
            color: "#ffffffcc",
            animation: "blessTextIn .4s ease .4s both",
          }}
        >
          God bless you — keep the flame alive 🙏
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="mt-6 inline-flex items-center gap-1.5 rounded-[14px] px-5 py-2 text-[13px] font-semibold cursor-pointer tracking-wide transition-all duration-200 hover:scale-105"
          style={{
            background: "rgba(255,153,51,.15)",
            border: "1px solid #ff993355",
            color: "#ff9933",
            animation: "blessTextIn .4s ease .55s both",
          }}
        >
          ✝ Amen
        </button>
      </div>
    </div>
  );
}

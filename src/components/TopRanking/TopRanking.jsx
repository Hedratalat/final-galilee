import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

function Orb({ cls, w, h, bg, s }) {
  return (
    <div
      className={`${cls} absolute rounded-full pointer-events-none`}
      style={{ width: w, height: h, background: bg, ...s }}
    />
  );
}

const RANK_STYLES = {
  0: {
    bg: "rgba(255,215,0,.15)",
    border: "#ffd70055",
    color: "#ffd700",
    label: "🥇",
  },
  1: {
    bg: "rgba(192,192,192,.12)",
    border: "#c0c0c055",
    color: "#c0c0c0",
    label: "🥈",
  },
  2: {
    bg: "rgba(205,127,50,.12)",
    border: "#cd7f3255",
    color: "#cd7f32",
    label: "🥉",
  },
};

function RankCircle({ rank }) {
  if (!rank) return null;

  const isTop3 = rank <= 3;
  const colors = {
    1: {
      glow: "#ffd700",
      border: "#ffd700",
      text: "#ffd700",
      bg: "rgba(255,215,0,.12)",
    },
    2: {
      glow: "#c0c0c0",
      border: "#c0c0c0",
      text: "#c0c0c0",
      bg: "rgba(192,192,192,.1)",
    },
    3: {
      glow: "#cd7f32",
      border: "#cd7f32",
      text: "#cd7f32",
      bg: "rgba(205,127,50,.1)",
    },
  };
  const c = colors[rank] || {
    glow: "#ff9933",
    border: "#ff993366",
    text: "#ff9933",
    bg: "rgba(255,153,51,.1)",
  };

  return (
    <>
      <style>{`
        @keyframes rankPulse {
          0%,100% { box-shadow: 0 0 0 0 ${c.glow}44, 0 0 20px ${c.glow}22; }
          50%      { box-shadow: 0 0 0 8px ${c.glow}11, 0 0 35px ${c.glow}44; }
        }
        @keyframes rankFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        .rank-pulse { animation: rankPulse 3s ease-in-out infinite; }
        .rank-float { animation: rankFloat 4s ease-in-out infinite; }
      `}</style>

      {/* ── Responsive ── */}
      <div
        className="
          flex flex-col items-center gap-2 
          absolute 
          left-4 top-28 
          lg:left-[22%] lg:top-[28%] 
          z-50 
          rank-float
        "
      >
        <div
          className="flex flex-col items-center justify-center rounded-full rank-pulse"
          style={{
            width: "clamp(70px, 18vw, 115px)",
            height: "clamp(70px, 18vw, 115px)",
            background: c.bg,
            border: `2px solid ${c.border}`,
          }}
        >
          {/* TOP */}
          <span
            className="uppercase tracking-widest text-white"
            style={{ fontSize: "clamp(8px, 2.2vw, 14px)" }}
          >
            TOP
          </span>

          {/* الرقم */}
          <span
            className="font-extrabold leading-none"
            style={{
              color: c.text,
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(16px, 5vw, 28px)",
            }}
          >
            {rank}
          </span>

          {/* الميدالية */}
          {isTop3 && (
            <span
              className="mt-0.5"
              style={{ fontSize: "clamp(10px, 3vw, 18px)" }}
            >
              {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
            </span>
          )}
        </div>

        {/* Global */}
        <span
          className="uppercase tracking-widest text-white"
          style={{ fontSize: "clamp(8px, 2vw, 12px)" }}
        >
          Global
        </span>
      </div>
    </>
  );
}

export default function TopRanking({ currentUserId }) {
  const [leaders, setLeaders] = useState([]);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "users"),
      orderBy("streak", "desc"),
      limit(50),
    );

    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d, i) => ({
        id: d.id,
        displayName: d.data().displayName || "Anonymous",
        streak: d.data().streak || 0,
        rank: i + 1,
      }));

      setLeaders(all.slice(0, 5));
      const me = all.find((u) => u.id === currentUserId);
      setMyRank(me ? me.rank : null);
    });

    return unsub;
  }, [currentUserId]);

  return (
    <>
      <RankCircle rank={myRank} />
    </>
  );
}

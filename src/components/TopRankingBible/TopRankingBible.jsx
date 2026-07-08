import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

function RankCircle({ rank }) {
  if (!rank) return null;

  const isTop3 = rank <= 3;
  const colors = {
    1: {
      glow: "#818cf8",
      border: "#818cf8",
      text: "#818cf8",
      bg: "rgba(99,102,241,.12)",
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
    glow: "#a5b4fc",
    border: "#a5b4fc66",
    text: "#a5b4fc",
    bg: "rgba(165,180,252,.1)",
  };

  return (
    <>
      <style>{`
        @keyframes rankPulseSB {
          0%,100% { box-shadow: 0 0 0 0 ${c.glow}44, 0 0 20px ${c.glow}22; }
          50%      { box-shadow: 0 0 0 8px ${c.glow}11, 0 0 35px ${c.glow}44; }
        }
        @keyframes rankFloatSB {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        .rank-pulse-sb { animation: rankPulseSB 3s ease-in-out infinite; }
        .rank-float-sb { animation: rankFloatSB 4s ease-in-out infinite; }
      `}</style>

      {/* ── Responsive ── */}
      <div
        className="
          flex flex-col items-center gap-2 
          absolute 
          left-4 top-[6.25rem]
          lg:left-[22%] lg:top-[28%] 
          
          rank-float-sb
        "
      >
        <div
          className="flex flex-col items-center justify-center rounded-full rank-pulse-sb"
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
              fontFamily: "'Georgia', serif",
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

export default function TopRankingBible({ currentUserId }) {
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "streakBible"),
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

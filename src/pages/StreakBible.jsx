import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { FaBible } from "react-icons/fa";
import TopRankingBible from "../components/TopRankingBible/TopRankingBible";
import BibleReadingTracker from "../components/BibleReadingTracker/BibleReadingTracker";

/* ─── helpers ─── */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function egyptNow() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
  );
}
function dateToStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function todayStr() {
  return dateToStr(egyptNow());
}
function daysDiff(a, b) {
  return Math.round(
    (new Date(a + "T00:00:00") - new Date(b + "T00:00:00")) / 86400000,
  );
}

/* ─── Background: stars + meteors (top & bottom) ─── */
function Background() {
  const bgRef = useRef(null);

  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;
    const els = [];
    const svgNS = "http://www.w3.org/2000/svg";

    // stars
    for (let i = 0; i < 130; i++) {
      const s = document.createElement("div");
      const sz = Math.random() * 2.2 + 0.5;
      s.style.cssText = `
        position:absolute;border-radius:50%;background:#fff;
        width:${sz}px;height:${sz}px;
        left:${(Math.random() * 100).toFixed(1)}%;
        top:${(Math.random() * 100).toFixed(1)}%;
        animation:sbTw ${(Math.random() * 5 + 2).toFixed(1)}s ease-in-out infinite -${(Math.random() * 8).toFixed(1)}s;
        --op:${(Math.random() * 0.6 + 0.15).toFixed(2)};
      `;
      bg.appendChild(s);
      els.push(s);
    }

    function makeMeteor(i, fromBottom) {
      const m = document.createElement("div");
      const len = Math.floor(Math.random() * 160 + 90);
      const thick = Math.random() * 1.4 + 0.7;
      const spd = (Math.random() * 3 + 2).toFixed(1);
      const dl = `-${(Math.random() * 12).toFixed(1)}s`;
      const mop = (Math.random() * 0.45 + 0.35).toFixed(2);
      const dist = Math.floor(Math.random() * 220 + 180);

      if (fromBottom) {
        // from bottom-right going up-left
        m.style.cssText = `
          position:absolute;pointer-events:none;opacity:0;
          left:${(Math.random() * 90).toFixed(1)}%;
          bottom:${(Math.random() * 25).toFixed(1)}%;
          animation:sbShootUp ${spd}s linear infinite ${dl};
          --mop:${mop};--mx:-${dist}px;--my:-${Math.floor(dist * 0.55)}px;
        `;
      } else {
        // from top going down-right
        m.style.cssText = `
          position:absolute;pointer-events:none;opacity:0;
          left:${(Math.random() * 90).toFixed(1)}%;
          top:${(Math.random() * 25).toFixed(1)}%;
          animation:sbShoot ${spd}s linear infinite ${dl};
          --mop:${mop};--mx:${dist}px;--my:${Math.floor(dist * 0.55)}px;
        `;
      }

      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", len + 6);
      svg.setAttribute("height", thick * 4 + 6);
      svg.setAttribute("viewBox", `0 0 ${len + 6} ${thick * 4 + 6}`);

      const defs = document.createElementNS(svgNS, "defs");
      const grad = document.createElementNS(svgNS, "linearGradient");
      const gid = `sbmg${i}`;
      grad.setAttribute("id", gid);
      grad.setAttribute("x1", "0%");
      grad.setAttribute("y1", "0%");
      grad.setAttribute("x2", "100%");
      grad.setAttribute("y2", "0%");
      [
        ["0%", "#ffffff", "0"],
        ["75%", "#ede9fe", "0.88"],
        ["100%", "#ffffff", "1"],
      ].forEach(([o, c, op]) => {
        const stop = document.createElementNS(svgNS, "stop");
        stop.setAttribute("offset", o);
        stop.setAttribute("stop-color", c);
        stop.setAttribute("stop-opacity", op);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
      svg.appendChild(defs);

      const glow = document.createElementNS(svgNS, "rect");
      glow.setAttribute("x", "2");
      glow.setAttribute("y", `${thick * 0.6}`);
      glow.setAttribute("width", len);
      glow.setAttribute("height", `${thick * 2.5}`);
      glow.setAttribute("rx", `${thick * 1.2}`);
      glow.setAttribute("fill", `url(#${gid})`);
      glow.setAttribute("opacity", "0.22");
      svg.appendChild(glow);

      const core = document.createElementNS(svgNS, "rect");
      core.setAttribute("x", "2");
      core.setAttribute("y", `${thick * 1.3}`);
      core.setAttribute("width", len);
      core.setAttribute("height", `${thick * 0.85}`);
      core.setAttribute("rx", `${thick * 0.4}`);
      core.setAttribute("fill", `url(#${gid})`);
      svg.appendChild(core);

      const tip = document.createElementNS(svgNS, "circle");
      tip.setAttribute("cx", `${len + 2}`);
      tip.setAttribute("cy", `${thick * 1.75}`);
      tip.setAttribute("r", `${thick * 1.1}`);
      tip.setAttribute("fill", "#ffffff");
      tip.setAttribute("opacity", "0.95");
      svg.appendChild(tip);

      m.appendChild(svg);
      bg.appendChild(m);
      els.push(m);
    }

    // 9 from top, 7 from bottom
    for (let i = 0; i < 9; i++) makeMeteor(i, false);
    for (let i = 9; i < 16; i++) makeMeteor(i, true);

    return () => els.forEach((el) => el.remove());
  }, []);

  return (
    <div
      ref={bgRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0d0f18]"
    />
  );
}

/* ─── Confetti ─── */
function celebrate() {
  const colors = [
    "#a78bfa",
    "#818cf8",
    "#e2e8f0",
    "#7dd3fc",
    "#c4b5fd",
    "#ddd6fe",
  ];
  const cont = document.createElement("div");
  cont.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:600;overflow:hidden;";
  document.body.appendChild(cont);
  const style = document.createElement("style");
  style.textContent =
    "@keyframes sbConf{0%{transform:translateY(0)rotate(0);opacity:1;}100%{transform:translateY(-110vh)rotate(720deg);opacity:0;}}";
  document.head.appendChild(style);
  for (let i = 0; i < 90; i++) {
    const c = document.createElement("div");
    const col = colors[Math.floor(Math.random() * colors.length)];
    const sz = Math.random() * 8 + 4;
    c.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:105%;width:${sz}px;height:${sz}px;background:${col};border-radius:${Math.random() > 0.5 ? "50%" : "3px"};animation:sbConf ${(Math.random() * 1.5 + 1).toFixed(2)}s ease-in ${(Math.random() * 1.8).toFixed(2)}s 1 forwards;`;
    cont.appendChild(c);
  }
  setTimeout(() => {
    cont.remove();
    style.remove();
  }, 5000);
}

/* ══════════════ MAIN ══════════════ */
export default function StreakBible() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const [weekHistory, setWeekHistory] = useState(Array(7).fill(false));
  const [bumping, setBumping] = useState(false);
  const [toast, setToast] = useState({ msg: "", show: false });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) await loadData(u);
      else resetState();
    });
    return unsub;
  }, []);

  function resetState() {
    setStreak(0);
    setTodayDone(false);
    setWeekHistory(Array(7).fill(false));
  }

  async function loadData(u) {
    const snap = await getDoc(doc(db, "streakBible", u.uid));
    if (!snap.exists()) {
      resetState();
      return;
    }
    const data = snap.data();
    const prayers = data.prayers || {};
    const savedStreak = data.streak || 0;
    const today = todayStr();
    const prayedToday = !!prayers[today];

    // lastPrayedDate من الـ document مباشرة (زي Streak.jsx)
    const lastDate = data.lastPrayedDate;
    const diff = lastDate ? daysDiff(today, lastDate) : 0;
    const missedDays = Math.max(0, diff - 1);
    const correctedStreak = Math.max(0, savedStreak - missedDays);

    // لو فيه خصم، صحح في Firestore وحدّث lastPrayedDate لإمبارح
    // عشان أي refresh جاي يلاقي diff = 0 ومش يخصم تاني
    if (correctedStreak !== savedStreak) {
      const yesterday = egyptNow();
      yesterday.setDate(yesterday.getDate() - 1);
      await setDoc(
        doc(db, "streakBible", u.uid),
        { streak: correctedStreak, lastPrayedDate: dateToStr(yesterday) },
        { merge: true },
      );
    }

    // weekHistory بتوقيت مصر
    const newWeek = Array(7).fill(false);
    for (let i = 0; i < 7; i++) {
      const d = egyptNow();
      d.setDate(d.getDate() - i);
      if (prayers[dateToStr(d)]) newWeek[d.getDay()] = true;
    }

    setStreak(correctedStreak);
    setTodayDone(prayedToday);
    setWeekHistory(newWeek);
  }

  function showToast(msg) {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }

  async function signInGoogle() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch {
      showToast("Sign-in failed.");
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    resetState();
    showToast("Signed out 🙏");
  }

  async function markPrayer() {
    if (!user || todayDone) return;
    const today = todayStr();
    const egypt = egyptNow();
    const dayIdx = egypt.getDay();
    const dayName = DAY_NAMES[dayIdx];

    const snap = await getDoc(doc(db, "streakBible", user.uid));
    const data = snap.exists() ? snap.data() : {};
    const prayers = data.prayers || {};
    const savedStreak = data.streak || 0;
    const lastDate = data.lastPrayedDate;

    // حساب الـ streak بعد الخصم (نفس منطق Streak.jsx)
    const diff = lastDate ? daysDiff(today, lastDate) : 0;
    const missedDays = Math.max(0, diff - 1);
    const streakAfterPenalty = Math.max(0, savedStreak - missedDays);
    const newStreak = streakAfterPenalty + 1;

    // الـ prayers الجديدة بعد إضافة النهارده
    const updatedPrayers = {
      ...prayers,
      [today]: { dayOfWeek: dayName, time: null },
    };

    // weekHistory بتوقيت مصر
    const newWeek = Array(7).fill(false);
    for (let i = 0; i < 7; i++) {
      const d = egyptNow();
      d.setDate(d.getDate() - i);
      const dStr = dateToStr(d);
      if (updatedPrayers[dStr]) newWeek[d.getDay()] = true;
    }
    newWeek[dayIdx] = true;

    setTodayDone(true);
    setStreak(newStreak);
    setWeekHistory(newWeek);
    setBumping(true);
    setTimeout(() => setBumping(false), 500);
    celebrate();

    await setDoc(
      doc(db, "streakBible", user.uid),
      {
        displayName: user.displayName || "Anonymous",
        email: user.email || "",
        streak: newStreak,
        lastPrayedDate: today,
        weekHistory: newWeek,
        prayers: {
          ...prayers,
          [today]: { dayOfWeek: dayName, time: serverTimestamp() },
        },
      },
      { merge: true },
    );
  }

  const todayIdx = egyptNow().getDay();

  return (
    <>
      <style>{`
        @keyframes sbTw {
          0%,100%{opacity:0.06;transform:scale(0.6);}
          50%{opacity:var(--op);transform:scale(1);}
        }
        @keyframes sbShoot {
          0%{transform:rotate(-28deg) translate(0,0);opacity:0;}
          3%{opacity:var(--mop);}
          85%{opacity:var(--mop);}
          100%{transform:rotate(-28deg) translate(var(--mx),var(--my));opacity:0;}
        }
        @keyframes sbShootUp {
          0%{transform:rotate(-28deg) translate(0,0);opacity:0;}
          3%{opacity:var(--mop);}
          85%{opacity:var(--mop);}
          100%{transform:rotate(-28deg) translate(var(--mx),var(--my));opacity:0;}
        }
        @keyframes sbBump {
          0%{transform:scale(1);}
          40%{transform:scale(1.3);}
          100%{transform:scale(1);}
        }
        @keyframes sbPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.0);}
          50%{box-shadow:0 0 0 20px rgba(139,92,246,0.07);}
        }
        @keyframes sbRing {
          0%{transform:scale(0.88);opacity:0.55;}
          100%{transform:scale(1.75);opacity:0;}
        }
        @keyframes sbFloat {
          0%,100%{transform:translateY(0);}
          50%{transform:translateY(-9px);}
        }
        @keyframes sbFadeUp {
          from{opacity:0;transform:translateY(18px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes sbGlow {
          0%,100%{opacity:0.5;}
          50%{opacity:1;}
        }
        .sb-bump{animation:sbBump 0.5s cubic-bezier(.36,.07,.19,.97) both;}
        .sb-fadein{animation:sbFadeUp 0.7s ease both;}
        .sb-float{animation:sbFloat 4s ease-in-out infinite;}
        .sb-ring{box-shadow:0 0 18px rgba(99,102,241,0.45);}
        .sb-pray-btn{animation:sbPulse 3s ease-in-out infinite;}
        .sb-pray-btn:hover{transform:scale(1.06);}
        .sb-pray-done{box-shadow:0 0 48px rgba(99,102,241,0.28);}
        .sb-google-btn:hover{transform:scale(1.04);}
      `}</style>

      <Background />

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-[5] min-h-screen flex flex-col items-center justify-center px-5 py-[88px] pb-[110px]">
        {/* ── Header ── */}
        <div className="sb-fadein text-center mb-[52px]">
          <p className="text-[11px] tracking-[0.32em] text-indigo-500 uppercase mb-[10px]">
            Daily devotion
          </p>
          <h2 className="font-serif text-[clamp(2.4rem,6vw,3.4rem)] font-bold text-slate-100 tracking-[-0.01em] leading-[1.1]">
            Prayer Streak
          </h2>
        </div>

        {/* ── Auth banner ── */}
        {!authLoading && !user && (
          <div className="sb-fadein w-full max-w-[500px] mb-7">
            <div className="bg-indigo-500/[0.07] border border-indigo-500/[0.18] rounded-3xl px-7 py-[34px] text-center">
              <p className="text-slate-500 text-[15px] mb-[22px]">
                Sign in to track your prayer streak
              </p>
              <button
                onClick={signInGoogle}
                className="sb-google-btn inline-flex items-center gap-[10px] bg-indigo-500/[0.14] border border-indigo-500/[0.32] rounded-2xl px-[26px] py-3 text-indigo-300 text-[15px] font-semibold cursor-pointer transition-all duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-7.9 19.7-20 0-1.3-.1-2.7-.1-4z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.4l-6.5 5C9.6 39.6 16.3 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.6 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        )}

        {/* ── User pill ── */}
        {!authLoading && user && (
          <div className="sb-fadein flex items-center gap-[10px] mb-9 bg-white/[0.04] border border-white/[0.07] rounded-full px-[18px] py-[9px]">
            <span className="text-slate-300 text-sm">{user.displayName}</span>
            <button
              onClick={handleSignOut}
              className="ml-1.5 bg-transparent border-none text-indigo-500 text-xs cursor-pointer px-2.5 py-[3px] rounded-lg transition-colors duration-200 hover:bg-indigo-500/[0.12]"
            >
              Sign out
            </button>
          </div>
        )}

        {/* ── Streak Card ── */}
        <div className="sb-fadein w-full max-w-[520px] mb-[22px]">
          <div className="bg-[#0d0f1c]/[0.82] border border-indigo-500/[0.18] rounded-[32px] px-11 pt-[52px] pb-[46px] backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute -top-[70px] -left-[70px] w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.13),transparent_70%)] pointer-events-none" />
            <div className="absolute -bottom-[70px] -right-[70px] w-[240px] h-[240px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.11),transparent_70%)] pointer-events-none" />

            <div className="relative z-[2] text-center">
              {/* icon + number */}
              <div className="flex items-center justify-center gap-5 mb-2">
                <div className="sb-float">
                  <FaBible size={52} color="#818cf8" />
                </div>
                <div
                  className={`font-serif text-[clamp(5.5rem,15vw,9rem)] font-bold text-indigo-300 leading-none tracking-[-0.02em] ${bumping ? "sb-bump" : ""}`}
                >
                  {streak}
                </div>
              </div>
              <p className="text-[11px] tracking-[0.35em] text-slate-700 uppercase mb-[38px]">
                days in a row
              </p>

              {/* week dots */}
              <div className="flex justify-center gap-3 flex-wrap">
                {DAYS.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-[7px]">
                    <div
                      className={[
                        "w-12 h-12 rounded-full flex items-center justify-center text-base transition-all duration-300",
                        weekHistory[i]
                          ? "bg-indigo-500/[0.88] border-[1.5px] border-indigo-400 text-white sb-ring"
                          : i === todayIdx
                            ? "bg-white/[0.03] border-[1.5px] border-indigo-500/45 text-transparent"
                            : "bg-white/[0.03] border-[1.5px] border-white/[0.07] text-transparent",
                      ].join(" ")}
                    >
                      {weekHistory[i] ? "✓" : ""}
                    </div>
                    <span
                      className={`text-[10px] tracking-wider uppercase ${i === todayIdx ? "text-indigo-500" : "text-slate-900"}`}
                    >
                      {d}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Pray Button Card ── */}
        <div className="sb-fadein w-full max-w-[520px] mb-[22px]">
          <div className="bg-[#0d0f1c]/[0.82] border border-indigo-500/[0.18] rounded-[32px] px-11 py-11 text-center relative overflow-hidden backdrop-blur-2xl">
            <div className="absolute -top-[50px] -right-[50px] w-[220px] h-[220px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.11),transparent_70%)] pointer-events-none" />
            <div className="absolute -bottom-[50px] -left-[50px] w-[180px] h-[180px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08),transparent_70%)] pointer-events-none" />

            <p className="text-[11px] tracking-[0.32em] text-slate-700 uppercase mb-8">
              Today's prayer
            </p>

            {!user ? (
              <p className="text-slate-900 text-[15px]">
                Sign in to mark your prayer
              </p>
            ) : (
              <div className="relative inline-flex items-center justify-center">
                {!todayDone && (
                  <>
                    <div
                      className="absolute w-[190px] h-[190px] rounded-full border border-indigo-500/[0.18] pointer-events-none"
                      style={{ animation: "sbRing 2.4s ease-out infinite" }}
                    />
                    <div
                      className="absolute w-[190px] h-[190px] rounded-full border border-indigo-500/[0.18] pointer-events-none"
                      style={{
                        animation: "sbRing 2.4s ease-out 1.2s infinite",
                      }}
                    />
                  </>
                )}
                <button
                  onClick={markPrayer}
                  disabled={todayDone}
                  className={[
                    "w-[155px] h-[155px] rounded-full flex flex-col items-center justify-center gap-[10px] transition-all duration-300 border-2",
                    todayDone
                      ? "bg-indigo-500/[0.22] border-indigo-400 sb-pray-done cursor-default"
                      : "bg-indigo-500/[0.09] border-indigo-500/[0.38] cursor-pointer sb-pray-btn",
                  ].join(" ")}
                >
                  <FaBible
                    size={28}
                    color={todayDone ? "#a5b4fc" : "#818cf8"}
                  />
                  <span
                    className={`text-[11px] tracking-[3px] uppercase font-semibold ${todayDone ? "text-indigo-300" : "text-indigo-400"}`}
                  >
                    {todayDone ? "Done" : "Pray"}
                  </span>
                </button>
              </div>
            )}

            {todayDone && (
              <div className="mt-[26px]">
                <span className="inline-flex items-center gap-2 bg-indigo-500/[0.11] border border-indigo-500/[0.22] rounded-full px-6 py-[10px] text-sm text-indigo-300">
                  ✓ Prayed today — streak +1
                </span>
              </div>
            )}
          </div>
        </div>
        <BibleReadingTracker user={user} />
      </main>
      <TopRankingBible currentUserId={user?.uid} />

      {/* ── Toast ── */}
      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[300] pointer-events-none">
        <div
          className={[
            "bg-[#0d0f1c]/[0.96] border border-indigo-500/[0.28] rounded-2xl px-[26px] py-[11px] text-slate-200 text-sm whitespace-nowrap transition-all duration-300",
            toast.show
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3",
          ].join(" ")}
        >
          {toast.msg}
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}

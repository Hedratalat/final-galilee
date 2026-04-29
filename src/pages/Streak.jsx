import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

// Firebase
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import TopRanking from "../components/TopRanking/TopRanking";
import PrayerReminder from "../components/PrayerReminder/PrayerReminder";
import BlessingCelebration from "../components/BlessingCelebration/BlessingCelebration";
import DailyVerse from "../components/DailyVerse/DailyVerse";

/* ─────────────────────────────── constants ─────────────────────────────── */
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
const MILESTONES = [3, 7, 14, 30, 40, 100];
const COLORS = [
  { r: 255, g: 153, b: 51 },
  { r: 51, g: 102, b: 153 },
  { r: 255, g: 255, b: 255 },
  { r: 0, g: 51, b: 102 },
];

function egyptNow() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
  );
}

function dateToStr(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayStr() {
  return dateToStr(egyptNow());
}

/* ── جيب آخر يوم صلى فيه من prayers object ── */
function getLastPrayedDate(prayers = {}) {
  const dates = Object.keys(prayers).sort((a, b) => b.localeCompare(a));
  return dates.length > 0 ? dates[0] : null;
}

/* ── احسب الفرق بالأيام بين تاريخين string ── */
function daysDiff(dateStrA, dateStrB) {
  const a = new Date(dateStrA + "T00:00:00");
  const b = new Date(dateStrB + "T00:00:00");
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

/* ── احسب الـ streak الصحيح بعد الخصم ── */
function calcStreakWithPenalty(prayers = {}, savedStreak = 0) {
  const today = todayStr();
  const lastDate = getLastPrayedDate(prayers);

  // لو مفيش prayers خالص
  if (!lastDate) return 0;

  const diff = daysDiff(today, lastDate);

  // صلى النهارده أو امبارح → الـ streak تمام
  if (diff <= 1) return savedStreak;

  // فات أكتر من يوم → ينقص (diff - 1)
  const penalty = diff - 1;
  return Math.max(0, savedStreak - penalty);
}

/* ── احسب الـ streak من prayers من الصفر (للـ markPrayer) ── */
function calcStreakFromPrayers(prayers = {}) {
  let streak = 0;
  const egypt = egyptNow();
  let checkDate = new Date(egypt);

  // لو مصلاش النهارده، ابدأ من امبارح
  const todayPrayed = !!prayers[todayStr()];
  if (!todayPrayed) checkDate.setDate(checkDate.getDate() - 1);

  while (true) {
    const dStr = dateToStr(checkDate);
    if (prayers[dStr]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }
  return streak;
}

/* ──────────────────────────── particle canvas ───────────────────────────── */
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
  const canvasRef = useRef(null),
    rafRef = useRef(null);
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
    for (let i = 0; i < 70; i++)
      particles.push(mkParticle(side, SIDE_W, window.innerHeight));
    function draw() {
      const W = canvas.width,
        H = canvas.height;
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
      for (let i = 0; i < particles.length; i++)
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
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H)
          particles[i] = mkParticle(side, W, H);
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

/* ───────────────────────────── rain canvas ──────────────────────────────── */
const RAIN_SYMBOLS = ["✝", "✞", "☩", "✟", "☦", "★", "✦", "✧", "⋆", "✨"];
function mkDrop(W) {
  return {
    sym: RAIN_SYMBOLS[Math.floor(Math.random() * RAIN_SYMBOLS.length)],
    x: Math.random() * W,
    y: -60,
    speed: Math.random() * 1.2 + 0.4,
    size: Math.random() * 18 + 10,
    alpha: Math.random() * 0.45 + 0.1,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 1.2,
    swing: Math.random() * Math.PI * 2,
    swingSpeed: Math.random() * 0.015 + 0.005,
    swingAmp: Math.random() * 18 + 4,
  };
}
function RainCanvas() {
  const canvasRef = useRef(null),
    rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    const drops = [];
    while (drops.length < 55) drops.push(mkDrop(canvas.width));
    function draw() {
      const W = canvas.width,
        H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.y += d.speed;
        d.swing += d.swingSpeed;
        d.rotation += d.rotSpeed;
        const drawX = d.x + Math.sin(d.swing) * d.swingAmp;
        ctx.save();
        ctx.globalAlpha = d.alpha;
        ctx.translate(drawX, d.y);
        ctx.rotate((d.rotation * Math.PI) / 180);
        ctx.font = `${d.size}px serif`;
        ctx.fillStyle = "#ff993388";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(d.sym, 0, 0);
        ctx.restore();
        if (d.y > H + 60) {
          drops.splice(i, 1);
          drops.push(mkDrop(W));
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}

/* ──────────────────────────── confetti ──────────────────────────────────── */
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

/* ──────────────────────────── orb helper ────────────────────────────────── */
function Orb({ cls, w, h, bg, s }) {
  return (
    <div
      className={`${cls} absolute rounded-full pointer-events-none`}
      style={{ width: w, height: h, background: bg, ...s }}
    />
  );
}

/* ══════════════════════════════ MAIN ════════════════════════════════════════ */
export default function Streak() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const [weekHistory, setWeekHistory] = useState(Array(7).fill(false));
  const [bumping, setBumping] = useState(false);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [prayerLog, setPrayerLog] = useState([]);
  const [showBlessing, setShowBlessing] = useState(false);

  /* auth listener */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) await loadUserData(u);
      else resetState();
    });
    return unsub;
  }, []);

  function resetState() {
    setStreak(0);
    setTodayDone(false);
    setWeekHistory(Array(7).fill(false));
    setPrayerLog([]);
  }

  function buildPrayerLog(prayers = {}) {
    return Object.entries(prayers)
      .map(([date, val]) => ({ date, ...val }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async function loadUserData(u) {
    const snap = await getDoc(doc(db, "users", u.uid));
    if (!snap.exists()) {
      resetState();
      return;
    }
    const data = snap.data();
    const today = todayStr();
    const prayers = data.prayers || {};
    const savedStreak = data.streak || 0;

    // ── احسب الـ streak ──
    const prayedToday = !!prayers[today];
    // جيب lastPrayedDate من Firestore مش من prayers
    const lastDate = data.lastPrayedDate;

    // احسب الفرق بين النهارده وآخر يوم اتحسب فيه
    const diff = lastDate ? daysDiff(today, lastDate) : 0;

    // الأيام اللي عدت كاملة — يوم النهارده لسه شغال مش بيتخصم
    const missedDays = Math.max(0, diff - 1);

    // طبق الخصم
    const correctedStreak = Math.max(0, savedStreak - missedDays);

    // لو فيه خصم → اكتب في Firestore وحدّث lastPrayedDate
    // عشان أي refresh جاي يلاقي diff = 0 ومش يخصم تاني
    if (correctedStreak !== savedStreak) {
      await setDoc(
        doc(db, "users", u.uid),
        {
          streak: correctedStreak,
          lastPrayedDate: today,
        },
        { merge: true },
      );
    }

    // ── الـ weekHistory بتوقيت مصر ──
    const newWeek = Array(7).fill(false);
    for (let i = 0; i < 7; i++) {
      const egypt = egyptNow();
      egypt.setDate(egypt.getDate() - i);
      const dStr = dateToStr(egypt);
      if (prayers[dStr]) newWeek[egypt.getDay()] = true;
    }

    setStreak(correctedStreak);
    setTodayDone(prayedToday);
    setWeekHistory(newWeek);
    setPrayerLog(buildPrayerLog(prayers));
  }

  function showToast(msg) {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3200);
  }

  async function signInGoogle() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch {
      showToast("Sign-in failed, try again.");
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

    const snap = await getDoc(doc(db, "users", user.uid));
    const prayers = snap.exists() ? snap.data().prayers || {} : {};
    const savedStreak = snap.exists() ? snap.data().streak || 0 : 0;

    // ── الـ prayers الجديدة بعد إضافة النهارده ──
    const updatedPrayers = {
      ...prayers,
      [today]: { dayOfWeek: dayName, time: null },
    };

    const lastDate = snap.data().lastPrayedDate;
    const diff = lastDate ? daysDiff(today, lastDate) : 0;
    const missedDays = Math.max(0, diff - 1);
    const streakAfterPenalty = Math.max(0, savedStreak - missedDays);
    const newStreak = streakAfterPenalty + 1;

    // ── الـ weekHistory بتوقيت مصر ──
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
    setTimeout(() => setBumping(false), 400);
    celebrate();
    setShowBlessing(true);
    setPrayerLog((prev) => [
      { date: today, dayOfWeek: dayName, time: null, streak: newStreak },
      ...prev.filter((e) => e.date !== today),
    ]);

    // ── اكتب على users فقط — مفيش community_feed ──
    await setDoc(
      doc(db, "users", user.uid),
      {
        displayName: user.displayName || "Anonymous",
        email: user.email || "",
        photoURL: user.photoURL || "",
        streak: newStreak,
        lastPrayedDate: today,
        weekHistory: newWeek,
        prayers: {
          [today]: { dayOfWeek: dayName, time: serverTimestamp() },
        },
      },
      { merge: true },
    );

    try {
      const updated = await getDoc(doc(db, "users", user.uid));
      if (updated.exists()) {
        setPrayerLog(buildPrayerLog(updated.data().prayers));
      }
    } catch {}
  }

  const todayDayIdx = egyptNow().getDay();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
        body{background:#0a0f1e;font-family:'Inter',sans-serif;}
        .cross-icon::before{content:'';position:absolute;left:50%;top:8%;transform:translateX(-50%);width:11px;height:84%;background:#ff9933;border-radius:6px;}
        .cross-icon::after{content:'';position:absolute;top:26%;left:8%;width:84%;height:11px;background:#ff9933;border-radius:6px;}
        @keyframes floatCross{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-10px) rotate(2deg);}}
        @keyframes glowPulse{0%,100%{transform:scale(1);opacity:.7;}50%{transform:scale(1.4);opacity:1;}}
        @keyframes orbFloat{0%,100%{transform:scale(1) translate(0,0);}50%{transform:scale(1.2) translate(8px,-8px);}}
        @keyframes flameDance{0%{transform:rotate(-8deg) scale(1);}100%{transform:rotate(8deg) scale(1.12);}}
        @keyframes todayRing{0%,100%{box-shadow:0 0 0 4px rgba(255,255,255,.15);}50%{box-shadow:0 0 0 8px rgba(255,255,255,.07);}}
        @keyframes ringExpand{0%{transform:scale(.85);opacity:.8;}100%{transform:scale(1.5);opacity:0;}}
        @keyframes fadeUp{0%{opacity:0;transform:translateY(14px);}100%{opacity:1;transform:translateY(0);}}
        .anim-cross{animation:floatCross 4s ease-in-out infinite;}
        .anim-glow{animation:glowPulse 3s ease-in-out infinite;}
        .anim-orb-1{animation:orbFloat 5s ease-in-out infinite;}
        .anim-orb-2{animation:orbFloat 6s ease-in-out infinite reverse;}
        .anim-orb-3{animation:orbFloat 4s ease-in-out 1s infinite;}
        .anim-flame{animation:flameDance .5s ease-in-out infinite alternate;}
        .anim-today{animation:todayRing 2s ease-in-out infinite;}
        .anim-ring1{animation:ringExpand 2s ease-out infinite;}
        .anim-ring2{animation:ringExpand 2s ease-out 1s infinite;}
        .anim-bump{transform:scale(1.25)!important;}
        .log-row{animation:fadeUp .3s ease both;}
      `}</style>

      <div className="relative" style={{ zIndex: 200 }}>
        <Navbar />
      </div>
      <ParticleCanvas side="left" />
      <ParticleCanvas side="right" />
      <RainCanvas />

      <div className="flex min-h-screen relative" style={{ zIndex: 10 }}>
        <div className="hidden lg:block w-40 shrink-0" style={{ zIndex: 10 }} />
        <div className="flex-1" style={{ zIndex: 20 }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            {/* Header */}
            <div className="text-center pb-8 pt-4">
              <div className="inline-block relative mb-4">
                <div
                  className="anim-glow absolute rounded-full"
                  style={{
                    inset: "-16px",
                    background:
                      "radial-gradient(circle,#ff993330,transparent 70%)",
                  }}
                />
                <div
                  className="cross-icon anim-cross inline-block relative"
                  style={{ width: 64, height: 64 }}
                />
              </div>
              <h2
                className="font-bold text-white tracking-wide"
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(2rem,5vw,3rem)",
                }}
              >
                Prayer Streak
              </h2>
              <p
                className="text-xs uppercase mt-2"
                style={{ color: "#336699", letterSpacing: "0.25em" }}
              >
                Daily devotion tracker
              </p>
            </div>

            {/* Auth banner */}
            {!authLoading && !user && (
              <div
                className="rounded-3xl p-8 mb-5 relative overflow-hidden text-center"
                style={{ background: "#003366" }}
              >
                <Orb
                  cls="anim-orb-1"
                  w={280}
                  h={280}
                  bg="radial-gradient(circle,#ff993330,transparent 70%)"
                  s={{ top: -80, left: -80 }}
                />
                <Orb
                  cls="anim-orb-2"
                  w={220}
                  h={220}
                  bg="radial-gradient(circle,#33669930,transparent 70%)"
                  s={{ bottom: -60, right: -60 }}
                />
                <div className="relative" style={{ zIndex: 10 }}>
                  <p className="text-white/60 text-sm mb-5">
                    Sign in to track your prayer streak &amp; join the community
                  </p>
                  <button
                    onClick={signInGoogle}
                    className="inline-flex items-center gap-3 rounded-2xl px-7 py-3 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: "rgba(255,153,51,.15)",
                      border: "1px solid #ff993366",
                      color: "#ff9933",
                    }}
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

            {/* User pill */}
            {!authLoading && user && (
              <div
                className="flex items-center justify-between rounded-2xl px-5 py-3 mb-5"
                style={{
                  background: "rgba(255,153,51,.08)",
                  border: "1px solid #ff993322",
                }}
              >
                <span className="text-sm font-medium text-white/80">
                  {user.displayName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-xs px-3 py-1 rounded-lg transition-all hover:scale-105"
                  style={{ color: "#ff9933", border: "1px solid #ff993344" }}
                >
                  Sign out
                </button>
              </div>
            )}

            {/* Streak Card */}
            <div
              className="rounded-3xl p-8 sm:p-10 mb-5 relative overflow-hidden"
              style={{ background: "#003366" }}
            >
              <Orb
                cls="anim-orb-1"
                w={280}
                h={280}
                bg="radial-gradient(circle,#ff993330,transparent 70%)"
                s={{ top: -80, left: -80 }}
              />
              <Orb
                cls="anim-orb-2"
                w={220}
                h={220}
                bg="radial-gradient(circle,#33669930,transparent 70%)"
                s={{ bottom: -60, right: -60 }}
              />
              <Orb
                cls="anim-orb-3"
                w={150}
                h={150}
                bg="radial-gradient(circle,#ff993318,transparent 70%)"
                s={{ top: "40%", right: "10%" }}
              />
              <div className="relative text-center" style={{ zIndex: 10 }}>
                <div className="flex items-center justify-center gap-6">
                  <span
                    className="anim-flame inline-block"
                    style={{ fontSize: "clamp(2.5rem,6vw,4rem)" }}
                  >
                    🔥
                  </span>
                  <div
                    className={`transition-transform duration-300 ${bumping ? "anim-bump" : ""}`}
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontWeight: 700,
                      color: "#ff9933",
                      lineHeight: 1,
                      fontSize: "clamp(4rem,10vw,7rem)",
                    }}
                  >
                    {streak}
                  </div>
                </div>
                <p
                  className="text-xs uppercase mt-3"
                  style={{ color: "#ffffff70", letterSpacing: "0.3em" }}
                >
                  days in a row
                </p>
                <div className="flex justify-center gap-2 sm:gap-3 mt-6 flex-wrap">
                  {DAYS.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={[
                          "rounded-full border-2 flex items-center justify-center transition-all duration-300",
                          weekHistory[i] ? "" : "bg-white/5",
                          i === todayDayIdx ? "anim-today" : "",
                        ].join(" ")}
                        style={{
                          width: "clamp(32px,5vw,48px)",
                          height: "clamp(32px,5vw,48px)",
                          fontSize: "clamp(.7rem,1.5vw,1rem)",
                          background: weekHistory[i] ? "#ff9933" : undefined,
                          borderColor: weekHistory[i]
                            ? "#ff9933"
                            : i === todayDayIdx
                              ? "rgba(255,255,255,.4)"
                              : "#336699",
                          color: weekHistory[i] ? "#fff" : "transparent",
                          boxShadow: weekHistory[i]
                            ? "0 0 16px #ff993388"
                            : undefined,
                        }}
                      >
                        {weekHistory[i] ? "✓" : ""}
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
              <Orb
                cls="anim-orb-1"
                w={280}
                h={280}
                bg="radial-gradient(circle,#ff993330,transparent 70%)"
                s={{ top: -80, left: -80 }}
              />
              <Orb
                cls="anim-orb-2"
                w={220}
                h={220}
                bg="radial-gradient(circle,#33669930,transparent 70%)"
                s={{ bottom: -60, right: -60 }}
              />
              <div className="relative text-center" style={{ zIndex: 10 }}>
                <p
                  className="text-xs uppercase mb-6"
                  style={{ color: "#ffffff70", letterSpacing: "0.3em" }}
                >
                  Today's prayer
                </p>
                {!user && (
                  <p className="text-white/40 text-sm mb-4">
                    Sign in above to mark your prayer ✝
                  </p>
                )}
                <div className="relative inline-flex items-center justify-center my-2">
                  <div
                    className="anim-ring1 absolute rounded-full border pointer-events-none"
                    style={{
                      width: "clamp(160px,22vw,200px)",
                      height: "clamp(160px,22vw,200px)",
                      borderColor: "#ff993322",
                    }}
                  />
                  <div
                    className="anim-ring2 absolute rounded-full border pointer-events-none"
                    style={{
                      width: "clamp(160px,22vw,200px)",
                      height: "clamp(160px,22vw,200px)",
                      borderColor: "#ff993322",
                    }}
                  />
                  <button
                    onClick={markPrayer}
                    disabled={!user || todayDone}
                    className="flex flex-col items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-default disabled:opacity-60"
                    style={{
                      width: "clamp(130px,18vw,170px)",
                      height: "clamp(130px,18vw,170px)",
                      border: `3px solid ${todayDone ? "#ff9933" : !user ? "#ffffff22" : "#ff993366"}`,
                      background: todayDone
                        ? "rgba(255,153,51,.25)"
                        : "rgba(255,153,51,.1)",
                      boxShadow: todayDone ? "0 0 40px #ff993555" : "none",
                      gap: 8,
                    }}
                  >
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
                      {!user ? "Locked" : todayDone ? "Done" : "Pray"}
                    </span>
                  </button>
                </div>
                {todayDone && (
                  <div className="mt-5">
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium"
                      style={{
                        background: "rgba(255,153,51,.15)",
                        border: "1px solid #ff993344",
                        color: "#ff9933",
                      }}
                    >
                      ✓ Prayed today — streak +1
                    </span>
                  </div>
                )}
              </div>
            </div>
            <PrayerReminder user={user} todayDone={todayDone} />
            <DailyVerse />

            {/* Milestones */}
            <div
              className="rounded-3xl p-8 sm:p-10 mb-5 relative overflow-hidden"
              style={{ background: "#003366" }}
            >
              <Orb
                cls="anim-orb-1"
                w={280}
                h={280}
                bg="radial-gradient(circle,#ff993330,transparent 70%)"
                s={{ top: -80, left: -80 }}
              />
              <Orb
                cls="anim-orb-2"
                w={220}
                h={220}
                bg="radial-gradient(circle,#33669930,transparent 70%)"
                s={{ bottom: -60, right: -60 }}
              />
              <div className="relative text-center" style={{ zIndex: 10 }}>
                <p
                  className="text-xs uppercase mb-5"
                  style={{ color: "#ffffff70", letterSpacing: "0.3em" }}
                >
                  Milestones
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {MILESTONES.map((m) => {
                    const reached = streak >= m;
                    return (
                      <div
                        key={m}
                        className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm transition-all duration-300"
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

            {/* My Prayer Log */}
            {user && prayerLog.length > 0 && (
              <div
                className="rounded-3xl p-8 sm:p-10 mb-5 relative overflow-hidden"
                style={{ background: "#003366" }}
              >
                <Orb
                  cls="anim-orb-1"
                  w={280}
                  h={280}
                  bg="radial-gradient(circle,#ff993330,transparent 70%)"
                  s={{ top: -80, left: -80 }}
                />
                <Orb
                  cls="anim-orb-2"
                  w={220}
                  h={220}
                  bg="radial-gradient(circle,#33669930,transparent 70%)"
                  s={{ bottom: -60, right: -60 }}
                />
                <div className="relative" style={{ zIndex: 10 }}>
                  <p
                    className="text-xs uppercase mb-5 text-center"
                    style={{ color: "#ffffff70", letterSpacing: "0.3em" }}
                  >
                    📖 My Prayer Log
                  </p>
                  <div className="flex flex-col gap-2">
                    {prayerLog.map((entry, idx) => (
                      <div
                        key={entry.date}
                        className="log-row flex items-center justify-between rounded-2xl px-4 py-3"
                        style={{
                          background:
                            entry.date === todayStr()
                              ? "rgba(255,153,51,.08)"
                              : "rgba(255,255,255,.04)",
                          border:
                            entry.date === todayStr()
                              ? "1px solid #ff993333"
                              : "1px solid #ffffff0a",
                          animationDelay: `${idx * 0.04}s`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="relative shrink-0"
                            style={{ width: 18, height: 18 }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                left: "50%",
                                top: "5%",
                                transform: "translateX(-50%)",
                                width: 3,
                                height: "90%",
                                background: "#ff9933",
                                borderRadius: 2,
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                top: "28%",
                                left: "5%",
                                width: "90%",
                                height: 3,
                                background: "#ff9933",
                                borderRadius: 2,
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {entry.dayOfWeek}
                              {entry.date === todayStr() && (
                                <span
                                  className="ml-2 text-xs"
                                  style={{ color: "#ff9933" }}
                                >
                                  • Today
                                </span>
                              )}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "#ffffff50" }}
                            >
                              {entry.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xs"
                            style={{ color: "#ffffff60" }}
                          >
                            {entry.time?.toDate
                              ? entry.time
                                  .toDate()
                                  .toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                              : "—"}
                          </span>
                          <span
                            className="text-xs rounded-full px-3 py-1 font-semibold"
                            style={{
                              background: "rgba(255,153,51,.12)",
                              color: "#ff9933",
                              border: "1px solid #ff993333",
                            }}
                          >
                            🔥 {entry.streak}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="hidden lg:block w-40 shrink-0" style={{ zIndex: 10 }} />
      </div>
      <TopRanking currentUserId={user?.uid} />

      {/* Blessing Celebration */}
      {showBlessing && (
        <BlessingCelebration
          streak={streak}
          onClose={() => setShowBlessing(false)}
        />
      )}

      {/* Toast */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ zIndex: 300 }}
      >
        <div
          className={`rounded-2xl px-7 py-3 text-base text-white whitespace-nowrap transition-all duration-300 ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          style={{ background: "#003366", border: "1px solid #ff993344" }}
        >
          {toast.msg}
        </div>
      </div>

      <div className="relative" style={{ zIndex: 200 }}>
        <Footer />
      </div>
    </>
  );
}

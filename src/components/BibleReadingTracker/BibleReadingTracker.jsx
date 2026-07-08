import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const BIBLE_BOOKS = [
  { name: "تكوين", chapters: 50 },
  { name: "خروج", chapters: 40 },
  { name: "لاويين", chapters: 27 },
  { name: "عدد", chapters: 36 },
  { name: "تثنية", chapters: 34 },
  { name: "يشوع", chapters: 24 },
  { name: "قضاة", chapters: 21 },
  { name: "راعوث", chapters: 4 },
  { name: "صموئيل الأول", chapters: 31 },
  { name: "صموئيل الثاني", chapters: 24 },
  { name: "ملوك الأول", chapters: 22 },
  { name: "ملوك الثاني", chapters: 25 },
  { name: "أخبار الأيام الأول", chapters: 29 },
  { name: "أخبار الأيام الثاني", chapters: 36 },
  { name: "عزرا", chapters: 10 },
  { name: "نحميا", chapters: 13 },
  { name: "أستير", chapters: 10 },
  { name: "أيوب", chapters: 42 },
  { name: "مزامير", chapters: 150 },
  { name: "أمثال", chapters: 31 },
  { name: "جامعة", chapters: 12 },
  { name: "نشيد الأنشاد", chapters: 8 },
  { name: "إشعياء", chapters: 66 },
  { name: "إرميا", chapters: 52 },
  { name: "مراثي إرميا", chapters: 5 },
  { name: "حزقيال", chapters: 48 },
  { name: "دانيال", chapters: 12 },
  { name: "هوشع", chapters: 14 },
  { name: "يوئيل", chapters: 3 },
  { name: "عاموس", chapters: 9 },
  { name: "عوبديا", chapters: 1 },
  { name: "يونان", chapters: 4 },
  { name: "ميخا", chapters: 7 },
  { name: "ناحوم", chapters: 3 },
  { name: "حبقوق", chapters: 3 },
  { name: "صفنيا", chapters: 3 },
  { name: "حجي", chapters: 2 },
  { name: "زكريا", chapters: 14 },
  { name: "ملاخي", chapters: 4 },
  { name: "متى", chapters: 28 },
  { name: "مرقس", chapters: 16 },
  { name: "لوقا", chapters: 24 },
  { name: "يوحنا", chapters: 21 },
  { name: "أعمال الرسل", chapters: 28 },
  { name: "رومية", chapters: 16 },
  { name: "كورنثوس الأولى", chapters: 16 },
  { name: "كورنثوس الثانية", chapters: 13 },
  { name: "غلاطية", chapters: 6 },
  { name: "أفسس", chapters: 6 },
  { name: "فيلبي", chapters: 4 },
  { name: "كولوسي", chapters: 4 },
  { name: "تسالونيكي الأولى", chapters: 5 },
  { name: "تسالونيكي الثانية", chapters: 3 },
  { name: "تيموثاوس الأولى", chapters: 6 },
  { name: "تيموثاوس الثانية", chapters: 4 },
  { name: "تيطس", chapters: 3 },
  { name: "فليمون", chapters: 1 },
  { name: "عبرانيين", chapters: 13 },
  { name: "يعقوب", chapters: 5 },
  { name: "بطرس الأولى", chapters: 5 },
  { name: "بطرس الثانية", chapters: 3 },
  { name: "يوحنا الأولى", chapters: 5 },
  { name: "يوحنا الثانية", chapters: 1 },
  { name: "يوحنا الثالثة", chapters: 1 },
  { name: "يهوذا", chapters: 1 },
  { name: "رؤيا يوحنا", chapters: 22 },
];

const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((s, b) => s + b.chapters, 0);

/* ─── رسائل الاحتفال بخلاص سفر كامل ─── */
const BOOK_MESSAGES = [
  {
    icon: "👑",
    title: "ملك الأسفار",
    sub: "أتممت سفرًا كاملًا بنعمة الله — المجد له وحده",
  },
  {
    icon: "🔥",
    title: "نار الروح القدس",
    sub: "كلمة الله تشتعل في قلبك — لا تتوقف",
  },
  {
    icon: "⚡",
    title: "قوة لا تُقاوم",
    sub: "أنهيت سفرًا كاملًا — السماء تبتهج بك الآن",
  },
  {
    icon: "🏆",
    title: "بطل الكتاب المقدس",
    sub: "سفر آخر يُختم — مسيرتك مع الله لا تُوقف",
  },
  {
    icon: "✨",
    title: "نور في الظلام",
    sub: "كلمتك نور لرجلي — أتممت سفرًا آخر بإيمان",
  },
  {
    icon: "🎺",
    title: "الأبواق تُعلن",
    sub: "السماء تُهلل لك — أكملت سفرًا كاملًا بثبات",
  },
  {
    icon: "💎",
    title: "أثمن من الجواهر",
    sub: "اجتهادك في كلمة الله لا يقدّر بثمن — مبروك",
  },
  {
    icon: "🌟",
    title: "نجم يضيء",
    sub: "سفر كامل في سجل إيمانك — الرب يراك ويُكافئك",
  },
];

/* ─── confetti ضخم ─── */
function launchConfetti(
  count = 120,
  colors = [
    "#a78bfa",
    "#818cf8",
    "#e2e8f0",
    "#7dd3fc",
    "#c4b5fd",
    "#fbbf24",
    "#f472b6",
  ],
) {
  const cont = document.createElement("div");
  cont.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:1000;overflow:hidden;";
  document.body.appendChild(cont);

  const style = document.createElement("style");
  const id = "brt" + Date.now();
  style.textContent = `
    @keyframes ${id}Up{0%{transform:translateY(0)rotate(0)scale(1);opacity:1;}100%{transform:translateY(-115vh)rotate(900deg)scale(0.4);opacity:0;}}
    @keyframes ${id}Wave{0%,100%{margin-left:0;}50%{margin-left:30px;}}
  `;
  document.head.appendChild(style);

  for (let i = 0; i < count; i++) {
    const c = document.createElement("div");
    const col = colors[Math.floor(Math.random() * colors.length)];
    const sz = Math.random() * 14 + 6;
    const dur = (Math.random() * 2 + 1.2).toFixed(2);
    const del = (Math.random() * 2).toFixed(2);
    const isCircle = Math.random() > 0.4;
    c.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:108%;
      width:${sz}px;height:${sz}px;
      background:${col};
      border-radius:${isCircle ? "50%" : "3px"};
      animation:${id}Up ${dur}s ease-in ${del}s 1 forwards, ${id}Wave ${(Math.random() * 1 + 0.5).toFixed(2)}s ease-in-out ${del}s infinite alternate;
      box-shadow: 0 0 ${Math.random() * 8 + 4}px ${col}88;
    `;
    cont.appendChild(c);
  }

  setTimeout(() => {
    cont.remove();
    style.remove();
  }, 6000);
}

/* ─── احتفال أصحاح واحد ─── */
function chapterCelebrate() {
  launchConfetti(55);
}

/* ─── احتفال سفر كامل ─── */
function bookCelebrate() {
  launchConfetti(180);
  // موجة ثانية بعد ثانية
  setTimeout(
    () =>
      launchConfetti(120, [
        "#fbbf24",
        "#f472b6",
        "#34d399",
        "#60a5fa",
        "#ffffff",
      ]),
    1000,
  );
  // موجة ثالثة
  setTimeout(() => launchConfetti(80), 2200);
}

/* ══════════════════════════ MAIN ══════════════════════════ */
export default function BibleReadingTracker({ user }) {
  const [progress, setProgress] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [bookPopup, setBookPopup] = useState(null); // { bookName, msg }

  useEffect(() => {
    if (!user) {
      setProgress({});
      setLoading(false);
      return;
    }
    (async () => {
      const snap = await getDoc(doc(db, "streakBible", user.uid));
      if (snap.exists()) setProgress(snap.data().bibleProgress || {});
      setLoading(false);
    })();
  }, [user]);

  function showToast(msg) {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }

  async function toggleChapter(bookName, chapterNum) {
    if (!user) return;
    const book = BIBLE_BOOKS.find((b) => b.name === bookName);
    const current = progress[bookName] || [];
    const isRead = current.includes(chapterNum);

    const updatedChapters = isRead
      ? current.filter((c) => c !== chapterNum)
      : [...current, chapterNum].sort((a, b) => a - b);

    const updatedProgress = { ...progress, [bookName]: updatedChapters };
    setProgress(updatedProgress);

    await setDoc(
      doc(db, "streakBible", user.uid),
      { bibleProgress: updatedProgress },
      { merge: true },
    );

    if (!isRead) {
      const finishedBook = updatedChapters.length === book.chapters;
      if (finishedBook) {
        bookCelebrate();
        const msg =
          BOOK_MESSAGES[Math.floor(Math.random() * BOOK_MESSAGES.length)];
        setBookPopup({ bookName, ...msg });
      } else {
        chapterCelebrate();
        showToast(`🔥 أصحاح ${chapterNum} من ${bookName}  أحسنت`);
      }
    }
  }

  const totalRead = Object.values(progress).reduce((s, a) => s + a.length, 0);
  const overallPercent = Math.round((totalRead / TOTAL_CHAPTERS) * 100);

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes brtPopIn {
          0%{transform:scale(0.5) translateY(60px);opacity:0;}
          65%{transform:scale(1.06) translateY(-8px);opacity:1;}
          100%{transform:scale(1) translateY(0);opacity:1;}
        }
        @keyframes brtShake {
          0%,100%{transform:rotate(0);}
          20%{transform:rotate(-8deg);}
          40%{transform:rotate(8deg);}
          60%{transform:rotate(-5deg);}
          80%{transform:rotate(5deg);}
        }
        @keyframes brtPulseRing {
          0%{transform:scale(1);opacity:0.7;}
          100%{transform:scale(1.8);opacity:0;}
        }
        @keyframes brtGlow {
          0%,100%{box-shadow:0 0 30px rgba(139,92,246,0.4),0 0 60px rgba(99,102,241,0.2);}
          50%{box-shadow:0 0 60px rgba(139,92,246,0.8),0 0 120px rgba(99,102,241,0.5),0 0 180px rgba(167,139,250,0.3);}
        }
        @keyframes brtFloat {
          0%,100%{transform:translateY(0);}
          50%{transform:translateY(-12px);}
        }
        @keyframes brtFadeUp {
          from{opacity:0;transform:translateY(20px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes brtSlideIn {
          from{opacity:0;max-height:0;padding-top:0;padding-bottom:0;}
          to{opacity:1;max-height:600px;}
        }
        .brt-popup-anim{animation:brtPopIn 0.5s cubic-bezier(.34,1.56,.64,1) both;}
        .brt-icon-shake{animation:brtShake 0.6s ease 0.3s both, brtFloat 3s ease-in-out 1s infinite;}
        .brt-glow{animation:brtGlow 2s ease-in-out infinite;}
        .brt-ring{animation:brtPulseRing 1.5s ease-out infinite;}
        .brt-ring2{animation:brtPulseRing 1.5s ease-out 0.75s infinite;}
        .brt-fadein{animation:brtFadeUp 0.4s ease both;}
        .brt-chapter-btn{transition:all 0.18s cubic-bezier(.34,1.56,.64,1);}
        .brt-chapter-btn:active{transform:scale(0.88);}
        .brt-chapter-btn.read:hover{transform:scale(1.1);}
        .brt-book-row{transition:background 0.2s;}
        .brt-book-row:hover{background:rgba(99,102,241,0.06);}
      `}</style>

      {/* ═══ Book Completion Popup ═══ */}
      {bookPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[900] px-5"
          style={{
            background: "rgba(5,5,15,0.88)",
            backdropFilter: "blur(12px)",
          }}
          onClick={() => setBookPopup(null)}
        >
          <div
            className="brt-popup-anim relative w-full max-w-sm text-center rounded-[36px] px-8 py-10 overflow-hidden brt-glow"
            style={{
              background: "linear-gradient(145deg,#0f0f2a,#1a1040,#0a0f28)",
              border: "1.5px solid rgba(139,92,246,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* حلقات بريق خلفية */}
            <div className="brt-ring absolute inset-0 rounded-[36px] border-2 border-indigo-400/30 pointer-events-none" />
            <div className="brt-ring2 absolute inset-0 rounded-[36px] border-2 border-purple-400/20 pointer-events-none" />

            {/* شعاع ضوء خلفي */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 30%,rgba(139,92,246,0.25),transparent 70%)",
              }}
            />

            {/* الأيقونة */}
            <div className="relative z-10 mb-6">
              <div className="text-[80px] brt-icon-shake leading-none select-none">
                {bookPopup.icon}
              </div>
            </div>

            {/* اسم السفر */}
            <p className="relative z-10 text-xs tracking-[0.35em] text-indigo-400 uppercase mb-2 font-semibold">
              سفر {bookPopup.bookName} ✓
            </p>

            {/* العنوان */}
            <h2
              className="relative z-10 text-3xl font-bold text-white mb-3 leading-tight"
              style={{ fontFamily: "serif" }}
            >
              {bookPopup.title}
            </h2>

            {/* الرسالة */}
            <p
              className="relative z-10 text-base text-indigo-200 mb-8 leading-relaxed"
              style={{ opacity: 0.88 }}
            >
              {bookPopup.sub}
            </p>

            {/* زر الإغلاق */}
            <button
              onClick={() => setBookPopup(null)}
              className="relative z-10 px-10 py-3 rounded-2xl text-sm font-bold tracking-widest uppercase transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "#fff",
                boxShadow: "0 8px 32px rgba(124,58,237,0.5)",
                border: "1px solid rgba(167,139,250,0.4)",
              }}
            >
              🙌 للأمام
            </button>
          </div>
        </div>
      )}

      {/* ═══ Main Card ═══ */}
      <div className="w-full max-w-[520px] mb-[22px]">
        <div
          className="border rounded-[32px] px-7 sm:px-9 py-9 backdrop-blur-2xl relative overflow-hidden"
          style={{
            background: "rgba(13,15,28,0.88)",
            borderColor: "rgba(99,102,241,0.2)",
          }}
        >
          {/* خلفية زخرفية */}
          <div
            className="absolute -top-[80px] -left-[80px] w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle,rgba(99,102,241,0.14),transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-[60px] -right-[60px] w-[220px] h-[220px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle,rgba(139,92,246,0.1),transparent 70%)",
            }}
          />

          <div className="relative z-[2]">
            {/* ─── Header ─── */}
            <div className="text-center mb-8">
              <p className="text-xs tracking-[0.38em] text-indigo-500 uppercase mb-4 font-semibold">
                📖 قراءة الكتاب المقدس
              </p>

              <p
                className="text-indigo-200 font-bold mb-1"
                style={{
                  fontSize: "clamp(1.6rem,5vw,2.2rem)",
                  fontFamily: "serif",
                }}
              >
                {totalRead}{" "}
                <span className="text-indigo-500 font-normal text-xl">
                  / {TOTAL_CHAPTERS}
                </span>
              </p>
              <p
                dir="rtl"
                className="text-slate-500 text-sm mb-5"
                style={{ unicodeBidi: "plaintext" }}
              >
                {overallPercent}% من الكتاب المقدس مكتمل قراءته
              </p>

              {/* progress bar */}
              <div className="w-full h-3 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${overallPercent}%`,
                    background:
                      "linear-gradient(90deg,#4f46e5,#7c3aed,#a855f7)",
                    boxShadow:
                      overallPercent > 0
                        ? "0 0 12px rgba(139,92,246,0.6)"
                        : "none",
                  }}
                />
              </div>
            </div>

            {/* ─── قائمة الأسفار ─── */}
            {loading ? (
              <p className="text-center text-slate-600 text-base py-6">
                جار التحميل...
              </p>
            ) : (
              <div className="flex flex-col gap-[6px]">
                {BIBLE_BOOKS.map((book) => {
                  const readChapters = progress[book.name] || [];
                  const isComplete = readChapters.length === book.chapters;
                  const isOpen = expanded === book.name;
                  const pct = (readChapters.length / book.chapters) * 100;

                  return (
                    <div
                      key={book.name}
                      className="rounded-2xl overflow-hidden brt-book-row"
                      style={{
                        border: isComplete
                          ? "1.5px solid rgba(139,92,246,0.45)"
                          : "1px solid rgba(255,255,255,0.06)",
                        background: isComplete
                          ? "rgba(99,102,241,0.08)"
                          : "rgba(255,255,255,0.02)",
                      }}
                    >
                      {/* رأس السفر */}
                      <button
                        onClick={() => setExpanded(isOpen ? null : book.name)}
                        className="w-full flex items-center justify-between px-5 py-4 text-right"
                      >
                        <div className="flex items-center gap-2">
                          {isComplete ? (
                            <span className="text-lg">👑</span>
                          ) : (
                            <span className="text-base text-indigo-500/50">
                              📖
                            </span>
                          )}
                          <span
                            className="font-semibold"
                            style={{
                              fontSize: "clamp(0.9rem,2.5vw,1.05rem)",
                              color: isComplete ? "#c4b5fd" : "#e2e8f0",
                            }}
                          >
                            {book.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 font-medium">
                            {readChapters.length}/{book.chapters}
                          </span>
                          <span
                            className="text-indigo-400 text-sm transition-transform duration-300"
                            style={{
                              transform: isOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            }}
                          >
                            ▼
                          </span>
                        </div>
                      </button>

                      {/* progress bar للسفر */}
                      <div className="px-5 pb-2">
                        <div className="w-full h-[4px] bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: isComplete
                                ? "linear-gradient(90deg,#7c3aed,#a855f7)"
                                : "rgba(99,102,241,0.65)",
                              boxShadow: isComplete
                                ? "0 0 8px rgba(167,139,250,0.6)"
                                : "none",
                            }}
                          />
                        </div>
                      </div>

                      {/* شبكة الأصحاحات */}
                      {isOpen && (
                        <div className="px-5 pb-5 pt-3 flex flex-wrap gap-[7px] brt-fadein">
                          {Array.from(
                            { length: book.chapters },
                            (_, i) => i + 1,
                          ).map((num) => {
                            const isRead = readChapters.includes(num);
                            return (
                              <button
                                key={num}
                                onClick={() => toggleChapter(book.name, num)}
                                className={`brt-chapter-btn rounded-xl font-bold border flex items-center justify-center ${isRead ? "read" : ""}`}
                                style={{
                                  width: "clamp(34px,8vw,40px)",
                                  height: "clamp(34px,8vw,40px)",
                                  fontSize: "clamp(0.72rem,2vw,0.85rem)",
                                  background: isRead
                                    ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                                    : "rgba(255,255,255,0.03)",
                                  borderColor: isRead
                                    ? "rgba(167,139,250,0.6)"
                                    : "rgba(255,255,255,0.08)",
                                  color: isRead ? "#fff" : "#64748b",
                                  boxShadow: isRead
                                    ? "0 0 12px rgba(124,58,237,0.5)"
                                    : "none",
                                }}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Toast ─── */}
      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[300] pointer-events-none">
        <div
          className={`rounded-2xl px-7 py-3 text-sm font-medium text-white whitespace-nowrap transition-all duration-300 ${
            toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          style={{
            background: "rgba(13,15,28,0.97)",
            border: "1px solid rgba(99,102,241,0.35)",
            boxShadow: "0 8px 32px rgba(99,102,241,0.2)",
          }}
        >
          {toast.msg}
        </div>
      </div>
    </>
  );
}

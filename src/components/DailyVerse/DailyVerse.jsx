import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

/* ── التواريخ بتوقيت مصر ── */
function egyptTodayStr() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
  )
    .toISOString()
    .slice(0, 10);
}

/* ── الآيات ── */
const VERSES = {
  joy: [
    {
      text: "اِفْرَحُوا فِي الرَّبِّ كُلَّ حِينٍ، وَأَقُولُ أَيْضًا: افْرَحُوا",
      ref: "فيلبي ٤: ٤",
    },
    {
      text: "اِحْسِبُوهُ كُلَّ فَرَحٍ يَا إِخْوَتِي حِينَمَا تَقَعُونَ فِي تَجَارِبَ مُتَنَوِّعَةٍ",
      ref: "يعقوب ١: ٢",
    },
    {
      text: "الَّذِينَ يَزْرَعُونَ بِالدُّمُوعِ يَحْصُدُونَ بِالابْتِهَاجِ",
      ref: "مزامير ١٢٦: ٥",
    },
    {
      text: "حِينَئِذٍ امْتَلأَتْ أَفْوَاهُنَا ضِحْكًا، وَأَلْسِنَتُنَا تَرَنُّمًا. حِينَئِذٍ قَالُوا بَيْنَ الأُمَمِ: إِنَّ الرَّبَّ قَدْ عَظَّمَ الْعَمَلَ مَعَ هؤُلاَءِ",
      ref: "مزامير ١٢٦: ٢",
    },
    {
      text: "فَرَحًا مَعَ الْفَرِحِينَ وَبُكَاءً مَعَ الْبَاكِينَ",
      ref: "رومية ١٢: ١٥",
    },
    {
      text: "فَرِحِينَ فِي الرَّجَاءِ، صَابِرِينَ فِي الضَّيْقِ، مُوَاظِبِينَ عَلَى الصَّلاَةِ",
      ref: "رومية ١٢: ١٢",
    },
    {
      text: "فَرِّحْ نَفْسَ عَبْدِكَ، لأَنَّنِي إِلَيْكَ يَا رَبُّ أَرْفَعُ نَفْسِي",
      ref: "مزامير ٨٦: ٤",
    },
    {
      text: "لاَ تَحْزَنُوا، لأَنَّ فَرَحَ الرَّبِّ هُوَ قُوَّتُكُمْ",
      ref: "نحميا ٨: ١٠",
    },
    {
      text: "أَفْرَحُ وَأَبْتَهِجُ بِكَ. أُرَنِّمُ لِٱسْمِكَ أَيُّهَا ٱلْعَلِيُّ",
      ref: "مزامير ٩: ٢",
    },
    {
      text: "عَظَّمَ الرَّبُّ الْعَمَلَ مَعَنَا، وَصِرْنَا فَرِحِينَ",
      ref: "مزامير ١٢٦: ٣",
    },
  ],
  sadness: [
    {
      text: "قَرِيبٌ هُوَ ٱلرَّبُّ مِنَ ٱلْمُنْكَسِرِي ٱلْقُلُوبِ، وَيُخَلِّصُ ٱلْمُنْسَحِقِي ٱلرُّوحِ",
      ref: "مزامير ٣٤: ١٨",
    },
    { text: "طُوبَى لِلْحَزَانَى، لِأَنَّهُمْ يَتَعَزَّوْنَ", ref: "متى ٥: ٤" },
    {
      text: "⁠كَحَزَانَى وَنَحْنُ دَائِمًا فَرِحُونَ، كَفُقَرَاءَ وَنَحْنُ نُغْنِي كَثِيرِينَ، كَأَنْ لَا شَيْءَ لَنَا وَنَحْنُ نَمْلِكُ كُلَّ شَيْءٍ",
      ref: "كورنثوس الثانية ٦: ١٠",
    },
    {
      text: "فَٱنْزِعِ ٱلْغَمَّ مِنْ قَلْبِكَ، وَأَبْعِدِ ٱلشَّرَّ عَنْ لَحْمِكَ، لِأَنَّ ٱلْحَدَاثَةَ وَٱلشَّبَابَ بَاطِلَانِ",
      ref: "جامعة ١١: ١٠",
    },
    {
      text: "⁠⁠اِسْتَمِعْ صَلَاتِي يَا رَبُّ، وَٱصْغَ إِلَى صُرَاخِي. لَا تَسْكُتْ عَنْ دُمُوعِي. لِأَنِّي أَنَا غَرِيبٌ عِنْدَكَ. نَزِيلٌ مِثْلُ جَمِيعِ آبَائِي",
      ref: "مزامير ٣٩: ١٢",
    },
    {
      text: "وَيَمْسَحُ ٱللهُ كُلَّ دَمْعَةٍ مِنْ عُيُونِهِمْ",
      ref: "رؤيا ٧: ١٧",
    },
    {
      text: "⁠وَسَيَمْسَحُ ٱللهُ كُلَّ دَمْعَةٍ مِنْ عُيُونِهِمْ، وَٱلْمَوْتُ لَا يَكُونُ فِي مَا بَعْدُ، وَلَا يَكُونُ حُزْنٌ وَلَا صُرَاخٌ وَلَا وَجَعٌ فِي مَا بَعْدُ، لِأَنَّ ٱلْأُمُورَ ٱلْأُولَى قَدْ مَضَتْ",
      ref: "رؤيا ٢١: ٣-٤",
    },
    {
      text: "يَا رَبُّ، أَمَامَكَ كُلُّ تَأَوُّهِي، وَتَنَهُّدِي لَيْسَ بِمَسْتُورٍ عَنْكَ",
      ref: "مزامير ٣٨: ٩",
    },
    {
      text: "وَٱلرَّبُّ سَائِرٌ أَمَامَكَ. هُوَ يَكُونُ مَعَكَ. لَا يُهْمِلُكَ وَلَا يَتْرُكُكَ. لَا تَخَفْ وَلَا تَرْتَعِبْ",
      ref: "تثنية ٣١: ٨",
    },
    {
      text: "ٱلرَّبُّ يَفْتَحُ أَعْيُنَ ٱلْعُمْيِ. ٱلرَّبُّ يُقَوِّمُ ٱلْمُنْحَنِينَ. ٱلرَّبُّ يُحِبُّ ٱلصِّدِّيقِينَ",
      ref: "مزامير ١٤٦: ٨",
    },
  ],
  anger: [
    {
      text: "اِغْضَبُوا وَلَا تُخْطِئُوا. لَا تَغْرُبِ ٱلشَّمْسُ عَلَى غَيْظِكُمْ، وَلَا تُعْطُوا إِبْلِيسَ مَكَانًا",
      ref: "أفسس ٤: ٢٦-٢٧",
    },
    {
      text: "اَلْبُغْضَةُ تُهَيِّجُ خُصُومَاتٍ، وَٱلْمَحَبَّةُ تَسْتُرُ كُلَّ ٱلذُّنُوبِ",
      ref: "أمثال ١٠: ١٢",
    },
    {
      text: "اَلْجَوَابُ ٱللَّيِّنُ يَصْرِفُ ٱلْغَضَبَ، وَٱلْكَلَامُ ٱلْمُوجِعُ يُهَيِّجُ ٱلسَّخَطَ",
      ref: "أمثال ١٥: ١",
    },
    {
      text: "⁠إِذًا يَا إِخْوَتِي ٱلْأَحِبَّاءَ، لِيَكُنْ كُلُّ إِنْسَانٍ مُسْرِعًا فِي ٱلِٱسْتِمَاعِ، مُبْطِئًا فِي ٱلتَّكَلُّمِ، مُبْطِئًا فِي ٱلْغَضَبِ",
      ref: "يعقوب ١: ١٩",
    },
    {
      text: "بَطِيءُ ٱلْغَضَبِ كَثِيرُ ٱلْفَهْمِ، وَقَصِيرُ ٱلرُّوحِ مُعَلِّي ٱلْحَمَقِ",
      ref: "أمثال ١٤: ٢٩",
    },
    {
      text: "لأَنَّ غَضَبَ الإِنْسَانِ لاَ يَصْنَعُ بِرَّ اللهِ",
      ref: "يعقوب ١: ٢٠",
    },
    {
      text: "لاَ تُسْرِعْ بِرُوحِكَ إِلَى الْغَضَبِ، لأَنَّ الْغَضَبَ يَسْتَقِرُّ فِي حِضْنِ الْجُهَّالِ",
      ref: "جامعة ٧: ٩",
    },
    {
      text: "كُفَّ عَنِ الْغَضَبِ، وَاتْرُكِ السَّخَطَ، وَلاَ تَغَرْ لِفِعْلِ الشَّرِّ",
      ref: "مزامير ٣٧: ٨",
    },
    {
      text: "⁠وأمّا الآنَ فاطرَحوا عنكُمْ أنتُمْ أيضًا الكُلَّ: الغَضَبَ، السَّخَطَ، الخُبثَ، التَّجديفَ، الكلامَ القَبيحَ مِنْ أفواهِكُمْ",
      ref: "كولوسي ٣: ٨",
    },
    {
      text: "اَلْبَطِيءُ الْغَضَبِ خَيْرٌ مِنَ الْجَبَّارِ، وَمَالِكُ رُوحِهِ خَيْرٌ مِمَّنْ يَأْخُذُ مَدِينَةً",
      ref: "أمثال ١٦: ٣٢",
    },
  ],
  frustration: [
    {
      text: "انْتَظِرِ الرَّبَّ. لِيَتَشَدَّدْ وَلْيَتَشَجَّعْ قَلْبُكَ، وَانْتَظِرِ الرَّبَّ",
      ref: "مزامير ٢٧: ١٤",
    },
    {
      text: "⁠تَشَدَّدُوا وَتَشَجَّعُوا. لاَ تَخَافُوا وَلاَ تَرْهَبُوا وُجُوهَهُمْ، لأَنَّ الرَّبَّ إِلهَكَ سَائِرٌ مَعَكَ. لاَ يُهْمِلُكَ وَلاَ يَتْرُكُكَ",
      ref: "تثنية ٣١: ٦",
    },
    {
      text: "وَأَمَّا مُنْتَظِرُو ٱلرَّبِّ فَيُجَدِّدُونَ قُوَّةً. يَرْفَعُونَ أَجْنِحَةً كَٱلنُّسُورِ. يَرْكُضُونَ وَلَا يَتْعَبُونَ. يَمْشُونَ وَلَا يُعْيُونَ",
      ref: "إشعياء ٤٠: ٣١",
    },
    {
      text: "⁠تَشَدَّدْ وَتَشَجَّعْ! لَا تَرْهَبْ وَلَا تَرْتَعِبْ لِأَنَّ ٱلرَّبَّ إِلَهَكَ مَعَكَ حَيْثُمَا تَذْهَبُ",
      ref: "يشوع ١: ٩",
    },
    {
      text: "تَعَالَوْا إِلَيَّ يا جَمِيعَ ٱلْمُتْعَبِينَ وَٱلثَّقِيلِي ٱلْأَحْمَالِ، وَأَنَا أُرِيحُكُمْ",
      ref: "متى ١١: ٢٨",
    },
    {
      text: "⁠أَرْفَعُ عَيْنَيَّ إِلَى ٱلْجِبَالِ، مِنْ حَيْثُ يَأْتِي عَوْنِي! مَعُونَتِي مِنْ عِنْدِ ٱلرَّبِّ، صَانِعِ ٱلسَّمَاوَاتِ وَٱلْأَرْضِ",
      ref: "مزامير ١٢١: ١",
    },
    {
      text: "أُعَلِّمُكَ وَأُرْشِدُكَ ٱلطَّرِيقَ ٱلَّتِي تَسْلُكُهَا. أَنْصَحُكَ. عَيْنِي عَلَيْكَ",
      ref: "مزامير ٣٢: ٨",
    },
    {
      text: "فِي كُلِّ تَعَبٍ مَنْفَعَةٌ، وَكَلَامُ ٱلشَّفَتَيْنِ إِنَّمَا هُوَ إِلَى ٱلْفَقْرِ",
      ref: "أمثال ١٤: ٢٣",
    },
    {
      text: "⁠أَيْضًا إِذَا سِرْتُ فِي وَادِي ظِلِّ ٱلْمَوْتِ لَا أَخَافُ شَرًّا، لِأَنَّكَ أَنْتَ مَعِي. عَصَاكَ وَعُكَّازُكَ هُمَا يُعَزِّيَانِنِي",
      ref: "مزامير ٢٣: ٤",
    },
    { text: "إِنْ كَانَ ٱللهُ مَعَنَا، فَمَنْ عَلَيْنَا؟", ref: "رومية ٨: ٣١" },
  ],
};

const MOODS = [
  {
    key: "sadness",
    label: "Sadness",
    emoji: "😭",
    color: "#6699cc",
    glow: "#6699cc44",
  },
  {
    key: "joy",
    label: "Joy",
    emoji: "😊",
    color: "#6699cc",
    glow: "#6699cc44",
  },
  {
    key: "anger",
    label: "Anger",
    emoji: "😡",
    color: "#6699cc",
    glow: "#6699cc44",
  },
  {
    key: "frustration",
    label: "Frustration",
    emoji: "😔",
    color: "#6699cc",
    glow: "#6699cc44",
  },
];

/* ── random بس ثابت لليوم بناءً على التاريخ + المزاج ── */
function getDailyVerseIndex(mood, dateStr, total) {
  let hash = 0;
  const str = mood + dateStr;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % total;
  }
  return hash;
}

export default function DailyVerse() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [verse, setVerse] = useState(null);
  const [moodColor, setMoodColor] = useState("#ff9933");
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const today = egyptTodayStr();

  /* تحميل المزاج المحفوظ من Firestore */
  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          const savedMood = data.dailyMood;
          const savedDate = data.dailyMoodDate;
          if (savedMood && savedDate === today) {
            const moodObj = MOODS.find((m) => m.key === savedMood);
            const idx = getDailyVerseIndex(
              savedMood,
              today,
              VERSES[savedMood].length,
            );
            setSelectedMood(savedMood);
            setVerse(VERSES[savedMood][idx]);
            setMoodColor(moodObj?.color || "#ff9933");
            setRevealed(true);
          }
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [user, today]);

  async function chooseMood(mood) {
    if (selectedMood) return; // مش بيغير بعد الاختيار
    const moodObj = MOODS.find((m) => m.key === mood);
    const idx = getDailyVerseIndex(mood, today, VERSES[mood].length);
    const chosenVerse = VERSES[mood][idx];

    setSelectedMood(mood);
    setVerse(chosenVerse);
    setMoodColor(moodObj?.color || "#ff9933");

    setTimeout(() => setRevealed(true), 100);

    if (user) {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            dailyMood: mood,
            dailyMoodDate: today,
          },
          { merge: true },
        );
      } catch {}
    }
  }

  if (loading) return null;

  return (
    <div
      className="rounded-3xl p-5 sm:p-8 md:p-10 mb-5 relative overflow-hidden"
      style={{ background: "#003366" }}
    >
      {/* orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "clamp(140px, 40vw, 280px)",
          height: "clamp(140px, 40vw, 280px)",
          background: `radial-gradient(circle,${moodColor}22,transparent 70%)`,
          top: -80,
          right: -80,
          transition: "background 0.6s ease",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "clamp(100px, 28vw, 200px)",
          height: "clamp(100px, 28vw, 200px)",
          background: `radial-gradient(circle,${moodColor}15,transparent 70%)`,
          bottom: -60,
          left: -60,
          transition: "background 0.6s ease",
        }}
      />

      <div className="relative z-10">
        {/* العنوان */}
        <p
          className="text-xs uppercase mb-5 text-center "
          style={{ color: "#ffffff70", letterSpacing: "0.3em" }}
        >
          🕊️ Verse of the Day
        </p>

        {/* لو مش مختار بعد */}
        {!selectedMood && (
          <>
            <p className="text-center text-white/60 text-xs sm:text-sm mb-5 sm:mb-6 px-2">
              How are you feeling today? Choose your mood and receive a verse
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.key}
                  onClick={() => chooseMood(mood.key)}
                  className="flex flex-col items-center gap-2 rounded-2xl py-3 sm:py-4 px-2 sm:px-3 transition-all duration-300 hover:scale-105 active:scale-95 w-full border-0 cursor-pointer"
                  style={{
                    background: `${mood.color}15`,
                    border: `1px solid ${mood.color}44`,
                  }}
                >
                  <span className="text-3xl sm:text-4xl leading-none">
                    {mood.emoji}
                  </span>
                  <span
                    className="text-xs sm:text-sm font-semibold"
                    style={{ color: mood.color }}
                  >
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* لو اختار مزاج وظهرت الآية */}
        {selectedMood && verse && (
          <div
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.5s ease",
            }}
          >
            {/* المزاج المختار - badges */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-5 sm:mb-6">
              {MOODS.map((m) => (
                <div
                  key={m.key}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-all duration-300"
                  style={{
                    background:
                      selectedMood === m.key ? `${m.color}22` : "transparent",
                    border:
                      selectedMood === m.key
                        ? `1px solid ${m.color}55`
                        : "1px solid transparent",
                    color:
                      selectedMood === m.key
                        ? m.color
                        : "rgba(255,255,255,0.18)",
                  }}
                >
                  <span className="text-xs">{m.emoji}</span>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>

            {/* الآية */}
            <div
              className="rounded-2xl p-4 sm:p-6 text-center relative"
              style={{
                background: `${moodColor}0d`,
                border: `1px solid ${moodColor}33`,
                boxShadow: `0 0 30px ${moodColor}15`,
              }}
            >
              {/* علامة الاقتباس */}
              <div
                className="text-5xl sm:text-6xl leading-none font-serif opacity-20 -mb-3"
                style={{ color: moodColor }}
              >
                "
              </div>

              <p
                className="text-white leading-loose mb-4 text-sm sm:text-base"
                dir="rtl"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1.9,
                }}
              >
                {verse.text}
              </p>

              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1"
                style={{
                  background: `${moodColor}18`,
                  border: `1px solid ${moodColor}44`,
                }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: moodColor }}
                >
                  ✝ {verse.ref}
                </span>
              </div>
            </div>

            {/* رسالة صغيرة */}
            <p className="text-center text-white/40 text-xs mt-4 tracking-wide uppercase">
              Today's Verse ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

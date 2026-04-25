import { useState, useEffect } from "react";
import OneSignal from "react-onesignal";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

function Orb({ cls, w, h, bg, s }) {
  return (
    <div
      className={`${cls} absolute rounded-full pointer-events-none`}
      style={{ width: w, height: h, background: bg, ...s }}
    />
  );
}

export default function PrayerReminder({ user, todayDone }) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // شوف لو الـ notification معموله enable قبل كده
  useEffect(() => {
    async function checkStatus() {
      const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
      setEnabled(isSubscribed);
    }
    checkStatus();
  }, []);

  async function enableNotifications() {
    if (!user) return;
    setLoading(true);
    try {
      // اطلب الإذن
      await OneSignal.Notifications.requestPermission();

      // جيب الـ ID
      const subId = OneSignal.User.PushSubscription.id;

      // احفظه في Firestore
      if (subId) {
        await setDoc(
          doc(db, "users", user.uid),
          { oneSignalId: subId },
          { merge: true },
        );
      }

      setEnabled(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("OneSignal error:", err);
    }
    setLoading(false);
  }

  return (
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
          🔔 Prayer Reminder
        </p>

        {/* مش مسجل */}
        {!user && (
          <p className="text-sm" style={{ color: "#ffffff50" }}>
            Sign in first to enable reminders ✝
          </p>
        )}

        {/* مسجل ومش enabled */}
        {user && !enabled && (
          <div>
            <p className="text-white/50 text-sm mb-4">
              Get notified daily to pray even when the app is closed 🙏
            </p>
            <button
              onClick={enableNotifications}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(255,153,51,.15)",
                border: "1px solid #ff993366",
                color: "#ff9933",
              }}
            >
              {loading ? "Setting up..." : "🔔 Enable Notifications"}
            </button>
          </div>
        )}

        {/* enabled */}
        {user && enabled && (
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium mb-3"
              style={{
                background: "rgba(80,200,120,.15)",
                border: "1px solid #50c87844",
                color: "#50c878",
              }}
            >
              ✅ Notifications enabled!
            </div>
            {saved && (
              <p className="text-xs mt-2" style={{ color: "#50c878" }}>
                ✓ Reminder saved successfully
              </p>
            )}
            {todayDone && (
              <p className="text-xs mt-3" style={{ color: "#ffffff50" }}>
                ✝ You already prayed today 🙏
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

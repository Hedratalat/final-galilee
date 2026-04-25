import { useState, useEffect } from "react";
import OneSignal from "react-onesignal";
import { doc, setDoc, getDoc } from "firebase/firestore";
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

  useEffect(() => {
    async function checkStatus() {
      if (!user) return;
      // اقرأ الحالة من Firestore مش من OneSignal عشان تكون دايمًا صح بعد الـ refresh
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setEnabled(!!snap.data().notificationsEnabled);
      }
    }
    checkStatus();
  }, [user]);

  async function toggleNotifications() {
    if (!user) return;
    setLoading(true);
    try {
      if (!enabled) {
        await OneSignal.Notifications.requestPermission();

        // انتظر OneSignal يسجل الـ subscription
        await new Promise((res) => setTimeout(res, 1000));

        const subId = OneSignal.User.PushSubscription.id;
        const isOptedIn = OneSignal.User.PushSubscription.optedIn;

        if (subId && isOptedIn) {
          await setDoc(
            doc(db, "users", user.uid),
            { oneSignalId: subId, notificationsEnabled: true },
            { merge: true },
          );
          setEnabled(true);
        }
        // لو المستخدم رفض الإذن من المتصفح مش هيحصل حاجة
      } else {
        await OneSignal.User.PushSubscription.optOut();
        await setDoc(
          doc(db, "users", user.uid),
          { notificationsEnabled: false },
          { merge: true },
        );
        setEnabled(false);
      }

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

        {!user && (
          <p className="text-sm" style={{ color: "#ffffff50" }}>
            Sign in first to enable reminders ✝
          </p>
        )}

        {user && (
          <div>
            <p className="text-white/50 text-sm mb-4">
              {enabled
                ? "You'll get daily prayer reminders 🙏"
                : "Get notified daily to pray even when the app is closed 🙏"}
            </p>

            <button
              onClick={toggleNotifications}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              style={
                enabled
                  ? {
                      background: "rgba(255,80,80,.15)",
                      border: "1px solid #ff505066",
                      color: "#ff6b6b",
                    }
                  : {
                      background: "rgba(255,153,51,.15)",
                      border: "1px solid #ff993366",
                      color: "#ff9933",
                    }
              }
            >
              {loading
                ? "Please wait..."
                : enabled
                  ? "🔕 Disable Notifications"
                  : "🔔 Enable Notifications"}
            </button>

            {saved && (
              <p
                className="text-xs mt-3"
                style={{ color: enabled ? "#50c878" : "#ff6b6b" }}
              >
                {enabled
                  ? "✓ Notifications enabled!"
                  : "✓ Notifications disabled"}
              </p>
            )}

            {enabled && todayDone && (
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

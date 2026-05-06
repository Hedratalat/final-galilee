import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";

export default function Friends({
  user,
  approved,
  onOpenChange,
  onFriendsData,
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [toast, setToast] = useState({ msg: "", type: "" });

  useEffect(() => {
    if (!user || !approved) return;

    loadFriends();

    const q = query(
      collection(db, "friendRequests"),
      where("toEmail", "==", user.email),
      where("status", "==", "pending"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user, approved]);

  useEffect(() => {
    if (onOpenChange) onOpenChange({ open, setOpen, requests });
  }, [open, requests]);

  // ✅ ابعت الـ friends للـ parent عشان يعرضها في الصفحة
  useEffect(() => {
    if (onFriendsData) onFriendsData(friends);
  }, [friends]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  }

  async function loadRequests() {
    const q = query(
      collection(db, "friendRequests"),
      where("toEmail", "==", user.email),
      where("status", "==", "pending"),
    );
    const snap = await getDocs(q);
    setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function loadFriends() {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) return;
    const friendUids = userSnap.data().friends || [];
    if (friendUids.length === 0) return setFriends([]);
    const friendsData = await Promise.all(
      friendUids.map(async (uid) => {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) return null;
        const d = snap.data();
        return {
          uid,
          displayName: d.displayName || "Unknown",
          photoURL: d.photoURL || "",
          streak: d.streak || 0,
        };
      }),
    );
    setFriends(friendsData.filter(Boolean).sort((a, b) => b.streak - a.streak));
  }

  async function sendRequest() {
    if (!email.trim()) return;
    const trimmed = email.trim().toLowerCase();
    if (trimmed === user.email.toLowerCase())
      return showToast("Can't add yourself", "error");
    setSending(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", trimmed));
      const snap = await getDocs(q);
      if (snap.empty) {
        showToast("No user found with this email.", "error");
        setSending(false);
        return;
      }
      const targetUid = snap.docs[0].id;
      const mySnap = await getDoc(doc(db, "users", user.uid));
      const myFriends = mySnap.data()?.friends || [];
      if (myFriends.includes(targetUid)) {
        showToast("Already friends", "error");
        setSending(false);
        return;
      }
      const existQ = query(
        collection(db, "friendRequests"),
        where("fromUid", "==", user.uid),
        where("toEmail", "==", trimmed),
        where("status", "==", "pending"),
      );
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) {
        showToast("Request already sent", "error");
        setSending(false);
        return;
      }
      await addDoc(collection(db, "friendRequests"), {
        fromUid: user.uid,
        fromName: user.displayName || "Someone",
        fromEmail: user.email,
        toEmail: trimmed,
        toUid: targetUid,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      showToast("Friend request sent 🙏");
      setEmail("");
    } catch {
      showToast("Something went wrong.", "error");
    }
    setSending(false);
  }

  async function confirmRequest(req) {
    setConfirming(req.id);
    try {
      // تأكد إن fromUid موجود
      if (!req.fromUid) {
        showToast("Invalid request data.", "error");
        setConfirming(null);
        return;
      }

      await updateDoc(doc(db, "friendRequests", req.id), {
        status: "accepted",
      });

      // ✅ ضيف كل واحد في friends بتاع التاني
      await setDoc(
        doc(db, "users", user.uid),
        { friends: arrayUnion(req.fromUid) },
        { merge: true },
      );
      await setDoc(
        doc(db, "users", req.fromUid),
        { friends: arrayUnion(user.uid) },
        { merge: true },
      );

      showToast(`You and ${req.fromName} are now friends ✝`);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      loadFriends();
    } catch (e) {
      showToast("Something went wrong.", "error");
    }
    setConfirming(null);
  }

  async function declineRequest(req) {
    await updateDoc(doc(db, "friendRequests", req.id), { status: "declined" });
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    showToast("Request declined.");
  }

  if (!user || !approved) return null;

  return (
    <>
      {/* ── Modal — بس Add Friend و Requests، مفيش Friends List هنا ── */}
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 400, background: "rgba(0,0,0,.75)" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="w-full max-w-md mx-4 rounded-3xl overflow-hidden"
            style={{ background: "#0a1628", border: "1px solid #ff993322" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid #ffffff0a" }}
            >
              <p className="text-sm font-semibold text-white tracking-widest uppercase">
                👥 Add Friend
              </p>
              <button
                onClick={() => setOpen(false)}
                className="text-white/40 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div
              className="px-6 py-5 flex flex-col gap-5 overflow-y-auto"
              style={{ maxHeight: "75vh" }}
            >
              {/* Add Friend */}
              <div>
                <p
                  className="text-xs uppercase mb-3"
                  style={{ color: "#ffffff50", letterSpacing: "0.25em" }}
                >
                  Enter email
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendRequest()}
                    placeholder="Friend's email..."
                    className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid #ff993333",
                      color: "#fff",
                    }}
                  />
                  <button
                    onClick={sendRequest}
                    disabled={sending || !email.trim()}
                    className="rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{
                      background: "rgba(255,153,51,.2)",
                      border: "1px solid #ff993366",
                      color: "#ff9933",
                    }}
                  >
                    {sending ? "..." : "Send"}
                  </button>
                </div>
              </div>

              {/* Pending Requests */}
              {requests.length > 0 && (
                <div>
                  <p
                    className="text-xs uppercase mb-3"
                    style={{ color: "#ffffff50", letterSpacing: "0.25em" }}
                  >
                    📨 Requests ({requests.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between rounded-2xl px-4 py-3"
                        style={{
                          background: "rgba(255,153,51,.06)",
                          border: "1px solid #ff993322",
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">
                            {req.fromName}
                          </p>
                          <p className="text-xs" style={{ color: "#ffffff50" }}>
                            {req.fromEmail}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmRequest(req)}
                            disabled={confirming === req.id}
                            className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                            style={{
                              background: "rgba(255,153,51,.2)",
                              border: "1px solid #ff993366",
                              color: "#ff9933",
                            }}
                          >
                            {confirming === req.id ? "..." : "✓"}
                          </button>
                          <button
                            onClick={() => declineRequest(req)}
                            className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                            style={{
                              background: "rgba(255,255,255,.05)",
                              border: "1px solid #ffffff22",
                              color: "#ffffff60",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ zIndex: 500 }}
      >
        <div
          className={`rounded-2xl px-7 py-3 text-sm text-white whitespace-nowrap transition-all duration-300 ${toast.msg ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          style={{
            background: toast.type === "error" ? "#1a0a0a" : "#003366",
            border: `1px solid ${toast.type === "error" ? "#ff333344" : "#ff993344"}`,
          }}
        >
          {toast.msg}
        </div>
      </div>
    </>
  );
}

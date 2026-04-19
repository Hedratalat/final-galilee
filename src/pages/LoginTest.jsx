import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function LoginTest() {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          fullName: user.displayName || "",
          email: user.email || "",
          phone: "",
          createdAt: new Date().toString(),
          emailVerified: true,
        });
        toast.success(`Welcome, ${user.displayName || "User"}`);
      } else {
        await updateDoc(userRef, { emailVerified: true });
        toast.success(`Welcome back, ${user.displayName || "User"}`);
      }

      navigate("/");
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Google sign-in failed. Try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 bg-gray-100">
      <div className="bg-white shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md">
        <h2 className="text-center text-4xl font-poppins text-darkBlue font-bold mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Login to continue your journey
        </p>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-2xl py-3 mb-4 hover:bg-gray-50 transition duration-300 font-semibold text-gray-700 disabled:opacity-50"
        >
          <FcGoogle size={22} />
          {isGoogleLoading ? "Signing in..." : "Continue with Google"}
        </button>

        {/* Enter Home */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/")}
            className="rounded-lg px-4 py-2 text-white bg-slate-700 font-semibold hover:text-orange transition duration-300"
          >
            Enter Home
          </button>
        </div>
      </div>
    </div>
  );
}

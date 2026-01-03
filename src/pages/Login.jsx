import { useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Firebase
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const onSubmit = async (data) => {
    try {
      // sign in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // check email verification
      if (!user.emailVerified) {
        toast.error("Email not verified! Please check your inbox.");
        return navigate("/verify-email");
      }

      // get user data from firestore
      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);

      let userName = "";
      if (userSnap.exists()) {
        userName = userSnap.data().fullName || userSnap.data().name || "";
      }

      await updateDoc(doc(db, "Users", user.uid), {
        emailVerified: true,
      });

      toast.success(`Welcome, ${userName}`);
      navigate("/");
    } catch (error) {
      toast.error("Wrong email or password, try again.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error("Please enter your email");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsResetting(true);
    setResetSuccess(false);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
      setResetEmail("");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address");
      } else {
        toast.error("Failed to send reset email. Try again.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-center px-4 bg-gray-100">
        <div className="bg-white shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md">
          <h2 className="text-center text-4xl font-poppins text-darkBlue font-bold mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mb-4">
            Login to continue your journey
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
                className={`w-full p-3 rounded-2xl border transition-all duration-300 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className={`w-full p-3 rounded-2xl border pr-10 transition-all duration-300 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-orange`}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500"
                >
                  {showPassword ? (
                    <AiFillEyeInvisible size={22} />
                  ) : (
                    <AiFillEye size={22} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-orange text-sm font-semibold hover:text-darkBlue transition duration-300"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-darkBlue transition duration-300 font-poppins text-lg"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-3">
            Don't have an account?
            <Link
              to="/signup"
              className="text-orange font-semibold hover:text-darkBlue transition duration-300 ml-1"
            >
              Sign Up
            </Link>
          </p>

          <div className="text-center mt-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-lg px-2 py-1 text-white bg-slate-700 font-semibold hover:text-orange transition duration-300"
            >
              Enter Home
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-darkBlue mb-2">
              Reset Password
            </h3>
            <p className="text-gray-600 mb-4">
              Enter your email to receive a password reset link
            </p>

            {resetSuccess ? (
              <div>
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-3">
                  <p className="font-semibold flex items-center gap-2">
                    <span className="text-xl">✓</span> Email Sent Successfully!
                  </p>
                  <p className="text-sm mt-1">
                    Check your inbox for the reset link.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl mb-4">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <span className="text-lg">⚠️</span> Can't find the email?
                  </p>
                  <p className="text-xs mt-1">
                    Please check your <strong>Spam</strong> or{" "}
                    <strong>Junk</strong> folder.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSuccess(false);
                  }}
                  className="w-full py-2 rounded-xl bg-darkBlue text-white font-semibold hover:bg-orange transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange mb-4"
                  placeholder="Enter your email"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setResetEmail("");
                      setResetSuccess(false);
                    }}
                    className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 py-2 rounded-xl bg-orange text-white font-semibold hover:bg-darkBlue transition disabled:opacity-50"
                  >
                    {isResetting ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

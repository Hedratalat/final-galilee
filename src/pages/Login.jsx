import { useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
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

  return (
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
          Don’t have an account?
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
  );
}

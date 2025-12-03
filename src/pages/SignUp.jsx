import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

// Firebase imports
import { auth, db } from "../firebase"; // تأكد انك عامل export لـ auth و db
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
// validation zod
const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Please enter a valid name")
      .max(40, "Please enter a valid name")
      .regex(/^[A-Za-z\u0600-\u06FF\s]+$/, "Please enter a valid name."),
    email: z
      .string()
      .email("Please enter a valid email address.")
      .refine(
        (val) => {
          const lowerVal = val.toLowerCase();
          return /^[a-zA-Z][a-zA-Z0-9._%+-]*@gmail\.(com|net|org)(\.eg)?$/.test(
            lowerVal
          );
        },
        { message: "Email must be a valid Gmail address" }
      ),
    phone: z
      .string()
      .regex(/^01[0125][0-9]{8}$/, "Phone must be a valid Egyptian number"),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Password must contain at least one special character",
      })
      .regex(/^\S*$/, { message: "Password must not contain spaces" }),
    confirmPassword: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
  });

  const navigate = useNavigate();

  //toggle password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      //Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      //Update the user's name in Auth
      await updateProfile(user, { displayName: data.fullName });
      //send email verification
      await sendEmailVerification(user);

      //Store user data in Firestore
      await setDoc(doc(db, "Users", user.uid), {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        createdAt: new Date().toString(),
        emailVerified: user.emailVerified,
      });
      navigate("/verify-email");

      reset();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error(
          "This email is already registered. Please login or use another email."
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };
  return (
    <div className="min-h-screen flex justify-center items-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md">
        <h2 className="text-center text-4xl font-poppins text-darkBlue font-bold mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-3">
          Sign up to start your journey
        </p>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <label className="block text-gray-700 font-semibold  mb-2">
              Full Name
            </label>
            <input
              type="text"
              {...register("fullName")}
              className={`w-full p-3 rounded-2xl border transition-all duration-300 ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue`}
              placeholder="Enter Your Full Name"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 ">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
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
          <div>
            <label className="block text-gray-700 font-semibold mb-2 ">
              Phone Number
            </label>
            <input
              type="tel"
              {...register("phone")}
              className={`w-full p-3 rounded-2xl border transition-all duration-300 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
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
                {...register("password")}
                className={`w-full p-3 rounded-2xl border transition-all duration-300 pr-10 ${
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
                  <AiFillEyeInvisible size={20} />
                ) : (
                  <AiFillEye size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`w-full p-3 rounded-2xl border transition-all duration-300 pr-10 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-orange`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500"
              >
                {showConfirmPassword ? (
                  <AiFillEyeInvisible size={20} />
                ) : (
                  <AiFillEye size={20} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className=" font-poppins text-lg w-full bg-orange text-white font-bold py-3 rounded-2xl shadow-lg
          hover:bg-darkBlue transition duration-300 "
          >
            {isSubmitting ? "Creating..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-1 ">
          Already have an account?
          <Link
            to="/login"
            className="text-orange font-semibold hover:text-darkBlue transition duration-300 ml-1"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

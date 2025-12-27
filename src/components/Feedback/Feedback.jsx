import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaQuoteLeft, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../firebase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ✅ Validation
const feedbackSchema = z.object({
  name: z
    .string()
    .nonempty("Please fill in all fields")
    .min(3, "Name must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z\s]+$/, "Letters and spaces only"),
  email: z
    .string()
    .nonempty("Please fill in all fields")
    .email("Invalid email address")
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Invalid email address",
    }),
  message: z
    .string()
    .nonempty("Please fill in all fields")
    .min(10, "Message must be at least 10 characters")
    .max(400),
});

export default function Feedback() {
  const [approvedFeedbacks, setApprovedFeedbacks] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(feedbackSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const q = query(collection(db, "Feedbacks"), where("approved", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setApprovedFeedbacks(all);
      setStartIndex(0); // إعادة البداية عند تحديث البيانات
    });
    return () => unsubscribe();
  }, []);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - visibleCount, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      Math.min(prev + visibleCount, approvedFeedbacks.length - visibleCount)
    );
  };

  const visibleFeedbacks = approvedFeedbacks.slice(
    startIndex,
    startIndex + visibleCount
  );

  const onSubmit = async (data) => {
    try {
      await addDoc(collection(db, "Feedbacks"), {
        ...data,
        approved: false,
        createdAt: serverTimestamp(),
      });
      toast.success("Thank you! We'll review your feedback soon.");
      reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <section
      id="feedback"
      className="min-h-screen py-12 font-poppins bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-darkBlue mb-3"
        >
          Customer Stories & Feedback
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-gray-700 mb-12 max-w-2xl mx-auto text-base sm:text-lg"
        >
          Real experiences and honest reviews from those who love our products.
        </motion.p>

        {/* Show approved feedbacks with arrows */}
        <div className="relative mb-12">
          {/* Arrows */}
          <button
            onClick={handlePrev}
            disabled={startIndex === 0}
            className="absolute -left-5 sm:left-0 top-1/2 transform -translate-y-1/2 text-2xl text-gray-500 disabled:text-gray-300 z-10"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={handleNext}
            disabled={startIndex + visibleCount >= approvedFeedbacks.length}
            className="absolute -right-5 sm:right-0 top-1/2 transform -translate-y-1/2 text-2xl text-gray-500 disabled:text-gray-300 z-10"
          >
            <FaArrowRight />
          </button>

          <div className="flex flex-wrap justify-center gap-4">
            {visibleFeedbacks.length === 0 ? (
              <p className="text-gray-500 w-full text-center">
                No feedback available yet.
              </p>
            ) : (
              visibleFeedbacks.map((fb) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                  }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between 
                     w-full sm:w-80" // full width على الموبايل، 320px على الشاشات الأكبر
                >
                  <div>
                    <FaQuoteLeft className="text-orange text-3xl mb-3" />
                    <p className="text-gray-700 mb-3">{fb.message}</p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">{fb.name}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Feedback Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-6"
        >
          <input
            type="text"
            placeholder="Enter your full name"
            {...register("name")}
            className={`border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-400 focus:ring-red-300"
                : "focus:ring-orange"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className={`border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-400 focus:ring-red-300"
                : "focus:ring-orange"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
          <textarea
            placeholder="Write your feedback..."
            {...register("message")}
            className={`border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 resize-none h-32 ${
              errors.message
                ? "border-red-400 focus:ring-red-300"
                : "focus:ring-orange"
            }`}
          ></textarea>
          {errors.message && (
            <p className="text-red-500 text-sm">{errors.message.message}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-orange to-orange/90 hover:from-darkBlue hover:to-blue text-white font-semibold px-6 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </motion.form>
      </div>
    </section>
  );
}

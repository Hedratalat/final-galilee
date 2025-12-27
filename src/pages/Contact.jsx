import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

import { collection, addDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { z } from "zod";

// Zod Schema
const contactSchema = z.object({
  fullName: z
    .string()
    .min(3, "Please enter a valid name.")
    .max(50, "Please enter a valid name.")
    .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/, "Name should only contain letters"),
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
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
});

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const result = contactSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((err) => {
        const fieldName = err.path[0];
        fieldErrors[fieldName] = err.message;
      });

      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "Messages"), {
        ...result.data,
        createdAt: new Date().toISOString(),
      });

      toast.success("Message sent successfully");

      setFormData({
        fullName: "",
        email: "",
        message: "",
      });
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex justify-center items-start px-4 py-4 sm:py-10 pt-6 sm:pt-6">
        <div className="bg-white/70 backdrop:blur-xl shadow-xl rounded-3xl p-8 sm:p-10 w-full max-w-4xl border border-white-20">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-poppins font-bold text-darkBlue text-center mb-4 sm:mb-2"
          >
            Contact Us
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-8 max-w-2xl mx-auto text-base sm:text-lg text-gray-700 font-poppins font-bold"
          >
            We’re always available, feel free to reach out anytime.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <motion.form
              onSubmit={handleSend}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-2 order-2 md:order-1"
              noValidate
            >
              <div>
                <label className="block text-gray-700 font-poppins font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  data-gramm="false"
                  data-gramm_editor="false"
                  name="fullName"
                  className={`w-full p-3 sm:p-4 rounded-2xl border ${
                    errors.fullName
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-all duration-300`}
                  placeholder="Your name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <p className="text-red-600 text-sm mt-2 font-poppins font-medium">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-poppins font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  data-gramm="false"
                  data-gramm_editor="false"
                  name="email"
                  className={`w-full p-3 sm:p-4 rounded-2xl border ${
                    errors.email
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue transition-all duration-300`}
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-2 font-poppins font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-poppins font-semibold mb-2">
                  Message
                </label>
                <textarea
                  data-gramm="false"
                  data-gramm_editor="false"
                  rows="5"
                  name="message"
                  className={`w-full p-3 sm:p-4 rounded-2xl border ${
                    errors.message
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-orange transition-all duration-300 resize-none`}
                  placeholder="Write your message..."
                  value={formData.message}
                  onChange={handleChange}
                />
                {errors.message && (
                  <p className="text-red-600 text-sm mt-2 font-poppins font-medium">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-orange text-white font-poppins font-bold py-3 sm:py-4 rounded-2xl shadow-lg hover:bg-darkBlue transition duration-300 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </motion.form>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-inner p-6 sm:p-8 flex flex-col justify-center sm:pt-0 order-1 md:order-2"
            >
              <h3 className="text-2xl sm:text-3xl font-poppins font-bold text-darkBlue mb-4 sm:mb-4 md:mt-0 sm:mt-5">
                Contact Information
              </h3>
              <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">
                Reach out to us through any of the methods below.
              </p>
              <div className="space-y-4 sm:space-y-5 text-gray-700 font-poppins text-sm sm:text-lg">
                <p>
                  📍 <span className="font-semibold">Address:</span> Cairo,
                  Egypt
                </p>
                <p>
                  📞 <span className="font-semibold">Phone:</span> 01027539203
                </p>
                <p>
                  📧 <span className="font-semibold">Email:</span>
                  galilee.contact@gmail.com
                </p>

                {/* Social Media Icons */}
                <div className="flex flex-row gap-3 sm:gap-4 mt-4 justify-center lg:justify-start w-full sm:w-auto">
                  {[
                    {
                      Icon: FaFacebookF,
                      color: "text-blue",
                      href: "https://www.facebook.com/people/Galilee/61580398533750/",
                    },
                    {
                      Icon: FaWhatsapp,
                      color: "text-green-600",
                      href: "https://api.whatsapp.com/send/?phone=201027539203&text&type=phone_number&app_absent=0",
                    },
                    {
                      Icon: FaTiktok,
                      color: "text-darkBlue",
                      href: "https://www.tiktok.com/@galilee.eg",
                    },
                    {
                      Icon: FaInstagram,
                      color: "text-orange",
                      href: "https://www.instagram.com/galilee.eg",
                    },
                  ].map(({ Icon, color, href }, idx) => (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-2 sm:p-3 bg-white rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <Icon
                        className={`${color} group-hover:scale-110 transition-transform duration-300`}
                        size={28}
                      />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

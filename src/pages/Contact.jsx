import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

import { collection, addDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { db } from "../firebase";
import Navbar from "../components/Navbar/Navbar";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "Messages"), {
        fullName: name,
        email: email,
        message: message,
        createdAt: new Date().toISOString(),
      });
      toast.success("Message sent successfully");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Something went wrong. Please try again.");
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
            >
              <div>
                <label className="text-gray-700 font-poppins font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full mt-2 p-3 sm:p-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-all duration-300"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-gray-700 font-poppins font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full mt-2 p-3 sm:p-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue transition-all duration-300"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-gray-700 font-poppins font-semibold">
                  Message
                </label>
                <textarea
                  rows="5"
                  className="w-full mt-2 p-3 sm:p-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange transition-all duration-300"
                  placeholder="Write your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button className="w-full bg-orange text-white font-poppins font-bold py-3 sm:py-4 rounded-2xl shadow-lg hover:bg-darkBlue transition duration-300">
                Send Message
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
                  📧 <span className="font-semibold">Email:</span>{" "}
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
    </>
  );
}

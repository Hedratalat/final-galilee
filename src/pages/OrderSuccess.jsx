import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { motion } from "framer-motion";
import { FaCheckCircle, FaWhatsapp } from "react-icons/fa";
import Confetti from "react-confetti";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("cash"); // default
  const orderNumber = location.state?.orderNumber || "ORD-XXXX";
  const whatsapp = location.state?.whatsapp || "your number";

  useEffect(() => {
    if (location.state?.paymentMethod) {
      setPaymentMethod(location.state.paymentMethod);
    }
  }, [location.state]);

  const getPaymentMessage = () => {
    switch (paymentMethod) {
      case "cash":
        return "You will pay upon delivery💵";
      case "instapay":
        return "Payment received via Instapay⚡";
      case "vodafone":
        return "Payment received via Vodafone Cash📱";
      default:
        return "";
    }
  };

  return (
    <>
      <Navbar />
      <Confetti numberOfPieces={200} recycle={false} />
      <section className="min-h-screen bg-gradient-to-b from-orange/20 via-white to-green-50 flex flex-col justify-center items-center py-20 px-4 font-poppins">
        <motion.div
          className="bg-gradient-to-br from-white to-orange/10 rounded-3xl shadow-2xl p-8 md:p-12 max-w-xl w-full text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-green-500 text-6xl mx-auto mb-4"
            animate={{ rotate: [0, 15, -15, 10, -10, 0] }}
            transition={{ duration: 1.5 }}
          >
            <FaCheckCircle />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-darkBlue mb-4">
            🎉 Order Confirmed
          </h1>
          <p className="text-gray-700 mb-6 text-lg">
            Your order has been placed successfully.
          </p>

          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-xl mb-6 font-semibold text-lg">
            {getPaymentMessage()}
          </div>

          {/* WhatsApp info */}
          <div className="mb-6">
            <p className="text-gray-700 mb-2 text-md">
              You will be contacted on WhatsApp at the number you provided (
              <span className="font-bold">{whatsapp}</span>) to confirm your
              order.
            </p>
          </div>

          {/* متابعة الأوردرات */}
          <div>
            <p className="text-gray-700 mb-2 text-md">
              Track your orders anytime:
            </p>
            <button
              onClick={() => navigate("/myorders")}
              className="bg-orange hover:bg-orange/90 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105"
            >
              View My Orders
            </button>
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}

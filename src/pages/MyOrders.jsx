import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { HiOutlineInbox } from "react-icons/hi";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const guestId = localStorage.getItem("guestId");

  useEffect(() => {
    if (!guestId) return;

    const q = query(collection(db, "orders"), where("guestId", "==", guestId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    });

    return () => unsubscribe();
  }, [guestId]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange text-white";
      case "processing":
        return "bg-blue text-white";
      case "completed":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "⏳ Pending";
      case "processing":
        return "🚚 Processing";
      case "completed":
        return "✅ Completed";
      default:
        return status;
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 p-6 font-poppins">
        <motion.h2
          className="font-extrabold text-2xl sm:text-4xl md:text-4xl text-darkBlue text-center leading-tight mb-10 mt-9"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          My Orders
        </motion.h2>

        {orders.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center mt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated Icon */}
            <motion.div
              className="text-gray-300 mb-6 text-6xl"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <HiOutlineInbox size={96} />
            </motion.div>

            <h3 className="text-2xl font-semibold text-gray-500 mb-2">
              You have no orders yet
            </h3>
            <p className="text-gray-400 text-center max-w-xs">
              Browse products and place your first order now
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* ===== Header ===== */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <h2 className="font-bold text-lg text-darkBlue">
                    <h2 className="font-bold text-lg text-darkBlue">
                      Order Summary
                    </h2>
                  </h2>
                  <span
                    className={`px-4 py-1 rounded-full font-semibold ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* ===== Customer & Shipping Info ===== */}
                <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                    <h3 className="font-bold text-darkBlue mb-2">
                      👤 Customer Info
                    </h3>
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {order.fullName}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      {order.phone}
                    </p>
                    <p>
                      <span className="font-semibold">Payment:</span>{" "}
                      {order.paymentMethod}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                    <h3 className="font-bold text-darkBlue mb-2">
                      📍 Delivery Address
                    </h3>
                    <p>
                      <span className="font-semibold">City:</span> {order.city}
                    </p>
                    <p>
                      <span className="font-semibold">Area:</span> {order.area}
                    </p>
                    <p>
                      <span className="font-semibold">Address:</span>{" "}
                      {order.address}
                    </p>
                    <p>
                      <span className="font-semibold">Floor:</span>{" "}
                      {order.floor || "-"}
                    </p>
                  </div>
                </div>

                {/* ===== Items ===== */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">📦 Items</h3>
                  <div className="space-y-3">
                    {order.items?.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shadow"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-gray-600 text-sm">
                            {item.quantity} × {item.price} EGP
                          </p>
                        </div>
                        <span className="font-semibold">{item.total} EGP</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ===== Totals ===== */}
                <div className="border-t mt-5 pt-5 space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="font-bold">{order.subtotal} EGP</span>
                  </div>

                  <div className="flex justify-between text-base">
                    <span className="text-gray-600 font-medium">
                      Shipping Fee
                    </span>
                    <span className="font-bold">{order.shippingFee} EGP</span>
                  </div>

                  <div className="flex justify-between text-2xl font-extrabold text-darkBlue border-t pt-4">
                    <span>Total</span>
                    <span>{order.grandTotal} EGP</span>
                  </div>

                  {order.createdAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      {order.createdAt.toDate().toLocaleDateString("en-GB")}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

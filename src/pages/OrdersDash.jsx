import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function OrdersDash() {
  const [orders, setOrders] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  // Filter state
  const [filter, setFilter] = useState({
    status: "all",
    paymentMethod: "all",
    city: "all",
  });

  // جلب الأوردرات من Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  // تغيير حالة الأوردر
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // فلترة الأوردرات + ارجاع الصفحة الأولى عند أي تغيير
  const handleFilterChange = (key, value) => {
    setFilter({ ...filter, [key]: value });
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter((order) => {
    return (
      (filter.status === "all" ||
        order.status?.toLowerCase() === filter.status) &&
      (filter.paymentMethod === "all" ||
        order.paymentMethod?.toLowerCase() === filter.paymentMethod) &&
      (filter.city === "all" || order.city === filter.city)
    );
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-poppins">
      <h1 className="text-3xl font-bold text-darkBlue mb-6">
        Orders Dashboard
      </h1>

      {/* Filter Section */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={filter.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filter.paymentMethod}
          onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All Payment Methods</option>
          <option value="cash">Cash</option>
          <option value="vodafone cash">Vodafone Cash</option>
          <option value="instapay">Instapay</option>
        </select>

        <select
          value={filter.city}
          onChange={(e) => handleFilterChange("city", e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All Cities</option>
          {Array.from(new Set(orders.map((o) => o.city))).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="grid gap-6">
        {currentOrders.map((order) => (
          <motion.div
            key={order.id}
            className="bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h2 className="font-bold text-xl text-darkBlue">
                {order.fullName} - {order.orderNumber}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-white font-semibold mt-2 sm:mt-0 ${
                  order.status === "pending"
                    ? "bg-orange"
                    : order.status === "processing"
                    ? "bg-blue"
                    : "bg-green-500"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Contact & Payment Info */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <p>
                <span className="font-semibold">Phone:</span> {order.phone}
              </p>
              <p>
                <span className="font-semibold">Payment Method:</span>{" "}
                {order.paymentMethod}
              </p>
              <p>
                <span className="font-semibold">Reference Number:</span>{" "}
                {order.referenceNumber || "-"}
              </p>
              <p>
                <span className="font-semibold">Subtotal:</span>{" "}
                {order.subtotal} EGP
              </p>
              <p>
                <span className="font-semibold">Shipping Fee:</span>{" "}
                {order.shippingFee} EGP
              </p>
              <p>
                <span className="font-semibold">Grand Total:</span>{" "}
                {order.grandTotal} EGP
              </p>
            </div>

            {/* Address */}
            <div className="mb-4 text-sm">
              <p>
                <span className="font-semibold">Address:</span> {order.address}{" "}
                <br />
                <span className="font-semibold">Area:</span> {order.area} <br />
                <span className="font-semibold">City:</span> {order.city} <br />
                <span className="font-semibold">Floor:</span>{" "}
                {order.floor || "-"}
              </p>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Items:</h3>
              <div className="grid gap-3">
                {order.items?.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border p-3 rounded-xl"
                  >
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-gray-600">
                        {item.quantity} x {item.price} EGP = {item.total} EGP
                      </p>
                    </div>
                    <span className="text-gray-700 font-semibold mt-2 sm:mt-0">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vodafone Screenshot */}
            {order.vodafoneScreenshot && (
              <div className="mb-4">
                <span className="font-semibold">Vodafone Screenshot:</span>
                <img
                  src={order.vodafoneScreenshot}
                  alt="Vodafone Screenshot"
                  className="w-48 sm:w-auto max-w-xs mt-2 rounded-lg shadow object-cover"
                />
              </div>
            )}

            {/* Created At */}
            {order.createdAt && (
              <p className="text-gray-500 text-sm mb-4">
                Created At: {order.createdAt.toDate().toLocaleString()}
              </p>
            )}

            {/* Change Status */}
            <div className="flex gap-3 mt-4 flex-wrap">
              {["pending", "processing", "completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(order.id, status)}
                  className={`px-4 py-2 rounded-xl font-semibold text-white transition-colors ${
                    order.status === status
                      ? "bg-darkBlue"
                      : "bg-gray-400 hover:bg-gray-500"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-6 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentPage(i + 1);
              window.scrollTo({ top: 0, behavior: "smooth" }); // هيرجعك لأعلى الصفحة
            }}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-darkBlue text-white" : "bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

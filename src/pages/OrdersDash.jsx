import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

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

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // success or error

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

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

  // Show popup function
  const displayPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  // Confirm order via WhatsApp
  const handleConfirmOrder = (order) => {
    const phone = order.whatsapp || order.phone;
    const cleanPhone = phone?.replace(/\D/g, "");
    const waPhone = cleanPhone?.startsWith("20")
      ? cleanPhone
      : cleanPhone?.startsWith("0")
        ? "2" + cleanPhone
        : "2" + cleanPhone;

    const itemsList = order.items
      ?.map(
        (item) =>
          `  - ${item.productName} (${item.quantity} x ${item.price} EGP = ${item.total} EGP)`,
      )
      .join("\n");

    const message = `تم تأكيد طلبك

مرحباً ${order.fullName} 

 تفاصيل الطلب:

 المنتجات:
${itemsList}

 تفاصيل الدفع:
المجموع: ${order.subtotal} EGP
رسوم الشحن: ${order.shippingFee} EGP
الإجمالي: ${order.grandTotal} EGP
طريقة الدفع: ${order.paymentMethod}${order.referenceNumber ? `\nرقم المرجع: ${order.referenceNumber}` : ""}

 عنوان التوصيل:
${order.address}
المنطقة: ${order.area}
المدينة: ${order.city}${order.floor ? `\nالدور: ${order.floor}` : ""}

متشكرينك من قلبنا.. وفي انتظار طلبك الجاي`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${waPhone}?text=${encodedMessage}`, "_blank");
  };

  // تغيير حالة الأوردر
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      displayPopup("Order status updated successfully!", "success");
    } catch (error) {
      console.error("Error updating status:", error);
      displayPopup("Failed to update order status", "error");
    }
  };

  // Show delete confirmation
  const confirmDelete = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteConfirm(true);
  };

  // حذف الأوردر
  const handleDeleteOrder = async () => {
    try {
      await deleteDoc(doc(db, "orders", orderToDelete));
      displayPopup("Order deleted successfully!", "success");
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      displayPopup("Failed to delete order", "error");
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
    }
  };

  // فلترة الأوردرات + ارجاع الصفحة الأولى عند أي تغيير
  const handleFilterChange = (key, value) => {
    setFilter({ ...filter, [key]: value });
    setCurrentPage(1);
  };

  // Search handler
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      (filter.status === "all" ||
        order.status?.toLowerCase() === filter.status) &&
      (filter.paymentMethod === "all" ||
        order.paymentMethod?.toLowerCase() === filter.paymentMethod) &&
      (filter.city === "all" || order.city === filter.city);

    const matchesSearch =
      searchTerm === "" ||
      order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      order.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-poppins">
      <h1 className="text-3xl font-bold text-darkBlue mb-6">
        Orders Dashboard
      </h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, order number, phone, address, city, area,or reference..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="
    w-full
    border
    rounded-lg
    p-2 sm:p-3
    text-[11px] sm:text-sm md:text-base
    placeholder:text-[10px] sm:placeholder:text-sm md:placeholder:text-base
    focus:outline-none
    focus:ring-2
    focus:ring-darkBlue
  "
        />
      </div>

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

      {/* Results Counter */}
      <p className="text-gray-600 mb-4">
        Showing {currentOrders.length} of {filteredOrders.length} orders
      </p>

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
                <span className="font-semibold">whatsapp:</span>{" "}
                {order.whatsapp}
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

            {/* Change Status & Delete & Confirm */}
            <div className="flex gap-3 mt-4 flex-wrap items-center">
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

              {/* Confirm Order - WhatsApp */}
              <button
                onClick={() => handleConfirmOrder(order)}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.486 2.031 7.788L0 32l8.418-2.007A15.937 15.937 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.76-1.845l-.485-.288-5.002 1.193 1.215-4.874-.317-.5A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.2-2.352-1.16-2.717-1.292-.364-.133-.63-.2-.895.2-.265.398-1.028 1.292-1.26 1.558-.232.265-.464.298-.862.1-.398-.2-1.682-.62-3.204-1.977-1.184-1.057-1.983-2.362-2.215-2.76-.232-.398-.025-.613.174-.811.179-.178.398-.464.597-.696.2-.232.265-.398.398-.663.133-.265.066-.497-.033-.696-.1-.2-.895-2.157-1.226-2.953-.323-.775-.651-.67-.895-.683-.232-.012-.497-.015-.762-.015-.265 0-.696.1-1.061.497-.364.398-1.393 1.36-1.393 3.316s1.426 3.847 1.625 4.113c.2.265 2.807 4.286 6.802 6.013.951.41 1.693.655 2.271.839.954.304 1.823.261 2.51.158.765-.114 2.352-.961 2.684-1.89.332-.929.332-1.725.232-1.89-.1-.165-.364-.265-.762-.464z" />
                </svg>
                Confirm Order
              </button>

              {/* Delete Button */}
              <button
                onClick={() => confirmDelete(order.id)}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors ml-auto"
              >
                Delete Order
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results Message */}
      {currentOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No orders found matching your criteria
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-6 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentPage(i + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-darkBlue text-white" : "bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Success/Error Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div
              className={`${
                popupType === "success" ? "bg-green-500" : "bg-red-500"
              } text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}
            >
              <span className="text-2xl">
                {popupType === "success" ? "✓" : "✕"}
              </span>
              <p className="font-semibold">{popupMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-darkBlue mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this order? This action cannot
                be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 rounded-xl font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  className="px-6 py-2 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

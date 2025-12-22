import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/* =======================
   Zod Schema
======================= */
const checkoutSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Please enter a valid name")
      .max(40, "Please enter a valid name")
      .regex(/^[A-Za-z\u0600-\u06FF\s]+$/, "Please enter a valid name."),
    phone: z
      .string()
      .regex(/^01[0125][0-9]{8}$/, "Phone must be a valid Egyptian number"),

    city: z.string().min(1, "Please select a city"),
    area: z
      .string()
      .min(2, "Area is required")
      .max(50, "Area is too long")
      .regex(/^[A-Za-z\u0600-\u06FF0-9\s]+$/, "Invalid area format"),

    // "Address can contain letters, numbers, spaces, commas, dots, and hyphens only"
    address: z
      .string()
      .min(10, "Address is required")
      .max(200, "Address is too long")
      .regex(/^[A-Za-z0-9\u0600-\u06FF\s,.-]+$/, "Invalid address format"),
    floor: z.string().regex(/^\d*$/, "Floor must be numbers only").optional(),
    paymentMethod: z.enum(["cash", "instapay", "vodafone"]),
    referenceNumber: z
      .string()
      .optional()
      .refine(
        (val) => {
          return true;
        },
        { message: "" }
      ),
  })
  .refine(
    (data) => {
      if (data.paymentMethod !== "instapay") {
        return true;
      }

      const ref = data.referenceNumber?.trim() || "";

      if (ref === "") {
        return false;
      }

      if (!/^\d+$/.test(ref)) {
        return false;
      }

      if (ref.length < 8 || ref.length > 20) {
        return false;
      }

      return true;
    },
    {
      message: "Reference number is required",
      path: ["referenceNumber"],
    }
  );

//    Egypt Cities
const egyptCities = [
  "Cairo",
  "Giza",
  "Fayoum",
  "Beni Suef",
  "Minya",
  "Assiut",
  "Sohag",
  "Qena",
  "Nag Hammadi",
  "Luxor",
  "Aswan",
  "Alexandria",
  "Tanta",
  "Mahalla",
  "Mansoura",
  "Suez",
  "Beheira",
  "Sharqia",
  "10th of Ramadan",
  "Port Said",
  "Ismailia",
  "Damietta",
  "Kafr El Sheikh",
  "Qalyubia",
  "Al Gharbia",
  "Monufia",
  "Dakahlia",
  "North Coast",
  "Marsa Matrouh",
  "Hurghada",
  "Sharm El Sheikh",
  "Marsa Alam",
  "Banha",
  "Badrashin",
  "Hawamdeya",
  "Saqqara",
  "Badr City",
];

const shippingFees = {
  Cairo: 60,
  Giza: 60,
  Fayoum: 100,
  "Beni Suef": 100,
  Minya: 100,
  Assiut: 100,
  Sohag: 100,
  Qena: 100,
  "Nag Hammadi": 100,
  Luxor: 105,
  Aswan: 115,
  Alexandria: 85,
  Tanta: 90,
  Mahalla: 90,
  Mansoura: 90,
  Suez: 90,
  Beheira: 90,
  Sharqia: 90,
  "10th of Ramadan": 90,
  "Port Said": 90,
  Ismailia: 90,
  Damietta: 90,
  "Kafr El Sheikh": 90,
  Qalyubia: 90,
  "Al Gharbia": 90,
  Monufia: 90,
  Dakahlia: 90,
  "North Coast": 125,
  "Marsa Matrouh": 125,
  Hurghada: 135,
  "Sharm El Sheikh": 135,
  "Marsa Alam": 135,
  Banha: 85,
  Badrashin: 85,
  Hawamdeya: 85,
  Saqqara: 85,
  "Badr City": 85,
};

//  Get Cart Data with Products Details
const getCartData = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const quantities = JSON.parse(localStorage.getItem("cartQuantities")) || {};
  const products = JSON.parse(localStorage.getItem("cartProducts")) || [];

  return products
    .filter((p) => cart.includes(p.id))
    .map((item) => ({
      productId: item.id,
      productName: item.name || "Unknown Product",
      price: Number(item.price || 0),
      quantity: quantities[item.id] || 1,
      total: Number(item.price || 0) * (quantities[item.id] || 1),
      image: item.image || "",
      category: item.category || "",
    }));
};

//    Get Total From Cart
const getCartTotal = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const quantities = JSON.parse(localStorage.getItem("cartQuantities")) || {};
  const products = JSON.parse(localStorage.getItem("cartProducts")) || [];

  return products
    .filter((p) => cart.includes(p.id))
    .reduce(
      (acc, item) => acc + Number(item.price || 0) * (quantities[item.id] || 1),
      0
    );
};

export default function Checkout() {
  const navigate = useNavigate();
  const total = getCartTotal();
  const [showModal, setShowModal] = useState(false);
  const [uploadingVodafone, setUploadingVodafone] = useState(false);
  const [vodafonePreview, setVodafonePreview] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
  });

  const paymentMethod = watch("paymentMethod");
  const selectedCity = watch("city");

  const shippingCost = selectedCity ? shippingFees[selectedCity] || 0 : 0;
  const grandTotal = total + shippingCost;

  // Upload Vodafone Screenshot to Cloudinary
  const handleVodafoneUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploadingVodafone(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "galilee_upload");
      formData.append("folder", "galilee_uploads");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dbxclj6yt/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      setValue("vodafoneScreenshot", data.secure_url, {
        shouldValidate: true,
      });

      setVodafonePreview(data.secure_url);

      toast.success("Screenshot uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot. Please try again.");
    } finally {
      setUploadingVodafone(false);
    }
  };

  const guestId = localStorage.getItem("guestId") || crypto.randomUUID();
  localStorage.setItem("guestId", guestId);

  const onSubmit = async (data) => {
    try {
      const cartItems = getCartData();

      const orderData = {
        ...data,
        vodafoneScreenshot: vodafonePreview,
        items: cartItems,

        subtotal: total,
        shippingFee: shippingCost,
        grandTotal: grandTotal,

        status: "pending",
        createdAt: serverTimestamp(),
        orderNumber: `ORD-${Date.now()}`,
        guestId,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);

      console.log("Order saved with ID:", docRef.id);

      localStorage.removeItem("cart");
      localStorage.removeItem("cartQuantities");
      localStorage.removeItem("cartProducts");

      toast.success(
        "Order placed successfully Thank you for shopping with us."
      );

      setTimeout(() => {
        navigate("/order-success", {
          state: {
            phone: orderData.phone,
            paymentMethod: orderData.paymentMethod,
          },
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1500);
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-gray-50 py-14 font-poppins">
        <motion.h2
          className="font-extrabold text-2xl sm:text-4xl md:text-4xl text-darkBlue text-center leading-tight
                      mb-10 md:mb-10 md:mt-7"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          Fast Checkout Process
        </motion.h2>
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-10 ">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-brownDark mb-1">
                Full Name *
              </label>
              <input
                {...register("fullName")}
                className={`w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? "border-red-400 focus:ring-red-300"
                    : "focus:ring-orange"
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-2 ml-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-semibold text-brownDark mb-1">
                Phone *
              </label>
              <input
                {...register("phone")}
                placeholder="01XXXXXXXXX"
                className={`w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border-red-400 focus:ring-red-300 "
                    : "focus:ring-orange"
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-2 ml-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* City + Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-semibold text-brownDark mb-1">
                  City *
                </label>
                <select
                  {...register("city")}
                  className={`w-full border border-gray-300 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 ${
                    errors.city
                      ? "border-red-400 focus:ring-red-300"
                      : "focus:ring-orange"
                  }`}
                >
                  <option value="">Select city</option>
                  {egyptCities.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-500 text-sm mt-2 ml-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-brownDark mb-1">
                  Area *
                </label>
                <input
                  {...register("area")}
                  className={` w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${
                    errors.area
                      ? "border-red-400 focus:ring-red-300"
                      : "focus:ring-orange"
                  }`}
                />
                {errors.area && (
                  <p className="text-red-500 text-sm mt-2 ml-1">
                    {errors.area.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block font-semibold text-brownDark mb-1">
                Address *
              </label>
              <textarea
                {...register("address")}
                rows={2}
                className={` w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${
                  errors.address
                    ? "border-red-400 focus:ring-red-300"
                    : "focus:ring-orange"
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-2 ml-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Floor */}
            <div>
              <label className="block font-semibold text-brownDark mb-1">
                Floor (Optional)
              </label>
              <input
                {...register("floor")}
                className={`w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.floor
                    ? "border-red-400 focus:ring-red-300"
                    : "focus:ring-orange"
                }`}
              />
              {errors.floor && (
                <p className="text-red-500 text-sm mt-2 ml-1">
                  {errors.floor.message}
                </p>
              )}
            </div>

            {/* ================= Payment ================= */}
            <div>
              <label className="block font-semibold text-brownDark mb-4">
                Payment Method *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "cash", icon: "💵", label: "Cash on Delivery" },
                  { id: "instapay", icon: "⚡", label: "Instapay" },
                  { id: "vodafone", icon: "📱", label: "Vodafone Cash" },
                ].map((method) => {
                  const selected = paymentMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`relative cursor-pointer rounded-2xl border p-5 text-center transition-all
                      ${
                        selected
                          ? "border-darkBlue bg-darkBlue/10 ring-2 ring-darkBlue scale-[1.03]"
                          : "border-gray-200 hover:shadow-md"
                      }`}
                    >
                      <input
                        type="radio"
                        value={method.id}
                        {...register("paymentMethod")}
                        className="hidden"
                      />

                      {selected && (
                        <span className="absolute top-3 right-3 bg-darkBlue text-white text-xs px-3 py-1 rounded-full">
                          ✓ Selected
                        </span>
                      )}

                      <div className="text-4xl mb-2">{method.icon}</div>
                      <p className="font-semibold text-brownDark">
                        {method.label}
                      </p>
                    </label>
                  );
                })}
              </div>

              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-2 ml-1">
                  Please select a payment method
                </p>
              )}
            </div>

            {/* ================= Reference Number (للـ Instapay فقط) ================= */}
            {paymentMethod === "instapay" && (
              <div className="bg-blue-50 border-2 rounded-2xl p-6">
                <label className="block font-bold text-darkBlue mb-3 text-lg">
                  ⚡ Instapay Payment Instructions
                </label>

                <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-400 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">💳</span>
                    Transfer to this account:
                  </p>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-black text-green-900 tracking-wider">
                      01027539203
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Store Account Number
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 mb-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-800 flex items-start">
                    <span className="text-blue-600 mr-2">1.</span>
                    Transfer the total amount shown below using Instapay
                  </p>
                  <p className="text-sm font-semibold text-gray-800 flex items-start">
                    <span className="text-blue-600 mr-2">2.</span>
                    After successful transfer, you will receive a reference
                    number
                  </p>
                  <p className="text-sm font-semibold text-gray-800 flex items-start">
                    <span className="text-blue-600 mr-2">3.</span>
                    Enter that reference number in the field below
                  </p>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <label className="block font-semibold text-darkBlue">
                    Reference Number *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1 hover:underline transition-all"
                  >
                    Click here to see where to find Reference Number
                  </button>
                </div>
                <input
                  {...register("referenceNumber")}
                  placeholder="Enter your Instapay reference number"
                  className={`w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${
                    errors.referenceNumber
                      ? "border-red-400 focus:ring-red-300"
                      : "focus:ring-blue-500"
                  }`}
                />
                {errors.referenceNumber && (
                  <p className="text-red-500 text-sm mt-2 ml-1">
                    {errors.referenceNumber.message}
                  </p>
                )}
              </div>
            )}

            {/* Vodafone Cash Section */}
            {paymentMethod === "vodafone" && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6">
                <label className="block font-bold text-blue-900 mb-3 text-lg">
                  📱 Vodafone Cash Payment Instructions
                </label>

                <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-400 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">💳</span>
                    Send payment to this number:
                  </p>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-black text-green-900 tracking-wider">
                      01027539203
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Store Vodafone Cash Number
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 mb-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-800 flex items-start">
                    <span className="text-blue-600 mr-2">1.</span>
                    Send the total amount using Vodafone Cash
                  </p>
                  <p className="text-sm font-semibold text-gray-800 flex items-start">
                    <span className="text-blue-600 mr-2">2.</span>
                    Take a screenshot of the successful transfer
                  </p>
                  <p className="text-sm font-semibold text-gray-800 flex items-start">
                    <span className="text-blue-600 mr-2">3.</span>
                    Upload the screenshot below
                  </p>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block font-semibold text-blue-900 mb-2">
                    Upload Transfer Screenshot *
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    {vodafonePreview ? (
                      <div className="space-y-4">
                        <img
                          src={vodafonePreview}
                          alt="Screenshot Preview"
                          className="max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <div className="flex gap-3 justify-center">
                          <span className="text-green-600 font-semibold">
                            ✓ Screenshot uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setVodafonePreview(null);
                              setValue("vodafoneScreenshot", "", {
                                shouldValidate: true,
                              });
                            }}
                            className="text-red-600 hover:text-red-700 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-5xl mb-3">📸</div>
                        <p className="text-gray-600 mb-4">
                          {uploadingVodafone
                            ? "Uploading screenshot..."
                            : "Click to upload transfer screenshot"}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleVodafoneUpload}
                          disabled={uploadingVodafone}
                          className="hidden"
                          id="vodafone-upload"
                        />
                        <label
                          htmlFor="vodafone-upload"
                          className={`inline-block bg-red-600 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer hover:bg-red-700 transition-colors ${
                            uploadingVodafone
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {uploadingVodafone ? "Uploading..." : "Choose File"}
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Supported: JPG, PNG (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {errors.vodafoneScreenshot && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.vodafoneScreenshot.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ================= Total ================= */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base text-gray-600">Subtotal</span>
                <span className="text-lg font-semibold text-darkBlue">
                  {total.toFixed(2)} EGP
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-base text-gray-600">Shipping Fee</span>
                <span className="text-lg font-semibold text-darkBlue">
                  {selectedCity
                    ? `${shippingCost.toFixed(2)} EGP`
                    : "Select city first"}
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-darkBlue">
                  Total Amount
                </span>
                <span className="text-3xl font-extrabold text-orange">
                  {grandTotal.toFixed(2)} EGP
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange to-orange/90 hover:from-orange/95 hover:to-orange/80 text-white
               font-bold py-4 rounded-2xl shadow-xl
              hover:scale-[1.03] transition-all"
            >
              {isSubmitting ? "Processing..." : "Confirm Order"}
            </button>
          </form>
        </div>
      </section>
      {/* ================= Modal للشرح ================= */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              {/* Close Button */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  📱 Where to Find Reference Number?
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Phone Mockup */}
              <div className="bg-white rounded-[40px] p-4 shadow-2xl max-w-sm mx-auto mb-6">
                <div className="bg-gray-50 rounded-[30px] overflow-hidden">
                  {/* Phone Header */}
                  <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-6 text-center">
                    <h3 className="text-xl font-bold mb-1">
                      Transfer Successful
                    </h3>
                    <p className="text-blue-200 text-sm">
                      Transaction Completed
                    </p>
                  </div>

                  {/* Success Icon */}
                  <div className="flex justify-center py-6 bg-gray-50">
                    <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      ✓
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="bg-white p-4 space-y-1">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600 text-sm">
                        Total Amount
                      </span>
                      <span className="font-bold text-gray-900">
                        850.00 EGP
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600 text-sm">Recipient</span>
                      <span className="font-bold text-gray-900">
                        Store Name
                      </span>
                    </div>

                    {/* Reference Number - HIGHLIGHTED */}
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-4 border-dashed border-yellow-500 rounded-xl p-4 my-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎯</span>
                        <span className="text-yellow-900 font-bold text-sm">
                          Reference
                        </span>
                      </div>
                      <span className="font-black text-yellow-900 text-lg tracking-wider bg-yellow-300/50 px-3 py-1.5 rounded-lg block text-center">
                        You will find the Reference Number here
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600 text-sm">Date:</span>
                      <span className="font-bold text-gray-900 text-sm">
                        22 Dec 2025
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 text-sm">Status</span>
                      <span className="font-bold text-green-600">
                        ✓ Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5">
                  <h4 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <span>📋</span> Where Else to Find It?
                  </h4>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="text-gray-700">
                      Check your transaction history in the app
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5">
                  <h4 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <span>💡</span> Important Tip
                  </h4>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="text-gray-700">
                      Copy the exact same number from your transaction
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h5 className="font-bold text-red-900 mb-1">Important:</h5>
                    <p className="text-red-800 text-sm">
                      Copy the reference number immediately after transfer!
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-white text-purple-700 font-bold py-3 rounded-xl mt-6 hover:bg-gray-100 transition-colors"
              >
                Got it, Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

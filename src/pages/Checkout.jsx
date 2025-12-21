import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

/* =======================
   Zod Schema
======================= */
const checkoutSchema = z.object({
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
});

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
  Cairo: 90,
  Giza: 90,
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
  });

  const paymentMethod = watch("paymentMethod");
  const selectedCity = watch("city");

  const shippingCost = selectedCity ? shippingFees[selectedCity] || 0 : 0;
  const grandTotal = total + shippingCost;

  const onSubmit = (data) => {
    const orderData = {
      ...data,
      subtotal: total,
      shippingFee: shippingCost,
      grandTotal: grandTotal,
    };
    if (data.paymentMethod === "cash") {
      setShowSuccessMessage(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.success("Order placed successfully");
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
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-green-50 border-2 border-green-500 rounded-2xl p-6"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">✅</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    Order Confirmed Successfully
                  </h3>
                  <p className="text-green-700 leading-relaxed">
                    Your order has been placed successfully. We will contact you
                    on WhatsApp to confirm your order. Payment will be collected
                    upon delivery (Cash on Delivery).
                  </p>
                  <p className="text-green-600 text-sm mt-3 font-semibold">
                    Total Amount: {grandTotal.toFixed(2)} EGP
                  </p>
                </div>
              </div>
            </motion.div>
          )}
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

      <Footer />
    </>
  );
}

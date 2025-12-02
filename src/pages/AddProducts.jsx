import { useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, serverTimestamp, setDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function AddProducts() {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select an image");

    setLoading(true);

    try {
      // Cloudinary
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

      const data = await res.json();

      // Firebase
      const productRef = doc(collection(db, "Products"));
      await setDoc(productRef, {
        ...productData,
        imageUrl: data.secure_url,
        createdAt: serverTimestamp(),
      });

      toast.success("Product added successfully");
      setProductData({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        category: "",
        imageUrl: "",
      });
      setFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Error adding product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins px-6 py-10">
      <motion.h2
        className="text-3xl text-darkBlue mb-10 text-center font-semibold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Add New Product
      </motion.h2>

      <form className="flex flex-col gap-6 w-full " onSubmit={handleSubmit}>
        {/* Product Name */}
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter product name"
            onChange={handleChange}
            value={productData.name}
            className="p-4 rounded-xl border border-gray-300 bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-blue focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">Description</label>
          <textarea
            name="description"
            rows="4"
            placeholder="Enter product description"
            onChange={handleChange}
            value={productData.description}
            className="p-4 rounded-xl border border-gray-300 bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-blue focus:outline-none"
          />
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">Price ($)</label>
          <input
            type="number"
            name="price"
            placeholder="Enter price"
            onChange={handleChange}
            value={productData.price}
            className="p-4 rounded-xl border border-gray-300 bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-blue focus:outline-none"
          />
        </div>

        {/* Discount Price */}
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">
            Discount Price (optional)
          </label>
          <input
            type="number"
            name="discountPrice"
            placeholder="Enter discounted price (optional)"
            onChange={handleChange}
            value={productData.discountPrice}
            className="p-4 rounded-xl border border-gray-300 bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-blue focus:outline-none"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">
            Category (optional)
          </label>
          <input
            type="text"
            name="category"
            placeholder="Enter category"
            onChange={handleChange}
            value={productData.category}
            className="p-4 rounded-xl border border-gray-300 bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-blue focus:outline-none"
          />
        </div>

        {/* Image Upload */}
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm
            file:mr-3 file:py-2 file:px-4 file:rounded-md 
            file:border-0 file:text-white file:bg-orange 
            file:hover:bg-blue file:cursor-pointer cursor-pointer"
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="mt-4 w-fit px-10 py-3 rounded-xl font-semibold text-white bg-orange hover:bg-blue transition shadow-md"
        >
          {loading ? "Uploading..." : "Add Product"}
        </motion.button>
      </form>
    </div>
  );
}

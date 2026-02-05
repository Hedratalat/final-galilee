import { useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, serverTimestamp, setDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function AddProducts() {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    descriptionDetails: "",
    price: "",
    discountPrice: "",
    category: "",
    imageUrl: "",
    order: "",
  });

  const [loading, setLoading] = useState(false);

  // New Image Url
  const [externalMainImageUrl, setExternalMainImageUrl] = useState("");
  const [externalGalleryUrls, setExternalGalleryUrls] = useState("");
  const [externalVideoUrl, setExternalVideoUrl] = useState("");

  const handleChange = (e) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!externalMainImageUrl) {
      return toast.error("Please enter main image URL");
    }

    setLoading(true);

    try {
      /* ===== معالجة الـ External URLs ===== */
      const externalGalleryArray = externalGalleryUrls
        .split(/\r?\n|,/)
        .map((url) => url.trim())
        .filter((url) => url && url.startsWith("http"));

      /* ===== Save To Firebase ===== */
      // Products دا الاساسي
      // ProductsTest دا للتجربة
      await setDoc(doc(collection(db, "Products")), {
        ...productData,
        imageUrl: externalMainImageUrl,
        images: externalGalleryArray,
        videoUrl: externalVideoUrl || "",
        order: productData.order ? parseInt(productData.order) : null,
        createdAt: serverTimestamp(),
      });

      toast.success("Product added successfully");

      // Reset form
      setProductData({
        name: "",
        description: "",
        descriptionDetails: "",
        price: "",
        discountPrice: "",
        category: "",
        order: "",
      });
      setExternalMainImageUrl("");
      setExternalGalleryUrls("");
      setExternalVideoUrl("");
    } catch (error) {
      toast.error("Error adding product", error);
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
            data-gramm="false"
            data-gramm_editor="false"
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
            data-gramm="false"
            data-gramm_editor="false"
            rows="4"
            placeholder="Enter product description"
            onChange={handleChange}
            value={productData.description}
            className="p-4 rounded-xl border border-gray-300 bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-blue focus:outline-none"
          />
        </div>

        {/* Details Description */}
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">
            Product Details
          </label>
          <textarea
            name="descriptionDetails"
            data-gramm="false"
            data-gramm_editor="false"
            rows="6"
            placeholder="Enter detailed product information (materials, size, usage...)"
            onChange={handleChange}
            value={productData.descriptionDetails}
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
        {/* Order */}
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">
            Display Order (optional)
          </label>
          <input
            type="number"
            name="order"
            placeholder="Enter display order (e.g., 1, 2, 3...)"
            onChange={handleChange}
            value={productData.order}
            min="1"
            className="p-4 rounded-xl border border-gray-300 bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-blue focus:outline-none"
          />
          <p className="text-sm text-gray-500 mt-1">
            Products with order numbers will appear first. Leave empty to show
            at the end.
          </p>
        </div>

        {/* External Main Image URL */}
        <div className="flex flex-col mb-4">
          <label className="text-darkBlue font-medium mb-2">
            Main Image URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={externalMainImageUrl}
            onChange={(e) => setExternalMainImageUrl(e.target.value)}
            className="p-4 rounded-xl border border-gray-300
             bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-orange focus:outline-none"
          />
        </div>

        {/* External Gallery URLs */}
        <div className="flex flex-col mb-4">
          <label className="font-medium text-darkBlue mb-2">Gallery URLs</label>
          <textarea
            rows="4"
            data-gramm="false"
            data-gramm_editor="false"
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;Or separate by commas"
            value={externalGalleryUrls}
            onChange={(e) => setExternalGalleryUrls(e.target.value)}
            className="p-4 rounded-xl border border-gray-300 bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-orange focus:outline-none"
          />
        </div>

        {/* External Video URL */}
        <div className="flex flex-col">
          <label className="font-medium text-darkBlue mb-2">
            Video URL (optional)
          </label>
          <input
            type="url"
            placeholder="https://example.com/video.mp4"
            value={externalVideoUrl}
            onChange={(e) => setExternalVideoUrl(e.target.value)}
            className="p-4 rounded-xl border border-gray-300 bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-orange focus:outline-none"
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

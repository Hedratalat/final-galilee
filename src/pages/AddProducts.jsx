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
  const [imagesFiles, setImagesFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [mainImageFile, setMainImageFile] = useState(null);

  const handleChange = (e) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImagesChange = (e) => {
    setImagesFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mainImageFile) {
      return toast.error("Please select main image");
    }

    setLoading(true);

    try {
      /* ===== Upload Main Image ===== */
      const mainImageData = new FormData();
      mainImageData.append("file", mainImageFile);
      mainImageData.append("upload_preset", "galilee_upload");
      mainImageData.append("folder", "galilee_uploads/main");

      const mainImageRes = await fetch(
        "https://api.cloudinary.com/v1_1/dbxclj6yt/image/upload",
        {
          method: "POST",
          body: mainImageData,
        }
      );

      const mainImage = await mainImageRes.json();

      /* ===== Upload Product Images ===== */
      const imagesUrls = [];

      for (const image of imagesFiles) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "galilee_upload");
        formData.append("folder", "galilee_uploads/gallery");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dbxclj6yt/image/upload",
          { method: "POST", body: formData }
        );

        const data = await res.json();
        imagesUrls.push(data.secure_url);
      }

      /* ===== Upload Video (Optional) ===== */
      let videoUrl = "";

      if (videoFile) {
        const videoData = new FormData();
        videoData.append("file", videoFile);
        videoData.append("upload_preset", "galilee_upload");
        videoData.append("folder", "galilee_uploads/videos");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dbxclj6yt/video/upload",
          { method: "POST", body: videoData }
        );

        const data = await res.json();
        videoUrl = data.secure_url;
      }

      /* ===== Save To Firebase ===== */
      await setDoc(doc(collection(db, "Products")), {
        ...productData,
        imageUrl: mainImage.secure_url,
        images: imagesUrls,
        videoUrl,
        order: productData.order ? parseInt(productData.order) : null,
        createdAt: serverTimestamp(),
      });

      toast.success("Product added successfully");
    } catch (error) {
      toast.error("Error adding product");
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

        {/* Details Description */}
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">
            Product Details
          </label>
          <textarea
            name="descriptionDetails"
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
        {/* Card Image Upload */}
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">Main Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMainImageFile(e.target.files[0])}
            className="file-input w-full border border-gray-300 rounded-xl px-3 py-2 text-sm
      file:mr-3 file:py-2 file:px-4 file:rounded-md 
      file:border-0 file:text-white file:bg-orange 
      file:hover:bg-blue file:cursor-pointer cursor-pointer"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-darkBlue mb-2">
            Product Images (Gallery)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
            className="file-input w-full border border-gray-300 rounded-xl px-3 py-2 text-sm
            file:mr-3 file:py-2 file:px-4 file:rounded-md 
            file:border-0 file:text-white file:bg-orange 
            file:hover:bg-blue file:cursor-pointer cursor-pointer"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-darkBlue mb-2">
            Product Video (optional)
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="file-input w-full border border-gray-300 rounded-xl px-3 py-2 text-sm
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

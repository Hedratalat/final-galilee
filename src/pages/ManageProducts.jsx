import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const IMGBB_API_KEY = "ba0f20fbb48a75e4708def3f1f212acc";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});

  // URLs for editing
  const [imageCardUrl, setImageCardUrl] = useState("");
  const [galleryImageUrl, setGalleryImageUrl] = useState("");

  const [loadingImg, setLoadingImg] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Products"), (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
      setLoadingProducts(false);
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setUpdatedData({
      ...updatedData,
      [e.target.name]: e.target.value,
    });
  };

  // دالة تحويل YouTube لـ embed
  const convertToEmbedUrl = (url) => {
    if (!url) return "";

    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const youtubeMatch = url.match(youtubeRegex);

    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    return url;
  };

  // Toggle Out of Stock Status
  const toggleOutOfStock = async (productId, currentStatus) => {
    try {
      const productRef = doc(db, "Products", productId);
      await updateDoc(productRef, {
        outOfStock: !currentStatus,
      });

      toast.success(
        !currentStatus
          ? "Product marked as out of stock"
          : "Product is now available",
      );
    } catch (err) {
      toast.error("Error updating stock status");
      console.log(err);
    }
  };

  const saveChanges = async () => {
    try {
      setLoadingImg(true);
      const productRef = doc(db, "Products", editingId);
      let updatePayload = { ...updatedData };

      // Convert order to number or null
      if (updatedData.order !== undefined) {
        updatePayload.order = updatedData.order
          ? parseInt(updatedData.order)
          : null;
      }

      // Update card image URL if provided
      if (imageCardUrl.trim()) {
        updatePayload.imageUrl = imageCardUrl.trim();
        updatePayload.imageCard = imageCardUrl.trim();
      }

      // Add gallery image URL if provided
      if (galleryImageUrl.trim()) {
        updatePayload.images = [
          ...(updatedData.images || []),
          galleryImageUrl.trim(),
        ];
      }

      // Convert video URL if changed
      if (updatedData.videoUrl !== undefined) {
        updatePayload.videoUrl = convertToEmbedUrl(updatedData.videoUrl);
      }

      await updateDoc(productRef, updatePayload);

      toast.success("Product updated successfully");
      setEditingId(null);
      setImageCardUrl("");
      setGalleryImageUrl("");
    } catch (err) {
      toast.error("Error updating product");
      console.log(err);
    } finally {
      setLoadingImg(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "Products", deleteId));
    toast.success("Product deleted");
    setDeleteId(null);
  };

  const removeGalleryImage = (index) => {
    const newImages = [...(updatedData.images || [])];
    newImages.splice(index, 1);
    setUpdatedData({ ...updatedData, images: newImages });
  };

  return (
    <div className="font-poppins p-6 relative">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl text-darkBlue mb-10 text-center font-semibold"
      >
        Manage Products
      </motion.h2>

      {loadingProducts ? (
        <div className="w-full flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10"
        >
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl p-6 shadow-md">
              <div className="relative">
                <img
                  src={p.imageCard || p.imageUrl}
                  alt={p.name}
                  loading="lazy"
                  className={`w-full h-60 object-cover rounded-xl mb-4 ${
                    p.outOfStock ? "opacity-50 grayscale" : ""
                  }`}
                />

                {p.outOfStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl mb-4">
                    <span className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg transform rotate-[-15deg]">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>

              {editingId === p.id ? (
                <div className="flex flex-col gap-4">
                  {/* Product Name */}
                  <input
                    name="name"
                    defaultValue={p.name}
                    onChange={handleChange}
                    placeholder="Product Name"
                    className="p-3 border rounded-xl"
                  />

                  {/* Description */}
                  <textarea
                    name="description"
                    defaultValue={p.description}
                    onChange={handleChange}
                    placeholder="Description"
                    rows="3"
                    className="p-3 border rounded-xl"
                  ></textarea>

                  {/* Description Details */}
                  <textarea
                    name="descriptionDetails"
                    defaultValue={p.descriptionDetails}
                    onChange={handleChange}
                    placeholder="Detailed Description"
                    rows="4"
                    className="p-3 border rounded-xl"
                  ></textarea>

                  {/* Price */}
                  <input
                    name="price"
                    defaultValue={p.price}
                    onChange={handleChange}
                    placeholder="Price"
                    className="p-3 border rounded-xl"
                    type="number"
                  />

                  {/* Discount Price */}
                  <input
                    name="discountPrice"
                    defaultValue={p.discountPrice}
                    onChange={handleChange}
                    placeholder="Discount Price"
                    className="p-3 border rounded-xl"
                    type="number"
                  />

                  {/* Category */}
                  <input
                    name="category"
                    defaultValue={p.category}
                    onChange={handleChange}
                    placeholder="Category"
                    className="p-3 border rounded-xl"
                  />

                  {/* Display Order */}
                  <div className="flex flex-col">
                    <label className="text-darkBlue font-medium mb-2 text-sm">
                      Display Order (optional)
                    </label>
                    <input
                      name="order"
                      type="number"
                      min="1"
                      defaultValue={p.order || ""}
                      onChange={handleChange}
                      placeholder="Enter display order (e.g., 1, 2, 3...)"
                      className="p-3 border rounded-xl"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Products with order numbers will appear first. Leave empty
                      to show at the end.
                    </p>
                  </div>

                  {/* Card Image URL */}
                  <div className="flex flex-col">
                    <label className="font-medium text-darkBlue mb-2 text-sm">
                      Card Image URL (Main)
                    </label>
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-2">
                        Current Image:
                      </p>
                      <img
                        src={p.imageCard || p.imageUrl}
                        alt="Current"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                    <input
                      type="text"
                      value={imageCardUrl}
                      onChange={(e) => setImageCardUrl(e.target.value)}
                      placeholder="Paste any image URL"
                      className="p-3 border rounded-xl"
                    />
                  </div>

                  {/* Gallery Images */}
                  <div className="flex flex-col">
                    <label className="font-medium text-darkBlue mb-2 text-sm">
                      Product Images (Gallery)
                    </label>

                    {/* Show existing images */}
                    {updatedData.images && updatedData.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {updatedData.images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={img}
                              alt={`Gallery ${idx}`}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <input
                      type="text"
                      value={galleryImageUrl}
                      onChange={(e) => setGalleryImageUrl(e.target.value)}
                      placeholder="Paste image URL to add to gallery"
                      className="p-3 border rounded-xl"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add one image at a time. Click Save to add the image to
                      gallery.
                    </p>
                  </div>

                  {/* Video Upload */}
                  <div className="flex flex-col">
                    <label className="font-medium text-darkBlue mb-2 text-sm">
                      Video URL (optional)
                    </label>

                    {/* عرض الفيديو الحالي */}
                    {p.videoUrl && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">
                          Current Video:
                        </p>
                        <iframe
                          src={p.videoUrl}
                          className="w-full h-48 rounded-xl"
                          allowFullScreen
                        />
                      </div>
                    )}

                    <input
                      type="text"
                      name="videoUrl"
                      defaultValue={p.videoUrl}
                      onChange={handleChange}
                      placeholder="https://www.youtube.com/watch?v=ABC123 or embed link"
                      className="p-3 border rounded-xl"
                    />
                  </div>

                  <button
                    onClick={saveChanges}
                    disabled={loadingImg}
                    className="bg-orange text-white px-5 py-2 rounded-xl mt-4 disabled:opacity-50"
                  >
                    {loadingImg ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(null);
                      setImageCardUrl("");
                      setGalleryImageUrl("");
                    }}
                    className="bg-gray-300 px-5 py-2 rounded-xl mt-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-darkBlue">
                    {p.name}
                  </h3>
                  <p className="text-gray-600 mt-2">{p.description}</p>

                  {p.descriptionDetails && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-3">
                      {p.descriptionDetails}
                    </p>
                  )}

                  <div className="flex justify-between mt-4">
                    <div className="text-lg font-bold text-orange">
                      {p.discountPrice ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">
                            {p.price}
                          </span>
                          {p.discountPrice}
                        </>
                      ) : (
                        p.price
                      )}
                      EGP
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-blue text-white px-3 py-1 rounded-xl text-sm">
                        {p.category}
                      </span>
                      {p.order && (
                        <span className="bg-gray-200 text-darkBlue px-3 py-1 rounded-xl text-sm font-semibold">
                          Order: {p.order}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Show media indicators */}
                  <div className="flex gap-2 mt-3 text-xs text-gray-500">
                    {p.images && p.images.length > 0 && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        📷 {p.images.length} images
                      </span>
                    )}
                    {p.videoUrl && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        🎥 Video
                      </span>
                    )}
                  </div>

                  {/* Out of Stock Toggle */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-darkBlue">
                          Stock Status
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {p.outOfStock
                            ? "Product is out of stock"
                            : "Product is available"}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleOutOfStock(p.id, p.outOfStock)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-md ${
                          p.outOfStock
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        {p.outOfStock
                          ? "Mark as Available"
                          : "Mark as Out of Stock"}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => {
                        setEditingId(p.id);
                        setUpdatedData(p);
                        setImageCardUrl("");
                        setGalleryImageUrl("");
                      }}
                      className="bg-blue text-white px-4 py-2 rounded-xl"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center">
            <h2 className="text-xl font-semibold mb-4 text-darkBlue">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

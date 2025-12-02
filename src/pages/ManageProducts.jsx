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

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [file, setFile] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // NEW: Modal
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

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadNewImage = async () => {
    if (!file) return null;
    setLoadingImg(true);

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
    setLoadingImg(false);
    return data.secure_url;
  };

  const saveChanges = async () => {
    try {
      const productRef = doc(db, "Products", editingId);
      let imgURL = updatedData.imageUrl;
      if (file) imgURL = await uploadNewImage();

      await updateDoc(productRef, {
        ...updatedData,
        imageUrl: imgURL,
      });

      toast.success("Product updated successfully");
      setEditingId(null);
      setFile(null);
    } catch (err) {
      toast.error("Error updating product");
      console.log(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "Products", deleteId));
    toast.success("Product deleted");
    setDeleteId(null);
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
        // Animate the whole container instead of each card
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10"
        >
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl p-6 shadow-md">
              <img
                src={p.imageUrl}
                alt={p.name}
                loading="lazy"
                className="w-full h-60 object-cover rounded-xl mb-4"
              />

              {editingId === p.id ? (
                <div className="flex flex-col gap-4">
                  <input
                    name="name"
                    defaultValue={p.name}
                    onChange={handleChange}
                    className="p-3 border rounded-xl"
                  />
                  <textarea
                    name="description"
                    defaultValue={p.description}
                    onChange={handleChange}
                    className="p-3 border rounded-xl"
                  ></textarea>
                  <input
                    name="price"
                    defaultValue={p.price}
                    onChange={handleChange}
                    className="p-3 border rounded-xl"
                    type="number"
                  />
                  <input
                    name="discountPrice"
                    defaultValue={p.discountPrice}
                    onChange={handleChange}
                    className="p-3 border rounded-xl"
                    type="number"
                  />
                  <input
                    name="category"
                    defaultValue={p.category}
                    onChange={handleChange}
                    className="p-3 border rounded-xl"
                  />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="
                      mt-2
                      border-0 outline-none focus:outline-none focus:ring-0
                      file:mr-3 file:py-2 file:px-4 
                      file:rounded-md file:border-0 
                      file:text-white file:bg-orange 
                      hover:file:bg-blue
                      file:cursor-pointer cursor-pointer
                    "
                  />
                  <button
                    onClick={saveChanges}
                    className="bg-orange text-white px-5 py-2 rounded-xl mt-4"
                  >
                    {loadingImg ? "Uploading..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
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
                    <span className="bg-blue text-white px-3 py-1 rounded-xl text-sm">
                      {p.category}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => {
                        setEditingId(p.id);
                        setUpdatedData(p);
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
      {/* ✨ DELETE MODAL */}
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

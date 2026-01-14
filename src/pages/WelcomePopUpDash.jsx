import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { Trash2, Edit2, X } from "lucide-react";

export default function WelcomePopUpDash() {
  const [formData, setFormData] = useState({
    link: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popups, setPopups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "WelcomePopups"));
      const popupsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPopups(popupsData);
    } catch (error) {
      toast.error("Error fetching popups");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile && !editingId) {
      return toast.error("Please select an image");
    }

    if (!formData.link) {
      return toast.error("Please enter a link");
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        const imageData = new FormData();
        imageData.append("file", imageFile);
        imageData.append("upload_preset", "galilee_upload");
        imageData.append("folder", "galilee_uploads/popups");

        const imageRes = await fetch(
          "https://api.cloudinary.com/v1_1/dbxclj6yt/image/upload",
          {
            method: "POST",
            body: imageData,
          }
        );

        const image = await imageRes.json();
        imageUrl = image.secure_url;
      }

      const popupData = {
        link: formData.link,
        ...(imageUrl && { imageUrl }),
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        const existingPopup = popups.find((p) => p.id === editingId);
        await setDoc(doc(db, "WelcomePopups", editingId), {
          ...popupData,
          imageUrl: imageUrl || existingPopup.imageUrl,
        });
        toast.success("Popup updated successfully");
      } else {
        await setDoc(doc(collection(db, "WelcomePopups")), {
          ...popupData,
          createdAt: new Date().toISOString(),
        });
        toast.success("Popup added successfully");
      }

      setFormData({ link: "" });
      setImageFile(null);
      setImagePreview(null);
      setEditingId(null);
      fetchPopups();
    } catch (error) {
      toast.error("Error saving popup");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (popup) => {
    setEditingId(popup.id);
    setFormData({ link: popup.link });
    setImagePreview(popup.imageUrl);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "WelcomePopups", deleteConfirm));
      toast.success("Popup deleted successfully");
      setDeleteConfirm(null);
      fetchPopups();
    } catch (error) {
      toast.error("Error deleting popup");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ link: "" });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="font-poppins px-6 py-10">
      <motion.h2
        className="text-3xl text-darkBlue mb-10 text-center font-semibold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {editingId ? "Edit Welcome Popup" : "Add Welcome Popup"}
      </motion.h2>

      <div className="flex flex-col gap-6 w-full mx-auto">
        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">Popup Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input w-full border border-gray-300 rounded-xl px-3 py-2 text-sm
              file:mr-3 file:py-2 file:px-4 file:rounded-md 
              file:border-0 file:text-white file:bg-orange 
              file:hover:bg-blue file:cursor-pointer cursor-pointer"
          />
          {imagePreview && (
            <div className="mt-4 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-w-md rounded-xl shadow-md"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-darkBlue font-medium mb-2">Link URL</label>
          <input
            type="url"
            name="link"
            placeholder="https://example.com/offer"
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            value={formData.link}
            className="p-4 rounded-xl border border-gray-300 bg-white text-darkBlue placeholder-gray-500 focus:ring-2 focus:ring-blue focus:outline-none"
          />
        </div>

        <div className="flex gap-4">
          <motion.button
            type="button"
            onClick={handleSubmit}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="px-10 py-3 rounded-xl font-semibold text-white bg-orange hover:bg-blue transition shadow-md"
          >
            {loading ? "Saving..." : editingId ? "Update Popup" : "Add Popup"}
          </motion.button>

          {editingId && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={cancelEdit}
              className="px-6 py-3 rounded-xl font-semibold text-darkBlue bg-gray-200 hover:bg-gray-300 transition shadow-md"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </div>

      {popups.length > 0 && (
        <div className="mt-16 mx-auto">
          <h3 className="text-2xl text-darkBlue font-semibold mb-6">
            Existing Popups
          </h3>
          <div className="grid gap-6">
            {popups.map((popup) => (
              <motion.div
                key={popup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <img
                    src={popup.imageUrl}
                    alt="Popup"
                    className="w-full sm:w-48 h-48 sm:h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-darkBlue font-medium mb-2">Link:</p>
                    <a
                      href={popup.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue hover:underline break-all text-sm sm:text-base"
                    >
                      {popup.link}
                    </a>
                    <p className="text-sm text-gray-500 mt-3">
                      Created: {new Date(popup.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleEdit(popup)}
                      className="flex-1 sm:flex-none p-2 text-blue hover:bg-blue/10 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(popup.id)}
                      className="flex-1 sm:flex-none p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-darkBlue">
                  Confirm Delete
                </h3>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this popup? This action cannot
                be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium text-darkBlue bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

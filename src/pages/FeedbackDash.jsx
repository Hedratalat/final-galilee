import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";

export default function FeedbackDash() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [selectedDelete, setSelectedDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Feedbacks"), (snapshot) => {
      setFeedbacks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (id) => {
    setLoadingId(id);
    try {
      const feedbackRef = doc(db, "Feedbacks", id);
      await updateDoc(feedbackRef, { approved: true });
      toast.success("Feedback approved!");
    } catch (err) {
      toast.error("Error approving feedback");
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    setLoadingId(id);
    try {
      await deleteDoc(doc(db, "Feedbacks", id));
      toast.success("Feedback deleted successfully");
      setSelectedDelete(null);
    } catch (err) {
      toast.error("Error deleting feedback");
      console.error(err);
    } finally {
      setLoadingId(null);
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
        Manage Feedbacks
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.length === 0 && (
          <p className="text-center col-span-full">No feedbacks yet</p>
        )}

        {feedbacks.map((fb) => (
          <motion.div
            key={fb.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`p-6 rounded-2xl shadow-lg flex flex-col justify-between transition-all duration-300
            ${
              fb.approved
                ? "bg-green-100 border-green-200"
                : "bg-white border border-gray-300"
            }`}
          >
            <div className="mb-4">
              <p className="text-gray-900 font-semibold border-b border-gray-300 pb-1 mb-4">
                {fb.name}
                <p className="text-gray-900  text-sm mt-1">{fb.email}</p>
              </p>
              <p className="text-gray-700 mt-2">{fb.message}</p>
              {fb.createdAt?.seconds && (
                <p className="text-gray-500 text-xs mt-2">
                  {new Date(fb.createdAt.seconds * 1000).toLocaleDateString()}{" "}
                  {new Date(fb.createdAt.seconds * 1000).toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-2">
              {!fb.approved && (
                <button
                  onClick={() => handleApprove(fb.id)}
                  disabled={loadingId === fb.id}
                  className="flex items-center gap-2 text-green-600 hover:text-green-800 transition"
                >
                  <FaCheckCircle /> Approve
                </button>
              )}
              <button
                onClick={() => setSelectedDelete(fb.id)}
                disabled={loadingId === fb.id}
                className="flex items-center gap-2 text-red-600 hover:text-red-800 transition"
              >
                <FaTimesCircle /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Popup Confirm Delete */}
      <AnimatePresence>
        {selectedDelete && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-gray-200"
            >
              <h3 className="text-xl font-semibold mb-3">Delete Feedback?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this feedback? This action
                cannot be undone.
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleDelete(selectedDelete)}
                  className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setSelectedDelete(null)}
                  className="bg-gray-400 text-white px-5 py-2 rounded-full hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

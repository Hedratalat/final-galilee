import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimesCircle } from "react-icons/fa";
import { db } from "../firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function MessageDash() {
  const [messages, setMessages] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [selectedDelete, setSelectedDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Messages"), (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    setLoadingId(id);
    try {
      await deleteDoc(doc(db, "Messages", id));
      toast.success("Message deleted successfully");
      setSelectedDelete(null);
    } catch (err) {
      toast.error("Error deleting message");
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
        Manage Messages
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.length === 0 && (
          <p className="text-center col-span-full">No messages yet</p>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 rounded-2xl shadow-lg flex flex-col justify-between
                       bg-white border border-gray-300"
          >
            <div className="mb-4">
              <p className="text-gray-900 font-semibold  pb-1 ">
                {msg.fullName}
              </p>
              <p className="text-gray-900 text-sm border-b border-gray-300 mt-1 ">
                {msg.email}
              </p>
              <p className="text-gray-700 mt-4">{msg.message}</p>

              {msg.createdAt?.seconds && (
                <p className="text-gray-500 text-xs mt-2">
                  {new Date(msg.createdAt.seconds * 1000).toLocaleDateString()}{" "}
                  {new Date(msg.createdAt.seconds * 1000).toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={() => setSelectedDelete(msg.id)}
                disabled={loadingId === msg.id}
                className="flex items-center gap-2 text-red-600 hover:text-red-800 transition"
              >
                <FaTimesCircle /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirm Delete Popup */}
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
              <h3 className="text-xl font-semibold mb-3">Delete Message?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this message? This action cannot
                be undone.
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

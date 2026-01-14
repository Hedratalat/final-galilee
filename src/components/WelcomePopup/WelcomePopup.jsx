import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { X } from "lucide-react";
import { db } from "../../firebase";

export default function WelcomePopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);

  useEffect(() => {
    const lastShown = localStorage.getItem("welcomePopupLastShown");
    const today = new Date().toDateString();

    if (lastShown !== today) {
      const timer = setTimeout(() => {
        fetchPopup();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchPopup = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "WelcomePopups"));
      if (!querySnapshot.empty) {
        const popup = querySnapshot.docs[0].data();
        setPopupData(popup);
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error fetching popup:", error);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem("welcomePopupLastShown", new Date().toDateString());
  };

  return (
    <AnimatePresence>
      {showPopup && popupData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-3 sm:p-6"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="
              relative 
              w-full 
              max-w-[90vw] 
              sm:max-w-[500px] 
              md:max-w-[700px] 
              lg:max-w-[900px]
            "
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="
                absolute 
                -top-3 
                -right-3 
                z-10 
                bg-red-500 
                hover:bg-red-600 
                rounded-full 
                p-2 
                shadow-xl 
                transition 
                hover:scale-110
              "
              aria-label="Close popup"
            >
              <X className="text-white w-5 h-5" />
            </button>

            {/* Popup Content */}
            <a
              href={popupData.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="block"
            >
              <img
                src={popupData.imageUrl}
                alt="Special Offer"
                className="
                  w-full
                  max-h-[80vh]
                  object-contain
                  rounded-2xl
                  shadow-2xl
                  bg-white
                "
              />
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

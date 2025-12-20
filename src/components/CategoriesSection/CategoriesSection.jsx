import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Products"), (snapshot) => {
      const products = snapshot.docs.map((doc) => doc.data());
      const uniqueCategories = [...new Set(products.map((p) => p.category))];
      setCategories(uniqueCategories);
    });
    return () => unsubscribe();
  }, []);

  const displayedCategories = showAll ? categories : categories.slice(0, 4);

  return (
    <section
      id="categories-section"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-10 font-poppins"
    >
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0 }}
        viewport={{ once: true }}
        className="text-2xl sm:text-4xl md:text-4xl font-poppins font-bold text-darkBlue text-center mb-2"
      >
        Explore Our Collections
      </motion.h2>

      {/* Animated Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
        className="text-center mb-8 max-w-2xl mx-auto text-base sm:text-md text-gray-700 font-poppins font-medium"
      >
        Explore our product categories and discover the items you love.
      </motion.p>

      {/* Grid container with AnimatePresence */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {displayedCategories.map((cat, idx) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: idx * 0.2 }}
              className="px-4 py-3 bg-gradient-to-tr from-blue to-darkBlue text-white rounded-2xl font-medium text-center cursor-pointer shadow-lg 
          text-sm sm:text-base md:text-lg lg:text-xl 
          sm:px-5 sm:py-4 md:px-6 md:py-5 lg:px-8 lg:py-6
          transform transition-all duration-300
          hover:scale-105 hover:shadow-2xl hover:from-darkBlue hover:to-blue"
              onClick={() => {
                navigate("/products");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {cat}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More - Show Less button */}
      {categories.length > 4 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className=" text-md sm:text-lg px-6 py-2 bg-orange text-white rounded-xl font-semibold hover:bg-darkBlue transition"
          >
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </section>
  );
}

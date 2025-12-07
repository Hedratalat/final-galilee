import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AiFillHeart } from "react-icons/ai";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import Navbar from "../components/Navbar/Navbar";
import toast from "react-hot-toast";

export default function Favorites() {
  const [products, setProducts] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [user, setUser] = useState(null);

  // 1) Load all products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Products"), (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        image: doc.data().imageUrl,
        price: doc.data().discountPrice
          ? doc.data().discountPrice
          : doc.data().price,
        realPrice: doc.data().price,
        category: doc.data().category,
        details: doc.data().description,
      }));
      setProducts(data);
    });

    return () => unsub();
  }, []);

  // 2) Check authentication
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
  }, []);

  // 3) Fetch and Merge Favorites
  useEffect(() => {
    const localFav = JSON.parse(localStorage.getItem("favorites")) || [];

    if (!user) {
      const filtered = products.filter((p) => localFav.includes(p.id));
      setFavProducts(filtered);
      return;
    }

    const userFavRef = doc(db, "Users", user.uid);

    const unsubscribe = onSnapshot(userFavRef, async (snap) => {
      const firebaseFav = snap.exists() ? snap.data().favorites || [] : [];
      const merged = Array.from(new Set([...localFav, ...firebaseFav]));

      localStorage.setItem("favorites", JSON.stringify(merged));

      if (JSON.stringify(merged) !== JSON.stringify(firebaseFav)) {
        await updateDoc(userFavRef, { favorites: merged });
      }

      const filtered = products.filter((p) => merged.includes(p.id));
      setFavProducts(filtered);
    });

    return () => unsubscribe();
  }, [user, products]);

  // 4) Remove from favorites function
  const removeFavorite = async (id) => {
    // Update localStorage
    let localFav = JSON.parse(localStorage.getItem("favorites")) || [];
    localFav = localFav.filter((item) => item !== id);
    localStorage.setItem("favorites", JSON.stringify(localFav));

    // Update Firebase if user exists
    if (user) {
      const userFavRef = doc(db, "Users", user.uid);
      await updateDoc(userFavRef, { favorites: localFav });
    }

    // Update UI
    setFavProducts((prev) => prev.filter((p) => p.id !== id));

    toast(`Removed from favorites ❤️`, { icon: "💔" });
  };

  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Title */}
          <motion.h2
            className="font-extrabold text-2xl sm:text-4xl md:text-4xl text-darkBlue text-center leading-tight
            mb-10 md:mb-14 md:mt-7"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            Your Curated Favorite Products
          </motion.h2>

          {favProducts.length === 0 ? (
            <p className="text-center text-gray-500 text-xl">
              No favorites added yet.
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {favProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="group relative bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Remove Favorite Button */}
                    <button
                      onClick={() => removeFavorite(product.id)}
                      className="absolute top-4 right-4 bg-white/95 p-2 rounded-full shadow hover:scale-105 transition"
                    >
                      <AiFillHeart className="h-7 w-7 text-orange" />
                    </button>

                    <div className="absolute left-4 bottom-4 bg-blue text-white text-sm font-medium px-3 py-1 rounded-full shadow-md">
                      {product.category}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-darkBlue">
                      {product.name}
                    </h3>
                    <p className="text-darkBlue/70 mt-3 italic leading-relaxed">
                      {product.details}
                    </p>

                    <div className="flex items-center justify-between mt-6">
                      <div className="text-lg font-bold text-orange">
                        {product.realPrice !== product.price ? (
                          <>
                            <span className="line-through text-gray-400 mr-2">
                              {product.realPrice} EGP
                            </span>
                            {product.price} EGP
                          </>
                        ) : (
                          `${product.price} EGP`
                        )}
                      </div>
                      <button className="bg-gradient-to-r from-orange to-orange/90 text-white py-2 px-4 rounded-lg font-semibold hover:from-orange/95 hover:to-orange/80 transition shadow">
                        Add To Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AiOutlineHeart, AiFillHeart, AiOutlineClose } from "react-icons/ai";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar/Navbar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { FaShoppingCart } from "react-icons/fa";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 10000 });
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const localFav = JSON.parse(localStorage.getItem("favorites")) || [];
    return localFav.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });
  const [cart, setCart] = useState(() => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    return localCart.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Products"), (snap) => {
      const cats = [];
      const data = snap.docs.map((doc) => {
        const d = doc.data();
        if (d.category) cats.push(d.category);
        return {
          id: doc.id,
          name: d.name,
          image: d.imageUrl,
          price: d.discountPrice ? d.discountPrice : d.price,
          realPrice: d.price,
          category: d.category,
          details: d.description,
        };
      });
      setProducts(data);
      setCategories([...new Set(cats)]);
    });
    return () => unsubscribe();
  }, []);

  //check user login
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // merge Firebase & localStorage safe after login Fav
  useEffect(() => {
    if (!user) return;

    const userFavRef = doc(db, "Users", user.uid);

    const unsubscribe = onSnapshot(userFavRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const firebaseFav = docSnap.data().favorites || [];
      const localFav = JSON.parse(localStorage.getItem("favorites")) || [];

      // localStorage هو المصدر الأساسي بعد login
      const mergedFav = Array.from(
        new Set([
          ...localFav,
          ...firebaseFav.filter((id) => localFav.includes(id)),
        ])
      );

      // تحديث localStorage لو فيه فرق
      if (JSON.stringify(localFav) !== JSON.stringify(mergedFav)) {
        localStorage.setItem("favorites", JSON.stringify(mergedFav));
      }

      // تحديث state
      setFavorites(mergedFav.reduce((acc, id) => ({ ...acc, [id]: true }), {}));

      // تحديث Firebase
      updateDoc(userFavRef, { favorites: mergedFav }).catch((err) =>
        console.log("Error updating favorites:", err)
      );
    });

    return () => unsubscribe();
  }, [user]);

  // merge Firebase & localStorage safe after login cart
  useEffect(() => {
    if (!user) return;

    const userCartRef = doc(db, "Users", user.uid);

    const unsubscribe = onSnapshot(userCartRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const firebaseCart = docSnap.data().cart || [];
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];

      // استخدم localStorage هو المصدر الأساسي
      const mergedCart = Array.from(
        new Set([
          ...localCart,
          ...firebaseCart.filter((id) => localCart.includes(id)),
        ])
      );

      // تحديث localStorage لو فيه فرق
      if (JSON.stringify(localCart) !== JSON.stringify(mergedCart)) {
        localStorage.setItem("cart", JSON.stringify(mergedCart));
      }

      // تحديث state
      setCart(mergedCart.reduce((acc, id) => ({ ...acc, [id]: true }), {}));

      // تحديث Firebase
      updateDoc(userCartRef, { cart: mergedCart }).catch((err) =>
        console.log("Error updating cart:", err)
      );
    });

    return () => unsubscribe();
  }, [user]);

  // toggle favorite
  const toggleFavorite = (id, name) => {
    const updatedFavorites = { ...favorites, [id]: !favorites[id] };
    const favIds = Object.keys(updatedFavorites).filter(
      (key) => updatedFavorites[key]
    );

    // حفظ localStorage
    localStorage.setItem("favorites", JSON.stringify(favIds));

    // حفظ Firebase لو مسجّل دخول
    if (user) {
      const userFavRef = doc(db, "Users", user.uid);
      updateDoc(userFavRef, { favorites: favIds }).catch((err) =>
        console.log("Error updating favorites:", err)
      );
    }

    // toast مباشر للمستخدم
    if (updatedFavorites[id]) toast.success(`Added ${name} to favorites`);
    else
      toast(`Removed ${name} from favorites`, {
        icon: <AiOutlineClose color="red" size={20} />,
      });

    // تحديث state محلي فقط
    setFavorites(updatedFavorites);
  };

  // toggle cart
  const toggleCart = (id, name) => {
    const updatedCart = { ...cart, [id]: !cart[id] };
    const cartIds = Object.keys(updatedCart).filter((key) => updatedCart[key]);

    // LocalStorage
    localStorage.setItem("cart", JSON.stringify(cartIds));

    // Firebase
    if (user) {
      const userCartRef = doc(db, "Users", user.uid);
      updateDoc(userCartRef, { cart: cartIds }).catch((err) =>
        console.log("Error updating cart:", err)
      );
    }

    // Toast
    if (updatedCart[id]) toast.success(`Added ${name} to cart`);
    else
      toast(`Removed ${name} from cart`, {
        icon: <AiOutlineClose color="red" size={20} />,
      });

    setCart(updatedCart);
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "All" || product.category === categoryFilter;
    const matchPrice =
      product.price >= priceFilter.min && product.price <= priceFilter.max;
    return matchSearch && matchCategory && matchPrice;
  });
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, priceFilter]);

  const productsPerPage = 6;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const endIndex = currentPage * productsPerPage;
  const startIndex = endIndex - productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-9 sm:py-16 font-poppins">
        <div className="max-w-7xl mx-auto px-6">
          {/* Title */}
          <motion.h2
            className="font-extrabold text-2xl sm:text-4xl md:text-4xl text-darkBlue text-center leading-tight mb-10"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            All Products in One Place
          </motion.h2>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <input
              type="text"
              placeholder="Search products..."
              className="p-3 rounded-xl border border-gray-300 shadow focus:ring-2 focus:ring-blue outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="p-3 rounded-xl border border-gray-300 shadow focus:ring-2 focus:ring-blue outline-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              className="p-3 rounded-xl border border-gray-300 shadow focus:ring-2 focus:ring-blue outline-none"
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all") setPriceFilter({ min: 0, max: 10000 });
                else if (val.includes("-")) {
                  const [min, max] = val.split("-").map(Number);
                  setPriceFilter({ min, max });
                } else if (val === "500+")
                  setPriceFilter({ min: 500, max: 100000 });
              }}
            >
              <option value="all">All Prices</option>
              <option value="0-50">0 - 50 EGP</option>
              <option value="50-100">50 - 100 EGP</option>
              <option value="100-200">100 - 200 EGP</option>
              <option value="200-500">200 - 500 EGP</option>
              <option value="500+">500+ EGP</option>
            </select>
          </div>

          {/* Products Grid with Container Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {currentProducts.length === 0 ? (
              <motion.div
                className="col-span-full flex flex-col items-center justify-center py-20"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-gray-300 mb-6 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0l-8 8-8-8"
                  />
                </svg>

                <h3 className="text-2xl font-semibold text-gray-500 mb-2">
                  No Products Available
                </h3>
                <p className="text-gray-400 text-center max-w-xs">
                  Try changing the search or filters to see more products.
                </p>
              </motion.div>
            ) : (
              currentProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * (window.innerWidth >= 1024 ? 0.05 : 0.1),
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                  style={{ willChange: "transform, opacity" }}
                  className="group relative bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500"
                    />

                    <button
                      onClick={() => toggleFavorite(product.id, product.name)}
                      className="absolute top-4 right-4 bg-white/95 p-2 rounded-full shadow hover:scale-105 transition"
                    >
                      {favorites[product.id] ? (
                        <AiFillHeart className="h-6 w-6 text-orange" />
                      ) : (
                        <AiOutlineHeart className="h-6 w-6 text-gray-400" />
                      )}
                    </button>

                    <div className="absolute left-4 bottom-4 bg-blue text-white text-sm font-medium px-3 py-1 rounded-full shadow-md">
                      {product.category}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1 sm:h-64">
                    <div>
                      <h3 className="text-2xl font-semibold text-darkBlue">
                        {product.name}
                      </h3>
                      <p className="text-darkBlue/70 mt-3 italic leading-relaxed">
                        {product.details}
                      </p>
                    </div>

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
                      <button
                        onClick={() => toggleCart(product.id, product.name)}
                        className={`
                            flex items-center justify-center gap-1 py-2 px-4 rounded-lg font-semibold transition shadow
                            ${
                              cart[product.id]
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-gradient-to-r from-orange to-orange/90 text-white hover:from-orange/95 hover:to-orange/80"
                            }
                          `}
                      >
                        {cart[product.id] ? (
                          <>
                            Remove <FaShoppingCart size={20} color="white" />
                          </>
                        ) : (
                          "Add To Cart"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Pagination */}
          {currentProducts.length > 0 && (
            <div className="flex justify-center mt-10 gap-3 items-center">
              {/* Previous Button */}
              <button
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
                disabled={currentPage === 1 || totalPages === 0}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === 1 || totalPages === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-darkBlue hover:bg-darkBlue hover:text-white"
                }`}
              >
                Previous
              </button>

              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg border ${
                    page === currentPage
                      ? "bg-darkBlue text-white"
                      : "bg-white text-darkBlue hover:bg-darkBlue hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                disabled={currentPage >= totalPages || totalPages === 0}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage >= totalPages || totalPages === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-darkBlue hover:bg-darkBlue hover:text-white"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

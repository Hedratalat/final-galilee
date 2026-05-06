import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineHeart, AiFillHeart, AiOutlineClose } from "react-icons/ai";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar/Navbar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { FaShoppingCart } from "react-icons/fa";
import Footer from "../components/Footer/Footer";
import { Link } from "react-router-dom";

const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "0 - 50 EGP", value: "0-50" },
  { label: "50 - 100 EGP", value: "50-100" },
  { label: "100 - 200 EGP", value: "100-200" },
  { label: "200 - 500 EGP", value: "200-500" },
];

// ── Filters Content مخرجة بره Products عشان متتعملش re-mount مع كل render ──
function FiltersContent({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  categories,
  selectedPriceValue,
  applyPrice,
  isFiltered,
  resetFilters,
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="font-extrabold text-base text-darkBlue">Filters</span>
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="text-xs text-blue underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="h-px bg-gray-200 mb-5" />

      {/* Search */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Search
      </p>
      <input
        type="text"
        placeholder="Search products..."
        className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue outline-none mb-6 text-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="h-px bg-gray-200 mb-5" />

      {/* Category */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Category
      </p>
      <div className="flex flex-col gap-2 mb-6">
        <button
          onClick={() => setCategoryFilter("All")}
          className={`text-left text-sm px-4 py-3 rounded-xl border transition-all duration-200 ${
            categoryFilter === "All"
              ? "bg-darkBlue text-white border-darkBlue font-medium"
              : "text-darkBlue border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setCategoryFilter(cat)}
            className={`text-left text-sm px-4 py-3 rounded-xl border transition-all duration-200 ${
              categoryFilter === cat
                ? "bg-darkBlue text-white border-darkBlue font-medium"
                : "text-darkBlue border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="h-px bg-gray-200 mb-5" />

      {/* Price */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Price Range
      </p>
      <div className="flex flex-col gap-2">
        {priceRanges.map((item) => (
          <button
            key={item.value}
            onClick={() => applyPrice(item.value)}
            className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition-all duration-200 ${
              selectedPriceValue === item.value
                ? "bg-darkBlue text-white border-darkBlue font-medium"
                : "text-darkBlue border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 10000 });
  const [selectedPriceValue, setSelectedPriceValue] = useState("all");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const localFav = JSON.parse(localStorage.getItem("favorites")) || [];
    return localFav.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });
  const [cart, setCart] = useState(() => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    return localCart.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Products"), (snap) => {
      const cats = [];
      const data = snap.docs.map((doc) => {
        const d = doc.data();
        if (d.category) cats.push(d.category);
        return {
          id: doc.id,
          name: d.name,
          image: d.imageCard || d.imageUrl,
          price: d.discountPrice ? d.discountPrice : d.price,
          realPrice: d.price,
          category: d.category,
          details: d.description,
          order: d.order || null,
          outOfStock: d.outOfStock || false,
        };
      });
      setProducts(data);
      setCategories([...new Set(cats)]);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else setUser(null);
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
        ]),
      );
      if (JSON.stringify(localFav) !== JSON.stringify(mergedFav)) {
        localStorage.setItem("favorites", JSON.stringify(mergedFav));
      }
      setFavorites(mergedFav.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
      updateDoc(userFavRef, { favorites: mergedFav }).catch(() => {});
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
        ]),
      );
      if (JSON.stringify(localCart) !== JSON.stringify(mergedCart)) {
        localStorage.setItem("cart", JSON.stringify(mergedCart));
      }
      setCart(mergedCart.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
      updateDoc(userCartRef, { cart: mergedCart }).catch(() => {});
    });
    return () => unsubscribe();
  }, [user]);

  // toggle favorite
  const toggleFavorite = (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedFavorites = { ...favorites, [id]: !favorites[id] };
    const favIds = Object.keys(updatedFavorites).filter(
      (key) => updatedFavorites[key],
    );
    // حفظ localStorage
    localStorage.setItem("favorites", JSON.stringify(favIds));
    window.dispatchEvent(new Event("favoritesUpdated"));
    // حفظ Firebase لو مسجّل دخول
    if (user) {
      const userFavRef = doc(db, "Users", user.uid);
      updateDoc(userFavRef, { favorites: favIds }).catch(() => {});
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
  const toggleCart = (e, id, name, isOutOfStock) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    const updatedCart = { ...cart, [id]: !cart[id] };
    const cartIds = Object.keys(updatedCart).filter((key) => updatedCart[key]);
    localStorage.setItem("cart", JSON.stringify(cartIds));
    window.dispatchEvent(new Event("cartUpdated"));
    if (user) {
      const userCartRef = doc(db, "Users", user.uid);
      updateDoc(userCartRef, { cart: cartIds }).catch(() => {});
    }
    if (updatedCart[id]) toast.success(`Added ${name} to cart`);
    else
      toast(`Removed ${name} from cart`, {
        icon: <AiOutlineClose color="red" size={20} />,
      });
    setCart(updatedCart);
  };

  const applyPrice = (val) => {
    setSelectedPriceValue(val);
    if (val === "all") setPriceFilter({ min: 0, max: 10000 });
    else if (val === "500+") setPriceFilter({ min: 500, max: 100000 });
    else {
      const [min, max] = val.split("-").map(Number);
      setPriceFilter({ min, max });
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setSelectedPriceValue("all");
    setPriceFilter({ min: 0, max: 10000 });
  };

  const isFiltered =
    search !== "" || categoryFilter !== "All" || selectedPriceValue !== "all";

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

  const sortedProducts = filteredProducts.sort((a, b) => {
    // المنتجات اللي عندها order تظهر الأول
    if (a.order !== null && b.order === null) return -1;
    if (a.order === null && b.order !== null) return 1;
    if (a.order !== null && b.order !== null) return a.order - b.order;
    return 0;
  });

  const productsPerPage = 6;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const endIndex = currentPage * productsPerPage;
  const startIndex = endIndex - productsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  const filtersProps = {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    categories,
    selectedPriceValue,
    applyPrice,
    isFiltered,
    resetFilters,
  };

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

          {/* Mobile filter button */}
          <div className="flex justify-end mb-4 xl:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-300 text-darkBlue text-sm font-medium px-4 py-2.5 rounded-xl shadow"
            >
              <svg
                viewBox="0 0 20 20"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M3 5h14M6 10h8M9 15h2" strokeLinecap="round" />
              </svg>
              Filters
              {isFiltered && <span className="w-2 h-2 rounded-full bg-blue" />}
            </button>
          </div>

          {/* Layout */}
          <div className="flex gap-8 items-start">
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden xl:block w-60 shrink-0 bg-white rounded-2xl border border-gray-200 p-6 sticky top-6 shadow -ml-16">
              <FiltersContent {...filtersProps} />
            </aside>

            {/* ── Products + Pagination ── */}
            <div className="flex-1 min-w-0">
              {/* Products Grid with Container Animation */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="grid gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
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
                    <button
                      onClick={resetFilters}
                      className="mt-4 px-6 py-2.5 bg-darkBlue text-white rounded-xl text-sm font-medium"
                    >
                      Reset Filters
                    </button>
                  </motion.div>
                ) : (
                  currentProducts.map((product, index) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="block cursor-pointer"
                    >
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                          delay:
                            index * (window.innerWidth >= 1024 ? 0.05 : 0.1),
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        viewport={{ once: true }}
                        style={{ willChange: "transform, opacity" }}
                        className="group relative bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 mb-4"
                      >
                        <div className="relative overflow-hidden rounded-t-3xl">
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500 ${
                              product.outOfStock ? "opacity-60 grayscale" : ""
                            }`}
                          />

                          {/* Out of Stock Badge */}
                          {product.outOfStock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                              <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg transform rotate-[-15deg]">
                                OUT OF STOCK
                              </div>
                            </div>
                          )}

                          <div
                            className="
    absolute inset-0
    opacity-0 group-hover:opacity-100
    flex items-center justify-center
    transition-opacity duration-300    z-0
  "
                          >
                            <span
                              className="
      bg-white text-darkBlue
      px-6 py-3 rounded-full
       shadow text-sm
    "
                            >
                              View Details
                            </span>
                          </div>

                          <button
                            onClick={(e) =>
                              toggleFavorite(e, product.id, product.name)
                            }
                            className="absolute top-4 right-4 bg-white/95 p-2 rounded-full shadow hover:scale-105 transition z-50"
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

                        <div className="p-6 flex flex-col justify-between flex-1 sm:h-80">
                          <div>
                            <h3 className="text-2xl font-semibold text-darkBlue">
                              {product.name}
                            </h3>
                            <p className="text-darkBlue/70 mt-3 italic leading-relaxed">
                              {product.details}
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 mt-6">
                            <div className="text-lg font-bold text-orange">
                              {product.outOfStock ? (
                                <span className="text-red-600">
                                  Not Available
                                </span>
                              ) : product.realPrice !== product.price ? (
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
                              onClick={(e) =>
                                toggleCart(
                                  e,
                                  product.id,
                                  product.name,
                                  product.outOfStock,
                                )
                              }
                              disabled={product.outOfStock}
                              className={`
    flex items-center justify-center gap-1 py-2 px-4 rounded-lg font-semibold transition shadow
    ${
      product.outOfStock
        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
        : cart[product.id]
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-gradient-to-r from-orange to-orange/90 text-white hover:from-orange/95 hover:to-orange/80"
    }
  `}
                            >
                              {product.outOfStock ? (
                                "Out of Stock"
                              ) : cart[product.id] ? (
                                <>
                                  Remove{" "}
                                  <FaShoppingCart size={20} color="white" />
                                </>
                              ) : (
                                "Add To Cart"
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))
                )}
              </motion.div>

              {/* Pagination */}
              {currentProducts.length > 0 && (
                <div className="flex justify-center mt-8  gap-3 items-center">
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
                      currentPage < totalPages &&
                      setCurrentPage(currentPage + 1)
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
          </div>
        </div>
      </section>

      {/* ── Mobile Bottom Sheet Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay - الضغط عليه يقفل الـ drawer */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 xl:hidden"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-white rounded-t-[24px] p-6 max-h-[80vh] overflow-y-auto"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-4 right-4
           w-5 h-5 flex items-center justify-center
          
           text-darkBlue rounded-full  transition"
              >
                ✕
              </button>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <FiltersContent {...filtersProps} />
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full bg-darkBlue text-white text-sm font-semibold py-3.5 rounded-xl cursor-pointer mt-4"
              >
                Show {currentProducts.length} Result
                {currentProducts.length !== 1 ? "s" : ""}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

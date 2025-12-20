import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AiFillHeart, AiOutlineClose } from "react-icons/ai";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import Navbar from "../components/Navbar/Navbar";
import toast from "react-hot-toast";
import { FaShoppingCart } from "react-icons/fa";
import Footer from "../components/Footer/Footer";

export default function Favorites() {
  const [products, setProducts] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState(() => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    return localCart.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });

  // Fetch products
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

  // Check authentication
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
  }, []);

  // Fetch and Merge Favorites
  useEffect(() => {
    if (!user) {
      // لو مش مسجل دخول، اعتمد فقط على localStorage
      const localFav = JSON.parse(localStorage.getItem("favorites")) || [];
      const filtered = products.filter((p) => localFav.includes(p.id));
      setFavProducts(filtered);
      return; // مهم جداً نرجع هنا وما نعملش merge مع Firebase
    }

    // لو مسجل دخول
    const userFavRef = doc(db, "Users", user.uid);

    const unsubscribe = onSnapshot(userFavRef, async (snap) => {
      const firebaseFav = snap.exists() ? snap.data().favorites || [] : [];
      const localFav = JSON.parse(localStorage.getItem("favorites")) || [];

      // localStorage هو المصدر الرئيسي
      const merged = Array.from(new Set(localFav));

      localStorage.setItem("favorites", JSON.stringify(merged));

      if (JSON.stringify(merged) !== JSON.stringify(firebaseFav)) {
        await updateDoc(userFavRef, { favorites: merged });
      }

      const filtered = products.filter((p) => merged.includes(p.id));
      setFavProducts(filtered);
    });

    return () => unsubscribe();
  }, [user, products]);

  //  Remove from favorites function
  const removeFavorite = async (id) => {
    // Update localStorage
    let localFav = JSON.parse(localStorage.getItem("favorites")) || [];
    localFav = localFav.filter((item) => item !== id);
    localStorage.setItem("favorites", JSON.stringify(localFav));
    window.dispatchEvent(new Event("favoritesUpdated"));

    // Update Firebase if user exists
    if (user) {
      const userFavRef = doc(db, "Users", user.uid);
      await updateDoc(userFavRef, { favorites: localFav });
    }

    // Update UI
    setFavProducts((prev) => prev.filter((p) => p.id !== id));

    toast(`Removed from favorites`, {
      icon: <AiOutlineClose color="red" size={20} />,
    });
  };
  // toggle cart
  const toggleCart = (id, name) => {
    const updatedCart = { ...cart, [id]: !cart[id] };
    const cartIds = Object.keys(updatedCart).filter((key) => updatedCart[key]);

    // تحديث localStorage
    localStorage.setItem("cart", JSON.stringify(cartIds));
    window.dispatchEvent(new Event("cartUpdated"));

    // تحديث Firebase لو المستخدم مسجل دخول
    if (user) {
      const userCartRef = doc(db, "Users", user.uid);
      updateDoc(userCartRef, { cart: cartIds }).catch(console.log);
    }

    // toast
    if (updatedCart[id]) toast.success(`Added ${name} to cart`);
    else
      toast(`Removed ${name} from cart`, {
        icon: <AiOutlineClose color="red" size={20} />,
      });

    // تحديث state
    setCart(updatedCart);
  };

  //Pagination
  const productsPerPage = 6;
  const totalPages = Math.ceil(favProducts.length / productsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const endIndex = currentPage * productsPerPage;
  const startIndex = endIndex - productsPerPage;

  const currentProducts = favProducts.slice(startIndex, endIndex);

  useEffect(() => {
    const totalPages = Math.ceil(favProducts.length / productsPerPage) || 1;

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [favProducts]);

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

          {currentProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-cente mt-24">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-gray-300 mb-6 animate-bounce"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
       2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
       C13.09 3.81 14.76 3 16.5 3
       19.58 3 22 5.42 22 8.5
       c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>

              <h3 className="text-2xl font-semibold text-gray-500 mb-2">
                No Favorites Yet
              </h3>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {currentProducts.map((product, index) => (
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

                  <div className="p-6 flex flex-col justify-between flex-1 sm:h-64">
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
              ))}
            </motion.div>
          )}
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
      <Footer />
    </>
  );
}

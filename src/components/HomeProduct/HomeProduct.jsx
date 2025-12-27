import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { AiOutlineHeart, AiFillHeart, AiOutlineClose } from "react-icons/ai";
import { FaShoppingCart } from "react-icons/fa";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function HomeProduct() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    const localFav = JSON.parse(localStorage.getItem("favorites")) || [];
    return localFav.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });

  const [cart, setCart] = useState(() => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    return localCart.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Products"), (snap) => {
      const data = snap.docs.slice(0, 6).map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          image: d.imageUrl,
          price: d.discountPrice || d.price,
          realPrice: d.price,
          category: d.category,
          details: d.description,
        };
      });
      setProducts(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userFavRef = doc(db, "Users", user.uid);

    const unsub = onSnapshot(userFavRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const firebaseFav = docSnap.data().favorites || [];
      const localFav = JSON.parse(localStorage.getItem("favorites")) || [];

      const mergedFav = Array.from(
        new Set([
          ...localFav,
          ...firebaseFav.filter((id) => localFav.includes(id)),
        ])
      );

      localStorage.setItem("favorites", JSON.stringify(mergedFav));
      setFavorites(mergedFav.reduce((acc, id) => ({ ...acc, [id]: true }), {}));

      updateDoc(userFavRef, { favorites: mergedFav });
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const userCartRef = doc(db, "Users", user.uid);

    const unsub = onSnapshot(userCartRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const firebaseCart = docSnap.data().cart || [];
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];

      const mergedCart = Array.from(
        new Set([
          ...localCart,
          ...firebaseCart.filter((id) => localCart.includes(id)),
        ])
      );

      localStorage.setItem("cart", JSON.stringify(mergedCart));
      setCart(mergedCart.reduce((acc, id) => ({ ...acc, [id]: true }), {}));

      updateDoc(userCartRef, { cart: mergedCart });
    });

    return () => unsub();
  }, [user]);

  const toggleFavorite = (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = { ...favorites, [id]: !favorites[id] };
    const favIds = Object.keys(updated).filter((k) => updated[k]);

    localStorage.setItem("favorites", JSON.stringify(favIds));
    window.dispatchEvent(new Event("favoritesUpdated"));

    if (user) {
      updateDoc(doc(db, "Users", user.uid), { favorites: favIds });
    }

    updated[id]
      ? toast.success(`Added ${name} to favorites`)
      : toast(`Removed ${name} from favorites`, {
          icon: <AiOutlineClose color="red" />,
        });

    setFavorites(updated);
  };

  const toggleCart = (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = { ...cart, [id]: !cart[id] };
    const cartIds = Object.keys(updated).filter((k) => updated[k]);

    localStorage.setItem("cart", JSON.stringify(cartIds));
    window.dispatchEvent(new Event("cartUpdated"));

    if (user) {
      updateDoc(doc(db, "Users", user.uid), { cart: cartIds });
    }

    updated[id]
      ? toast.success(`Added ${name} to cart`)
      : toast(`Removed ${name} from cart`, {
          icon: <AiOutlineClose color="red" />,
        });

    setCart(updated);
  };

  return (
    <section className=" min-h-screen py-9 sm:py-10 font-poppins">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-4xl md:text-4xl  font-poppins font-bold text-darkBlue text-center mb-2"
        >
          Discover Our Latest Collection
        </motion.h2>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-center mb-10 max-w-2xl mx-auto text-base sm:text-md text-gray-700 font-poppins font-medium"
        >
          Fresh arrivals crafted to match your style and quality standards.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.length === 0 ? (
            <motion.div className="col-span-full flex flex-col items-center justify-center py-20">
              <h3 className="text-2xl font-semibold text-gray-500 mb-2">
                No Products Available
              </h3>
              <p className="text-gray-400 text-center max-w-xs">
                Try changing the search or filters to see more products.
              </p>
            </motion.div>
          ) : (
            products.map((product, index) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="block"
              >
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
                        onClick={(e) => toggleCart(e, product.id, product.name)}
                        className={`flex items-center justify-center gap-1 py-2 px-4 rounded-lg font-semibold transition shadow ${
                          cart[product.id]
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-gradient-to-r from-orange to-orange/90 text-white hover:from-orange/95 hover:to-orange/80"
                        }`}
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
              </Link>
            ))
          )}
        </motion.div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              navigate("/products");
              window.scroll({ top: 0, behavior: "smooth" });
            }}
            className=" text-md sm:text-lg px-6 py-2 bg-orange text-white rounded-xl font-semibold hover:bg-darkBlue transition"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}

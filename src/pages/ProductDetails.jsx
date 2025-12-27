import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineClose,
  AiOutlineLeft,
} from "react-icons/ai";
import { FaShoppingCart, FaPlay } from "react-icons/fa";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function ProductDetails() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Selected image for gallery
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  // Favorites & Cart
  const [favorites, setFavorites] = useState(() => {
    const localFav = JSON.parse(localStorage.getItem("favorites")) || [];
    return localFav.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });

  const [cart, setCart] = useState(() => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    return localCart.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });

  // Get user auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch product from Firebase
  useEffect(() => {
    if (!id) return;

    const productRef = doc(db, "Products", id);
    const unsubscribe = onSnapshot(
      productRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Product not found");
          navigate("/products");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching product:", error);
        toast.error("Error loading product");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, navigate]);

  // Merge favorites with Firebase after login
  useEffect(() => {
    if (!user) return;

    const userFavRef = doc(db, "Users", user.uid);
    const unsubscribe = onSnapshot(userFavRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const firebaseFav = docSnap.data().favorites || [];
      const localFav = JSON.parse(localStorage.getItem("favorites")) || [];

      const mergedFav = Array.from(new Set([...localFav, ...firebaseFav]));

      if (JSON.stringify(localFav) !== JSON.stringify(mergedFav)) {
        localStorage.setItem("favorites", JSON.stringify(mergedFav));
      }

      setFavorites(mergedFav.reduce((acc, id) => ({ ...acc, [id]: true }), {}));

      updateDoc(userFavRef, { favorites: mergedFav }).catch((err) =>
        console.log("Error updating favorites:", err)
      );
    });

    return () => unsubscribe();
  }, [user]);

  // Merge cart with Firebase after login
  useEffect(() => {
    if (!user) return;

    const userCartRef = doc(db, "Users", user.uid);
    const unsubscribe = onSnapshot(userCartRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const firebaseCart = docSnap.data().cart || [];
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];

      const mergedCart = Array.from(new Set([...localCart, ...firebaseCart]));

      if (JSON.stringify(localCart) !== JSON.stringify(mergedCart)) {
        localStorage.setItem("cart", JSON.stringify(mergedCart));
      }

      setCart(mergedCart.reduce((acc, id) => ({ ...acc, [id]: true }), {}));

      updateDoc(userCartRef, { cart: mergedCart }).catch((err) =>
        console.log("Error updating cart:", err)
      );
    });

    return () => unsubscribe();
  }, [user]);

  // Toggle favorite
  const toggleFavorite = () => {
    if (!product) return;

    const updatedFavorites = {
      ...favorites,
      [product.id]: !favorites[product.id],
    };
    const favIds = Object.keys(updatedFavorites).filter(
      (key) => updatedFavorites[key]
    );

    localStorage.setItem("favorites", JSON.stringify(favIds));
    window.dispatchEvent(new Event("favoritesUpdated"));

    if (user) {
      const userFavRef = doc(db, "Users", user.uid);
      updateDoc(userFavRef, { favorites: favIds }).catch((err) =>
        console.log("Error updating favorites:", err)
      );
    }

    if (updatedFavorites[product.id]) {
      toast.success(`Added ${product.name} to favorites`);
    } else {
      toast(`Removed ${product.name} from favorites`, {
        icon: <AiOutlineClose color="red" size={20} />,
      });
    }

    setFavorites(updatedFavorites);
  };

  // Toggle cart
  const toggleCart = () => {
    if (!product) return;

    const updatedCart = { ...cart, [product.id]: !cart[product.id] };
    const cartIds = Object.keys(updatedCart).filter((key) => updatedCart[key]);

    localStorage.setItem("cart", JSON.stringify(cartIds));
    window.dispatchEvent(new Event("cartUpdated"));

    if (user) {
      const userCartRef = doc(db, "Users", user.uid);
      updateDoc(userCartRef, { cart: cartIds }).catch((err) =>
        console.log("Error updating cart:", err)
      );
    }

    if (updatedCart[product.id]) {
      toast.success(`Added ${product.name} to cart`);
    } else {
      toast(`Removed ${product.name} from cart`, {
        icon: <AiOutlineClose color="red" size={20} />,
      });
    }

    setCart(updatedCart);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return null;
  }

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const allImages = product.images || [];
  const mainImage = product.imageCard || product.imageUrl || allImages[0];

  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-12 font-poppins">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <motion.button
            onClick={() => navigate("/products")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-darkBlue hover:text-orange transition mb-8"
          >
            <AiOutlineLeft size={20} />
            <span className="font-medium">Back to Products</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Images & Video */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Main Display */}
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg">
                {showVideo && product.videoUrl ? (
                  <video
                    src={product.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-[500px] object-cover"
                  />
                ) : (
                  <img
                    src={allImages[selectedImage] || mainImage}
                    alt={product.name}
                    className="w-full h-[500px] object-cover"
                  />
                )}

                {/* Video Play Button */}
                {product.videoUrl && !showVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-orange/90 hover:bg-orange text-white rounded-full p-6 shadow-xl transition"
                  >
                    <FaPlay size={32} />
                  </button>
                )}

                {/* Favorite Button */}
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 bg-white/95 p-3 rounded-full shadow-lg hover:scale-105 transition"
                >
                  {favorites[product.id] ? (
                    <AiFillHeart className="h-7 w-7 text-orange" />
                  ) : (
                    <AiOutlineHeart className="h-7 w-7 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Thumbnails */}
              {allImages.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setSelectedImage(idx);
                        setShowVideo(false);
                      }}
                      className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition ${
                        selectedImage === idx && !showVideo
                          ? "border-orange shadow-lg"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}

                  {/* Video Thumbnail */}
                  {product.videoUrl && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowVideo(true)}
                      className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition relative ${
                        showVideo
                          ? "border-orange shadow-lg"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={mainImage}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <FaPlay className="text-white" size={20} />
                      </div>
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Right Side - Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Category Badge */}
              {product.category && (
                <span className="inline-block bg-blue text-white px-4 py-2 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              )}

              {/* Product Name */}
              <h1 className="text-4xl font-bold text-darkBlue leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                {hasDiscount && (
                  <span className="text-2xl text-gray-400 line-through">
                    {product.price} EGP
                  </span>
                )}
                <span className="text-4xl font-bold text-orange">
                  {displayPrice} EGP
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h3 className="text-xl font-semibold text-darkBlue mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Detailed Description */}
              {product.descriptionDetails && (
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h3 className="text-xl font-semibold text-darkBlue mb-3">
                    Product Details
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.descriptionDetails}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={toggleCart}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition shadow-lg ${
                    cart[product.id]
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gradient-to-r from-orange to-orange/90 text-white hover:from-orange/95 hover:to-orange/80"
                  }`}
                >
                  <FaShoppingCart size={24} />
                  {cart[product.id] ? "Remove from Cart" : "Add to Cart"}
                </button>

                <button
                  onClick={toggleFavorite}
                  className="px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:border-orange hover:bg-orange/5 transition"
                >
                  {favorites[product.id] ? (
                    <AiFillHeart className="h-7 w-7 text-orange" />
                  ) : (
                    <AiOutlineHeart className="h-7 w-7 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <div className="bg-blue/10 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-blue text-2xl">✓</span>
                  <span className="text-gray-700">High Quality Product</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue text-2xl">✓</span>
                  <span className="text-gray-700">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue text-2xl">✓</span>
                  <span className="text-gray-700">Secure Payment</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

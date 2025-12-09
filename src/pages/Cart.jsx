import { motion } from "framer-motion";

import Navbar from "../components/Navbar/Navbar";
import { FaShoppingCart } from "react-icons/fa";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { AiOutlineClose, AiOutlineDelete } from "react-icons/ai";

export default function Cart() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    return localCart.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  });
  const [user, setUser] = useState(null);

  // Fetch products
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Products"), (snap) => {
      const data = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          image: d.imageUrl,
          price: d.discountPrice ? d.discountPrice : d.price,
          realPrice: d.price,
          category: d.category,
          description: d.description,
        };
      });
      setProducts(data);
    });
    return () => unsubscribe();
  }, []);

  // Check authentication
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else setUser(null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch and Merge cart
  useEffect(() => {
    if (!user) return;

    const userCartRef = doc(db, "Users", user.uid);
    const unsubscribe = onSnapshot(userCartRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const firebaseCart = docSnap.data().cart || [];
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];

      const mergedCart = Array.from(
        new Set([
          ...localCart,
          ...firebaseCart.filter((id) => localCart.includes(id)),
        ])
      );

      if (JSON.stringify(localCart) !== JSON.stringify(mergedCart)) {
        localStorage.setItem("cart", JSON.stringify(mergedCart));
      }

      setCart(mergedCart.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
      updateDoc(userCartRef, { cart: mergedCart }).catch(console.log);
    });

    return () => unsubscribe();
  }, [user]);

  //  Remove from cart function
  const removeFromCart = (id, name) => {
    const updatedCart = { ...cart };
    delete updatedCart[id];
    const cartIds = Object.keys(updatedCart);

    localStorage.setItem("cart", JSON.stringify(cartIds));

    if (user) {
      const userCartRef = doc(db, "Users", user.uid);
      updateDoc(userCartRef, { cart: cartIds }).catch(console.log);
    }

    toast.error(`Removed ${name} from cart`, {
      icon: <AiOutlineClose color="red" size={20} />,
    });

    setCart(updatedCart);
  };

  const cartItems = products.filter((p) => cart[p.id]);
  const total = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0),
    0
  );

  return (
    <>
      <Navbar />
      <section className="min-h-screen py-10 font-poppins">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            className="font-extrabold text-2xl sm:text-4xl md:text-4xl text-darkBlue text-center leading-tight
            mb-10 md:mb-14 md:mt-7"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            Your Cart Items
          </motion.h2>

          {/* Empty State */}
          {cartItems.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center mt-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Animated Icon */}
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-gray-300 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                initial={{ y: 0 }}
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h15l-1.5 9H6L4 2H2"
                />
                <circle cx="9" cy="21" r="1" />
                <circle cx="18" cy="21" r="1" />
              </motion.svg>

              <h3 className="text-2xl font-semibold text-gray-500 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-400">Add some products to get started</p>
            </motion.div>
          )}

          {/* product */}
          {cartItems.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* left side product list */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 p-5">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full sm:w-40 h-64 sm:h-40 object-cover rounded-xl"
                        />
                      </div>
                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-darkBlue mb-2">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description}
                          </p>
                          <span className="inline-block bg-blue/10 text-blue text-sm font-medium px-3 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* price */}
                          <div className="text-lg font-bold text-orange">
                            {item.realPrice !== item.price ? (
                              <>
                                <span className="line-through text-gray-400 text-sm mr-2">
                                  {item.realPrice} EGP
                                </span>
                                <span>{item.price} EGP</span>
                              </>
                            ) : (
                              <span>{item.price} EGP</span>
                            )}
                          </div>

                          {/* Remove item */}
                          <button
                            onClick={() => removeFromCart(item.id, item.name)}
                            className="flex items-center gap-2 text-red-500 hover:text-white
                           hover:bg-red-500  text-sm font-medium px-4 py-2 border border-red-500 rounded-lg transition-all duration-300"
                          >
                            <AiOutlineDelete size={18} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* right side order*/}
              <div className="lg:col-span-1">
                {" "}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-2xl shadow-lg p-6 sticky top:24"
                >
                  <h3 className="text-2xl font-bold text-darkBlue mb-6">
                    Order Summary
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>items ({cartItems.length})</span>
                      <span>{total.toFixed(2)} EGP</span>
                    </div>
                    {/* <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div> */}
                    <div className=" border-t border-gray-200 pt-4 flex justify-between items-baseline">
                      <span className="text-lg font-semibold text-darkBlue">
                        Total
                      </span>
                      <span className="text-3xl font-extrabold text-orange">
                        {total.toFixed(2)} EGP
                      </span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-gradient-to-r from-orange to-orange/90 hover:from-orange/95 hover:to-orange/80 text-white
                  font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Proceed to Checkout
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Tax and shipping calculated at checkout
                  </p>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

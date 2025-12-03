import {
  FaHeart,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import imgLogo from "../../assets/logo-02.png";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const toggleUserMenu = () => setIsUserOpen(!isUserOpen);

  const handleLogout = async () => {
    await signOut(auth);
    setIsUserOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  return (
    <nav className="bg-white/70 shadow sticky top-0 w-full z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={imgLogo}
              alt="Logo"
              className="h-20 w-auto transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Navigation Links - Desktop */}
          <ul className="hidden md:flex space-x-6 font-poppins  font-bold text-gray-700 text-xl">
            {[
              { name: "Home", to: "/" },
              { name: "About", to: "/about" },
              { name: "Products", to: "/products" },
              { name: "Contact", to: "/contact" },
            ].map((item) => (
              <li key={item.name}>
                <Link
                  to={item.to}
                  onClick={() => window.scroll({ top: 0, behavior: "smooth" })}
                  className="hover:text-darkBlue hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Icons - Desktop */}
          <div className="hidden md:flex items-center space-x-4 text-gray-700 text-xl">
            <FaHeart
              className="hover:text-red-500 hover:scale-110 transition-transform duration-300 cursor-pointer"
              size={24}
            />
            <FaShoppingCart
              className="hover:text-darkBlue hover:scale-110 transition-transform duration-300 cursor-pointer"
              size={24}
            />
            {/*  user icon */}
            <div className="relative group">
              <div
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-700  
               flex items-center justify-center text-white font-bold cursor-pointer text-lg"
              >
                {user ? (
                  user.displayName.charAt(0).toUpperCase()
                ) : (
                  <FaUser size={17} />
                )}
              </div>

              {/* Dropdown */}
              <div
                className={`
                absolute right-0 mt-2 w-40 sm:w-44 bg-white rounded-xl shadow-lg py-2 z-50
                opacity-0 scale-95 pointer-events-none
                transition-all duration-200
                ${isUserOpen ? "opacity-100 scale-100 pointer-events-auto" : ""}
                group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto text-lg
              `}
              >
                {!user && (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-darkBlue hover:bg-gray-100 hover:text-orange transition-colors"
                      onClick={() => setIsUserOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-4 py-2 text-darkBlue hover:bg-gray-100 hover:text-orange transition-colors"
                      onClick={() => setIsUserOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}

                {user && (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-darkBlue hover:bg-gray-100 hover:text-orange transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3 text-gray-700">
            {/* Icons in Mobile */}
            <FaHeart
              className="hover:text-red-500 transition-transform duration-300 cursor-pointer"
              size={22}
            />
            <FaShoppingCart
              className="hover:text-darkBlue transition-transform duration-300 cursor-pointer"
              size={22}
            />
            <div className="relative group">
              <div
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gray-700  
               flex items-center justify-center text-white font-bold cursor-pointer text-lg"
              >
                {user ? (
                  user.displayName.charAt(0).toUpperCase()
                ) : (
                  <FaUser size={16} />
                )}
              </div>

              {/* Dropdown */}
              <div
                className={`
                absolute right-0 mt-2 w-40 sm:w-44 bg-white rounded-xl shadow-lg py-2 z-50
                opacity-0 scale-95 pointer-events-none
                transition-all duration-200
                ${isUserOpen ? "opacity-100 scale-100 pointer-events-auto" : ""}
                group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto text-lg
              `}
              >
                {!user && (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-darkBlue hover:bg-gray-100 hover:text-orange transition-colors"
                      onClick={() => setIsUserOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-4 py-2 text-darkBlue hover:bg-gray-100 hover:text-orange transition-colors"
                      onClick={() => setIsUserOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}

                {user && (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-darkBlue hover:bg-gray-100 hover:text-orange transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
            {/* Burger Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md text-gray-700 transition-colors"
            >
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Links */}
        {menuOpen && (
          <ul className="md:hidden flex flex-col items-center space-y-4 py-4 font-poppins font-bold text-gray-700 text-xl">
            {[
              { name: "Home", to: "/" },
              { name: "About", to: "/about" },
              { name: "Products", to: "/products" },
              { name: "Contact", to: "/contact" },
            ].map((item) => (
              <li key={item.name}>
                <Link
                  to={item.to}
                  onClick={() => {
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-darkBlue transition-colors cursor-pointer"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}

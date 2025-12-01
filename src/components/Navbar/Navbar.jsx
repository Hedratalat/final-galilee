import {
  FaHeart,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import imgLogo from "../../assets/logo-02.png";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <FaUser
              className="hover:text-darkBlue hover:scale-110 transition-transform duration-300 cursor-pointer"
              size={24}
            />
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
            <FaUser
              className="hover:text-darkBlue transition-transform duration-300 cursor-pointer"
              size={22}
            />
            {/* Burger Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md text-darkBlue transition-colors"
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

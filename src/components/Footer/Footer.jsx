import {
  Facebook,
  Instagram,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const handleFooterNav = (e, path) => {
    e.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    navigate(path);
  };

  return (
    <footer className="bg-darkBlue text-white mt-9">
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left font-poppins">
        {/* Brand */}
        <div className="md:col-span-1">
          <h3 className="text-2xl font-semibold mb-2">Galilee</h3>
          <p className="text-gray-300 text-base leading-relaxed mb-3">
            Spend your time in prayer with focus and calm, and enjoy a peaceful
            spiritual experience. Let us help you make every moment valuable and
            special.
          </p>

          <div className="hidden lg:block">
            <p className="font-medium text-white text-lg mb-2">Follow Us</p>
            <div className="flex justify-start space-x-3">
              <a
                href="https://www.facebook.com/people/Galilee/61580398533750/"
                target="_blank"
                rel="noreferrer"
              >
                <Facebook className="w-5 h-5 text-gray-300 hover:text-orange transition" />
              </a>
              <a
                href="https://www.instagram.com/galilee.eg"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="w-5 h-5 text-gray-300 hover:text-orange transition" />
              </a>
              <a
                href="https://www.tiktok.com/@galilee.eg"
                target="_blank"
                rel="noreferrer"
              >
                <FaTiktok className="w-5 h-5 text-gray-300 hover:text-orange transition" />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=201027539203&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="w-5 h-5 text-gray-300 hover:text-orange transition" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
          <ul className="flex flex-col gap-3 md:pt-2 text-gray-300 text-base md:text-lg font-medium">
            <li>
              <Link
                onClick={(e) => handleFooterNav(e, "/")}
                to="/"
                className="hover:text-orange transition"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                onClick={(e) => handleFooterNav(e, "/about")}
                to="/about"
                className="hover:text-orange transition"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                onClick={(e) => handleFooterNav(e, "/products")}
                to="/products"
                className="hover:text-orange transition"
              >
                Products
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-orange transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Customer Care</h3>
          <ul className="space-y-1 text-gray-300 text-base">
            <li>Order Support</li>
            <li>Payment Assistance</li>
            <li>Shipping Inquiries</li>
            <li>Contact Support</li>
            <li>Order Tracking</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
          <div className="space-y-2 text-gray-300 text-base">
            <p className="flex justify-center md:justify-start items-center gap-2">
              <MapPin className="w-4 h-4 text-orange" /> Cairo, Egypt
            </p>
            <p className="flex justify-center md:justify-start items-center gap-2">
              <Phone className="w-4 h-4 text-orange" /> 01027539203
            </p>
            <p className="flex flex-wrap justify-center md:justify-start items-center gap-2 break-all">
              <Mail className="w-4 h-4 text-orange shrink-0" />
              galilee.contact@gmail.com
            </p>

            <p className="flex justify-center md:justify-start items-center gap-2">
              <Clock className="w-4 h-4 text-orange" /> Open 24/7
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Social */}
      <div className="block lg:hidden text-center mt-4">
        <p className="font-medium text-white text-lg mb-2">Follow Us</p>
        <div className="flex justify-center space-x-3">
          <a
            href="https://www.facebook.com/people/Galilee/61580398533750/"
            target="_blank"
            rel="noreferrer"
          >
            <Facebook className="w-5 h-5 text-gray-300 hover:text-orange transition" />
          </a>
          <a
            href="https://www.instagram.com/galilee.eg"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram className="w-5 h-5 text-gray-300 hover:text-orange transition" />
          </a>
          <a
            href="https://www.tiktok.com/@galilee.eg"
            target="_blank"
            rel="noreferrer"
          >
            <FaTiktok className="w-5 h-5 text-gray-300 hover:text-orange transition" />
          </a>
          <a
            href="https://api.whatsapp.com/send/?phone=201027539203&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="w-5 h-5 text-gray-300 hover:text-orange transition" />
          </a>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-600 text-center py-3 mt-4">
        <p className="text-gray-300 text-sm md:text-base">
          © 2025 Galilee. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

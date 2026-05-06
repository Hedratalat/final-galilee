import {
  FaFacebookF,
  FaWhatsapp,
  FaTiktok,
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const navLinks = [
  { name: "Home", to: "/" },
  { name: "About", to: "/about" },
  { name: "Products", to: "/products" },
  { name: "My Orders", to: "/myorders" },
  { name: "Contact", to: "/contact" },
];

const socials = [
  {
    Icon: FaFacebookF,
    href: "https://www.facebook.com/people/Galilee/61580398533750/",
    title: "Facebook",
  },
  {
    Icon: FaWhatsapp,
    href: "https://api.whatsapp.com/send/?phone=201027539203&text&type=phone_number&app_absent=0",
    title: "WhatsApp",
  },
  {
    Icon: FaTiktok,
    href: "https://www.tiktok.com/@galilee.eg",
    title: "TikTok",
  },
  {
    Icon: FaInstagram,
    href: "https://www.instagram.com/galilee.eg",
    title: "Instagram",
  },
];

export default function Footer() {
  return (
    <footer className="bg-darkBlue text-white pt-11 pb-7 px-6 lg:px-12 font-poppins">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-center md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="text-3xl font-bold text-white tracking-[0.15em] leading-none mb-2">
              Galilee
            </div>
            <p className="text-base text-gray-300 leading-relaxed mb-4 mt-2">
              Spend your time in prayer with focus and calm, and enjoy a
              peaceful spiritual experience. Let us help you make every moment
              valuable and special.
            </p>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-orange opacity-70" />
              <span className="text-sm text-gray-300 tracking-wide">
                Est. 2025 · Cairo, Egypt
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center md:items-start">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-orange mb-4">
              Navigation
            </p>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.name} className="flex items-center gap-2 group">
                  <span className="h-px w-4 bg-orange opacity-50 group-hover:w-6 group-hover:opacity-90 transition-all duration-200" />
                  <Link
                    to={link.to}
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-orange mb-4">
              Contact
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-gray-300 text-base justify-center md:justify-start">
                <FaMapMarkerAlt size={17} className="text-orange opacity-70" />
                Cairo, Egypt
              </div>
              <a
                href="tel:+201027539203"
                className="flex items-center gap-3 text-gray-300 text-base hover:text-white transition-colors duration-200 justify-center md:justify-start"
              >
                <FaPhone size={16} className="text-orange opacity-70" />
                +20 102 753 9203
              </a>
              <a
                href="mailto:galilee.contact@gmail.com"
                className="flex items-center gap-3 text-gray-300 text-base hover:text-white transition-colors duration-200 justify-center md:justify-start"
              >
                <FaEnvelope size={17} className="text-orange opacity-70" />
                galilee.contact@gmail.com
              </a>
            </div>
          </div>

          {/* Hours + Socials */}
          <div className="flex flex-col items-center md:items-start">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-orange mb-2">
              Hours
            </p>
            <div className="flex flex-col divide-y divide-white/[0.07] w-full max-w-[220px]">
              <div className="py-2 text-base flex flex-col sm:items-start items-center gap-1">
                <span className="text-gray-300">All Days</span>
                <span className="text-white font-medium">Open 24/7</span>
              </div>
            </div>

            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-orange mt-6 mb-3">
              Follow Us
            </p>
            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              {socials.map(({ Icon, href, title }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title}
                  className="w-10 h-10 flex items-center justify-center rounded-lg
                             bg-white/[0.06] border border-white/[0.15] text-white
                             hover:bg-orange/30 hover:border-orange
                             hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-white/[0.08] mb-5" />

        <div className="flex items-center justify-center text-center">
          <p className="text-sm text-white/70">
            © 2025 Galilee · All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

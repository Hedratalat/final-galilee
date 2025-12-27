import { useState, useEffect } from "react";
import { FaFacebookF, FaWhatsapp, FaTiktok, FaInstagram } from "react-icons/fa";
import img1 from "../../assets/heroboy.png";
import img2 from "../../assets/herogal.png";
import img3 from "../../assets/herogirl.png";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

export default function HeroSection() {
  const images = [img1, img2, img3];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeIn(true), 100);
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleDragStart = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    return () => {
      clearTimeout(fadeTimer);
      clearInterval(interval);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [images.length]);

  return (
    <section
      className={`relative bg-gradient-to-br from-gray-50 via-white to-gray-100 
        flex items-center overflow-hidden transition-opacity duration-1000 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Circle 1 */}
        <div
          className="absolute top-20 left-10 
          w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 
          bg-gradient-to-br from-blue/20 to-darkBlue/20 
          rounded-full blur-3xl animate-pulse"
        ></div>

        {/* Circle 2 */}
        <div
          className="absolute top-1/2 left-1/4 
          w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 
          bg-gradient-to-br from-blue/10 to-darkBlue/10 
          rounded-full blur-2xl animate-float-1"
        ></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row items-center w-full relative z-10 gap-6 sm:gap-8 lg:gap-12">
        {/* Text Section */}
        <div className="w-full lg:w-1/2 text-left flex flex-col justify-center items-center lg:items-start mt-4  lg:mt-6 sm:py-8 lg:py-0 ">
          <h1 className="text-5xl pb-1 sm:text-5xl lg:text-6xl font-bold font-poppins bg-gradient-to-r from-darkBlue via-blue to-orange bg-clip-text text-transparent mb-4 leading-tight text-center lg:text-left">
            The Place
            <br />
            <span className="text-5xl sm:text-4xl lg:text-6xl lg:ml-2">
              Where You Meet <span className="lg:ml-1 ">Jesus again</span>
            </span>
          </h1>

          <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-6 max-w-md sm:max-w-lg text-center lg:text-left leading-relaxed">
            Spend your time in prayer with focus and calm, and enjoy a peaceful
            spiritual experience. Let us help you make every moment valuable and
            special.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full sm:w-auto justify-center lg:justify-start">
            <button
              onClick={() => {
                navigate("/products");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange to-orange/90 text-white font-bold font-poppins rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              <span className="relative z-10">Shop Now</span>
            </button>
            <button
              onClick={() => {
                navigate("/about");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-darkBlue text-darkBlue font-bold font-poppins rounded-2xl hover:bg-darkBlue hover:text-white hover:scale-105 transition-all duration-300 w-full sm:w-auto shadow-lg"
            >
              Learn More
            </button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center mb-4 justify-center lg:justify-start cursor-pointer">
            {[
              { name: "Categories", link: "#categories-section" },
              { name: "Testimonials", link: "#feedback" },
              { name: "Contact", link: "/contact" },
            ].map(({ name, link }, idx) => (
              <a
                key={idx}
                onClick={() => {
                  if (link.startsWith("#")) {
                    const el = document.querySelector(link);
                    const topPos =
                      el.getBoundingClientRect().top + window.pageYOffset - 20;
                    window.scrollTo({ top: topPos, behavior: "smooth" });
                  } else {
                    navigate(link);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="group px-4 sm:px-6 py-2 rounded-xl font-semibold font-poppins text-white bg-gradient-to-r from-darkBlue to-blue hover:from-blue hover:to-darkBlue transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-center"
              >
                {name}
              </a>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex flex-row gap-3 sm:gap-4 mt-4 sm:mt-2 lg:mb-7 justify-center lg:justify-start w-full sm:w-auto">
            {[
              {
                Icon: FaFacebookF,
                color: "text-blue",
                href: "https://www.facebook.com/people/Galilee/61580398533750/",
              },
              {
                Icon: FaWhatsapp,
                color: "text-green-600",
                href: "https://api.whatsapp.com/send/?phone=201027539203&text&type=phone_number&app_absent=0",
              },
              {
                Icon: FaTiktok,
                color: "text-darkBlue",
                href: "https://www.tiktok.com/@galilee.eg",
              },
              {
                Icon: FaInstagram,
                color: "text-orange",
                href: "https://www.instagram.com/galilee.eg",
              },
            ].map(({ Icon, color, href }, idx) => (
              <a
                key={idx}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 sm:p-3 bg-white rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <Icon
                  className={`${color} group-hover:scale-110 transition-transform duration-300`}
                  size={28}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Image Section */}
        <div
          className="w-full lg:w-1/2 relative flex justify-center 
        lg:justify-end min-h-[250px] sm:min-h-[250px] lg:min-h-[500px] mt-6 sm:mt-0 lg:mt-0 mb-10"
        >
          {/* Decorative Circles */}

          {/* Circle 1 */}
          <div
            className="absolute 
      w-72 h-72 sm:w-64 sm:h-64 lg:w-96 lg:h-96 
      bg-darkBlue rounded-full z-0 opacity-50 animate-pulse
      top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          ></div>

          {/* Circle 2 */}
          <div
            className="absolute 
      w-32 h-16 sm:w-40 sm:h-20 lg:w-48 lg:h-24
      bg-gradient-to-tr from-blue-400 to-darkBlue rounded-3xl opacity-20 animate-float-1
      bottom-[30%] right-[20%] sm:bottom-1/3 sm:right-1/4"
          ></div>

          {/* Circle 3 */}
          <div
            className="absolute 
      w-28 h-14 sm:w-36 sm:h-18 lg:w-44 lg:h-22
      bg-gradient-to-tr from-orange to-purple-600 rounded-3xl opacity-25 animate-float-2
      bottom-[25%] right-[50%] sm:bottom-1/4 sm:right-[45%]"
          ></div>

          {/* Circle 4 */}
          <div
            className="absolute 
      w-24 h-12 sm:w-32 sm:h-16 lg:w-40 lg:h-20
      bg-gradient-to-tr from-orange to-orange rounded-3xl opacity-30 animate-float-3
      bottom-[70%] right-[50%] sm:bottom-1/2 sm:right-1/2"
          ></div>

          {/* Character Image */}
          <div className="relative z-10 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImgIndex}
                src={images[currentImgIndex]}
                alt="Character"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-64 h-64 sm:w-64 sm:h-64 lg:w-[350px] lg:h-[350px] object-contain"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

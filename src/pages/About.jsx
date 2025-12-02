import { motion } from "framer-motion";
import video from "../assets/about.mp4";
import Navbar from "../components/Navbar/Navbar";

export default function About() {
  return (
    <>
      <Navbar />

      <section className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden mt-0">
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <motion.h2
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-white/90 text-4xl sm:text-6xl font-bold font-poppins tracking-wide"
          >
            About Us
          </motion.h2>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 sm:px-20 py-16 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl font-bold text-darkBlue font-poppins mb-6"
          >
            Who We Are
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-gray-700 text-lg leading-relaxed font-poppins mb-8"
          >
            We are a leading notebook and stationery brand focused on delivering
            high-quality products that combine creativity, durability, and
            modern design. Our mission is to provide you with tools that inspire
            you to write, dream, and create.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-6xl mx-auto mt-10">
          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-50 p-8 rounded-3xl shadow-inner"
          >
            <h3 className="text-2xl font-bold text-blue font-poppins mb-4">
              Our Vision
            </h3>
            <p className="text-gray-600 leading-relaxed font-poppins">
              To become the go-to brand for stationery lovers by crafting unique
              designs and premium materials that elevate your writing
              experience.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gray-50 p-8 rounded-3xl shadow-inner"
          >
            <h3 className="text-2xl font-bold text-orange font-poppins mb-4">
              Our Mission
            </h3>
            <p className="text-gray-600 leading-relaxed font-poppins">
              We aim to blend style with functionality through products designed
              with attention to detail, ensuring every notebook inspires your
              creativity.
            </p>
          </motion.div>
        </div>

        {/* Why Choose Us */}
        <div className="max-w-6xl mx-auto mt-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-darkBlue font-poppins mb-8"
          >
            Why Choose Us?
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {/* Item 1 */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white shadow-lg p-8 rounded-3xl"
            >
              <h3 className="text-xl font-semibold text-blue font-poppins mb-2">
                Premium Quality
              </h3>
              <p className="text-gray-600 font-poppins">
                We use high-grade materials to ensure long-lasting, durable
                notebooks.
              </p>
            </motion.div>

            {/* Item 2 */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white shadow-lg p-8 rounded-3xl"
            >
              <h3 className="text-xl font-semibold text-orange font-poppins mb-2">
                Modern Designs
              </h3>
              <p className="text-gray-600 font-poppins">
                Trendy, elegant, and creative designs for every style.
              </p>
            </motion.div>

            {/* Item 3 */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white shadow-lg p-8 rounded-3xl"
            >
              <h3 className="text-xl font-semibold text-darkBlue font-poppins mb-2">
                Fast Support
              </h3>
              <p className="text-gray-600 font-poppins">
                We're always here to help—customer satisfaction is our priority.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

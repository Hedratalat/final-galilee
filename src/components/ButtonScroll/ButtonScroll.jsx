import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function ButtonScroll() {
  const [visible, setVisible] = useState(false);

  const toggleVisable = () => {
    const scrolled = window.scrollY;
    if (scrolled > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const handleScroll = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisable);
    return () => {
      window.removeEventListener("scroll", toggleVisable);
    };
  }, []);
  return (
    <>
      {visible && (
        <button
          onClick={() => handleScroll()}
          className="bg-blue text-white rounded-full w-10 h-10 flex items-center justify-center 
      fixed md:right-7 right-3 bottom-4 z-50 hover:bg-terracottaDark transition-colors"
        >
          <FaArrowUp className="w-4 h-4 md:w-4 md:h-5" />
        </button>
      )}
    </>
  );
}

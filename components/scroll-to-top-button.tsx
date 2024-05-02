"use client";
import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollPosition = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollPosition / maxScroll) * 100;
      setScrollProgress(progress);
      setIsVisible(scrollPosition > 500);
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling
    });
  };

  return (
    <>
      {isVisible && (
        <>
          <div
            className="fixed bottom-16 right-6 flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 cursor-pointer shadow-md"
            onClick={scrollToTop}
          >
            <ChevronUp size={24} />
          </div>
          <div className="fixed top-0 z-50 left-0 right-0 h-1 bg-gray-200">
            <div
              className="h-full bg-webprimary"
              style={{ width: `${scrollProgress}%` }}
            ></div>
          </div>
        </>
      )}
    </>
  );
};

export default ScrollToTopButton;

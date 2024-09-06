"use client";

import { useEffect, useState } from "react";
import Container from "./container";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const pathname = usePathname();

  const isMobile = () => /Mobi|Android/i.test(navigator.userAgent);

  const isPWA = () => window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    if (isMobile() && !isPWA()) {
      // Delay the prompt by 30 to 45 seconds
      const timer = setTimeout(() => {
        // Check if the current page is not the download-app page
        if (pathname !== "/download-app") {
          setShowPrompt(true);
        }
      }, 100); // 30 seconds

      // Clean up the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/download-app") {
      setShowPrompt(false);
    }
  }, [pathname]);

  return (
    showPrompt && (
      <Container>
        <div className="fixed bottom-14 z-50 left-4 right-4 p-4 bg-websecondary text-white text-center rounded-lg shadow-lg">
          <button
            onClick={() => setShowPrompt(false)}
            className="absolute top-2 right-2 text-white"
          >
            &#x2715; {/* Unicode for cross icon */}
          </button>
          <p className="text-lg font-semibold">
            Install our app for a better experience!
          </p>
          <Link href="/download-app">
            <button className="mt-4 px-4 py-2 bg-white text-websecondary rounded-full hover:bg-gray-200">
              Install Now
            </button>
          </Link>
        </div>
      </Container>
    )
  );
};

export default InstallPrompt;

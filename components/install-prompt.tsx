"use client";

import { useEffect, useState } from "react";
import Container from "./container";

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  const isMobile = () => /Mobi|Android/i.test(navigator.userAgent);

  const isPWA = () => window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    if (isMobile() && !isPWA()) {
      setShowPrompt(true);
    }
  }, []);

  const showInstallPrompt = () => {
    if (isMobile() && !isPWA()) {
      setShowPrompt(true);
      console.log("Show install prompt");
    }
  };

  useEffect(() => {
    showInstallPrompt();
  }, []);

  return (
    showPrompt && (
      <Container>
        <div className="fixed bottom-14 z-50 left-4 right-4 p-4 bg-websecondary text-white text-center rounded-lg shadow-lg">
          <p className="text-lg font-semibold">
            Install our app for a better experience!
          </p>
          <button
            onClick={() => setShowPrompt(false)}
            className="mt-2 px-4 py-2 bg-white text-websecondary rounded-full hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </Container>
    )
  );
};

export default InstallPrompt;

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface LoginPopupProps {
  onClose: () => void;
}

const LoginPopup = ({ onClose }: LoginPopupProps) => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/auth/login");
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Add the class to start the animation
    const timer = setTimeout(() => {
      const modal = document.getElementById("login-popup");
      if (modal) {
        modal.classList.add("opacity-100", "translate-y-0");
      }
    }, 10);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        id="login-popup"
        className="bg-webprimary bg-opacity-90 rounded-lg p-6 w-3/4 max-w-lg shadow-lg transform transition-all duration-300 opacity-0 translate-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-white hover:text-websecondary focus:outline-none"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Login Required</h2>
          <p className="mb-4 text-md text-white">
            To like comments and recipes, please log in. Logging in allows you
            to interact more with the content and helps us provide a better
            experience.
          </p>
          <Image
            src="/assets/images/smoothie.png"
            alt="Login Benefits"
            className="mb-4 mx-auto"
            width={300}
            height={200}
          />
          <Button onClick={handleLoginRedirect} size="lg" variant="secondary">
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;

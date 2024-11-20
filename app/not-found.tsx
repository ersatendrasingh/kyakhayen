"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-red-500 to-orange-500 text-white">
      <div className="bg-white shadow-lg rounded-lg p-6 flex items-center max-w-3xl w-full animate-bounce-in">
        {/* Left Side: Image */}
        <div className="flex-shrink-0">
          <Image
            src="/assets/not-found.gif"
            alt="404"
            width={300}
            height={300}
          />
        </div>

        {/* Right Side: Content */}
        <div className="ml-8 text-gray-800">
          <h2 className="text-4xl  mb-4">Oops! Page Not Found</h2>
          <p className="text-lg mb-6">
            The page you're looking for doesn't seem to exist. It might have
            been moved or removed.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-websecondary text-white text-sm font-medium rounded-full shadow-lg hover:scale-105 transform transition duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

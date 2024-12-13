import React, { useState, useEffect } from "react";
import { Loader, Loader2 } from "lucide-react";
import Image from "next/image";

interface OverlayLoaderProps {
  isLoading: boolean;
}

const OverlayLoader = ({ isLoading }: OverlayLoaderProps) => {
  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-10 flex items-center justify-center ${
        isLoading ? "" : "hidden"
      }`}
    >
      <div className="bg-gray-900 bg-opacity-50 absolute inset-0"></div>
      <div className=" relative z-10 bg-white text-center  items-center justify-center p-8 rounded-xl shadow-lg">
        <Loader className="size-6 animate-spin" />
      </div>
    </div>
  );
};

export default OverlayLoader;

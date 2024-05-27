import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
      <div className="z-10 bg-white w-[200px] h-[200px]  items-center justify-center p-8 rounded-xl shadow-lg">
        <Image
          src="/assets/cook.gif"
          alt="Badge Icon"
          width={100}
          height={100}
          className="ml-3"
        />
      </div>
    </div>
  );
};

export default OverlayLoader;

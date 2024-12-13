"use client";

import { Loader as LoaderIcon } from "lucide-react";

import Image from "next/image";

const Loader = () => {
  return (
    <div className="inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10">
      <LoaderIcon className="animate-spin size-6" />
      <p className="mt-2 font-semibold animate-bounce">Please wait...</p>
    </div>
  );
};

export default Loader;

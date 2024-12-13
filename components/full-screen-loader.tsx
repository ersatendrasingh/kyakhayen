"use client";

import { Loader } from "lucide-react";

export const FullScreenLoader = () => {
  return (
    <div className="w-full max-h-screen flex items-center justify-center">
      <Loader className="size-6 animate-spin" />
    </div>
  );
};

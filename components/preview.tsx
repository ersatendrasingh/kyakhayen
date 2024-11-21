"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.bubble.css";
import Loader from "@/components/loader";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

interface PreviewProps {
  value: string;
  className?: string;
}

export const Preview = ({ value, className }: PreviewProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Loader />;
  }

  return (
    <ReactQuill
      theme="bubble"
      value={value}
      className={cn("", className)}
      readOnly
    />
  );
};

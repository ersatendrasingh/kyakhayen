"use client";

import Image, { StaticImageData } from "next/image";

interface FeaturedImageProps {
  img: StaticImageData;
  alt: string;
}

const FeaturedImage = ({ img, alt }: FeaturedImageProps) => {
  return (
    <div className="items-center justify-center">
      <Image src={img} alt={alt} width={200} height={150} />
    </div>
  );
};

export default FeaturedImage;

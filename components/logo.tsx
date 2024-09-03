"use client";

import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center justify-start mb-2">
      <div className="relative w-[180px] h-14">
        <Image
          alt="logo"
          src="/assets/images/kyakhayen-logo.png"
          //src="/assets/images/logo.png"
          priority
          fill
          sizes="180px"
        />
      </div>
    </Link>
  );
};

export default Logo;

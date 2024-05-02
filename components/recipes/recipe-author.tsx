"use client";

import { CalendarDays } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

interface RecipeAuthorProps {
  authorName: string;
  authorPhoto: StaticImageData;
  lastUpdateDate: string;
}

const RecipeAuthor = ({
  authorName,
  authorPhoto,
  lastUpdateDate,
}: RecipeAuthorProps) => {
  return (
    <div className="flex items-center justify-center md:justify-start md:my-4">
      <Image
        src={authorPhoto}
        alt="Author's Profile Photo"
        className="w-8 h-8 rounded-full border-2 border-white mr-2"
      />
      <p className="text-md">
        <span className="text-gray-500">By </span>
        <Link href="/">{authorName}</Link>
      </p>
      <div className="flex items-center ml-4 mb-2 md:mb-0 ">
        <CalendarDays className="w-4 h-4 mr-1" />
        <span>{lastUpdateDate}</span>
      </div>
    </div>
  );
};

export default RecipeAuthor;

"use client";

import { FaSearch } from "react-icons/fa";

import { SearchInput } from "@/components/header/search-input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SearchIcon = () => {
  return (
    <div className="relative">
      <Sheet>
        <SheetTrigger className="flex-col items-center justify-center hidden md:flex">
          <FaSearch className="w-4 h-4 text-gray-600" />
        </SheetTrigger>
        <SheetContent
          side="top"
          className="flex flex-row items-center justify-center"
        >
          <SearchInput />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SearchIcon;

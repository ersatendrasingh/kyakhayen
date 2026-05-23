"use client";

import { FaSearch } from "react-icons/fa";
import { useState } from "react";

import { SearchInput } from "@/components/header/search-input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SearchIcon = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="flex-col items-center justify-center hidden md:flex">
          <FaSearch className="size-5 text-muted-foreground transition-colors hover:text-foreground" />
        </SheetTrigger>
        <SheetContent
          side="top"
          className="flex flex-row items-center justify-center"
        >
          <SearchInput onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SearchIcon;

"use client";

import { useState, useEffect, useRef, createRef, RefObject } from "react";
import { Search } from "lucide-react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Cuisines from "@/components/user-personalization/cuisines";
import Allergies from "@/components/user-personalization/allergies";
import HealthGoals from "@/components/user-personalization/health-goals";
import CookingSkills from "@/components/user-personalization/cooking-skills";
import FoodPreferences from "@/components/user-personalization/food-preferences";
import Gender from "@/components/user-personalization/gender";
import { Skeleton } from "@/components/ui/skeleton";
import DateOfBirth from "@/components/user-personalization/date-of-birth";
import HeightWeight from "@/components/user-personalization/height-weight";
import Container from "@/components/container";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/header/search-input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  Allergies as AllergiesType,
  Cuisines as CuisinesType,
  HealthGoals as HealthGoalType,
  Gender as GenderType,
  RecipeCategories,
  RecipeDifficulty,
  PrakritiQuestionOption,
  PrakritiQuestion,
} from "@prisma/client";
import { PrakritiQuestionForm } from "../user-personalization/prakriti-question-form";

import { useCurrentUser } from "@/hooks/use-current-user";
import axios from "axios";
import { LoginButton } from "../auth/login-button";
import { usePathname, useRouter } from "next/navigation";
import { collectPersonalizationData } from "@/hooks/use-user-personalization";
import DownloadOurApp from "./slider/download-our-app";
interface PrakritiQuestionType extends PrakritiQuestion {
  options: PrakritiQuestionOption[];
}
interface BannerProps {
  banners: {
    id: number;
    title: string;
    spanTxt: string;
    btnTxt: string;
    image: string;
    points?: string[];
    href?: string;
  }[];
  className?: string;
}

export default function PersonalizationForm({
  banners,
  className,
}: BannerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center overflow-hidden",
        className
      )}
      style={{
        backgroundImage: `url("assets/images/home-banner-3.webp")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container>
        <div className="w-full flex flex-col items-center justify-center text-center">
          <div className="hidden  w-full my-3 justify-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger>
                <div className="relative mt-3 w-full">
                  <Search className="h-6 w-6 absolute top-3 left-3 text-slate-600" />
                  <Input
                    className="w-full md:w-[600px] h-12 pl-16 rounded-full bg-white shadow-md"
                    placeholder="Search for recipes..."
                  />
                </div>
              </SheetTrigger>
              <SheetContent
                side="top"
                className="flex flex-row items-center justify-center"
              >
                <SearchInput onClose={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="w-full h-full flex items-center justify-center">
            <DownloadOurApp banners={banners} />
          </div>
        </div>
      </Container>
    </div>
  );
}

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
interface PrakritiQuestionType extends PrakritiQuestion {
  options: PrakritiQuestionOption[];
}
interface BannerProps {
  banner: {
    id: number;
    title: string;
    spanTxt: string;
    btnTxt: string;
    image: string;
  };
  className?: string;
  cuisines: CuisinesType[];
  allergies: AllergiesType[];
  healthGoals: HealthGoalType[];
  cookingSkills: RecipeDifficulty[];
  foodPreferences: RecipeCategories[];
  genders: GenderType[];
  prakritiQuestions: PrakritiQuestionType[];
}

const getSavedStep = (): number => {
  try {
    const savedStep = localStorage.getItem("currentStep");
    return savedStep ? JSON.parse(savedStep) : 1;
  } catch (error) {
    console.error("Error parsing saved step:", error);
    return 1;
  }
};

export default function PersonalizationForm({
  banner,
  className,
  cuisines,
  allergies,
  healthGoals,
  cookingSkills,
  foodPreferences,
  genders,
  prakritiQuestions,
}: BannerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<number>(() => getSavedStep());
  const [direction, setDirection] = useState("next");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(true);

  const cuisinesRef = useRef(null);
  const allergiesRef = useRef(null);
  const healthGoalsRef = useRef(null);
  const cookingSkillsRef = useRef(null);
  const foodPreferenceRef = useRef(null);
  const genderRef = useRef(null);
  const dateOfBirthRef = useRef(null);
  const heightWeightRef = useRef(null);
  const dynamicRefs = useRef<Array<RefObject<HTMLDivElement | null>>>(
    prakritiQuestions.map(() => createRef())
  );

  const router = useRouter();
  const pathname = usePathname();

  const user = useCurrentUser();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    localStorage.setItem("currentStep", JSON.stringify(step));
  }, [step]);

  const nextStep = () => {
    if (isFormValid) {
      setDirection("next");
      setStep((prevStep) => prevStep + 1);
    } else {
      alert("Please make a selection before proceeding.");
    }
  };

  const prevStep = () => {
    setDirection("prev");
    setStep((prevStep) => prevStep - 1);
  };
  const stepCount = 8 + prakritiQuestions.length;
  const isAllStepsCompleted = step === stepCount;

  const handleDoneButtonClick = async () => {
    if (!user) {
      console.log("User is not logged in");
      localStorage.setItem("needsPersonalizationUpdate", "true");
      const encodedCallbackUrl = encodeURIComponent(pathname || "");
      router.push("/auth/login?callbackUrl=" + encodedCallbackUrl);
    } else {
      console.log("User is logged in. Proceeding to next step...");
      try {
        const data = collectPersonalizationData();

        const response = await axios.patch("/api/user/personalization", data);
        console.log("Saved");
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };
  return (
    <div
      className={cn(
        "w-full flex items-center justify-center overflow-hidden",
        className
      )}
      style={{
        backgroundImage: `url(${banner.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container>
        <div className="w-full flex flex-col items-center justify-center text-center relative">
          <div className="hidden md:flex w-full my-3 justify-center">
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
          <div className="w-full flex flex-col items-center justify-center relative h-[300px] md:h-[300px]">
            <span className="text-sm md:text-md font-medium p-2 mb-4 rounded-full text-black">
              Personalize your self
            </span>
            <TransitionGroup className="w-full h-full relative">
              {step === 1 && (
                <CSSTransition
                  key="cuisines"
                  nodeRef={cuisinesRef}
                  timeout={500}
                  classNames={
                    direction === "next" ? "slide-next" : "slide-prev"
                  }
                  unmountOnExit
                >
                  <div
                    ref={cuisinesRef}
                    className="absolute w-full h-full flex items-center justify-center"
                  >
                    <Cuisines
                      cuisines={cuisines}
                      title="What are your favourite cuisines?"
                      setIsFormValid={setIsFormValid}
                    />
                  </div>
                </CSSTransition>
              )}
              {step === 2 && (
                <CSSTransition
                  key="foodPreferences"
                  nodeRef={foodPreferenceRef}
                  timeout={500}
                  classNames={
                    direction === "next" ? "slide-next" : "slide-prev"
                  }
                  unmountOnExit
                >
                  <div
                    ref={foodPreferenceRef}
                    className="absolute w-full h-full flex items-center justify-center"
                  >
                    <FoodPreferences
                      title="What are your favourite food preferences?"
                      foodPreferences={foodPreferences}
                      setIsFormValid={setIsFormValid}
                    />
                  </div>
                </CSSTransition>
              )}

              {step === 3 && (
                <CSSTransition
                  key="healthGoals"
                  nodeRef={healthGoalsRef}
                  timeout={500}
                  classNames={
                    direction === "next" ? "slide-next" : "slide-prev"
                  }
                  unmountOnExit
                >
                  <div
                    ref={healthGoalsRef}
                    className="absolute w-full h-full flex items-center justify-center"
                  >
                    <HealthGoals
                      title="What are your health goals?"
                      healthGoals={healthGoals}
                      setIsFormValid={setIsFormValid}
                    />
                  </div>
                </CSSTransition>
              )}
              {step === 4 && (
                <CSSTransition
                  key="allergies"
                  nodeRef={allergiesRef}
                  timeout={500}
                  classNames={
                    direction === "next" ? "slide-next" : "slide-prev"
                  }
                  unmountOnExit
                >
                  <div
                    ref={allergiesRef}
                    className="absolute w-full h-full flex items-center justify-center"
                  >
                    <Allergies
                      title="Do you have any food allergies?"
                      allergies={allergies}
                      setIsFormValid={setIsFormValid}
                    />
                  </div>
                </CSSTransition>
              )}
              {step === 5 && (
                <CSSTransition
                  key="cookingSkills"
                  nodeRef={cookingSkillsRef}
                  timeout={500}
                  classNames={
                    direction === "next" ? "slide-next" : "slide-prev"
                  }
                  unmountOnExit
                >
                  <div
                    ref={cookingSkillsRef}
                    className="absolute w-full h-full flex items-center justify-center"
                  >
                    <CookingSkills
                      title="How would you describe your cooking skills?"
                      cookingSkills={cookingSkills}
                      setIsFormValid={setIsFormValid}
                    />
                  </div>
                </CSSTransition>
              )}
              {step === 6 && (
                <CSSTransition
                  key="gender"
                  nodeRef={genderRef}
                  timeout={500}
                  classNames={
                    direction === "next" ? "slide-next" : "slide-prev"
                  }
                  unmountOnExit
                >
                  <div
                    ref={genderRef}
                    className="absolute w-full h-full flex items-center justify-center"
                  >
                    <Gender
                      title="What is your gender?"
                      genders={genders}
                      setIsFormValid={setIsFormValid}
                    />
                  </div>
                </CSSTransition>
              )}
              {step === 7 && (
                <CSSTransition
                  key="dateOfBirth"
                  nodeRef={dateOfBirthRef}
                  timeout={500}
                  classNames={
                    direction === "next" ? "slide-next" : "slide-prev"
                  }
                  unmountOnExit
                >
                  <div
                    ref={dateOfBirthRef}
                    className="absolute w-full h-full flex items-center justify-center"
                  >
                    <DateOfBirth
                      title="What is your date of birth?"
                      setIsFormValid={setIsFormValid}
                    />
                  </div>
                </CSSTransition>
              )}
              {step === 8 && (
                <CSSTransition
                  key="heightWeight"
                  nodeRef={heightWeightRef}
                  timeout={500}
                  classNames={
                    direction === "next" ? "slide-next" : "slide-prev"
                  }
                  unmountOnExit
                >
                  <div
                    ref={heightWeightRef}
                    className="absolute w-full h-full flex items-center justify-center"
                  >
                    <HeightWeight
                      title="What is your height and weight?"
                      setIsFormValid={setIsFormValid}
                    />
                  </div>
                </CSSTransition>
              )}

              {step > 8 &&
                prakritiQuestions.length > 0 &&
                prakritiQuestions.map(
                  (question, index) =>
                    step === 9 + index && (
                      <CSSTransition
                        key={`prakriti-${index}`}
                        nodeRef={
                          dynamicRefs.current[
                            index
                          ] as RefObject<HTMLDivElement>
                        }
                        timeout={500}
                        classNames={
                          direction === "next" ? "slide-next" : "slide-prev"
                        }
                        unmountOnExit
                      >
                        <div
                          ref={
                            dynamicRefs.current[
                              index
                            ] as RefObject<HTMLDivElement>
                          }
                          className="absolute w-full h-full flex items-center justify-center"
                        >
                          <PrakritiQuestionForm
                            title={question.question}
                            options={question.options}
                            questionId={question.id}
                            setIsFormValid={setIsFormValid}
                          />
                        </div>
                      </CSSTransition>
                    )
                )}
            </TransitionGroup>
          </div>
          <div className="w-full flex items-center justify-center mt-5 space-x-4">
            {loading ? (
              <>
                <Skeleton className="h-10 w-32 bg-red-100 rounded-full" />
                <Skeleton className="h-10 w-28 bg-red-100 rounded-full" />
              </>
            ) : (
              <>
                {step > 1 && (
                  <Button variant="outline" size="main" onClick={prevStep}>
                    Back
                  </Button>
                )}
                {isAllStepsCompleted ? (
                  <Button
                    variant="main"
                    size="main"
                    onClick={handleDoneButtonClick}
                  >
                    Done
                  </Button>
                ) : (
                  <Button
                    variant="main"
                    size="main"
                    onClick={nextStep}
                    disabled={!isFormValid}
                  >
                    Next
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

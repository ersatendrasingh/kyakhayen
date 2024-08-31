import { PrakritiQuestionForm } from "@/components/user-personalization/prakriti-question-form";
import { useState, useEffect, useRef, createRef, RefObject } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { PrakritiQuestion, PrakritiQuestionOption } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { collectPersonalizationData } from "@/hooks/use-user-personalization";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import PreferenceConfirmationModal from "@/components/modals/preference-confirmation-modal";

interface PrakritiQuestionType extends PrakritiQuestion {
  options: PrakritiQuestionOption[];
}

interface PrakritiInformationProps {
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

const PrakritiInformation: React.FC<PrakritiInformationProps> = ({
  prakritiQuestions,
}) => {
  const [step, setStep] = useState<number>(() => getSavedStep());
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const dynamicRefs = useRef<Array<RefObject<HTMLDivElement | null>>>(
    prakritiQuestions.map(() => createRef())
  );
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const { update } = useSession();

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

  const stepCount = prakritiQuestions.length;
  const isAllStepsCompleted = step === stepCount;

  const handleDoneButtonClick = async () => {
    try {
      setLoading(true);
      const data = collectPersonalizationData();

      const response = await axios.patch(
        "/api/user/personalization/prakriti",
        data
      );
      if (response.status === 200) {
        setLoading(false);
        update();
        localStorage.removeItem("userData");
        localStorage.removeItem("currentStep");
        setIsModalOpen(true);
        //router.push("/user/wellness-summary");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    // Navigate to meal plan page or perform other actions
    router.push("/meal-plan");
  };
  return (
    <>
      <div className="w-full flex flex-col  relative">
        <h2 className="text-xl text-start font-bold border-b-2 border-slate-200 pb-2 text-gray-700">
          Prakriti (Body type) Information
        </h2>
        <div className="w-full flex flex-col items-center justify-center relative h-[300px] md:h-[300px] overflow-hidden">
          <TransitionGroup className="w-full h-full relative overflow-hidden">
            {prakritiQuestions.map(
              (question, index) =>
                step === 1 + index && (
                  <CSSTransition
                    key={`prakriti-${index}`}
                    nodeRef={
                      dynamicRefs.current[index] as RefObject<HTMLDivElement>
                    }
                    timeout={500}
                    classNames={
                      direction === "next" ? "slide-next" : "slide-prev"
                    }
                    unmountOnExit
                  >
                    <div
                      ref={
                        dynamicRefs.current[index] as RefObject<HTMLDivElement>
                      }
                      className="absolute w-full h-full flex items-center justify-center"
                      style={{ overflow: "hidden" }}
                    >
                      <PrakritiQuestionForm
                        title={question.question}
                        userId={user?.id}
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
      </div>
      <div className="w-full flex items-center justify-center mt-5 space-x-4">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
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
                disabled={!isFormValid}
                onClick={handleDoneButtonClick}
                className="bg-gradient-to-r from-red-500 to-orange-500"
              >
                Done
              </Button>
            ) : (
              <Button
                variant="main"
                size="main"
                onClick={nextStep}
                disabled={!isFormValid}
                className="bg-gradient-to-r from-red-500 to-orange-500"
              >
                Next
              </Button>
            )}
          </>
        )}
        <PreferenceConfirmationModal
          title="Prakriti Updated"
          description="Your Prakriti (Ayurvedic body type) has been successfully updated. Your meal plan has been customized to balance your doshas. Click the button below to explore your updated meal plan."
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
        />
      </div>
    </>
  );
};

export default PrakritiInformation;

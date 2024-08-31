"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { PrakritiQuestionOption } from "@prisma/client";
import { db } from "@/lib/db";
import axios from "axios";

interface PrakritiQuestionFormProps {
  title: string;
  userId?: string;
  options: PrakritiQuestionOption[];
  questionId: string;
  setIsFormValid: (isValid: boolean) => void;
}

const getUserData = () => {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : {};
  } catch (error) {
    console.error("Error parsing user data:", error);
    return {};
  }
};

const fetchUserDataFromDB = async (userId: string) => {
  try {
    const response = await axios.get(`/api/user/${userId}/user-prakriti`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data from DB:", error);
    return null;
  }
};

const saveUserData = (data: any) => {
  try {
    localStorage.setItem("userData", JSON.stringify(data));
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

export const PrakritiQuestionForm = ({
  title,
  userId,
  options,
  questionId,
  setIsFormValid,
}: PrakritiQuestionFormProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsFormValid(selectedOption !== null);
  }, [selectedOption, setIsFormValid]);

  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      let userData = getUserData();

      if (!userData.prakritiSelections || Object.keys(userData).length === 0) {
        const dbUserData = await fetchUserDataFromDB(userId);

        if (dbUserData) {
          userData.prakritiSelections = dbUserData.map((selection: any) => ({
            questionId: selection.questionId,
            prakritiId: selection.prakritiId,
            optionId: selection.optionId,
          }));
          saveUserData(userData); // Save fetched data to localStorage
        }
      }

      if (userData) {
        const parsedSelections = userData.prakritiSelections || [];
        const existingSelection = parsedSelections.find(
          (selection: { questionId: string }) =>
            selection.questionId === questionId
        );
        if (existingSelection) {
          setSelectedOption(existingSelection.optionId);
        }
      }

      setLoading(false);
    };

    fetchUserData(userId || "");
  }, [questionId]);

  const handleOptionClick = (
    optionId: string,
    questionId: string,
    prakritiId: string
  ) => {
    setSelectedOption(optionId);

    const userData = getUserData();
    let parsedSelections = userData.prakritiSelections || [];

    // Update or add the current selection
    const updatedSelections = parsedSelections.filter(
      (selection: { questionId: string }) => selection.questionId !== questionId
    );
    updatedSelections.push({ questionId, optionId, prakritiId });

    // Save the updated selections back to localStorage
    userData.prakritiSelections = updatedSelections;
    saveUserData(userData);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-between">
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3 hidden md:flex" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3 hidden md:flex" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3 hidden md:flex" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3 hidden md:flex" />
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-2xl xl:text-3xl mb-3 text-center font-semibold transition-all duration-1000 ease-in-out transform animate-slide-in text-websecondary">
        {title}
      </h1>
      <div className="w-[320px] md:w-full  flex flex-col  space-y-2 mx-auto">
        {options.map((option) => (
          <div key={option.id} className="flex items-center justify-center">
            <Button
              variant={selectedOption === option.id ? "default" : "outline"}
              className={cn(
                "p-6 rounded-full border w-full md:w-[600px] break-words whitespace-normal", // Base button styles
                selectedOption === option.id
                  ? "bg-websecondary text-white hover:bg-websecondary hover:text-white hover:border-websecondary"
                  : "bg-white text-websecondary border-websecondary hover:bg-gray-200 hover:text-websecondary hover:border-websecondary"
              )}
              onClick={() =>
                handleOptionClick(
                  option.id,
                  option.questionId,
                  option.prakritiId
                )
              }
            >
              {option.value}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

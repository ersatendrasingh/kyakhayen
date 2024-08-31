"use client";

import { useState } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import axios from "axios";
import { User } from "@prisma/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import PreferenceConfirmationModal from "@/components/modals/preference-confirmation-modal";

interface HealthGoal {
  id: string;
  title: string;
  imageUrl: string | null;
}

interface UserHealthGoalsProps {
  userData: User & {
    UserHealthGoals: {
      healthGoal: HealthGoal;
    }[];
  };
  healthGoals: HealthGoal[];
}

const UserHealthGoals = ({ userData, healthGoals }: UserHealthGoalsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedHealthGoalId, setSelectedHealthGoalId] = useState<
    string | null
  >(null);
  const [deletingHealthGoalId, setDeletingHealthGoalId] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const handleAddHealthGoalClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectHealthGoal = async (healthGoalId: string) => {
    setSelectedHealthGoalId(healthGoalId);

    const selectedHealthGoal = healthGoals.find(
      (healthGoal) => healthGoal.id === healthGoalId
    );

    if (selectedHealthGoal) {
      try {
        const response = await axios.put(
          "/api/user/personalization/health-goals",
          {
            userId: userData.id,
            newHealthGoal: selectedHealthGoal,
          }
        );

        if (response.status === 200) {
          console.log(
            "User's preferences updated successfully:",
            response.data
          );

          const updatedUserHealthGoals = [
            ...userData.UserHealthGoals,
            { healthGoal: selectedHealthGoal },
          ];

          toast.success("Health goal added successfully", {
            position: "top-center",
            autoClose: 5000,
          });
          router.refresh();
          setIsExpanded(false);
          setIsModalOpen(true);
        } else {
          console.error("Failed to update user's preferences:", response.data);
        }
      } catch (error) {
        console.error("Error updating user's preferences:", error);
      } finally {
        setSelectedHealthGoalId(null);
      }
    } else {
      console.error("Selected health goal not found");
    }
  };
  const handleDeleteHealthGoal = async (healthGoalId: string) => {
    setDeletingHealthGoalId(healthGoalId);
    try {
      const response = await axios.delete(
        "/api/user/personalization/health-goals",
        {
          data: { userId: userData.id, healthGoalId },
        }
      );

      if (response.status === 200) {
        toast.success("Health goal removed successfully", {
          position: "top-center",
          autoClose: 5000,
        });
        router.refresh();
      } else {
        console.error("Failed to delete health goal:", response.data);
      }
    } catch (error) {
      console.error("Error deleting health goal:", error);
    } finally {
      setDeletingHealthGoalId(null);
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
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-4">Health Goals</h2>
      <p className="text-sm text-gray-700 mb-4">
        Choose from the health goals listed below, and we will filter the
        recipes accordingly.
      </p>
      <div className="flex flex-wrap items-center justify-between md:justify-start gap-7">
        {userData.UserHealthGoals.map(({ healthGoal }) => (
          <div
            key={healthGoal.id}
            className="relative overflow-hidden group w-[120px] md:w-[140px] inline-block"
          >
            <Image
              src={healthGoal.imageUrl || "/assets/images/default-category.jpg"}
              alt={healthGoal.title || "Category Image"}
              width={150}
              height={150}
              className="rounded-full"
            />
            <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
            <span className="absolute inset-0 flex items-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
              {healthGoal.title}
            </span>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 bg-black bg-opacity-60 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-full"
              onClick={() => handleDeleteHealthGoal(healthGoal.id)}
            >
              {deletingHealthGoalId === healthGoal.id ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <FaTrashAlt className="text-red-600 w-5 h-5" />
                  <span className="text-gray-300 mt-1">Delete</span>
                </>
              )}
            </div>
          </div>
        ))}

        <div
          className="relative overflow-hidden group w-[120px] md:w-[140px] h-[120px] md:h-[140px] inline-block cursor-pointer"
          onClick={handleAddHealthGoalClick}
        >
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300">
            <FaPlus className="text-gray-600 w-5 h-5 mb-1" />
            <span className="text-gray-600">Add Goal</span>
          </div>
        </div>
      </div>
      <div
        className={`${
          isExpanded ? "block" : "hidden"
        } bg-gray-100 border border-gray-200 shadow-md rounded-md mt-6 p-4 transition-all duration-300`}
      >
        <div className="flex flex-wrap items-center gap-5">
          {healthGoals.map((healthGoal) => (
            <div
              key={healthGoal.id}
              className={`relative overflow-hidden cursor-pointer group w-[120px] md:w-[140px] inline-block transition-all duration-300 ${
                selectedHealthGoalId === healthGoal.id
                  ? "border-4 border-websecondary rounded-full"
                  : ""
              }`}
            >
              <Image
                src={
                  healthGoal.imageUrl || "/assets/images/default-category.jpg"
                }
                alt={healthGoal.title || "Category Image"}
                width={150}
                height={150}
                className="rounded-full"
              />
              <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
              <span className="absolute inset-0 flex items-center text-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
                {healthGoal.title}
              </span>
              <span
                className="absolute inset-0 flex flex-col items-center rounded-full justify-center text-white opacity-0 group-hover:opacity-100 bg-black bg-opacity-60 transition-opacity duration-300 cursor-pointer"
                onClick={() => handleSelectHealthGoal(healthGoal.id)}
              >
                {selectedHealthGoalId === healthGoal.id ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <FaPlus className="text-white w-5 h-5" />
                    <span className="text-white mt-1">Add</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
      <PreferenceConfirmationModal
        title="Health Goals Updated"
        description="Your health goals have been successfully updated. Your meal plan has been tailored to help you achieve these goals. Click the button below to review your updated meal plan."
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default UserHealthGoals;

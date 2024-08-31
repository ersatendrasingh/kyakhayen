"use client";

import { useState } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { GrUpdate } from "react-icons/gr";
import Image from "next/image";
import axios from "axios";
import { User } from "@prisma/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import PreferenceConfirmationModal from "@/components/modals/preference-confirmation-modal";

interface CookingSkill {
  id: string;
  title: string;
  imageUrl: string | null;
  position: number | null;
}

interface UserCookingSkillsProps {
  userData: User & {
    cookingSkill: CookingSkill | null;
  };
  cookingSkills: CookingSkill[];
}

const UserCookingSkills = ({
  userData,
  cookingSkills,
}: UserCookingSkillsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCookingSkillId, setSelectedCookingSkillId] = useState<
    string | null
  >(userData.cookingSkillId || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();

  const handleAddCookingSkillClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectCookingSkill = async (cookingSkillId: string) => {
    if (loading) return;
    setLoading(true);
    setSelectedCookingSkillId(cookingSkillId);

    const selectedCookingSkill = cookingSkills.find(
      (cookingSkill) => cookingSkill.id === cookingSkillId
    );

    if (selectedCookingSkill) {
      try {
        const response = await axios.put(
          "/api/user/personalization/cooking-skills",
          {
            userId: userData.id,
            newCookingSkill: selectedCookingSkill,
          }
        );

        if (response.status === 200) {
          toast.success("Cooking skill updated successfully", {
            position: "top-center",
            autoClose: 5000,
          });
          router.refresh();
          setIsExpanded(false);
          setIsModalOpen(true);
        } else {
          console.error(
            "Failed to update user's cooking skill:",
            response.data
          );
        }
      } catch (error) {
        console.error("Error updating user's cooking skill:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("Selected cooking skill not found");
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
      <h2 className="text-2xl font-bold mb-4">Cooking Skills</h2>
      <p className="text-sm text-gray-700 mb-4">
        Choose from the cooking skills listed below, and we will filter the
        recipes accordingly.
      </p>
      <div className="flex flex-wrap items-center justify-between md:justify-start gap-7">
        {userData.cookingSkill && (
          <div className="relative overflow-hidden group w-[120px] md:w-[140px] inline-block">
            <Image
              src={
                userData.cookingSkill.imageUrl ||
                "/assets/images/default-category.jpg"
              }
              alt={userData.cookingSkill.title || "Cooking Skill Image"}
              width={150}
              height={150}
              className="rounded-full"
            />
            <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
            <span className="absolute inset-0 flex items-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
              {userData.cookingSkill.title}
            </span>
          </div>
        )}

        <div
          className="relative overflow-hidden group w-[120px] md:w-[140px] h-[120px] md:h-[140px] inline-block cursor-pointer"
          onClick={handleAddCookingSkillClick}
        >
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300">
            <GrUpdate className="text-gray-600 w-5 h-5 mb-1" />
            <span className="text-gray-600">Update</span>
          </div>
        </div>
      </div>
      <div
        className={`${
          isExpanded ? "block" : "hidden"
        } bg-gray-100 border border-gray-200 shadow-md rounded-md mt-6 p-4 transition-all duration-300`}
      >
        <div className="flex flex-wrap items-center gap-5">
          {cookingSkills.map((cookingSkill) => (
            <div
              key={cookingSkill.id}
              className={`relative overflow-hidden cursor-pointer group w-[120px] md:w-[140px] inline-block transition-all duration-300 ${
                selectedCookingSkillId === cookingSkill.id
                  ? "border-4 border-websecondary rounded-full"
                  : ""
              }`}
            >
              <Image
                src={
                  cookingSkill.imageUrl || "/assets/images/default-category.jpg"
                }
                alt={cookingSkill.title || "Category Image"}
                width={150}
                height={150}
                className="rounded-full"
              />
              <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
              <span className="absolute inset-0 flex items-center text-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
                {cookingSkill.title}
              </span>
              <span
                className="absolute inset-0 flex flex-col items-center rounded-full justify-center text-white opacity-0 group-hover:opacity-100 bg-black bg-opacity-60 transition-opacity duration-300 cursor-pointer"
                onClick={() => handleSelectCookingSkill(cookingSkill.id)}
              >
                {loading && selectedCookingSkillId === cookingSkill.id ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <FaPlus className="text-white w-5 h-5" />
                    <span className="text-white mt-1">Select</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
      <PreferenceConfirmationModal
        title="Cooking Skills Updated"
        description="Your cooking skill level has been successfully updated. We've adjusted your meal plan to include recipes that match your cooking abilities. Click the button below to check your updated meal plan."
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default UserCookingSkills;

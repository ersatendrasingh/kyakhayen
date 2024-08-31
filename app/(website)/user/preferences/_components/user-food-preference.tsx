"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { GrUpdate } from "react-icons/gr";
import Image from "next/image";
import axios from "axios";
import { User } from "@prisma/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import PreferenceConfirmationModal from "@/components/modals/preference-confirmation-modal";

interface FoodPreference {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  position: number | null;
}

interface UserFoodPreferencesProps {
  userData: User & {
    foodPreference: FoodPreference | null;
  };
  foodPreferences: FoodPreference[];
}

const UserFoodPreferences = ({
  userData,
  foodPreferences,
}: UserFoodPreferencesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFoodPreferenceId, setSelectedFoodPreferenceId] = useState<
    string | null
  >(userData.foodPreferenceId || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();

  const handleAddPreferenceClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectPreference = async (preferenceId: string) => {
    if (loading) return;
    setLoading(true);
    setSelectedFoodPreferenceId(preferenceId);

    const selectedPreference = foodPreferences.find(
      (preference) => preference.id === preferenceId
    );

    if (selectedPreference) {
      try {
        const response = await axios.put(
          "/api/user/personalization/food-preferences",
          {
            userId: userData.id,
            newPreference: selectedPreference,
          }
        );

        if (response.status === 200) {
          toast.success("Food preference updated successfully", {
            position: "top-center",
            autoClose: 5000,
          });
          router.refresh();
          setIsExpanded(false);
          setIsModalOpen(true);
        } else {
          console.error("Failed to update user's preference:", response.data);
        }
      } catch (error) {
        console.error("Error updating user's preference:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("Selected preference not found");
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
      <h2 className="text-2xl font-bold mb-4">Food Preferences</h2>
      <p className="text-sm text-gray-700 mb-4">
        Choose from the food categories listed below, and we will filter the
        recipes accordingly.
      </p>
      <div className="flex flex-wrap items-center justify-between md:justify-start gap-7">
        {userData.foodPreference && (
          <div className="relative overflow-hidden group w-[120px] md:w-[140px] inline-block">
            <Image
              src={
                userData.foodPreference.imageUrl ||
                "/assets/images/default-category.jpg"
              }
              alt={userData.foodPreference.name || "Category Image"}
              width={150}
              height={150}
              className="rounded-full"
            />
            <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
            <span className="absolute inset-0 flex items-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
              {userData.foodPreference.name}
            </span>
          </div>
        )}

        <div
          className="relative overflow-hidden group w-[120px] md:w-[140px] h-[120px] md:h-[140px] inline-block cursor-pointer"
          onClick={handleAddPreferenceClick}
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
          {foodPreferences.map((preference) => (
            <div
              key={preference.id}
              className={`relative overflow-hidden cursor-pointer group w-[120px] md:w-[140px] inline-block transition-all duration-300 ${
                selectedFoodPreferenceId === preference.id
                  ? "border-4 border-websecondary rounded-full"
                  : ""
              }`}
            >
              <Image
                src={
                  preference.imageUrl || "/assets/images/default-category.jpg"
                }
                alt={preference.name || "Category Image"}
                width={150}
                height={150}
                className="rounded-full"
              />
              <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
              <span className="absolute inset-0 flex items-center text-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
                {preference.name}
              </span>
              <span
                className="absolute inset-0 flex flex-col items-center rounded-full justify-center text-white opacity-0 group-hover:opacity-100 bg-black bg-opacity-60 transition-opacity duration-300 cursor-pointer"
                onClick={() => handleSelectPreference(preference.id)}
              >
                {loading && selectedFoodPreferenceId === preference.id ? (
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
        title="Food Preference Updated"
        description="Your food preference has been successfully updated. Your meal plan has also been adjusted accordingly. Click the button below to check your updated meal plan."
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default UserFoodPreferences;

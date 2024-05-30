"use client";

import { useState } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import axios from "axios";
import { User } from "@prisma/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Allergy {
  id: string;
  title: string;
  imageUrl: string | null;
}

interface UserAllergiesProps {
  userData: User & {
    UserAllrgies: {
      allergy: Allergy;
    }[];
  };
  allergies: Allergy[];
}

const UserAllergies = ({ userData, allergies }: UserAllergiesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAllergyId, setSelectedAllergyId] = useState<string | null>(
    null
  );
  const [deletingAllergyId, setDeletingAllergyId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const handleAddAllergyClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectAllergy = async (allergyId: string) => {
    setSelectedAllergyId(allergyId);

    const selectedAllergy = allergies.find(
      (allergy) => allergy.id === allergyId
    );

    if (selectedAllergy) {
      try {
        let removeAllOthers = false;

        if (selectedAllergy.title.toLowerCase() === "none") {
          // Remove all other allergies
          removeAllOthers = true;
        } else {
          // Check if "None" allergy is currently selected
          const noneAllergy = allergies.find(
            (allergy) => allergy.title.toLowerCase() === "none"
          );
          const isNoneSelected = userData.UserAllrgies.some(
            (userAllergy) => userAllergy.allergy.id === noneAllergy?.id
          );

          if (isNoneSelected) {
            // Unselect "None" allergy
            await axios.delete("/api/user/personalization/allergies", {
              data: { userId: userData.id, allergyId: noneAllergy!.id },
            });
          }
        }

        const response = await axios.put(
          "/api/user/personalization/allergies",
          {
            userId: userData.id,
            newAllergy: selectedAllergy,
            removeAllOthers,
          }
        );

        if (response.status === 200) {
          toast.success(
            removeAllOthers
              ? "Allergy set to None, all other allergies removed successfully"
              : "Allergy added successfully",
            {
              position: "top-center",
              autoClose: 5000,
            }
          );
          router.refresh();
          setIsExpanded(false);
        } else {
          console.error("Failed to update user's preferences:", response.data);
        }
      } catch (error) {
        console.error("Error updating user's preferences:", error);
      } finally {
        setSelectedAllergyId(null);
      }
    } else {
      console.error("Selected allergy not found");
    }
  };
  const handleDeleteAllergy = async (allergyId: string) => {
    setDeletingAllergyId(allergyId);
    try {
      const response = await axios.delete(
        "/api/user/personalization/allergies",
        {
          data: { userId: userData.id, allergyId },
        }
      );

      if (response.status === 200) {
        toast.success("Allergy removed successfully", {
          position: "top-center",
          autoClose: 5000,
        });
        router.refresh();
      } else {
        console.error("Failed to delete allergy:", response.data);
      }
    } catch (error) {
      console.error("Error deleting allergy:", error);
    } finally {
      setDeletingAllergyId(null);
    }
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-4">Allergies</h2>
      <p className="text-sm text-gray-700 mb-4">
        Choose from the allergies listed below, and we will filter the recipes
        accordingly.
      </p>
      <div className="flex flex-wrap items-center justify-between md:justify-start gap-7">
        {userData.UserAllrgies.map(({ allergy }) => (
          <div
            key={allergy.id}
            className="relative overflow-hidden group w-[120px] md:w-[140px] inline-block"
          >
            <Image
              src={allergy.imageUrl || "/assets/images/default-category.jpg"}
              alt={allergy.title || "Category Image"}
              width={150}
              height={150}
              className="rounded-full"
            />
            <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
            <span className="absolute inset-0 flex items-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
              {allergy.title}
            </span>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 bg-black bg-opacity-60 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-full"
              onClick={() => handleDeleteAllergy(allergy.id)}
            >
              {deletingAllergyId === allergy.id ? (
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
          onClick={handleAddAllergyClick}
        >
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300">
            <FaPlus className="text-gray-600 w-5 h-5 mb-1" />
            <span className="text-gray-600">Add Allergy</span>
          </div>
        </div>
      </div>
      <div
        className={`${
          isExpanded ? "block" : "hidden"
        } bg-gray-100 border border-gray-200 shadow-md rounded-md mt-6 p-4 transition-all duration-300`}
      >
        <div className="flex flex-wrap items-center gap-5">
          {allergies.map((allergy) => (
            <div
              key={allergy.id}
              className={`relative overflow-hidden cursor-pointer group w-[120px] md:w-[140px] inline-block transition-all duration-300 ${
                selectedAllergyId === allergy.id
                  ? "border-4 border-websecondary rounded-full"
                  : ""
              }`}
            >
              <Image
                src={allergy.imageUrl || "/assets/images/default-category.jpg"}
                alt={allergy.title || "Category Image"}
                width={150}
                height={150}
                className="rounded-full"
              />
              <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
              <span className="absolute inset-0 flex items-center text-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
                {allergy.title}
              </span>
              <span
                className="absolute inset-0 flex flex-col items-center rounded-full justify-center text-white opacity-0 group-hover:opacity-100 bg-black bg-opacity-60 transition-opacity duration-300 cursor-pointer"
                onClick={() => handleSelectAllergy(allergy.id)}
              >
                {selectedAllergyId === allergy.id ? (
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
    </div>
  );
};

export default UserAllergies;

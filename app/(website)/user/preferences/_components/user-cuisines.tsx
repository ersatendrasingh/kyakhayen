"use client";

import { useState } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import axios from "axios";
import { User } from "@prisma/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Cuisine {
  id: string;
  title: string;
  imageUrl: string | null;
}

interface UserCuisinesProps {
  userData: User & {
    userCuisines: {
      cuisine: Cuisine;
    }[];
  };
  cuisines: Cuisine[];
}

const UserCuisines = ({ userData, cuisines }: UserCuisinesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCuisineId, setSelectedCuisineId] = useState<string | null>(
    null
  );
  const [deletingCuisineId, setDeletingCuisineId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const handleAddCuisineClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectCuisine = async (cuisineId: string) => {
    setSelectedCuisineId(cuisineId);

    console.log("Selected cuisine:", cuisineId);

    const selectedCuisine = cuisines.find(
      (cuisine) => cuisine.id === cuisineId
    );

    if (selectedCuisine) {
      try {
        const response = await axios.put("/api/user/personalization/cuisines", {
          userId: userData.id,
          newCuisine: selectedCuisine,
        });

        if (response.status === 200) {
          console.log(
            "User's preferences updated successfully:",
            response.data
          );

          const updatedUserCuisines = [
            ...userData.userCuisines,
            { cuisine: selectedCuisine },
          ];

          toast.success("Cuisine added successfully", {
            position: "top-center",
            autoClose: 5000,
          });
          router.refresh();
          setIsExpanded(false);
        } else {
          console.error("Failed to update user's preferences:", response.data);
        }
      } catch (error) {
        console.error("Error updating user's preferences:", error);
      } finally {
        setSelectedCuisineId(null);
      }
    } else {
      console.error("Selected cuisine not found");
    }
  };
  const handleDeleteCuisine = async (cuisineId: string) => {
    setDeletingCuisineId(cuisineId);
    try {
      const response = await axios.delete(
        "/api/user/personalization/cuisines",
        {
          data: { userId: userData.id, cuisineId },
        }
      );

      if (response.status === 200) {
        toast.success("Cuisine removed successfully", {
          position: "top-center",
          autoClose: 5000,
        });
        router.refresh();
      } else {
        console.error("Failed to delete cuisine:", response.data);
      }
    } catch (error) {
      console.error("Error deleting cuisine:", error);
    } finally {
      setDeletingCuisineId(null);
    }
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-4">Favourite Cuisines</h2>
      <p className="text-sm text-gray-700 mb-4">
        Choose from the cuisines listed below, and we will filter the recipes
        accordingly.
      </p>
      <div className="flex flex-wrap items-center justify-between md:justify-start gap-7">
        {userData.userCuisines.map(({ cuisine }) => (
          <div
            key={cuisine.id}
            className="relative overflow-hidden group w-[120px] md:w-[140px] inline-block"
          >
            <Image
              src={cuisine.imageUrl || "/assets/images/default-category.jpg"}
              alt={cuisine.title || "Category Image"}
              width={150}
              height={150}
              className="rounded-full"
            />
            <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
            <span className="absolute inset-0 flex items-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
              {cuisine.title}
            </span>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 bg-black bg-opacity-60 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-full"
              onClick={() => handleDeleteCuisine(cuisine.id)}
            >
              {deletingCuisineId === cuisine.id ? (
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
          onClick={handleAddCuisineClick}
        >
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300">
            <FaPlus className="text-gray-600 w-5 h-5 mb-1" />
            <span className="text-gray-600">Add Cuisine</span>
          </div>
        </div>
      </div>
      <div
        className={`${
          isExpanded ? "block" : "hidden"
        } bg-gray-100 border border-gray-200 shadow-md rounded-md mt-6 p-4 transition-all duration-300`}
      >
        <div className="flex flex-wrap items-center gap-5">
          {cuisines.map((cuisine) => (
            <div
              key={cuisine.id}
              className={`relative overflow-hidden cursor-pointer group w-[120px] md:w-[140px] inline-block transition-all duration-300 ${
                selectedCuisineId === cuisine.id
                  ? "border-4 border-websecondary rounded-full"
                  : ""
              }`}
            >
              <Image
                src={cuisine.imageUrl || "/assets/images/default-category.jpg"}
                alt={cuisine.title || "Category Image"}
                width={150}
                height={150}
                className="rounded-full"
              />
              <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
              <span className="absolute inset-0 flex items-center text-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
                {cuisine.title}
              </span>
              <span
                className="absolute inset-0 flex flex-col items-center rounded-full justify-center text-white opacity-0 group-hover:opacity-100 bg-black bg-opacity-60 transition-opacity duration-300 cursor-pointer"
                onClick={() => handleSelectCuisine(cuisine.id)}
              >
                {selectedCuisineId === cuisine.id ? (
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

export default UserCuisines;

"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { GrUpdate } from "react-icons/gr";
import Image from "next/image";
import axios from "axios";
import { User } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface Gender {
  id: string;
  title: string;
  imageUrl: string | null;
  position: number | null;
}
interface GenderInformationProps {
  userData:
    | (User & {
        gender: Gender | null;
      })
    | null;
  genders: Gender[];
}

const GenderInformation = ({ userData, genders }: GenderInformationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedGenderId, setSelectedGenderId] = useState<string | null>(
    userData?.genderId || null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { update } = useSession();

  const handleAddGenderClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectGender = async (genderId: string) => {
    if (loading) return;
    setLoading(true);
    setSelectedGenderId(genderId);

    const selectedGender = genders.find((gender) => gender.id === genderId);

    if (selectedGender) {
      try {
        const response = await axios.put("/api/user/personalization/gender", {
          userId: userData?.id,
          newGender: selectedGender,
        });

        if (response.status === 200) {
          update();
          toast.success("Gender updated successfully", {
            duration: 5000,
          });
          router.refresh();
          setIsExpanded(false);
        } else {
          console.error("Failed to update user's gender:", response.data);
        }
      } catch (error) {
        console.error("Error updating user's gender:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("Selected gender not found");
    }
  };

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold border-b-2 border-slate-200 pb-2 text-gray-700">
        Gender Information
      </h2>
      <p className="text-sm text-gray-700 mb-4">I identify my gender as:</p>
      <div className="flex flex-wrap items-center justify-between md:justify-start gap-7">
        {userData?.gender && (
          <div className="relative p-4 overflow-hidden group w-[120px] md:w-[140px] inline-block">
            <Image
              src={userData.gender.imageUrl || ""}
              alt={userData.gender.title || "Gender Image"}
              width={130}
              height={130}
            />
            <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
            <span className="absolute inset-0 flex items-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
              {userData.gender.title}
            </span>
          </div>
        )}

        <div
          className="relative overflow-hidden group w-[120px] md:w-[140px] h-[120px] md:h-[140px] inline-block cursor-pointer"
          onClick={handleAddGenderClick}
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
          {genders.map((gender) => (
            <div
              key={gender.id}
              className={`relative overflow-hidden cursor-pointer p-4 group w-[120px] md:w-[140px] inline-block transition-all duration-300 ${
                selectedGenderId === gender.id
                  ? "border-4 border-websecondary rounded-full"
                  : ""
              }`}
            >
              <Image
                src={gender.imageUrl || "/assets/images/default-category.jpg"}
                alt={gender.title || "Category Image"}
                width={140}
                height={140}
                className="rounded-full"
              />
              <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
              <span className="absolute inset-0 flex items-center text-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
                {gender.title}
              </span>
              <span
                className="absolute inset-0 flex flex-col items-center rounded-full justify-center text-white opacity-0 group-hover:opacity-100 bg-black bg-opacity-60 transition-opacity duration-300 cursor-pointer"
                onClick={() => handleSelectGender(gender.id)}
              >
                {loading && selectedGenderId === gender.id ? (
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
    </div>
  );
};

export default GenderInformation;

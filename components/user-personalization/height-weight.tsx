"use client";

import { useState, useEffect } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface HeightWeightProps {
  title: string;
  setIsFormValid: (isValid: boolean) => void;
}
const getSavedData = (): {
  heightFt: string;
  heightInch: string;
  heightCm: string;
  weightKg: string;
  weightLbs: string;
} => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);

      if (parsedUserData.heightWeight) {
        const { heightFt, heightInch, heightCm, weightKg, weightLbs } =
          parsedUserData.heightWeight;
        return { heightFt, heightInch, heightCm, weightKg, weightLbs };
      }
    }

    return {
      heightFt: "",
      heightInch: "",
      heightCm: "",
      weightKg: "",
      weightLbs: "",
    };
  } catch (error) {
    console.error("Error parsing saved height and weight:", error);

    return {
      heightFt: "",
      heightInch: "",
      heightCm: "",
      weightKg: "",
      weightLbs: "",
    };
  }
};

const HeightWeight = ({ title, setIsFormValid }: HeightWeightProps) => {
  const [heightUnit, setHeightUnit] = useState<"ft-in" | "cm">("ft-in");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightFt, setHeightFt] = useState(getSavedData().heightFt || "");
  const [heightInch, setHeightInch] = useState(getSavedData().heightInch || "");
  const [heightCm, setHeightCm] = useState(getSavedData().heightCm || "");
  const [weightKg, setWeightKg] = useState(getSavedData().weightKg || "");
  const [weightLbs, setWeightLbs] = useState(getSavedData().weightLbs || "");
  const [isHeightChecked, setIsHeightChecked] = useState(false);
  const [isWeightChecked, setIsWeightChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isValidHeight, setIsValidHeight] = useState(false);
  const [isValidWeight, setIsValidWeight] = useState(false);

  const handleHeightSwitchChange = () => {
    setIsHeightChecked(!isHeightChecked);
    setHeightUnit(isHeightChecked ? "ft-in" : "cm");
  };

  const handleWeightSwitchChange = () => {
    setIsWeightChecked(!isWeightChecked);
    setWeightUnit(isWeightChecked ? "kg" : "lbs");
  };
  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (heightUnit === "ft-in" && (heightFt || heightInch)) {
      const ft = parseInt(heightFt) || 0;
      const inch = parseInt(heightInch) || 0;
      const cm = Math.round(ft * 30.48 + inch * 2.54);
      setHeightCm(cm.toString());
    } else if (heightUnit === "cm" && heightCm) {
      const cm = parseInt(heightCm);
      const ft = Math.floor(cm / 30.48);
      const inch = Math.round((cm % 30.48) / 2.54);
      setHeightFt(ft.toString());
      setHeightInch(inch.toString());
    }
  }, [heightFt, heightInch, heightCm, heightUnit]);

  useEffect(() => {
    if (weightUnit === "kg" && weightKg) {
      const kg = parseInt(weightKg) || 0;
      const lbs = Math.round(kg * 2.20462);
      setWeightLbs(lbs.toString());
    } else if (weightUnit === "lbs" && weightLbs) {
      const lbs = parseInt(weightLbs) || 0;
      const kg = Math.round(lbs / 2.20462);
      setWeightKg(kg.toString());
    } else {
      setWeightKg("");
      setWeightLbs("");
    }
  }, [weightKg, weightLbs, weightUnit]);

  useEffect(() => {
    const formData = {
      heightFt,
      heightInch,
      heightCm,
      weightKg,
      weightLbs,
    };

    const existingUserData = JSON.parse(
      localStorage.getItem("userData") || "{}"
    );

    const updatedUserData = {
      ...existingUserData,
      heightWeight: formData,
    };

    localStorage.setItem("userData", JSON.stringify(updatedUserData));
    const parsedHeightFt = parseInt(heightFt);
    const parsedHeightInch = parseInt(heightInch);
    const parsedHeightCm = parseInt(heightCm);
    const parsedWeightKg = parseInt(weightKg);
    const parsedWeightLbs = parseInt(weightLbs);
    const isValidHeightRange =
      (heightUnit === "ft-in" &&
        ((parsedHeightFt >= 3 && parsedHeightFt <= 6) ||
          (parsedHeightFt === 6 && parsedHeightInch <= 11))) ||
      (heightUnit === "cm" && parsedHeightCm >= 100 && parsedHeightCm <= 210);
    setIsValidHeight(isValidHeightRange);
    const isValidWeightRange =
      (weightUnit === "kg" && parsedWeightKg >= 35 && parsedWeightKg <= 180) ||
      (weightUnit === "lbs" && parsedWeightLbs >= 77 && parsedWeightLbs <= 397);
    setIsValidWeight(isValidWeightRange);
    const isFormValid = isValidHeightRange && isValidWeightRange;

    setIsFormValid(isFormValid);
  }, [
    heightUnit,
    heightFt,
    heightInch,
    heightCm,
    weightUnit,
    weightKg,
    weightLbs,
    setIsFormValid,
  ]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-between">
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl xl:text-3xl mb-3 font-semibold transition-all duration-1000 ease-in-out transform animate-slide-in text-websecondary">
        {title}
      </h1>

      <div className="mt-2 px-5">
        {/* Height Section */}
        <div className="flex flex-col">
          <div className="flex items-center my-2 space-x-2">
            <Switch
              id="height-unit-switch"
              checked={isHeightChecked}
              onCheckedChange={handleHeightSwitchChange}
              style={{
                backgroundColor: isHeightChecked ? "#e8a034" : "#ff0b0b",
              }}
            />
            <Label
              htmlFor="height-unit-switch"
              className="ml-2 text-sm text-websecondary"
            >
              {isHeightChecked ? "CM" : "FT/INCH"}
            </Label>
          </div>
          {heightUnit === "ft-in" && (
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Feet"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                className="w-1/2 p-3 rounded-full"
              />
              <input
                type="number"
                placeholder="Inches"
                value={heightInch}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value === "" ||
                    (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 11)
                  ) {
                    setHeightInch(value);
                  }
                }}
                className="w-1/2 p-3 rounded-full"
                min="0"
                max="11"
                step="1"
              />
            </div>
          )}
          {heightUnit === "cm" && (
            <input
              type="number"
              placeholder="Centimeters"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full p-3 rounded-full"
            />
          )}
          {isValidHeight ? null : (
            <div className="text-red-500 text-sm mt-1 ml-1">
              Height should be between 100 and 210 cm or 3&apos;0&apos;&apos;
              and 6&apos;11&apos;&apos;.
            </div>
          )}
        </div>

        {/* Weight Section */}
        <div className="flex flex-col">
          <div className="flex items-center my-2 space-x-2">
            <Switch
              id="weight-unit-switch"
              checked={isWeightChecked}
              onCheckedChange={handleWeightSwitchChange}
              style={{
                backgroundColor: isWeightChecked ? "#e8a034" : "#ff0b0b",
              }}
            />
            <Label
              htmlFor="weight-unit-switch"
              className="ml-2 text-sm text-websecondary"
            >
              {isWeightChecked ? "LBS" : "KG"}
            </Label>
          </div>
          {weightUnit === "kg" && (
            <input
              type="number"
              placeholder="Kilograms"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full p-3 rounded-full"
            />
          )}
          {weightUnit === "lbs" && (
            <input
              type="number"
              placeholder="Pounds"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              className="w-full p-3 rounded-full"
            />
          )}
          {isValidWeight ? null : (
            <div className="text-red-500 text-sm mt-1 ml-1">
              Weight should be between 35 and 180 kg.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeightWeight;

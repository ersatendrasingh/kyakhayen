import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { userHeightWeight } from "@/schemas";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const userHeightWeight = z.object({
  heightFt: z.string().optional(),
  heightIn: z.string().optional(),
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),
  weightLbs: z.string().optional(),
});

const HeightAndWeight = () => {
  const router = useRouter();
  const user = useCurrentUser();
  const { update } = useSession();
  const form = useForm<z.infer<typeof userHeightWeight>>({
    resolver: zodResolver(userHeightWeight),
  });
  const { isSubmitting } = form.formState;

  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isValidHeight, setIsValidHeight] = useState(false);
  const [isValidWeight, setIsValidWeight] = useState(false);

  useEffect(() => {
    const defaultValues = {};

    if (user) {
      if (user.heightCm) {
        const totalInches = user.heightCm / 2.54;
        const ft = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        setHeightFt(ft.toString());
        setHeightIn(inches.toString());
        setHeightCm(user.heightCm.toString());
      }
      if (user.weightKg) {
        setWeightKg(user.weightKg.toString());
        setWeightLbs((user.weightKg * 2.20462).toFixed(0));
      }
    }
    const parsedHeightFt = parseInt(heightFt);
    const parsedHeightIn = parseInt(heightIn);
    const parsedHeightCm = parseInt(heightCm);
    const parsedWeightKg = parseInt(weightKg);
    const parsedWeightLbs = parseInt(weightLbs);

    const isValidHeightRange =
      (parsedHeightFt >= 3 &&
        parsedHeightFt <= 6 &&
        parsedHeightIn >= 0 &&
        parsedHeightIn <= 11) ||
      (parsedHeightCm >= 100 && parsedHeightCm <= 210);

    setIsValidHeight(isValidHeightRange);

    // Validate weight range
    const isValidWeightRange =
      (parsedWeightKg >= 35 && parsedWeightKg <= 180) ||
      (parsedWeightLbs >= 77 && parsedWeightLbs <= 397);

    setIsValidWeight(isValidWeightRange);

    const isFormValid = isValidHeightRange && isValidWeightRange;

    setIsFormValid(isFormValid);
    form.reset(defaultValues);
  }, [user, form, heightFt, heightIn, heightCm, weightKg, weightLbs]);

  const onSubmit = async (values: z.infer<typeof userHeightWeight>) => {
    try {
      const updatedValues = {
        heightFt: heightFt,
        heightInch: heightIn,
        heightCm: heightCm,
        weightKg: weightKg,
        weightLbs: weightLbs,
      };

      const response = await axios.patch(
        "/api/user/personalization/height-weight",
        updatedValues
      );
      if (response.status === 200) {
        update();
        router.push(`/user/profile/`);

        toast.success("Profile updated successfully", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch {
      toast.error("Something went wrong while updating profile", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleHeightFtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ft = e.target.value;
    setHeightFt(ft);
    if (ft && heightIn) {
      const cm = parseInt(ft) * 30.48 + parseInt(heightIn) * 2.54;
      setHeightCm(Math.round(cm).toString());
    } else if (ft) {
      const cm = parseInt(ft) * 30.48;
      setHeightCm(Math.round(cm).toString());
    } else {
      setHeightCm("");
    }
  };

  const handleHeightInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inches = e.target.value;
    if (inches === "" || (parseInt(inches) >= 0 && parseInt(inches) < 12)) {
      setHeightIn(inches);
      if (heightFt && inches) {
        const cm = parseInt(heightFt) * 30.48 + parseInt(inches) * 2.54;
        setHeightCm(Math.round(cm).toString());
      } else if (heightFt) {
        const cm = parseInt(heightFt) * 30.48;
        setHeightCm(Math.round(cm).toString());
      } else {
        setHeightCm("");
      }
    }
  };

  const handleHeightCmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cm = e.target.value;
    setHeightCm(cm);
    if (cm) {
      const totalInches = parseFloat(cm) / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      setHeightFt(ft.toString());
      setHeightIn(inches.toString());
    } else {
      setHeightFt("");
      setHeightIn("");
    }
  };

  const handleWeightKgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeightKg(e.target.value);
    if (e.target.value) {
      const lbs = parseFloat(e.target.value) * 2.20462;
      setWeightLbs(lbs.toFixed(0));
    } else {
      setWeightLbs("");
    }
  };

  const handleWeightLbsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeightLbs(e.target.value);
    if (e.target.value) {
      const kg = parseFloat(e.target.value) / 2.20462;
      setWeightKg(kg.toFixed(0));
    } else {
      setWeightKg("");
    }
  };

  if (!user) {
    return (
      <div className="space-y-8 mt-4 w-full">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-xl font-bold border-b-2 border-slate-200 pb-2 text-gray-700">
        Height & Weight
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8 mt-8 w-full">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormItem>
                <label className="block text-sm font-medium text-gray-700">
                  Height (ft & in)
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    step="1"
                    value={heightFt}
                    onChange={handleHeightFtChange}
                    disabled={isSubmitting}
                    placeholder="Feet"
                    className="w-full h-12 rounded-md"
                  />
                  <Input
                    type="number"
                    step="1"
                    value={heightIn}
                    onChange={handleHeightInChange}
                    disabled={isSubmitting}
                    placeholder="Inches"
                    className="w-full h-12 rounded-md"
                  />
                </div>
                {!isValidHeight && (
                  <div className="text-sm text-red-500 font-semibold">
                    Height should be 100 cm to 210 cm
                  </div>
                )}
              </FormItem>
              <FormItem>
                <label className="block text-sm font-medium text-gray-700">
                  Height (cm)
                </label>
                <Input
                  type="number"
                  step="1"
                  value={heightCm}
                  onChange={handleHeightCmChange}
                  disabled={isSubmitting}
                  placeholder="Centimeters"
                  className="w-full h-12 rounded-md"
                />
              </FormItem>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormItem>
                <label className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  step="1"
                  value={weightKg}
                  onChange={handleWeightKgChange}
                  disabled={isSubmitting}
                  placeholder="Kilograms"
                  className="w-full h-12 rounded-md"
                />
              </FormItem>
              <FormItem>
                <label className="block text-sm font-medium text-gray-700">
                  Weight (lbs)
                </label>
                <Input
                  type="number"
                  step="1"
                  value={weightLbs}
                  onChange={handleWeightLbsChange}
                  disabled={isSubmitting}
                  placeholder="Pounds"
                  className="w-full h-12 rounded-md"
                />
              </FormItem>
              {!isValidWeight && (
                <div className="text-sm text-red-500 font-semibold">
                  Weight should be 35 kg to 180 kg
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-x-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="pt-2 bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer"
              >
                Update
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default HeightAndWeight;

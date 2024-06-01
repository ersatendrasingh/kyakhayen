"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Skeleton } from "@/components/ui/skeleton";

import BmiGaugeChart from "../_components/bmi-gauge-chart";
import PrakritiInfoCard from "../_components/prakriti-info-card";
const prakritiTypes = ["Vata", "Pitta", "Kapha"] as const;
type PrakritiType = (typeof prakritiTypes)[number];

const isValidPrakriti = (value: any): value is PrakritiType => {
  return prakritiTypes.includes(value);
};
const UserBmiPage = () => {
  const user = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [bmi, setBmi] = useState<number | null>(null);
  const [prakriti, setPrakriti] = useState<PrakritiType | null>(null);

  useEffect(() => {
    if (user && !loading) {
      const userBmi = user.bmi ? parseFloat(user.bmi) : null;
      setBmi(userBmi);
      const userPrakriti = user.prakriti ? user.prakriti : null;
      if (isValidPrakriti(userPrakriti)) {
        setPrakriti(userPrakriti);
      }
    }

    setLoading(false);
  }, [user, loading]);

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-8 w-1/4" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm transition p-4">
      <h1 className="text-2xl md:text-3xl font-bold border-b-2 mb-4 border-slate-200 pb-2 text-gray-700">
        My Wellness Summary
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <h2 className="text-2xl text-center text-websecondary font-bold mb-4">
            Your BMI
          </h2>
          <div className=" pb-3 pl-1">
            {bmi !== null ? (
              <BmiGaugeChart bmi={bmi} />
            ) : (
              <p>Unable to fetch your BMI.</p>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl text-center text-websecondary font-bold mb-4">
            Your Prakriti
          </h2>
          <div>
            {prakriti ? (
              <PrakritiInfoCard prakriti={prakriti} />
            ) : (
              <p>Unable to fetch your Prakriti information.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBmiPage;

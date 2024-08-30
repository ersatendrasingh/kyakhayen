"use client";

import { useEffect, useState } from "react";
import { differenceInDays, isBefore, addDays } from "date-fns";
import Link from "next/link";
import { formatDateTime } from "@/lib/formateDateTime";

interface SubscriptionCardProps {
  subscription: string;
  planStartDate: Date;
  planEndDate: Date;
}

const SubscriptionCard = ({
  subscription,
  planStartDate,
  planEndDate,
}: SubscriptionCardProps) => {
  const [formattedStartDate, setFormattedStartDate] = useState<string>("");
  const [formattedEndDate, setFormattedEndDate] = useState<string>("");
  const [remainingDays, setRemainingDays] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (subscription) {
      const userLocale = navigator.language; // Get user's locale
      setFormattedStartDate(
        formatDateTime(new Date(planStartDate), userLocale)
      );
      setFormattedEndDate(
        planEndDate ? formatDateTime(new Date(planEndDate), userLocale) : "N/A"
      );
    }

    if (subscription && planEndDate) {
      const endDate = new Date(planEndDate);
      const now = new Date();
      const days = differenceInDays(endDate, now);

      if (isBefore(now, addDays(endDate, 1))) {
        setRemainingDays(
          `Expires in ${days + 1} day${days + 1 > 1 ? "s" : ""}`
        );
      } else {
        setRemainingDays(
          `Expired ${Math.abs(days)} day${Math.abs(days) > 1 ? "s" : ""} ago`
        );
      }
    } else {
      setRemainingDays("N/A");
    }

    setLoading(false); // Set loading to false once the data is loaded
  }, [subscription]);

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-lg sm:shadow-xl p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800">
          No Active Subscription
        </h2>
        <p className="text-gray-600 mt-2">
          You don't have an active subscription. Please choose a plan to
          continue enjoying our services.
        </p>
        <Link href="/subscription-plans#pricing">
          <button className="mt-4 bg-webprimary text-white py-2 px-4 rounded-md hover:bg-webprimary-dark">
            View Subscription Plans
          </button>
        </Link>
      </div>
    );
  }

  const status =
    planEndDate && new Date(planEndDate) > new Date() ? "Active" : "Expired";

  return (
    <div className="relative rounded-lg border border-gray-200 shadow-lg bg-amber-50 p-4 sm:p-6 mb-6">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="loader animate-spin border-t-4 border-webprimary rounded-full w-12 h-12"></div>
        </div>
      )}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        <h2 className="text-lg font-bold text-gray-800">
          {subscription} Subscription
        </h2>
        <p className="text-gray-600 mt-2 sm:mt-0">
          Status:{" "}
          <span
            className={`${
              status === "Active"
                ? "text-green-500"
                : status === "Expired"
                ? "text-red-500"
                : "text-gray-500"
            } font-bold`}
          >
            {status}
          </span>
        </p>
      </div>

      <div className={`mt-4 ${loading ? "opacity-0" : "opacity-100"}`}>
        <p className="text-gray-700 text-sm">
          <strong>Start Date:</strong> {formattedStartDate}
        </p>
        <p className="text-gray-700 text-sm">
          <strong>End Date:</strong> {formattedEndDate}
        </p>
        <p className="text-gray-700 text-sm">
          <strong>Remaining Days:</strong> {remainingDays}
        </p>
      </div>

      {subscription !== "Platinum" && status === "Active" && (
        <div
          className={`flex justify-center md:justify-end mt-4 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        >
          <Link href="/subscription-plans#pricing">
            <button className="bg-webprimary hover:bg-websecondary text-white py-2 px-4 rounded">
              Upgrade Your Plan
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;

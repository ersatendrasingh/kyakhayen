"use client";

import { getSubscriptionPlans } from "@/actions/get-subscription-plans";
import { useUserCountry } from "@/context/user-country-context";
import { Feature, Plan } from "@prisma/client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { Button } from "../ui/button";

type SubscriptionPlan = Plan & {
  features: Feature[];
};

const PricingTable = () => {
  const { userCurrency, userCountry } = useUserCountry();
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [loadingPlans, setLoadingPlans] = useState(true); // New loading state for plans

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true); // Set loading state before fetching
      const fetchedPlans = await getSubscriptionPlans(userCurrency);
      setSubscriptionPlans(fetchedPlans);
      setLoadingPlans(false); // Disable loading once fetched
    };

    fetchPlans();
  }, [userCurrency]);

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="relative bg-white shadow-md rounded-lg overflow-hidden animate-pulse flex flex-col justify-between min-h-full">
      <div className="px-6 py-8 flex flex-col items-center text-center flex-grow bg-gray-100">
        <div className="h-6 w-32 bg-gray-300 mb-4"></div>
        <div className="h-4 w-24 bg-gray-300 mb-2"></div>
        <div className="h-8 w-32 bg-gray-300 mb-6"></div>
        <ul className="space-y-3 flex-grow">
          {[...Array(4)].map((_, idx) => (
            <li key={idx} className="h-4 w-3/4 bg-gray-300 mx-auto"></li>
          ))}
        </ul>
        <div className="mt-6 w-full h-10 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="py-12 min-h-screen" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl text-websecondary mb-4">
            Future Membership Plans
          </h2>
          <p className="leading-loose tracking-wide text-lg">
            Coming later for advanced tools. Personalized weekly plans are
            currently free during launch.
          </p>
        </div>

        {/* Display skeleton if loading, otherwise show plans */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loadingPlans ? (
            [...Array(4)].map((_, idx) => <SkeletonCard key={idx} />)
          ) : subscriptionPlans.length > 0 ? (
            subscriptionPlans.map((plan) => {
              const regularPrice =
                userCountry !== "IN"
                  ? plan.regularPriceUsd
                  : plan.regularPriceInr;
              const actualPrice =
                userCountry !== "IN" ? plan.priceUsd : plan.priceInr;
              const savings = regularPrice! - actualPrice!;

              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.05 }}
                  className={`relative shadow-xl rounded-lg overflow-hidden transform transition-transform duration-300 flex flex-col justify-between min-h-full w-[95%] mx-auto 
                    ${
                      plan.name === "Bronze"
                        ? "bg-yellow-100"
                        : plan.name === "Gold"
                        ? "bg-blue-200"
                        : plan.name === "Silver"
                        ? "bg-purple-100"
                        : plan.name === "Platinum"
                        ? "bg-green-100"
                        : "bg-blue-100"
                    }`}
                >
                  {plan.name === "Gold" && (
                    <div className="absolute top-0 right-0 rounded-bl-lg bg-yellow-400 text-white px-2 py-1 font-bold text-sm z-10">
                      Most Popular
                    </div>
                  )}

                  <div className="bg-websecondary text-white pt-2 px-4 rounded-t-lg text-center">
                    <h3 className="text-lg mb-2">{plan.name}</h3>
                  </div>

                  <div className="px-4 py-8 flex flex-col items-center text-center flex-grow">
                    <p className="text-xl text-gray-500 line-through mb-1">
                      {userCurrency} {regularPrice}
                    </p>
                    <p className="text-lg text-green-600 font-semibold mb-4">
                      You Save {userCurrency} {savings.toFixed(2)}
                    </p>
                    <p className="text-3xl mb-4">
                      {userCurrency} {actualPrice}
                    </p>
                    <div className="mt-4 w-full">
                      <div className="bg-white text-black font-bold py-3 px-3 -mx-6">
                        {Math.floor(plan.durationDays! / 30)}{" "}
                        {Math.floor(plan.durationDays! / 30) > 1
                          ? "Months"
                          : "Month"}
                      </div>
                    </div>

                    <ul className="mt-4 space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-sm text-left"
                        >
                          <IoIosArrowDroprightCircle className="inline w-5 h-5 mr-2" />
                          {feature.name}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-8 w-full bg-websecondary hover:bg-black text-white py-3 rounded-lg transition-colors duration-300"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-center text-xl">
              No subscription plans available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingTable;

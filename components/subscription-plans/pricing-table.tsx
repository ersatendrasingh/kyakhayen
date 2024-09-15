"use client";

import { getSubscriptionPlans } from "@/actions/get-subscription-plans";
import { useCart } from "@/context/cart-context";
import { useUserCountry } from "@/context/user-country-context";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Feature, Plan } from "@prisma/client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoIosArrowDroprightCircle } from "react-icons/io";

type SubscriptionPlan = Plan & {
  features: Feature[];
};

const PricingTable = () => {
  const { userCurrency, userCountry } = useUserCountry();
  const user = useCurrentUser();
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [loadingPlans, setLoadingPlans] = useState(true); // New loading state for plans
  const { addToCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true); // Set loading state before fetching
      const fetchedPlans = await getSubscriptionPlans(userCurrency);
      setSubscriptionPlans(fetchedPlans);
      setLoadingPlans(false); // Disable loading once fetched
    };

    fetchPlans();
  }, [userCurrency]);

  const handleAddToCartAndCheckout = (plan: Plan & { features: Feature[] }) => {
    if (!user) {
      const encodedCallback = encodeURIComponent(pathname + "#pricing" || "");
      const encodedCallbackUrl = "/auth/login?callbackUrl=" + encodedCallback;
      return router.push(encodedCallbackUrl);
    }

    setLoadingCheckout(true); // Start showing loader

    try {
      const cartItem = {
        id: plan.id,
        name: plan.name,
        quantity: 1,
        priceInr: plan.priceInr,
        priceUsd: plan.priceUsd,
      };

      // Add to cart (assuming this function is async)
      addToCart(cartItem);

      // Redirect to checkout after adding to cart
      router.push("/checkout");
    } catch (error) {
      console.error("Error adding to cart or navigating to checkout", error);
      // Optionally handle error if needed
    } finally {
      setLoadingCheckout(false); // Stop showing loader after the process completes
    }
  };

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
    <div
      className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-12 min-h-screen"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            Subscription Plans
          </h2>
          <p className="mt-4 text-lg">Choose a plan that fits your needs.</p>
        </div>

        {/* Display skeleton if loading, otherwise show plans */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loadingPlans
            ? // Show 4 skeletons while loading
              [...Array(4)].map((_, index) => <SkeletonCard key={index} />)
            : subscriptionPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="relative bg-white shadow-md rounded-lg overflow-hidden transform transition-transform duration-300 flex flex-col justify-between min-h-full"
                >
                  {plan.name === "Gold" && (
                    <div className="absolute top-0 right-0 rounded-bl-md bg-red-500 text-white text-xs font-bold py-1 px-3 transform">
                      Most Popular
                    </div>
                  )}
                  <div
                    className={`px-6 py-8 flex flex-col items-center text-center flex-grow ${
                      plan.name === "Freemium"
                        ? "bg-blue-100"
                        : plan.name === "Bronze"
                        ? "bg-yellow-100"
                        : plan.name === "Silver"
                        ? "bg-gray-100"
                        : plan.name === "Gold"
                        ? "bg-yellow-200"
                        : "bg-purple-200"
                    }`}
                  >
                    <h3 className="text-4xl font-bold text-gray-800">
                      {plan.name}
                    </h3>
                    <div className="mt-4">
                      <p className="text-2xl text-gray-500 line-through">
                        {userCountry !== "IN"
                          ? `${userCurrency} ${plan.regularPriceUsd}`
                          : `${userCurrency} ${plan.regularPriceInr}`}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {userCountry !== "IN"
                          ? `${userCurrency} ${plan.priceUsd}`
                          : `${userCurrency} ${plan.priceInr}`}
                      </p>
                    </div>

                    <ul className="mt-6 space-y-3 flex-grow">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-black font-medium text-sm"
                        >
                          <IoIosArrowDroprightCircle className="inline w-3 h-3 mr-1" />
                          {feature.name}
                        </li>
                      ))}
                    </ul>
                    <button
                      className="mt-6 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                      onClick={() => handleAddToCartAndCheckout(plan)}
                    >
                      {loadingCheckout ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4 mr-2 inline-block" />
                          Processing...
                        </>
                      ) : (
                        "I want this"
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default PricingTable;

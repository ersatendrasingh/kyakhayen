"use client";

import { useCart } from "@/context/cart-context";
import { Feature, Plan } from "@prisma/client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { toast } from "react-toastify";

interface PricingTableProps {
  subscriptionPlans: (Plan & { features: Feature[] })[];
}

const PricingTable = ({ subscriptionPlans }: PricingTableProps) => {
  const { addToCart } = useCart(); // Access the addToCart function from the CartContext
  const router = useRouter(); // Initialize the router
  const [loading, setLoading] = useState(false);

  const handleAddToCartAndCheckout = (plan: Plan & { features: Feature[] }) => {
    setLoading(true);
    const cartItem = {
      id: plan.id,
      name: plan.name,
      quantity: 1,
      priceInr: plan.priceInr,
      priceUsd: plan.priceUsd,
    };
    addToCart(cartItem);
    toast.success("Item added to cart", {
      position: "top-center",
      autoClose: 5000,
    });
    setLoading(false);
    router.push("/checkout"); // Redirect to the checkout page
  };

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-6xl font-bold mb-4">Subscription Plans</h2>
          <p className="mt-4 text-lg">Choose a plan that fits your needs.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="relative bg-white shadow-md rounded-lg overflow-hidden transform transition-transform duration-300 flex flex-col justify-between min-h-full"
            >
              {plan.name === "Gold" && (
                <div className="absolute top-0 right-0 rounded-bl-md bg-red-500 text-white text-xs font-bold py-1 px-3 transform ">
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
                <p className="mt-4 text-3xl font-bold text-gray-900">
                  {plan.priceInr === 0 ? "Free" : `INR ${plan.priceInr}`}
                </p>
                <ul className="mt-6 space-y-3 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-black font-medium text-sm">
                      <IoIosArrowDroprightCircle className="inline w-3 h-3 mr-1" />
                      {feature.name}
                    </li>
                  ))}
                </ul>
                <button
                  className="mt-6 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  onClick={() => handleAddToCartAndCheckout(plan)}
                >
                  {loading
                    ? (
                        <Loader2 className="animate-spin w-2 h-2 mr-2 inline-block" />
                      ) + "Processing..."
                    : "I want this"}
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

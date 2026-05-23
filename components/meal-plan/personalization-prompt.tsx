"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/container";

const PersonalizationPrompt = () => {
  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center py-12">
      <Container>
        <div className="bg-white max-w-5xl mx-auto p-6 rounded-lg shadow-md flex flex-col lg:flex-row items-center text-center lg:text-left border border-gray-200">
          <div className="lg:w-1/2 lg:pr-8">
            <h1 className="text-2xl font-semibold mb-6">
              Personalize Your Meal Plan
            </h1>
            <p className="text-md mb-4 text-red-600 font-bold">
              Your personalization is incomplete. Complete it to unlock your
              personalized meal plan!
            </p>
            <p className="text-md mb-6">
              Personalization helps us create a meal plan tailored to your
              food preferences and kitchen routine. By completing
              your personalization, you will get:
            </p>
            <ul className="list-disc text-sm mb-6 text-left px-6">
              <li className="mb-2">
                Custom meal plans that suit your taste and schedule.
              </li>
              <li className="mb-2">
                Recommendations for new recipes that you&apos;ll love.
              </li>
              <li className="mb-2">
                Clear ingredient and recipe details while planning.
              </li>
              <li className="mb-2">
                Enhanced user experience with content relevant to you.
              </li>
            </ul>
            <Link
              href="/"
              className="bg-websecondary text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-webprimary transition duration-300"
            >
              Go to Personalization
            </Link>
          </div>
          <div className="mt-10 lg:mt-0 lg:w-1/2 lg:pl-8 flex justify-center">
            <Image
              src="/assets/images/macbook-app-download.webp"
              alt="Personalization"
              width={500}
              height={300}
              className="rounded"
            />
          </div>
        </div>
      </Container>
    </main>
  );
};

export default PersonalizationPrompt;

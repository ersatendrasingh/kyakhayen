import Image from "next/image";
import Link from "next/link";

const SubscriptionPlanPrompt = () => {
  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center py-12">
      <div className="bg-white max-w-5xl mx-auto p-6 rounded-lg shadow-md flex flex-col lg:flex-row items-center text-center lg:text-left border border-gray-200">
        <div className="lg:w-1/2 lg:pr-8">
          <h1 className="text-2xl font-semibold mb-6">
            No Active Subscription Plan
          </h1>
          <p className="text-md mb-4 text-red-600 font-bold">
            Unlock exclusive features and personalized meal plans by subscribing
            to one of our plans!
          </p>
          <p className="text-md mb-6">
            By subscribing, you will get access to:
          </p>
          <ul className="list-disc text-sm mb-6 text-left px-6">
            <li className="mb-2">
              Tailored meal plans that meet your dietary preferences and goals.
            </li>
            <li className="mb-2">Exclusive recipes and nutritional advice.</li>
            <li className="mb-2">Enhanced tracking and progress reports.</li>
            <li className="mb-2">
              Premium content designed specifically for your needs.
            </li>
          </ul>
          <Link
            href="/subscription-plans#pricing"
            className="bg-websecondary text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-webprimary transition duration-300"
          >
            View Subscription Plans
          </Link>
        </div>
        <div className="mt-10 lg:mt-0 lg:w-1/2 lg:pl-8 flex justify-center">
          <Image
            src="/assets/images/macbook-app-download.webp"
            alt="Subscription Plans"
            width={500}
            height={300}
            className="rounded"
          />
        </div>
      </div>
    </main>
  );
};

export default SubscriptionPlanPrompt;

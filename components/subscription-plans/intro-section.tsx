import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import Container from "../container";

const IntroSection = () => {
  return (
    <section className="py-16 md:pt-32 md:pb-12 bg-gradient-to-r from-red-500 to-orange-500">
      <Container>
        <div className="flex flex-col items-center justify-center text-white">
          <h2 className="text-6xl font-bold mb-4">
            Why Subscribe to Kya Khayen?
          </h2>
          <p className="text-lg mb-6">
            Discover the best way to plan your meals and achieve your dietary
            goals with our personalized meal plans. Our service tailors each
            meal to your unique preferences and nutritional needs, ensuring you
            enjoy delicious, healthy, and balanced meals every day. Sign up now
            to get started and take the first step towards a healthier
            lifestyle!
          </p>
          <Link href="/auth/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-[#1e1a16] hover:bg-websecondary text-white rounded-full"
            >
              Sign Up Now It&apos;s Free
            </Button>
          </Link>
          <Image
            src="/assets/images/meal-plan.webp"
            alt="Meal Plan"
            width={500}
            height={300}
            className="my-6 rounded"
          />
          <div className="text-left mb-6 w-full px-4">
            <h3 className="text-6xl text-center font-bold mb-10">
              What We Offer
            </h3>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 md:pr-4">
                <h4 className="text-lg font-bold mb-2">
                  Tailored to Your Needs
                </h4>
                <p className="text-md mb-4">
                  Our meal plans are customized to fit your dietary preferences
                  and nutritional needs. Whether you are looking to lose weight,
                  gain muscle, or simply eat healthier, we have a plan for you.
                </p>
                <h4 className="text-lg font-bold mb-2">
                  Delicious & Healthy Recipes
                </h4>
                <p className="text-md mb-4">
                  Enjoy a wide variety of delicious recipes that are both
                  nutritious and easy to prepare. Our recipes are designed to
                  keep your taste buds satisfied while supporting your health
                  goals.
                </p>
                <h4 className="text-lg font-bold mb-2">Enhance Your Health</h4>
                <p className="text-md mb-4">
                  Improve your overall health and wellness with our
                  comprehensive meal plans. From boosting your energy levels to
                  improving digestion, our plans are designed to help you feel
                  your best.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-4">
                <h4 className="text-lg font-bold mb-2">Track Your Progress</h4>
                <p className="text-md mb-4">
                  Easily track your dietary intake and monitor your progress.
                  Our tools help you stay on top of your nutritional goals and
                  make adjustments as needed.
                </p>
                <h4 className="text-lg font-bold mb-2">
                  Expert Recommendations
                </h4>
                <p className="text-md mb-4">
                  Receive expert tips and recommendations to enhance your diet
                  and lifestyle. Our team of nutritionists and dietitians
                  provide valuable insights to help you stay motivated and
                  informed.
                </p>
                <h4 className="text-lg font-bold mb-2">Affordable Plans</h4>
                <p className="text-md mb-4">
                  Access all these benefits at affordable prices. Our plans are
                  designed to fit your budget while providing exceptional value.
                </p>
              </div>
            </div>
          </div>
          <div className="text-left mb-6 w-full px-4">
            <h3 className="text-6xl text-center font-bold mb-10">
              How to Get Started
            </h3>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 md:pr-4">
                <h4 className="text-lg font-bold mb-2">Step 1: Sign Up</h4>
                <p className="text-md mb-4">
                  Start by creating an account with us. It&apos;s quick and
                  easy!
                </p>
                <h4 className="text-lg font-bold mb-2">
                  Step 2: Complete Personalization
                </h4>
                <p className="text-md mb-4">
                  Tell us your dietary preferences and goals. This helps us
                  create a personalized meal plan just for you.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-4">
                <h4 className="text-lg font-bold mb-2">
                  Step 3: Access Your Diet Plan
                </h4>
                <p className="text-md mb-4">
                  Once personalized, access your customized meal plan tailored
                  to fit your needs. Enjoy delicious meals that support your
                  health and fitness goals.
                </p>
                <h4 className="text-lg font-bold mb-2">
                  Step 4: Download Our App
                </h4>
                <p className="text-md mb-4">
                  Download our app to receive notifications, track your progress
                  on the go, and access additional features to enhance your meal
                  planning experience.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/auth/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-[#1e1a16] hover:bg-websecondary text-white rounded-full"
                >
                  Sign Up Now It&apos;s Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default IntroSection;

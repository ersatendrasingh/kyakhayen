import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import Container from "../container";

const IntroSection = () => {
  return (
    <section className="pt-16">
      <Container>
        <div className="flex flex-col items-center justify-center ">
          <h2 className="text-4xl text-center text-websecondary mb-8">
            Why Subscribe to Kya Khayen?
          </h2>
          <p className="text-lg text-center leading-loose tracking-wide mb-4">
            Achieve your health and fitness goals effectively with our
            algorithm-based, automatically generated personalized nutrition
            plans. We create personalized meal plans based on your taste,
            allergen, health goal and your body type. Whether you want to lose
            weight, gain muscle, or you want just eat a balanced diet, our diet
            plans make healthy eating easy and enjoyable. Become a member today
            and transform your life with delicious, nutritious meals designed
            just for you!
          </p>
          <Link href="#pricing">
            <Button
              variant="secondary"
              size="lg"
              className="bg-[#1e1a16] hover:bg-webprimary text-white rounded-full"
            >
              Join Now Today
            </Button>
          </Link>
          <Image
            src="/assets/images/meal-plan.webp"
            alt="weight loss meal programs"
            width={500}
            height={300}
            className="my-6 rounded"
          />
          <div className="w-full flex flex-col text-center md:text-left items-center justify-center py-10">
            <h3 className="text-4xl text-websecondary mb-8">What We Offer</h3>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 md:pr-4">
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Personalized Healthy Diet Plans
                </h4>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  We create custom meal plans specifically based on your dietary
                  preferences, health goals, allergies and body type. Whether
                  you're looking to lose weight, gain muscle, or improve your
                  overall health, our plans ensure every diet is both delicious
                  and nutritious.
                </p>

                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Real Time Progress Tracking
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Track your health and fitness history with our advanced real
                  time progress tracking tools. Easily monitor your weight
                  changes, calorie intake, and overall improvement.
                </p>
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Community Support
                </h4>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Become a member of our lively foodie community and share your
                  culinary explorations with like-minded peoples who share your
                  enthusiasm for healthy living.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-4">
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Delicious and Healthy Recipes Library
                </h4>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Explore our growing library of healthy and delicious recipes
                  that are easy to make. You can filter recipes by your dietary
                  needs, such as veg, non-veg, pescetarian, egg free, vegan,
                  gluten-free or high-protein meals.
                </p>
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Mobile App Integration
                </h4>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Access full functionality on the go with our easy-to-use PWA
                  Kya Khayen mobile app. Here you can get reminders, track your
                  progress, and stay connected to your plan on the go.
                </p>

                <h4 className="text-xl font-medium text-websecondary mb-2">
                  AI-Driven Delicious Recipes Recommendations
                </h4>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Our nutrition platform uses advanced AI to analyze your
                  progress and provide you usefull recommendations. You can also
                  get personalized meal plans recommendations such as what to
                  eat next.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col items-center justify-center text-center md:text-left py-10">
            <h5 className="text-4xl text-websecondary mb-8">
              How to Get Started
            </h5>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 md:pr-4">
                <h6 className="text-xl font-medium text-websecondary mb-2">
                  Step 1: Register With Us
                </h6>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Just Start your journey by creating an account on Kya Khayen.
                  It&apos;s quick and very easy!
                </p>
                <h6 className="text-xl font-medium text-websecondary mb-2">
                  Step 2: Buy a Subscription Plan
                </h6>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Choose a subscription plan that fits your needs to unlock your
                  customized meal plan and exclusive features.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-4">
                <h6 className="text-xl font-medium text-websecondary mb-2">
                  Step 3: Complete Your Personalization Questions
                </h6>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Let us know your nutrition preferences (food preferences,
                  allergen, cuisines and health goals) and body type. This helps
                  us to create a personalized meal plan for you.
                </p>
                <h6 className="text-xl font-medium text-websecondary mb-2">
                  Step 4: Access your Personalized Meal Plan and Enjoy
                </h6>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Once your personalization is complete, you can access your
                  personal meal plan, which is customized to your needs. Enjoy
                  delicious meals that are just for you support health and
                  fitness goals.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="#pricing">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-[#1e1a16] hover:bg-webprimary text-white rounded-full"
                >
                  Join Now Today
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

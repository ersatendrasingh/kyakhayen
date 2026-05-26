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
            Personalized Meal Planning, Free During Launch
          </h2>
          <p className="text-lg text-center leading-loose tracking-wide mb-4">
            Plan everyday cooking with personalized meal ideas based on your
            tastes, favourite cuisines, ingredient exclusions and cooking
            skills. Your seven-day personalized plan is included during our
            launch, while advanced membership tools are being prepared.
          </p>
          <Link href="/meal-plan/create">
            <Button
              variant="secondary"
              size="lg"
              className="bg-[#1e1a16] hover:bg-webprimary text-white rounded-full"
            >
              Create My Free Plan
            </Button>
          </Link>
          <Image
            src="/assets/images/meal-plan.webp"
            alt="personalized meal plans"
            width={500}
            height={300}
            className="my-6 rounded"
          />
          <div className="w-full flex flex-col text-center md:text-left items-center justify-center py-10">
            <h3 className="text-4xl text-websecondary mb-8">What We Offer</h3>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 md:pr-4">
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Personalized Meal Plans
                </h4>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  We create custom meal plans specifically based on your dietary
                  preferences, cuisines and ingredients you avoid. Our plans
                  keep recipe discovery practical, varied and delicious.
                </p>

                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Easy Planning Tools
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Save favourite ideas and organize meals through the week
                  with simple planning tools.
                </p>
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Community Support
                </h4>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Become a member of our lively foodie community and share your
                  culinary explorations with like-minded peoples who share your
                  enthusiasm for cooking.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-4">
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Delicious Recipes Library
                </h4>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Explore our growing library of delicious recipes
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
                  saved ideas, and stay connected to your plan on the go.
                </p>

                <h4 className="text-xl font-medium text-websecondary mb-2">
                  AI-Driven Delicious Recipes Recommendations
                </h4>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Our platform uses your recipe preferences to suggest ideas
                  you may enjoy and help answer what to cook next.
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
                  Step 1: Choose Your Preferences
                </h6>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Share your food style, cuisines, ingredient exclusions and
                  cooking comfort. We never ask medical questions.
                </p>
                <h6 className="text-xl font-medium text-websecondary mb-2">
                  Step 2: Sign In to Save Your Plan
                </h6>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Create an account once your choices are ready so your weekly
                  table can be saved and refreshed.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-4">
                <h6 className="text-xl font-medium text-websecondary mb-2">
                  Step 3: Receive Your Free 7-Day Plan
                </h6>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  We prepare practical meals around the preferences you chose,
                  with exclusions respected in recipe selection.
                </p>
                <h6 className="text-xl font-medium text-websecondary mb-2">
                  Step 4: Future Membership Features
                </h6>
                <p className="text-lg text-justify tracking-wide leading-loose mb-4">
                  Subscription options will later unlock additional planning
                  tools. The personalized weekly plan remains free at launch.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/meal-plan/create">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-[#1e1a16] hover:bg-webprimary text-white rounded-full"
                >
                  Create My Free Plan
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

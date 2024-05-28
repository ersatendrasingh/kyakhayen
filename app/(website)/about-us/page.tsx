import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";

const meta = {
  title:
    "About Us - Kya Khayen? | Your Ultimate Recipe and Meal Planning Platform",
  description:
    "Learn more about Kya Khayen?, your personalized cooking assistant. Discover our mission, features, and how we help you find the perfect recipes and meal plans tailored to your preferences.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/assets/images/about-us.webp`,
  keywords: [
    "Kya Khayen?",
    "about us",
    "recipe platform",
    "meal planning",
    "personalized recipes",
    "cooking assistant",
    "health goals recipes",
    "customized meal plans",
    "indian cuisines",
  ],
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/about-us`,
    type: "website",
    images: [
      {
        url: meta.image,
      },
    ],
  },
  twitter: {
    title: meta.title,
    description: meta.description,
    images: [meta.image],
    card: "summary_large_image",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/about-us`,
  },
};

const AboutUsPage = () => {
  return (
    <div>
      <section className="py-16 md:pt-32 md:pb-0 bg-gradient-to-r from-red-500 to-orange-500">
        <Container>
          <div className="flex flex-col items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-8xl font-bold text-white mb-8">
                About Kya Khayen?
              </h1>
              <p className="text-md md:text-3xl text-white mb-8">
                Welcome to Kya Khayen?, your ultimate recipe and meal planning
                platform. Our mission is to simplify your cooking experience and
                help you discover delicious recipes tailored to your preferences
                and health goals.
              </p>
              <Link href="/download-app">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-[#1e1a16] hover:bg-websecondary text-white rounded-full"
                >
                  Download Our App
                </Button>
              </Link>
            </div>
            <div className="flex md:flex-row items-center justify-center mt-10">
              <Image
                src="/assets/images/about-us.webp"
                alt="About Us Image"
                width={700}
                height={500}
                className="rounded-lg"
              />
            </div>
          </div>
        </Container>
      </section>
      <section className="py-10 md:py-10 bg-gradient-to-r from-red-500 to-orange-500">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 text-white text-center md:text-left">
              <h2 className="text-4xl md:text-8xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-lg mb-4 mr-4">
                At Kya Khayen?, we aim to transform your home cooking experience
                by providing personalized recipe recommendations and meal plans
                that suit your unique preferences and dietary needs. We believe
                that cooking should be enjoyable, accessible, and tailored to
                your lifestyle.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start md:flex-row">
              <div className="flex mb-4 md:mb-0 md:mr-4">
                <Image
                  src="/assets/images/our-mission.webp"
                  alt="Our Mission Image"
                  width={800}
                  height={600}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-10">
            <Link href="/meal-plan">
              <Button
                variant="secondary"
                size="lg"
                className="bg-[#1e1a16] hover:bg-websecondary text-white rounded-full"
              >
                Start Planning Your Meals
              </Button>
            </Link>
          </div>
        </Container>
      </section>
      <section
        className="py-16 bg-gradient-to-r from-red-500 to-orange-500"
        id="our-features"
      >
        <Container>
          <div className="flex flex-col items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-4xl text-left md:text-center md:text-8xl font-bold mb-8">
                Our Features
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center text-xl">
                <div className="mb-8 md:mb-0 md:mr-8">
                  <h3 className="text-4xl font-bold text-left mb-4">
                    Personalized Recipes
                  </h3>
                  <p className="text-lg text-left mb-4">
                    Get personalized recipe recommendations based on your taste
                    preferences, dietary restrictions, and cooking skills. Our
                    platform offers a wide variety of Indian cuisines, healthy
                    recipes, and more.
                  </p>
                </div>
                <div className="mb-8 md:mb-0 md:mr-8">
                  <h3 className="text-4xl font-bold text-left mb-4">
                    Meal Planning
                  </h3>
                  <p className="text-lg text-left mb-4">
                    Plan your meals effortlessly with our customizable meal
                    planning features. Set your health goals, choose your
                    favorite cuisines, and receive a tailored meal plan that
                    fits your lifestyle.
                  </p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-left mb-4">
                    Cooking Assistance
                  </h3>
                  <p className="text-lg text-left mb-4">
                    Enhance your cooking skills with step-by-step instructions,
                    video tutorials, and expert tips. Whether you&apos;re a
                    beginner or an experienced cook, Kya Khayen? provides the
                    guidance you need to prepare delicious meals with
                    confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default AboutUsPage;

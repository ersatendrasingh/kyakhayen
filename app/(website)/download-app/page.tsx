import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";

const meta = {
  title:
    "Download Kya Khayen? - Your Personalized Cooking Assistant | PWA App for Android & iOS",
  description:
    "Download Kya Khayen?, the ultimate personalized cooking assistant. Discover a wide range of cuisines, customize your meal plans based on your preferences, and enhance your cooking skills.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/assets/images/mobile-mealplan.webp`,
  keywords: [
    "Kya Khayen?",
    "cooking assistant",
    "personalized meal plan",
    "PWA app",
    "indian cuisines",
    "health goals recipes",
    "customized meal plans",
  ],
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/download-app`,

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
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/recipes`,
  },
};
const DownloadApp = () => {
  return (
    <div>
      <section className="py-16 md:pt-32 md:pb-0 bg-gradient-to-r from-red-500 to-orange-500">
        <Container>
          <div className="flex flex-col items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-8xl font-bold text-white mb-8">
                Your Personalized Cooking Assistant
              </h1>
              <p className="text-md md:text-3xl text-white mb-8">
                Discover culinary delights with Kya Khayen?. Get your ultimate
                mealtime companion. From personalized recipe recommendations to
                seamless organization and meal planning, Kya Khayen? simplifies
                the joy of home cooking.
              </p>
              <Link href="#how-to-download">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-[#1e1a16] hover:bg-websecondary text-white rounded-full"
                >
                  Join Kya Khayen? Now
                </Button>
              </Link>
            </div>
            <div className="flex md:flex-row items-center justify-center mt-10">
              <Image
                src="/assets/images/macbook-mealplan.webp"
                alt="Macbook Download Image"
                width={400}
                height={400}
                className="w-72 h-52 md:w-96 md:h-96 mb-4 md:mb-0"
              />
              <Image
                src="/assets/images/mobile-app-download.webp"
                alt="Mobile Download Image"
                width={200}
                height={300}
                className="w-32 h-40 md:w-48 md:h-80  "
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
                Customize Your Meal Plan
              </h2>
              <ul>
                <li className="flex text-left items-center mb-4">
                  <span className="text-md md:text-4xl mr-4">&#8594;</span>
                  <span className="text-lg">
                    <strong>Customize Your Preferences:</strong> Choose from a
                    wide range of cuisines, select any allergies you have, and
                    set your health goals.
                  </span>
                </li>
                <li className="flex text-left items-center mb-4">
                  <span className="text-md md:text-4xl mr-4">&#8594;</span>
                  <span className="text-lg">
                    <strong>Personalize Your Profile:</strong> Provide details
                    such as your date of birth, BMI, and body type to receive a
                    personalized meal plan tailored just for you.
                  </span>
                </li>
                <li className="flex text-left items-center mb-4">
                  <span className="text-md md:text-4xl mr-4">&#8594;</span>
                  <span className="text-lg">
                    <strong>Enhance Your Cooking Skills:</strong> Tailor your
                    meal plan based on your cooking expertise and desired
                    difficulty level.
                  </span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-start md:flex-row">
              <div className="hidden md:flex mb-4 md:mb-0 md:mr-4">
                <Image
                  src="/assets/images/smoothie.png"
                  alt="Left Image 1"
                  width={400}
                  height={450}
                  className="w-64 h-64 md:w-80 md:h-80"
                />
              </div>
              <div>
                <Image
                  src="/assets/images/mobile-mealplan.webp"
                  alt="Left Image 2"
                  width={200}
                  height={300}
                  className="w-32 h-52 md:w-48 md:h-96"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-5">
            <Link href="/meal-plan">
              <Button
                variant="secondary"
                size="lg"
                className="bg-[#1e1a16] hover:bg-websecondary text-white rounded-full"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </Container>
      </section>
      <section
        className="py-16 md:py-32 bg-gradient-to-r from-red-500 to-orange-500"
        id="how-to-download"
      >
        <Container>
          <div className="flex flex-col items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-4xl md:text-8xl font-bold mb-8">
                How To Download Our App
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center text-xl">
                <div className="mb-8 md:mb-0 md:mr-8">
                  <h3 className="text-4xl font-bold text-left mb-4">
                    For Android
                  </h3>
                  <p className="text-lg text-left mb-4">
                    Follow these simple steps to download our app on your
                    Android device:
                  </p>
                  <ol className="list-decimal text-left">
                    <li className="flex items-center text-left mb-4">
                      <span className="text-md md:text-4xl mr-4">&#8594;</span>
                      <span className="text-lg">Open your mobile browser.</span>
                    </li>
                    <li className="flex items-center text-left mb-4">
                      <span className="text-md md:text-4xl mr-4">&#8594;</span>
                      <span className="text-lg">
                        Visit our website &quot;www.kyakhayen.com&quot;.
                      </span>
                    </li>
                    <li className="flex items-center text-left mb-4">
                      <span className="text-md md:text-4xl mr-4">&#8594;</span>
                      <span className="text-lg">
                        Look for the option menu in the browser.
                      </span>
                    </li>
                    <li className="flex items-center text-left mb-4">
                      <span className="text-md md:text-4xl mr-4">&#8594;</span>
                      <span className="text-lg">
                        Tap on &quot;Install App&quot; and confirm.
                      </span>
                    </li>
                    <li className="flex items-center text-left mb-4">
                      <span className="text-md md:text-4xl mr-4">&#8594;</span>
                      <span className="text-lg">
                        Once added, you&apos;ll find our app icon on your home
                        screen. Tap to open!
                      </span>
                    </li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-left mb-4">For iOS</h3>
                  <p className="text-lg text-left mb-4">
                    Downloading our app on your iOS device is quick and easy.
                    Just follow these steps:
                  </p>
                  <ol className="list-decimal text-left ">
                    <li className="flex text-left items-center mb-4">
                      <span className="text-md md:text-4xl mr-4">&#8594;</span>
                      <span className="text-lg">Open your mobile browser.</span>
                    </li>
                    <li className="flex text-left items-center mb-4">
                      <span className="text-md md:text-4xl mr-4">&#8594;</span>
                      <span className="text-lg">
                        Visit our website &quot;www.kyakhayen.com&quot;.
                      </span>
                    </li>
                    <li className="flex text-left items-center mb-4">
                      <span className="text-md md:text-4xl mr-4">&#8594;</span>
                      <span className="text-lg">
                        Look for the &quot;Add to Home Screen&quot; option in
                        the browser menu.
                      </span>
                    </li>
                    <li className="flex text-left items-center mb-4">
                      <span className="text-md md:text-4xl mr-4">&#8594;</span>
                      <span className="text-lg">
                        Tap on &quot;Add to Home Screen&quot; and confirm.
                      </span>
                    </li>
                    <li className="flex text-left items-center mb-4">
                      <span className="text-md md:text-4xl mr-4">&#8594;</span>
                      <span className="text-lg">
                        Once added, you&apos;ll find our app icon on your home
                        screen. Tap to open!
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default DownloadApp;

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";

const meta = {
  title: "About Us - Kya Khayen | Recipe and Meal Planning",
  description:
    "Find easy dinner recipes, snack ideas and practical meal planning inspiration for your kitchen.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/about-us.png`,
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/about-us`,
    type: "website",
    images: [
      {
        url: meta.image,
        width: 1200,
        height: 630,
        alt: meta.title,
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
      <PageTitle title="About Us" className="py-6 " />
      <section className="py-16 md:pb-0 ">
        <Container>
          <div className="flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-lg leading-loose tracking-wide mb-8">
                Welcome to Kya Khayen?, your personalized meal planning partner
                for discovering everyday recipes and organizing your cooking
                routine. Whether you want a 7-day meal plan or simply a new
                dinner idea, we have got you covered.
              </p>
            </div>
          </div>
        </Container>
      </section>
      <section className="py-10 md:py-10 ">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col items-center md:items-start md:flex-row">
              <div className="flex mb-4 md:mb-0 md:mr-4">
                <Image
                  src="/assets/images/about-us.webp"
                  alt="weekly meal ideas"
                  width={600}
                  height={400}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-4xl text-websecondary mb-8">Who We Are</h2>
              <p className="text-lg text-justify leading-loose tracking-wide mb-4 mr-4">
                We believe home cooking does not have to be boring or
                complicated. Here we use recipe recommendations and practical
                planning tools to create meal ideas that align with your food
                preferences, cuisines and ingredient exclusions.
              </p>
            </div>
          </div>
        </Container>
      </section>
      <section className="py-10 md:py-10 ">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-4xl text-websecondary mb-8">Our Mission</h2>
              <p className="text-lg text-justify leading-loose tracking-wide mb-4 mr-4">
                Our mission is to help you to transform your home cooking
                experience by providing personalized recipe recommendations and
                meal plans according to your food preferences, cuisines and
                ingredient exclusions. We believe that everyone deserves meals
                that suit their kitchen and routine. That is why we provide a
                variety of recipes that are both easy to prepare and delicious.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start md:flex-row">
              <div className="flex mb-4 md:mb-0 md:mr-4">
                <Image
                  src="/assets/images/our-mission.webp"
                  alt="personalized meal planning"
                  width={800}
                  height={600}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>{" "}
      <section className="py-16 " id="our-features">
        <Container>
          <div className="flex flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl text-websecondary mb-8">
                Join Us on This Journey
              </h2>
              <p className="text-lg leading-loose tracking-wide mb-8">
                Start your healthy journey with Kya Khayen? today and take the
                first step toward a healthier, happier lifestyle. Join our
                membership and unlock a world of personalized recipes,
                recommendations and healthy meal plans.
              </p>
              <div className="flex justify-center mt-10">
                <Link href="/auth/register">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-[#1e1a16] hover:bg-websecondary text-white rounded-full"
                  >
                    Join Now Kya Khayen?
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default AboutUsPage;

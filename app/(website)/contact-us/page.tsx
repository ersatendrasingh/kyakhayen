import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/contact/contact-form";
import { FAQ } from "@/components/contact/faqs";
import { PageTitle } from "@/components/page-title";

const meta = {
  title:
    "Contact Us - Kya Khayen? | Healthy Recipes and Meal Plans for Weight Loss",
  description:
    "Have any questions about our personalized meal plans, diet charts or healthy recipes? Contact Kya Khayen today. We're here to assist you on your weight loss journey.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/contact-us.png`,
  keywords: [
    "meal plan for weight loss female",
    "best diet plan for weight loss",
    "healthy meal plans for weight loss",
    "best diet plan for weight loss for female",
    "best diet to lose weight quickly",
    "low calorie meal plan",
    "diet chart for weight loss",
    "nutrition plan for weight loss",
    "healthy diet plan for weight loss",
    "diet plan for weight loss for female",
  ],
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/contact-us`,
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
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/contact-us`,
  },
};

const ContactUsPage = () => {
  return (
    <div>
      <PageTitle title="Contact Us" className="py-6" />
      <section className="py-10 bg-gray-50">
        <Container>
          <div className="flex flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl text-websecondary mb-8">
                Don't be a stranger! Simple send us a message
              </h2>
            </div>
          </div>
        </Container>
      </section>
      <section className="bg-gray-50 pb-10">
        <Container>
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-5xl mx-auto ">
            <div className="w-full ">
              <p className="text-sm font-bold bg-rose-200 text-rose-700 px-3 py-2 mb-3 rounded-full inline-block">
                Have a question or feedback for us?
              </p>
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-10 bg-gray-50">
        <Container>
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 md:mr-5">
              <h3 className="text-4xl text-websecondary mb-4 text-left">
                Discover Our App
              </h3>
              <p className="text-lg leading-loose tracking-wide mb-4">
                Download our Kya Khayen? mobile app and unlock the power of our
                personalized meal plans customized to your food preferences,
                allergies, body type and health goals. You can explore a highly
                variety of Indian and international recipes for cooking and meal
                planning. Our PWA app is available on both Android and iOS
                devices.
              </p>
              <p className="text-lg  leading-loose tracking-wide mb-4">
                With our app, you can:
              </p>
              <ul className="text-lg list-disc list-inside mb-4">
                <li className="text-lg leading-loose tracking-wide mb-2">
                  Access your personalized meal plans and recipes.
                </li>
                <li className="text-lg leading-loose tracking-wide mb-2">
                  Explore a wide range of Indian and international recipes with
                  their nutritional values.
                </li>
                <li className="text-lg leading-loose tracking-wide mb-2">
                  You can save your favorite recipes for future reference.
                </li>
                <li className="text-lg leading-loose tracking-wide mb-2">
                  You can track your progress and nutrition goals.
                </li>
                <li className="text-lg leading-loose tracking-wide mb-2">
                  You can share your recipes and meal plans with your friends.
                </li>
              </ul>
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
            <div className="w-full md:w-1/2 mt-5 md:mt-0">
              <h4 className="text-4xl text-websecondary mb-4 text-left">
                FAQs
              </h4>
              <FAQ />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ContactUsPage;

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/contact/contact-form";
import { FAQ } from "@/components/contact/faqs";

const meta = {
  title:
    "Contact Us - Kya Khayen? | Your Ultimate Recipe and Meal Planning Platform",
  description:
    "Learn more about Kya Khayen?, your personalized cooking assistant. Discover our mission, features, and how we help you find the perfect recipes and meal plans tailored to your preferences.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/assets/images/contact-us.webp`,
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
      <section className="py-16 md:pt-12 md:pb-0 bg-gradient-to-r from-red-500 to-orange-500">
        <Container>
          <div className="flex flex-col items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-8xl font-bold text-white mb-8">
                Contact Us
              </h1>
              <p className="text-md md:text-3xl text-white mb-8">
                We love hearing from our users! Whether you have a question
                about our recipes, feedback on our platform, or need support,
                our team is here to help. Fill out the form below, and
                we&apos;ll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </Container>
      </section>
      <section className="pt-10 bg-gradient-to-b from-neutral-100 via-red-100 to-red-200">
        <Container>
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="w-full md:w-3/5 md:pt-10">
              <p className="text-sm font-bold bg-rose-200 text-rose-700 px-3 py-2 mb-3 rounded-full inline-block">
                Have a question or feedback for us?
              </p>
              <ContactForm />
            </div>
            <div className="w-full md:w-2/5 flex justify-center">
              <div className="max-w-[450px] mx-auto">
                <Image
                  src="/assets/images/contact-us-kyakhayen.png"
                  alt="Contact Us Image"
                  width={450}
                  height={650}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-10 bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <Container>
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 md:mr-5">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-left">
                Discover Our App
              </h2>
              <p className="text-lg mb-4">
                Download the Kya Khayen? app and get personalized meal plans
                tailored to your preferences and health goals. Enjoy a wide
                variety of recipes and meal planning tools designed to make your
                cooking experience delightful and hassle-free.
              </p>
              <p className="text-lg mb-4">With our app, you can:</p>
              <ul className="text-lg list-disc list-inside mb-4">
                <li>
                  Receive customized meal plans based on your dietary
                  preferences
                </li>
                <li>
                  Explore a vast collection of Indian and international recipes
                </li>
                <li>Save your favorite recipes for easy access</li>
                <li>Get step-by-step cooking instructions</li>
                <li>Track your health goals with nutritious recipes</li>
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
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-left">
                FAQs
              </h2>
              <FAQ />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ContactUsPage;

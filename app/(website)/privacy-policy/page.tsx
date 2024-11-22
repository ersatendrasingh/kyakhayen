import { Metadata } from "next";
import React from "react";
import Container from "@/components/container";
import { PageTitle } from "@/components/page-title";

const meta = {
  title: "Privacy Policy - Kya Khayen | free dietary plans for weight loss",
  description:
    "Discover low-carb meal plans, intermittent fasting diets, and 7-day weight loss plans. Explore healthy recipes, breakfast ideas, and easy dinner recipes.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/privacy-policy.png`,
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
    url: `${process.env.NEXT_PUBLIC_APP_URL}/privacy-policy`,
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
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/privacy-policy`,
  },
};

const PrivacyPolicyPage = () => {
  return (
    <div>
      <PageTitle title="Privacy Policy" className="py-6" />
      <section className="py-10 ">
        <Container>
          <div className="w-full text-center">
            <h2 className="text-2xl mb-4">
              This Privacy Policy explains how Kya Khayen? collects, uses, and
              protects your personal information.
            </h2>
            <p className="text-sm text-websecondary ml-4">
              Last updated: November 15, 2024
            </p>
          </div>
          <div className="w-full py-10">
            <h3 className="text-xl font-medium text-websecondary mb-2">
              1. Information We Collect
            </h3>
            <p className="text-lg text-justify tracking-wide leading-loose mb-4">
              We collect various types of information in connection with the
              services we are provide, including:
            </p>
            <ul className="list-disc pl-8 mb-4">
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Personal Information:</strong> Name, email address,
                phone number, date of birth, and other contact details like your
                address country, state, city and zip code.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Usage Data:</strong> Information about how you use our
                kya khayen mobile app, such as visit history, search queries and
                the reviews and ratings of recipes you give us.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Device Information:</strong> Information about the
                device like the type of device and the operating system you use
                to access our services.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Location Information:</strong> Approximate geographic
                your location, such as your IP address.
              </li>
            </ul>
            <h4 className="text-xl font-medium text-websecondary mb-4">
              2. How We Use Your Information
            </h4>
            <p className="text-lg text-justify tracking-wide leading-loose mb-4">
              We use your provided information for the following purposes:
            </p>
            <ul className="list-disc pl-8 mb-4">
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Personalized Experience: </strong> Personalizing your
                experience and providing you a customized and personalized meal
                plan content.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Customer Support: </strong>To respond to your enquiries,
                reviews, and comments promptly and effectively.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Service Improvement: </strong>To improve our services,
                features, and user experience. we monitor and analyze usage data
                to understand how users interact with our services.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Notifications and Updates: </strong>To Sending you
                technical notices, any updates, security alerts, and support
                messages.
              </li>
            </ul>
            <h4 className="text-xl font-medium text-websecondary mb-4">
              3. How We Share Your Information
            </h4>
            <p className="text-lg text-justify tracking-wide leading-loose mb-4">
              We value your privacy and are committed to protecting your
              personal information. We do not share your personal data with any
              third parties, except in the following situations:
            </p>
            <ul className="list-disc pl-8 mb-4">
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>With Your Consent:</strong> When you give explicit
                consent or direct us to share your information.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Legal Obligations:</strong>
                To comply with applicable laws, regulations, or any lawful
                requests from public authorities.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Protection of Rights: </strong>
                To enforce our safegaurd our rights, terms of service, privacy,
                safety or property, and to protect you or others from harm.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Business Transactions:</strong>
                In relation to a business transactions that involves the
                transfer of personal information, such as a merger, acquisition,
                asset sale, or other comparable arrangement.
              </li>
            </ul>
            <h4 className="text-xl font-medium text-websecondary mb-4">
              4. Your Rights and Choices
            </h4>
            <p className="text-lg text-justify tracking-wide leading-loose mb-4">
              Regarding your personal data we gather and how we use it, you have
              a number of rights. Among these rights are:
            </p>
            <ul className="list-disc pl-8 mb-4">
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Access and Updates:</strong>
                Having the opportunity to view, update or remove your personal
                data.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Promotional Communications: </strong>
                The choice to not receive emails, SMS, push notifications or
                other communications from us that are promotional in nature.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Data Processing:</strong>
                In some cases, you have the right to limit or object to how your
                personal information is processed.
              </li>
              <li className="text-lg text-justify tracking-wide leading-loose mb-2">
                <strong>Data Portability:</strong>
                The opportunity to request a copy of your personal information
                in a machine readable format.
              </li>
            </ul>
            <h4 className="text-xl font-medium text-websecondary mb-4">
              5. Data Security
            </h4>
            <p className="text-lg text-justify tracking-wide leading-loose mb-4">
              We take the responsibility of ensuring the security of your
              personal information and have implemented a variety of measures to
              protect it from unauthorized access, disclosure, alteration, or
              destruction.
            </p>
            <p className="text-lg text-justify tracking-wide leading-loose mb-4">
              These safeguards consist of safe approaches, access controls, and
              encryption. Nevertheless, there is no totally safe way to store
              data electronically or send it over the internet. Although we make
              every effort to protect your data using commercially acceptable
              methods, we are unable to provide a guranteed level of security.
            </p>
            <h5 className="text-xl font-medium text-websecondary mb-4">
              6. Changes to This Privacy Policy
            </h5>
            <p className="text-lg text-justify tracking-wide leading-loose mb-4">
              This Privacy Policy may be updated from time to time to reflect
              modifications to our procedures, offerings, or regulatory
              requirements. The "Last Updated" date will be updated in top of
              the page to reflect the last time this Privacy Policy was updated.
            </p>
            <h6 className="text-xl font-medium text-websecondary mb-4">
              7. Contact Us
            </h6>
            <p className="text-lg text-justify tracking-wide leading-loose mb-4">
              If you have any questions about this privacy policy, please
              contact us at:
            </p>
            <p className="text-lg text-justify tracking-wide leading-loose mb-4">
              Email:{" "}
              <a href="mailto:mailtokyakhayen@gmail.com">
                mailtokyakhayen@gmail.com
              </a>
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;

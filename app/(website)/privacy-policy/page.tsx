import { Metadata } from "next";
import Link from "next/link";
import React from "react";
import Container from "@/components/container";

const meta = {
  title: "Privacy Policy - Kya Khayen?",
  description:
    "Read the privacy policy of Kya Khayen? to understand how we collect, use, and protect your personal information when you use our services.",
  keywords: [
    "Kya Khayen?",
    "privacy policy",
    "data protection",
    "personal information",
    "user privacy",
    "data collection",
    "cookies",
  ],
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/privacy-policy`,
    type: "website",
  },
  twitter: {
    title: meta.title,
    description: meta.description,
    card: "summary",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/privacy-policy`,
  },
};

const PrivacyPolicyPage = () => {
  return (
    <div>
      <section className="py-16 md:py-32 bg-gradient-to-r from-red-500 to-orange-500">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-8xl font-bold text-white mb-8">
              Privacy Policy
            </h1>
            <p className="text-md md:text-3xl text-white mb-8">
              This Privacy Policy explains how Kya Khayen? collects, uses, and
              protects your personal information. By using our services, you
              agree to the terms outlined in this policy.
            </p>
          </div>
        </Container>
      </section>
      <section className="py-10 md:py-16 bg-white">
        <Container>
          <div className="text-left">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              We collect various types of information in connection with the
              services we provide, including:
            </p>
            <ul className="list-disc pl-8 mb-4">
              <li className="mb-2">
                <strong>Personal Information:</strong> Name, email address, date
                of birth, and other contact details.
              </li>
              <li className="mb-2">
                <strong>Usage Data:</strong> Information about how you use our
                app, such as the recipes you view and the features you use.
              </li>
              <li className="mb-2">
                <strong>Device Information:</strong> Information about the
                device you use to access our services, including the type of
                device, operating system, and browser.
              </li>
              <li className="mb-2">
                <strong>Location Information:</strong> Approximate location
                information, such as your IP address.
              </li>
            </ul>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">
              We use the information we collect to provide, maintain, and
              improve our services, including:
            </p>
            <ul className="list-disc pl-8 mb-4">
              <li className="mb-2">
                Personalizing your experience and providing you with customized
                content.
              </li>
              <li className="mb-2">
                Responding to your comments, questions, and requests.
              </li>
              <li className="mb-2">
                Monitoring and analyzing usage and trends to improve our
                services.
              </li>
              <li className="mb-2">
                Sending you technical notices, updates, security alerts, and
                support messages.
              </li>
            </ul>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              3. How We Share Your Information
            </h2>
            <p className="mb-4">
              We do not share your personal information with third parties
              except in the following circumstances:
            </p>
            <ul className="list-disc pl-8 mb-4">
              <li className="mb-2">With your consent or at your direction.</li>
              <li className="mb-2">
                To comply with legal obligations or respond to lawful requests
                by public authorities.
              </li>
              <li className="mb-2">
                To enforce our terms of service, protect our rights, privacy,
                safety, or property, and/or that of you or others.
              </li>
              <li className="mb-2">
                In connection with a merger, sale, or other asset transfer.
              </li>
            </ul>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              4. Your Rights and Choices
            </h2>
            <p className="mb-4">
              You have certain rights regarding the personal information we
              collect from you, including:
            </p>
            <ul className="list-disc pl-8 mb-4">
              <li className="mb-2">
                Accessing, updating, or deleting your personal information.
              </li>
              <li className="mb-2">
                Opting out of receiving promotional communications from us.
              </li>
              <li className="mb-2">
                Restricting or objecting to the processing of your information.
              </li>
              <li className="mb-2">
                Requesting a copy of your personal data in a machine-readable
                format.
              </li>
            </ul>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              5. Data Security
            </h2>
            <p className="mb-4">
              We implement a variety of security measures to ensure the safety
              of your personal information. However, no method of transmission
              over the internet or electronic storage is 100% secure, so we
              cannot guarantee its absolute security.
            </p>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              6. Changes to This Privacy Policy
            </h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new privacy policy on
              this page. You are advised to review this privacy policy
              periodically for any changes.
            </p>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              7. Contact Us
            </h2>
            <p className="mb-4">
              If you have any questions about this privacy policy, please
              contact us at:
            </p>
            <p className="mb-4">
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

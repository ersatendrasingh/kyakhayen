import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";

const meta = {
  title: "Download Kya Khayen App | free diet plan for weight loss",
  description:
    "Try our 7-day weight loss diet plans, low-carb meal ideas, and detox diet programs. Enjoy healthy breakfasts, dinners, and snacks for kids that fit your lifestyle.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/download-app.png`,
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
    url: `${process.env.NEXT_PUBLIC_APP_URL}/download-app`,

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
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/download-app`,
  },
};
const DownloadApp = () => {
  return (
    <div>
      <PageTitle title="Download Kya Khayen?" className="py-6" />
      <section className="py-16 ">
        <Container>
          <div className="flex flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl text-websecondary mb-8">
                Your Personalized Cooking Assistant
              </h2>
              <p className="text-lg text-center leading-loose tracking-wide mb-4">
                Experience the comfort of Kya Khayen? anytime, anywhere with our
                cutting-edge Progressive Web App (PWA). Designed and developed
                to bring the best of personalized meal planning and healthy
                eating at your fingertips, our mobile app makes it easier than
                ever to stay on track with your culinary and health goals.
              </p>
              <Link href="#how-to-download">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-[#1e1a16] hover:bg-websecondary text-white rounded-full"
                >
                  Download Kya Khayen? Now
                </Button>
              </Link>
            </div>
            <div className="flex md:flex-row items-center justify-center mt-10">
              <Image
                src="/assets/images/macbook-mealplan.webp"
                alt="weight loss programs"
                width={400}
                height={400}
                className="w-72 h-52 md:w-96 md:h-96 mb-4 md:mb-0"
              />
              <Image
                src="/assets/images/mobile-app-download.webp"
                alt="meal plan for weight loss"
                width={200}
                height={300}
                className="w-32 h-40 md:w-48 md:h-80  "
              />
            </div>
          </div>
        </Container>
      </section>
      <section className="py-10 md:py-10">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left">
              <h3 className="text-4xl text-websecondary mb-8">
                Key Benefits of Kya Khayen? App
              </h3>
              <ul>
                <li className="flex text-left items-center mb-4">
                  <span className="text-md md:text-4xl mr-4">&#8594;</span>
                  <span className="text-lg leading-loose tracking-wide">
                    <strong>Fast and Lightweight:</strong> Our meal plan mobile
                    application loads quickly, ensuring a smooth and responsive
                    user experience.
                  </span>
                </li>
                <li className="flex text-left items-center mb-4">
                  <span className="text-md md:text-4xl mr-4">&#8594;</span>
                  <span className="text-lg leading-loose tracking-wide">
                    <strong>Cross-Device Compatibility:</strong> Access our pwa
                    app from your mobile, tablet, or desktop browser with
                    consistent functionality.
                  </span>
                </li>
                <li className="flex text-left items-center mb-4">
                  <span className="text-md md:text-4xl mr-4">&#8594;</span>
                  <span className="text-lg leading-loose tracking-wide">
                    <strong>Always Updated:</strong> There are no any manual
                    updates needed! Our app is automatically kept up-to-date
                    with the latest features and improvements.
                  </span>
                </li>
              </ul>
            </div>
            <div className="items-center">
              <Image
                src="/assets/images/home-banner-app-download.webp"
                alt="healthy meals for weight loss"
                width={600}
                height={600}
              />
            </div>
          </div>
        </Container>
      </section>
      <section className="py-16 " id="how-to-download">
        <Container>
          <div className="flex flex-col items-center justify-center">
            <h4 className="text-4xl text-websecondary mb-8">
              How To Download Our App
            </h4>
            <div className="flex flex-col md:flex-row items-center justify-center text-xl">
              <div className="mb-8 md:mb-0 md:mr-8">
                <h5 className="text-4xl text-websecondary mb-8">For Android</h5>
                <p className="text-lg text-left mb-4">
                  Follow these steps to download Kya Khayen? app for Android:
                </p>
                <ol className="list-decimal text-left">
                  <li className="flex items-center text-left mb-4">
                    <span className="text-md md:text-4xl mr-4">&#8594;</span>
                    <span className="text-lg">
                      Just open your mobile browser.
                    </span>
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
                      Go to the option menu in the browser.
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
                      Once added, you&apos;ll find Kya Khayen? app icon on your
                      home screen. Tap to open!
                    </span>
                  </li>
                </ol>
              </div>
              <div>
                <h6 className="text-4xl text-websecondary mb-8">For iOS</h6>
                <p className="text-lg text-left mb-4">
                  Follow these steps to download Kya Khayen? app for iOS:
                </p>
                <ol className="list-decimal text-left ">
                  <li className="flex text-left items-center mb-4">
                    <span className="text-md md:text-4xl mr-4">&#8594;</span>
                    <span className="text-lg">
                      Just open your mobile browser.
                    </span>
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
                      Look for the &quot;Add to Home Screen&quot; option in the
                      browser menu.
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
                      Once added, you&apos;ll find Kya Khayen? app icon on your
                      home screen. Tap to open!
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default DownloadApp;

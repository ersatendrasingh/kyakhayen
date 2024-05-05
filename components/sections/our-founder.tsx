"use client";

import Container from "@/components/container";
import FeaturedImage from "@/components/sections/featured-image";
import VideoPlayer from "@/components/video-player";

import feature1 from "@/public/assets/features/feature-1.png";
import feature2 from "@/public/assets/features/feature-2.png";
import feature3 from "@/public/assets/features/feature-3.png";
import feature4 from "@/public/assets/features/feature-4.png";
import feature5 from "@/public/assets/features/feature-5.png";
import feature6 from "@/public/assets/features/feature-6.png";
import feature7 from "@/public/assets/features/feature-7.png";
import feature8 from "@/public/assets/features/feature-8.png";
import WebVideoPlayer from "../web-video-player";

const founderPoster = "/assets/founder-video-poster.jpg";

const featureImages = [
  {
    img: feature1,
    alt: "Feature 1",
  },
  {
    img: feature2,
    alt: "Feature 2",
  },
  {
    img: feature3,
    alt: "Feature 3",
  },
  {
    img: feature4,
    alt: "Feature 4",
  },
  {
    img: feature5,
    alt: "Feature 5",
  },
  {
    img: feature6,
    alt: "Feature 6",
  },
  {
    img: feature7,
    alt: "Feature 7",
  },
  {
    img: feature8,
    alt: "Feature 8",
  },
];

const OurFounder = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <Container>
        <div className="w-full flex items-center justify-center mb-10">
          <h2 className="text-2xl lg:text-5xl font-semibold text-webprimary">
            Our Founder - Dr. Shikha Sharma
          </h2>
        </div>
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start">
          <div className="mt-8 lg:mt-0 w-full lg:w-1/2 mb-10 lg:mb-0 mr-0 lg:mr-10 items-center justify-center">
            <h3 className="text-3xl font-semibold text-center text-webprimary mb-10 lg:mb-20">
              Featured In
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 items-center justify-center">
              {featureImages.map((feature, index) => (
                <FeaturedImage
                  key={index}
                  img={feature.img}
                  alt={feature.alt}
                />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-1/2 animate-fadeIn">
            <WebVideoPlayer
              videoUrl="https://d3svaamk73mozc.cloudfront.net/01b6b75b-69d5-48a8-9fd3-12b0c19ea322/mp4/Unitus%20Dr%20Shikha%20Eng%20(3)_Mp4_Avc_Aac_16x9_1280x720p_24Hz_4.5Mbps_qvbr.mp4"
              poster={founderPoster}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default OurFounder;

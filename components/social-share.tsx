"use client";

import Image from "next/image";
import {
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";

import { FacebookIcon, TwitterIcon, WhatsappIcon } from "react-share";
interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
}
const SocialShare = ({
  url,
  title,
  description,
  imageUrl,
}: SocialShareProps) => {
  const facebookUrl = `${url}?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}&image=${encodeURIComponent(
    imageUrl
  )}`;

  const hashtags = [
    "kyakhayen",
    "recipe",
    "foodie",
    "delicious",
    "cooking",
    "yummy",
  ];

  return (
    <div className="social-share-section mt-4">
      <div className="flex space-x-4">
        <FacebookShareButton url={url} hashtag="#kyakhayen">
          <FacebookIcon size={32} round />
        </FacebookShareButton>
        <TwitterShareButton
          url={url}
          title={title}
          via="kyakhayen"
          hashtags={hashtags}
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <LinkedinShareButton
          url={url}
          title={title}
          summary={description}
          source="kyakhayen"
        >
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        <a
          href={`https://www.instagram.com/?url=${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <Image
            src="/assets/images/instagram.png"
            alt="Instagram"
            width={32}
            height={32}
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
        </a>
        <WhatsappShareButton url={url} title={title} separator=":: ">
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </div>
    </div>
  );
};

export default SocialShare;

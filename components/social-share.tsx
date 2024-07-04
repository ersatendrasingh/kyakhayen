"use client";

import {
  FacebookShareButton,
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
        <WhatsappShareButton url={url} title={title} separator=":: ">
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </div>
    </div>
  );
};

export default SocialShare;

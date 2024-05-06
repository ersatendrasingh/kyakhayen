/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const NextConfig = {
  ...(process.env.NODE_ENV === "production" && {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
  images: {
    domains: [
      "kyakhayen-dev.s3.ap-south-1.amazonaws.com",
      "kyakhayen-prod.s3.ap-south-1.amazonaws.com",
      "localhost",
      "via.placeholder.com",
      "lh3.googleusercontent.com",
    ],
  },
};
module.exports = withPWA(NextConfig);

/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});
module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
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
});

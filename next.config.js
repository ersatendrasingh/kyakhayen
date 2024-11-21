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
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
    ];
  },
  images: {
    domains: [
      "kyakhayen-dev.s3.ap-south-1.amazonaws.com",
      "kyakhayen-prod.s3.ap-south-1.amazonaws.com",
      "localhost",
      "via.placeholder.com",
      "lh3.googleusercontent.com",
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Avoid memory issues by splitting large chunks
      config.optimization.splitChunks = {
        chunks: "all",
        maxSize: 250000, // Adjust this size based on your app's needs
      };

      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = withPWA(NextConfig);

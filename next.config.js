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
  async headers() {
    return [
      {
        // Apply to all static files in the "public" directory
        source: "/(.*)", // Match all routes
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable", // Cache for 24 hours (86400 seconds)
          },
        ],
      },
      {
        // Optionally, you can add cache headers for API routes or specific paths
        source: "/api/(.*)", // Example for API routes
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600", // Cache API routes for 1 hour
          },
        ],
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

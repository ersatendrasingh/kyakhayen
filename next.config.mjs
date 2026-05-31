import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const mediaRemotePattern = process.env.NEXT_PUBLIC_MEDIA_URL
  ? (() => {
      const mediaUrl = new URL(process.env.NEXT_PUBLIC_MEDIA_URL);
      const pathname = mediaUrl.pathname.replace(/\/+$/, "");

      return {
        protocol: mediaUrl.protocol.replace(":", ""),
        hostname: mediaUrl.hostname,
        port: mediaUrl.port,
        pathname: `${pathname}/**`,
      };
    })()
  : null;

const NextConfig = {
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
        source: "/:path*\\.(jpg|jpeg|png|webp|avif|gif|svg|ico|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      ...(mediaRemotePattern ? [mediaRemotePattern] : []),
      // Keep legacy S3 records renderable until stored URLs are migrated.
      {
        protocol: "https",
        hostname: "kyakhayen-dev.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "kyakhayen-prod.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default withSerwist(NextConfig);

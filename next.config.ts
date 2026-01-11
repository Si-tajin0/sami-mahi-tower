import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // এই অংশটি এরর মেসেজের নির্দেশ অনুযায়ী যোগ করা হয়েছে
  experimental: {
    turbopack: {},
  },
};

export default withPWA(nextConfig as unknown as import("next").NextConfig);
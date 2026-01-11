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
  // Vercel-এর Turbopack এরর সাইলেন্ট করার জন্য এই অংশটি জরুরি
  experimental: {
    turbopack: {},
  },
};

export default withPWA(nextConfig as unknown as import("next").NextConfig);
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // ডেভেলপমেন্ট মুডে বন্ধ থাকবে
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // এটি বিল্ডের সময় ESLint চেক বন্ধ করে দেবে
    ignoreDuringBuilds: true,
  },
  typescript: {
    // টাইপস্ক্রিপ্ট এরর থাকলেও বিল্ড হবে
    ignoreBuildErrors: true,
  },
  experimental: {
    
    turbopack: {},
  },
};

// 'as unknown as import("next").NextConfig' ব্যবহার করা হয়েছে যাতে 'any' এরর না আসে
export default withPWA(nextConfig as unknown as import("next").NextConfig);
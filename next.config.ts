const nextConfig = {
  eslint: {
    // এটি বিল্ডের সময় ESLint চেক বন্ধ করে দেবে
    ignoreDuringBuilds: true,
  },
  typescript: {
    // টাইপস্ক্রিপ্ট এরর থাকলেও বিল্ড হবে
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

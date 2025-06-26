import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable the new searchParams handling that's causing the invariant error
    ppr: false,
    // Add this to mitigate hydration-related issues
    serverComponentsExternalPackages: [],
  },
  // Ensure proper hydration
  reactStrictMode: true,
  // Add image domains for external images
  images: {
    domains: ['images.pexels.com', 'images.unsplash.com'],
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Enable static HTML export for Azure Static Web Apps
  distDir: "out", // Output static files to 'out' folder
  images: {
    unoptimized: true, // Required for static export (no Image Optimization API)
  },
};

export default nextConfig;

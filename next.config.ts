import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tạo output tối giản cho Docker — chỉ copy .next/standalone + static
  output: "standalone",
};

export default nextConfig;

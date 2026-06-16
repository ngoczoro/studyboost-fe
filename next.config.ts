import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tạo output tối giản cho Docker — chỉ copy .next/standalone + static
  output: "standalone",
  experimental: {
    // Tăng giới hạn kích thước request body đi qua Middleware lên 50MB
    middlewareClientMaxBodySize: "100mb",
  },
};

export default nextConfig;

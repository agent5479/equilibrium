import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/equilibrium",
  assetPrefix: "/equilibrium/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

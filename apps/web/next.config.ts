import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";
import type { NextConfig } from "next";

const withVanillaExtract = createVanillaExtractPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/equipment", destination: "/monitoring", permanent: false },
      {
        source: "/equipment/:equipmentId",
        destination: "/monitoring/equipments/:equipmentId",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.amc.seoul.kr" },
      { protocol: "https", hostname: "sev.severance.healthcare" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      {
        protocol: "https",
        hostname: "marketing.webassets.siemens-healthineers.com",
      },
    ],
  },
};

export default withVanillaExtract(nextConfig);

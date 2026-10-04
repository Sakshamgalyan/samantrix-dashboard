import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  transpilePackages: ["@galyan/ui", "@galyan/theme"],

  // Absolute path alias support for @/src/{foldername} across both Turbopack & Webpack
  turbopack: {
    resolveAlias: {
      "@/src": "./src",
    },
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/src": path.resolve(process.cwd(), "src"),
    };
    return config;
  },

  // The console used to live under /dashboard; keep old links and bookmarks working.
  // /dashboard/admin/developers → /admin/developers; bare /dashboard → / (sends signed-in users home).
  async redirects() {
    return [
      { source: "/dashboard", destination: "/", permanent: false },
      { source: "/dashboard/:path*", destination: "/:path*", permanent: false },
    ];
  },
};

export default nextConfig;

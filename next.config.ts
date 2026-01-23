import type { NextConfig } from "next";
import { isAnalyze, isDebug } from "@/core/config/constants";

let nextConfig: NextConfig = {
  // Build Optimization

  compiler: {
    removeConsole: !isDebug ? { exclude: ["error", "warn"] } : false,
  },

  turbopack: {
    rules: {
      "**/assets/icons/**/*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              dimensions: false,
              memo: true,
              typescript: true,
              svgo: true,
              replaceAttrValues: {
                "#222": "currentColor",
                "#222222": "currentColor",
              },
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: { overrides: { removeViewBox: false } },
                  },
                ],
              },
            },
          },
        ],
        as: "*.tsx",
      },
    },
  },

  // React & Type Safety
  reactStrictMode: true,
  reactCompiler: true,

  // Experimental
  experimental: {
    typedEnv: true,
    optimizePackageImports: [
      "@tanstack/react-query",
      "@tanstack/react-virtual",
      "@base-ui/react",
      "zustand",
      "react-hook-form",
      "zod",
    ],
    scrollRestoration: true,
  },
};

// 번들 분석기 (ANALYZE=true pnpm build)
if (isAnalyze) {
  nextConfig = require("@next/bundle-analyzer")({ enabled: true })(nextConfig);
}

export default nextConfig;

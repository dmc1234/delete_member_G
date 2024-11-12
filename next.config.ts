import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      ignored: /node_modules/,  // node_modulesは監視対象から除外
      poll: 1000,                // 1秒ごとにポーリングして変更を監視
    };
    return config;
  },
};

export default nextConfig;

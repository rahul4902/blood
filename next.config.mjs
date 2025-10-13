// /** @type {import('next').NextConfig} */

// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
// }
import TerserPlugin from "terser-webpack-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  darkMode: 'class',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: 'https',
        hostname: 'media-cdn.redcliffelabs.com',
        port: '',
        pathname: '/media/**',
      },
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/ext-api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ]
  },

  webpack(config, { isServer }) {
    if (!isServer) {
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            mangle: true,
            compress: true,
            output: {
              comments: false,
            },
          },
        })
      );
    }
    return config;
  },

  output: "standalone",
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wordpressbackend.whitemantis.ae",
      },
      {
        protocol: "https",
        hostname: "whitemantis.marketingmomentum.in",
      },
      {
        hostname: "whitemantis.marketingmomentum.local",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  // Empty turbopack config to silence Next.js 16 warning
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Handle canvas dependency for @react-pdf/renderer
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    return config;
  },
};

export default nextConfig;

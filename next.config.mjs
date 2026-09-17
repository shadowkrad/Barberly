/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modalità standalone abilitata solo per la build Docker su VPS Aruba
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingIncludes: {
    "/**": ["./prisma/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "taaaac.eu",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

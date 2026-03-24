/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@fitarena/db", "@fitarena/shared"],
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless"],
  },
};

module.exports = nextConfig;

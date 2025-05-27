/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // use this if you're using static images from /public
  },
};

module.exports = nextConfig;

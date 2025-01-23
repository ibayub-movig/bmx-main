/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    domains: [
      'api.mapbox.com',
      'media.cntraveler.com',
      'bridgesandballoons.com',
      'assets.vogue.com',
      'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
};

module.exports = nextConfig;
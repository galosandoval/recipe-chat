// eslint-disable-next-line @typescript-eslint/no-var-requires
const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
        port: '',
        pathname: '/f/**'
      },
      {
        protocol: 'https',
        hostname: 'nvpvglkh9iqe2xny.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**'
      }
    ]
  },

  i18n
}

module.exports = nextConfig

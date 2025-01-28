// eslint-disable-next-line @typescript-eslint/no-var-requires
// import { i18n } from './next-i18next.config.cjs'

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

  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localePath: require('path').resolve('./public/locales')
  }
}

module.exports = nextConfig

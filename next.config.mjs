// import './src/env.js'

/** @type {import("next").NextConfig} */
const config = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nvpvglkh9iqe2xny.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
}
export default config

// import './src/env.js'

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nvpvglkh9iqe2xny.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
}
export default config

import type { NextConfig } from 'next'
import { parseEnv } from './src/env'

// Fails the build when a deployment is missing a variable it needs, instead of
// failing at a customer's click.
parseEnv()

const config: NextConfig = {
  experimental: { reactCompiler: true },
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

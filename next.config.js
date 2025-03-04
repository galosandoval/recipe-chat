/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'

/** @type {import("next").NextConfig} */
const config = {
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
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**'
            }
        ]
    }
}

export default config

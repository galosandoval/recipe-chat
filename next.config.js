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
      }
    ]
  },

  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/chat',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'next-auth.session-token'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

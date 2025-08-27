/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/houses': { page: '/houses' }
    }
  }
}

module.exports = nextConfig

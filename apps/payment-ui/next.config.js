// next.config.js
const nextConfig = {
  reactStrictMode: false,
  exportPathMap: function () {
    return {
      '/': { page: '/' },
      '/404': { page: '/404' },
      '/500': { page: '/500' },
    };
  },
};

module.exports = nextConfig;
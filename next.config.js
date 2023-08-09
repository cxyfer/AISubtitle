const nextConfig = {
    reactStrictMode: true,
    exportPathMap: async function (defaultPathMap) {
        return {
          '/': { page: '/' },
        }
      },
    // 增加下面这项配置——关闭image自动优化
    images: {
      unoptimized: true,
    },
  };
  module.exports = nextConfig;
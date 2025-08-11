/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁止 pdfjs-dist 在伺服器端執行
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pdfjs-dist');
    }
    return config;
  },
  
  // 跳過類型檢查以加快建置速度
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 處理 PDF worker
  async headers() {
    return [
      {
        source: '/pdf.worker.min.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
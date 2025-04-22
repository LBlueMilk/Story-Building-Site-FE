/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    // 本地開發時，前端會透過 proxy 訪問本地後端
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5112/api/:path*",
        },
      ];
    }

    // 這裡是生產環境的設定
    // 可以根據實際情況修改 destination 的 URL
    // 正式環境 rewrite 到 Render 雲端後端 API
    return [
      {
        source: "/api/:path*",
        destination: "https://storybuildingsite-backendapi.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;

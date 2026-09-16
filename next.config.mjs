/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // L'astuce est le "/" à la toute fin.
        // Django reçoit toujours un slash, donc il ne fait jamais de redirection 301 !
        destination: 'http://127.0.0.1:8071/api/:path*/',
      },
    ]
  },
}

export default nextConfig;

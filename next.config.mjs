/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // ترويسات الأمان (CSP وغيرها) تُضبط في middleware.ts عبر lib/security.mjs
  // لأن /runner (المنفّذ المعزول) يحتاج سياسة مختلفة عن بقية الموقع.
};

export default nextConfig;

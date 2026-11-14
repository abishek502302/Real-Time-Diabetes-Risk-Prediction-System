/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/Real-Time-Diabetes-Risk-Prediction-System',
  trailingSlash: true,
};

export default nextConfig;
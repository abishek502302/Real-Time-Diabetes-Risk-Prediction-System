/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  basePath:
    process.env.NODE_ENV === 'production'
      ? '/Real-Time-Diabetes-Risk-Prediction-System'
      : '',
  trailingSlash: true,
};

export default nextConfig;
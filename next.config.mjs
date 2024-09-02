/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aumentar el tiempo de espera para la generación de páginas estáticas (opcional)
  staticPageGenerationTimeout: 120,
  experimental: {
    serverActions: true,
  }
};

export default nextConfig;
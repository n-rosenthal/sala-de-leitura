// frontend/next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    unoptimized: true, // Se não estiver usando otimização de imagens
  },
  // Para evitar problemas com caminhos
  typescript: {
    ignoreBuildErrors: true, // Temporariamente para desenvolvimento
  },
};

export default nextConfig;
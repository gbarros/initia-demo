/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile packages that need it
  transpilePackages: [
    '@initia/widget-react',
    '@initia/wagmi-connector',
    'react-hook-form',
    '@hookform/resolvers',
    '@tanstack/react-query',
    'wagmi',
    'jotai',
  ],
  // Handle module resolution issues
  webpack: (config) => {
    // Add aliases for problematic packages
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-hook-form': require.resolve('react-hook-form'),
    };
    
    // Add fallbacks for browser polyfills
    // config.resolve.fallback = {
    //   ...config.resolve.fallback,
    //   crypto: require.resolve('crypto-browserify'),
    //   stream: require.resolve('stream-browserify'),
    //   http: require.resolve('stream-http'),
    //   https: require.resolve('https-browserify'),
    //   os: require.resolve('os-browserify/browser'),
    //   buffer: require.resolve('buffer/'),
    // };

    return config;
  },
};

module.exports = nextConfig;

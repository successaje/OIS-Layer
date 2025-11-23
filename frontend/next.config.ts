import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  // Set outputFileTracingRoot to silence workspace root warning
  outputFileTracingRoot: resolve(__dirname),
  // Explicitly use webpack instead of Turbopack for this build
  // This is needed because we have custom webpack plugins for handling test files
  webpack: (config, { isServer, webpack }) => {
    // Ignore specific problematic imports from test files
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^tap$/,
        contextRegExp: /node_modules\/thread-stream\/test/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^tape$/,
        contextRegExp: /node_modules\/thread-stream\/test/,
      })
    );

    // Replace test files with empty module
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /node_modules\/thread-stream\/test\/.*/,
        resolve(__dirname, 'webpack-empty.js')
      )
    );

    // Fallback for Node.js modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        path: false,
        os: false,
      };
    }

    // Ignore React Native dependencies that MetaMask SDK tries to import
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^react-native$/,
      })
    );

    return config;
  },
  // Configure Turbopack root for workspace setup
  turbopack: {
    root: resolve(__dirname),
  },
  // Server external packages (moved from experimental in Next.js 16)
  serverExternalPackages: ['pino', 'thread-stream'],
};

export default nextConfig;

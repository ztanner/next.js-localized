// Hardcode locale configuration since we can't import TypeScript files in next.config.mjs
const locales = [
  "da-DK",
  "de-DE",
  "en-GB",
  "en-US",
  "es-ES",
  "fr-FR",
  "it-IT",
  "nl-NL",
  "pt-PT",
  "sv-SE",
];
const defaultLocale = "en-US";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Re-enable compression since we're not modifying responses anymore
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, context) => {
    if (!context.isServer) {
      // This allows us to import "fs" in client compoennts without throwing an error, which is useful
      // For IntlProvider where we want to read the translations from the file system when doing SSR.
      config.resolve.alias.fs = false;
    }
    return config;
  },
};

export default nextConfig;

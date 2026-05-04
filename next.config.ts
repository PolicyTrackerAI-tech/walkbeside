import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone testing over the local Wi-Fi network. Without this,
  // Next.js blocks HMR (hot-reload) from non-localhost origins by
  // default. Production builds are unaffected. Add your laptop's
  // current local IP here if you switch networks and the warning
  // returns.
  allowedDevOrigins: [
    "192.168.1.129",
    "192.168.1.*",
    "192.168.0.*",
    "10.0.0.*",
  ],
};

export default nextConfig;

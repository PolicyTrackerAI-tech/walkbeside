import type { NextConfig } from "next";

// Security headers applied to every response. CSP is sent in Report-Only mode
// first (observe violations in the browser console before enforcing) because a
// strict script-src can break Next's inline hydration; the rest are enforced.
const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "img-src 'self' data: https:",
      "font-src 'self' https: data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

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
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;

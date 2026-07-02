import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://rishta-app.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/terms", "/privacy"],
      // Keep private/authenticated areas out of search indexes
      disallow: [
        "/discover",
        "/matches",
        "/chat",
        "/directory",
        "/profile",
        "/settings",
        "/gold",
        "/admin",
        "/api",
        "/onboarding",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

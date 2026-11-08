import { SITE_URL } from "@/lib/content";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/send.php"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

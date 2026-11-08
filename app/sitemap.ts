import { SITE_URL, getSofaPages } from "@/lib/content";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy-policy/`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...getSofaPages().map((sofa) => ({
      url: `${SITE_URL}/sofa/${sofa.slug}/`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

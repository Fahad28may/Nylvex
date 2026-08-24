import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllProjects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/work", "/capabilities", "/lab", "/about", "/contact"].map(
    (route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: new Date(),
    })
  );

  const projectRoutes = getAllProjects().map((project) => ({
    url: `${siteConfig.url}/work/${project.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...projectRoutes];
}

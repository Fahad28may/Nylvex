import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllProjects } from "@/data/projects";
import { getAllPosts } from "@/data/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/work", "/capabilities", "/lab", "/blog", "/about", "/contact"].map(
    (route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: new Date(),
    })
  );

  const projectRoutes = getAllProjects().map((project) => ({
    url: `${siteConfig.url}/work/${project.slug}`,
    lastModified: new Date(),
  }));

  const postRoutes = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}

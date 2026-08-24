export const siteConfig = {
  name: "Nylvex",
  title: "Nylvex — AI & Software Engineering Studio",
  description:
    "Nylvex designs and builds intelligent software for complex problems — AI systems, intelligent applications, and software engineered around real-world constraints.",
  url: "https://nylvex.com",
  email: "hello@nylvex.com",
  github: "https://github.com/Fahad28may",
  eyebrow: "NYLVEX — AI & SOFTWARE ENGINEERING STUDIO",
  headline: "Intelligent software for complex problems.",
  subheadline:
    "AI systems, intelligent applications, and software engineered around real-world problems.",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Lab", href: "/lab" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

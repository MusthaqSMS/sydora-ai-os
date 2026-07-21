export const siteConfig = {
  name: "Sydora AI OS",
  description: "A secure operating platform for modern teams.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/opengraph-image.png",
  links: {
    github: "https://github.com/MusthaqSMS/sydora-ai-os",
  },
} as const;

export const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"] as const;
export const dashboardPrefix = "/dashboard";

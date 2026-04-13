import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ethicLine",
    short_name: "ethicLine",
    description: "ethicLine GmbH",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f6f6",
    theme_color: "#151515",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

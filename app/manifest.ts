import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

/** Served at /manifest.webmanifest — enables "Add to Home Screen" on mobile */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Eka",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#090B18",
    theme_color: "#162161",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

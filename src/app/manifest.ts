import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barberly — Gestionale Barbieri & Grooming",
    short_name: "Barberly",
    description: "Gestionale verticale per barbieri e saloni di grooming maschile.",
    start_url: "/admin",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#d97706",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

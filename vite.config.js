import { defineConfig } from "vite";

export default defineConfig({
  // Important pour pouvoir servir le build depuis un sous-chemin/CDN (jsDelivr),
  // et pour que le lien "figé sur commit" charge toujours les bons assets.
  base: "./",
});


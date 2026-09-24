import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";
export default defineConfig({
  base:"./",
  plugins:[react(),VitePWA({
    registerType:"autoUpdate",
    includeAssets:["icon-192.png","icon-512.png"],
    manifest:{
      name:"پارسایان",short_name:"پارسایان",lang:"fa",dir:"rtl",display:"standalone",
      background_color:"#0b0910",theme_color:"#0b0910",start_url:"./",scope:"./",
      icons:[
        {src:"icon-192.png",sizes:"192x192",type:"image/png",purpose:"any"},
        {src:"icon-512.png",sizes:"512x512",type:"image/png",purpose:"any maskable"}
      ]
    },
    workbox:{globPatterns:["**/*.{js,css,html,svg,png,ico}"]}
  })]
});

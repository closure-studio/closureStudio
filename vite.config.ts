import path from "node:path";
import { defineConfig, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import basicSsl from "@vitejs/plugin-basic-ssl";
// https://vitejs.dev/config/
export default defineConfig(() => {
    const isProduction = process.env.NODE_ENV === "production";
    const isAnalyze = process.env.ANALYZE === "true";

    const plugins: PluginOption[] = [
        !isProduction && basicSsl(),
        vue({
            isProduction: true,
        }),
        VitePWA({
            filename: "sw.ts",
            registerType: "autoUpdate",
            strategies: "injectManifest",
            devOptions: {
                enabled: true,
                type: "module",
            },
            srcDir: "src",
            injectRegister: false,
            manifest: {
                name: "可露希尔小程序",
                short_name: "ClosurePWA",
                theme_color: "#212121",
                icons: [
                    {
                        src: "./assets/pwa/pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "./assets/pwa/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "./assets/pwa/pwa-maskable-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "maskable",
                    },
                    {
                        src: "./assets/pwa/pwa-maskable-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
                start_url: ".",
                display: "standalone",
                background_color: "#212121",
                description: "ClosureApp",
            },
        }),
        viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: "gzip",
            ext: ".gz",
        }),
        isAnalyze && (visualizer() as PluginOption),
    ].filter(Boolean);

    return {
        define: {
            __VUE_PROD_DEVTOOLS__: !isProduction,
            __APP_VERSION__: process.env.VITE_APP_VERSION,
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: "modern-compiler",
                },
            },
        },
        plugins,
        build: {
            rollupOptions: {
                output: {
                    chunkFileNames: "static/js/[hash].js",
                    entryFileNames: "static/js/[hash].js",
                    assetFileNames: "static/[ext]/[hash].[ext]",
                },
            },
            sourcemap: !isProduction,
        },
        server: {
            //host: "192.168.8.238"
        },
    };
});

import path from "path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import tanStackRouterVite from "@tanstack/router-plugin/vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import monicon from "@monicon/vite";


// https://vitejs.dev/config/
export default defineConfig(() => {
	const enableSSR = process.env.ENABLE_SSR === "true";
	return {
		server: {
			proxy: {
				'/api': {
					target: 'http://localhost:8080',
					changeOrigin: true,
					secure: false
				}
			}
		},
		plugins: [
			// Only enable Nitro (SSR) when explicitly requested.
			// Without a dedicated SSR entry, enabling this during a normal build
			// will cause Vite to try to use index.html as the SSR input and fail.
			enableSSR ? nitroV2Plugin() : null,
			tanStackRouterVite({ autoCodeSplitting: true }),
			viteReact(),
			tailwindcss(),
			monicon({
				collections: ["solar"],
			}),
		].filter(Boolean),
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
				"@components": path.resolve(__dirname, "./src/components"),
				"@lib": path.resolve(__dirname, "./src/lib"),
				"@hooks": path.resolve(__dirname, "./src/hooks"),
				"@routes": path.resolve(__dirname, "./src/routes"),
			},
		},
	};
});

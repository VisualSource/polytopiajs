import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import VitePluginHtmlEnv from 'vite-plugin-html-env'

export default defineConfig({
    plugins: [VitePluginHtmlEnv({BUILD_VERSION: process.env.npm_package_version }),svelte()],
    publicDir: "public",
    define: {
        "import.meta.env.PACKAGE_VERSION": JSON.stringify(process.env.npm_package_version)
    }
});

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import VitePluginHtmlEnv from 'vite-plugin-html-env';

const get_build_number = (mode, html = false) => {
    const date = new Date().toJSON().split("T")[0];
    const dev_build = JSON.stringify(`${process.env.npm_package_version}_${date.split("-").join("")}`);
    const prod = JSON.stringify(process.env.npm_package_version);

    if(mode === "production") {
        if(html) return prod.replace('"',"").replace('"',"");
        return prod;
    } 

    if(html) return dev_build.replace('"',"").replace('"',"");
    return dev_build; 
} 

export default defineConfig(({command, mode}) => ({
    plugins: [VitePluginHtmlEnv({BUILD_VERSION: get_build_number(mode, true) }),svelte()],
    publicDir: "public",
    define: {
        "import.meta.env.PACKAGE_VERSION": get_build_number(mode)
    }
}));

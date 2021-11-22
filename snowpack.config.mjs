import { resolve } from 'path';
import { readFileSync } from 'fs';


const packageJson = readFileSync("./package.json",{encoding:"utf-8"});

const { version } = JSON.parse(packageJson)

/** @type {import("snowpack").SnowpackUserConfig } */
const config = {
    env: {
        BUILD_VERSION: version
    },
    buildOptions: {
        sourcemap: true
    },
    mount: {
        public: {url: '/', static: true},
        src: { url: '/dist' },
    },
    plugins: [
        '@snowpack/plugin-svelte', 
        '@snowpack/plugin-dotenv',
        '@snowpack/plugin-sass',
        [
            '@snowpack/plugin-webpack',
            {
                outputPattern: {
                    js: "index.js",
                    css: "index.css"
                },
                extendConfig: config => {
                    //delete config.optimization.splitChunks;
                    delete config.optimization.runtimeChunk;

                    config.output.path = resolve("./dist");
                    config.module.rules[0] = {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: "esbuild-loader",
                                options: {
                                    target: "es2020"
                                }
                            },
                            {
                                loader: resolve('./node_modules/@snowpack/plugin-webpack/plugins/import-meta-fix.js')
                                
                            }
                        ]
                    };

                    return config;
                }
            }
        ]
    ],
    routes: [
        {"match": "routes", "src": ".*", "dest": "/index.html"},
    ],
}

export default config;
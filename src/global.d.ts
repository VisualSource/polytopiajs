interface ImportMeta {
    env: {
        BUILD_VERSION: string;
        MODE: "dvelopment" | "production" | "test",
        NODE_ENV: "dvelopment" | "production" | "test",
        SNOWPACK_PUBLIC_AUTH0_DOMAIN: string;
        SNOWPACK_PUBLIC_AUTH0_CLIENT_ID: string;
        SNOWPACK_PUBLIC_AUTH0_AUDIENCE: string;
        SNOWPACK_PUBLIC_PAK_VERSION: string;
    }
}

interface Window {
    opera: string;
    __SNOWPACK_ENV__: any
}

declare module '*.svelte';
declare module 'troika-three-text' {}
declare module 'three-instanced-uniforms-mesh' {
    declare class InstancedUniformsMesh extends THREE.InstancedMesh {
        public setUniformAt(uniformName, instanceIndex, value): void;
    }
}
/// <reference types="vite/client" />
interface ImportMeta {
    readonly env: {
        readonly BUILD_VERSION: string;
        readonly MODE: "dvelopment" | "production" | "test",
        readonly BASE_URL: string;
        readonly PROD: boolean;
        readonly DEV: boolean;
        readonly PACKAGE_VERSION: string;

    }
}

interface Window {
    opera: string;
    webkitAudioContext: AudioContext;
    webkitOfflineAudioContext: OfflineAudioContext; 
}

declare module '*.svelte';
declare module 'troika-three-text' {
    class Text extends THREE.Object3D {
        sync: () => void;
        text: string;
        fontSize: number;
        position: THREE.Vector3;
        color: any;
        dispose: () => void
    }
}
declare module 'three-instanced-uniforms-mesh' {
    declare class InstancedUniformsMesh extends THREE.InstancedMesh {
        public setUniformAt(uniformName, instanceIndex, value): void;
    }
}
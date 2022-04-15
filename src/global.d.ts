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

declare module "three-nebula" {
    interface THREE_SpriteRenderer_ref {
        Mesh:  typeof THREE.Mesh;
        BoxGeometry:  typeof THREE.BoxGeometry;
        MeshLambertMaterial:  typeof THREE.MeshLambertMaterial;
    }
    interface THREE_load_async {
        TextureLoader: typeof THREE.TextureLoader;
        SpriteMaterial: typeof THREE.SpriteMaterial;
        Sprite: typeof THREE.Sprite
    }

    export default class System {
        static fromJSONAsync(json: any, THREE:  THREE_load_async, options?: any): Promise<System>;
        /**
         * Adds a renderer to the System instance and initializes it.
         */
        addRenderer(renderer: Object): System
        /**
         * Adds an emitter to the System instance.
         */
        addEmitter(emitter: Object): System;
        /**
         * Destroys all emitters, renderers and the Nebula pool.
         */
        destroy(): void
        /**
         * Proxy method for the internal event dispatcher's dispatchEvent method.
         */
        dispatch(event: string, target: System): void
        /** 
            Wires up life cycle methods and causes a system's emitters to emit particles. Expects emitters to have their totalEmitTimes and life set already. Inifnite systems will resolve immediately.
        */
        emit(hooks: Object): void
        /**
         * Gets a count of the total number of particles in the system.
         */
        getCount(): number;
        /**
         * Removes an emitter from the System instance.
         */
        removeEmitter(emitter: Object): System;
        /**
         * Removes a renderer from the System instance.
         */
        removeRenderer(renderer: Object): System;
        /**
         * Updates the particle system based on the delta passed.
         */
        update(delta?: number): Promise<void>
    }
    export class SpriteRenderer {
        constructor(scene: THREE.Scene, THREE: THREE_SpriteRenderer_ref);
    }
}

declare module 'qs' {
    function stringify(obj: any, options?: qs.IStringifyOptions): string;
    function parse(str: string, options?: qs.IParseOptions & { decoder?: never | undefined }): qs.ParsedQs;
    function parse(str: string | Record<string, string>, options?: qs.IParseOptions): { [key: string]: unknown };
}
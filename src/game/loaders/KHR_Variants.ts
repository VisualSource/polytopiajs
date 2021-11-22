import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
/**
 * Materials variants extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_variants
 */

/**
 *
 *
 * @export
 * @interface VariantGLTF
 * @extends {GLTF}
 */
export interface VariantGLTF extends GLTF {
  functions: {
       /**
     * @param object {THREE.Mesh}
     * @param variantName {string|null}
     * @param doTraverse {boolean} Default is true
     * @return {Promise}
     */
      selectVariant: (object: THREE.Mesh, varName: string, doTranerse?: boolean) => Promise<void[]>;
       /**
     * @param object {THREE.Mesh}
     * @param doTraverse {boolean} Default is true
     * @return {Promise}
     */
      ensureLoadVariants: (object: THREE.Mesh, doTraverse?: boolean) => Promise<void[]>;
  }
  userData:{
      variants: string[]
  }
}

/**
 * KHR_materials_variants specification allows duplicated variant names
 * but it makes handling the extension complex.
 * We ensure tha names and make it easier.
 * If you want to export the extension with the original names
 * you are recommended to write GLTFExporter plugin to restore the names.
 *
 * @param variantNames {Array<string>}
 * @return {Array<string>}
 */
 const ensureUniqueNames = (variantNames: Array<string>): Array<string> => {
    const uniqueNames = [];
    const knownNames = {};
  
    for (const name of variantNames) {
      let uniqueName = name;
      let suffix = 0;
      // @TODO: An easy solution.
      //        O(N^2) in the worst scenario where N is variantNames.length.
      //        Fix me if needed.
      while ((knownNames as any)[uniqueName] !== undefined) {
        uniqueName = name + '.' + (++suffix);
      }
      (knownNames as any)[uniqueName] = true;
      uniqueNames.push(uniqueName);
    }
  
    return uniqueNames;
  };
  
  /**
   * Convert mappings array to table object to make handling the extension easier.
   *
   * @param extensionDef {glTF.meshes[n].primitive.extensions.KHR_materials_variants}
   * @param variantNames {Array<string>} Required to be unique names
   * @return {Object}
   */
  const mappingsArrayToTable = (extensionDef: any, variantNames: Array<string>) => {
    const table = {};
    for (const mapping of extensionDef.mappings) {
      for (const variant of mapping.variants) {
        (table as any)[variantNames[variant] as any] = {
          material: null,
          gltfMaterialIndex: mapping.material
        };
      }
    }
    return table;
  };
  
  /**
   * @param object {THREE.Mesh}
   * @return {boolean}
   */
  const compatibleObject = (object: THREE.Mesh): boolean => {
    return object.material !== undefined && // easier than (!object.isMesh && !object.isLine && !object.isPoints)
      object.userData && // just in case
      object.userData.variantMaterials;
  };
  
  export default class KHR_Variants {
    constructor(parser: any) {
        (this as any).parser = parser;
      (this as any).name = 'KHR_materials_variants';
    }
  
    // Note that the following properties will be overridden even if they are pre-defined
    // - gltf.userData.variants
    // - mesh.userData.variantMaterials
    afterRoot(gltf: any) {
      const parser = (this as any).parser;
      const json = parser.json;
  
      if (!json.extensions || !json.extensions[(this as any).name]) {
        return null;
      }
  
      const extensionDef = json.extensions[(this as any).name];
      const variantsDef = extensionDef.variants || [];
      const variants = ensureUniqueNames(variantsDef.map((v: any) => v.name));
  
      for (const scene of gltf.scenes) {
        // Save the variants data under associated mesh.userData
        scene.traverse((object: any) => {
          // The following code can be simplified if parser.associations directly supports meshes.
          const association = parser.associations.get(object);
  
          if (!association || association.type !== 'nodes') {
            return;
          }
  
          const nodeDef = json.nodes[association.index];
          const meshIndex = nodeDef.mesh;
  
          if (meshIndex === undefined) {
            return;
          }
  
          // Two limitations:
          // 1. The nodeDef shouldn't have any objects (camera, light, or nodeDef.extensions object)
          //    other than nodeDef.mesh
          // 2. Other plugins shouldn't change any scene graph hierarchy
          // The following code can cause error if hitting the either or both limitations
          // If parser.associations will directly supports meshes these limitations can be removed
  
          const meshDef = json.meshes[meshIndex];
          const primitivesDef = meshDef.primitives;
          const meshes = object.isMesh ? [object] : object.children;
  
          for (let i = 0; i < primitivesDef.length; i++) {
            const primitiveDef = primitivesDef[i];
            const extensionsDef = primitiveDef.extensions;
            if (!extensionsDef || !extensionsDef[(this as any).name]) {
              continue;
            }
            meshes[i].userData.variantMaterials = mappingsArrayToTable(extensionsDef[(this as any).name], variants);
          }
        });
      }
  
      gltf.userData.variants = variants;
  
      // @TODO: Adding new unofficial property .functions.
      //        It can be problematic especially with TypeScript?
      gltf.functions = gltf.functions || {};
  
      /**
       * @param object {THREE.Object3D}
       * @param variantName {string|null}
       * @return {Promise}
       */
      const switchMaterial = async (object: any, variantName: string|null): Promise<void> => {
        if (!object.userData.originalMaterial) {
          object.userData.originalMaterial = object.material;
        }
  
        if (variantName === null || !object.userData.variantMaterials[variantName]) {
          object.material = object.userData.originalMaterial; 
          return;
        }
  
        if (object.userData.variantMaterials[variantName].material) {
          object.material = object.userData.variantMaterials[variantName].material;
          return;
        }
  
        const materialIndex = object.userData.variantMaterials[variantName].gltfMaterialIndex;
        object.material = await parser.getDependency('material', materialIndex);
        parser.assignFinalMaterial(object);
        object.userData.variantMaterials[variantName].material = object.material;
      };
  
      /**
       * @param object {THREE.Mesh}
       * @return {Promise}
       */
      const ensureLoadVariants = (object: THREE.Mesh): Promise<void | any[]> => {
        const currentMaterial = object.material;
        const variantMaterials = object.userData.variantMaterials;
        const pending = [];
        for (const variantName in variantMaterials) {
          const variantMaterial = variantMaterials[variantName];
          if (variantMaterial.material) {
            continue;
          }
          const materialIndex = variantMaterial.gltfMaterialIndex;
          pending.push(parser.getDependency('material', materialIndex).then((material: any) => {
            object.material = material;
            parser.assignFinalMaterial(object);
            variantMaterials[variantName].material = object.material;
          }));
        }
        return Promise.all(pending).then(() => {
          object.material = currentMaterial;
        });
      };
  
      /**
       * @param object {THREE.Mesh}
       * @param variantName {string|null}
       * @param doTraverse {boolean} Default is true
       * @return {Promise}
       */
      gltf.functions.selectVariant = (object: THREE.Mesh, variantName: string|null, doTraverse: boolean = true): Promise<void[]> => {
        const pending = [];
        if (doTraverse) {
          object.traverse((o: any) => compatibleObject(o) && pending.push(switchMaterial(o, variantName)));
        } else {
          compatibleObject(object) && pending.push(switchMaterial(object, variantName));
        }
        return Promise.all(pending);
      };
  
      /**
       * @param object {THREE.Mesh}
       * @param doTraverse {boolean} Default is true
       * @return {Promise}
       */
      gltf.functions.ensureLoadVariants = (object: THREE.Mesh, doTraverse: boolean = true): Promise<void | any[]> => {
        const pending = [];
        if (doTraverse) {
          object.traverse((o: any) => compatibleObject(o) && pending.push(ensureLoadVariants(o)));
        } else {
          compatibleObject(object) && pending.push(ensureLoadVariants(object));
        }
        return Promise.all(pending);
      };
    }
  }
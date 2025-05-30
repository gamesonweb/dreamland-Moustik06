import {AssetContainer, LoadAssetContainerAsync, Mesh, Scene} from "@babylonjs/core";
import "@babylonjs/loaders";

export class AssetManager {
    private static instance: AssetManager;
    private assets: Map<string, AssetContainer> = new Map();
    private scene: Scene;

    private constructor(scene: Scene) {
        this.scene = scene;
    }

    public static getInstance(scene?: Scene): AssetManager {
        if (!AssetManager.instance && scene) {
            AssetManager.instance = new AssetManager(scene);
        }
        return AssetManager.instance;
    }

    /**
     * Charge un modèle 3D et l'ajoute à la liste des assets
     * @param name Nom de l'asset
     * @param fileName Nom du fichier à charger
     */
    public async loadModel(name: string,fileName: string): Promise<AssetContainer> {
        try {
            const assetContainer = await LoadAssetContainerAsync("assets/models/"+fileName, this.scene,{
                pluginOptions: {
                    gltf: {
                        coordinateSystemMode: 1
                    }
                }
            });
            this.assets.set(name, assetContainer);
            console.log(`Model ${name} loaded successfully`);
            return assetContainer;
        } catch (error) {
            console.error(`Failed to load model ${name}:`, error);
            throw error;
        }
    }

    /**
     * Récupère un asset par son nom
     * @param name Nom de l'asset
     */
    public getAsset(name: string): AssetContainer | undefined {
        return this.assets.get(name);
    }

    /**
     * Ajoute un modèle à la scène
     * @param name Nom de l'asset
     */
    public addModelToScene(name: string): Mesh | null {
        const asset = this.assets.get(name);
        if (!asset) {
            console.warn(`Asset ${name} not found`);
            return null;
        }

        const result = asset.instantiateModelsToScene();
        if (result.rootNodes.length > 0) {
            return result.rootNodes[0] as Mesh;
        }
        return null;
    }

    /**
     * Charge et ajoute le monde à la scène
     */
    public async loadWorld(): Promise<Mesh | null> {
        try {
            await this.loadModel('world', 'world.glb');
            const worldMesh = this.addModelToScene('world');

            if (worldMesh) {
                console.log("World model loaded successfully");
                worldMesh.isPickable = false;
                worldMesh.getChildMeshes().forEach(child => {
                    child.isPickable = false;
                    child.doNotSyncBoundingInfo = true;
                    child.alwaysSelectAsActiveMesh = true;
                    child.freezeWorldMatrix();
                });
                return worldMesh;
            }
            return null;
        } catch (error) {
            console.error("Failed to load world model:", error);
            return null;
        }
    }
}
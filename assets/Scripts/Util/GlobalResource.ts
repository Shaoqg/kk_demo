import { KKLoader, toSprite } from './../Util/KKLoader';
//import PoopObject from "./PoopObject";
import { PreloaderScreen } from '../Screens/PreloaderScreen';
import MasterConfig from '../Gameplay/MasterConfig';


const { ccclass, property } = cc._decorator;

export enum SpriteType {
    UI = "UI",
    UIMain = "UI_main",
    Building = "Tiles",
    Pet = "Pets",
    FX = "fx",
    Tutorial = "tutorial",
    IAP = "iap"
};

@ccclass
export default class GlobalResources {

    static spriteFrames = {};  // 图片存档
    static buildingFrames = {};
    static UIFrames = {}
    static petFrames = {};
    static prefabs = {};
    static animations = {};
    static configFiles : {[filename:string]:cc.JsonAsset} = {};   // 配置文件存档
    static fontFiles = {};     // 文字文件存档
    static spriteFramePromiseMap = {};
    static prefabPromiseMap = {};
    static utilFiles : {[filename:string]:cc.JsonAsset} = {};
    static avatarList = {};//player avatar

    static init() {
        // console.log("Create Sprite Pool on Node", spawnPool.node.name);
    }

    /**
     * 下载字体
     * @param onComplete
     */
    static async startDownloadFonts() {
        let fonts = await KKLoader.loadResDir<cc.Font>("Font", cc.Font);
        fonts.forEach( f =>{
            GlobalResources.fontFiles[f.name] = f;
        });
    }

    // /**
    //  *
    //  * @param onComplete 下载配置文件
    //  */
    // static async startDownloadConfigs() {
    //     PreloaderScreen.addStep("startDownloadConfigs");
    //     let files = await KKLoader.loadResDir<cc.JsonAsset>("Config", cc.JsonAsset);
    //     for(let i = 0; i < files.length; i++) {
    //         GlobalResources.configFiles[files[i].name] = files[i];
    //     }
    // }

    static configFilesReady(){
        return Object.keys(GlobalResources.configFiles).length>0;
    }

    static async downloadAnimations() {
        let animations = await KKLoader.loadResDir<cc.AnimationClip>("Animations", cc.AnimationClip);
        animations.forEach(anim => {
            GlobalResources.animations[anim.name] = anim;
        });
    }

    static async downloadFX() {
        let fxPrefabs = await KKLoader.loadResDir<cc.Prefab>("Prefab/fx", cc.Prefab);
        fxPrefabs.forEach(prefab => {
            GlobalResources.prefabs[prefab.name] = prefab;
        });
    }

    /**
     * 初始化config file
     */
    static readConfigFiles() {
        PreloaderScreen.addStep("readConfigFiles");

        let configs: {} = GlobalResources.configFiles;
        //let config_json: object = configs["config"].json;

        // Smasher wanted multiple config files,
        // ability to add new files without modifying MasterConfig
        for (let fileKey of Object.keys(configs)) {
            let configInFile = configs[fileKey].json;
            let topLevelKeys = Object.keys(configInFile);
            // WARNING - does not handle config split over multiple files
            for (let topKey of topLevelKeys) {
                MasterConfig.allConfig[topKey] = configInFile[topKey];
            }
        }
    }

    static async getPrefab(assetName: string) {
        if(!this.prefabs[assetName]) {
            if(!this.spriteFramePromiseMap[assetName]) {
                this.spriteFramePromiseMap[assetName] = this.fetchPrefab("Prefab/"+assetName);
            }

            this.prefabs[assetName] = await this.spriteFramePromiseMap[assetName];
        }

        return this.prefabs[assetName];
    }

    static async getSpriteFrame(type: SpriteType, assetName: string, callBack?:(sf:cc.SpriteFrame)=>void ): Promise<cc.SpriteFrame> {
        let desiredAsset: cc.SpriteFrame | undefined;
        let targetMap: any;

        //Separating these out due to naming conflicts...
        switch(type) {
            case SpriteType.Building:
                desiredAsset = this.buildingFrames[assetName];
                targetMap = this.buildingFrames;
                break;
            case SpriteType.Pet:
                desiredAsset = this.petFrames[assetName];
                targetMap = this.petFrames;
                break;
            case SpriteType.UI:
                desiredAsset = this.UIFrames[assetName];
                targetMap = this.UIFrames;
                break;
            default:
                desiredAsset = this.spriteFrames[assetName];
                targetMap = this.spriteFrames;
                break;
        }

        if(!desiredAsset) {
            let path = `${type}/${assetName}`;

            let newAsset: cc.SpriteFrame;

            if(!this.spriteFramePromiseMap[assetName]) {
                this.spriteFramePromiseMap[assetName] = this.fetchSpriteFrame(path);
            }

            newAsset = await this.spriteFramePromiseMap[assetName];

            targetMap[assetName] = newAsset;

            if(!newAsset) {
                console.error("Failed to load asset:", path);
                newAsset = this.spriteFrames[assetName] || new cc.SpriteFrame();
            }

            callBack && callBack(newAsset);
            return newAsset;
        } else {
            callBack && callBack(desiredAsset);
            return desiredAsset;
        }
    }

    static async setSprite(nodeOrSprite:cc.Node|cc.Sprite, type: SpriteType, assetName: string, hideUntilActive=true){
        let s = toSprite(nodeOrSprite);
        s[KKLoader.lastFile] = assetName+type;
        hideUntilActive && (s.node.active = false);
        let sf = await this.getSpriteFrame(type, assetName);
        let requestStillValid = s[KKLoader.lastFile] == assetName+type;
        if(requestStillValid){
            s.spriteFrame = sf;
            hideUntilActive && (s.node.active = true);
            return true;
        }
        return false;
    }

    static async fetchSpriteFrame(path: string): Promise<cc.SpriteFrame | undefined> {
        let result = KKLoader.loadSprite(path).catch((err) => {
            console.error('fetchSpriteFrame failed for ', path);
            return undefined;
        });

        return result;
    }

    static async fetchSpriteFrames(paths: string[]): Promise<cc.SpriteFrame[] | undefined> {
        let result = KKLoader.loadSprites(paths).catch((err) => {
            console.error('fetchSpriteFrame failed for ', paths);
            return undefined;
        });

        return result;
    }

    static async fetchPrefab(path: string): Promise<cc.Prefab | undefined> {
        try{
            let result = KKLoader.loadPrefab(path);
            return result;
        } catch(e){
            console.error('fetchPrefab failed for ', path);
            return undefined;
        }
    }

    /**
     * 初始化pet在Inventory中的对象池
     */
    /*static async createPetItemPool() {
        let petitem: cc.Node = await InventoryScreen.instance.creatPetItemPrefab();
        petitem.name = "petitem";
        GlobalResources.spawnPool.addNode(petitem);
    }*/

    /**
     * 在身边显示星星效果
     */
    static startStarFXAnimation(node, dir = 1, posSetting= {
        star1:{x:-50,y:100},
        star2:{x:30,y: 70}
    } ) {
    }


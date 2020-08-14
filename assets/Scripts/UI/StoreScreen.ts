import { ViewConnector } from "../Tools/ViewConnector";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import User from "../Gameplay/User";
import { ConfigSet } from "../Util/ConfigSet";
import { PetConfig, PetType } from "../Config";
import { KKLoader } from "../Util/KKLoader";


const { ccclass, property } = cc._decorator;

@ccclass
export default class StoreScreen extends ViewConnector {
    static prefabPath = 'Screens/StoreScreen';

    static onCloseNode: Function = null;

    static instance:StoreScreen;

    static isShowing:boolean = false;

    static StoreType = {
        Feature: "featured",
        Egg: "egg",
        Coin: "coins"
    }

    @property(cc.Node)
    defaultContent: cc.Node = undefined;

    @property(cc.Node)
    ftueContent: cc.Node = undefined;

    @property(cc.Node)
    featureShop:cc.Node = undefined;

    @property(cc.Node)
    eggShop:cc.Node = undefined;

    @property(cc.Node)
    coinShop:cc.Node = undefined;


    applyData(tab:string){
        let featureTabButton = this.node.getChildByName("root").getChildByName("Tabs").getChildByName("Feature").getComponent<cc.Button>(cc.Button);
        let eggTabButton = this.node.getChildByName("root").getChildByName("Tabs").getChildByName("Eggs").getComponent<cc.Button>(cc.Button);

        //coinsTabButton.enableAutoGrayEffect = true;
        //coinsTabButton.interactable = false;

        this.AdjustGameInterface();
    }

    readonly width = 750;
    readonly Height = 1334;
    readonly MaxScale = 1;
    readonly MinScale = 0.80;
    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
    AdjustGameInterface() {
        let scale = 1;
        let size = cc.view.getFrameSize();
        // console.log(size);
        // let oldValue = this.Height * size.width / size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）

        let oldValue = this.width / this.Height * size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）
        scale = size.width / oldValue;

        if (scale > this.MaxScale) {
            scale = this.MaxScale;
        } else if (scale < this.MinScale) {
            scale = this.MinScale;
        }

        // this.node.width = GameManager.instance.canvas.node.width;

        let blockInput = this.node.getChildByName("block");
        blockInput.width = this.node.width;
        blockInput.height = 1334;

        let rootNode = this.node.getChildByName("root");
        rootNode.scale = scale;

        //adjust root position
        // let posY = 1334 / 2 - CurrencyHud.instance.getTopDistance() - 60;
        // rootNode.y = posY;

        let height = Math.floor( rootNode.convertToWorldSpaceAR(cc.Vec2.ZERO).y / scale);
        rootNode.height = height;

        let bg = rootNode.getChildByName("Background");
        // bg.width = Math.fround(this.node.width / scale);
        // bg.height = Math.ceil(this.Height / scale > bg.height ? this.Height / scale : bg.height) + 20;

    }

    openFeatureTab() {
        this._activateTab(StoreScreen.StoreType.Feature, this.featureShop);
    }

    openEggsTab() {
        this._activateTab(StoreScreen.StoreType.Egg, this.eggShop);
    }

    openCoinsTab() {
        // this._activateTab(StoreScreen.StoreType.Coin, this.coinShop);
    }

    _activateTab(storeName:string, tab:cc.Node) {
       
        this.featureShop.active = false;
        this.eggShop.active = false;

        tab.active = true;

    }

    _loadStore(storeName:string, storeNode:cc.Node) {
    }

    initPetStore(){
        let petInfo = cc.find("", this.node);



    }

    addPet() {
        let pets = this.getPet();

        let petListContent = cc.find("root/Pet/content/petList/content", this.node);
        let item = cc.find("petItem", petListContent);

        pets.forEach((pet)=> {
            let node = cc.instantiate(item);
            node.name = pet.petId;
            let sf = KKLoader.loadSprite("Pets/" + pet.art_asset).then((sf)=>{

            })



        })
    }

    getPet(){
        let level = User.instance.level_castle;

        let config =[];
        PetConfig.forEach(element => {
            switch (level) {
                case 1:
                    if (element.rarity == "common") {
                        config.push(element);
                    }    
                    break;
                case 2:
                    if (element.rarity == "common" || element.rarity == "uncommon") {
                        config.push(element);
                    }      
                    break;                
                case 3:
                    config.push(element);
                    break;
                default:
                    break;
            }
        });

        let id = [
            [ "common", "common" ,"common" ,"common"],
            [ "common", "common" ,"common" ,"common"],
            [ "common", "common" ,"common" ,"uncommon"],
            [ "common", "common" ,"uncommon" ,"rare"],
        ]

        let newPets = id[level] || id[3];
        let newPetConfig:PetType[] = [];
        while(newPets.length <=0) {
            let i = Math.floor(Math.random()* PetConfig.length);
            if (config[i].rarity == newPets[0]) {
                newPetConfig.push(PetConfig[i]);
                PetConfig.slice(i,1)
                newPets.shift();
            }
        }
        return newPetConfig;
    }


    close(results:any) {
        this.node.destroy();
    }

    static async prompt(tab:string = StoreScreen.StoreType.Egg): Promise<void> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = await this.loadView<StoreScreen>(parentNode, StoreScreen);

        vc.applyData(tab);
        this.isShowing = true;

        this.instance = vc;

        let executor = (resolve:(any)=>void, reject:(error)=>void) =>{
            vc.onCloseCallback = resolve;
        }

        return new Promise(executor);
    }


}

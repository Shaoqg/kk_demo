import { ViewConnector } from "../Tools/ViewConnector";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import User from "../Gameplay/User";
import { ConfigSet } from "../Util/ConfigSet";
import { PetConfig, PetType, getPetIntroByElements, Rarity } from "../Config";
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

        this.initPetStore();
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

    initPetStore() {
        this.initPet();

    }

    currentNode = {};
    initPet() {
        let pets = this.getPet();

        let petListContent = cc.find("root/Pet/content/petList/content", this.node);
        let item = cc.find("petItem", petListContent);
        item.active = false;
        pets.forEach((pet)=> {
            let node = cc.instantiate(item);
            node.active = true;
            node.name = pet.petId;
            node.setParent(petListContent);

            let sprite = node.getChildByName("petimage").getComponent(cc.Sprite);
            KKLoader.loadSprite("Pets/" + pet.art_asset).then((sf)=>{
                sprite.spriteFrame = sf;
            });

            let bgNode = cc.find("bg", node);
            let colors = {"common":cc.color(240,255,255),  "uncommon": cc.color(152,0,253), "rare": cc.color(255,255,0)}
            bgNode.color = colors[pet.rarity];

            this.currentNode[pet.petId] = node;

            node.on(cc.Node.EventType.TOUCH_END, ()=>{
                this.onclickPet(pet, node);
            });

        })

        this.onclickPet(pets[0], this.currentNode[pets[0].petId]);
    }

    currentSelectNode:cc.Node = null;
    onclickPet(petType:PetType, node:cc.Node){
        if (this.currentSelectNode) {
            if (this.currentSelectNode.name == petType.petId) {
                return;
            }
            let oldSelectNode = this.currentSelectNode.getChildByName("select");
            oldSelectNode.stopAllActions();
            oldSelectNode.active = false;
        }

        this.currentSelectNode = node;
        let select = node.getChildByName("select");

        select.active = true;
        select.runAction(cc.sequence(
            cc.scaleTo(0.8, 1.1),
            cc.scaleTo(0.8,1)
        ).repeatForever());


        this.updatePetInfo(petType);
    }

    getPet(){
        let level = User.instance.level_castle;

        let selectPet =[];
        PetConfig.forEach(element => {
            switch (level) {
                case 1:
                    if (element.rarity == "common") {
                        selectPet.push(element);
                    }    
                    break;
                case 2:
                    if (element.rarity == "common" || element.rarity == "uncommon") {
                        selectPet.push(element);
                    }      
                    break;                
                case 3:
                    selectPet.push(element);
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
        while(newPets.length > 0) {
            let i = Math.floor(Math.random()* selectPet.length);
            if (selectPet[i].rarity == newPets[0]) {
                newPetConfig.push(selectPet[i]);
                selectPet.splice(i,1)
                newPets.shift();
            }
        }
        return newPetConfig;
    }

    updatePetInfo(pet:PetType) {
        let content = cc.find("root/Pet/content", this.node);
        let petSprite = cc.find("petInfo/petPic", content);

        //load sf
        this.loadSF(pet.art_asset, petSprite);

        //set Type
        this.SetElements([pet.elements as string])

        //set skill
        let label_skill = cc.find("petInfo/skill/label_intro", content).getComponent(cc.Label);
        label_skill.string = getPetIntroByElements(pet.elements as string);

        //set name
        let label_name = cc.find("petInfo/stats/label_petName", content).getComponent(cc.Label);
        label_name.string = pet.petId;

        let label_rarity = cc.find("petInfo/stats/rarity/label", content).getComponent(cc.Label);
        label_rarity.string = pet.rarity as string;

        //set cost
        let costConfig = this.getCost(pet);
        let list = cc.find("list", content)
        let setCostItem = (name:string, str:string) => {
            let costItem = list.getChildByName(name);
            if (str) {
                costItem.active = true;
                costItem.getChildByName("label_progress").getComponent(cc.Label).string = str;
            }else{
                costItem.active = false;
            }
        }
        setCostItem("coin", "500");
        setCostItem("food", null);
        setCostItem("stone", null);
        if (costConfig.food) {
            setCostItem("food", "food\n" + costConfig.food);
        }
        if (costConfig.stone) {
            setCostItem("stone", "magic rock\n" + costConfig.stone);
        }

        //set button
        

    }

    getCost(petType: PetType):{coin:number, food?:number, stone?:number}{
        switch (petType.rarity) {
            case Rarity.common:
                return {coin:200,food:20, stone:1};
            case Rarity.uncommon:
                return {coin:200, food:20};
            case Rarity.rare:
                return {coin:200, food:20, stone:1};
        }
        return {coin:200};
    }


    loadSF(art:string ,node:cc.Node){
        KKLoader.loadSprite("Pets/" + art).then((sf)=>{
            node.getComponent(cc.Sprite).spriteFrame = sf;
        });
    }
    typesNode:cc.Node = null;
    natureNode:cc.Node = null;
    fireNode:cc.Node = null;
    waterNode:cc.Node = null;
    snackNode:cc.Node = null;
    SetElements(elements:string[]){ 
        // background graphics
        
        if (!this.natureNode) {
            this.typesNode = cc.find("root/Pet/content/petInfo/type/typeLayout", this.node);
            this.natureNode = cc.find("type_land", this.typesNode);
            this.fireNode = cc.find("type_fire", this.typesNode);
            this.waterNode = cc.find("type_water", this.typesNode);
            this.snackNode = cc.find("type_snack", this.typesNode);
        }    
        this.natureNode.active = false;
        this.fireNode.active = false;
        this.waterNode.active = false;
        this.snackNode.active = false;

        // element icons
        elements.forEach(element => {
            switch(element){
                case "nature":
                    this.natureNode.active = true;
                break;
                case "fire":
                    this.fireNode.active = true;
                break;
                case "water":
                    this.waterNode.active = true;
                break;
                case "snack":
                    this.snackNode.active = true;
                break;
            }
        });
    }


    close(results:any) {
        this.node.active = false;
    }

    static async prompt(tab:string = StoreScreen.StoreType.Egg): Promise<void> {
        let parentNode = cc.find("Canvas/DialogRoot");

        if (!this.instance) {
            let vc = await this.loadView<StoreScreen>(parentNode, StoreScreen);
            vc.applyData(tab);
            this.instance = vc;
        }else{
            this.instance.node.active = true;
        }

        this.isShowing = true;

        let executor = (resolve:(any)=>void, reject:(error)=>void) =>{
            this.instance.onCloseCallback = resolve;
        }

        return new Promise(executor);
    }


}

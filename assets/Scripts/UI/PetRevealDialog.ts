import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from "../Tools/ScreenSize";
import User from "../Gameplay/User";
import { KKLoader } from "../Util/KKLoader";
import { getPetConfigById, Rarity, PetType, getPetIntroByElements, PetData, getStrengthByPetData } from "../Config";
import { EventEmitter, EventType } from "../Tools/EventEmitter";



export type PetUpdateResourse = {
    Resourse: string,
    number: number
}

export type petBouns = {
    BounsName: string,
    BounsNum: number
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetRevealDialog extends ViewConnector {
    static prefabPath = 'Prefab/PetRevealDialog';

    static instance: PetRevealDialog = null;
    static instancePromise: Promise<PetRevealDialog>;

    static _isShowing: boolean = false;
    closeCallBack: Function = null;
    showShare: boolean = true;
    petNode: cc.Node = null;
    petSprite: cc.Sprite = null;
    petSpriteLock: cc.Node = null;

    private readonly _defaultPosition = cc.v2(0, -42);//-42  + 150/2

    petTips: cc.Node = null;
    petLevelLabel: cc.Label = null;
    petTipsLabel: cc.Label = null;
    // tipsType: TipsType = null;

    petLevelBar: cc.Node = null;

    buttonBack: cc.Node = null;
    inputMaskNode: cc.Node = null;

    petInfoNode: cc.Node = null;
    petTypeImageNode: cc.Node = null;

    mergeinfo: any = null;

    petData: PetData = null;
    // petConfig: PetConfigModel = null;

    static _instance: PetRevealDialog = null;

    UpgradeButton: cc.Node;
    petconfig:PetType;

    static async prompt(closeCallBack: Function = null, info: any = null, showShare: boolean = false): Promise<void> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = PetRevealDialog._instance = await this.loadView<PetRevealDialog>(parentNode, PetRevealDialog);

        vc.setShowPetInfo(closeCallBack, info);
        PetRevealDialog.instance = vc;
        this._isShowing = true;

        return;
    }

    //debug




    init(data: PetData) {
        if (this.petSprite)
            return;
        let that = this;

     
        
        this.petInfoNode = cc.find("petInfo/content/stats", this.node);

        this.petLevelBar = this.node.getChildByName("petLevelBar");

        let petNode = this.node.getChildByName("petNode");
        this.petNode = petNode.getChildByName("petPic");

        this.buttonBack = this.node.getChildByName("backButton");
        this.buttonBack.on(cc.Node.EventType.TOUCH_END, () => this.close(undefined));
        this.buttonBack.active = true;

        this.inputMaskNode = this.node.getChildByName("inputMask");
        this.inputMaskNode.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.buttonBack.active) {
                this.close(undefined);
            }
        })
        this.UpgradeButton = this.node.getChildByName("UpgradeButton");
        this.UpgradeButton.on(cc.Node.EventType.TOUCH_END, () => {
            this.upgradePet(data)

        });

        this.setPetInfoName(data);
        this.setPetInfo();
        this.setPetLevel(data);
        this.setPetType();
        this.setPetRarity();
        this.setPetNeedtoUpgrade();
        this.setPetSpriteFrame();
        this.setPetStrength(data)

       this.checkPetInAdventure(data);
       
        this.adjustGameInterface();
    }

    async setPetSpriteFrame() {
        this.petNode.getComponent(cc.Sprite).spriteFrame = await KKLoader.loadSprite("Pets/" + this.petconfig.art_asset);
    }

    getCost(petType: PetType):{coin:number, food?:number, magic_stone?:number}{
        switch (petType.rarity) {
            case Rarity.common:
                return {coin:200,food:20, magic_stone:1};
            case Rarity.uncommon:
                return {coin:200, food:20};
            case Rarity.rare:
                return {coin:200, food:20, magic_stone:1};
        }
        return {coin:200};
    }
    
    upgradePet(data: PetData) {
        data.petLevel++;

        let cost=this.getCost(this.petconfig);

        console.log("cost",cost);
        if(cost.coin){
            User.instance.coin -= cost.coin;
        }
        if(cost.food){
            User.instance.food -= cost.food;
        }
        if(cost.magic_stone){
            User.instance.magic_stone -= cost.magic_stone;
        }
        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);
        EventEmitter.emitEvent(EventType.STAR_INCREASE);
        this.refresh(data)
    }
    refresh(data) {
        this.setPetInfoName(data);
        this.setPetInfo();
        this.setPetLevel(data);
        this.setPetType();
        this.setPetNeedtoUpgrade();
    }

    currentScale = 1;
    readonly width = 750;
    readonly Height = 1334;
    readonly MaxScale = 1;
    readonly MinScale = 0.80;
    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.node.scale = scale;
    }


    petSwitchSprite: cc.Sprite = null;
    petSwitchLock: cc.Node = null;
    petShadow: cc.Node = null;
    currentSkin = 0;

    setShowPetInfo(closeCallBack, petData: PetData) {
        this.petData = petData;


        this.petconfig=getPetConfigById(petData.petId);
        this.init(petData);
        
    }

    setPetInfoName(data: PetData) {
        let petname = this.petInfoNode.getChildByName("label_petName").getComponent(cc.Label);
        petname.string = data.petName;
    }

    setPetInfo() {
        let petInfo = this.petInfoNode.getChildByName("label_petInfo").getComponent(cc.Label);
        petInfo.string = getPetIntroByElements(this.petconfig);
    }

    setPetLevel(data: PetData) {
        let level = this.petInfoNode.getChildByName("level");
        level.getChildByName("label_level").getComponent(cc.Label).string =data.petLevel.toString();
    }
    setPetRarity(){
        let petRare = cc.find("rarity/label", this.petInfoNode).getComponent(cc.Label);
        petRare.string=this.petconfig.rarity.toString();
    }

    setPetType() {
        let petType = cc.find("type/typeLayout", this.petInfoNode);
        let natureNode = cc.find("type_land", petType);
        let fireNode = cc.find("type_fire", petType);
        let waterNode = cc.find("type_water", petType);
        let snackNode = cc.find("type_snack", petType);
        natureNode.active = false;
        fireNode.active = false;
        waterNode.active = false;
        snackNode.active = false;

        // element icons
        switch (this.petconfig.elements) {
            case "nature":
                natureNode.active = true;
                break;
            case "fire":
                fireNode.active = true;
                break;
            case "water":
                waterNode.active = true;
                break;
            case "snack":
                snackNode.active = true;
                break;
        };

    }

    setPetNeedtoUpgrade() {
        let resource = cc.find("resource/resourceLayout", this.petInfoNode);

        let MagicNode = cc.find("Magic", resource);
        let FoodNode = cc.find("Food", resource);
        let CoinNode = cc.find("Coin", resource);

        MagicNode.active = false;
        FoodNode.active = false;
        CoinNode.active = false;

        let lesscount = 0;

        let cost = this.getCost(this.petconfig);
        if (cost.coin) {
            CoinNode.active = true;
            CoinNode.getChildByName("label").getComponent(cc.Label).string = "Coin:\n" + User.instance.coin + "/" + cost.coin;
            if (User.instance.coin < cost.coin) {
                lesscount++;
            }
        }
        if (cost.food) {
            FoodNode.active = true;
            FoodNode.getChildByName("label").getComponent(cc.Label).string = "Food:\n" + User.instance.food + "/" + cost.food;
            if (User.instance.food < cost.food) {
                lesscount++;
            }
        }
        if (cost.magic_stone) {
            MagicNode.active = true;
            MagicNode.getChildByName("label").getComponent(cc.Label).string = "Magic Stone:\n" + User.instance.magic_stone + "/" + cost.magic_stone;
            if (User.instance.magic_stone < cost.magic_stone) {
                lesscount++;
            }
        }

        if (lesscount > 0) {
            this.node.getChildByName("ButtonBlock").active = true;
        } else {
            this.node.getChildByName("ButtonBlock").active = false;
        }

    }

    setPetStrength(data: PetData) {
        let strengthLabel = cc.find("Strength", this.petInfoNode).getComponent(cc.Label);
        let strength = getStrengthByPetData(data);
        strengthLabel.string = "Strength:" + strength
    }
    
    checkPetInAdventure(data:PetData){
        let pets=User.instance.AdventurePets;
        let isinAdventrue=false
        pets.forEach((pet)=>{
            if(pet.petId==data.petId){
                isinAdventrue = true;
            }
        })

        if(!this.node.getChildByName("ButtonBlock").active){
            this.node.getChildByName("ButtonBlock").active = isinAdventrue;
        }
       this.node.getChildByName("PetInAdventure").active = isinAdventrue;
    }


    static close() {
        if (this._instance) {
            this._instance.close({});
            this._instance.destroy();
            this._instance = undefined;
        }
    }

}

import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import User from "../Gameplay/User";
import { PetData, getPetConfigById, PetType, Rarity, getStrengthByPetData } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
const { ccclass, property } = cc._decorator;

@ccclass
export class PetUpgrade extends ViewConnector {


    static prefabPath = 'Prefab/PetUpgrade';

    static _instance: PetUpgrade = null;

    root: cc.Node = null;
    pet: cc.Node;
    rewarditem: cc.Node;
    petsNowUsing: PetData[];
    UpgradeButton: cc.Node;
    petInfoNode: cc.Node;
    petconfig: PetType;
    petData:PetData;
    petNode: cc.Node;

    static async prompt(petdata:PetData): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = PetUpgrade._instance = await this.loadView<PetUpgrade>(parentNode, PetUpgrade);

        vc.applyData(petdata);

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    static close() {
        if (this._instance) {
            this._instance.close({});
            this._instance.destroy();
            this._instance = undefined;
        }
    }

    applyData(petdata:PetData) {

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        this.petInfoNode = cc.find("stats", this.root);
        this.petNode = cc.find("petNode", this.root);

        this.UpgradeButton = this.root.getChildByName("UpgradeButton");
        this.UpgradeButton.on(cc.Node.EventType.TOUCH_END, () => {
            this.upgradePet(petdata)

        });

        this.petconfig=getPetConfigById(petdata.petId);
        this.petData = petdata;

        this.setPetInfoName(petdata);
        this.setPetLevel(petdata);
        this.setPetType();
        this.setPetRarity();
        this.setPetNeedtoUpgrade();
        this.setPetSpriteFrame();
        this.setPetStrength(petdata)

        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }


    setPetLevel(data: PetData) {
        let level = this.petInfoNode.getChildByName("level");
        level.getChildByName("label_level").getComponent(cc.Label).string =data.petLevel.toString();
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
    
    setPetRarity() {
        let petRare = cc.find("rarity/label", this.petInfoNode).getComponent(cc.Label);
        petRare.string=this.petconfig.rarity.toString();
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

        let cost = this.getCost(this.petconfig, this.petData.petLevel);
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
            this.root.getChildByName("ButtonBlock").active = true;
        } else {
            this.root.getChildByName("ButtonBlock").active = false;
        }
    }

    async setPetSpriteFrame() {
        this.petNode.getChildByName("petPic").getComponent(cc.Sprite).spriteFrame = await KKLoader.loadSprite("Pets/" + this.petconfig.art_asset);
    }

    setPetStrength(data: PetData) {
        let strengthLabel = cc.find("Strength", this.petInfoNode).getComponent(cc.Label);
        let strength = getStrengthByPetData(data);
        strengthLabel.string = "Strength:" + strength
    }

    setPetInfoName(data: PetData) {
        let petname = this.petInfoNode.getChildByName("label_petName").getComponent(cc.Label);
        petname.string = data.petName;
    }

    upgradePet(data: PetData) {
        data.petLevel++;
        this.petData = data;
        let cost=this.getCost(this.petconfig, data.petLevel);

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

    refresh(data: PetData) {
        this.setPetInfoName(data);
        this.setPetLevel(data);
        this.setPetType();
        this.setPetNeedtoUpgrade();
        this.setPetStrength(data)
    }

    getCost(petType: PetType, level:number):{coin:number, food?:number, magic_stone?:number}{
        let food = 0;
        let coin = 0;
        let magic_stone = 1;

        
        switch (petType.rarity) {
            case Rarity.common:
                coin = 1000 * level;
                return {coin:coin,food:Math.pow(2, level+1)};
            case Rarity.uncommon:
                coin = 1500 * level;
                return {coin:coin, food:Math.pow(2, level+2)};
            case Rarity.rare:
                coin = 2000 * level;
                return {coin:coin, food:Math.pow(2, level+3), magic_stone:1};
        }
        return {coin:200};
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
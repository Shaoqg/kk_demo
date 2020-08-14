import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from "../Tools/ScreenSize";
import { PetData } from "./PetList";
import User from "../Gameplay/User";
import { KKLoader } from "../Util/KKLoader";
import { getPetConfigById, Rarity, PetType } from "../Config";
import { EventEmitter, EventType } from "../Tools/EventEmitter";



export type PetInfo = {
    petId: string,
    petName: string;
    petinfo: string,
    petBouns:petBouns,
    petNeedUpgrade: PetUpdateResourse[]
}

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
    info: PetInfo;
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

        this.adjustGameInterface();
    }

    async setPetSpriteFrame() {
        this.petNode.getComponent(cc.Sprite).spriteFrame = await KKLoader.loadSprite("Pets/" + this.petconfig.art_asset);
    }

    upgradePet(data: PetData) {
        data.petLevel++;
        this.info.petNeedUpgrade.forEach((res) => {
            switch (res.Resourse) {
                case "Wood":
                     User.instance.wood -= res.number
                    break;
                case "Food":
                    User.instance.food -= res.number
                    break;
                case "Coin":
                    User.instance.coin -= res.number
                    break;
            }
        });
        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);
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


        let petInfos: PetInfo[] = []
       
        petInfos=User.instance.petInfos;
        petInfos.forEach((info) => {
            if (info.petId == petData.petId) {
                this.info=info
                this.petconfig=getPetConfigById(this.info.petId);
                this.init(petData);
                return;
            }
        });
    }

    setPetInfoName(info: PetData) {
        let petname = this.petInfoNode.getChildByName("label_petName").getComponent(cc.Label);
        petname.string = info.petName;
    }

    setPetInfo() {
        let petInfo = this.petInfoNode.getChildByName("label_petInfo").getComponent(cc.Label);
        petInfo.string = this.info.petinfo;
    }

    setPetLevel(data: PetData) {
        let level = this.petInfoNode.getChildByName("level");
        level.getChildByName("label_level").getComponent(cc.Label).string =data.petLevel.toString();
    }
    setPetRarity(){
        let petRare = cc.find("rarity/label", this.petInfoNode).getComponent(cc.Label);
        petRare.string=this.petconfig.rarity;
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

        let WoodNode = cc.find("Wood", resource);
        let FoodNode = cc.find("Food", resource);
        let CoinNode = cc.find("Coin", resource);

        WoodNode.active = false;
        FoodNode.active = false;
        CoinNode.active = false;

        let lesscount = 0;



        this.info.petNeedUpgrade.forEach((res) => {
            switch (res.Resourse) {
                case "Wood":
                    WoodNode.active = true;
                    WoodNode.getChildByName("label").getComponent(cc.Label).string = "Wood:" +  User.instance.wood + "/" + res.number;
                    if ( User.instance.wood < res.number) {
                        lesscount++;
                    }
                    break;
                case "Food":
                    FoodNode.active = true;
                    FoodNode.getChildByName("label").getComponent(cc.Label).string = "Food:" + User.instance.food + "/" + res.number;
                    if (User.instance.food < res.number) {
                        lesscount++;
                    }
                    break;
                case "Coin":
                    CoinNode.active = true;
                    CoinNode.getChildByName("label").getComponent(cc.Label).string = "Fuel:" + User.instance.coin + "/" + res.number;
                    if (User.instance.coin < res.number) {
                        lesscount++;
                    }
                    break;
            }
        });

        if (lesscount > 0) {
            this.node.getChildByName("ButtonBlock").active = true;
        } else {
            this.node.getChildByName("ButtonBlock").active = false;
        }

    }


    static close() {
        if (this._instance) {
            this._instance.close({});
            this._instance.destroy();
            this._instance = undefined;
        }
    }

}

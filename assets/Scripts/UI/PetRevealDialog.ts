import { ViewConnector } from "../Tools/ViewConnector";
import { PetData } from "./PetList";
import ScreenSize from "../Tools/ScreenSize";

type PetInfo = {
    petId: string,
    petName: string;
    petData: PetData,
    petinfo: string,
    petNeedUpgrade: PetUpdateResourse[]
}

type PetUpdateResourse = {
    Resourse: string,
    number: number
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

    static async prompt(closeCallBack: Function = null, info: any = null, showShare: boolean = false): Promise<void> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = PetRevealDialog._instance = await this.loadView<PetRevealDialog>(parentNode, PetRevealDialog);

        vc.setShowPetInfo(closeCallBack, info);
        PetRevealDialog.instance = vc;
        this._isShowing = true;

        return;
    }

    //debug
    bullethas = 15;
    woodhas = 15;
    foodhas = 15;
    fuelhas = 15;



    init(info: PetInfo) {
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
            this.upgradePet(info)

        });

        this.setPetInfoName(info);
        this.setPetInfo(info);
        this.setPetLevel(info);


        this.setPetType(info);
        this.setPetRarity(info);

        this.setPetNeedtoUpgrade(info);

        this.adjustGameInterface();
    }
    upgradePet(info: PetInfo) {
        info.petData.petLevel++;
        info.petNeedUpgrade.forEach((res) => {
            switch (res.Resourse) {
                case "Bullet":
                    this.bullethas -= res.number
                    break;
                case "Wood":
                    this.woodhas -= res.number
                    break;
                case "Food":
                    this.foodhas -= res.number
                    break;
                case "Fuel":
                    this.fuelhas -= res.number
                    break;
            }
        });

        this.refresh(info)
    }
    refresh(info) {
        this.setPetInfoName(info);
        this.setPetInfo(info);
        this.setPetLevel(info);
        this.setPetType(info);
        this.setPetNeedtoUpgrade(info);
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

        let resourseWood: PetUpdateResourse = {
            Resourse: "Wood",
            number: 3,
        }

        let resourseBullet: PetUpdateResourse = {
            Resourse: "Bullet",
            number: 6,
        }
        let resourseFuel: PetUpdateResourse = {
            Resourse: "Fuel",
            number: 1,
        }
        let resourseFood: PetUpdateResourse = {
            Resourse: "Food",
            number: 5,
        }

        let petInfos: PetInfo[] = []
        let petinfo: PetInfo = {
            petId: "1",
            petName:"pet1",
            petData: petData,
            petinfo: "it is a frog",
            petNeedUpgrade: [resourseWood, resourseBullet, resourseFood],
        }
        petInfos.push(petinfo)
        petInfos.forEach((info) => {
            if (petinfo.petId == petData.petid || true) {
                this.init(info);
                return;
            }
        })


    }

    setPetInfoName(info: PetInfo) {
        let petname = this.petInfoNode.getChildByName("label_petName").getComponent(cc.Label);
        petname.string = info.petName;
    }

    setPetInfo(info: PetInfo) {
        let petInfo = this.petInfoNode.getChildByName("label_petInfo").getComponent(cc.Label);
        petInfo.string = info.petinfo;
    }

    setPetLevel(info: PetInfo) {
        let level = this.petInfoNode.getChildByName("level");
        level.getChildByName("label_level").getComponent(cc.Label).string = info.petData.petLevel.toString();
    }
    setPetRarity(info:PetInfo){
        let petRare = cc.find("rarity/label", this.petInfoNode).getComponent(cc.Label);
        petRare.string=info.petData.petRare;
    }

    setPetType(info: PetInfo) {
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
        info.petData.petType.forEach(element => {
            switch (element) {
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
            }
        });

    }

    setPetNeedtoUpgrade(info: PetInfo) {
        let resource = cc.find("resource/resourceLayout", this.petInfoNode);

        let BulletNode = cc.find("Bullet", resource);
        let WoodNode = cc.find("Wood", resource);
        let FoodNode = cc.find("Food", resource);
        let FuelNode = cc.find("Fuel", resource);

        BulletNode.active = false;
        WoodNode.active = false;
        FoodNode.active = false;
        FuelNode.active = false;

        let lesscount = 0;



        info.petNeedUpgrade.forEach((res) => {
            switch (res.Resourse) {
                case "Bullet":
                    BulletNode.active = true;
                    BulletNode.getChildByName("label").getComponent(cc.Label).string = "Bullet:" + this.bullethas + "/" + res.number;
                    if (this.bullethas < res.number) {
                        lesscount++;
                    }
                    break;
                case "Wood":
                    WoodNode.active = true;
                    WoodNode.getChildByName("label").getComponent(cc.Label).string = "Wood:" + this.woodhas + "/" + res.number;
                    if (this.woodhas < res.number) {
                        lesscount++;
                    }
                    break;
                case "Food":
                    FoodNode.active = true;
                    FoodNode.getChildByName("label").getComponent(cc.Label).string = "Food:" + this.foodhas + "/" + res.number;
                    if (this.foodhas < res.number) {
                        lesscount++;
                    }
                    break;
                case "Fuel":
                    FuelNode.active = true;
                    FuelNode.getChildByName("label").getComponent(cc.Label).string = "Fuel:" + this.fuelhas + "/" + res.number;
                    if (this.fuelhas < res.number) {
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

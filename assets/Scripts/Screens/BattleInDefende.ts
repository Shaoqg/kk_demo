import { ViewConnector } from "../Tools/ViewConnector";
import User from "../Gameplay/User";
import { PetData, getPetConfigById} from "../Config";
import { KKLoader } from "../Util/KKLoader";
import ScreenSize from "../Tools/ScreenSize";


const { ccclass, property } = cc._decorator;

@ccclass
export class BattleInDefende extends ViewConnector {
    static prefabPath = 'Prefab/BattleInDefende';

    static onCloseNode: Function = null;

    static _instance: BattleInDefende;
    root: cc.Node;
    spendtime: number;

    static async prompt(success: boolean): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = BattleInDefende._instance = await this.loadView<BattleInDefende>(parentNode, BattleInDefende);

        vc.applyData(success);

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

    applyData(success: boolean) {
        let underlay = cc.find("underlay", this.node);
        if (success) {
            this.root = cc.find("content", this.node);
            cc.find("content2", this.node).active = false;
            this.root.active = true
            let Pets = User.instance.getPetsNowUsing("Defence");
            this.setPets(Pets);
        } else {
            this.root = cc.find("content2", this.node);
            cc.find("content", this.node).active = false;
            this.root.active = true
        }

        this.setRewardInfo()

        if (!success){
             User.instance.areaExploring["unknow"]=false
             User.instance.areaCapture["unknow"]=false
             User.instance.areaCaptureStartTime["unknow"]=0
             User.instance.areaCaptureTimeTakenReward["unknow"]=0
             User.instance.areaCaptureStopTime["unknow"]=0
             User.instance.removePetFromInAdventure("Defence");
             User.instance.saveUse();
        }

        let btn_return = cc.find("button_primary", this.root)

        btn_return.on(cc.Node.EventType.TOUCH_END, async () => {
            this.close(undefined);
        })


        this.adjustGameInterface();

        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }

    setRewardInfo() {
        this.spendtime = Math.floor((User.instance.areaCaptureTimeTakenReward["unknow"] - User.instance.areaCaptureStartTime["unknow"]) / 1000 / 60)
        let tips = cc.find("tips", this.root).getComponent(cc.Label);
        tips.string = "We've been defending for " + this.spendtime + " minutes now"

        let woodlabel = cc.find("reward/rewardWood/rewardCountLabel", this.root).getComponent(cc.Label);
        let stonelabel = cc.find("reward/rewardStone/rewardCountLabel", this.root).getComponent(cc.Label);
        let foodlabel = cc.find("reward/rewardFood/rewardCountLabel", this.root).getComponent(cc.Label);

        woodlabel.string = "x" + 5 * this.spendtime
        stonelabel.string = "x" + 15 * this.spendtime
        foodlabel.string = "x" + 10 * this.spendtime
    }


    setPets(Pets: PetData[]) {
        Pets.forEach(async (pet, idx) => {
            let petImage = cc.find("defPets/pet"+(idx+1)+"/petImage", this.root).getComponent(cc.Sprite);
            let petconfig = getPetConfigById(pet.petId);
            petImage.spriteFrame = await KKLoader.loadSprite("Pets/" + petconfig.art_asset);
        })
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}

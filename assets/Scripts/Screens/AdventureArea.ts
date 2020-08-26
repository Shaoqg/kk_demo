import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { petBouns } from "../UI/PetRevealDialog";
import User from "../Gameplay/User";
import { Adventure } from "./Adventure";
import WorldManager from "../Gameplay/WorldManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { AdventureAreas, getPetConfigById } from "../Config";
import { BattleArea } from "./BattleArea";
import { BattleInDefende } from "./BattleInDefende";
import { KKLoader } from "../Util/KKLoader";
const { ccclass, property } = cc._decorator;

@ccclass
export class AdventureArea extends ViewConnector {


    static prefabPath = 'Prefab/AdventureArea';

    static _instance: AdventureArea = null;

    root: cc.Node = null;
    rewarditem: cc.Node;

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = AdventureArea._instance = await this.loadView<AdventureArea>(parentNode, AdventureArea);

        vc.applyData();

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

    applyData() {

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        let list = cc.find("scrollview/list", this.root);
        AdventureAreas.forEach((area) => {
            let areaNode = list.getChildByName("area_" + area.areaName);
            let progressLab = areaNode.getChildByName("areaProgress").getComponent(cc.Label);
            let levelStar = cc.find("level_star/level_starProgress", areaNode).getComponent(cc.Sprite)
            if (User.instance.exploreTime[area.areaName] >= area.areaCompletetime) {
                progressLab.string = "100%";
                levelStar.fillRange = 1;
            } else {
                let UsrProgress = Math.round((User.instance.exploreTime[area.areaName] / area.areaCompletetime) * 1000) / 10;
                progressLab.string = UsrProgress.toString() + "%";
                levelStar.fillRange = User.instance.exploreTime[area.areaName] / area.areaCompletetime;
            }

            areaNode.on(cc.Node.EventType.TOUCH_END, () => {
                this.close(undefined);
                Adventure.prompt(area.areaName);
            });
        })

        let areaNode = list.getChildByName("area_unknown");
        this.PlacePetsInBattle();
        areaNode.on(cc.Node.EventType.TOUCH_END, async () => {
            // this.close(undefined);
            console.log("area_unknown");
            if (User.instance.areaExploring["unknow"]) {
                await BattleInDefende.prompt(User.instance.areaCapture["unknow"]);
                this.PlacePetsInBattle();
            } else {
                await Adventure.prompt("area_unknown");
                this.PlacePetsInBattle();
            }
        });

        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }

    PlacePetsInBattle() {
        if (User.instance.areaExploring["unknow"]) {
            let pets = User.instance.getPetsNowUsing("Defence");
            pets.forEach(async (pet, idx) => {
                let petNode = cc.find("scrollview/list/area_unknown/defencePets/pet" + (idx + 1), this.root);
                let petImage = cc.find("petImage", petNode).getComponent(cc.Sprite);
                let empty = cc.find("empty", petNode);

                empty.active = false;

                let petconfig = getPetConfigById(pet.petId)
                petImage.spriteFrame = await KKLoader.loadSprite("Pets/" + petconfig.art_asset);

            })
        } else {
            for (let i = 0; i < 4; i++) {
                let petNode = cc.find("scrollview/list/area_unknown/defencePets/pet" + (i + 1), this.root);
                let petImage = cc.find("petImage", petNode).getComponent(cc.Sprite);
                let empty = cc.find("empty", petNode);

                empty.active = true;
                petImage.spriteFrame = null
            }

        }
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import User from "../Gameplay/User";
import { Adventure } from "./Adventure";
import { AdventureAreas, getPetConfigById, PetData, Resource } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import { setSpriteSize, timeToString } from "../Tools/UIUtils";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";
import AdventureManager from "../Gameplay/AdventureManager";
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


        this.initArea();

        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }


    update(dt) {
        for (const key in this.cbList) {
            this.cbList[key] && this.cbList[key](dt);
        }
    }

    areaCB: { [areaName: string]: {} } = {};
    initArea() {

        let list = cc.find("scrollview/list", this.root);
        AdventureAreas.forEach((area) => {
            let areaNode = list.getChildByName("area_" + area.areaName);

            let info = User.instance.getAreaInfo(area.areaName);

            let exploreInfo = AdventureManager.instance.getExploreReward(area.areaName);
            this.updateTimeInfo(areaNode, exploreInfo);

            let pets = AdventureManager.instance.areaInfo[area.areaName];
            this.updatePetInfo(areaNode, pets.petDatas);

            this.updateLevelInfo(areaNode, info.levelInfo);

            let rewardNum = AdventureManager.instance.getAreaReward(area.areaName, info.levelInfo);
            this.updateRewardInfo(areaNode, rewardNum, area.reward);

            areaNode.on(cc.Node.EventType.TOUCH_END, () => {
                this.close(null);
                Adventure.prompt(area.areaName);
            })
        })
    }

    cbList:{[areaName:string]: Function} = {};
    updateTimeInfo(areaNode: cc.Node, info: { multiple: number, time: number }) {
        let label_bonus = cc.find("label_bonus", areaNode).getComponent(cc.Label);
        if (info) {
            label_bonus.node.active = true;

            this.updateTimelabel(label_bonus, info.time/1000,  info.multiple);
            label_bonus.node.runAction(cc.sequence(
                cc.scaleTo(0.8, 1.1),
                cc.scaleTo(0.8, 1)
            ).repeatForever());

            let timeTemp = 0.5;
            let timeTotal = info.time/1000;
            this.cbList[areaNode.name] = (dt)=>{
                timeTemp -= dt;
                timeTotal -= dt;
                if (timeTemp <=0) {
                    timeTemp += 0.5;
                    if (timeTotal <= 0) {
                        this.updateTimeInfo(areaNode, null);//close node
                        this.updatePetInfo(areaNode, null);
                    }else{//update label
                        this.updateTimelabel(label_bonus, timeTotal, info.multiple);
                    }
                }
            };
        } else {
            this.cbList[areaNode.name] = null;
            label_bonus.node.stopAllActions();
            label_bonus.node.active = false;


        }
    }

    updateTimelabel(label: cc.Label, time: number, multiple:number) {
        
        label.string = `Bonus x ${multiple}\n${timeToString(Math.floor(time))}`;
    }

    updatePetInfo(areaNode: cc.Node, petDatas: PetData[]) {
        let petList = cc.find("petList", areaNode);

        let index = -1;
        petList.children.forEach((petNode: cc.Node) => {
            if (petNode.name.includes("pet")) {
                index++;
                let petData = petDatas && petDatas.length - 1 >= index ? petDatas[index] : null;

                let emptyNode = cc.find("empty", petNode);
                let petImage = cc.find("petImage", petNode).getComponent(cc.Sprite);
                if (petData) {
                    emptyNode.active = false;
                    let config = getPetConfigById(petData.petId);
                    petImage.spriteFrame = null;
                    GlobalResources.getSpriteFrame(SpriteType.Pet, config.art_asset, (sf) => {
                        setSpriteSize(petImage, sf);
                    })
                } else {
                    emptyNode.active = true;
                }
            } else {
                console.error("pls check node");
            }
        })
    }

    updateRewardInfo(areaNode: cc.Node, reward: number, resType: Resource) {
        let rewardNode = cc.find("rewardNode", areaNode);

        let label = cc.find("label_reward", rewardNode).getComponent(cc.Label);
        let resImage = cc.find("image", rewardNode).getComponent(cc.Sprite);

        label.string = `${reward} /min`;

        GlobalResources.getSpriteFrame(SpriteType.UI, resType, (sf) => {
            resImage.spriteFrame = sf;
        });

    }

    updateLevelInfo(areaNode: cc.Node, info: { level: number, star: number }) {
        let levelNode = cc.find("levelNode", areaNode);

        let label_level = cc.find("label", levelNode).getComponent(cc.Label);
        label_level.string = `Lvl${info.level}-${info.star}`;

        let starNodes = levelNode.children.filter((node) => node.name.includes("bg"));
        starNodes.forEach((node, i) => {
            let image = node.getComponent(cc.Sprite);
            image.setMaterial(0, this.getMaterials(i <= info.star - 1));
        });

    }

    getMaterials(isNormal = false) {
        let sprite_materials = cc.find("scrollview/materials", this.root).getComponent(cc.Sprite);//0:normal, 1:gray

        return sprite_materials.getMaterial(isNormal ? 0 : 1);
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
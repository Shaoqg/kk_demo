import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { petBouns } from "../UI/PetRevealDialog";
import User from "../Gameplay/User";
import { Adventure } from "./Adventure";
import WorldManager from "../Gameplay/WorldManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { AdventureAreas, Trees, TreeNeed, getRotaryRewardByIndex, RotaryReward, Resource, RewardType, RotaryType, getPetConfigById, PetType } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import { AdventureReward } from "./AdventureReward";
import { delay } from "../kk/DataUtils";
import UIManager from "../UI/UIMananger";
import { GardenPets } from "../Pet/GardenPets";
const { ccclass, property } = cc._decorator;

@ccclass
export class RotaryScreen extends ViewConnector {

    static prefabPath = 'Prefab/RotaryScreen';

    static _instance: RotaryScreen = null;

    root: cc.Node = null;
    rewarditem: cc.Node;
    list1: cc.Node;
    list2: cc.Node;
    list3: cc.Node;
    item: cc.Node;
    parent: cc.Node;
    updateTime: number = 0;
    startRotating: boolean = false;
    itemidx: number = 0;
    turns: number;
    turnsNeed: number;
    rotatingSpeed: number = 0.1;
    finsishItem: RotaryType;
    randomStopStart: number;
    turnsSlowDown: number;
    num: number;
    area: any;
    btn_start: cc.Node;
    btn_gry: cc.Node;
    petissucess: boolean;

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = RotaryScreen._instance = await this.loadView<RotaryScreen>(parentNode, RotaryScreen);

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

        this.item = cc.find("item", this.node);
        this.parent = cc.find("rotating", this.root);

        this.btn_start = cc.find("button_primary/button", this.root);
        this.btn_gry = cc.find("button_primary/button_gry", this.root);

        this.area = this.checkHeightestProgress()
        this.setAreaBg()
        this.setAreaProgress()

        this.num = 20

        for (let i = 0; i < this.num; i++) {
            this.createItem(i)
        }

        let areaprogress = User.instance.exploreTime[this.area.areaName] / this.area.areaCompletetime;
        if (areaprogress >= 1) {
            this.btn_start.active = true;
            this.btn_gry.active = false;
        } else {
            this.btn_start.active = false;
            this.btn_gry.active = true;
        }

        this.btn_start.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onClickStart()
        });


        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));


        let btn_addProgress = cc.find("btn_addProgress", this.node);
        btn_addProgress.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclick_progress()
        });
        //this.adjustGameInterface();
    }

    onClickStart(itemConfig?: RotaryType) {
        cc.find("item0", this.parent).getChildByName("bg_selected").active = true;

        this.itemidx = 0;

        let rewardSelected = this.chooseReward();
        this.finsishItem = rewardSelected;

        //Debug
        if (itemConfig) {
            this.finsishItem = itemConfig;
        }

        this.turns = 0;
        this.turnsNeed = Math.round(Math.random() * 2 + 2);
        this.turnsSlowDown = this.turnsNeed
        this.rotatingSpeed = 0.1;
        console.log("we rotate " + this.turnsNeed + " round");

        let stopBefore = Math.round(15 - Math.random() * 5);
        if (this.finsishItem.index - stopBefore < 0) {
            this.turnsSlowDown -= 1;
            this.randomStopStart = this.num - (stopBefore - this.finsishItem.index);
        } else {
            this.randomStopStart = this.finsishItem.index - stopBefore
        }

        this.startRotating = true
        this.btn_start.active = false
        this.btn_gry.active = true
    }

    update(dt) {
        if (!this.startRotating) {
            return;
        }
        this.updateTime += dt;
        if (this.updateTime >= this.rotatingSpeed) {
            this.updateTime -= this.rotatingSpeed;
            this.gotoNextItem();
        }
    }

    gotoNextItem() {
        this.itemidx++;

        if (this.itemidx > 19) {
            this.itemidx = 0;
            this.turns++;
            cc.find("item19", this.parent).getChildByName("bg_selected").active = false;
            cc.find("item" + this.itemidx, this.parent).getChildByName("bg_selected").active = true;
        } else {
            cc.find("item" + (this.itemidx - 1), this.parent).getChildByName("bg_selected").active = false;
            cc.find("item" + this.itemidx, this.parent).getChildByName("bg_selected").active = true;
        }

        if (this.turns == this.turnsSlowDown) {
            if (this.randomStopStart <= this.itemidx) {
                this.rotatingSpeed += 0.02;
            }
        }
        if (this.turns == this.turnsSlowDown + 1) {
            this.rotatingSpeed += 0.02;
        }
        if (this.finsishItem.index == this.itemidx && this.turns == this.turnsNeed) {
            this.startRotating = false;
            this.getReward()
        }

    }

    async getReward() {
        switch (this.finsishItem.reward.rewardType) {
            case Resource.coin:
                let rewardCoins = this.finsishItem.reward.rewardNum;
                console.log("get coins " + rewardCoins);
                User.instance.coin += rewardCoins;
                break;
            case Resource.wood:
                let rewardWood = this.finsishItem.reward.rewardNum;
                console.log("get wood " + rewardWood);
                User.instance.wood += rewardWood;
                break;
            case Resource.stone:
                let rewardStone = this.finsishItem.reward.rewardNum;
                console.log("get stone " + rewardStone);
                User.instance.star += rewardStone;
                break;
            case Resource.food:
                let rewardFood = this.finsishItem.reward.rewardNum;
                console.log("get food " + rewardFood);
                User.instance.food += rewardFood;
                break;
            case Resource.magicStone:
                let rewardMagicStone = this.finsishItem.reward.rewardNum;
                console.log("get magicStone " + rewardMagicStone);
                User.instance.magic_stone += rewardMagicStone;
                break;
            case Resource.pet:
                let petconfig = getPetConfigById(this.finsishItem.reward.petId);
                console.log("get pet ", petconfig);
                this.petissucess = User.instance.addPet(petconfig)
                GardenPets.setIslandPets(true);
                
                break;
        }

        AdventureAreas.forEach((area) => {
            if (this.area.areaName == area.areaName) {
                User.instance.exploreTime[area.areaName] = 0;
            }
        })

        EventEmitter.emitEvent(EventType.CHECK_AREA_COMPELETE);
        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);

        let reward: RewardType[]
        if (this.finsishItem.reward.rewardType == Resource.pet) {
            reward = [{
                rewardType: Resource.pet,
                rewardNum: this.finsishItem.reward.rewardNum,
                petId: this.finsishItem.reward.petId
            }]
        } else {
            reward = [{
                rewardType: this.finsishItem.reward.rewardType,
                rewardNum: this.finsishItem.reward.rewardNum
            }]
        }

        await delay(1);
        await AdventureReward.prompt(reward, this.petissucess);
        this.refreshRotary()
    }

    refreshRotary() {
        cc.find("item" + this.itemidx, this.parent).getChildByName("bg_selected").active = false;

        this.area = this.checkHeightestProgress()
        this.setAreaBg()
        this.setAreaProgress()

        let areaprogress = User.instance.exploreTime[this.area.areaName] / this.area.areaCompletetime;
        if (areaprogress >= 1) {
            this.btn_start.active = true;
            this.btn_gry.active = false;
        } else {
            this.btn_start.active = false;
            this.btn_gry.active = true;
        }

    }

    async createItem(index: number) {
        let item = cc.instantiate(this.item);
        this.parent.addChild(item);
        item.name = "item" + index
        if (index >= 0 && index <= 5) {
            item.x = -250 + index * 100
            item.y = 250
        } else if (index >= 6 && index <= 10) {
            item.x = 250
            item.y = 150 - (index - 6) * 100
        } else if (index >= 11 && index <= 15) {
            item.x = 150 - (index - 11) * 100
            item.y = -250
        } else if (index >= 16 && index <= 19) {
            item.x = -250
            item.y = -150 + (index - 16) * 100
        }
        let rewardNum = item.getChildByName("rewardNum").getComponent(cc.Label);
        let rewardImage = item.getChildByName("rewardimage").getComponent(cc.Sprite);
        let itemConfig = getRotaryRewardByIndex(index);
        let path = "";
        switch (itemConfig.reward.rewardType) {
            case Resource.coin:
                path = "UI/coin_reward";
                break;
            case Resource.wood:
                path = "UI/wood";
                break;
            case Resource.stone:
                path = "UI/stone";
                break;
            case Resource.food:
                path = "UI/food";
                break;
            case Resource.magicStone:
                path = "UI/magic_rock";
                break;
            case Resource.pet:
                let petconfig = getPetConfigById(itemConfig.reward.petId);
                path = "Pets/" + petconfig.art_asset;
                let bgNode = cc.find("bg", item);
                let colors = { "common": cc.color(240, 255, 255), "uncommon": cc.color(152, 0, 253), "rare": cc.color(255, 255, 0) }
                bgNode.color = colors[petconfig.rarity];
                break;
            default:
                path = "UI/coin_reward";
        }
        rewardNum.string = "x" + itemConfig.reward.rewardNum.toString();
        rewardImage.spriteFrame = await KKLoader.loadSprite(path);

        //Debug
        item.on(cc.Node.EventType.TOUCH_END, () => {
            let areaprogress = User.instance.exploreTime[this.area.areaName] / this.area.areaCompletetime;
            if (areaprogress >= 1) {
                this.onClickStart(itemConfig)
            }
        });
    }



    chooseReward(): RotaryType {
        let rewardSelected: RotaryType;

        let total = this._calculateWeightTotal();

        let aggregatedWeightsMap = this._aggregateWeights();

        let pick = Math.random() * total;
        //console.log("Random number " + pick + "/" + total);

        for (let index = 0; index < aggregatedWeightsMap.length; ++index) {
            let pair = aggregatedWeightsMap[index];
            let reward = pair.reward;
            let weight = pair.weight;
            //console.log("Check " + key + ":" + value);
            if (pick <= weight) {
                //console.log("Success! set SliceId to " + key);
                rewardSelected = reward;
                break;
            }
        }
        return rewardSelected;
    }

    _calculateWeightTotal(): number {
        let total = 0;
        RotaryReward.forEach((reward) => {
            total += reward.weight;
        });

        return total;
    }

    _aggregateWeights() {
        let keyToThresholdMap = [];
        let summedWeights: number = 0;

        RotaryReward.forEach((reward) => {
            summedWeights += reward.weight;
            keyToThresholdMap.push({ reward: reward, weight: summedWeights });
        });

        return keyToThresholdMap;
    }

    checkHeightestProgress() {
        let areaHeightest;
        let progress = 0;
        AdventureAreas.forEach((area) => {
            let areaprogress = User.instance.exploreTime[area.areaName] / area.areaCompletetime;
            if (progress <= areaprogress) {
                progress = areaprogress;
                areaHeightest = area;
            }
        })
        return areaHeightest;
    }

    async setAreaBg() {
        let path = ""
        let areaImage = cc.find("area_BG/bg", this.root).getComponent(cc.Sprite);
        path = "adventure_area/area_" + this.area.areaName;
        areaImage.spriteFrame = await KKLoader.loadSprite(path);
    }

    setAreaProgress() {
        let progressLabel = cc.find("progress", this.root).getComponent(cc.Label);
        let progressBar = cc.find("progressBarFront", this.root).getComponent(cc.ProgressBar);
        let progressBarCompelete = cc.find("progressBarCompelete", progressBar.node);

        let areaprogress = User.instance.exploreTime[this.area.areaName] / this.area.areaCompletetime;
        if(areaprogress>=1){
            progressLabel.string = "100%"
            progressBar.progress = 1;
            progressBarCompelete.active = true;
        }else{
            progressLabel.string = Math.round(areaprogress * 1000) / 10 + "%"
            progressBar.progress = areaprogress;
            progressBarCompelete.active = false;
        }
    }

    onclick_progress() {
        User.instance.exploreTime["water"] = User.instance.exploreTime["water"] + 360;
        User.instance.exploreTime["fire"] = User.instance.exploreTime["fire"] + 360;
        User.instance.exploreTime["food"] = User.instance.exploreTime["food"] + 360;
        User.instance.exploreTime["nature"] = User.instance.exploreTime["nature"] + 360;
        User.instance.saveUse();
        this.refreshRotary()
        EventEmitter.emitEvent(EventType.CHECK_AREA_COMPELETE);
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
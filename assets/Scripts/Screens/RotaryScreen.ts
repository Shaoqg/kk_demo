import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { petBouns } from "../UI/PetRevealDialog";
import User from "../Gameplay/User";
import { Adventure } from "./Adventure";
import WorldManager from "../Gameplay/WorldManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { AdventureAreas, Trees, TreeNeed, getRotaryRewardByIndex, RotaryReward } from "../Config";
import { KKLoader } from "../Util/KKLoader";
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
    itemidx: number;
    turns: number;
    turnsNeed: number;
    rotatingSpeed: number=1;
    finsishItem: any;

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

        let btn_start = cc.find("button_primary/button", this.root);
        let btn_gry = cc.find("button_primary/button_gry", this.root);

        let num = 20

        for (let i = 0; i < num; i++) {
            this.createItem(i)
        }

        btn_start.on(cc.Node.EventType.TOUCH_END, () => {
            cc.find("item0", this.parent).getChildByName("bg_selected").active = true;
            this.itemidx = 0;
            this.turns = 0;
            this.turnsNeed = Math.round(Math.random()*2+3);
            console.log("we rotate "+this.turnsNeed+" round");
            this.startRotating = true
            btn_gry.active = true
            //debug
            let rewardSelected=this.chooseSlice();
            console.log(rewardSelected);
            this.finsishItem=rewardSelected;
        });


        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }

    update(dt) {
        if (!this.startRotating) {
            return;
        }
        this.updateTime += dt;
        if (this.updateTime >= 0.1/this.rotatingSpeed) {
            this.updateTime -= 0.1/this.rotatingSpeed;
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
        if(this.turns==this.turnsNeed-1||this.turns==this.turnsNeed){
            this.rotatingSpeed-=(20/this.finsishItem.index)*0.015;
        }
        if(this.finsishItem.index==this.itemidx&&this.turns==this.turnsNeed){
            this.startRotating=false;
            this.getReward()
        }

    }

    getReward(){
        console.log(this.finsishItem.reward);
        switch(this.finsishItem.reward.rewardType){
            case "coins":
                let rewardCoins=this.finsishItem.reward.rewardNum;
                console.log("get coins "+rewardCoins);
                User.instance.coin+=rewardCoins;
                break;
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
        let rewardNum=item.getChildByName("rewardNum").getComponent(cc.Label);
        let rewardImage=item.getChildByName("rewardimage").getComponent(cc.Sprite);
        let itemConfig=getRotaryRewardByIndex(index);
        let path = "";
        switch (itemConfig.reward.rewardType) {
            case "coins":
                path = "UI/hud_icon_coin";
                break;
            case "wood":
                path = "UI/wood";
                break;
            case "stone":
                path = "UI/deco_fire-rock1_v2";
                break;
            case "food":
                path = "UI/food_04";
                break;
            case "magicStone":
                path = "UI/magic_rock";
                break;
            default:
                path = "UI/hud_icon_coin";
        }
        rewardNum.string="x"+itemConfig.reward.rewardNum.toString();
        rewardImage.spriteFrame = await KKLoader.loadSprite(path);
    }

    chooseSlice() : string {
        let sliceId = "";

        let total = this._calculateWeightTotal();

        let aggregatedWeightsMap = this._aggregateWeights();

        let pick = Math.random() * total;
        //console.log("Random number " + pick + "/" + total);

        for(let index = 0; index < aggregatedWeightsMap.length; ++index) {
            let pair = aggregatedWeightsMap[index];
            let key = pair.reward;
            let value = pair.weight;
            //console.log("Check " + key + ":" + value);
            if(pick <= value) {
                //console.log("Success! set SliceId to " + key);
                sliceId = key;
                break;
            }
        }

        return sliceId;
    }

    _calculateWeightTotal() : number {
        let total = 0;
        RotaryReward.forEach((reward) => {
            total += reward.weight;
        });

        return total;
    }

    _aggregateWeights()  {
        let keyToThresholdMap = [];
        let summedWeights: number = 0;

        RotaryReward.forEach((reward) => {
            summedWeights += reward.weight;
            keyToThresholdMap.push({reward:reward, weight:summedWeights});
        });

        return keyToThresholdMap;
    }


    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
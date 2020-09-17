import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { petBouns } from "../UI/PetRevealDialog";
import User from "../Gameplay/User";
import { Adventure } from "./Adventure";
import WorldManager from "../Gameplay/WorldManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { RewardType, Resource, PetData } from "../Config";
import PetItem from "../UI/PetItem";
const { ccclass, property } = cc._decorator;

@ccclass
export class AdventureReward extends ViewConnector {


    static prefabPath = 'Prefab/AdventureReward';

    static _instance: AdventureReward = null;

    root: cc.Node = null;
    rewarditem: cc.Node;

    static async prompt(rewards:RewardType[],issucess:boolean=true): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = AdventureReward._instance = await this.loadView<AdventureReward>(parentNode, AdventureReward);

        vc.applyData(rewards,issucess);

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

    applyData(rewards:RewardType[],issucess:boolean=true) {

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        let go = cc.find("button_primary", this.root);
        let scroll=cc.find("scroll",this.root);
        let petNode=cc.find("pet",this.root);
        let rewardWoodNode = cc.find("scroll/rewards/rewardWood", this.root);
        let rewardStoneNode = cc.find("scroll/rewards/rewardStone", this.root);
        let rewardCoinNode = cc.find("scroll/rewards/rewardCoin", this.root);
        let rewardFoodNode = cc.find("scroll/rewards/rewardFood", this.root);
        let rewardMagicStoneNode = cc.find("scroll/rewards/rewardMagicStone", this.root);

        if (rewards.length == 2) {
            let rewardNode = cc.find("scroll/rewards", this.root);
            rewardNode.getComponent(cc.Layout).paddingTop = 70
        } else if (rewards.length == 1) {
            let rewardNode = cc.find("scroll/rewards", this.root);
            rewardNode.getComponent(cc.Layout).paddingTop = 140
        }




        //debug
        rewards.forEach((reward) => {
            switch (reward.rewardType) {
                case Resource.coin:
                    rewardCoinNode.active = true;
                    rewardCoinNode.getChildByName("reward").getComponent(cc.Label).string = "Coins x" + reward.rewardNum;
                    if (!reward.bounds) {
                        rewardCoinNode.getChildByName("bounds").active = false;
                    } else {
                        rewardCoinNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + reward.bounds + "%";
                    }
                    User.instance.addResource(reward.rewardType, reward.rewardNum);
                    break;
                case Resource.wood:
                    rewardWoodNode.active = true;
                    rewardWoodNode.getChildByName("reward").getComponent(cc.Label).string = "Wood x" + reward.rewardNum;
                    if (!reward.bounds) {
                        rewardWoodNode.getChildByName("bounds").active = false;
                    } else {
                        rewardWoodNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + reward.bounds + "%";
                    }
                    User.instance.addResource(reward.rewardType, reward.rewardNum);
                    break;
                case Resource.stone:
                    rewardStoneNode.active = true;
                    rewardStoneNode.getChildByName("reward").getComponent(cc.Label).string = "Stone x" + reward.rewardNum;
                    if (!reward.bounds) {
                        rewardStoneNode.getChildByName("bounds").active = false;
                    } else {
                        rewardStoneNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + reward.bounds + "%";
                    }
                    User.instance.addResource(reward.rewardType, reward.rewardNum);
                    break;
                case Resource.food:
                    rewardFoodNode.active = true;
                    rewardFoodNode.getChildByName("reward").getComponent(cc.Label).string = "Food x" + reward.rewardNum;
                    if (!reward.bounds) {
                        rewardFoodNode.getChildByName("bounds").active = false;
                    } else {
                        rewardFoodNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + reward.bounds + "%";
                    }
                    User.instance.addResource(reward.rewardType, reward.rewardNum);
                    break;
                case Resource.magicStone:
                    rewardMagicStoneNode.active = true;
                    rewardMagicStoneNode.getChildByName("reward").getComponent(cc.Label).string = "Magic Stone x" + reward.rewardNum;
                    if (!reward.bounds) {
                        rewardMagicStoneNode.getChildByName("bounds").active = false;
                    } else {
                        rewardMagicStoneNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + reward.bounds + "%";
                    }
                    User.instance.addResource(reward.rewardType, reward.rewardNum);
                    break;
                case Resource.pet:
                    scroll.active = false;
                    petNode.active = true;
                    let petList=User.instance.getPetList();
                   let petData:PetData;

                    petList.forEach((pet)=>{
                        if(pet.petId==reward.petId){
                            petData=pet;
                        }
                    })
                    let petItem = petNode.getChildByName("PetItem").getComponent(PetItem);
                    petItem.Init(petData);

                    if(!issucess){
                        cc.find("PetItem/New",petNode).active = false;
                        let Tips =petNode.getChildByName("Tips").getComponent(cc.Label);
                        Tips.string="You already have this pet";
                    }else{
                        cc.find("PetItem/Star",petNode).active = false;
                    }
                    
            }
        })
        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);


        go.once(cc.Node.EventType.TOUCH_END, () => {
            this.close(undefined);
        });


        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { petBouns } from "../UI/PetRevealDialog";
import User from "../Gameplay/User";
import { Adventure } from "./Adventure";
import WorldManager from "../Gameplay/WorldManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
const { ccclass, property } = cc._decorator;

@ccclass
export class AdventureReward extends ViewConnector {


    static prefabPath = 'Prefab/AdventureReward';

    static _instance: AdventureReward = null;

    root: cc.Node = null;
    rewarditem: cc.Node;

    static async prompt(boundsAll: petBouns[]): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = AdventureReward._instance = await this.loadView<AdventureReward>(parentNode, AdventureReward);

        vc.applyData(boundsAll);

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

    applyData(boundsAll: petBouns[]) {

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        let go = cc.find("button_primary", this.root);

        let rewardWoodNode = cc.find("rewardWood", this.root);
        let rewardStoneNode = cc.find("rewardStone", this.root);
        let rewardCoinNode = cc.find("rewardCoin", this.root);

        //debug

        let rewards=Adventure._instance.getResource(boundsAll)
        
        rewardWoodNode.getChildByName("reward").getComponent(cc.Label).string = "Wood x" + rewards.wood;
        rewardStoneNode.getChildByName("reward").getComponent(cc.Label).string = "Stone x" + rewards.stone;
        rewardCoinNode.getChildByName("reward").getComponent(cc.Label).string = "Coins x" + rewards.coins;

        rewardWoodNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + rewards.boundsWood + "%";
        rewardStoneNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + rewards.boundsStone + "%";
        rewardCoinNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + rewards.boundsCoin + "%";

        User.instance.coin+=rewards.coins;
        User.instance.stone+=rewards.stone;
        User.instance.wood+=rewards.wood;   

        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);


        go.once(cc.Node.EventType.TOUCH_END, () => {
            this.close(undefined);
            Adventure.close();
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
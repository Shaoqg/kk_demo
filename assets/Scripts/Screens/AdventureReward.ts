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
        let wood = 15;
        let stone = 10;
        let coins = 100;


        let boundsWood = 0;
        let boundsStone = 0;
        let boundsCoin = 0;
        boundsAll.forEach((bounds) => {
            switch (bounds.BounsName) {
                case "Wood":
                    boundsWood = bounds.BounsNum;
                    break;
                case "Stone":
                    boundsStone = bounds.BounsNum;
                    break;
                case "Coin":
                    boundsCoin = bounds.BounsNum;
                    break;
            }
        });
        
        wood = Math.floor(wood * (1 + boundsWood / 100));
        stone = Math.floor(stone * (1 + boundsStone / 100));
        coins = Math.floor(coins * (1 + boundsCoin / 100));

        rewardWoodNode.getChildByName("reward").getComponent(cc.Label).string = "Wood x" + wood;
        rewardStoneNode.getChildByName("reward").getComponent(cc.Label).string = "Stone x" + stone;
        rewardCoinNode.getChildByName("reward").getComponent(cc.Label).string = "Coins x" + coins;

        rewardWoodNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + boundsWood + "%";
        rewardStoneNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + boundsStone + "%";
        rewardCoinNode.getChildByName("bounds").getComponent(cc.Label).string = "+" + boundsCoin + "%";

        User.instance.coin+=coins;
        User.instance.stone+=stone;
        User.instance.wood+=wood;   

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
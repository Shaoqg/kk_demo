import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { delay } from "../kk/DataUtils";
import { Strike } from "./Strike";
const { ccclass, property } = cc._decorator;

@ccclass
export class StrikeReward extends ViewConnector {
    @property(cc.Button)
    closeButton: cc.Button = null;

    @property(cc.SpriteFrame)
    SpriteFrame: cc.SpriteFrame[] = [];


    static prefabPath = 'Prefab/StrikeReward';

    static _instance: StrikeReward = null;

    root: cc.Node = null;
    rewarditem: cc.Node;

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/Main Camera/DialogRoot");
        let vc = StrikeReward._instance = await this.loadView<StrikeReward>(parentNode, StrikeReward);

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

        this.rewarditem = cc.find("rewarditem", this.node);
        let petListInfo = [];

        //debug
        for(let i=0;i<=25;i++){
            petListInfo.push(Math.floor(Math.random()*this.SpriteFrame.length));
        }

        let go = cc.find("button_primary", this.root);
        let scrollview = cc.find("scrollview", this.root);
        let list = cc.find("list", scrollview);
        list.height = 11;

        petListInfo.forEach((info, idx) => {
            this.createList(info, idx);
        });

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


    createList(petListInfo: any, idx: number) {
        let rewarditem = cc.instantiate(this.rewarditem);
        let list = cc.find("scrollview/list", this.root);
        let rewardimage = rewarditem.getChildByName("rewardimage").getComponent(cc.Sprite);
        rewardimage.spriteFrame=this.SpriteFrame[petListInfo];
        list.addChild(rewarditem);
        if (idx % 5 == 0) {
            list.height += rewarditem.height + 11;
        }

        rewarditem.y = -(rewarditem.height / 2 + 11) - (Math.floor(idx / 5) * (rewarditem.height + 11));
        rewarditem.x = (idx % 5) * (rewarditem.width + 11) + (rewarditem.width / 2 + 11);

    }


    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
const { ccclass, property } = cc._decorator;

@ccclass
export class CastleScreen extends ViewConnector {

    static prefabPath = 'Prefab/ShipUpgrade';

    static _instance: CastleScreen = null;

    root: cc.Node = null;
    rewarditem: cc.Node;

    shipParts = ["speed", "capacity", "bouns"];
    Level: number = 1;

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/Main Camera/DialogRoot");
        let vc = CastleScreen._instance = await this.loadView<CastleScreen>(parentNode, CastleScreen);

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

        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }

    updateCastleInfo(level){
        let label_level = cc.find("", this.node).getComponent(cc.Label);
        let label_petNumber = cc.find("", this.node).getComponent(cc.Label);

    }

    updateList(){
        let config = this.getLevelUpInfo(this.Level)

        //TODO show list info

        let lists = cc.find("content/list", this.node).children;
        lists.forEach((node)=>{
            let name = node.name.split("_")[1]

        })

    }

    onclickLevelUp(){
        //TODO level up
        this.close(null);
    }

    getLevelInfo(level){
        let levelupConfig= [
            {
                pet:5,
            },
            {
                pet:7,
            },
            {
                pet:10,
            },
            ]
        return levelupConfig[level - 1];
    }

    getLevelUpInfo(level) {
        let levelupConfig= [
            {
                coin:100,
                wood:5,
                pet:2,
                ship:1,
            },
            {
                coin:200,
                wood:50,
                ship:2,
                pet:5,
            },
            {
                coin:200,
                wood:500,
                ship:2,
                pet:5,
            },
        ]

        return levelupConfig[level - 1];
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
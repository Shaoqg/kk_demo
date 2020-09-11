import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { ElementType, IsLandType } from "../Config";
import BuildManager from "../Gameplay/Build/BuildMananger";
import CastleManager from "../Gameplay/Build/CastaleManager";

const { ccclass, property } = cc._decorator;

@ccclass
export class BuildModel extends ViewConnector {

    static prefabPath = 'Prefab/BuildModel';

    static instance: BuildModel = null;

    root: cc.Node = null;

    static async prompt(type: IsLandType): Promise<any> {
        if (!!BuildModel.instance) {
            return;
        }
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = BuildModel.instance = await this.loadView<BuildModel>(parentNode, BuildModel);

        vc.applyData(type);

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    close(any) {
        super.close(any);
        if (BuildModel.instance) {
            BuildModel.instance = null;
        }
    }

    applyData(type: IsLandType) {

        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        this.initTopButtom(type);

        let underlay = cc.find("underlay", this.node);
        underlay.on(cc.Node.EventType.TOUCH_END, () => {
            this.close(null);
            this._closeAll();
        })
    }


    initTopButtom(type: IsLandType) {
        let btn_ship = cc.find("btn_ship", this.root);
        let btn_build = cc.find("btn_build", this.root);
        let btn_castle = cc.find("btn_castle", this.root);

        btn_ship.on(cc.Node.EventType.TOUCH_END, () => this.onClickTopBtn("btn_ship"));
        btn_build.on(cc.Node.EventType.TOUCH_END, () => this.onClickTopBtn("btn_build"));
        btn_castle.on(cc.Node.EventType.TOUCH_END, () => this.onClickTopBtn("btn_castle"));

        switch (type) {
            case IsLandType.castle:
                this._topState = "btn_castle";
                this.switchState("btn_castle");
                this.switchTopBtnState("btn_castle");
                break;
            default:
                this._topState = "btn_build";
                this.switchState("btn_build", type);
                this.switchTopBtnState("btn_build");
                break;
        }
    }

    _topState: "btn_build" | "btn_castle" | "btn_ship" = null;
    onClickTopBtn(name: "btn_build" | "btn_castle" | "btn_ship") {
        if (this._topState == name) {
            return;
        }
        this._topState = name;

        this.switchState(name);
        this.switchTopBtnState(name);
    }

    switchTopBtnState(name: "btn_build" | "btn_castle" | "btn_ship") {
        let btn_ship = cc.find("btn_ship", this.root);
        let btn_build = cc.find("btn_build", this.root);
        let btn_castle = cc.find("btn_castle", this.root);

        let btns = [btn_build, btn_castle, btn_ship];
        btns.forEach((node) => {
            node.getChildByName("line").active = node.name != name;
            node.getChildByName("bg").color = node.name == name ? cc.color(255, 239, 208) : cc.color(255, 207, 86);
        })
    }

    switchState(name: "btn_build" | "btn_castle" | "btn_ship", type?: IsLandType) {
        cc.find("ship", this.root).active = name == "btn_ship";
        cc.find("build", this.root).active = name == "btn_build";
        cc.find("castle", this.root).active = name == "btn_castle";

        switch (name) {
            case "btn_ship":
                this.initShip();
                break;
            case "btn_build":
                this.initBuild(type);
                break;
            case "btn_castle":
                this.initCastle();
                break;
            default:
                break;
        }
    }

    initBuild(type: IsLandType) {
        // BuildManager.
        let node = cc.find("build", this.root);
        BuildManager.instance.initBuild(node, type);
    }

    initCastle() {
        let node = cc.find("castle", this.root);
        CastleManager.instance.initBuild(node);
    }

    initShip() {
        let node = cc.find("ship", this.root);

    }

    _closeAll() {
        BuildManager.instance.close();
        CastleManager.instance.close();
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
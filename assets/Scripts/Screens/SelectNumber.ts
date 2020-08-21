import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
const { ccclass, property } = cc._decorator;

@ccclass
export class SelectNumber extends ViewConnector {
    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Node)
    btn_increase: cc.Node = null;

    @property(cc.Node)
    btn_reduce: cc.Node = null;

    @property(cc.Node)
    btn_increaseToTop: cc.Node = null;

    @property(cc.Node)
    btn_reduceToButtom: cc.Node = null;

    @property(cc.Label)
    NumLabel: cc.Label = null;


    static prefabPath = 'Prefab/SelectNumber';

    static _instance: SelectNumber = null;

    root: cc.Node = null;
    rewarditem: cc.Node;
    num: any;

    static async prompt(title: string, number: number, Buttom: number, Top: number): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = SelectNumber._instance = await this.loadView<SelectNumber>(parentNode, SelectNumber);

        vc.applyData(title, number, Buttom, Top);

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    static close() {
        if (this._instance) {
            this._instance.close();
            this._instance.destroy();
            this._instance = undefined;
        }
    }

    applyData(title: string, number: number, Buttom: number, Top: number) {

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        this.num = number;
        this.NumLabel.string = this.num.toString();

        this.title.string = title


        this.btn_increase.on(cc.Node.EventType.TOUCH_END, () => {
            console.log(this.num, Top);

            if (this.num < Top) {
                this.num++;
            }
            this.NumLabel.string = this.num.toString();
        })

        this.btn_reduce.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.num > Buttom) {
                this.num--;
            }
            this.NumLabel.string = this.num.toString();
        })

        this.btn_increaseToTop.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.num < Top) {
                this.num = Top;
            }
            this.NumLabel.string = this.num.toString();
        })

        this.btn_reduceToButtom.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.num > Buttom) {
                this.num = Buttom;
            }
            this.NumLabel.string = this.num.toString();
        })

        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

    }

    close() {
        this.node.removeFromParent(true);
        this.onClose();
        this.onCloseCallback && this.onCloseCallback(this.num);
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
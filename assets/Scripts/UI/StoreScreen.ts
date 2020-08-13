import { ViewConnector } from "../Tools/ViewConnector";
import { EventEmitter, EventType } from "../Tools/EventEmitter";


const { ccclass, property } = cc._decorator;

@ccclass
export default class StoreScreen extends ViewConnector {
    static prefabPath = 'Screens/StoreScreen';

    static onCloseNode: Function = null;

    static instance:StoreScreen;

    static isShowing:boolean = false;

    static StoreType = {
        Feature: "featured",
        Egg: "egg",
        Coin: "coins"
    }

    @property(cc.Node)
    defaultContent: cc.Node = undefined;

    @property(cc.Node)
    ftueContent: cc.Node = undefined;

    @property(cc.Node)
    featureShop:cc.Node = undefined;

    @property(cc.Node)
    eggShop:cc.Node = undefined;

    @property(cc.Node)
    coinShop:cc.Node = undefined;


    applyData(tab:string){
        let featureTabButton = this.node.getChildByName("root").getChildByName("Tabs").getChildByName("Feature").getComponent<cc.Button>(cc.Button);
        let eggTabButton = this.node.getChildByName("root").getChildByName("Tabs").getChildByName("Eggs").getComponent<cc.Button>(cc.Button);

        //coinsTabButton.enableAutoGrayEffect = true;
        //coinsTabButton.interactable = false;

        this.AdjustGameInterface();
    }

    readonly width = 750;
    readonly Height = 1334;
    readonly MaxScale = 1;
    readonly MinScale = 0.80;
    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
    AdjustGameInterface() {
        let scale = 1;
        let size = cc.view.getFrameSize();
        // console.log(size);
        // let oldValue = this.Height * size.width / size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）

        let oldValue = this.width / this.Height * size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）
        scale = size.width / oldValue;

        if (scale > this.MaxScale) {
            scale = this.MaxScale;
        } else if (scale < this.MinScale) {
            scale = this.MinScale;
        }

        // this.node.width = GameManager.instance.canvas.node.width;

        let blockInput = this.node.getChildByName("block");
        blockInput.width = this.node.width;
        blockInput.height = 1334;

        let rootNode = this.node.getChildByName("root");
        rootNode.scale = scale;

        //adjust root position
        // let posY = 1334 / 2 - CurrencyHud.instance.getTopDistance() - 60;
        // rootNode.y = posY;

        let height = Math.floor( rootNode.convertToWorldSpaceAR(cc.Vec2.ZERO).y / scale);
        rootNode.height = height;

        let bg = rootNode.getChildByName("Background");
        // bg.width = Math.fround(this.node.width / scale);
        // bg.height = Math.ceil(this.Height / scale > bg.height ? this.Height / scale : bg.height) + 20;

    }

    openFeatureTab() {
        this._activateTab(StoreScreen.StoreType.Feature, this.featureShop);
    }

    openEggsTab() {
        this._activateTab(StoreScreen.StoreType.Egg, this.eggShop);
    }

    openCoinsTab() {
        // this._activateTab(StoreScreen.StoreType.Coin, this.coinShop);
    }

    _activateTab(storeName:string, tab:cc.Node) {
       
        this.featureShop.active = false;
        this.eggShop.active = false;

        tab.active = true;

    }

    _loadStore(storeName:string, storeNode:cc.Node) {
    }


    close(results:any) {
        this.node.destroy();
    }

    static async prompt(tab:string = StoreScreen.StoreType.Egg): Promise<void> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = await this.loadView<StoreScreen>(parentNode, StoreScreen);

        vc.applyData(tab);
        this.isShowing = true;

        this.instance = vc;

        let executor = (resolve:(any)=>void, reject:(error)=>void) =>{
            vc.onCloseCallback = resolve;
        }

        return new Promise(executor);
    }


}

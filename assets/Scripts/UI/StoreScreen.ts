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

    private activeStore:StoreBase = null;

    private idToStoreScriptMap = {};

    private idToStoreOpenFunctionMap = {};

    private alteredY:number = 0;

    applyData(tab:string){
        let featureTabButton = this.node.getChildByName("root").getChildByName("Tabs").getChildByName("Feature").getComponent<cc.Button>(cc.Button);
        let eggTabButton = this.node.getChildByName("root").getChildByName("Tabs").getChildByName("Eggs").getComponent<cc.Button>(cc.Button);
        let coinsTabButton = this.node.getChildByName("root").getChildByName("Tabs").getChildByName("Coins").getComponent<cc.Button>(cc.Button);
        //coinsTabButton.interactable = false;

        this.idToStoreScriptMap[StoreScreen.StoreType.Egg] = new EggStore(eggTabButton);
        this.idToStoreScriptMap[StoreScreen.StoreType.Egg].onLoad(this.eggShop);
        this.idToStoreOpenFunctionMap[StoreScreen.StoreType.Egg] = this.openEggsTab.bind(this);
        this.idToStoreScriptMap[StoreScreen.StoreType.Feature] = new FeatureStore(featureTabButton);
        this.idToStoreScriptMap[StoreScreen.StoreType.Feature].onLoad(this.featureShop);
        this.idToStoreOpenFunctionMap[StoreScreen.StoreType.Feature] = this.openFeatureTab.bind(this);
        this.idToStoreScriptMap[StoreScreen.StoreType.Coin] = new CoinStore(coinsTabButton);
        this.idToStoreScriptMap[StoreScreen.StoreType.Coin].onLoad(this.coinShop);
        this.idToStoreOpenFunctionMap[StoreScreen.StoreType.Coin] = this.openCoinsTab.bind(this);

        //coinsTabButton.enableAutoGrayEffect = true;
        //coinsTabButton.interactable = false;

        this.AdjustGameInterface();

        this.idToStoreOpenFunctionMap[tab]();

        this.node.position = cc.v2(-GameManager.instance.canvas.node.width - 10, this.alteredY);
        let act1 = cc.moveTo(0.2, cc.v2(0, this.alteredY));
        this.node.runAction(act1);

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

        this.node.width = GameManager.instance.canvas.node.width;

        let blockInput = this.node.getChildByName("block");
        blockInput.width = this.node.width;
        blockInput.height = 1334;

        let rootNode = this.node.getChildByName("root");
        rootNode.scale = scale;

        //adjust root position
        let posY = 1334 / 2 - CurrencyHud.instance.getTopDistance() - 60;
        rootNode.y = posY;

        let height = Math.floor( rootNode.convertToWorldSpaceAR(cc.Vec2.ZERO).y / scale);
        rootNode.height = height;

        let bg = rootNode.getChildByName("Background");
        bg.width = Math.fround(this.node.width / scale);
        bg.height = Math.ceil(this.Height / scale > bg.height ? this.Height / scale : bg.height) + 20;

        //rootNode.getChildByName("Feature").scale = scale;
        //rootNode.getChildByName("Egg").scale = scale;
        //rootNode.getChildByName("Coins").scale = scale;
        //rootNode.getChildByName("Tabs").scale = scale;
        this.idToStoreScriptMap[StoreScreen.StoreType.Egg].AdjustGameInterface(scale);
        this.idToStoreScriptMap[StoreScreen.StoreType.Feature].AdjustGameInterface(scale);
        this.idToStoreScriptMap[StoreScreen.StoreType.Coin].AdjustGameInterface(scale);
    }

    openFeatureTab() {
        this._activateTab(StoreScreen.StoreType.Feature, this.featureShop);
    }

    openEggsTab() {
        this._activateTab(StoreScreen.StoreType.Egg, this.eggShop);
    }

    openCoinsTab() {
        this._activateTab(StoreScreen.StoreType.Coin, this.coinShop);
    }

    _activateTab(storeName:string, tab:cc.Node) {
        let storeDoesntExist = this.idToStoreScriptMap[storeName] == undefined;
        if(storeDoesntExist) {
            return;
        }

        if(this.activeStore) {
            this.activeStore.onDisable();
        }
        this.featureShop.active = false;
        this.eggShop.active = false;
        this.coinShop.active = false;

        tab.active = true;

        this.activeStore = this.idToStoreScriptMap[storeName];
        this.activeStore.onEnable();

    }

    _loadStore(storeName:string, storeNode:cc.Node) {
    }

    getStore(storeType:string) {
        return this.idToStoreScriptMap[storeType];
    }

    update(dt) {
        if(this.activeStore) {
            this.activeStore.update(dt);
        }
    }

    close(results:any){
        if(this.activeStore) {
            this.activeStore.onDisable();
        }

    }

    static async prompt(tab:string = StoreScreen.StoreType.Egg): Promise<void> {
        let parentNode = cc.find("Canvas/store");
        let vc = await this.loadView<StoreScreen>(parentNode, StoreScreen);

        vc.applyData(tab);
        this.isShowing = true;

        this.instance = vc;

        let executor = (resolve:(any)=>void, reject:(error)=>void) =>{
            vc.onCloseCallback = resolve;
        }

        return new Promise(executor);
    }

    static getCurrentDeal() : {offer:OfferData, purchased:boolean} {
        return FeatureStore.getCurrentDeal();
    }

    static purchaseDailyDeal(offer:OfferData) {
        return FeatureStore.purchaseDailyDeal(offer);
    }

    static disableShopButtons() {
        let buttonsInShop = StoreScreen.instance.node.getComponentsInChildren<cc.Button>(cc.Button);
        buttonsInShop.forEach((button) => {
            TutorialUtils.disableNode(button.node);
        });
    }

    static enableShopButtons() {
        let buttonsInShop = StoreScreen.instance.node.getComponentsInChildren<cc.Button>(cc.Button);
        buttonsInShop.forEach((button) => {
            TutorialUtils.enableNode(button.node);
        });
    }
}

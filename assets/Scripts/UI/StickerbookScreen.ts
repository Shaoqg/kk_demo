import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from "../Tools/ScreenSize";
import PetList from "./PetList";
import PetBookList from "./PetBookList";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StickerbookScreen extends ViewConnector {
    static instance: StickerbookScreen = null;
    static prefabPath = 'Screens/Stickerbook';
    static isShowing:boolean = false;
    static images: cc.SpriteFrame[] = [];

    _petList:PetList = null;
    _petListContentNode: cc.Node = null;
    _recipeListContentNode: cc.Node = null;

    oldButtonNode: cc.Node = null;

    @property(cc.Node)
    petListNode:cc.Node = undefined;

    @property(cc.Node)
    recipesNode:cc.Node = undefined;

    @property(cc.Node)
    snapsNode:cc.Node = undefined;

    private alteredY:number = 0;
    _bookList: PetList;

    
    static async prompt(): Promise<void> {
        let parentNode = cc.find("Canvas/DialogRoot");

        let vc = await this.loadView<StickerbookScreen>(parentNode, StickerbookScreen);

        vc.applyData();
        StickerbookScreen.instance = vc;
        this.isShowing = true;

        return;
    }

    async applyData(){
        this.AdjustGameInterface()
        
        let b = cc.find("root/Pets/PetList", this.node);
        this._petList = cc.find("root/Pets/PetList", this.node).getComponent(PetList);
        this._bookList = cc.find("root/BookPets/PetList", this.node).getComponent(PetBookList);
        this._petListContentNode = cc.find("root/Pets/PetList/PetScroll/PetScrollContent", this.node);

        this.setupPetList();
        this.setupBookList();

        this._activateTab(this._petList.node);
    }

    openPetTab() {
        this._activateTab(this._petList.node);
    }

    openBookTab() {
        this._activateTab(this._bookList.node);
    }

    openCoinsTab() {
        // this._activateTab(StoreScreen.StoreType.Coin, this.coinShop);
    }

    _activateTab(tab:cc.Node) {
       
        this._petList.node.active = false;
        this._bookList.node.active = false;

        tab.active = true;

    }

    readonly width = 750;
    readonly Height = 1334;
    readonly MaxScale = 1;
    readonly MinScale = 0.80;
    
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


    public close(results:any){
        
        // called from sucessful close OR interruption
        this.node.removeFromParent(true);
        StickerbookScreen.isShowing = false;
        this._petList.recoveryPetItemAll();
    }

    setupPetList(){
        this._petList.init();
    }

    setupBookList(){
        this._bookList.init();
    }

   
}

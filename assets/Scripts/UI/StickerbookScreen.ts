import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from "../Tools/ScreenSize";
import PetList from "./PetList";

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

    
    static async prompt(): Promise<void> {
        let parentNode = cc.find("Canvas/DialogRoot");

        let vc = await this.loadView<StickerbookScreen>(parentNode, StickerbookScreen);

        vc.applyData();
        StickerbookScreen.instance = vc;
        this.isShowing = true;

        return;
    }

    async applyData(){
        this.adjustGameInterface()
        
        let b = cc.find("root/Pets/PetList", this.node);
        this._petList = cc.find("root/Pets/PetList", this.node).getComponent(PetList);
        this._petListContentNode = cc.find("root/Pets/PetList/PetScroll/PetScrollContent", this.node);

        this.setupPetList();
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.node.scale = scale;
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

   
}
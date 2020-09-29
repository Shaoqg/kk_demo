import { ViewConnector } from "../Tools/ViewConnector";
import { AdventureAreas, PetData, getPetConfigById, getStrengthByPetData, getRandomConfigs, PetConfigType, PetConfig, ElementType, getRestraint } from "../Config";
import { PetObject } from "../Pet/PetObject";
import ScreenSize from "../Tools/ScreenSize";
import { CallPromise } from "../kk/DataUtils";
import AdventureManager from "../Gameplay/AdventureManager";



const { ccclass, property } = cc._decorator;

@ccclass
export class BattleArea2Screen extends ViewConnector {


    static prefabPath = 'Screens/BattleArea2';

    static _instance: BattleArea2Screen = null;
    shipDock: cc.Node;

    static async prompt(Pets: PetData[], onload:CallPromise<cc.Node>): Promise<any> {
        let parentNode = cc.find("Canvas/world/Battle");
        let vc = BattleArea2Screen._instance = await this.loadView<BattleArea2Screen>(parentNode, BattleArea2Screen);

        vc.applyData(Pets);

        onload.resolve(vc.petNodeParent);
        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    petNodeParent:cc.Node = null;
    applyData(any) {
        let content = cc.find("content", this.node);
        this.petNodeParent = cc.find("pets", content);

        let bgs = cc.find("bg", content);
        bgs.children.forEach((node)=>{
            node.active = node.name == AdventureManager.instance.currAreaNam;
        })


    }

    onClose(){
        BattleArea2Screen._instance = null;
    }
        
    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
    adjustGameInterface() {
        let scale = 1;
        scale = ScreenSize.getScale(1, 0.8);

        this.node.width = ScreenSize.width/scale;
        // this.node.height = screen.height;

        cc.find("content", this.node).scale = scale;
    }


}

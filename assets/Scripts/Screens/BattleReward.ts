import { ViewConnector } from "../Tools/ViewConnector";
import { PetData, getPetConfigById, getUserLevelAndLevelExpByCurrentExp, Resource, getRewardPetByLevel } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import ScreenSize from "../Tools/ScreenSize";


const { ccclass, property } = cc._decorator;

@ccclass
export class BattleReward extends ViewConnector {
    static prefabPath = 'Prefab/BattleReward';

    static onCloseNode: Function = null;

    static _instance: BattleReward;
    root: cc.Node;

    static async prompt(success:boolean,Pets?: PetData[]): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = BattleReward._instance = await this.loadView<BattleReward>(parentNode, BattleReward);

        vc.applyData(success,Pets);

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

    applyData(success:boolean,Pets?: PetData[]) {
        let underlay = cc.find("underlay", this.node);
        if(success){
            this.root = cc.find("content", this.node);
            cc.find("content2", this.node).active=false;
            this.root.active=true

            this.setPets(Pets);
        }else{
            this.root = cc.find("content2", this.node);
            cc.find("content", this.node).active=false;
            this.root.active=true
        }

        let btn_return=cc.find("button_primary",this.root)

        btn_return.on(cc.Node.EventType.TOUCH_END, async () => {
            this.close(undefined);
        })


        this.adjustGameInterface();
       
        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }

    setPets(Pets: PetData[]){
        cc.find("defPets", this.root).children.forEach((node)=>{node.active = false});
        Pets.forEach(async (pet,idx)=>{
            let petNode = cc.find("defPets/pet"+(idx+1), this.root);
            petNode.active = true;
            let petImage= cc.find("petImage",petNode).getComponent(cc.Sprite);
            let petconfig = getPetConfigById(pet.petId);
            petImage.spriteFrame = await KKLoader.loadSprite("Pets/" + petconfig.art_asset);
        })
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}

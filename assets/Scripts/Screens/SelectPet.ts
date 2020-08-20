import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import User from "../Gameplay/User";
import { PetData, getPetConfigById, PetType } from "../Config";
import { KKLoader } from "../Util/KKLoader";
const { ccclass, property } = cc._decorator;

@ccclass
export class SelectPet extends ViewConnector {


    static prefabPath = 'Prefab/SelectPet';

    static _instance: SelectPet = null;

    root: cc.Node = null;
    pet: cc.Node;
    rewarditem: cc.Node;
    petsInAdventure: PetData[];

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = SelectPet._instance = await this.loadView<SelectPet>(parentNode, SelectPet);

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

        let scrollview = cc.find("scrollview", this.root);
        let list = cc.find("list", scrollview);
        this.pet = cc.find("pet", this.node);

        let petList = [];
        petList=User.instance.getPetList();
        list.height = 11;
        this.petsInAdventure = User.instance.getPetsInAdventure()
        console.log("this.petsInAdventure",this.petsInAdventure);
        
        petList.forEach((data, idx) => {
            this.createList(data, idx);
        });

        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }

    async createList(petData: PetData, idx: number) {

        let petconfig=getPetConfigById(petData.petId);
        let petNode = cc.instantiate(this.pet);
        petNode.name=petData.petId;
        let list = cc.find("scrollview/list", this.root);
        let petImage = petNode.getChildByName("petimage").getComponent(cc.Sprite);
        petImage.spriteFrame = await KKLoader.loadSprite("Pets/"+petconfig.art_asset);
        // petImage.spriteFrame = this.SpriteFrame[petListInfo];

        list.addChild(petNode);
        if (idx % 5 == 0) {
            list.height += petNode.height + 11;
        }

        petNode.y = -(petNode.height / 2 + 11) - (Math.floor(idx / 5) * (petNode.height + 11));
        petNode.x = (idx % 5) * (petNode.width + 11) + (petNode.width / 2 + 11);

        this.setType(petNode,petconfig);

        this.petsInAdventure.forEach((pet)=>{
            if(pet.petId==petData.petId){
                console.log("pet.petId",petData);
                petNode.getChildByName("underlay").active = true;
                petNode.getChildByName("Label").active = true;
                return;
            }
        })

        petNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.close(petData);
        });

    }

    setType(petNode: cc.Node, petconfig: PetType) {

        let natureNode = cc.find("Types/type_land", petNode);
        let fireNode = cc.find("Types/type_fire", petNode);
        let waterNode = cc.find("Types/type_water", petNode);
        let snackNode = cc.find("Types/type_snack", petNode);

        natureNode.active = false;
        fireNode.active = false;
        waterNode.active = false;
        snackNode.active = false;

        switch (petconfig.elements) {
            case "nature":
                natureNode.active = true;
                break;
            case "fire":
                fireNode.active = true;
                break;
            case "water":
                waterNode.active = true;
                break;
            case "snack":
                snackNode.active = true;
                break;
        }
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
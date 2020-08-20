import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import User from "../Gameplay/User";
import { PetData, getPetConfigById } from "../Config";
import { KKLoader } from "../Util/KKLoader";
const { ccclass, property } = cc._decorator;

@ccclass
export class SelectPet extends ViewConnector {


    static prefabPath = 'Prefab/SelectPet';

    static _instance: SelectPet = null;

    root: cc.Node = null;
    pet: cc.Node;
    rewarditem: cc.Node;

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
        let pet = cc.instantiate(this.pet);
        pet.name=petData.petId;
        let list = cc.find("scrollview/list", this.root);
        let petImage = pet.getChildByName("petimage").getComponent(cc.Sprite);
        petImage.spriteFrame = await KKLoader.loadSprite("Pets/"+petconfig.art_asset);
        // petImage.spriteFrame = this.SpriteFrame[petListInfo];

        list.addChild(pet);
        if (idx % 5 == 0) {
            list.height += pet.height + 11;
        }

        pet.y = -(pet.height / 2 + 11) - (Math.floor(idx / 5) * (pet.height + 11));
        pet.x = (idx % 5) * (pet.width + 11) + (pet.width / 2 + 11);

        pet.on(cc.Node.EventType.TOUCH_END, () => {
            this.close(petData);
        });

    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { petBouns } from "../UI/PetRevealDialog";
import User from "../Gameplay/User";
import { Adventure } from "./Adventure";
import WorldManager from "../Gameplay/WorldManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { AdventureAreas, PetData, getPetConfigById, getStrengthByPetData } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import { delay } from "../kk/DataUtils";
import { BattleReward } from "./BattleReward";
const { ccclass, property } = cc._decorator;

@ccclass
export class BattleArea extends ViewConnector {


    static prefabPath = 'Prefab/BattleArea';

    static _instance: BattleArea = null;
    shipDock: cc.Node;


    static async prompt(Pets: PetData[]): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = BattleArea._instance = await this.loadView<BattleArea>(parentNode, BattleArea);

        vc.applyData(Pets);

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

    async applyData(Pets: PetData[]) {

        this.adjustGameInterface();

        this.shipDock = cc.find("shipDock", this.node)

        let ship = await this.setShip(Pets)

        let act = cc.moveBy(3, cc.v2(500.0)).easing(cc.easeOut(5))

        ship.runAction(act);
        await delay(4);

        //judge sucess or failed
        let issucess=this.checkSucess(Pets)
        await BattleReward.prompt(issucess,Pets);
        console.log(issucess)
        this.close(undefined);
    }

    async setShip(Pets: PetData[]) {
        let shipPrefeb = await KKLoader.loadPrefab("Prefab/ShipObject");
        let shipNode = cc.instantiate(shipPrefeb);
        this.shipDock.addChild(shipNode)
        shipNode.x = shipNode.x - 500

        //setPets
        Pets.forEach(async (pet, idx) => {
            let petNode = cc.find("PetNode" + (idx + 1), shipNode)
            let petImage = petNode.getChildByName("image").getComponent(cc.Sprite);

            let petconfig = getPetConfigById(pet.petId);

            petImage.spriteFrame = await KKLoader.loadSprite("Pets/" + petconfig.art_asset);
        })

        return shipNode;
    }

    checkSucess(Pets: PetData[]) {
        let myStrength = 0
        Pets.forEach((pet, idx) => {
            myStrength += getStrengthByPetData(pet);
        })
        let def = this.getIslandDef();
        console.log("myStrength",myStrength,"IslandDef",def);
        
        if (myStrength > def) {
            return true;
        } else {
            return false;
        }
    }

    getIslandDef() {
        //debug
        return 15-Math.random() * 10
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.node.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
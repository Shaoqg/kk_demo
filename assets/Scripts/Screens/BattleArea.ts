import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { petBouns } from "../UI/PetRevealDialog";
import User from "../Gameplay/User";
import { Adventure } from "./Adventure";
import WorldManager from "../Gameplay/WorldManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { AdventureAreas, PetData, getPetConfigById, getStrengthByPetData, getRandomConfigs, PetType, PetConfig, ElementType } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import { delay } from "../kk/DataUtils";
import { BattleReward } from "./BattleReward";
import { PetObject } from "../Pet/PetObject";
import { Wander } from "../Pet/Wander";
import VSModel from "../UI/VSModel";
import { MoveToPosition } from "../Pet/MoveToPosition";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";
import { Land } from "../Pet/Land";
import ShipObject from "../Tools/ShipObject";
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

        let act = cc.moveBy(2, cc.v2(500.0)).easing(cc.easeOut(1))
        
        let opponent = this.setOpponentPets()

        ship.runAction(act);
        await delay(3);

        this.setSelfPets(Pets);

        await delay(3);


        let isWin = await VSModel.prompt(Pets, opponent, ElementType.fire);
        
        //judge sucess or failed
        let issucess=this.checkSucess(Pets)
        if (issucess) {
            Pets.forEach((pet) => {
                let UserPet = User.instance.findPetDataByPetId(pet.petId);
                UserPet.nowUsing = true;
                UserPet.UsingBy = "Defence"
            })
            User.instance.areaExploring["unknow"] = true
            User.instance.areaCapture["unknow"] = true
            User.instance.areaCaptureStartTime["unknow"] = Date.now();
            User.instance.areaCaptureTimeTakenReward["unknow"] =  Date.now();
            User.instance.saveUse();
            EventEmitter.emitEvent(EventType.GO_CAPTURE);
        }
        await BattleReward.prompt(issucess,Pets);
        this.close(undefined);
    }

    async setShip(Pets: PetData[]) {
        let shipPrefeb = await KKLoader.loadPrefab("Prefab/ShipObject");
        let shipNode = cc.instantiate(shipPrefeb);
        this.shipDock.addChild(shipNode)
        shipNode.x = shipNode.x - 500

        //setPets
       shipNode.getComponent(ShipObject).setPets(Pets);

        return shipNode;
    }


    setSelfPets(Pets: PetData[]) {
        Pets.forEach(async (pet, idx) => {
            let petNode = cc.find("ShipObject/PetNode" + (idx + 1), this.shipDock)
            let petAni = petNode.getChildByName("image").getComponent(cc.Animation);
            await delay(idx*0.2);
            petAni.play("jump");
            await delay(0.55);
            this._preparePetNode(pet, idx, false);
        })

    }

    setOpponentPets(){
        let petsconfigs=getRandomConfigs(4);

        let petDatas:PetData[] = [];
        petsconfigs.forEach((config,idx)=>{
            let petData = {
                petId: config.petId,
                petLevel: Math.floor(Math.random()*8)
            }
            petDatas.push(petData)

            this._preparePetNode(petData,idx);
        });
        return petDatas;
    }

    checkSucess(Pets: PetData[]) {
        let myStrength = 0
        Pets.forEach((pet, idx) => {
            myStrength += getStrengthByPetData(pet);
        })
        let def = this.getIslandDef();
        console.log("myStrength",myStrength,"IslandDef",def,(myStrength > def));
        
        if (myStrength > def) {
            return true;
        } else {
            return false;
        }
    }

    async _preparePetNode(petData: PetData,idx:number, isOpponent= true) {

        let islandNode = cc.find("island/islandUI/islandNode/island", this.node);
        let petNode = cc.find("pet"+(idx+1),islandNode);

        //Hide the pet node by default, but make sure we have a pet prepared
        let prefab = await KKLoader.loadPrefab("Prefab/pet");
        let preppedPetNode = cc.instantiate(prefab)

        //Hide the pet node by default, but make sure we have a pet prepared
        petNode.parent.addChild(preppedPetNode);

        let petObject = preppedPetNode.getComponent(PetObject) || preppedPetNode.addComponent(PetObject);
        petObject.init(petData, petNode);

        let path = isOpponent ? "vs/opponent/pet":"vs/self/pet";
        let targeNode = cc.find(path + (idx+1), islandNode).convertToWorldSpaceAR(cc.v2(0,0));
        let targePos = petNode.getParent().convertToNodeSpaceAR(targeNode);

        if (isOpponent) {
            preppedPetNode.position = petNode.position;
            
            let wanderBehavior = new Wander();
            wanderBehavior.init(petObject, "landPet", { position: targePos, wanderRadius: 30, useAnchor: true,target:targePos.sub(cc.v2(0,1))});
            wanderBehavior.start()
        } else {
            preppedPetNode.position = targePos;

            let landBehavior = new Land();
            landBehavior.init(petObject, "landPet");
            landBehavior.start();
        }

        return petObject;
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
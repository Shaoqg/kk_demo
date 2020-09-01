import { PetData, getRandomConfigs } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import { PetObject, PetType } from "../Pet/PetObject";
import { Drop } from "../Pet/Behviors/Drop";
import { Wander } from "../Pet/Behviors/Wander";
import { delay } from "../kk/DataUtils";
import { Idle } from "../Pet/Behviors/Idle";
import { BattleReward } from "../Screens/BattleReward";
import { StateManager } from "./State/StateManager";


export default class BattleArea2Manager {

    static instance: BattleArea2Manager = null;

    petNodes: cc.Node = null;
    selfPetDatas: PetData[] = [];

    selfPets: PetObject[] = [];
    opponent:PetObject[] = [];
    constructor(pets: PetData[], petNodes: cc.Node) {
        this.petNodes = petNodes;
        this.init(pets);
        BattleArea2Manager.instance = this;
    }


    async init(pets: PetData[]) {
        // creat
        this.creatSelfPet(pets);

        this.creatOpponentPet();


        await delay(9);
        //TODO attact pet
        this.selfPets.forEach(async (pet, idx)=>{
            await delay(idx*0.1);
            pet.attack(this.opponent[this.opponent.length -1]);
        })

        await delay(6);
        await BattleReward.prompt(true, pets);
        StateManager.instance.changeState("IslandState");
    }


    creatSelfPet(pets: PetData[]) {
        this.selfPetDatas = pets;
        pets.forEach(async (pet, idx) => {
            this._preparePetNode(pet, idx, false).then((petObject) => {
                this.selfPets.push(petObject);
                // this.petInfo[idx].petObject = petObject;
            })
        })
    }

    creatOpponentPet() {
        let petsconfigs = getRandomConfigs(1);

        let petDatas: PetData[] = [];
        petsconfigs.forEach((config, idx) => {
            let petData = {
                petId: config.petId,
                petLevel: Math.floor(Math.random() * 8)
            }
            petDatas.push(petData)

            this._preparePetNode(petData, idx, true).then((petObject)=>{
                this.opponent.push(petObject);
            })
        });
        // this.opponentPetDatas = petDatas;
        return petDatas;
    }

    async _preparePetNode(petData: PetData, idx: number, isOpponent = false) {

        // let islandNode = this.island;
        let petNode = cc.find("petTempNode", this.petNodes);

        //Hide the pet node by default, but make sure we have a pet prepared
        let prefab = await KKLoader.loadPrefab("Prefab/pet_battle");
        let preppedPetNode = cc.instantiate(prefab)

        //Hide the pet node by default, but make sure we have a pet prepared
        petNode.parent.addChild(preppedPetNode);

        let petObject = preppedPetNode.getComponent(PetObject) || preppedPetNode.addComponent(PetObject);
        petObject.init(petData, petNode, PetType.Battle2);

        let targePos = this.getPos(isOpponent);

        if (isOpponent) {
            preppedPetNode.position = targePos;

            let wanderBehavior = new Idle();
            wanderBehavior.init(petObject, "landPet");
            wanderBehavior.start()
        } else {
            preppedPetNode.position = targePos;

            let wanderBehavior = new Wander();
            wanderBehavior.init(petObject, "landPet", { position: this.posList_to.pop(), wanderRadius: 15, useAnchor: true, target: targePos.sub(cc.v2(0, 1)) });
            wanderBehavior.start()

            // let landBehavior = new Land();
            // landBehavior.init(petObject, "landPet");
            // landBehavior.start();
        }

        return petObject;
    }


    posList = [cc.v2(100,350),cc.v2(100, 250), cc.v2(100, 150), cc.v2(100, 50)];
    posList_to = [cc.v2(0,100),cc.v2(0, 70), cc.v2(0, 30), cc.v2(0, 0)];
    posList_self = [cc.v2(-150,-350),cc.v2(-150, -250), cc.v2(-150, -150), cc.v2(-150, -50)];
    getPos(isOpponent) {
        let center = cc.Vec2.ZERO;
        if (isOpponent) {
            center = this.posList.pop();
        } else {
            center = this.posList_self.pop();
        }
        return center.add(cc.v2(50 * Math.random(), 50 * Math.random()))
    }






}

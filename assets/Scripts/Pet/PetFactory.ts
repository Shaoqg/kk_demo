import { PetData, getPetConfigById, IsLandType, elementTypeToIslandType } from "../Config";
import { Wander } from "./Behviors/Wander";
import { KKLoader } from "../Util/KKLoader";
import { PetObject } from "./PetObject";
import User from "../Gameplay/User";
import { PetUpgradeModel } from "../Screens/PetUpgradeModel";
import { PerformAnimation } from "./Behviors/PerformAnimation";
import IslandManager from "../Gameplay/Island/IslandManager";
import { IslandPointHelper } from "./IslandPointHelper";

export class PetFactory {

    static async addPet(petData: PetData, island?:IsLandType) {
        if (!island) {
            island = IslandManager.instance.getIslandTypeByPetId(petData.petId);
        }

        let pet = await this._preparePetNode(petData, island);
        let wanderBehavior = new Wander();
        wanderBehavior.init(pet, "spawnpet", { position: pet.node.position, wanderRadius: 10 });
        wanderBehavior.start();
        return pet;
    }

    static async _preparePetNode(petData: PetData, island:IsLandType) {

        // let preppedPetNode = SagaManager.getPet();
        let petconfig = getPetConfigById(petData.petId)
        //Hide the pet node by default, but make sure we have a pet prepared
        let prefab = await KKLoader.loadPrefab("Prefab/pet");
        let preppedPetNode = cc.instantiate(prefab)

        //Hide the pet node by default, but make sure we have a pet prepared
        preppedPetNode.position = IslandPointHelper.getRandomPointOnIsland(island);

        let parent =cc.find("island/mapblocks", IslandManager.instance.getNodeByType(island));
        parent.addChild(preppedPetNode);

        let petObject = preppedPetNode.getComponent(PetObject) || preppedPetNode.addComponent(PetObject);
        petObject.init(petData);
        petObject.islandType = island;

        preppedPetNode.on(cc.Node.EventType.TOUCH_END, async () => {
            petObject.clearBehavior(false);
            await PetUpgradeModel.prompt(petData)
            let wanderBehavior = new Wander();
            wanderBehavior.init(petObject, "spawnpet", { position: preppedPetNode.position, wanderRadius: 10 });
            wanderBehavior.start()
        });


        return petObject;
    }

    static petjumping(pet:PetObject){
        let behavior = new PerformAnimation();
        behavior.init(pet, "Battle reward", {animation:"island_complete_celebration", startTime:0, duration:15000, forever:true});
        behavior.start(true);
    }

    static removeAllPets(){
        // let island = cc.find(PetFactory.PetPath);
        // island.removeAllChildren(true);
        User.instance.saveUse()
    }

    static onIslandPet:{[islandType:string]: PetData[]}={};
    static setIslandPets(isRemove:boolean=false) {
        if(isRemove){
            this.removeAllPets();
        }
        let petsNowUsing = User.instance.getPetList();
        petsNowUsing.forEach((pet)=>{
            let type = IslandManager.instance.getIslandTypeByPetId(pet.petId);
            if (!this.onIslandPet[type]) {
                this.onIslandPet[type] = [];
            }
            let isAdd = this.onIslandPet[type].find((oldPet) => oldPet.petId == pet.petId);
            
            if(!isAdd) {
                this.onIslandPet[type].push(pet);
                this.addPet(pet, type);
            }
        })
    }   
}
import { PetData, getPetConfigById } from "../Config";
import { Wander } from "./Wander";
import { KKLoader } from "../Util/KKLoader";
import { PetObject } from "./PetObject";
import User from "../Gameplay/User";
import { PetUpgrade } from "../Screens/PetUpgrade";
import { PerformAnimation } from "./PerformAnimation";

export class GardenPets {
    static async addpet(petdata: PetData, island?:cc.Node) {
        island = island || cc.find("Canvas/world/island/islandUI/farmNode/island/mapblocks/pet");
        let pet = await this._preparePetNode(petdata, island);
        let wanderBehavior = new Wander();
        wanderBehavior.init(pet, "spawnpet", { position: pet.node.position, wanderRadius: 10 });
        wanderBehavior.start();
        return pet;
    }

    static async _preparePetNode(petdata: PetData, parent: cc.Node) {
        let petNode = cc.find("Canvas/world/island/islandUI/farmNode/island/mapblocks/pet");

        // let preppedPetNode = SagaManager.getPet();
        let petconfig = getPetConfigById(petdata.petId)
        //Hide the pet node by default, but make sure we have a pet prepared
        let prefab = await KKLoader.loadPrefab("Prefab/pet");
        let preppedPetNode = cc.instantiate(prefab)

        //Hide the pet node by default, but make sure we have a pet prepared
        preppedPetNode.position = petNode.position;

        parent.addChild(preppedPetNode);

        let petObject = preppedPetNode.getComponent(PetObject) || preppedPetNode.addComponent(PetObject);
        petObject.init(petdata, petNode);

        preppedPetNode.on(cc.Node.EventType.TOUCH_END, async () => {
            petObject.clearBehavior(false);
            await PetUpgrade.prompt(petdata)
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
        let island = cc.find("Canvas/world/island/islandUI/farmNode/island/mapblocks/pet");
        island.removeAllChildren(true);
        User.instance.saveUse()
    }

    static setIslandPets(isRemove:boolean=false) {
        if(isRemove){
            this.removeAllPets();
        }
        let petsNowUsing = User.instance.getPetList();
        petsNowUsing.forEach((pet)=>{
            this.addpet(pet);
        })
    }   
}
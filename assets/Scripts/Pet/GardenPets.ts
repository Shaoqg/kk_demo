import { PetData, getPetConfigById } from "../Config";
import { Wander } from "./Wander";
import { KKLoader } from "../Util/KKLoader";
import { PetObject } from "./PetObject";
import User from "../Gameplay/User";
import { PetUpgrade } from "../Screens/PetUpgrade";

export class GardenPets {
    static async addpet(petdata: PetData) {
        let island = cc.find("Canvas/world/island/islandUI/farmNode/island/mapblocks/pet");
        let pet = await this._preparePetNode(petdata, island);
        let wanderBehavior = new Wander();
        wanderBehavior.init(pet, "spawnpet", { position: pet.node.position, wanderRadius: 10 });
        wanderBehavior.start()
    }

    static async _preparePetNode(petdata: PetData, parent: cc.Node) {
        let petNode = cc.find("Canvas/world/island/islandUI/farmNode/island/mapblocks/pet");

        // let preppedPetNode = SagaManager.getPet();
        let petconfig = getPetConfigById(petdata.petId)
        //Hide the pet node by default, but make sure we have a pet prepared
        let prefab = await KKLoader.loadPrefab("Prefab/pet");
        let preppedPetNode = cc.instantiate(prefab)

        //Hide the pet node by default, but make sure we have a pet prepared
        preppedPetNode.name = petconfig.petId;
        preppedPetNode.position = petNode.position;
        let petImage: cc.Node = preppedPetNode.getChildByName("image");
        let sprite = petImage.getComponent(cc.Sprite);
        sprite.trim = false;
        sprite.spriteFrame = await KKLoader.loadSprite("Pets/" + petconfig.art_asset);

        petImage.width = petNode.width;
        petImage.height = petNode.height;

        preppedPetNode.width = petNode.width;
        preppedPetNode.height = petNode.height;

        parent.addChild(preppedPetNode);

        preppedPetNode.on(cc.Node.EventType.TOUCH_END, async () => {
            preppedPetNode.getComponent(PetObject).clearBehavior(false);
            await PetUpgrade.prompt(petdata)
            let wanderBehavior = new Wander();
            wanderBehavior.init(preppedPetNode.getComponent(PetObject), "spawnpet", { position: preppedPetNode.position, wanderRadius: 10 });
            wanderBehavior.start()
        });


        return preppedPetNode.getComponent(PetObject) || preppedPetNode.addComponent(PetObject);
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
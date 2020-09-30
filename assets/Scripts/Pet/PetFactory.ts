import { PetData, getPetConfigById, IsLandType, elementTypeToIslandType } from "../Config";
import { Wander } from "./Behviors/Wander";
import { KKLoader } from "../Util/KKLoader";
import { PetObject } from "./PetObject";
import User from "../Gameplay/User";
import { PetUpgradeModel } from "../Screens/PetUpgradeModel";
import { PerformAnimation } from "./Behviors/PerformAnimation";
import IslandManager from "../Gameplay/Island/IslandManager";
import { IslandPointHelper } from "./IslandPointHelper";
import GlobalResources from "../Util/GlobalResource";

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

    private static _HPLabelPool:cc.NodePool = new cc.NodePool();
    static async onBeHit(petNode:cc.Node,num:number, dir:1|-1, restraintNum = 0) {
        if (this._HPLabelPool.size() <= 0) {
            let label = await GlobalResources.getPrefab("fx/HitHP");
            let node = cc.instantiate(label);
            this._HPLabelPool.put(node);
        }

        let labelHp = this._HPLabelPool.get();

        let icon_hit = cc.find("icon_hit",labelHp);
        let label_node = cc.find("label",labelHp);
        if (restraintNum == 1) {
            icon_hit.active = true;
            label_node.color = cc.Color.RED;
        } else {
            icon_hit.active = false;
            label_node.color = cc.Color.WHITE;
        }

        labelHp.getComponentInChildren(cc.Label).string = num.toString();
        labelHp.setParent(petNode.parent);
        labelHp.zIndex = 1100;
        labelHp.setPosition(petNode.position.add(cc.v2(0, 140)));
        labelHp.scale = 0;
        labelHp.runAction(cc.sequence(
            cc.spawn(
                cc.scaleTo(0.2, 1).easing(cc.easeBackOut()),
                cc.moveBy(0.5,cc.v2(dir * 10, 50)).easing(cc.easeIn(3.0)),
            ),
            cc.callFunc(()=>{ this._HPLabelPool.put(labelHp)})
        ))
    }

    static onIslandPet:{[islandType:string]: PetObject[]}={};
    static setIslandPets(isRemove:boolean=false) {
        if(isRemove){
            // this.removeAllPets();
        }
        let petsNowUsing = User.instance.getPetList();
        petsNowUsing.forEach((pet)=>{
            let type = IslandManager.instance.getIslandTypeByPetId(pet.petId);
            if (!this.onIslandPet[type]) {
                this.onIslandPet[type] = [];
            }
            let isAdd = this.onIslandPet[type].find((oldPet) => oldPet.petData.petId == pet.petId);
            
            if(!isAdd) {
                this.addPet(pet, type).then((petObject)=>{
                    this.onIslandPet[type].push(petObject);
                })
            }
        })
    } 
    
    static refreshIslandPetInfo(petId:string){
        let type = IslandManager.instance.getIslandTypeByPetId(petId);
        let pet = this.onIslandPet[type].find((petObject) => petObject.petData.petId == petId);
        pet.refreshLevelInfo();
    }
}
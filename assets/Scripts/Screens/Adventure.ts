import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { AdventureReward } from "./AdventureReward";
import User from "../Gameplay/User";
import { petBouns } from "../UI/PetRevealDialog";
import { KKLoader } from "../Util/KKLoader";
import { getPetConfigById, PetConfigType, getPetBouns, bounss, capacitys, speeds, AdventureTime, AdventureLogLines, AdventureBasicwood, AdventureBasicstone, AdventureBasiccoins, AdventureShipMaxFood, PetData, Resource, RewardType, AdventureAreas,  } from "../Config";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { SelectNumber } from "./SelectNumber";
import { BattleArea } from "./BattleArea";
import { StateManager } from "../Gameplay/State/StateManager";
import AdventureManager from "../Gameplay/AdventureManager";

const { ccclass, property } = cc._decorator;

@ccclass
export class Adventure extends ViewConnector {

    static prefabPath = 'Prefab/Adventure';

    static _instance: Adventure = null;

    static async prompt(areaName?:string): Promise<boolean> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = Adventure._instance = await this.loadView<Adventure>(parentNode, Adventure);

        vc.applyData(areaName);

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<boolean>(executor);
    }

    root:cc.Node = null;
    pet:cc.Node = null;
    seatNum = 0;
    petReady = 0;
    petsNowUsing:PetData[] = [];

    boatReady = false;

    selectPets:PetData[] = [];

    applyData(areaName?: string) {

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        this.pet = cc.find("pet", this.node);
        let petList = [];
        petList=User.instance.getPetList()

        let go = cc.find("button_primary", this.root);
        let scrollview = cc.find("scrollview", this.root);
        let list = cc.find("list", scrollview);
        let subtitleLabel = cc.find("subtitle/capacity", this.root).getComponent(cc.Label);
        let destinationLabel = cc.find("destination", this.root).getComponent(cc.Label);

        this.seatNum=3;
        
        if(!areaName){
            areaName=User.instance.AdventureInfo.destination;
        }
        destinationLabel.string = "destination: area " + areaName;

        for(let i=1;i<=this.seatNum;i++){
            let petSeat = cc.find("petsOnShip/pet" + i, this.root);
            petSeat.active=true
        }
        

        list.height = 11;

        this.petsNowUsing = User.instance.getPetsNowUsing()

        petList.forEach((data, idx) => {
            this.createList(data, idx);
        });
        
        go.on(cc.Node.EventType.TOUCH_END, () => {
            if (!this.boatReady) {
                return;
            }
            AdventureManager.instance.onStartExplore(areaName, this.selectPets);
            StateManager.instance.changeState("BattleAreaState", this.selectPets);
            this.close(true);
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

        this.petsNowUsing.forEach((petNowUsing)=>{
            if(petNowUsing.petId==petData.petId){
                console.log("pet.petId",petData);
                pet.getChildByName("underlay").active = true;
                pet.getChildByName("Label").active = true;
                return;
            }
        })

        pet.on(cc.Node.EventType.TOUCH_END, () => {
            this.setToReady(petData,petconfig,pet);
        });
    }

    async setToReady( petData: PetData,petconfig:PetConfigType,petNode?: cc.Node) {
        if (this.petReady >= this.seatNum) {
            return;
        }
        let seatnumber=0;
        for(let i=1;i<=this.seatNum;i++){
            if(!this.selectPets[i-1]){
                seatnumber=i;
                break;
            }
        }
        this.petReady++;

        let petSeat = cc.find("petsOnShip/pet" + seatnumber.toString(), this.root);
        let shipCapacity = cc.find("shipInfo/capacity", this.root);

        let bg = petSeat.getChildByName("bg");
        let petImage = petSeat.getChildByName("petimage").getComponent(cc.Sprite);
        let bonusLabel = petSeat.getChildByName("bonus").getComponent(cc.Label);

        if(petNode){
            let index = this.selectPets.push(petData) -1;
            petNode.getChildByName("underlay").active = true;
            petNode.getChildByName("Label").active = true;
            petSeat.once(cc.Node.EventType.TOUCH_END, () => {
                petNode.getChildByName("underlay").active = false;
                petNode.getChildByName("Label").active = false;
                bg.active = false;
                petImage.node.active = false;
                bonusLabel.node.active = false;

                if (this.petReady == this.seatNum) {
                    let go = cc.find("button_primary", this.root);
                    let go_gry = cc.find("button_primary/button_gry", this.root);
                    go.getComponent(cc.Button).interactable = false;
                    go_gry.active = true;
                }

                this.petReady--;
                this.selectPets.splice(index, 1);
                shipCapacity.getComponent(cc.Label).string = "Capacity：" + this.petReady + "/" + this.seatNum;

            });
        }

        
        bg.active = true;

        petImage.spriteFrame =  await KKLoader.loadSprite("Pets/"+petconfig.art_asset);
        petImage.node.active = true;
        let petBouns=getPetBouns(petconfig);
        bonusLabel.string=petBouns.BounsName+"\n+"+(petBouns.BounsNum*petData.petLevel)+"%";

        bonusLabel.node.active = true;
     

        shipCapacity.getComponent(cc.Label).string = "Capacity：" + this.petReady + "/"+this.seatNum;
       
        if ((this.petReady >= 1)) {
            let go = cc.find("button_primary", this.root);
            let go_gry = cc.find("button_primary/button_gry", this.root);
            go.getComponent(cc.Button).interactable = true;
            go_gry.active = false;
            this.boatReady = true;
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
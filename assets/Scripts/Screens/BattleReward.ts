import { ViewConnector } from "../Tools/ViewConnector";
import { SelectPet } from "./SelectPet";
import User from "../Gameplay/User";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { PetData, getPetConfigById, getUserLevelAndLevelExpByCurrentExp, Resource, getRewardPetByLevel } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import { PetObject } from "../Pet/PetObject";
import { GardenPets } from "../Pet/GardenPets";
import { delay } from "../kk/DataUtils";
import { AdventureReward } from "./AdventureReward";


const { ccclass, property } = cc._decorator;

@ccclass
export class BattleReward extends ViewConnector {
    static prefabPath = 'Prefab/BattleReward';

    static onCloseNode: Function = null;

    static instance: BattleReward;

    static isShowing: boolean = false;
    progress: cc.Node;
    progressLabel: cc.Node;
    userExp: number;
    userLevel: { level: any; levelExpCount: number; };
    updateTime: number = 0;
    needUpdate: boolean = false;
    setRewardPet: boolean = false;
    petImage: cc.Sprite;
    nextRewardpetId: string;


    static async prompt(rank: number, exp: number, petdata: PetData): Promise<void> {

        this.isShowing = true;
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = await this.loadView<BattleReward>(parentNode, BattleReward);

        vc.applyData(rank, exp, petdata);

        this.instance = vc;

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise(executor);
    }

    async applyData(rank: number, exp: number, petdata: PetData) {
        this.adjustGameInterface();
        let underlay = cc.find("underlay", this.node);
        let title = cc.find("title", this.node).getComponent(cc.Label);
        let subtitle = cc.find("subtitle", this.node).getComponent(cc.Label);
        this.progress = cc.find("progress/progressBarFront", this.node);
        this.progressLabel = cc.find("progress/progressLabel", this.node);

        this.petImage=cc.find("petReward/petimage",this.node).getComponent(cc.Sprite);

        title.string = "You place in " + rank + "th place!";
        subtitle.string = "+ " + exp + " XP";

        this.userExp = User.instance.currentExp;
        let pet = await this._preparePetNode(petdata, this.node);

        this.setprogress();
        User.instance.currentExp += exp;
        await delay(1);
        this.needUpdate = true;

        GardenPets.petjumping(pet);

        underlay.on(cc.Node.EventType.TOUCH_END, async () => {
            this.close(undefined);
        })
    }

    async setprogress() {
        let levelUp=false;
        this.userLevel = getUserLevelAndLevelExpByCurrentExp(this.userExp);

        
        this.progress.getComponent(cc.ProgressBar).progress = (this.userLevel.level.levelExp - (this.userLevel.levelExpCount - this.userExp)) / this.userLevel.level.levelExp;
        this.progressLabel.getComponent(cc.Label).string = (this.userLevel.level.levelExp - (this.userLevel.levelExpCount - this.userExp)) + "/" + this.userLevel.level.levelExp + "XP"
        
        if((this.userLevel.level.levelExp - (this.userLevel.levelExpCount - this.userExp)) == this.userLevel.level.levelExp){
            this.needUpdate = false;
            this.progress.getChildByName("progressBarCompelete").active = true;
            await delay(1);
            await this.getReward()
            levelUp=true;
            this.userExp = this.userLevel.levelExpCount;

            this.progress.getChildByName("progressBarCompelete").active = false;
            this.needUpdate = true;
        }

        if(!this.setRewardPet||levelUp){
            this.setRewardPet = true;
            this.setRewardPetImage()
        }

    }

    async _preparePetNode(petdata: PetData, parent: cc.Node) {
        let petNode = cc.find("pet", this.node)

        let petconfig = getPetConfigById(petdata.petId)
        let prefab = await KKLoader.loadPrefab("Prefab/pet");
        let preppedPetNode = cc.instantiate(prefab)

        //Hide the pet node by default, but make sure we have a pet prepared
        preppedPetNode.name = petconfig.petId;
        preppedPetNode.position = petNode.position;
        let petImage: cc.Node = preppedPetNode.getChildByName("image");
        let sprite = petImage.getComponent(cc.Sprite);
        sprite.trim = false;
        sprite.spriteFrame = await KKLoader.loadSprite("Pets/" + petconfig.art_asset);
        console.log(sprite.spriteFrame);

        petImage.width = petNode.width;
        petImage.height = petNode.height;

        preppedPetNode.width = petNode.width;
        preppedPetNode.height = petNode.height;

        parent.addChild(preppedPetNode);


        return preppedPetNode.getComponent(PetObject) || preppedPetNode.addComponent(PetObject);
    }

    async getReward(petId?:string){
        //debug 
        petId = this.nextRewardpetId;
        let petconfig = getPetConfigById(petId);
        let reward = [{
            rewardType: Resource.pet,
            rewardNum: 1,
            petId: petId
        }]
        let petissucess = User.instance.addPet(petconfig)
        return await AdventureReward.prompt(reward, petissucess);
    }

    async setRewardPetImage(){
        let level = this.userLevel.level.level+1;
        this.nextRewardpetId= getRewardPetByLevel(level);
        let petconfig = getPetConfigById(this.nextRewardpetId);
        console.log(petconfig,this.nextRewardpetId,level);
        
        this.petImage.spriteFrame = await KKLoader.loadSprite("Pets/"+petconfig.art_asset);
    }














    readonly width = 750;
    readonly Height = 1334;
    readonly MaxScale = 1;
    readonly MinScale = 0.80;
    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
    adjustGameInterface() {
        let scale = 1;
        let size = cc.view.getFrameSize();
        // console.log(size);
        // let oldValue = this.Height * size.width / size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）

        let oldValue = this.width / this.Height * size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）
        scale = size.width / oldValue;

        if (scale > this.MaxScale) {
            scale = this.MaxScale;
        } else if (scale < this.MinScale) {
            scale = this.MinScale;
        }

        this.node.width = screen.width;
        this.node.height = screen.height;

        this.node.scale = scale;

    }

    update(dt) {
        if (!this.needUpdate) {
            return;
        }
        this.updateTime += dt;
        if (this.updateTime >= 0.05) {
            this.updateTime -= 0.05;
            this.refreshProgress();
        }
    }

    refreshProgress() {
        if (this.userExp <= User.instance.currentExp) {
            this.userExp++;
            this.setprogress();
        } else {
            this.needUpdate = false;
        }
    }

    close(results: any) {
        super.close(results);

        BattleReward.isShowing = false;
    }


}

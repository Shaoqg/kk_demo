import { PetData } from "./PetList";
import User from "../Gameplay/User";
import { KKLoader } from "../Util/KKLoader";
import { getPetConfigById, Rarity } from "../Config";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PetItem extends cc.Component {
    static path = "Screens/PetItem";

    @property(cc.Sprite)
    PetImage: cc.Sprite = null;

    @property(cc.Sprite)
    Background: cc.Sprite = null;

    @property(cc.Sprite)
    BackgroundAlt: cc.Sprite = null;

    @property(cc.Label)
    StarLevelLabel: cc.Label = null;

    @property(cc.Label)
    NameLabel: cc.Label = null;

    @property(cc.Node)
    TypesNode: cc.Node = null;

    @property(cc.Label)
    RareLabel: cc.Label = null;

    @property(cc.SpriteFrame)
    fireBackground: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    waterBackground: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    natureBackground: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    snackBackground: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    fireHalfBackground: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    waterHalfBackground: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    natureHalfBackground: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    snackHalfBackground: cc.SpriteFrame = null;

    @property(cc.Node)
    petLabelNode: cc.Node = null;

    @property(cc.Node)
    petShadowNode: cc.Node = null;

    Init(petData:PetData, touCallBack = null) {
        let petid =petData.petId;
        this.setLevelAndName(petid, petData);
        let petInfos=User.instance.petInfos;
        petInfos.forEach((info) => {
            if (info.petId == petData.petId) {
                let config=getPetConfigById(info.petId);
                this.setRare(config.rarity.toString());
                this.SetElements(config.elements);
                this.setSpriteFrame(config.art_asset)
                return
            }
        })
        
        // this.SetPortrait(petData, petConfig);

        this.node.off(cc.Node.EventType.TOUCH_END);
        this.node.off("click");
        touCallBack && this.node.on(cc.Node.EventType.TOUCH_END, touCallBack);
    }
    async setSpriteFrame(petSpriteFrameName: string) {
        let petSf = await KKLoader.loadSprite("Pets/" + petSpriteFrameName)
        if (petSf) {
            this.PetImage.spriteFrame = petSf;
        }
    }

    natureNode:cc.Node = null;
    fireNode:cc.Node = null;
    waterNode:cc.Node = null;
    snackNode:cc.Node = null;
    SetElements(element:Rarity| string){ 
        // background graphics
        
        this.SetSingleBackground(element);
        

        if (!this.natureNode) {
            this.natureNode = cc.find("type_land", this.TypesNode);
            this.fireNode = cc.find("type_fire", this.TypesNode);
            this.waterNode = cc.find("type_water", this.TypesNode);
            this.snackNode = cc.find("type_snack", this.TypesNode);
        }    
        this.natureNode.active = false;
        this.fireNode.active = false;
        this.waterNode.active = false;
        this.snackNode.active = false;

        // element icons

        switch (element) {
            case "nature":
                this.natureNode.active = true;
                break;
            case "fire":
                this.fireNode.active = true;
                break;
            case "water":
                this.waterNode.active = true;
                break;
            case "snack":
                this.snackNode.active = true;
                break;
        }
    }

    SetSingleBackground(element:Rarity| string){
        let bp = 1;
        this.BackgroundAlt.enabled = false;

        switch(element){
            case "nature":
                this.Background.spriteFrame = this.natureBackground;
            break;
            case "fire":
                this.Background.spriteFrame = this.fireBackground;
            break;
            case "water":
                this.Background.spriteFrame = this.waterBackground;
            break;
            case "snack":
                this.Background.spriteFrame = this.snackBackground;
            break;
        }
    }

    setLevelAndName(petid:string,petData?:PetData){
        this.petShadowNode.active = this.StarLevelLabel.node.getParent().active = !!petData;
        this.petLabelNode.active = !petData;
        
        this.StarLevelLabel.string = petData ? petData.petLevel.toString():"1";

        this.NameLabel.string =petData.petName;
    }

    SetDualBackGround(elements:string[]){

        // use index to determine if we're chaning the main background or the second one
        let index = 0;
        this.BackgroundAlt.enabled = true;

        elements.forEach(element => {
            let currentBackground; 
            if(index == 0){
                currentBackground = this.Background;
            } else {
                currentBackground = this.BackgroundAlt;
            }

            let nextBackgroundImage = null;

            switch(element){
                case "nature":
                    nextBackgroundImage = this.natureHalfBackground;
                break;
                case "fire":
                    nextBackgroundImage = this.fireHalfBackground;
                break;
                case "water":
                    nextBackgroundImage = this.waterHalfBackground;
                break;
                case "snack":
                    nextBackgroundImage = this.snackHalfBackground;
                break;
            }

            if(nextBackgroundImage != null){
                currentBackground.spriteFrame = nextBackgroundImage;
                index++;
            }

            if(index >= 2){
                // let's get out in the case there are more than 2 types
                return;
            }
        });
    }

    setRare(Rare:string){
        this.RareLabel.string=Rare;
    }
    // async SetPortrait(petData:PetData, petConfig:PetConfigModel){
    //     this.PetImage.spriteFrame = null;
    //     if (petData) {
    //         petConfig = !petConfig ? PetConfig.findPetByID(petData.petid): petConfig;
    //         MasterConfig.setSkinImage(this.PetImage, petConfig, petData.skinIndex);
    //     }
    // }

  
}

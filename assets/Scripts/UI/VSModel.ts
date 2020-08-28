import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from "../Tools/ScreenSize";
import { getStrength, PetData, ElementType, getPetConfigById, getRestraint, getStrengthByPetData } from "../Config";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";
import { delay } from "../kk/DataUtils";
 

const {ccclass, property} = cc._decorator;

@ccclass
export default class VSModel extends ViewConnector {


    static prefabPath = 'Prefab/VSModel';
 
    static _instance: VSModel = null;

    static async prompt(self:PetData[], opponent:PetData[], type: ElementType.fire): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = VSModel._instance = await this.loadView<VSModel>(parentNode, VSModel);
        vc.applyData(self, opponent);
    
        let executor = (resolve: (any) => void, reject: (error) => void) => {
            VSModel._instance.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    root:cc.Node = null;
    selfInfo : {
        node: cc.Node,
        petDatas: PetData[],
        AllStrength: number,
        restraints:number[],
        restraint_bonus:number,
    } = null;
    opponentInfo : {
        node: cc.Node,
        petDatas: PetData[],
        AllStrength: number,
        restraints:number[],
        restraint_bonus:number,
    } = null;

    applyData(self:PetData[], opponent:PetData[]) {
        this.root = cc.find("content", this.node);
        
        // let close = cc.find("btn_back", this.root);
        // close.on(cc.Node.EventType.TOUCH_END, ()=>{
        //     this.close();
        // })

        this.init(self, opponent);

        this.startBattle();
    }


    async startBattle() {

        await delay(0.5);
        let animation = this.root.getComponent(cc.Animation);
        animation.play();

        await delay(2);

        let AllStrength_self = this.selfInfo.AllStrength;
        this.selfInfo.restraints.forEach((num)=>{AllStrength_self += num});

        let AllStrength_opponent = this.opponentInfo.AllStrength;
        this.opponentInfo.restraints.forEach((num)=>{AllStrength_opponent += num});


        if (AllStrength_self > AllStrength_opponent) {
            
            this.close(true);
        } else{
            this.close(false);
        }

    }

    init(self:PetData[], opponent:PetData[]) {
        //get restraint
        let restraints_self = [];
        let restraints_opponent = [];
        for (let i = 0; i < 4; i++) {
            if (self[i] && opponent[i]) {
                let config1 = getPetConfigById(self[i].petId);
                let config2 = getPetConfigById(opponent[i].petId);
                let result = getRestraint(config1.elements as ElementType, config2.elements as ElementType);

                let strength = getStrengthByPetData(result>= 0 ? self[i]: opponent[i]);
                let bonus = Math.floor(strength *0.1 *10)/10;
                restraints_self.push(result > 0 ? bonus : 0);
                restraints_opponent.push(result < 0 ? bonus : 0);
            }
        }

        //self
        let selfNode = cc.find("selfPetInfo", this.root);
        let selfStrengthInfo = this.updatePlayerInfo(selfNode, self, restraints_self);
        this.selfInfo = {
            node:selfNode,
            petDatas: self,
            AllStrength: selfStrengthInfo.allStrenght,
            restraints:restraints_self,
            restraint_bonus:0
        }

        //opponent
        let opponentNode = cc.find("opponentPetInfo", this.root);
        let opponentStrengthInfo = this.updatePlayerInfo(opponentNode, opponent, restraints_opponent);
        this.opponentInfo = {
            node:opponentNode,
            petDatas: opponent,
            AllStrength: opponentStrengthInfo.allStrenght,
            restraints:restraints_opponent,
            restraint_bonus:0
        }

    }

    updatePlayerInfo(node:cc.Node,petDatas:PetData[], restraints: number[]) {
        //updatepet
        petDatas.forEach((petData, i)=>{
            let petNode = cc.find(`pets/pet${i+1}`, node);
            this.updatePetInfo(petNode, petData, restraints[i]);
        })

        //updatestrength
        return this.updateStrengthInfo(node, petDatas, restraints);
    }

    updatePetInfo(node: cc.Node, petData: PetData, restraint: number) {
        let sprite = cc.find("petimage", node).getComponent(cc.Sprite);
        if (petData) {
            let config = getPetConfigById(petData.petId);
            
            if (restraint > 0) {
                let label_restraint = cc.find("label_bonus", node).getComponent(cc.Label);
                label_restraint.string = "+"+ restraint;
            }
 
            GlobalResources.getSpriteFrame(SpriteType.Pet, config.art_asset, (sf) => {
                sprite.spriteFrame = sf;
                sprite.node.active = true;
            });
        } else {
            sprite.node.active = false;
        }
    }

    updateStrengthInfo(node:cc.Node,pets:PetData[], restraints: number[], type = ElementType.fire) {
   
        let strengthInfo = getStrength(pets, type);
        let strength = strengthInfo.strength;
        let typeNum = strengthInfo.typeNum;

        // let label_strength = cc.find("label_strength", node).getComponent(cc.Label);
        // label_strength.string = "strength:\n" + strength;

        //Environmental bonus:
        let envirBouns = "";
        let label_environment = cc.find("label_environment", node).getComponent(cc.Label);
        label_environment.string = `${strength * typeNum * 0.1}(${typeNum * 10}%)`;

        //restraint
        let restraintBonus = 0;
        restraints.forEach((num)=>{restraintBonus+= num});
        let label_restraint = cc.find("label_restraint", node).getComponent(cc.Label);
        label_restraint.string = ""+restraintBonus;

        //all strength
        let label_allStrength = cc.find("label_allStrength", node).getComponent(cc.Label);
        label_allStrength.string = `${Math.floor((strength + strength * typeNum * 0.1 + restraintBonus)*10)/10}(${typeNum * 10}%)`;

        return strengthInfo;
    }
    
    _originScale = 1;
    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
   adjustGameInterface() {
        let scale = 1;
        scale = ScreenSize.getScale(1, 0.8);

        this.node.width = ScreenSize.width;
        // this.node.height = screen.height;

        this._originScale = this.node.scale = scale;
    }


}

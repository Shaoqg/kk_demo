import { Behavior } from "./Behviors/Behavior";
import { Idle } from "./Behviors/Idle";
import { PetData, getPetConfigById, setElementType, getColorByRarity, Rarity, getHealth, getStrength, getStrengthByPetData } from "../Config";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";
import { Attack } from "./Behviors/Attack";
import { BeAttack } from "./Behviors/BeAttck";
import { PetObject } from "./PetObject";
import { MoveToTarget } from "./Behviors/MoveToTarget";


export enum PetType {
    None = "None",
    Garden = "Garden",
    Battle = "Battle",
    Battle2 = "Battle2",
}

const {ccclass, property} = cc._decorator;

@ccclass
export class PetObjectBattle extends PetObject{

    _attack = 0;

    progressBar_health: cc.ProgressBar = null;
    _currentHP:number = 0;
    _totalHP:number = 0;

    onDeadCallback :Function = null;

    async start () {
        return super.start();
    }

    init(petData:PetData, originNode?:cc.Node, isSelf = false) {

        super.init(petData, originNode);

        let config = getPetConfigById(petData.petId);
        let petImage: cc.Node = this._root.getChildByName("image");
        let sprite_front = petImage.getChildByName("image_front").getComponent(cc.Mask);
        sprite_front.node.width = petImage.width;
        sprite_front.node.height  =  petImage.height;
        sprite_front.node.stopAllActions();
        sprite_front.node.active = false;

        GlobalResources.getSpriteFrame(SpriteType.Pet, config.art_asset).then((sf)=>{
            sprite_front.spriteFrame = sf;
        });

        //setHealth
        let infoNode = cc.find("info", this.node);
        this._attack = getStrengthByPetData(petData);
        this._totalHP = this._currentHP = getHealth(petData);

        this.progressBar_health = cc.find("health", infoNode).getComponent(cc.ProgressBar);
        let bg1 = cc.find("health/bar_bg", infoNode);
        let bg2 = cc.find("health/health", infoNode);
        bg2.color = bg1.color = isSelf ? cc.color(43,116,184) : cc.Color.RED;
        
        let typesNode = cc.find("info/typeLayout", this.node);
        let label_level = cc.find("info/label", this.node).getComponent(cc.Label);

        typesNode.active = false;
        label_level.node.active = false;
        this.updateHealth();
        this.progressBar_health.node.active = false;

    }

    setAnchor(anchor: cc.Vec2) {
        this._anchor = anchor;
    }


    update (dt) {
        super.update(dt);
    }

    setBehavior(behavior: Behavior) {
        let newBehaviorIsIdle = behavior && behavior.getType() == "Wander";
        let oldBehaviorIsIdle = this._currentBehavior && this._currentBehavior.getType() == "Wander";
        let blockIdleOnIdle = newBehaviorIsIdle && oldBehaviorIsIdle;
        if (!blockIdleOnIdle && (!this._currentBehavior || !this._currentBehavior.isPriorityBehavior())) {
            this.clearBehavior(false);
            this._currentBehavior = behavior;
        }
    }

    clearBehavior(goIdle: boolean, onlyBehavior:Behavior=null) {
        let canClear = !onlyBehavior || (onlyBehavior==this._currentBehavior) || !this._currentBehavior;
        if(!canClear){
            return;
        }
        if (this._currentBehavior) {
            this._currentBehavior.clean();
        }

        this._currentBehavior = undefined;
        if (goIdle) {
            this._currentBehavior = new Idle();
            this._currentBehavior.init(this, "petMainWander", {});
            this._currentBehavior.start();
        }
    }

    changeState(state){
        switch (state) {
            case 'Attack':
                
                break;
        
            default:
                break;
        }
    }

    getAttack() {
        let attack = this._attack;

        return attack;
    }

    async attack(targePets: PetObjectBattle[]) {

        if (this._currentBehavior.getType() != "Attack" && this._currentBehavior.getType() != "MoveToTarget" ) {
            let index = 0;
            let distance = 0;
            targePets.forEach((pets, i) => {
                let tempDistance = pets.node.position.sub(this.node.position).mag();
                if (tempDistance > distance && !pets.isDead()) {
                    distance = tempDistance;
                    index = i;
                }
            });

            let behavior = new MoveToTarget();
            behavior.init(this, "petMainWander", {targetPet: targePets[index]});
            let isMoveTo = await behavior.start();
            if (isMoveTo) {
                let behavior_attack = new Attack();
                behavior_attack.init(this, "petMainWander", {targetPet: targePets[index]});
                behavior_attack.start();
            }
        }
    }

    beAttack(targePet:PetObjectBattle) {
        let attack = targePet.getAttack();
        this.faceInterest(targePet.node.x);

        if (this._currentBehavior.getType() == "Attack") {
            let beHitNode= cc.find("image/image_front", this._root);
            beHitNode.active = true;
            beHitNode.runAction(cc.sequence(
                cc.delayTime(0.15),
                cc.callFunc(()=> beHitNode.active = false)
            ))
        }else if (this._currentBehavior.getType() != "BeAttack") {
            let behavior = new BeAttack();
            behavior.init(this, "petMainWander", {targetPet: targePet});
            behavior.start();
        }

        this._currentHP =  this._currentHP > attack ? this._currentHP - attack: 0;
        this.progressBar_health.node.active = true;
        this.updateHealth();

        let isDead = this.isDead();
        if (isDead) {
            this.onDead();
        }

        return isDead;
    }

    updateHealth() {
        let hpBar = this._currentHP/this._totalHP;

        this.progressBar_health.progress = hpBar;
    }

    isDead() {
        return this._currentHP <= 0;
    }

    onDead() {
        this.onDeadCallback && this.onDeadCallback();
        this.onDeadCallback = null;
    }

    onRemove() {
        if (this._currentBehavior) {
            this._currentBehavior.end();
        }
        this._currentHP = 0;
        this._attack = 0;
    }

}

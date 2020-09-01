import { PetObject } from "../PetObject";
import { Behavior, BehaviorParams } from "./Behavior";

export class BeAttack extends Behavior {

    protected _actorAnimation: cc.Animation;

    _attackTarget: PetObject = null;

    getType() : string {
        return "BeAttack";
    }

    init(pet:PetObject, source:string, options:BehaviorParams) {
        super.init(pet, source, null);
        this._actorAnimation = this._actor.node.getComponent<cc.Animation>(cc.Animation);

        this._attackTarget = options.targetPet;

        this._actorAnimation.play("pet_injured");
        this._actorAnimation.on("finished", ()=>{
            this._isActive = false;
        })

    }

    clean() {
        this._stand();
        super.clean();
    }

    _stand() {
        if(this._actorAnimation) {
            this._actorAnimation.stop("pet_injured");
        }
    }
}
import { PetObject } from "../PetObject";
import { Behavior } from "./Behavior";

export class Land extends Behavior {

    protected _actorAnimation: cc.Animation;

    getType() : string {
        return "Land";
    }

    init(pet:PetObject, source:string) {
        super.init(pet, source, null);
        this._actorAnimation = this._actor.node.getComponent<cc.Animation>(cc.Animation);

        this._actorAnimation.play("pet_jump");
        this._actorAnimation.on("finished", ()=>{
            this._isActive = false;
        }, this._actorAnimation);
    }

    clean() {
        this._stand();
        super.clean();
    }

    _stand() {
        if(this._actorAnimation) {
            this._actorAnimation.stop("pet_jump");
        }
    }
}
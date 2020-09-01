import { PetObject } from "../PetObject";
import { Behavior } from "./Behavior";

export class Idle extends Behavior {

    protected _actorAnimation: cc.Animation;

    getType() : string {
        return "Idle";
    }

    init(pet:PetObject, source:string) {
        super.init(pet, source, null);
        this._actorAnimation = this._actor.node.getComponent<cc.Animation>(cc.Animation);

    }

    update(dt) {
        let finished =  super.update(dt);
        if (finished) {
            this._isActive = true;

            this._actorAnimation.play("pet_idle");
            this._actorAnimation.on("finished", ()=>{
                this._isActive = false;
            })
        }
        return !this._isActive;
    }

    clean() {
        this._stand();
        super.clean();
    }

    _stand() {
        if(this._actorAnimation) {
            this._actorAnimation.stop("pet_idle");
        }
    }
}
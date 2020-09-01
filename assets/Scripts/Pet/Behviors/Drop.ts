import { PetObject } from "../PetObject";
import { Behavior } from "./Behavior";

export class Drop extends Behavior {

    protected _actorAnimation: cc.Animation;

    getType() : string {
        return "Drop";
    }

    init(pet:PetObject, source:string) {
        super.init(pet, source, null);
        this._actorAnimation = this._actor.node.getComponent<cc.Animation>(cc.Animation);
        this._actorAnimation.play("pet_drop");
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
            this._actorAnimation.stop("pet_drop");
        }
    }
}
import { PetObject } from "../PetObject";
import { Behavior, BehaviorParams } from "./Behavior";

export class Attack extends Behavior {

    protected _actorAnimation: cc.Animation;

    _attackTarget: PetObject = null;
    _attackTime = 1;

    getType(): string {
        return "Attack";
    }

    init(pet: PetObject, source: string, options: BehaviorParams) {
        super.init(pet, source, null);
        this._actorAnimation = this._actor.node.getComponent<cc.Animation>(cc.Animation);

        this._attackTarget = options.targetPet;
    }

    update(dt) {
        this._attackTime -= dt;
        if (this._attackTarget && this._attackTime <= 0) {
            this._attackTime += 1;
            this._actor.faceInterest(this._attackTarget.node.position);
            
            setTimeout(()=>{
                this._attackTarget.beAttack(this._actor);
            }, 200);

            this._actorAnimation.play("pet_attack");
            this._actorAnimation.on("finished", () => {
            })
        }
        return super.update(dt);
    }


    clean() {
        this._stand();
        super.clean();
    }

    _stand() {
        if (this._actorAnimation) {
            this._actorAnimation.stop("pet_attack");
        }
    }
}
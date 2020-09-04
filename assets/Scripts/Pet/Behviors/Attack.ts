import { PetObject } from "../PetObject";
import { Behavior, BehaviorParams } from "./Behavior";
import { PetObjectBattle } from "../PetObjectBattle";

enum AttackState {
    attackRead = 0,
    attacking = 1,
    attacked = 2
}

export class Attack extends Behavior {

    protected _actorAnimation: cc.Animation;

    _attackTarget: PetObjectBattle = null;
    _attackTime = 1.5;

    attackState: AttackState = AttackState.attackRead;
    attacTriggerkTime = 0.2;

    getType(): string {
        return "Attack";
    }

    init(pet: PetObject | PetObjectBattle, source: string, options: BehaviorParams) {
        super.init(pet, source, null);
        this._actorAnimation = this._actor.node.getComponent<cc.Animation>(cc.Animation);

        this._attackTarget = options.targetPet as PetObjectBattle;
        this._attackTime = 1.5 + Math.random()*0.5;
    }

    update(dt) {
        this._attackTime -= dt;

        if (!this._attackTarget || this._attackTarget.isDead()) {
            this._isActive = false;
        }else if (this._attackTarget && this._attackTime <= 0) {
            if( Math.abs(this._actor.node.y- this._attackTarget.node.y) >= 50  || Math.abs(this._actor.node.x - this._attackTarget.node.x) >= 120) {
                this._isActive = false;
            }else {
                this.attackState = AttackState.attacking;
                this._attackTime += 1.5;
                this._actor.faceInterest(this._attackTarget.node.x);
                this._actorAnimation.play("pet_attack");
                this._actorAnimation.on("finished", () => {
                })
            }
        }
        if (this.attackState == AttackState.attacking) {
            this.attacTriggerkTime -= dt;
            if (this.attacTriggerkTime <= 0) {
                this.attacTriggerkTime = 0.2;
                this.attackState = AttackState.attacked;
                this._attackTarget.beAttack(this._actor as PetObjectBattle);
            }

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
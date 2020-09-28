import { PetObject } from "../PetObject";
import { IslandPointHelper } from "../IslandPointHelper";
import { BehaviorParams, Behavior } from "./Behavior";
import { PetObjectBattle } from "../PetObjectBattle";

export class MoveToTarget extends Behavior {

    protected _actorAnimation: cc.Animation;
    protected _position: cc.Vec2;

    protected _targetNode: cc.Node = null;
    protected _targetPos: cc.Node = null;

    // walk speed
    protected _baseSpeed: number = 75;
    protected _speed: number = this._baseSpeed;

    protected teamIndex = 0;

    // protected _transitionBehavior:PerformAnimation;
    protected _prevDirection: cc.Vec2 = undefined;

    protected _radius = 100;

    _random = 0;

    getType(): string {
        return "MoveToTarget";
    }

    init(pet: PetObject, source: string, options: BehaviorParams) {
        this._actor = pet;
        this._position = options.targetPet.node.position;
        this._targetNode = options.targetPet.node;

        this.teamIndex = (this._actor as PetObjectBattle).teamIndx;
        this._speed = this._baseSpeed * ( this.teamIndex<=0? 1.5:1);

    }

    update(dt: number): boolean {
        let finished = super.update(dt);

        if (!finished && this._isActive && this._targetNode) {
            this.updatePos(dt);
            let pos = this._actor.node.position;
            let direction = this._position.sub(pos).normalize();
            if (Math.abs(pos.y - this._position.y) <= 10  && Math.abs(pos.x - this._targetNode.x) <=  this.baseX[this.teamIndex]) {
                this._position = undefined;
                this._isActive = false;
                this._behaviorResult = true;
            } else {
                this._actor.faceInterest(this._targetNode.x);
                this._actor.updateWalkAnim(dt, this._speed / this._baseSpeed);
                // this._actor.node.zIndex = -1 * (this._actor.node.y); //TODO: more robust z sort
                let movement = direction.mul(this._speed * dt);
                this._actor.node.position = pos.add(movement);
                this._prevDirection = direction;
            }
        }

        return !this._isActive;
    }

    baseX = [110, 70, 70];
    baseY = [0, 40, -40]
    _time = 0.1
    updatePos(dt) {
        this._time -= dt;
        if (this._time <= 0) {
            this._time += 0.1;

            let centerDis = (this._targetNode.x - this._actor.node.x);
            let centerX = (this._targetNode.x + this._actor.node.x)/2;
            if (Math.abs(centerDis) < 100) {
                this._position = (cc.v2(centerX + (centerX > this._actor.node.x ? -1 : 1) * (this.baseX[this.teamIndex] - 5)*0.5, this._targetNode.y + this.baseY[this.teamIndex]));
            } else {
                this._position = (cc.v2(this._targetNode.x + (this._targetNode.x > this._actor.node.x ? -40 : 40), this._targetNode.y));
            }

        }
    }

    clean() {
        this._stand();
        super.clean();
    }

    _stand() {
        if (this._actorAnimation) {
            this._actorAnimation.stop("walk");
        }
    }
}
import { PetObject } from "../PetObject";
import { IslandPointHelper } from "../IslandPointHelper";
import { BehaviorParams, Behavior } from "./Behavior";

export class MoveToTarget extends Behavior {

    protected _actorAnimation: cc.Animation;
    protected _position: cc.Vec2;

    protected _targetNode: cc.Node = null;
    protected _targetPos:cc.Node = null;

    // walk speed
    protected _baseSpeed:number = 75;
    protected _speed:number = this._baseSpeed;

    // protected _transitionBehavior:PerformAnimation;
    protected _prevDirection: cc.Vec2 = undefined;

    protected _radius = 100;

    getType() : string {
        return "MoveToTarget";
    }

    init(pet:PetObject, source:string, options:BehaviorParams) {
        this._actor = pet;
        this._position = options.targetPet.node.position;
        this._targetNode = options.targetPet.node;

    }

    update(dt: number) : boolean {
        let finished = super.update(dt);

        if(!finished && this._isActive && this._targetNode) {
            this.updatePos(dt);
            let pos = this._actor.node.position;
            let direction = this._position.sub(pos).normalize();
            if( Math.abs(pos.y- this._position.y) <= 20  && Math.abs(pos.x - this._position.x) <= 20) {
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

    _time = 0.1
    updatePos(dt){
        this._time -= dt;
        if (this._time <= 0) {
            this._time += 0.1;
            
            let centerX =(this._targetNode.x - this._actor.node.x);
            if (Math.abs(centerX) > 100) {
                this._position = (cc.v2( centerX + (centerX > this._actor.node.x ?-50:50) , this._targetNode.position.y + Math.random()*40-20));
            }

        }
    }
  
    clean() {
        this._stand();
        super.clean();
    }

    _stand() {
        if(this._actorAnimation) {
            this._actorAnimation.stop("walk");
        }
    }
}
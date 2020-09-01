import {Behavior, onFinishedCallback, BehaviorParams} from "./Behavior";
import { PetObject } from "../PetObject";

export class MoveToPosition extends Behavior {

    // The position to move to
    protected _position:cc.Vec2;

    // walk speed
    protected _baseSpeed:number = 50;
    protected _speed:number = this._baseSpeed;

    // generated path to position
    protected _walkPathIndex: number;
    protected _walkTarget: cc.Vec2 = cc.Vec2.ZERO;

    protected _turnAnimAction;

    // protected _transitionBehavior:PerformAnimation;
    protected _prevDirection: cc.Vec2 = undefined;

    getType():string {
        return "MoveToPosition";
    }

    /**
     * Initialize MoveToPosition behavior
     * @param pet - the pet to act upon
     * @param source - the caller of this behavior
     * @param options - generic options param.
     */
    init(pet:PetObject, source:string, options:BehaviorParams) {
        super.init(pet, source, options);
        if(options.position) {
            //console.log("position = " + options["position"]);
            this._position = options.position;
        } else {
            //console.log("Didn't receive a position in options.");
            this._position = this._actor.node.position;
        }
        if(options.speed) {
            //console.log("speed = " + options["speed"]);
            this._speed = options.speed;
        }

        if(options.waitAfter) {
            this._endWithIdle = false;
        }

        this._name = this.getType() + "{" + this._position.x + "," + this._position.y + ", " + this._speed + "}";
    }

    update(dt: number) : boolean {
        let finished = super.update(dt);

        if(!finished && this._isActive && this._position) {
            let direction = this._position.sub(this._actor.node.position).normalize();
            let dotProduct = this._prevDirection ? direction.dot(this._prevDirection) : 1;
            if(dotProduct == -1) {
                this._position = undefined;
                this._isActive = false;
            } else {
                this._actor.faceInterest(this._position);
                this._actor.updateWalkAnim(dt, this._speed / this._baseSpeed);
               // this._actor.node.zIndex = -1 * (this._actor.node.y); //TODO: more robust z sort
                let movement = direction.mul(this._speed*dt);
                this._actor.node.position = this._actor.node.position.add(movement);
                this._prevDirection = direction;
            }
        }

        return !this._isActive;
    }

    clean() {
        super.clean();
    }
}

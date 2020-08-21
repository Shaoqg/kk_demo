import { MoveToPosition } from "./MoveToPosition";
import { PetObject } from "./PetObject";
import { IslandPointHelper } from "./IslandPointHelper";

export class Wander extends MoveToPosition {

    protected _actorAnimation: cc.Animation;
    protected _timeoutHandler;
    protected _anchor: cc.Vec2;
    protected _wanderRadius: number;
    protected _position: cc.Vec2;
    protected _baseTimeoutDurationMs: number;

    getType() : string {
        return "Wander";
    }

    init(pet:PetObject, source:string, options:{ position?: cc.Vec2, wanderRadius?: number }) {
        this._wanderRadius = options.wanderRadius || pet.node.getParent().width/2;
        this._anchor = options.position || cc.v2(0,0);
        this._actor = pet;
        
        this._position = this._actor.node.getParent().convertToNodeSpaceAR(IslandPointHelper.getRandomPointOnIslandInWorldSpaceForPet(this._actor.node));
        //super.init(pet, source, { position: this._position });

        this._baseTimeoutDurationMs = 5000;

        //this._actorAnimation = this._actor.node.getComponent<cc.Animation>(cc.Animation);
    }

    update(dt: number) : boolean {
        let finished = super.update(dt);

        if(finished) {
            this._isActive = true;

            let startWalk = () => {
                //Keep within container
                //this._position = cc.v2(this._anchor.x + (Math.random() * this._wanderRadius), this._anchor.y + (Math.random() * this._wanderRadius));
                if (!this._isActive) {//The behavior may have ended after the delay
                    return;
                }
                this._position = this._actor.node.getParent().convertToNodeSpaceAR(IslandPointHelper.getRandomPointOnIslandInWorldSpaceForPet(this._actor.node));
                if(this._actorAnimation) {
                    let player = this._actorAnimation.play("walk");
                    if(player) {
                        player.speed = this._speed / this._baseSpeed;
                    }
                }
                this._timeoutHandler = null;
            }

            if(!this._timeoutHandler) {
                this._timeoutHandler = setTimeout(startWalk, Math.random()*this._baseTimeoutDurationMs);
            }
        }

        return !this._isActive;
       // return finished;
    }

    checkRightStateToRadom(topState){
        if (topState == "WheelState" || topState == "HighlightSpinButtonState" || topState == "SpinToSliceState" || topState == "PointAtBuildState") {
            return true;
        }else{
            return false;
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
import { Behavior } from "./Behavior";
import { Wander } from "./Wander";


const {ccclass, property} = cc._decorator;

@ccclass
export class PetObject extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private _currentBehavior: Behavior;
    private _spriteAction: cc.Action = null;  // sprite动画
    private _sprite: cc.Sprite = null;      // Sprite
    private _spriteScale: number = 1;
    _turnTarget: number = 1;        // 旋转的方向
    _turnAnimAction: cc.Action = null; // 旋转action
    walkIntensity: number = 1;
    _id: string;
    _anchor: cc.Vec2;

    async start () {
        this._sprite = this.node.getChildByName("image").getComponent<cc.Sprite>(cc.Sprite);
        this.resetScale();
    }

    setAnchor(anchor: cc.Vec2) {
        this._anchor = anchor;
    }


    update (dt) {
        if(this._currentBehavior) {
            let finished = this._currentBehavior.update(dt);
            if(finished) {
                this._currentBehavior.end();
            }
        }
    }

    setBehavior(behavior: Behavior) {
        let newBehaviorIsIdle = behavior && behavior.getType() == "Wander";
        let oldBehaviorIsIdle = this._currentBehavior && this._currentBehavior.getType() == "Wander";
        let blockIdleOnIdle = newBehaviorIsIdle && oldBehaviorIsIdle;
        if (!blockIdleOnIdle && (!this._currentBehavior || !this._currentBehavior.isPriorityBehavior())) {
            this.clearBehavior(false);
            this._currentBehavior = behavior;
        }
    }

    getActiveBehavior() : Behavior {
        return this._currentBehavior;
    }

    clearBehavior(goIdle: boolean, onlyBehavior:Behavior=null) {
        let canClear = !onlyBehavior || (onlyBehavior==this._currentBehavior) || !this._currentBehavior;
        if(!canClear){
            return;
        }
        if (this._currentBehavior) {
            this._currentBehavior.clean();
        }

        this._currentBehavior = undefined;
        if (goIdle) {
            this._currentBehavior = new Wander();
            this._currentBehavior.init(this, "petMainWander", {});
            this._currentBehavior.start();
        }
    }

    resetSpriteAction() {
        if (cc.isValid(this._spriteAction) && !this._spriteAction.isDone()) {
            this._sprite.node.stopAction(this._spriteAction);
        }
        this._spriteAction = null;
    }

    updateWalkAnim(dt, scale = 1) {
        if (!cc.isValid(this._spriteAction) || this._spriteAction.isDone()) {
            this.playWalkAnim(scale);
        }
    }

    playWalkAnim(scale = 1, hopHeight: number = 10) {
        let baseStepDuration = 0.1;
        let finalStepDuration = baseStepDuration * 1/this.walkIntensity;

        this.resetSpriteAction();
        let mov = cc.sequence(
            cc.spawn(
                cc.moveTo(finalStepDuration * scale, new cc.Vec2(0, hopHeight)).easing(cc.easeIn(0.5)),
                cc.scaleTo(finalStepDuration * scale, 1, 1.02).easing(cc.easeIn(0.5)),
            ),
            cc.spawn(
                cc.moveTo(finalStepDuration * scale, new cc.Vec2(0, 0)).easing(cc.easeOut(0.5)),
                cc.scaleTo(finalStepDuration * scale, 1, 0.98).easing(cc.easeIn(0.5)),
            )
        );
        this._spriteAction = this._sprite.node.runAction(mov);
    }

    faceInterest(pos: cc.Vec2): boolean {
        let faceRight = pos.x > this.node.position.x;
        this.setFlip(faceRight ? 1 : -1);
        return faceRight;
    }

    setFlip(dir: number, dur: number = 0.5) {
        dir *= this._spriteScale;
        if (this.node.scaleX == dir)
            return;

        // let refresh = false;
        // if ((!cc.isValid(this._turnAnimAction) || this._turnAnimAction.isDone) && Math.abs(this._pNode.scaleX) < 1)
        //     refresh = true;

        if (this._turnTarget!=dir) {
            this.node.stopAllActions();
            this._turnAnimAction = cc.scaleTo(dur, dir, this.node.scaleY);
            this.node.runAction(this._turnAnimAction);
            this._turnTarget = dir;
        }
    }

    getFace() : number {
        return this._turnTarget;
    }

    resetScale() {
        this.node.scale = this._spriteScale;
        this._sprite.node.scale = 1;
    }
}
import { Behavior, onFinishedCallback, BehaviorParams } from "./Behavior";
import { PetObject } from "./PetObject";

export class PerformAnimation extends Behavior {

    // name of animation to run
    protected _animation: string
    protected _animationComponent: cc.Animation;

    // time to finish the animation
    protected _duration: number;
    protected _endTime: number;
    protected _animationSpeed: number;

    protected _startTime: number = 0;
    protected _forever: boolean = true;

    getType(): string {
        return "PerformAnimation";
    }

    /**
     * Initialize PerformAnimation behavior
     * @param pet - the pet to act upon
     * @param source - the caller of this behavior
     * @param options - generic options param.
     */
    init(pet: PetObject, source: string, options: BehaviorParams) {
        super.init(pet, source, options);
        //console.log("animation = " + options["animation"] || options["parameter"]);
        this._animation = options.animation;
        //console.log("duration = " + options["duration"]);
        this._duration = options.duration;
        this._forever = options.forever
        this._animationSpeed = options.animationSpeed;
        this._name = this.getType() + "{" + this._animation + ", " + this._duration + "}";

        if (options.startTime) {
            this._startTime = options.startTime;
        }

        if (this._animation) {
            let pNode = this._actor.node;
            if (pNode) {
                this._animationComponent = pNode.getComponent<cc.Animation>(cc.Animation);
                if (this._animationComponent == undefined) {
                    this._animationComponent = pNode.addComponent<cc.Animation>(cc.Animation);
                }
                let hasAnim = this._animationComponent.getClips().find((value) => {
                    return value && value.name == this._animation;
                });
                /*if(!hasAnim) {
                    let animClip = GlobalResources.animations[this._animation];
                    if(animClip) {
                        this._animationComponent.addClip(animClip);
                        this._animationComponent.getClips()[0] = animClip;
                    } else {
                        this._isActive = false;
                    }
                }*/
            }
        }
    }

    async start(runPrimary: boolean = true): Promise<any> {
        if (this._duration) {
            this._endTime = Date.now() + this._duration;
        }
        if (this._animation) {
            // start the animation
            let animPlaying = this._animationComponent.play(this._animation, this._startTime);
            if (animPlaying) {
                animPlaying.speed = this._animationSpeed ? this._animationSpeed : animPlaying.speed;
                if (this._endTime) {
                    animPlaying.repeatCount = 100;
                } else {
                    animPlaying.repeatCount = 1;
                    this._animationComponent.once(cc.Animation.EventType.FINISHED, () => {
                        this._isActive = false;
                    });
                }
            }
        }

        return super.start(runPrimary);
    }

    /**
     * Update the behavior and inform the caller if it's finished
     * @param dt - deltaTime
     * @return - whether the behavior finished.
     */
    update(dt: number): boolean {
        let superComplete = super.update(dt);
        if (this._isActive) {
            if (this._endTime && !this._forever) {
                let currentTime = Date.now();
                this._isActive = currentTime < this._endTime;
            }
        }

        return !this._isActive;
    }

    clean() {
        super.clean();
        this._animationComponent.isValid && this._animationComponent.stop(this._animation);
        this._actor.resetScale();
        let pNode = this._actor.node;
        if (pNode) {
            pNode.scaleX = this._actor.getFace();
            pNode.scaleY = 1;
            pNode.rotation = 0;
            pNode.position = new cc.Vec2(0, 0);
            let spriteNode = pNode.getChildByName("sprite");
            if (spriteNode) {
                let sprite = spriteNode.getComponent<cc.Sprite>(cc.Sprite);
                if (sprite) {
                    sprite.node.scale = 1;
                    sprite.node.rotation = 0;
                    sprite.node.position = new cc.Vec2(0, 0);
                }
            }

            pNode.removeComponent(cc.Animation);
            this._animationComponent.isValid && this._animationComponent.destroy();
            this._animationComponent = undefined;
        }
    }

    end() {
        super.end();
    }

    /**
     * Resumes the behavior from the pets current position
     * @param snapToPosition - position (if any) to snap pet to before resuming animation
     */
    async resume(snapToPosition?: cc.Vec2) {
        if (snapToPosition) {
            this._actor.node.position = snapToPosition;
        }

        return super.resume(snapToPosition);
    }
}

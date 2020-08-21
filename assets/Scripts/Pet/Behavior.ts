import { PetObject } from "./PetObject";

export type onFinishedCallback = (any)=>void;

export type BehaviorParams = {
    // MoveToPosition
    speed?: number,
    position?: cc.Vec2,
    wanderRadius?: number,
    waitAfter?: boolean,

    // PerformAnimation
    animation?: string,
    duration?: number,
    animationSpeed?: number,
    startTime?: number,
}

export class Behavior {

    static BehaviorTriggers:number = 0;
    protected _behaviorID:number = -1;

    // The pet we are moving around
    protected _actor:PetObject;

    // Who is calling this behavior
    protected _source:string;

    // identity of the behavior
    protected _name:string;

    // whether the behavior is currently processing
    protected _isActive:boolean;

    protected _onFinishedCallback:onFinishedCallback;

    protected _behaviorResult:any;

    protected _isPriorityBehavior:boolean = false;

    protected _endWithIdle:boolean = true;
    
    getType():string {
        return "Behavior";
    }

    init(pet:PetObject, source:string, options:BehaviorParams) {
        this._actor = pet;
        this._source = source;
        this._name = "DefaultBehavior - This should be overriden in your Behavior's init."
        this._behaviorID = ++Behavior.BehaviorTriggers;
    }

    async start(runPrimary:boolean=true, activityId?: string) : Promise<any> {
        let executor = (resolve:(any)=>void, reject:(error)=>void) => {
            this._onFinishedCallback = resolve;
        }

        this._isActive = true;
        if(runPrimary){
            this._actor.setBehavior(this);
        }

        return new Promise<any>(executor);
    }

    /**
     * Update the behavior and inform the caller if it's finished
     * @param dt - deltaTime
     * @return - whether the behavior finished.
     */
    update(dt:number) : boolean {
        
        return !this._isActive;
    }

    /**
     * Resumes the behavior from the pets current position
     */
    async resume(snapToPosition?:cc.Vec2) : Promise<any> {
        return this.start();
    }

    end() {
        this._isActive = false;
        if(this._actor.getActiveBehavior()==this){ // we might be running as a child of another
            this._actor.clearBehavior(this._endWithIdle, this); // should we force idle or not?
        }
        if(this._onFinishedCallback != undefined) {
            this._onFinishedCallback(this._behaviorResult);
        }
    }

    clean() {
        //console.log("Calling clean on " + this._name);
        this._isActive = false;
        this._isPriorityBehavior = false;
    }

    isPriorityBehavior() : boolean {
        return this._isPriorityBehavior;
    }

    setPriorityBehavior(priority:boolean) {
        this._isPriorityBehavior = priority;
    }

    getSource() : string {
        return this._source;
    }
}

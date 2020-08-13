import { EventEmitter, EventType } from "../../Tools/EventEmitter";

export class State {

    private _paused:boolean = false;
    private _blockLowerUpdates: boolean = false;

    private _name: string = "";

    private _stateFinished;

    get blockLowerUpdates() {
        return this._blockLowerUpdates;
    }

    initState(name) {
        this._name = name;
    }

    startState(options?: any) : Promise<void> {
        let executor = (resolve:(any)=>void, reject:(error)=>void) => {
            this._stateFinished = resolve;
        }

        EventEmitter.emitEvent(EventType.STATE_STARTED, undefined, this.getName());

        return new Promise<void>(executor);
    }

    endState() {
        EventEmitter.emitEvent(EventType.STATE_ENDED, undefined, this.getName());
        this._stateFinished && this._stateFinished();
    }

    updateState(dt:number) {

    }

    pauseState(pause:boolean) {
        this._paused = pause;
    }

    sendToBackground() {
        
    }

    getName() : string {
        return this._name;
    }
}

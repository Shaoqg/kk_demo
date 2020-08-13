import { State } from "./State";

export class StateManager {

    private static _instance: StateManager = undefined;

    private _stringToStateMap: Object = {};

    private _activeStates: State[] = [];

    private _lockState:{[stateName:string]: boolean} = {};

    static get instance() {
        if(StateManager._instance == undefined) {
            StateManager._instance = new StateManager();
        }

        return StateManager._instance;
    }

    init() {

    }

    update(dt:number) {
        for(let index:number = this._activeStates.length - 1; index >= 0; --index) {
            this._activeStates[index].updateState(dt);
            if(this._activeStates[index].blockLowerUpdates) {
                break;
            }
        }
    }

    lockState(stateName: string, bool:boolean) {
        this._lockState[stateName] = bool;
    }

    isLocked(){
        let state = this.getTopState();
        if (state && this._lockState[state.getName()]) {
            return true;
        }
        return false;
    }

    registerState(name: string, state:State) : State {
        this._stringToStateMap[name] = state;
        state.initState(name);
        return state;
    }

    getState(name: string) : State {
        return this._stringToStateMap[name];
    }

    changeState(stateName:string, ...options: any) : Promise<void> {
        if (this.isLocked()) {
            return undefined;
        }

        let stateLength = this._activeStates.length;
        let stateAlreadyActive = this._activeStates.find((state) => state.getName() == stateName);
        if(stateLength < 1 || !stateAlreadyActive) {
            this.popAllStates();
            return this.pushState.apply(this, [stateName, ...options]);
        }

        return undefined;
    }

    pushState(stateName:string, ...options: any) : Promise<void> {
        let newState: State = this._stringToStateMap[stateName];

        if(this._activeStates.length > 0) {
            let activeState = this._activeStates[this._activeStates.length-1];
            if(activeState) {
                activeState.sendToBackground();
            }
        }

        this._activeStates.push(newState);
        return newState.startState.apply(newState, options);
    }

    popState(stateName?: string) {
        if(stateName) {
            let stateIndex = this._activeStates.findIndex((value, index, obj) : boolean => {
                return this.getState(stateName) == value;
            });

            if(stateIndex != -1) {
                let state : State[] = this._activeStates.splice(stateIndex, 1);
                state[0].endState();
            }
        } else {
            if(this._activeStates.length > 0) {
                let state = this._activeStates.pop();
                state.endState();
            }
        }
    }

    popAllStates() {
        while(this._activeStates.length > 0) {
            let state = this._activeStates.pop();
            state.endState();
        }
    }

    getTopState() : State {
        if(this._activeStates.length > 0) {
            return this._activeStates[this._activeStates.length - 1];
        }

        return undefined;
    }
}

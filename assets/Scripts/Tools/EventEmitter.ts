import { VoidCallPromise, CallPromise } from './../kk/DataUtils';

export enum EventType {
    TUTORIAL_OVER = "TUTORIAL_OVER",
    TUTORIAL_MODAL_CLOSED = "TUTORIAL_MODAL_CLOSED",
    STATE_STARTED = "STATE_STARTED",
    STATE_ENDED = "STATE_ENDED",

    LEVEL_UP_CASTLE = "LEVEL_UP_CASTLE",

    LEVEL_UP_BUILD = "LEVEL_UP_BUILD",


    UPDATE_RESOURCE = "UPDATE_RESOURCE",
    STAR_INCREASE = "STAR_INCREASE",
    LEVEL_UP_TREE = "LEVEL_UP_TREE",
    CHECK_AREA_COMPELETE = "CHECK_AREA_COMPELETE",
    GO_CAPTURE = "GO_CAPTURE",
    UPDATE_SPEED = "UPDATE_SPEED",
};

let globalKey = "global";
let callbackMap = {
    [globalKey]: {}
};

export class EventEmitter {
    static subscribeTo(eventType: EventType, eventHandler: (args?) => void, node?: cc.Node) {
        if(node) {
            callbackMap[node.uuid] = callbackMap[node.uuid] || {};
            callbackMap[node.uuid][eventType] = callbackMap[node.uuid][eventType] || [];
            callbackMap[node.uuid][eventType].push(eventHandler);
        } else {
            callbackMap[globalKey][eventType] = callbackMap[globalKey][eventType] || [];
            callbackMap[globalKey][eventType].push(eventHandler);
        }

        ///console.log(eventType+": subscribed for node "+ (node && node.name), eventHandler)
        return eventHandler; // so we can unsub
    }

    static subscribeToOnce(eventType: EventType, eventHandler: (args?) => void, node?: cc.Node): (args?) => void {
        let handleAndUnsub = (...args) => {
            eventHandler.apply(eventHandler, args);
            //console.log(eventType + "- handle and unsub triggered", eventHandler)
            this.unsubscribeFrom(eventType, handleAndUnsub, node);
        };

        this.subscribeTo(eventType, handleAndUnsub, node);

        return handleAndUnsub; //Need this reference as a parameter to unsub
    }

    // wait for an event, with an optional condition to wait for
    static async promise(eventType: EventType, condition?:()=>boolean, checkOnStart=true){
        if(checkOnStart && condition && condition()){
            return;
        }

        let p = new CallPromise<any>();
        let eventChecker=(...args)=>{
            let complete = !condition || condition();
            if(complete){
                this.unsubscribeFrom(eventType, eventChecker);
                p.resolve(args); // as an array; sad :(
            }
            return false;
        };
        this.subscribeTo(eventType, eventChecker);
        return p;
    }

    static unsubscribeFrom(eventType: EventType, eventHandler: (args?) => void, node?: cc.Node) {
        let callbacks: Function[];

        if(node) {
            if(callbackMap[node.uuid]) {
                callbacks = callbackMap[node.uuid][eventType];
            }
        } else {
            if(callbackMap[globalKey]) {
                callbacks = callbackMap[globalKey][eventType];
            }
        }

        if(callbacks) {
            let targetIndex = callbacks.indexOf(eventHandler);

            if(targetIndex > -1) {
                callbacks.splice(callbacks.indexOf(eventHandler), 1);
            } else {
                console.warn(`EventEmitter - Unsubscribe unsuccessful. Provided eventHandler "${eventHandler.name}" does not match any stored handler for ${eventType}`);
            }
        }
    }

    static clearEvent(eventType, node?: cc.Node) {
        if(node) {
            if(callbackMap[node.uuid]) {
                if(callbackMap[node.uuid][eventType]) {
                    callbackMap[node.uuid][eventType] = [];
                }
            }
        } else {
            if(callbackMap[globalKey]) {
                if(callbackMap[globalKey][eventType]) {
                    callbackMap[globalKey][eventType] = [];
                }
            }
        }
    }

    static emitEvent(eventType, node?: cc.Node, ...args) {
        let callbacks: Function[];
        // TODO - we shoudl ALSO check global subs, even if no node was specified

        if((node && !callbackMap[node.uuid]) || !(node || callbackMap[globalKey])) {
            return;
        }

        if(node) {
           callbacks = callbackMap[node.uuid][eventType];
        } else {
           callbacks = callbackMap[globalKey][eventType];
        }

        if(callbacks) {
            // TODO - undefined behavior if callback deletes many? need to dupe list.
            for(let index = callbacks.length - 1; index >= 0; --index) {
                let cb = callbacks[index];
                if(cb) {
                    cb.apply(cb, args);
                }
            }
        }
    }
}
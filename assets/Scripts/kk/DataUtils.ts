
export{setInObject,getInObject,jstr,AppScopedIdPair, delay}

function jstr(obj:any){
    return JSON.stringify(obj);
}

type AppScopedIdPair  = {
    appId: string;
    playerId: string;
}

function setInObject(json:object, path:(string[]|string), value, index=0){
    var pathArray = (typeof path == "string") ? path.split('.') : path;
    let key = pathArray[index];
    if(index==pathArray.length-1){
        // topKey is bottom key!
        json[key] = value;
    } else {
        // miles to go before we sleep
        let nextJson = json[key];
        if(nextJson===undefined){ // insert missing paths
            nextJson = {};
            json[key] = nextJson;
        }
        setInObject(nextJson, pathArray, value, index+1 );
    }
}

function getInObject(json:object, path:(string[]|string), index=0){
    var pathArray = (typeof path == "string") ? path.split('.') : path;
    let key = pathArray[index];
    let nextJson = json[key];
    if(index==pathArray.length-1){
        // topKey is bottom key! 
        return nextJson;
    }
    if(nextJson===undefined){
        return undefined;
    }
    return getInObject(nextJson, pathArray, index+1 );
}

// renamed "Wait" to "delay" - please use "delay"
var delay = seconds => new Promise((r, j)=>setTimeout(r, seconds*1000));

export class CallPromise<T=void>  implements PromiseLike<T>{
    promise: Promise<T>;
    resolve: (arg:T)=>void;
    reject: (error:any)=>void;

    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2> { return undefined;}
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>  { return undefined;}
    
    constructor(){
        let executor= (resolve, reject)=>{
            this.resolve = resolve;
            this.reject = reject;
        }
        this.promise = new Promise(executor);
        this.then = (...args)=>{return this.promise.then(...args)};
        this.catch = (...args)=>{return this.promise.catch(...args)};
    }
}

export class VoidCallPromise extends CallPromise<void> {
    resolve: () => void;
}

export class PollingPromise extends CallPromise<boolean> {
    // think twice before using this; should you be making the class in question async instead?
    // this is intended to interface with code we don't control.
    handler:any;
    constructor(condition:()=>boolean, pollSeconds = 0.1){
        super();
        this.handler = setInterval( 
            ()=>{
                if(condition()){
                    clearInterval(this.handler);
                    this.resolve(true);
                }
            }
            , 1000*pollSeconds
        )
    }

    cancel(){
        // DON'T reject; reject is for real errors. 
        clearInterval(this.handler);
        this.resolve(false);
    }
}

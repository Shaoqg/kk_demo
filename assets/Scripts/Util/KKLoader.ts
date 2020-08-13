import { delay } from "../kk/DataUtils";


// replacement for cocos cc.loader.loadRes, but with retries; and promises.


const retryDelays = [0.5,2,4,5,6];
export class KKLoader {

    static async loadPrefab(file:string) : Promise<cc.Prefab>{
        return this.loadRes<cc.Prefab>(file, cc.Prefab);
    }

    static async loadSprite(file:string) : Promise<cc.SpriteFrame>{
        return this.loadRes<cc.SpriteFrame>(file, cc.SpriteFrame);
    }

    static async loadSpriteDir(dir:string) : Promise<cc.SpriteFrame[]>{
        return this.loadResDir<cc.SpriteFrame>(dir, cc.SpriteFrame);
    }

    static async loadSprites(files:string[]){
        if(files.length==0){
            // return early to avoid hitting the "empty array == error" code in checkSuccess
            return [];
        }
        let executor = (resolve,reject)=>{
            cc.loader.loadResArray(files, cc.SpriteFrame, makeCocosCallback(resolve,reject, 'sprites'));
        }
        return retry3x<cc.SpriteFrame[]>(executor, files);
    }

    // prefer a method above, they are more convenient than calling these direct

    static loadRes<AssetType>(file:string, type: typeof cc.Asset):Promise<AssetType>{ 
        let executor = (resolve,reject)=>{
            cc.loader.loadRes(file, type, makeCocosCallback(resolve,reject,file));
        }
        return retry3x(executor, file);
    }

    static loadResDir<AssetType>(dir, type: typeof cc.Asset):Promise<AssetType[]>{
        // THIS METHOD WILL FAIL on empty directories; 
        // we can't tell the difference between 'files failed' and 'empty dir'
        let blameName = dir+ "(empty?)";
        let executor = (resolve,reject)=>{
            cc.loader.loadResDir(dir, type, makeCocosCallback(resolve,reject, blameName));
        }
        return retry3x(executor, dir);
    }

    static lastFile = Symbol('lastFile');
    static async setSprite(nodeOrSprite:cc.Node|cc.Sprite, file:string, hideUntilActive=true){
        let s = toSprite(nodeOrSprite);
        s[this.lastFile] = file;
        hideUntilActive && (s.node.active = false);
        let sf = await KKLoader.loadSprite(file);
        let requestStillActive = s[this.lastFile] == file;
        if(requestStillActive){
            hideUntilActive && (s.node.active = true);
            toSprite(nodeOrSprite).spriteFrame = sf;
            return true;
        } else {
            // someoone else will show
            return false;
        }
    }

}

export function toSprite(nodeOrSprite:cc.Node|cc.Sprite){
    let as = (nodeOrSprite as cc.Sprite);
    if(as.spriteFrame){
        return as;
    } else {
        return (nodeOrSprite as cc.Node).getComponent<cc.Sprite>(cc.Sprite);
    }
}

function checkSuccess(result:cc.Asset|cc.Asset[]):boolean{
    // if I fail a request with charles, cocos calls back with a cc.Asset, but it is subtly broken?
    if(result instanceof Array){
        if(result.length==0){
            // weak point; we might hit this code if we 
            // ask for and empty dir of assets?
            return false;
        }
        let success=true;
        result.forEach( asset=>success=success&&checkSuccess(asset) );
        return success;
    }
    
    // the .loaded property is NOT reliable with many asset types, like cc.SpriteFrame;
    // handle them here
    if(result instanceof cc.SpriteFrame){
        return !!result.getTexture();
    }

    if(result instanceof cc.SpriteAtlas){
        return result.getTexture() && result.getSpriteFrames().length >0;
    }
    // cc.TiledMapAsset never hits this code; if it fails, it returns an error.
    // TODO fix other asset types here? 

    // seems OK for:
    // .mp3 / cc.AudioClip
    return result && result.loaded;
}

function makeCocosCallback(resolve,reject,assetName:string){
    let cocosCallback: (error: Error, resource: cc.Asset|cc.Asset[]) => void = (error: Error, resource: any)=>{
        // console.log('returned', {resource, error, success: resource&&checkSuccess(resource)});
        // this is hard-fought knowledge about how cocos reacts when you fail a network connection;
        // it does NOT always return an error; sometimes it returns error AND a resource in array situations
        if(resource && checkSuccess(resource)){
            // check resource before error;
            // for prefabs we might still get the main resource back, but with missing sprites
            // (if we check error first, we return no prefab -> block development)
            resolve(resource);
        } else {
            reject(error || new Error('Resource failure for '+assetName));
        }
    }
    return cocosCallback;
}

const maxRetries = retryDelays.length;
type ExecutorType<T> = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void;
async function retry3x<ReturnType>(executor:ExecutorType<ReturnType>, assetString:(string | string[])) : Promise<ReturnType>{
    // we take an exceutor not a promise, because you can not 're-try' a promise.
    let tryIndex = 0;
    let lastError = null;
    while(tryIndex<maxRetries){
        if(tryIndex>0){
            // pause before next try; maybe we get to better network?
            await delay(retryDelays[tryIndex-1]);
        }
        let tryCount = tryIndex+1;
        let promise = new Promise( executor );
        try{
            let result = await promise;
            return result as ReturnType;
        } catch (e){
            console.warn(`Download warning; try ${tryCount}/${maxRetries} failed`, e);
            lastError=e;
        }
        tryIndex++;
    }
    console.error(`Download error; tries ${maxRetries}/${maxRetries} failed loading ${JSON.stringify(assetString)}`, lastError);
    throw lastError; // rethrow the last error/reject the promise.
}

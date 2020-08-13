export class ConfigSet {

    _topKeyToIdToDict :object = {};
    _loaded = false;
    _baseUrl:string;
    static allowRetry: boolean = true;

    private static _instance:ConfigSet = null;
    static async loadConfig(){
        let instance = new ConfigSet();

        // get configList.json, which is a list of config files
        // TODO base URL will be on the web in some future
        let configList = await instance._getFile("configList.json");
        await instance.loadFiles(configList as string[]);
        ConfigSet._instance = instance;
        return;
    }

    static get(){
        if(!ConfigSet._instance){
            // giving ConfigSet an async interface would make it hard to use; instead, init it before
            // other systems are started. If this check fails, init steps are broken.
            console.error('using config before it is loaded; loading step should wait for config. Talk to Smasher.');
        }
        return ConfigSet._instance;
    }

    constructor(baseUrl="./assets/resources/Config"){
        if(baseUrl.lastIndexOf('/') !=baseUrl.length-1){
            baseUrl += "/";
        }
        this._baseUrl = baseUrl;
    }

    async _getUrlInternal(url):  Promise<object> {
        let requestPromise= new Promise( function(resolve:(object)=>void,reject){
            const xhr = new XMLHttpRequest();
            xhr.timeout = 10 * 1000;
            xhr.open('GET', url, true);
            let rejector = function () {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            };
            xhr.onload = function(e) {
                if (this.status >= 200 && this.status < 300) {
                    let response =  JSON.parse(this.responseText);
                    resolve(response);
                } else {
                    rejector();
                }
            }
            xhr.ontimeout = rejector; // not sure about this; retrying stale saves could be bad?
            xhr.onerror = rejector;
            xhr.send();
            }
        );
        return requestPromise;
    }

    retryDelays = [2,4,8];
    tries = this.retryDelays.length + 1;

    async _getFile(fileName) : Promise<object>{
        const url = this._baseUrl+fileName;
        let lastError;
        for(let i=0; i<this.tries; ++i){
            try{
                let response = await this._getUrlInternal(url);
                return response;
            } catch(status){
                // eat the error - we will retry.
                let message = fileName + ' failed:' + status.status + ' ' + status.statusText;
                if(status.status==409){
                    // writing over a newer record failed; do not retry.
                    return {};
                }
                // console.error(new Error(message));
                lastError = new Error(message);
                console.log(`retrying ${fileName} ${i+1} / ${this.tries}` );
                if(i+1 < this.tries && ConfigSet.allowRetry){
                } else {
                    console.error('failed after retries');
                    throw lastError;
                }
            }
        }
    }

    _getTopDict(topKey:string){
        let topDict = this._topKeyToIdToDict[topKey];
        if(topDict){
            return topDict;
        } else {
            topDict = this._topKeyToIdToDict[topKey] = {};
            return topDict;
        }
    }

    // if this "merging" becomes expensive, we can store the list of fileIdToData
    // and resolve lookups at query time (last file should win, though)
    async loadFiles(fileList:string[]){

        for(let fileName of fileList){
            // this blocks for each file;
            // we could make multiple requests,
            // BUT we need to apply in order
            let fileContents = await this._getFile(fileName);

            for (let topKey in fileContents){
                let fileIdToData = fileContents[topKey];
                let ourIdToData = this._getTopDict(topKey);
                for(let idKey in fileIdToData){
                    ourIdToData[idKey] = fileIdToData[idKey];
                }
            }
        }

        this._loaded = true;
        return;
    }

    get(path, devaultValue:any){
        //TODO
    }

    getData(topLevelKey:string, id:string){
        let topLevelDict = this._getTopDict(topLevelKey);
        let data = topLevelDict[id];
        return data;
    }

    getObject<U>(topLevelKey:string, id:string){
        let object = this.getData(topLevelKey, id);
        if(object===undefined){
            console.warn(`No config data for ${topLevelKey}.${id}`);
            return;
        }
        Object.freeze(object);
        return object as U;
    }

    getObjects<U>(topLevelKey:string, sortKey?:string){ // TODO sorting? pass a sortKey?
        let objects:U[] = [];

        // TODO could cache the list? by sort key?
        let topLevelDict = this._getTopDict(topLevelKey);
        if(topLevelDict===undefined){
            console.warn(`No config data for ${topLevelKey} `);
            return;
        }

        for(let key in topLevelDict){
            let object = topLevelDict[key];
            Object.freeze(object);
            objects.push(object as U);
        }

        if(sortKey!==undefined){
            objects.sort( keySort.bind(null, sortKey) );
        }
        return objects;
    }
}

function keySort(sortKey, a, b){
    return a[sortKey] > b[sortKey];
}

var wait = seconds => new Promise((r, j)=>setTimeout(r, seconds*1000));
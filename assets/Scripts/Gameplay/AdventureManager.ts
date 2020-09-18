
const {ccclass, property} = cc._decorator;

@ccclass
export default class AdventureManager {

    private static _instance :AdventureManager = null;
    static get instance(){
        if (!this._instance ) {
            this._instance = new AdventureManager();
        }

        return this._instance;
    }

    constructor(){
        this.init();
    }

    init(){
        //TODO resetInfo
    


    }


}


export default class User {

    static _instance:User = null;
    static get instance(){
        if (!this._instance) {
            this._instance = new User();
        }
        return this._instance;
    }


    private level = 1;
    private petList = {
        "froge":{
            work:true,
            level:1,
            rarity:"common"
        }    
    }

    private castalelevel = 1;
    private coin = 200;
    private wood = 200;
    private stone = 200;

}



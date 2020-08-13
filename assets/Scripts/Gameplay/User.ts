
export default class User {

    static _instance:User = null;
    static get instance(){
        if (!this._instance) {
            this._instance = new User();
        }
        return this._instance;
    }


    public level = 1;
    public petNumber = 1;
    private petList = {
        "froge":{
            work:true,
            level:1,
            rarity:"common"
        }    
    }

    public level_ship = 1;
    public level_castle = 1;
    public coin = 200;
    public wood = 200;
    public stone = 200;


}



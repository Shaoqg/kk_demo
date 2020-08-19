import { PetData } from "../UI/PetList";
import { PetType } from "../Config";
import { TaskData } from "../UI/TaskScreen";
import { Resource } from "../Config";

export default class User {

    static _instance: User = null;
    static get instance() {
        if (!this._instance) {
            this._instance = new User();
            this._instance.getUse();
        }
        return this._instance;
    }

    public isLoaded = false;

    // public level = 1;
    private petList: PetData[] = [{
        // work:true,
        petId: "froom",
        petLevel: 1,
        petName: "Froge"
    },
    ]

    public AchievementData: TaskData[] = [
        {
            taskID: "Task_Ach_1",
            tasktype: "achievement",
            taskfinish: false,
            start: {
                rewardType: Resource.coin,
                rewardNum: 1500,
            },
        }, {
            taskID: "Task_Ach_2",
            tasktype: "achievement",
            taskfinish: false,
            start: {
                rewardType: Resource.coin,
                rewardNum: 15,
            },
        }, {
            taskID: "Task_Ach_3",
            tasktype: "achievement",
            taskfinish: false,
            start:
            {
                rewardType: Resource.coin,
                rewardNum: 15,
            },
        },
    ]

    public DailyTaskData: TaskData[] = [
        {
            taskID: "Task_Dal_1",
            tasktype: "daily",
            taskfinish: false,
            start: {
                rewardType: Resource.coin,
                rewardNum: 1500,
            },
        }, {
            taskID: "Task_Dal_2",
            tasktype: "daily",
            taskfinish: false,
            start: {
                rewardType: Resource.coin,
                rewardNum: 15,
            },
        }, {
            taskID: "Task_Dal_3",
            tasktype: "daily",
            taskfinish: false,
            start:
            {
                rewardType: Resource.coin,
                rewardNum: 15,
            },
        },
        {
            taskID: "Task_Dal_4",
            tasktype: "daily",
            taskfinish: false,
        },
    ]

    public star = 1;
    public level_ship = 1;
    public level_castle = 1;
    public coin = 200000;
    public wood = 200;
    public stone = 200;
    public food = 200;
    public ship_capacity_level = 0;
    public ship_speed_level = 0;
    public ship_bouns_level = 0;
    public petNumber = this.petList.length;
    public magic_stone = 10;
    public _timeStamps: object = {};
    public AdventureTime = 0
    public AdventurePets:PetData[]=[]
    public adventureCoinslist: number[] = []
    public adventureWoodlist: number[] = []
    public adventureStonelist: number[] = []

    setTimeStamp(name: string, timeStamp: number){
        this._timeStamps[name]=timeStamp;
    }

    getTimeStamp(name: string){
        return this._timeStamps[name];
    }

    public getPetList() {
        return this.petList;
    }

    public addPet(pet: PetType) {
        if (pet) {
            let idAdd = true;
            this.petList.forEach((petData) => {
                if (petData.petId == pet.petId) {
                    idAdd = false;
                }
            })
            if (idAdd) {
                this.petList.push({
                    petId: pet.petId,
                    petName: pet.petId,
                    petLevel: 1
                })
                this.petNumber++;
            }
            return idAdd;
        }
        return false;
    }



    public getReward(type: Resource, amount: number) {
        switch (type) {
            case Resource.coin:
                this.coin += amount;
                break;
            case Resource.wood:
                this.wood += amount;
                break;
            case Resource.stone:
                this.stone += amount;
                break;
            case Resource.food:
                this.food += amount;
                break;
            case Resource.magicStone:
                this.magic_stone += amount;
                break;
        }
    }

    public saveUse() {
        this.ship_bouns_level;
        this.ship_capacity_level;
        this.ship_speed_level;


        let gameData = {
            star:this.star,
            level_castle:this.level_castle,
            level_ship:this.level_ship,
            shipInfo:{
                bouns:this.ship_bouns_level,
                capacity: this.ship_capacity_level,
                speed:this.ship_speed_level
            },
            magic_stone:this.magic_stone,
            food:this.food,
            stone:this.stone,
            coin:this.coin,
            wood:this.wood,
            petList: this.petList,
            _timeStamps: this._timeStamps,
            AdventureTime: this.AdventureTime,
            AdventurePets: this.AdventurePets,
            adventureCoinslist: this.adventureCoinslist,
            adventureWoodlist: this.adventureWoodlist,
            adventureStonelist: this.adventureStonelist,
        }
        cc.sys.localStorage.setItem("KK_DEMO", JSON.stringify(gameData));
        console.log("SAVE USER")
    }

    public getUse() {
        let dataStr = cc.sys.localStorage.getItem("KK_DEMO");

        if (dataStr) {
            let data = JSON.parse(dataStr);
            this.star = data["star"];
            this.level_castle = data["level_castle"];
            this.level_ship = data["level_ship"];
            
            this.ship_bouns_level = data["shipInfo"]["bouns"]
            this.ship_capacity_level = data["shipInfo"]["capacity"]
            this.ship_speed_level = data["shipInfo"]["speed"]
            this.magic_stone = data["magic_stone"];
            this.food = data["food"];
            this.stone = data["stone"];
            this.coin = data["coin"];
            this.wood = data["wood"];
            this.petList = data["petList"];
            this._timeStamps = data["_timeStamps"];
            this.AdventureTime = data["AdventureTime"];
            this.AdventurePets = data["AdventurePets"];
            this.adventureCoinslist = data["adventureCoinslist"];
            this.adventureWoodlist = data["adventureWoodlist"];
            this.adventureStonelist = data["adventureStonelist"];
            this.petNumber = this.petList.length
        }
        this.isLoaded = true;
    }

    public resetUse(){
        cc.sys.localStorage.setItem("KK_DEMO","");
        cc.director.pause(); // try to prevent more saves; PET-1128
        location.reload();
    }
}




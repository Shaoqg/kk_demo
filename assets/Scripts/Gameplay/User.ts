import { PetData } from "../UI/PetList";
import { PetType } from "../Config";
import { TaskData } from "../UI/TaskScreen";
import { Resource } from "../Config";
import WorldManager from "./WorldManager";

export default class User {

    static _instance:User = null;
    static get instance(){
        if (!this._instance) {
            this._instance = new User();
        }
        return this._instance;
    }


    public level = 1;
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

    public level_ship = 1;
    public level_castle = 1;
    public coin = 200000;
    public wood = 200;
    public stone = 200;
    public food = 200;
    public ship_capacity_level=0;
    public ship_speed_level=0;
    public ship_bouns_level=0;
    public petNumber = this.petList.length;
    public magic_stone = 10;

    public getPetList() {
        return this.petList;
    }

    public addPet(pet:PetType) {
        if (pet) {
            let idAdd = true;
            this.petList.forEach((petData)=>{
                if (petData.petId == pet.petId) {
                    idAdd = false;
                }
            })
            if (idAdd) {
                this.petList.push({
                    petId:pet.petId,
                    petName:pet.petId,
                    petLevel:1
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

public 
}


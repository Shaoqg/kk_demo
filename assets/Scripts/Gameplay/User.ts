import { PetData } from "../UI/PetList";
import { PetInfo } from "../UI/PetRevealDialog";

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
    private petList: PetData[] = [{
        // work:true,
        petId: "1",
        petLevel: 1,
        petName: "Froge"
    },
    {
        // work:true,
        petId: "1",
        petLevel: 1,
        petName: "Froge"
    },
    {
        // work:true,
        petId: "1",
        petLevel: 1,
        petName: "Froge"
    },
    {
        // work:true,
        petId: "1",
        petLevel: 1,
        petName: "Froge"
    },
    {
        // work:true,
        petId: "1",
        petLevel: 1,
        petName: "Froge"
    },
    {
        // work:true,
        petId: "1",
        petLevel: 1,
        petName: "Froge"
    },
    {
        // work:true,
        petId: "1",
        petLevel: 1,
        petName: "Froge"
    },
]

    public petInfos: PetInfo []= [{
        petId: "1",
        petName: "Froge",
        petinfo: "it is a frog",
        petType: ["nature", "water"],
        petRare: "Rare",
        petBouns:{BounsName:"Coin",BounsNum:10},
        petBounsNum:[10,20],
        petNeedUpgrade: [{Resourse: "Coin",number: 10}, {Resourse: "Wood",number: 10}, {Resourse: "Food",number: 10}],
        petSpriteFrameName:"froom"
    }]

    public speeds: number[] = [24, 30, 42];
    public capacitys: number[] = [1, 3, 5];
    public bounss: number[] = [10, 50, 200];

    public level_ship = 1;
    public level_castle = 1;
    public coin = 200000;
    public wood = 200;
    public stone = 200;
    public food = 200;
    public ship_capacity_level=1;
    public ship_speed_level=1;
    public ship_bouns_level=1;
    public getPetList() {
        return this.petList;
    }

}



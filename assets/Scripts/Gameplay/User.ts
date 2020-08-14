import { PetData } from "../UI/PetList";
import { PetInfo } from "../UI/PetRevealDialog";
import { PetType } from "../Config";

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
    public petNumber = this.petList.length;


    public petInfos: PetInfo []= [{
        petId: "froom",
        petName: "Froge",
        petinfo: "it is a frog",
        petBouns:{BounsName:"Coin",BounsNum:10},
        petNeedUpgrade: [{Resourse: "Coin",number: 10}, {Resourse: "Wood",number: 10}, {Resourse: "Food",number: 10}],
    },
    {
        petId: "king_parrot",
        petName: "king parrot",
        petinfo: "it is a King",
        petBouns:{BounsName:"Stone",BounsNum:15},
        petNeedUpgrade: [{Resourse: "Coin",number: 10}, {Resourse: "Wood",number: 10}, {Resourse: "Food",number: 10}],
    },
]

    public speeds: number[] = [24, 30, 42];
    public capacitys: number[] = [1, 3, 5];
    public bounss: number[] = [10, 50, 200];

    public speedLevelUpInfo= [
        {
            coin:100,
            wood:5,
        },
        {
            coin:200,
            wood:20,
        },
    ]
    public capacityLevelUpInfo= [
        {
            coin:10,
            wood:5,
            stone:5,
        },
        {
            coin:20,
            wood:2,
            stone:10,
        },
    ]
    public bounsLevelUpInfo= [
        {
            coin:1000,
            stone:50,
        },
        {
            coin:2000,
            stone:1000,
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
            }
            return idAdd;
        }
        return false;
    }

    public magic_stone = 1;

}



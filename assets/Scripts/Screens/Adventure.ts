import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { AdventureReward } from "./AdventureReward";
import User from "../Gameplay/User";
import { petBouns } from "../UI/PetRevealDialog";
import { KKLoader } from "../Util/KKLoader";
import { getPetConfigById, PetType, getPetBouns, bounss, capacitys, speeds, AdventureTime, AdventureLogLines, AdventureBasicwood, AdventureBasicstone, AdventureBasiccoins, AdventureShipMaxFood, PetData, Resource, RewardType, AdventureAreas,  } from "../Config";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
const { ccclass, property } = cc._decorator;

@ccclass
export class Adventure extends ViewConnector {


    static prefabPath = 'Prefab/Adventure';

    static _instance: Adventure = null;

    root: cc.Node = null;
    pet: cc.Node;
    petReady: number = 0;
    boatReady: boolean = false;
    bonusName: string[] = ["Metal", "Wood", "Fuel", "Bullet", "Food"]
    bonusNum: string[] = ["10", "20", "15", "33", "50"]
    updateTime: number = 0;
    goAdventure: boolean = false;
    time: number = 0;
    counttime: number = 0;
    timeremain: number = 0;
    seats: boolean[]=[];
    seatNum: number;
    boundsAll: petBouns[]=[{BounsName:"Coin",BounsNum:0},{BounsName:"Wood",BounsNum:0},{BounsName:"Stone",BounsNum:0}];
    seatPet:PetData[]=[];
    battleinfo: cc.Node;
    AllLine: number=10;
    foodNumLabel: cc.Label;
    btn_reduce: cc.Node;
    btn_increase: cc.Node;
    food: number = 1;

    static async prompt(areaName?:string): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = Adventure._instance = await this.loadView<Adventure>(parentNode, Adventure);

        vc.applyData(areaName);

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    static close() {
        if (this._instance) {
            this._instance.close({});
            this._instance.destroy();
            this._instance = undefined;
        }
    }

    applyData(areaName?: string) {

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        this.pet = cc.find("pet", this.node);
        let petList = [];
        petList=User.instance.getPetList()


        let go = cc.find("button_primary", this.root);
        let scrollview = cc.find("scrollview", this.root);
        let list = cc.find("list", scrollview);
        this.battleinfo = cc.find("battleinfo", scrollview);
        let subtitleLabel = cc.find("subtitle/capacity", this.root).getComponent(cc.Label);
        let shipCapacity = cc.find("shipInfo/capacity", this.root);
        let shipLevel = cc.find("shipInfo/level", this.root);
        let shipSpeed = cc.find("shipInfo/speed", this.root);
        let shipFood = cc.find("shipInfo/food", this.root);
        this.btn_reduce = cc.find("reduce", shipFood);
        this.btn_increase = cc.find("increase", shipFood);
        this.foodNumLabel = cc.find("foodNum/number", shipFood).getComponent(cc.Label);
        let destinationLabel = cc.find("destination", this.root).getComponent(cc.Label);

        this.seatNum=capacitys[User.instance.ship_capacity_level];
        shipCapacity.getComponent(cc.Label).string = "Capacity：" + 0 + "/"+this.seatNum;
        shipLevel.getComponent(cc.Label).string="Level:"+User.instance.level_ship;
        shipSpeed.getComponent(cc.Label).string="Speed："+speeds[User.instance.ship_speed_level]+" knots:";
        
        if(!areaName){
            areaName=User.instance.AdventureDestination;
        }
        destinationLabel.string = "destination: area " + areaName;

        for(let i=1;i<=this.seatNum;i++){
            let petSeat = cc.find("petsOnShip/pet" + i, this.root);
            petSeat.active=true
            this.seats.push(false);
        }

        this.initFoodBtn();
        
        this.boundsAll.forEach((bands) => {
            bands.BounsNum += bounss[User.instance.ship_bouns_level];
        })
        
        this.AllLine = AdventureLogLines;

        let timestamp = User.instance.getTimeStamp("Adventure");
        if (timestamp > 0) {
            this.time = timestamp
            this.counttime = User.instance.AdventureTime;
            let timeelapsed = (Date.now() / 1000 - this.time);
            this.timeremain = this.counttime * 60 - (Math.round(timeelapsed));
            this.updateTimeCountLabel();
            let Pets = User.instance.getPetsInAdventure();
            Pets.forEach((pet) => {
                let petconfig = getPetConfigById(pet.petId);
                let petBouns = getPetBouns(petconfig)
                this.boundsAll.forEach((bands) => {
                    if (bands.BounsName == petBouns.BounsName) {
                        bands.BounsNum += petBouns.BounsNum * pet.petLevel;
                    }
                });

                this.setToReady(pet, petconfig);
            })
            this.goAdventure = true;
            this.getTimeRemaining();
            list.active = false;
            scrollview.getComponent(cc.ScrollView).content = this.battleinfo;
            this.battleinfo.active = true;
            subtitleLabel.string = "Adventure Log";
            this.setAdventureLog(timeelapsed);

            let loadingbar = cc.find("loading_bar", this.root);
            loadingbar.active = true

            shipFood.active = false;

            if (this.goAdventure) {
                this.setButtomAndTimeBar("Exploring", false, true);
            } else {
                this.updateTimeCountLabel(true);
                this.setButtomAndTimeBar("Go Collect!", true, true);
            }
        }else{
            list.height = 11;

            petList.forEach((data, idx) => {
                this.createList(data, idx);
            });
    
            go.on(cc.Node.EventType.TOUCH_END, () => {
                if (!this.boatReady) {
                    return;
                }
                list.active = false;
                shipFood.active = false;
                scrollview.getComponent(cc.ScrollView).content = this.battleinfo;
                this.battleinfo.active = true;
                subtitleLabel.string = "Adventure Log"
    
                this.setButtomAndTimeBar("Exploring",false,true);
                go.off(cc.Node.EventType.TOUCH_END);
                let loadingbar = cc.find("loading_bar", this.root);
                loadingbar.active = true

                this.seatPet.forEach((seatpet)=>{
                    let UserPet=User.instance.findPetDataByPetId(seatpet.petId);
                    UserPet.nowUsing=true;
                    UserPet.UsingBy="Adventure"
                })

                User.instance.food -= this.food;
                User.instance.AdventureFood = this.food;
                User.instance.AdventureDestination = areaName;
                let completeTime = 1;
                AdventureAreas.forEach((area) => {
                    if (area.areaName == areaName) {
                        completeTime = area.areaCompletetime;
                    }
                })
                if (User.instance.exploreTime[areaName] < completeTime && User.instance.exploreTime[areaName] + AdventureTime * this.food / speeds[0] > completeTime) {
                    EventEmitter.emitEvent(EventType.STAR_INCREASE);
                    User.instance.exploreTime[areaName] = completeTime;
                }else{
                    User.instance.exploreTime[areaName] += AdventureTime * this.food / speeds[0];
                }
                this.startCountDown();
                this.updateTimeCountLabel();
                this.setRandomResource(this.AllLine);
                User.instance.saveUse();
                
                EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);
                EventEmitter.emitEvent(EventType.CHECK_AREA_COMPELETE);
            });
        }


        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        let ship = cc.find("ship_bg/ship", this.root);
        ship.runAction(cc.repeatForever(
            cc.sequence(
                cc.moveBy(1.2, 0, 8).easing(cc.easeInOut(1.2)),
                cc.moveBy(1.2, 0, -8).easing(cc.easeInOut(1.2))
            )));
        //this.adjustGameInterface();
    }

    initFoodBtn() {
        this.foodNumLabel.string = this.food.toString();

        this.btn_increase.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.food < User.instance.food && this.food < AdventureShipMaxFood) {
                this.food++;
            }
            this.foodNumLabel.string = this.food.toString();
        })

        this.btn_reduce.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.food > 1) {
                this.food--;
            }
            this.foodNumLabel.string = this.food.toString();
        })

        if (User.instance.food < this.food) {
            this.food = 0;
            this.foodNumLabel.string = this.food.toString();
            this.setButtomAndTimeBar("Lack of food", false, false)
        }
    }

    async startCountDown() {
        this.goAdventure = true
        this.time = Date.now() / 1000;
        this.counttime = AdventureTime * this.food / speeds[User.instance.ship_speed_level];
        this.timeremain = this.counttime * 60 ;
        User.instance.setTimeStamp("Adventure",this.time);
        User.instance.AdventureTime=this.counttime;
        console.log("time",this.counttime * 60);
    }

    setAdventureLog(time: number) {
        let stepTime = Math.ceil(this.counttime * 60 / this.AllLine)
        let lines: number = 0;
        if (time >= this.counttime * 60) {
            lines = Math.floor(this.AllLine);
        } else {
            lines = Math.floor(time / stepTime);
        }

        let stringAll: string = "";
        for (let i = 0; i < lines + 1; i++) {
            let resource = this.getRandomResource(i);
            let string = ""
            if (resource.coins > 0) {
                string += resource.coins + " Coins ";
            }
            if (resource.wood > 0) {
                string += resource.wood + " Wood ";
            }
            if (resource.stone > 0) {
                string += resource.stone + " Stone";
            }
            if (string != "") {
                stringAll += "Get " + string + "\n"
            }
        }
        this.battleinfo.getComponent(cc.Label).string = stringAll
    }

    setRandomResource(AllLine) {
        let rewards = this.getResource(this.boundsAll);
        rewards.forEach((reward) => {
            switch (reward.rewardType) {
                case Resource.coin:
                    let randomCoins: number[] = [];
                    for (let i = 0; i < AllLine - 1; i++) {
                        randomCoins.push(this.random(1, reward.rewardNum))
                    }
                    let finalRandomCoins = this.randomList(randomCoins)
                    let finalCoin = finalRandomCoins.random2
                    finalCoin.push(reward.rewardNum - finalRandomCoins.count);
                    User.instance.adventureCoinslist = finalCoin;
                    break;
                case Resource.wood:
                    let randomWood: number[] = [];
                    for (let i = 0; i < AllLine - 1; i++) {
                        randomWood.push(this.random(1, reward.rewardNum))
                    }
                    let finalRandomWood = this.randomList(randomWood)
                    let finalWood = finalRandomWood.random2
                    finalWood.push(reward.rewardNum - finalRandomWood.count);
                    User.instance.adventureWoodlist = finalWood;
                    break;
                case Resource.stone:
                    let randomStone: number[] = [];
                    for (let i = 0; i < AllLine - 1; i++) {
                        randomStone.push(this.random(1, reward.rewardNum))
                    }
                    let finalRandomStone = this.randomList(randomStone)
                    let finalStone = finalRandomStone.random2
                    finalStone.push(reward.rewardNum - finalRandomStone.count);
                    User.instance.adventureStonelist = finalStone;
                    break;
            }
        })
    }
    randomList(random: number[]) {
        for (let i = 1; i < random.length; i++) {
            for (let j = 0; j < random.length - i; j++) {
                if (random[j] > random[j + 1]) {
                    let temp = random[j];
                    random[j] = random[j + 1];
                    random[j + 1] = temp;
                }
            }
        }
        let count = 0;
        let random2: number[] = []
        for (let i = 0; i < random.length; i++) {
            if (i == 0) {
                random2[i] = random[i];
            } else {
                random2[i] = random[i] - random[i - 1];
            }
            count += random2[i]
        }
        return { random2, count }
    }
    getRandomResource(lines) {
        let coins = User.instance.adventureCoinslist[lines];
        let wood = User.instance.adventureWoodlist[lines];
        let stone = User.instance.adventureStonelist[lines];
        return { coins, wood, stone };
    }

    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }

    updateTimeCountLabel(over: boolean = false) {
        let timecount = cc.find("shipInfo/timecount", this.root);
        if (over) {
            timecount.getComponent(cc.Label).string = "Pets are back on the island now!"
        } else {
            let timeremain = Math.floor(this.timeremain) >= 0 ? Math.floor(this.timeremain) : 0;
            timecount.getComponent(cc.Label).string = "Expect to be back in " + timeremain.toString() + " second"
        }

    }

    setButtomAndTimeBar(buttonLabel:string,buttonInteractable:boolean=true,timecountOpen:boolean=true){
            let go = cc.find("button_primary", this.root);
            let go_gry = cc.find("button_primary/button_gry", this.root);
            let goLabel = cc.find("button_primary/goLabel", this.root);
            let timecount = cc.find("shipInfo/timecount", this.root);

            go.getComponent(cc.Button).interactable = buttonInteractable;
            go_gry.active = !buttonInteractable;
            goLabel.getComponent(cc.Label).string = buttonLabel;
            timecount.active = timecountOpen;
    }

    update(dt) {
        if (!this.goAdventure) {
            return;
        }
        this.updateTime += dt;
        if (this.updateTime >= 1) {
            this.updateTime -= 1;
            this.getTimeRemaining();
        }
    }
    getTimeRemaining() {
        let loadingbar = cc.find("loading_bar", this.root).getComponent(cc.ProgressBar);
        let timeelapsed = (Date.now() / 1000 - this.time);
        this.timeremain = this.counttime * 60 - (Math.round(timeelapsed));
        loadingbar.progress = 1 - (this.timeremain / (this.counttime * 60));
        this.setAdventureLog(timeelapsed)
        this.updateTimeCountLabel();
        if(this.timeremain<=0){
            this.goAdventure=false;
            this.AdventureOver()
        }
    }

    AdventureOver() {
        let go = cc.find("button_primary", this.root);
        this.updateTimeCountLabel(true);
        this.setButtomAndTimeBar("Go Collect!",true,true);

        go.once(cc.Node.EventType.TOUCH_END, async () => {
            let reward = this.getResource(this.boundsAll);
            await AdventureReward.prompt(reward);
            this.close(undefined)
            User.instance.setTimeStamp("Adventure",0);
            User.instance.AdventureTime = 0;
            User.instance.removePetFromInAdventure();
            User.instance.adventureStonelist = []
            User.instance.adventureCoinslist = []
            User.instance.adventureWoodlist = []
            User.instance.saveUse();
        });
    }

    async createList(petData: PetData, idx: number) {

        let petconfig=getPetConfigById(petData.petId);
        let pet = cc.instantiate(this.pet);
        pet.name=petData.petId;
        let list = cc.find("scrollview/list", this.root);
        let petImage = pet.getChildByName("petimage").getComponent(cc.Sprite);
        petImage.spriteFrame = await KKLoader.loadSprite("Pets/"+petconfig.art_asset);
        // petImage.spriteFrame = this.SpriteFrame[petListInfo];

        list.addChild(pet);
        if (idx % 5 == 0) {
            list.height += pet.height + 11;
        }

        pet.y = -(pet.height / 2 + 11) - (Math.floor(idx / 5) * (pet.height + 11));
        pet.x = (idx % 5) * (pet.width + 11) + (pet.width / 2 + 11);

        pet.on(cc.Node.EventType.TOUCH_END, () => {
            this.setToReady(petData,petconfig,pet);
        });
    }

    async setToReady( petData: PetData,petconfig:PetType,petNode?: cc.Node) {
        if (this.petReady >= this.seatNum) {
            return;
        }
        let seatnumber=0;
        for(let i=1;i<=this.seatNum;i++){
            if(!this.seats[i-1]){
                seatnumber=i;
                break;
            }
        }
        this.petReady++;
        this.seats[seatnumber-1]=true;

        let petSeat = cc.find("petsOnShip/pet" + seatnumber.toString(), this.root);
        let shipCapacity = cc.find("shipInfo/capacity", this.root);

        let bg = petSeat.getChildByName("bg");
        let petImage = petSeat.getChildByName("petimage").getComponent(cc.Sprite);
        let bonusLabel = petSeat.getChildByName("bonus").getComponent(cc.Label);

        if(petNode){
            this.seatPet.push(petData);
            petNode.getChildByName("underlay").active = true;
            petNode.getChildByName("Label").active = true;
            petSeat.once(cc.Node.EventType.TOUCH_END, () => {
                petNode.getChildByName("underlay").active = false;
                petNode.getChildByName("Label").active = false;
                bg.active = false;
                petImage.node.active = false;
                bonusLabel.node.active = false;

                if (this.petReady == this.seatNum) {
                    let go = cc.find("button_primary", this.root);
                    let go_gry = cc.find("button_primary/button_gry", this.root);
                    go.getComponent(cc.Button).interactable = false;
                    go_gry.active = true;
                    this.boatReady = false;
                }

                this.boundsAll.forEach((bands) => {
                    if (bands.BounsName == petBouns.BounsName) {
                        bands.BounsNum -= petBouns.BounsNum * petData.petLevel;
                    }
                });
                this.seats[seatnumber - 1] = false;
                this.petReady--;
                let newseat:PetData[]=[]
                this.seatPet.forEach((pet)=>{
                    if(pet.petId!=petNode.name){
                        newseat.push(pet);
                    }
                })
                this.seatPet=newseat;

                shipCapacity.getComponent(cc.Label).string = "Capacity：" + this.petReady + "/" + this.seatNum;

            });
        }

        
        bg.active = true;

        petImage.spriteFrame =  await KKLoader.loadSprite("Pets/"+petconfig.art_asset);
        petImage.node.active = true;
        let petBouns=getPetBouns(petconfig);
        bonusLabel.string=petBouns.BounsName+"\n+"+(petBouns.BounsNum*petData.petLevel)+"%";

        bonusLabel.node.active = true;

        this.boundsAll.forEach((bands)=>{
            if(bands.BounsName==petBouns.BounsName){
                bands.BounsNum+=petBouns.BounsNum*petData.petLevel;
            }
        });

        shipCapacity.getComponent(cc.Label).string = "Capacity：" + this.petReady + "/"+this.seatNum;
       
        if ((this.petReady == this.seatNum) && !this.goAdventure && this.food < User.instance.food) {
            let go = cc.find("button_primary", this.root);
            let go_gry = cc.find("button_primary/button_gry", this.root);
            go.getComponent(cc.Button).interactable = true;
            go_gry.active = false;
            this.boatReady = true;
        }
    }

    getResource(boundsAll) {
        let wood = AdventureBasicwood * User.instance.AdventureFood;
        let stone = AdventureBasicstone * User.instance.AdventureFood;
        let coins = AdventureBasiccoins * User.instance.AdventureFood;


        let boundsWood = 0;
        let boundsStone = 0;
        let boundsCoin = 0;
        boundsAll.forEach((bounds) => {
            switch (bounds.BounsName) {
                case "Wood":
                    boundsWood = bounds.BounsNum;
                    break;
                case "Stone":
                    boundsStone = bounds.BounsNum;
                    break;
                case "Coin":
                    boundsCoin = bounds.BounsNum;
                    break;
            }
        });
        console.log(stone,boundsStone);
        
        wood = Math.floor(wood * (1 + boundsWood / 100));
        stone = Math.floor(stone * (1 + boundsStone / 100));
        coins = Math.floor(coins * (1 + boundsCoin / 100));
        console.log(stone);

        let rewards:RewardType[]=[
            {
                rewardType:Resource.wood,
                rewardNum:wood,
                bounds:boundsWood
            },
            {
                rewardType:Resource.stone,
                rewardNum:stone,
                bounds:boundsStone
            },
            {
                rewardType:Resource.coin,
                rewardNum:coins,
                bounds:boundsCoin
            },
        ]

        return rewards
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
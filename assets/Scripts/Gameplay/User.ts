import { PetConfigType, PetData, ElementType, BuildInfo, CastleInfo, IsLandType, IsLandItemType } from "../Config";
import { TaskData } from "../UI/TaskScreen";
import { Resource } from "../Config";
import { EventEmitter, EventType } from "../Tools/EventEmitter";

export default class User {

    private static _instance: User = null;
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

    private _playerID = `Player:${Math.random()}`;
    public buildInfo: { [id: string]: BuildInfo | CastleInfo } = {};

    public _timeStamps: object = {};

    public AdventureInfo: {
        time: number,
        food: number,
        destination: string,
        pets: PetData[],
        coinslist: number[],
        woodlist: number[],
        stonelist: number[],
        levelInfo:{ "water": number, "fire": number, "food": number, "nature": number },
    } = null

    public exploreTime: object = { "water": 0, "fire": 0, "food": 0, "nature": 0 }
    public currentExp = 5;

    public areaInfo: {
        exploring: { "water": boolean, "fire": boolean, "food": boolean, "nature": boolean, "unknow": boolean },
        capture: { "unknow": boolean },
        captureStartTime: { "unknow": number },
        captureTimeTakenReward: { "unknow": number },
        stopTime: { "unknow": number },
    } = null;

    private buildResource: { [resName: string]: { timestamp: number, number: number } } = {}
    private resource: { [resName: string]: number } = {}

    setTimeStamp(name: string, timeStamp: number) {
        this._timeStamps[name] = timeStamp;
    }

    getTimeStamp(name: string) {
        return this._timeStamps[name];
    }

    public get playerID() {
        return this._playerID;
    }

    public getPetList() {
        return this.petList;
    }

    public addPet(pet: PetConfigType) {
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
            }
            return idAdd;
        }
        return false;
    }

    findPetDataByPetId(petId: string) {
        let PetFind: PetData;
        this.petList.forEach((petData) => {
            if (petData.petId == petId) {
                PetFind = petData;
            }
        })
        return PetFind;
    }

    getPetsNowUsing(usingBy: string = "") {
        let Pets: PetData[] = [];
        if (usingBy == "") {
            this.petList.forEach((petData) => {
                if (petData.nowUsing) {
                    if (petData.UsingBy != usingBy) {
                        Pets.push(petData);
                    }
                }
            })
        } else {
            this.petList.forEach((petData) => {
                if (petData.nowUsing) {
                    if (petData.UsingBy == usingBy) {
                        Pets.push(petData);
                    }
                }
            })
        }
        return Pets;
    }

    removePetFromInAdventure(usingBy: string = "") {
        let Pets = this.getPetsNowUsing(usingBy);
        console.log(Pets);
        this.petList.forEach((petData) => {
            if (petData.nowUsing) {
                if (petData.UsingBy == usingBy) {
                    Pets.forEach((pet) => {
                        if (pet.petId == petData.petId) {
                            console.log(petData);
                            petData.nowUsing = false;
                            petData.UsingBy = "";
                        }
                    })
                }
            }
        })
    }

    public addResource(type: Resource, amount: number) {
        if (!this.resource[type]) {
            this.resource[type] = 0;
        }

        switch (type) {
            case Resource.coin:
                break;
            case Resource.wood:
                break;
            case Resource.stone:
                break;
            case Resource.food:
                break;
            case Resource.magicStone:
                break;
            case Resource.star:
                if (amount <= 0) {
                    console.error("error");
                    return;
                }
                break;
            default:
                console.error("can not find Resource:", type);
                return;
        }
        this.resource[type] += amount;
        this.saveUse();
    }

    public getResource(type: Resource) {
        if (!this.resource[type]) {
            this.resource[type] = 0;
        }
        return this.resource[type];
    }

    public getBuildRes(islandType: IsLandType) {
        if (!this.buildResource[islandType]) {
            this.buildResource[islandType] = {
                number: 0,
                timestamp: 0
            }
        }
        return this.buildResource[islandType];
    }

    public updateBuildRes(islandType: IsLandType, addNumber) {
        if (!this.buildResource[islandType]) {
            this.buildResource[islandType] = {
                number: 0,
                timestamp: 0
            }
        }

        this.buildResource[islandType].timestamp = Date.now();
        this.buildResource[islandType].number += addNumber;
        this.saveUse();
        return this.buildResource[islandType];
    }

    public getBuildRevenue(islandType: IsLandType, resType: Resource) {
        if (this.buildResource[islandType] && this.buildResource[islandType].number >= 1) {
            let number = Math.floor(this.buildResource[islandType].number);
            this.updateBuildRes(islandType, -number);
            this.addResource(resType, number);
            EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);
            return true;
        }
        return false;
    }

    public getBuildInfo(type: IsLandType) {
        if (!this.buildInfo[type]) {
            switch (type) {
                case IsLandType.castle:
                    this.buildInfo[type] = {
                        castle: 1,
                        ship: 1,
                    }
                    break;
                default:
                    this.buildInfo[type] = {
                        build: 1,
                        wonder: 1,
                        view: []
                    }
                    break;
            }
        }

        return this.buildInfo[type];
    }

    public UpgradeBuilInfo(type: IsLandType, name: IsLandItemType) {
        this.buildInfo[type][name] += 1;

        this.saveUse();
    }

    public saveUse() {

        let gameData = {
            petList: this.petList,
            _timeStamps: this._timeStamps,
            AdventureInfo: this.AdventureInfo,
            exploreTime: this.exploreTime,
            playerID: this._playerID,
            areaInfo: this.areaInfo,
            buildInfo: this.buildInfo,
            buildResource: this.buildResource,
            resource: this.resource
        }
        cc.sys.localStorage.setItem("KK_DEMO", JSON.stringify(gameData));
        console.log("SAVE USER")
    }

    public getUse() {
        let dataStr = cc.sys.localStorage.getItem("KK_DEMO");

        if (dataStr) {
            let data = JSON.parse(dataStr);

            this._playerID = data["playerID"] || this.resetData("playerID");
            this.petList = data["petList"] || this.resetData("petList");
            this._timeStamps = data["_timeStamps"] || this.resetData("_timeStamps");
            this.AdventureInfo = data["AdventureInfo"] || this.resetData("AdventureInfo");
            this.exploreTime = data["exploreTime"] || this.resetData("exploreTime");
            this.areaInfo = data["areaInfo"] || this.resetData("areaInfo");
            this.buildInfo = data["buildInfo"] || this.resetData("buildInfo");
            this.buildResource = data["buildResource"] || this.resetData("buildResource");
            this.resource = data["resource"] || this.resetData("resource");
        } else {
            this._playerID =  this.resetData("playerID");
            this.petList =  this.resetData("petList");
            this._timeStamps =   this.resetData("_timeStamps");
            this.AdventureInfo =   this.resetData("AdventureInfo");
            this.exploreTime =  this.resetData("exploreTime");
            this.areaInfo = this.resetData("areaInfo");
            this.buildInfo = this.resetData("buildInfo");
            this.buildResource =  this.resetData("buildResource");
            this.resource =  this.resetData("resource");

        }
        this.isLoaded = true;

        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);
    }

    resetData(name):any {
        switch (name) {
            case "playerID":
                return `Player:${Math.random()}`;
            case "petList":
                return [{ petId: "froom", petLevel: 1, petName: "Froge" }]
            case "_timeStamps":
                return {};
            case "AdventureInfo":
                return {
                    time: 0,
                    food: 0,
                    destination: "",
                    pets: [],
                    coinslist: [],
                    woodlist: [],
                    stonelist: [],
                };
            case "exploreTime":
                return { "water": 0, "fire": 0, "food": 0, "nature": 0 };
            case "areaInfo":
                return {
                    exploring: { "water": false, "fire": false, "food": false, "nature": false, "unknow": false },
                    capture: { "unknow": false },
                    captureStartTime: { "unknow": 0 },
                    captureTimeTakenReward: { "unknow": 0 },
                    stopTime: { "unknow": 0 },
                };
            case "buildInfo":
                return {};
            case "buildResource":
                return {};
            case "resource":
                return {
                    [Resource.star]: 1,
                    [Resource.coin]: 10000,
                    [Resource.stone]: 300,
                    [Resource.wood]: 300,
                    [Resource.food]: 300,
                    [Resource.magicStone]: 1,
                };
            default:
                console.error("no data");
                break;
        }

    }


    public resetUse() {
        cc.sys.localStorage.setItem("KK_DEMO", "");
        cc.director.pause(); // try to prevent more saves; PET-1128
        location.reload();
    }
}




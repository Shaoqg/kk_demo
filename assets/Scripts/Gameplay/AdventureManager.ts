import User from "./User";
import { AdventureAreas, Resource, PetData, IsLandType } from "../Config";
import { AdventureArea } from "../Screens/AdventureArea";
import { DateUtils } from "../Util/DateUtils";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import ResourceManager from "./ResourcerManager";
import IslandState from "./State/IslandState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AdventureManager {

    private static _instance: AdventureManager = null;
    static get instance() {
        if (!this._instance) {
            this._instance = new AdventureManager();
        }

        return this._instance;
    }

    constructor() {
        this.init();
    }

    readonly adventureKey = "adventure-";

    areaInfo: {
        [areaName: string]: {
            petDatas: PetData[],
            rewarNum: number,
            rewardType: Resource,
            levelInfo: { level: number, star: number },
            explore?: { time: number }
        }
    } = {};

    currAreaNam = null;
    currPetList: PetData[] = [];

    init() {
        //TODO resetInfo
        let saveGame = false;
        let petReward = false;
        AdventureAreas.forEach((area) => {
            let info = User.instance.getAreaInfo(area.areaName);

            this.areaInfo[area.areaName] = {
                petDatas: [],
                rewarNum: 0,
                levelInfo: info.levelInfo,
                rewardType: area.reward
            };

            let lastSaveTime = User.instance.areaInfo.saveTime;//TODO Calculate offline revenue?
            if (info.timeStamps != 0) {//add pet
                let pets = User.instance.getPetsNowUsing(this.adventureKey + area.areaName);

                let time = DateUtils.getServerTime();
                if (time < info.timeStamps) {
                    this.areaInfo[area.areaName].petDatas = pets;
                    this.areaInfo[area.areaName].explore = { time: info.timeStamps };
                    petReward = true;
                } else {
                    // remove pet info
                    this.onPetEndExploreReward(area.areaName);
                    saveGame = true;

                }
            }
        })

        if (petReward) {
            let timeBar = ResourceManager.instance.getTimeBar(IsLandType.castle);
            timeBar.updateCB =  (dt)=>{this.onRewardUpdate(dt)};
        }

        if (saveGame) {
            User.instance.saveUse();
        }
    }

    showAdventureArea() {
        AdventureArea.prompt();
    }

    onStartExplore(areaName, petData: PetData[]) {
        this.currAreaNam = areaName;
        this.currPetList = petData;
    }

    onEndExplore(isWin) {
        let areaName = this.currAreaNam;
        if (isWin) {
            let info = User.instance.getAreaInfo(areaName);

            //set level
            if (info.levelInfo.star < 3) {
                info.levelInfo.star++;
            } else {
                //level up
                info.levelInfo.level++;
                info.levelInfo.star = 0;
            }
            // set pet 
            let pets: string[] = [];
            this.currPetList.forEach((petData: PetData) => {
                User.instance.setPetOnUsing(petData.petId, this.adventureKey + areaName);
                pets.push(petData.petId)
            });
            // set time and state
            info.timeStamps = DateUtils.getServerTime() + this.getExploreRewardTime(areaName) * 1000;
            info.exploring = true;
            // save 
            User.instance.updateAreaInfo(areaName, info);

            this.areaInfo[areaName].petDatas = this.currPetList,
                this.areaInfo[areaName].explore = { time: info.timeStamps },
                this.areaInfo[areaName].levelInfo = info.levelInfo

            // timebar 
            let timeBar = ResourceManager.instance.getTimeBar(IsLandType.castle);
            timeBar.updateCB = (dt)=>{this.onRewardUpdate(dt)};

        } else {
            //TODO?
        }

        this.currAreaNam = null;
        this.currPetList = [];
    }

    _timeTemp = 0;
    onRewardUpdate(dt) {
        this._timeTemp -= dt;
        if (this._timeTemp <= 0) {
            this._timeTemp += 0.5;
            for (const key in this.areaInfo) {
                if (this.areaInfo[key].explore) {
                    if (this.areaInfo[key].explore.time >= DateUtils.getServerTime()) {
                        this.onPetStartExploreReward(key, 60/0.5);
                    } else {
                        this.onPetEndExploreReward(key);
                    }
                }
            }
        }
    }
    
    onPetStartExploreReward(areaName, time) {
        User.instance.areaInfo.saveTime = DateUtils.getServerTime();
        let info = this.getExploreReward(areaName);

        let areaInfo = this.areaInfo[areaName];
        let rewardNum_min = this.getAreaReward(areaName, areaInfo.levelInfo)* info.multiple;
        let rewardNum = Math.floor(rewardNum_min / time * 100) / 100;

        ResourceManager.instance.creatShipRes(areaInfo.rewardType, rewardNum, 2).then(() => {
            this.areaInfo[areaName].rewarNum += rewardNum;
            this._onAddRes(areaName, areaInfo.rewardType)
        })
    }

    onPetEndExploreReward(areaName) {
        this.areaInfo[areaName].explore = null;
        this.areaInfo[areaName].petDatas = null;

        let info = User.instance.getAreaInfo(areaName);
        info.pets = null;
        info.timeStamps = 0;
        info.exploring = false;

        let pets = User.instance.getPetsNowUsing(this.adventureKey + areaName);
        pets.forEach((petData) => {
            User.instance.removePetUsing(petData.petId, this.adventureKey + areaName);
        });

        //TODO try clear timeBar
        let canClear = true;
        for (const key in this.areaInfo) {
            if (this.areaInfo[key].explore) {
                canClear = false;
            }
        }
        if (canClear) {
            let timeBar = ResourceManager.instance.getTimeBar(IsLandType.castle);
            timeBar.updateCB = null;
        }
    }

    getTimeoverReward() {
        let rewardList: { resource: Resource, rewardNum: number, rewardCB: Function }[] = [];
        AdventureAreas.forEach(adventureArea => {
            let areaInfo = User.instance.getAreaInfo(adventureArea.areaName);
            let rewardNum = this.getAreaReward(adventureArea.areaName, areaInfo.levelInfo);
            rewardList.push({
                resource: adventureArea.reward,
                rewardNum: rewardNum,
                rewardCB: (numer) => {
                    this.areaInfo[adventureArea.areaName].rewarNum += numer;
                    this._onAddRes(adventureArea.areaName, adventureArea.reward)
                }
            });
        });

        return rewardList;
    }

    private _onAddRes(areaName: string, resource: Resource) {
        let rewardNum = Math.floor(this.areaInfo[areaName].rewarNum);
        this.areaInfo[areaName].rewarNum -= rewardNum;// Save decimals
        User.instance.addResource(resource, rewardNum);
        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);
    }

    getExploreReward(areaName) {
        let time = DateUtils.getServerTime();
        let areaInfo = User.instance.getAreaInfo(areaName);
        if (areaInfo.timeStamps > 0 && time < areaInfo.timeStamps) {
            let multiple = this.getExploreRewardMultiple(areaName);
            let rewardTime = 0;//this.getExploreRewardTime(areaName);
            rewardTime = areaInfo.timeStamps - time;
            return { multiple: multiple, time: rewardTime }
        }
        return null;
    }

    getExploreRewardMultiple(areaName) {
        //TODO config
        return 20;
    }

    /**
     * 
     * @param areaName sec
     */
    getExploreRewardTime(areaName) {
        //TODO config time
        return 100;
    }

    getAreaReward(areaName, info: { level: number, star: number }) {
        let reward = 1 * info.level + 10 + info.star;
        return reward;
    }

}

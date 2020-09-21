import User from "./User";
import { AdventureAreas, Resource } from "../Config";
import { AdventureArea } from "../Screens/AdventureArea";
import { DateUtils } from "../Util/DateUtils";

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

    areaInfo: { [areaName: string]: {} } = {};

    init() {
        //TODO resetInfo


    }

    showAdventureArea() {
        AdventureArea.prompt();
    }

    onEndExplore(areaName, isWin) {
        if (isWin) {
            let info = User.instance.getAreaInfo(areaName);
            // this.areaInfo[areaName] = ;

            if (info.levelInfo.star < 3) {
                info.levelInfo.star++;
            } else {//level up
                info.levelInfo.level++;
            }

            info.timeStamps = DateUtils.getServerTime();

            User.instance.updateAreaInfo(areaName, info);
        } else {
            //TODO?

        }
    }

    getTimeoverReward() {
        let rewardList:{resource: Resource, rewardNum:number}[] = [];
        AdventureAreas.forEach(adventureArea => {
            let areaInfo = User.instance.getAreaInfo(adventureArea.areaName);
            rewardList.push({
                resource:adventureArea.reward,
                rewardNum: this.getAreaReward(adventureArea.areaName, areaInfo.levelInfo)
            });
        });

        return rewardList;
    }

    getAreaReward(areaName, info: { level: number, star: number }) {

        let reward = 1 * info.level + 10 + info.star;

        return reward;
    }

}

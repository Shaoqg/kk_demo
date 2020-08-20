import { ViewConnector } from "../Tools/ViewConnector";
import User from "../Gameplay/User";
import { Resource, getTaskConfigById, RewardType } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import { EventEmitter, EventType } from "../Tools/EventEmitter";


const { ccclass, property } = cc._decorator;
export type TaskData = {
    taskID: string,
    tasktype: "achievement" | "daily",
    taskfinish: boolean;
    start?:RewardType;
}

export type TaskType = {
    taskID: string,
    taskName: string,
    taskInfo: string,
    reward: RewardType,
    getReward?: RewardType,
    useReward?: RewardType,
}



@ccclass
export default class TaskScreen extends ViewConnector {
    static prefabPath = 'Screens/TaskScreen';

    static onCloseNode: Function = null;

    static instance: TaskScreen;

    static isShowing: boolean = false;

    static TaskType = {
        Acheievement: "Acheievement",
        DailyTask: "DailyTask",
    }

    @property(cc.Node)
    Achevement: cc.Node = undefined;

    @property(cc.Node)
    Daily: cc.Node = undefined;





    applyData(tab: string) {
        let AchievementTab = this.node.getChildByName("root").getChildByName("Tabs").getChildByName("Achievement");
        let DailyTab = this.node.getChildByName("root").getChildByName("Tabs").getChildByName("Daily");
        this.AdjustGameInterface();

        AchievementTab.on(cc.Node.EventType.TOUCH_END, (() => {
            this.openAcheievementTab();
        }));

        DailyTab.on(cc.Node.EventType.TOUCH_END, (() => {
            this.openDailyTaskTab();
        }));
        //coinsTabButton.enableAutoGrayEffect = true;
        //coinsTabButton.interactable = false;
        User.instance.AchievementData.forEach((task, idx) => {
            this.createTask(task, idx,this.Achevement);
        })
        User.instance.DailyTaskData.forEach((task, idx) => {
            this.createTask(task, idx,this.Daily);
        })
        this.openDailyTaskTab();
    }

    readonly width = 750;
    readonly Height = 1334;
    readonly MaxScale = 1;
    readonly MinScale = 0.80;
    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
    AdjustGameInterface() {
        let scale = 1;
        let size = cc.view.getFrameSize();
        // console.log(size);
        // let oldValue = this.Height * size.width / size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）

        let oldValue = this.width / this.Height * size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）
        scale = size.width / oldValue;

        if (scale > this.MaxScale) {
            scale = this.MaxScale;
        } else if (scale < this.MinScale) {
            scale = this.MinScale;
        }

        // this.node.width = GameManager.instance.canvas.node.width;

        let blockInput = this.node.getChildByName("block");
        blockInput.width = this.node.width;
        blockInput.height = 1334;

        let rootNode = this.node.getChildByName("root");
        rootNode.scale = scale;

        //adjust root position
        // let posY = 1334 / 2 - CurrencyHud.instance.getTopDistance() - 60;
        // rootNode.y = posY;

        let height = Math.floor(rootNode.convertToWorldSpaceAR(cc.Vec2.ZERO).y / scale);
        rootNode.height = height;

        let bg = rootNode.getChildByName("Background");
        // bg.width = Math.fround(this.node.width / scale);
        // bg.height = Math.ceil(this.Height / scale > bg.height ? this.Height / scale : bg.height) + 20;

    }

    openAcheievementTab() {
        this._activateTab(TaskScreen.TaskType.Acheievement, this.Achevement);
    }

    openDailyTaskTab() {
        this._activateTab(TaskScreen.TaskType.DailyTask, this.Daily);
    }

    // openCoinsTab() {
    //     // this._activateTab(StoreScreen.StoreType.Coin, this.coinShop);
    // }

    _activateTab(taskName: string, tab: cc.Node) {

        this.Achevement.active = false;
        this.Daily.active = false;

        tab.active = true;

    }
    async createTask(taskdata: TaskData, idx: number,parent:cc.Node) {
        let prefab = await KKLoader.loadPrefab("Prefab/TaskItem");
        let TaskItemNode = cc.instantiate(prefab);
        let list=cc.find("content/scrollview/list",parent);
        TaskItemNode.setParent(list);
        TaskItemNode.x = 0;
        TaskItemNode.y = -130 - idx * 220;
        if(list.height==0){
            list.height=220
        }
        list.height+=220;
        let name = TaskItemNode.getChildByName("TaskName").getComponent(cc.Label);
        let info = TaskItemNode.getChildByName("TaskInfo").getComponent(cc.Label);
        let rewardNode = TaskItemNode.getChildByName("Reward");
        let RewardImage = rewardNode.getChildByName("RewardImage").getComponent(cc.Sprite);
        let rewardLabel = rewardNode.getChildByName("RewardLabel").getComponent(cc.Label);
        let btnNode=TaskItemNode.getChildByName("button_primary");
        let button=btnNode.getChildByName("button");
        let button_gry=btnNode.getChildByName("button_gry");

        let task = getTaskConfigById(taskdata.taskID,taskdata.tasktype);
        name.string = task.taskName;
        info.string = task.taskInfo;
        let path = null;
        switch (task.reward.rewardType) {
            case Resource.coin:
                path = "UI/coin_reward";
                break;
            case Resource.wood:
                path = "UI/wood";
                break;
            case Resource.stone:
                path = "UI/stone";
                break;
            case Resource.food:
                path = "UI/food";
                break;
            case Resource.magicStone:
                path = "UI/magic_rock";
                break;
            default:
                path = "UI/coin_reward";
        }
        RewardImage.spriteFrame = await KKLoader.loadSprite(path);
        rewardLabel.string = task.reward.rewardNum.toString();

        if(taskdata.taskfinish||true){
            button_gry.active=false;
        }

        button.on(cc.Node.EventType.TOUCH_END, (()=>{
            User.instance.getReward(task.reward.rewardType,task.reward.rewardNum);
            EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);
            this.close(undefined);
        }));
    }

    close(results: any) {
        this.node.destroy();
    }

    static async prompt(tab: string = TaskScreen.TaskType.DailyTask): Promise<void> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = await this.loadView<TaskScreen>(parentNode, TaskScreen);

        vc.applyData(tab);
        this.isShowing = true;

        this.instance = vc;

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise(executor);
    }


}

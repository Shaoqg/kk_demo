import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import User from "../Gameplay/User";
import { StateManager } from "../Gameplay/State/StateManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
const { ccclass, property } = cc._decorator;

@ccclass
export class CastleScreen extends ViewConnector {

    static prefabPath = 'Prefab/CastleScreen';

    static _instance: CastleScreen = null;

    root: cc.Node = null;
    rewarditem: cc.Node;

    Level: number = 1;

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = CastleScreen._instance = await this.loadView<CastleScreen>(parentNode, CastleScreen);

        vc.applyData();

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

    applyData() {
        this.Level = User.instance.level_castle;
        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();


        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        this.updateList();

        this.updateCastleInfo();

        let btn_levelup = cc.find("content/btn_levelUp", this.node);
        btn_levelup.on(cc.Node.EventType.TOUCH_END, this.onclickLevelUp.bind(this));
    }

    updateCastleInfo() {
        let label_level = cc.find("content/Info/level", this.node).getComponent(cc.Label);
        let label_petNumber = cc.find("content/Info/label2", this.node).getComponent(cc.Label);
        let label_intr = cc.find("content/Info/label3", this.node).getComponent(cc.Label);

        label_level.string = "Level: " + User.instance.level_castle;
        label_petNumber.string = "Pet capacity: "+  (User.instance.level_castle *2 +5);

        let str = [
            "",
            "The shop can recruit common pets",
            "The shop can recruit Uncommon pets",
            "The shop can recruit rare pets",
        ];
        label_intr.string = str[User.instance.level_castle > 3? 3: User.instance.level_castle  ]
    }

    can_levelup = false;
    updateList(){
        let config = this.getLevelUpInfo(this.Level)

        //TODO show list info
        let showOk = (node:cc.Node, str:string,isOk) => {
            node.getChildByName("label_progress").getComponent(cc.Label).string = str;
            node.getChildByName("isOk").getComponent(cc.Button).interactable = isOk;
        }

        this.can_levelup = true;
        let lists = cc.find("content/list", this.node).children;
        lists.forEach((node)=>{
            let name = node.name;
            let str = config[name] || "";
            let isOk = false;

            if (!config[name]) {
                node.active = false;
                return;
            }
            switch (name) {
                case "ship":
                        isOk = User.instance.level >= config[name];
                        str = `Level: ${User.instance.level}/ ${ config[name]}`;
                    break;
                case "pet":
                        isOk = User.instance.petNumber >= config[name];
                        str = `${User.instance.petNumber}/ ${ config[name]}`;
                    break;
                case "coin":
                        isOk = User.instance.coin >= config[name];
                        str = config[name]+"";
                    break;
                case "wood":
                        isOk = User.instance.wood >= config[name];
                        str = config[name]+"";
                    break;
                case "stone":
                        isOk = User.instance.stone >= config[name];
                        str = config[name]+"";
                    break;
            }
            showOk(node,str, isOk);
            if (!isOk) {
                this.can_levelup = false;
            }
        })

        let btn_levelup = cc.find("content/btn_levelUp", this.node).getComponent(cc.Button);
        btn_levelup.interactable = this.can_levelup;
       
    }

    onclickLevelUp(){
        //TODO level up
        if (!this.can_levelup) {
            return;
        }

        let config = this.getLevelUpInfo(this.Level)
        for (const key in config) {
            switch (key) {
                case "coin":
                        User.instance.coin -= config[key];
                    break;
                case "wood":
                        User.instance.wood -= config[key];
                    break;
                case "stone":
                        User.instance.stone -= config[key];
                    break;
            }
        }
        
        User.instance.level_castle +=1;
        EventEmitter.emitEvent(EventType.LEVEL_UP_CASTLE);
        this.close(null);
    }

    getLevelInfo(level){
        let levelupConfig= [
            {
                pet:5,
            },
            {
                pet:7,
            },
            {
                pet:10,
            },
            ]
        return levelupConfig[level - 1];
    }

    getLevelUpInfo(level) {
        let levelupConfig= [
            {
                coin:100,
                wood:5,
                pet:1,
                ship:1,
            },
            {
                coin:200,
                wood:50,
                ship:2,
                pet:5,
                stone:5,
            },
            {
                coin:200,
                wood:500,
                ship:2,
                pet:5,
                stone:5,
            },
        ]

        return levelupConfig[level - 1];
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        StateManager.instance.changeState("IslandState");
        this.node.stopAllActions();
    }
}
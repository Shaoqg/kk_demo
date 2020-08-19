import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { petBouns } from "../UI/PetRevealDialog";
import User from "../Gameplay/User";
import { Adventure } from "./Adventure";
import WorldManager from "../Gameplay/WorldManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { AdventureAreas, Trees, TreeNeed } from "../Config";
const { ccclass, property } = cc._decorator;

@ccclass
export class TreeUpgrade extends ViewConnector {

    static prefabPath = 'Prefab/TreeUpgrade';

    static _instance: TreeUpgrade = null;

    root: cc.Node = null;
    rewarditem: cc.Node;
    list1: cc.Node;
    list2: cc.Node;
    list3: cc.Node;

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = TreeUpgrade._instance = await this.loadView<TreeUpgrade>(parentNode, TreeUpgrade);

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

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        Trees.forEach((treeConfig) => {
            let treeNode = cc.find(treeConfig.treeId, this.root);
            let tree = cc.find("tree", treeNode);
            let subtitle = cc.find("subtitle/capacity", treeNode).getComponent(cc.Label);
            let userTreeLevel = User.instance.level_Trees[treeConfig.treeId]

            tree.children.forEach((treeLevel, idx) => {

                if (idx > userTreeLevel) {
                    treeLevel.getChildByName("icon_locked").active = true;
                } else {
                    treeLevel.getChildByName("icon_locked").active = false;
                }
                if (treeLevel.name == "level" + userTreeLevel) {
                    treeLevel.getChildByName("checkmark").active = true;
                    treeLevel.getChildByName("bg_checked").active = true;
                } else {
                    treeLevel.getChildByName("checkmark").active = false;
                    treeLevel.getChildByName("bg_checked").active = false;
                }
                if (treeLevel.name == "level" + (userTreeLevel + 1)) {
                    treeLevel.getChildByName("label_progress").active = true;
                    treeLevel.getChildByName("label_progress").getComponent(cc.Label).string = "Wood:\n" + User.instance.wood + "/" + TreeNeed[userTreeLevel];
                    treeLevel.once(cc.Node.EventType.TOUCH_END, () => {
                        if (User.instance.wood >= TreeNeed[userTreeLevel]) {
                            User.instance.level_Trees[treeConfig.treeId]++;
                            User.instance.wood -= TreeNeed[userTreeLevel];
                            this.refreshLevel()
                            EventEmitter.emitEvent(EventType.LEVEL_UP_TREE);
                            User.instance.saveUse();
                        }
                    });
                } else {
                    treeLevel.getChildByName("label_progress").active = false;
                }
            })
            subtitle.string = treeConfig.treeName;

        })
        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }

    refreshLevel() {
        Trees.forEach((treeConfig) => {
            let treeNode = cc.find(treeConfig.treeId, this.root);
            let tree = cc.find("tree", treeNode);
            let subtitle = cc.find("subtitle/capacity", treeNode).getComponent(cc.Label);
            let userTreeLevel = User.instance.level_Trees[treeConfig.treeId]

            tree.children.forEach((treeLevel, idx) => {
                treeLevel.off(cc.Node.EventType.TOUCH_END);

                if (idx > userTreeLevel) {
                    treeLevel.getChildByName("icon_locked").active = true;
                } else {
                    treeLevel.getChildByName("icon_locked").active = false;
                }
                if (treeLevel.name == "level" + userTreeLevel) {
                    treeLevel.getChildByName("checkmark").active = true;
                    treeLevel.getChildByName("bg_checked").active = true;
                } else {
                    treeLevel.getChildByName("checkmark").active = false;
                    treeLevel.getChildByName("bg_checked").active = false;
                }
                if (treeLevel.name == "level" + (userTreeLevel + 1)) {
                    treeLevel.getChildByName("label_progress").active = true;
                    treeLevel.getChildByName("label_progress").getComponent(cc.Label).string = "Wood:\n" + User.instance.wood + "/" + TreeNeed[userTreeLevel];
                    treeLevel.once(cc.Node.EventType.TOUCH_END, () => {
                        if (User.instance.wood >= TreeNeed[userTreeLevel]) {
                            User.instance.level_Trees[treeConfig.treeId]++;
                            User.instance.wood -= TreeNeed[userTreeLevel];
                            this.refreshLevel()
                            EventEmitter.emitEvent(EventType.LEVEL_UP_TREE);
                            User.instance.saveUse();
                        }
                    });
                } else {
                    treeLevel.getChildByName("label_progress").active = false;
                }
            })
            subtitle.string = treeConfig.treeName;
        })
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
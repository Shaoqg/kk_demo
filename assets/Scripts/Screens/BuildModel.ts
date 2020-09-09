import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import User from "../Gameplay/User";
import { ElementType, BuildInfo } from "../Config";
import { setSpriteSize } from "../Tools/UIUtils";
import UpgradeModel from "../UI/UpgradeMode";
import IslandManager from "../Gameplay/IslandManager";
const { ccclass, property } = cc._decorator;

@ccclass
export class BuildModel extends ViewConnector {

    static prefabPath = 'Prefab/BuildModel';

    static _instance: BuildModel = null;

    root: cc.Node = null;

    static async prompt(type = ElementType.nature): Promise<any> {
        if (!!BuildModel._instance) {
            return;
        }
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = BuildModel._instance = await this.loadView<BuildModel>(parentNode, BuildModel);

        vc.applyData(type);

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    close(any) {
        super.close(any);
        if (BuildModel._instance) {
            BuildModel._instance = null;
        }
    }

    applyData(type: ElementType) {

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        this.initTopButtom();

        this.initBuild();
        this.init_buildBtn(type);

        underlay.on(cc.Node.EventType.TOUCH_END, () => {
            this.close(null);
        })

    }

    initTopButtom() {
        let btn_build = cc.find("btn_build", this.root);
        let btn_castle = cc.find("btn_castle", this.root);
        let btn_ship = cc.find("btn_ship", this.root);

        btn_build.on(cc.Node.EventType.TOUCH_END, () => this.onClickTopBtn("btn_build"));
        btn_castle.on(cc.Node.EventType.TOUCH_END, () => this.onClickTopBtn("btn_castle"));
        btn_ship.on(cc.Node.EventType.TOUCH_END, () => this.onClickTopBtn("btn_ship"));

    }

    _topState: "btn_build" | "btn_castle" | "btn_ship" = "btn_build";
    onClickTopBtn(name: "btn_build" | "btn_castle" | "btn_ship") {
        let btn_build = cc.find("btn_build", this.root);
        let btn_castle = cc.find("btn_castle", this.root);
        let btn_ship = cc.find("btn_ship", this.root);
        let btns = [btn_build, btn_castle, btn_ship];
        btns.forEach((node) => {
            node.getChildByName("line").active = node.name != name;
            node.getChildByName("bg").color = node.name == name ? cc.color(255, 239, 208) : cc.color(255, 207, 86);
        })

        switch (name) {
            case "btn_build":
                break;
            case "btn_castle":
                break;
            case "btn_ship":
                break;
            default:
                break;
        }
    }

    initBuild() {
        this.update_builds(ElementType.nature);
    }

    update_builds(type: ElementType) {
        let buildInfo = User.instance.getBuildInfo(type);
        let path = "";
        switch (type) {
            case "nature":
                path = "Canvas/world/island/natureNode";
                break;
            case "fire":
                path = "Canvas/world/island/fireNode";
                break;
            case "water":
                path = "Canvas/world/island/waterNode";
                break;
            case "snack":
                path = "Canvas/world/island/snackNode";
                break;
        }

        let node = cc.find(path);
        this._update_build(node, buildInfo, type);

    }

    _buildInfoList: {
        [type: string]: {
            sprite: cc.Sprite
            buildInfo: BuildInfo
        }
    } = null
    _update_build(targeNode: cc.Node, buildInfo: BuildInfo, type: ElementType) {
        let build_scrollView = cc.find("build_scrollView", this.root);

        let item_build = cc.find("content/item_build", build_scrollView);
        let item_wonder = cc.find("content/item_wonder", build_scrollView);

        let updateNode = (name: "wonder" | "build", itemNode: cc.Node, toLevel: number) => {
            let item1 = cc.find("item_content/item1", itemNode);
            let sprite1 = cc.find("image", item1).getComponent(cc.Sprite);
            let item2 = cc.find("item_content/item2", itemNode);
            let sprite2 = cc.find("image", item2).getComponent(cc.Sprite);

            let nodes = cc.find("island/mapblocks/" + name, targeNode).children;


            //update sprite
            let sf: cc.SpriteFrame = null;
            if (toLevel < 2) {
                sprite1.spriteFrame = null;
            } else {
                sf = nodes[toLevel - 2].getComponentInChildren(cc.Sprite).spriteFrame
                setSpriteSize(sprite1, sf, 100);
            }
            if (toLevel > nodes.length) {
                sprite2.spriteFrame = null;
            } else {
                sf = nodes[toLevel - 1].getComponentInChildren(cc.Sprite).spriteFrame;
                setSpriteSize(sprite2, sf, 100);
            }

            //update upgrade info
            let upgradeNode = cc.find("item_content/upgrade", itemNode)
            let label_level = cc.find("label", upgradeNode).getComponent(cc.Label);
            let label_coin = cc.find("costs/coin/label", upgradeNode).getComponent(cc.Label);
            let label_res = cc.find("costs/res/label", upgradeNode).getComponent(cc.Label);
            let sprite_res = cc.find("costs/res/image", upgradeNode).getComponent(cc.Sprite);
            if (toLevel > nodes.length) {
                label_level.string = `?`;
                label_coin.string = "";
                label_res.string = "";
                sprite_res.spriteFrame = null;
            } else {
                label_level.string = `lvl ${toLevel - 1} -> lvl ${toLevel}`;
                label_coin.string = "100";//TODO
                label_res.string = "100";//TODO
                sprite_res.spriteFrame = null;//TODO
            }

            //update button
            let btn_upgrade = cc.find("item_content/btn_upgrade", itemNode);
            btn_upgrade.off(cc.Node.EventType.TOUCH_END);
            btn_upgrade.on(cc.Node.EventType.TOUCH_END, () => {
                this.showUpgradeModel(name, type, sf, toLevel)
            });
        }

        updateNode("build", item_build, buildInfo.build + 1);
        updateNode("wonder", item_wonder, buildInfo.wonder + 1);

        // this._buildInfoList[type] = {
        //     // 

    }

    _showing = false;
    async showUpgradeModel(name: "wonder" | "build", type: ElementType, sprite: cc.SpriteFrame, toLevel: number) {
        if (this._showing) {
            return;
        }
        this._showing = true;
        let isUpgrade = await UpgradeModel.prompt(sprite, type, name, toLevel);
        this._showing = false;
        if (isUpgrade) {
            this.onUpgradeIsland(name, type);
        }
    }

    onUpgradeIsland(name: "wonder" | "build", type: ElementType) {
        this.close(null);
        IslandManager.instance.upgradeIslandeBuild(type, name, true);

    }

    update_buildView() {
        //TODO
        let item_view = cc.find("build_scrollView/content/item_build", this.root);
        let content = cc.find("item_content", item_view);
    }

    _isInit = false;
    _buildBtnState: ElementType;
    init_buildBtn(type: ElementType) {
        let button_scrollView_content = cc.find("button_island", this.root);
        let names = [ElementType.fire, ElementType.nature, ElementType.snack, ElementType.water];

        let updateBtnState = (name: ElementType) => {
            this._buildBtnState = name;
            button_scrollView_content.children.forEach(node => {
                node.getChildByName("bg").color = node.name == name ? cc.color(235, 220, 187) : cc.color(255, 255, 255);
            })
        }

        button_scrollView_content.children.forEach((node, i) => {
            node.name = names[i];
            node.on(cc.Node.EventType.TOUCH_END, () => {
                if ((node.name as ElementType) != this._buildBtnState) {
                    this.update_builds(node.name as ElementType);
                    updateBtnState(node.name as ElementType);
                }
            })
            //update btn name
            node.getChildByName("label").getComponent(cc.Label).string = names[i].slice(0, 1).toUpperCase() + names[i].slice(1);
        });

        updateBtnState(type);
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
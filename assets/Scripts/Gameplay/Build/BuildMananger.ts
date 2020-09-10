import { ElementType, BuildInfo } from "../../Config";
import User from "../User";
import { setSpriteSize } from "../../Tools/UIUtils";
import UpgradeModel from "../../UI/UpgradeMode";
import IslandManager from "../Island/IslandManager";

export default class BuildManager {

    private static _instance: BuildManager = null;

    static get instance() {
        if (!this._instance) {
            this._instance = new BuildManager();
        }
        return this._instance;
    }

    node: cc.Node = null;


    _closeBuildModelCB: (any) => {} = null;
    initBuild(node: cc.Node, closeCB: (any) => {}, type: ElementType = ElementType.nature) {
        if (cc.isValid(this.node)) {
            return;
        }
        this._closeBuildModelCB = closeCB;
        this.node = node;
        this.update_builds(type);
        this.init_buildBtn(type);
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
            build: cc.SpriteFrame,
            wonder: cc.SpriteFrame
            buildInfo: BuildInfo
        }
    } = {};
    _btnEventAdded = false;
    _update_build(targeNode: cc.Node, buildInfo: BuildInfo, type: ElementType) {
        let build_scrollView = cc.find("build_scrollView", this.node);

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
                let nodesIndex = toLevel - 1 > nodes.length ? nodes.length - 1 : toLevel - 2;
                sf = nodes[nodesIndex].getComponentInChildren(cc.Sprite).spriteFrame
                setSpriteSize(sprite1, sf, 100);
            }

            let nodesIndex = toLevel > nodes.length ? nodes.length - 1 : toLevel - 1;
            sf = nodes[nodesIndex].getComponentInChildren(cc.Sprite).spriteFrame;
            setSpriteSize(sprite2, sf, 100);
            this._buildInfoList[type][name] = sf;

            //update upgrade info
            let upgradeNode = cc.find("item_content/upgrade", itemNode)
            let label_level = cc.find("label", upgradeNode).getComponent(cc.Label);
            label_level.string = `lvl ${toLevel - 1} -> lvl ${toLevel}`;
            // let label_coin = cc.find("costs/coin/label", upgradeNode).getComponent(cc.Label);
            // let label_res = cc.find("costs/res/label", upgradeNode).getComponent(cc.Label);
            // let sprite_res = cc.find("costs/res/image", upgradeNode).getComponent(cc.Sprite);
            // if (toLevel > nodes.length) {
            //     label_level.string = `?`;
            //     label_coin.string = "";
            //     label_res.string = "";
            //     sprite_res.spriteFrame = null;
            // } else {
            //     label_level.string = `lvl ${toLevel - 1} -> lvl ${toLevel}`;
            //     label_coin.string = "100";//TODO
            //     label_res.string = "100";//TODO
            //     sprite_res.spriteFrame = null;//TODO
            // }

            //update button
            if (!this._btnEventAdded) {
                let btn_upgrade = cc.find("item_content/btn_upgrade", itemNode);
                btn_upgrade.on(cc.Node.EventType.TOUCH_END, () => {
                    this.onClickUpgrade(name);
                });
            }
        }
        this._buildInfoList[type] = {
            wonder: null,
            build: null,
            buildInfo: buildInfo
        }
        updateNode("build", item_build, buildInfo.build + 1);
        updateNode("wonder", item_wonder, buildInfo.wonder + 1);
        this._btnEventAdded = true;

    }

    onClickUpgrade(name: "wonder" | "build") {
        this.showUpgradeModel(name, this._buildTypeState,
            this._buildInfoList[this._buildTypeState][name],
            this._buildInfoList[this._buildTypeState].buildInfo[name] + 1);
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
        
        IslandManager.instance.upgradeIslandeBuild(type, name, true);

        this.close();
    }

    update_buildView() {
        //TODO
        let item_view = cc.find("build_scrollView/content/item_build", this.node);
        let content = cc.find("item_content", item_view);
    }

    _buildTypeState: ElementType;
    init_buildBtn(type: string) {
        let button_scrollView_content = cc.find("button_island", this.node);
        let names = [ElementType.fire, ElementType.nature, ElementType.snack, ElementType.water];

        let updateBtnState = (name: ElementType) => {
            this._buildTypeState = name;
            button_scrollView_content.children.forEach(node => {
                node.getChildByName("bg").color = node.name == name ? cc.color(235, 220, 187) : cc.color(255, 255, 255);
            })
        }

        button_scrollView_content.children.forEach((node, i) => {
            node.name = names[i];
            node.on(cc.Node.EventType.TOUCH_END, () => {
                if ((node.name as ElementType) != this._buildTypeState) {
                    this.update_builds(node.name as ElementType);
                    updateBtnState(node.name as ElementType);
                }
            })
            //update btn name
            node.getChildByName("label").getComponent(cc.Label).string = names[i].slice(0, 1).toUpperCase() + names[i].slice(1);
        });

        updateBtnState(type as ElementType);
    }


    close() {
        this._init = false;
        this._btnEventAdded = false;
        this._showing = false;

        this._closeBuildModelCB && this._closeBuildModelCB(null);
    }



}

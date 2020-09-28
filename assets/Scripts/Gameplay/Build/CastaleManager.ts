import {CastleInfo, IsLandType, IsLandItemType } from "../../Config";
import User from "../User";
import { setSpriteSize } from "../../Tools/UIUtils";
import UpgradeModel from "../../UI/UpgradeMode";
import IslandManager from "../Island/IslandManager";
import { BuildModel } from "../../Screens/BuildModel";

export default class CastleManager {

    private static _instance: CastleManager = null;

    static get instance() {
        if (!this._instance) {
            this._instance = new CastleManager();
        }
        return this._instance;
    }

    node: cc.Node = null;


    initBuild(node: cc.Node) {
        if (cc.isValid(this.node)) {
            return;
        }
        this.node = node;
        this.update_builds();
    }

    update_builds() {
        let castleInfo = User.instance.getBuildInfo(IsLandType.castle) as CastleInfo;
        let path = "Canvas/world/island/castleNode";

        let node = cc.find(path);
        this._update_build(node, castleInfo);

    }

    _castleInof: {
        castle: cc.SpriteFrame,
        ship: cc.SpriteFrame,
        info: CastleInfo
    } = null;
    _btnEventAdded = false;
    _update_build(targeNode: cc.Node, castleInfo: CastleInfo) {
        let content = cc.find("content", this.node);

        let item_castle = cc.find("item_castle", content);
        let item_ship = cc.find("item_ship", content);

        let updateNode = (name: IsLandItemType, itemNode: cc.Node, toLevel: number) => {
            let item1 = cc.find("item_content/item1", itemNode);
            let sprite1 = cc.find("image", item1).getComponent(cc.Sprite);
            let item2 = cc.find("item_content/item2", itemNode);
            let sprite2 = cc.find("image", item2).getComponent(cc.Sprite);

            let children = cc.find("island/mapblocks/" + name, targeNode).children;
            let nodes = children.filter((node)=> node.name.includes("level"))

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
            this._castleInof[name] = sf;

            //update upgrade info
            let upgradeNode = cc.find("item_content/upgrade", itemNode)
            let label_level = cc.find("label", upgradeNode).getComponent(cc.Label);
            label_level.string = `lvl ${toLevel - 1} -> lvl ${toLevel}`;
     
            //update button
            if (!this._btnEventAdded) {
                let btn_upgrade = cc.find("item_content/btn_upgrade", itemNode);
                btn_upgrade.on(cc.Node.EventType.TOUCH_END, () => {
                    this.onClickUpgrade(name);
                });
            }
        }
        this._castleInof = {
            castle: null,
            ship: null,
            info: castleInfo
        };
        updateNode(IsLandItemType.castle, item_castle, castleInfo.castle + 1);
        updateNode(IsLandItemType.ship, item_ship, castleInfo.ship + 1);
        this._btnEventAdded = true;

    }

    onClickUpgrade(name: IsLandItemType) {
        this.showUpgradeModel(name, IsLandType.castle,
            this._castleInof[name],
            this._castleInof.info[name] + 1);
    }

    _showing = false;
    async showUpgradeModel(name: IsLandItemType, type: IsLandType, sprite: cc.SpriteFrame, toLevel: number) {
        if (this._showing) {
            return;
        }
        this._showing = true;
        let isUpgrade = await UpgradeModel.prompt(sprite, type, name, toLevel);
        this._showing = false;
        if (isUpgrade) {
            this.onUpgradeCastle(name, type);
        }
    }

    onUpgradeCastle(name: IsLandItemType, type: IsLandType) {
        IslandManager.instance.upgradeIslandeBuild(type, name, true);
        BuildModel.instance && BuildModel.instance.close(null);
        this.close();
    }

    close() {
        this._btnEventAdded = false;
        this._showing = false;
    }
}

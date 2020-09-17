import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from "../Tools/ScreenSize";
import { ElementType, BuildConfig, getUpgradeInfo, Resource, IsLandType, IsLandItemType } from "../Config";
import { setSpriteSize } from "../Tools/UIUtils";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";
import User from "../Gameplay/User";
import UIManager from "./UIMananger";
import { EventEmitter, EventType } from "../Tools/EventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UpgradeModel extends ViewConnector {
    static instance: UpgradeModel = null;

    static prefabPath = 'Prefab/UpgradeModel';

    static async prompt(sf: cc.SpriteFrame, type: IsLandType, name: IsLandItemType, toLevel: number): Promise<boolean> {
        let parentNode = cc.find("Canvas/DialogRoot");

        let vc = await this.loadView<UpgradeModel>(parentNode, UpgradeModel);

        vc.applyData(sf, type, name, toLevel);
        UpgradeModel.instance = vc;

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    info: {
        sf: cc.SpriteFrame,
        type: IsLandType,
        name: IsLandItemType,
        toLevel: number,
        starReward: number,
        UpgradeConfigInfo: any
    } = null

    async applyData(sf: cc.SpriteFrame, type: IsLandType, name: IsLandItemType, toLevel: number) {
        this.adjustGameInterface();

        let bg = cc.find("underlay", this.node);
        bg.on(cc.Node.EventType.TOUCH_END, () => {
            this.close(false);
        });

        this.info = {
            sf: sf,
            type: type,
            name: name,
            toLevel: toLevel,
            starReward:0,
            UpgradeConfigInfo: getUpgradeInfo(toLevel, type, name)

        }
        this.init();
        this.initTipsInfo();

        let btn_upgrade = cc.find("content/upgradeinfo/btn_upgrade", this.node);
        btn_upgrade.on(cc.Node.EventType.TOUCH_END, this.onClick.bind(this));

    }

    init() {
        let root = cc.find("content", this.node);
        //show image and label
        let sprite = cc.find("upgradeItem/image", root).getComponent(cc.Sprite);
        setSpriteSize(sprite, this.info.sf, 180);
        let label_name = cc.find("upgradeItem/label_name", root).getComponent(cc.Label);
        let label_intro = cc.find("upgradeItem/label_intro", root).getComponent(cc.Label);
        label_name.string = BuildConfig[this.info.type][this.info.name]["id"];
        label_intro.string = BuildConfig[this.info.type][this.info.name]["introId"];

        //show upgrade info
        let costs = cc.find("upgradeinfo/costs", root);
        // let label_coin = cc.find("coin/label", costs).getComponent(cc.Label);
        // let label_res = cc.find("res/label", costs).getComponent(cc.Label);
        // let sprite_res = cc.find("res/image", costs).getComponent(cc.Sprite);

        this.info.UpgradeConfigInfo.forEach((info, i) => {
            let node = costs.children[i];
            node.active = true;

            let label = cc.find("label", node).getComponent(cc.Label);
            label.string = info.number.toString();
            label.node.color = info.number <= User.instance.getResource(info.id) ?
                cc.color(53, 36, 29) : cc.color(213, 53, 39);

            let sprite_res = cc.find("image", node).getComponent(cc.Sprite);
            GlobalResources.getSpriteFrame(SpriteType.UI, info.id).then((sf) => {
                setSpriteSize(sprite_res, sf, 40);
            })
        });

        // label_coin.string = this.info.UpgradeConfigInfo[0].number.toString();
        // label_res.string = this.info.UpgradeConfigInfo[1].number.toString();

        // label_res.node.color = this.info.UpgradeConfigInfo[1].number <= User.instance.getResource(this.info.UpgradeConfigInfo[1].id)?
        // cc.color(53,36,29):cc.color(213,53,39);
        // label_coin.node.color = this.info.UpgradeConfigInfo[0].number <= User.instance.getResource(this.info.UpgradeConfigInfo[0].id)?
        // cc.color(53,36,29):cc.color(213,53,39);

        // GlobalResources.getSpriteFrame(SpriteType.UI, this.info.UpgradeConfigInfo[1].id).then((sf) => {
        //     setSpriteSize(sprite_res, sf, 40);
        // })

    }

    onClick() {

        let configs = this.info.UpgradeConfigInfo;
        if (configs[0].number <= User.instance.getResource(Resource.coin) && configs[1].number <= User.instance.getResource(configs[1].id)) {
            // upgrade
            User.instance.UpgradeBuilInfo(this.info.type, this.info.name);
            this.info.starReward >0 && User.instance.addResource(Resource.star, this.info.starReward);
            User.instance.addResource(Resource.coin, -configs[0].number);
            User.instance.addResource(configs[1].id, -configs[1].number);
            EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);
            this.close(true);
        } else {
            //no coin
        }
    }

    initTipsInfo() {

        let config = BuildConfig[this.info.type][this.info.name];
        if (!config["reward"]) {
            return;
        }
        let tipsList = cc.find("content/tipsList", this.node);
        let children = tipsList.children;
        let index = 0;


        for (const key in config["reward"]) {
            let key_config = config["reward"][key];
            let str1 = "";
            let description = "";
            let str2 = "";
            let imageSrc = "";
            switch (key) {
                case "star":
                    imageSrc = "star"
                    description = "Increase reputation  ";
                    this.info.starReward = key_config.baseNumber + key_config.levelNumber * this.info.toLevel;
                    str2 = ` +${this.info.starReward}`;
                    break;
                case "number"://reward number
                    imageSrc = this.getRewardRes();
                    description = "Increase revenue  ";
                    str1 = ` ${key_config.baseNumber + key_config.levelNumber * (this.info.toLevel - 1)}/min`;
                    str2 = ` ${key_config.baseNumber + key_config.levelNumber * (this.info.toLevel)}/min`;
                    break;
                case "storage"://
                    imageSrc = this.getRewardRes();
                    description = "Offline revenue cap  ";
                    str1 = ` ${key_config.baseNumber + key_config.levelNumber * (this.info.toLevel - 1)}`;
                    str2 = ` ${key_config.baseNumber + key_config.levelNumber * (this.info.toLevel)}`;
                    break;
                case "quest"://
                    imageSrc = this.getRewardRes();
                    description = "Quest reward ";
                    str1 = ` ${key_config.baseNumber + key_config.levelNumber * (this.info.toLevel - 1)}`;
                    str2 = ` ${key_config.baseNumber + key_config.levelNumber * (this.info.toLevel)}`;
                    break;
                case "questLevel"://
                    imageSrc = "";
                    description = "Increase resource rewards ";
                    str1 = ` `;
                    break;
                default:
                    break;
            }
            str1 && this.updateTipsNode(children[index++], description, str1, imageSrc, false);
            str2 && this.updateTipsNode(children[index++], description, str2, imageSrc, true);
        }
    }

    updateTipsNode(node: cc.Node, description: string, str: string, imageSrc: string, isUpgrade) {
        node.active = true;

        let label = cc.find("stringNode/label", node).getComponent(cc.Label);
        label.string = str;

        let label_description = cc.find("stringNode/label_description", node).getComponent(cc.Label);
        label_description.string = description;

        label_description.node.color = label.node.color = isUpgrade ? cc.color(94, 175, 127) : cc.color(53, 36, 29);

        let icon_up = node.getChildByName("icon_up");
        let icon_tips = node.getChildByName("icon_tips");
        icon_up.active = isUpgrade;
        icon_tips.active = !isUpgrade;

        let image = cc.find("stringNode/image", node).getComponent(cc.Sprite);
        if (imageSrc) {
            image.node.active = true;
            GlobalResources.getSpriteFrame(SpriteType.UI, imageSrc).then((sf) => {
                image.spriteFrame = sf;
                setSpriteSize(image, sf, 35);
            })
        }else {
            image.node.active = false;
        }
    }

    getRewardRes() {
        this.info.type

        let resInfo = {
            [IsLandType.fire]: Resource.stone,
            [IsLandType.nature]: Resource.wood,
            [IsLandType.castle]: Resource.star,
            [IsLandType.snack]: Resource.food,
            [IsLandType.water]: Resource.coin
        }

        return resInfo[this.info.type];
    }

    adjustGameInterface() {

        let scale = ScreenSize.getScale(1, 0.8);

        let rootNode = this.node.getChildByName("content");
        this._originScale = rootNode.scale = scale;
    }


}


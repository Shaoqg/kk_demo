import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from "../Tools/ScreenSize";
import { ElementType, BuildConfig, getUpgradeInfo, Resource, IsLandType, IsLandItemType } from "../Config";
import { setSpriteSize } from "../Tools/UIUtils";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";
import User from "../Gameplay/User";
import UIManager from "./UIMananger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UpgradeModel extends ViewConnector {
    static instance: UpgradeModel = null;

    static prefabPath = 'Prefab/UpgradeModel';

    static async prompt(sf: cc.SpriteFrame, type: IsLandType, name: IsLandItemType, toLevel:number): Promise<boolean> {
        let parentNode = cc.find("Canvas/DialogRoot");

        let vc = await this.loadView<UpgradeModel>(parentNode, UpgradeModel);

        vc.applyData(sf, type, name, toLevel);
        UpgradeModel.instance = vc;

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    info:{
        sf:cc.SpriteFrame,
        type:IsLandType,
        name:IsLandItemType,
        toLevel:number,
        UpgradeConfigInfo:any
    } = null

    async applyData(sf: cc.SpriteFrame, type: IsLandType, name: IsLandItemType, toLevel:number) {
        this.adjustGameInterface();

        let bg = cc.find("underlay", this.node);
        bg.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.close(false);
        });

        this.info = {
            sf: sf,
            type: type,
            name: name,
            toLevel: toLevel,
            UpgradeConfigInfo: getUpgradeInfo(10, type, name)

        }
        this.init();

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
            label.node.color = info.number <= this.getUpgradeNumber(info.id)?
            cc.color(53,36,29):cc.color(213,53,39);

            let sprite_res = cc.find("image", node).getComponent(cc.Sprite);
            GlobalResources.getSpriteFrame(SpriteType.UI, info.id).then((sf) => {
                setSpriteSize(sprite_res, sf, 40);
            })
        });

        // label_coin.string = this.info.UpgradeConfigInfo[0].number.toString();
        // label_res.string = this.info.UpgradeConfigInfo[1].number.toString();
        
        // label_res.node.color = this.info.UpgradeConfigInfo[1].number <= this.getUpgradeNumber(this.info.UpgradeConfigInfo[1].id)?
        // cc.color(53,36,29):cc.color(213,53,39);
        // label_coin.node.color = this.info.UpgradeConfigInfo[0].number <= this.getUpgradeNumber(this.info.UpgradeConfigInfo[0].id)?
        // cc.color(53,36,29):cc.color(213,53,39);

        // GlobalResources.getSpriteFrame(SpriteType.UI, this.info.UpgradeConfigInfo[1].id).then((sf) => {
        //     setSpriteSize(sprite_res, sf, 40);
        // })

    }

    getUpgradeNumber(type:string) {
        let resInfo = {
            [Resource.food]: User.instance.food,
            [Resource.stone]: User.instance.stone,
            [Resource.wood]: User.instance.wood,
            [Resource.coin]: User.instance.coin
        }

        return resInfo[type] | 0;
    }

    onClick() {

        let configs = this.info.UpgradeConfigInfo;
        if (configs[0].number <= User.instance.coin  && configs[1].number <= this.getUpgradeNumber(configs[1].id)) {
            //TODO upgrade
            User.instance.UpgradeBuilInfo(this.info.type, this.info.name);
            User.instance.addResource(Resource.coin, configs[0].number);
            User.instance.addResource(configs[1].id, configs[1].number);
            this.close(true);
        } else {
            //no coin
        }
    }

    adjustGameInterface() {

        let scale = ScreenSize.getScale(1, 0.8);

        let rootNode = this.node.getChildByName("content");
        this._originScale = rootNode.scale = scale;
    }


}


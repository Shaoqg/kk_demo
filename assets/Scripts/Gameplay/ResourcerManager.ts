import { IsLandType, Resource, getResourceNumber, CastleInfo, BuildInfo, getOfflineRevenueMax, IsLandItemType } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";
import TimeBar from "./TimeBar";
import IslandManager from "./Island/IslandManager";
import { VoidCallPromise, delay } from "../kk/DataUtils";
import User from "./User";
import { setSpriteSize } from "../Tools/UIUtils";
import { EventEmitter, EventType } from "../Tools/EventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResourceManager extends cc.Component {

    onLoad() {
        this.init();
    }

    _resourceConfig = {};
    init() {
        //TOOD get config

        this._resourceConfig = this.updateResourceConfig();

        for (const key in this._resourceConfig) {
            let config = this._resourceConfig[key];

            let islandType = key as IsLandType;
            this.creatTimeBar(islandType);

            let resInfo = User.instance.getBuildRes(islandType);
            let revenue = 0;
            if (resInfo && resInfo.timestamp != 0) {
                revenue = resInfo.number; 
                //TODO Calculate offline revenue
                let number_min = this.getEarnPerMin(islandType);
                let timeInterval = Math.floor((Date.now() - resInfo.timestamp)/1000);
                let totalRevenue = Math.floor(timeInterval / 60 * number_min  * 0.5);

                let offlineRevenueMax = getOfflineRevenueMax(islandType,config.res.rewLevel);

                if (offlineRevenueMax >= totalRevenue) {
                    totalRevenue = offlineRevenueMax;
                }
                revenue += totalRevenue;
                User.instance.updateBuildRes(islandType, totalRevenue);
            }

            this.creatResDialog(islandType, revenue);
        }

        EventEmitter.subscribeTo(EventType.LEVEL_UP_BUILD, null);

    }

    _timebarList: TimeBar[] = [];
    async creatTimeBar(type: IsLandType) {
        let parentInfo = this.getParentInfo(type);
        let parent: cc.Node = parentInfo.parent;
        let pos: cc.Vec2 = parentInfo.position;

        let prefab: cc.Prefab = await GlobalResources.getPrefab("progress");
        let node = cc.instantiate(prefab);
        node.setParent(parent);
        node.position = pos;

        let timeBar = new TimeBar();
        timeBar.init(node, {
            totalTime: 10
        }, () => {
            this.onTimeOver(type);
        });

        this._timebarList.push(timeBar);
    }

    update(dt) {
        //TODO update timebar

        this._timebarList.forEach((script) => {
            script.update(dt);
        })
    }

    async onTimeOver(type: IsLandType) {
        //TODO 
        let number_min = this._resourceConfig[type]["res"]["num"];
        let rewardNumber = Math.floor(number_min / 6 * 100) / 100;

        await this.creatResAnimation(type);

        User.instance.updateBuildRes(type, rewardNumber);
        this.updateResDialogInfo(type);
    }

    getEarnPerMin(type: IsLandType) {
        let number_min = this._resourceConfig[type]["res"]["num"];
        return number_min;
    }

    getParentInfo(type: IsLandType) {
        let islandNode = IslandManager.instance.getNodeByType(type);
        let parent: cc.Node = cc.find("island/mapblocks", islandNode);
        let pos: cc.Vec2 = cc.Vec2.ZERO;
        if (type == IsLandType.castle) {
            pos = parent.getChildByName("ship").position;
        } else {
            pos = parent.getChildByName("build").position;
        }

        return { parent: parent, position: pos }
    }


    _resNodePool = new cc.NodePool("resNode");
    async _creatResNode() {
        if (this._resNodePool.size() > 0) {
            return this._resNodePool.get();
        }

        let prefab: cc.Prefab = await GlobalResources.getPrefab("Res");
        let node = cc.instantiate(prefab);

        return node;
    }

    pushResNode(node: cc.Node) {
        this._resNodePool.put(node);
    }

    _resDialogList: {
        [type: string]: {
            node: cc.Node,
            label: cc.Label,
        }
    } = {};
    async creatResDialog(type: IsLandType, number = 0) {
        let parentInfo = this.getParentInfo(type);
        let parent: cc.Node = parentInfo.parent;
        let pos: cc.Vec2 = parentInfo.position;

        let prefab: cc.Prefab = await GlobalResources.getPrefab("dialog_resource");
        let node = cc.instantiate(prefab);
        node.setParent(parent);
        node.position = pos;
        node.on(cc.Node.EventType.TOUCH_END, ()=> this.onClickResDialog(type))

        let label = cc.find("label", node).getComponent(cc.Label);

        let sprite = node.getChildByName("image").getComponent(cc.Sprite);
        sprite.spriteFrame = await GlobalResources.getSpriteFrame(SpriteType.UI, this._resourceConfig[type].res.type);
        setSpriteSize(sprite,  sprite.spriteFrame, 35);

        this._resDialogList[type] = {
            node: node,
            label: label,
        }

        this.updateResDialogInfo(type);
    }

    updateResDialogInfo(type: IsLandType, showScale = true) {
        let number = User.instance.getBuildRes(type).number

        this._resDialogList[type].label.string ="+" + (Math.floor(number * 10)/10);

        showScale && this._resDialogList[type].node.runAction(cc.sequence(
            cc.scaleTo(0.07, 1.1),
            cc.scaleTo(0.07, 1),
        ));
    }

    onClickResDialog(type: IsLandType){
        let update = User.instance.getBuildRevenue(type, this._resourceConfig[type].res.type);
        if (update) {
            this.updateResDialogInfo(type, false);
        }
    }

    async creatResAnimation(type: IsLandType) {
        let parentInfo = this.getParentInfo(type);
        let parent: cc.Node = parentInfo.parent;
        let pos: cc.Vec2 = parentInfo.position;

        let node = await this._creatResNode();
        node.setParent(parent);
        node.position = pos.add(cc.v2(0, 15));
        node.opacity = 0;

        let sprite = node.getChildByName("image").getComponent(cc.Sprite);
        sprite.spriteFrame = await GlobalResources.getSpriteFrame(SpriteType.UI, this._resourceConfig[type].res.type);
        setSpriteSize(sprite,  sprite.spriteFrame, 35);

        let endCB = new VoidCallPromise();

        node.runAction(cc.sequence(
            cc.spawn(
                cc.moveBy(0.2, cc.v2(0, 50)),
                cc.fadeIn(0.2)
            ),
            cc.delayTime(0.2),
            cc.spawn(
                cc.moveBy(0.2, cc.v2(0, 50)),
                cc.fadeOut(0.2)
            ),
            cc.callFunc(() => {
                this.pushResNode(node);
                endCB.resolve();
            })
        ))

        return endCB;
    }

    async onBuildLevelUp(type:IsLandType, isLandItemType:IsLandItemType) {
        switch (type) {
            case IsLandType.castle:
                return;
            default:
                if (isLandItemType != IsLandItemType.build) {
                    return;
                }
                break;
        }

        this._resourceConfig = this.updateResourceConfig();
        this._resDialogList[type].node.opacity = 0;
        this._timebarList[type].node.opacity = 0;
        delay(1);
        this._resDialogList[type].node.opacity = 255;
        this._timebarList[type].node.opacity = 255;
    }

    updateResourceConfig() {

        let ResourceConfig = {
            // [IsLandType.castle]: {
            //     res: {
            //         type: Resource.coin,
            //         num: getResourceNumber(IsLandType.castle, (User.instance.getBuildInfo(IsLandType.castle) as CastleInfo).ship)
            //     },
            //     pos: cc.v2(0, 0)
            // },
            [IsLandType.fire]: {
                res: {
                    type: Resource.stone,
                    num: getResourceNumber(IsLandType.fire, (User.instance.getBuildInfo(IsLandType.fire) as BuildInfo).build),
                    resMax:getOfflineRevenueMax(IsLandType.fire, (User.instance.getBuildInfo(IsLandType.fire) as BuildInfo).build),
                    resLevel: (User.instance.getBuildInfo(IsLandType.fire) as BuildInfo).build
                },
                pos: cc.v2(0, 0)
            },
            [IsLandType.nature]: {
                res: {
                    type: Resource.wood,
                    num: getResourceNumber(IsLandType.nature, (User.instance.getBuildInfo(IsLandType.nature) as BuildInfo).build),
                    resMax:getOfflineRevenueMax(IsLandType.fire, (User.instance.getBuildInfo(IsLandType.fire) as BuildInfo).build),
                    resLevel: (User.instance.getBuildInfo(IsLandType.nature) as BuildInfo).build
                },
                pos: cc.v2(0, 0)
            },
            [IsLandType.snack]: {
                res: {
                    type: Resource.food,
                    num: getResourceNumber(IsLandType.snack, (User.instance.getBuildInfo(IsLandType.snack) as BuildInfo).build),
                    resMax:getOfflineRevenueMax(IsLandType.fire, (User.instance.getBuildInfo(IsLandType.fire) as BuildInfo).build),
                    resLevel: (User.instance.getBuildInfo(IsLandType.snack) as BuildInfo).build
                }
            },
            [IsLandType.water]: {
                res: {
                    type: Resource.coin,
                    num: getResourceNumber(IsLandType.water, (User.instance.getBuildInfo(IsLandType.water) as BuildInfo).build),
                    resMax:getOfflineRevenueMax(IsLandType.fire, (User.instance.getBuildInfo(IsLandType.fire) as BuildInfo).build),
                    resLevel: (User.instance.getBuildInfo(IsLandType.water) as BuildInfo).build
                }
            }
        }
        return ResourceConfig;
    }


}

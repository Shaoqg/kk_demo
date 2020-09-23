import { IsLandType, Resource, getResourceNumber, CastleInfo, BuildInfo, getOfflineRevenueMax, IsLandItemType } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";
import TimeBar from "./TimeBar";
import IslandManager from "./Island/IslandManager";
import { VoidCallPromise, delay } from "../kk/DataUtils";
import User from "./User";
import { setSpriteSize } from "../Tools/UIUtils";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import AdventureManager from "./AdventureManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResourceManager extends cc.Component {

    static instance:ResourceManager = null;

    onLoad() {
        ResourceManager.instance = this;
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

            if (islandType == IsLandType.castle) {
                continue;
            }

            let resInfo = User.instance.getBuildRes(islandType);
            let revenue = 0;
            if (resInfo && resInfo.timestamp != 0) {
                revenue = resInfo.number;
                //TODO Calculate offline revenue
                let number_min = this.getEarnPerMin(islandType);
                let timeInterval = Math.floor((Date.now() - resInfo.timestamp) / 1000);
                let totalRevenue = Math.floor(timeInterval / 60 * number_min * 0.5);

                let offlineRevenueMax = config.res.resMax;

                if (revenue + totalRevenue>= offlineRevenueMax) {
                    totalRevenue = offlineRevenueMax - revenue;
                }
                revenue += totalRevenue;
                User.instance.updateBuildRes(islandType, totalRevenue);
            }

            this.creatResDialog(islandType, revenue);
        }

        EventEmitter.subscribeTo(EventType.LEVEL_UP_BUILD, this.onBuildLevelUp.bind(this));

    }

    _timebarList: { [type: string]: TimeBar } = {};
    async creatTimeBar(type: IsLandType) {
        let parentInfo = this.getParentInfo(type);
        let parent: cc.Node = parentInfo.parent;
        let pos: cc.Vec2 = parentInfo.position;

        let prefab: cc.Prefab = await GlobalResources.getPrefab("progress");
        let node = cc.instantiate(prefab);
        node.setParent(parent);
        node.position = pos.add(cc.v2(0, -115));

        let timeBar = new TimeBar();
        timeBar.init(node, {
            totalTime: type == IsLandType.castle ? 10 : 10
        }, () => {
            this.onTimeOver(type);
        });

        this._timebarList[type] = timeBar;
    }

    update(dt) {
        //TODO update timebar
        for (const key in this._timebarList) {
            this._timebarList[key].update(dt);
        }
    }

    async onTimeOver(type: IsLandType) {
        if (type == IsLandType.castle) {

            let rewardList = AdventureManager.instance.getTimeoverReward();

            rewardList.forEach(async (rewardInfo,i) => {
                let rewardNumber = Math.floor(rewardInfo.rewardNum / 6 * 100) / 100;
                await delay(i*0.1);
                this.creatShipRes(rewardInfo.resource, rewardNumber).then(()=>{
                    rewardInfo.rewardCB && rewardInfo.rewardCB(rewardNumber);
                })
            });
            return;
        }

        let number_min = this._resourceConfig[type]["res"]["num"];
        let rewardNumber = Math.floor(number_min / 6 * 100) / 100;

        await this.creatResAnimation(type);

        if (this._resourceConfig[type]["res"]["resMax"] > User.instance.getBuildRes(type).number) {
            let num = this._resourceConfig[type]["res"]["resMax"] - User.instance.getBuildRes(type).number;

            User.instance.updateBuildRes(type, rewardNumber > num ? num : rewardNumber);
        }

        this.updateResDialogInfo(type);
    }

    getTimeBar(type: IsLandType) {
        return this._timebarList[type];
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


    _resNodePool_label = new cc.NodePool("resNode_label");
    _resNodePool_res = new cc.NodePool("resNode_res");
    async _creatResNode(type: "res" | "label" = "label") {
        let prefab: cc.Prefab = null;
        if (type == "label") {
            if (this._resNodePool_label.size() > 0) {
                return this._resNodePool_label.get();
            }

            prefab = await GlobalResources.getPrefab("resource_label");
        } else {
            if (this._resNodePool_res.size() > 0) {
                return this._resNodePool_res.get();
            }

            prefab = await GlobalResources.getPrefab("resource_res");
        }


        let node = cc.instantiate(prefab);

        return node;
    }

    pushResNode(node: cc.Node, type: "res" | "label" = "label") {
        if (type == "label") {
            this._resNodePool_label.put(node);
        } else {
            this._resNodePool_res.put(node);
        }
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
        node.on(cc.Node.EventType.TOUCH_END, () => this.onClickResDialog(type))

        let label = cc.find("label", node).getComponent(cc.Label);

        let sprite = node.getChildByName("image").getComponent(cc.Sprite);
        sprite.spriteFrame = await GlobalResources.getSpriteFrame(SpriteType.UI, this._resourceConfig[type].res.type);
        setSpriteSize(sprite, sprite.spriteFrame, 35);

        this._resDialogList[type] = {
            node: node,
            label: label,
        }

        this.updateResDialogInfo(type);
    }

    updateResDialogInfo(type: IsLandType, showScale = true) {
        let number = User.instance.getBuildRes(type).number

        this._resDialogList[type].label.string = "+" + (Math.floor(number * 10) / 10);

        showScale && this._resDialogList[type].node.runAction(cc.sequence(
            cc.scaleTo(0.07, 1.1),
            cc.scaleTo(0.07, 1),
        ));
    }

    onClickResDialog(type: IsLandType) {
        let update = User.instance.getBuildRevenue(type, this._resourceConfig[type].res.type);
        if (update) {
            this.updateResDialogInfo(type, false);
        }
    }

    async creatResAnimation(type: IsLandType, resType = null, num = 0, pInfo: { parent: cc.Node, position: cc.Vec2 } = null) {
        let parentInfo = pInfo ? pInfo : this.getParentInfo(type);
        let parent: cc.Node = parentInfo.parent;
        let pos: cc.Vec2 = parentInfo.position;

        let node = await this._creatResNode();
        node.setParent(parent);
        node.position = pos.add(cc.v2(0, -100));
        node.opacity = 0;

        let label = cc.find("label", node).getComponent(cc.Label);
        label.string = num == 0 ? "" : "+" + num;

        let sprite = node.getChildByName("image").getComponent(cc.Sprite);
        resType = resType ? resType : this._resourceConfig[type].res.type;
        sprite.spriteFrame = await GlobalResources.getSpriteFrame(SpriteType.UI, resType);
        setSpriteSize(sprite, sprite.spriteFrame, 50);

        let endCB = new VoidCallPromise();

        node.zIndex = 1200;
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

    async creatShipRes(resType: Resource = Resource.coin, number = 3, time = 6) {
        let parentInfo = this.getParentInfo(IsLandType.castle);
        let parent: cc.Node = parentInfo.parent;
        let pos: cc.Vec2 = parentInfo.position;

        let node = await this._creatResNode('res');
        node.setParent(parent);
        node.position = pos.add(cc.v2(-135, 10));
        node.opacity = 0;

        let sprite = node.getChildByName("image").getComponent(cc.Sprite);
        sprite.spriteFrame = await GlobalResources.getSpriteFrame(SpriteType.UI, resType);
        setSpriteSize(sprite, sprite.spriteFrame, 50);

        let height = 100;

        sprite.node.runAction(cc.sequence(
            cc.moveTo(0.3, cc.v2(0, height)).easing(cc.easeOut(3)),
            cc.moveTo(0.4, cc.v2(0, 0)).easing(cc.easeIn(2)),
            cc.moveTo(0.1, cc.v2(0, height * 0.1)).easing(cc.easeOut(1.5)),
            cc.moveTo(0.05, cc.v2(0, 0)).easing(cc.easeIn(1.5)),
            cc.moveTo(0.05, cc.v2(0, height * 0.05)).easing(cc.easeOut(1.5)),
            cc.moveTo(0.05, cc.v2(0, 0)).easing(cc.easeIn(1.5)),
            // cc.moveTo(0.7,cc.Vec2.ZERO).easing(cc.easeBounceOut())
        ))

        let endCP = new VoidCallPromise();
        let showLabel = () => {
            endCP.resolve();
            this.creatResAnimation(IsLandType.castle, resType, number, { parent: parent, position: node.position.add(cc.v2(0, 100)) });
        }

        node.zIndex = 1000;
        node.runAction(cc.sequence(
            cc.spawn(
                cc.fadeIn(0.05),
                cc.moveTo(1, node.position.add(cc.v2(-100 - Math.random() * 220, 100 + Math.random() * 50))).easing(cc.easeOut(1.5)),
            ),
            cc.callFunc(() => {
                node.zIndex = -node.y + 660;
                node.runAction(cc.sequence(
                    cc.delayTime(time),
                    cc.callFunc(() => {
                        this.pushResNode(node, "res");
                        showLabel();
                    })
                ))

                node.on(cc.Node.EventType.TOUCH_END, () => {

                    node.off(cc.Node.EventType.TOUCH_END);
                    node.stopAllActions();
                    this.pushResNode(node, "res");
                    showLabel();
                })
            })
        ))

        return endCP;
    }

    async onBuildLevelUp(type: IsLandType, isLandItemType: IsLandItemType) {
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
        await delay(2);
        this._resDialogList[type].node.opacity = 255;
        this._timebarList[type].node.opacity = 255;
    }

    updateResourceConfig() {

        let ResourceConfig = {
            [IsLandType.castle]: {
                res: {
                    type: Resource.coin,
                    num: getResourceNumber(IsLandType.castle, (User.instance.getBuildInfo(IsLandType.castle) as CastleInfo).ship)
                },
                pos: cc.v2(0, 0)
            },
            [IsLandType.fire]: {
                res: {
                    type: Resource.stone,
                    num: getResourceNumber(IsLandType.fire, (User.instance.getBuildInfo(IsLandType.fire) as BuildInfo).build),
                    resMax: getOfflineRevenueMax(IsLandType.fire, (User.instance.getBuildInfo(IsLandType.fire) as BuildInfo).build),
                    resLevel: (User.instance.getBuildInfo(IsLandType.fire) as BuildInfo).build
                },
                pos: cc.v2(0, 0)
            },
            [IsLandType.nature]: {
                res: {
                    type: Resource.wood,
                    num: getResourceNumber(IsLandType.nature, (User.instance.getBuildInfo(IsLandType.nature) as BuildInfo).build),
                    resMax: getOfflineRevenueMax(IsLandType.nature, (User.instance.getBuildInfo(IsLandType.nature) as BuildInfo).build),
                    resLevel: (User.instance.getBuildInfo(IsLandType.nature) as BuildInfo).build
                },
                pos: cc.v2(0, 0)
            },
            [IsLandType.snack]: {
                res: {
                    type: Resource.food,
                    num: getResourceNumber(IsLandType.snack, (User.instance.getBuildInfo(IsLandType.snack) as BuildInfo).build),
                    resMax: getOfflineRevenueMax(IsLandType.snack, (User.instance.getBuildInfo(IsLandType.snack) as BuildInfo).build),
                    resLevel: (User.instance.getBuildInfo(IsLandType.snack) as BuildInfo).build
                }
            },
            [IsLandType.water]: {
                res: {
                    type: Resource.coin,
                    num: getResourceNumber(IsLandType.water, (User.instance.getBuildInfo(IsLandType.water) as BuildInfo).build),
                    resMax: getOfflineRevenueMax(IsLandType.water, (User.instance.getBuildInfo(IsLandType.water) as BuildInfo).build),
                    resLevel: (User.instance.getBuildInfo(IsLandType.water) as BuildInfo).build
                }
            }
        }
        return ResourceConfig;
    }


}

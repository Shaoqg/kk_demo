import { ElementType, IsLandType, IslandItemConfig, IsLandItemType, CastleInfo, BuildInfo, getPetConfigById, elementTypeToIslandType } from "../../Config";
import User from "../User";
import { delay } from "../../kk/DataUtils";
import IslandVisualsHelper from "./IslandVisualsHelper";


export default class IslandManager {

    private static _instance: IslandManager = null;
    static get instance() {
        if (!IslandManager._instance) {
            IslandManager._instance = new IslandManager();
        }
        return this._instance;
    }

    private constructor() { }

    _init = false;
    init() {
        if (this._init) {
            return;
        }
        this._init = true;

        //init island
        let islandList = {
            [IsLandType.fire]: this.getNodeByType(IsLandType.fire),
            [IsLandType.nature]: this.getNodeByType(IsLandType.nature),
            [IsLandType.snack]: this.getNodeByType(IsLandType.snack),
            [IsLandType.water]: this.getNodeByType(IsLandType.water),
            [IsLandType.castle]: this.getNodeByType(IsLandType.castle)
        }

        for (const key in islandList) {
            this.initIslandBuildState(key as IsLandType, islandList[key]);
        }

        this.shipAnimation();

    }

    initIslandBuildState(type: IsLandType, node: cc.Node) {
        let buildInfo = User.instance.getBuildInfo(type);
        if (buildInfo) {
            let islandItems = IslandItemConfig[type];
            islandItems.forEach((itemType) => {
                this.upgradeIslandeBuild(type, itemType);

            })
        } else {
            //TODO  lock
        }
    }

    async upgradeIslandeBuild(type: IsLandType, name: IsLandItemType, playAnimatio = false) {
        let node = this.getNodeByType(type);
        let island = cc.find("island/mapblocks/" + name, node);
        if (!island) {
            return;
        }

        let nodes: cc.Node[] = island.children.filter((node)=>node.name.includes("level"));

        if (playAnimatio) {
            this.moveToIsland(0, type);
            await delay(0.6);
            // play animation
            let islandBuildNode = cc.find("island/mapblocks/" + name, node);
            islandBuildNode && (await IslandVisualsHelper.runUpgradeAnim(islandBuildNode));
        }

        let buildInfo = User.instance.getBuildInfo(type) as CastleInfo | BuildInfo;
        nodes.forEach((node, index) => {
            if (type == IsLandType.nature && name == IsLandItemType.wonder) {
                node.active = index <= buildInfo[IsLandItemType.wonder] - 1;
            } else {
                node.active = index == buildInfo[name] - 1;
            }
        });

        if (buildInfo[name] > nodes.length) {
            nodes[nodes.length - 1].active = true;
        }

    }

    getCurrentIsland() {
        return this.islands[this.currentIslandIndex];
    }

    private currentIslandIndex = 2;
    private islands = [IsLandType.fire, IsLandType.nature, IsLandType.castle, IsLandType.snack, IsLandType.water]
    moveToIsland(dir: -1 | 1 | 0, name?: IsLandType) {

        let islandParent = cc.find("Canvas/world/island");
        if (name) {
            this.islands.forEach((island, index) => {
                if (island == name) {
                    this.currentIslandIndex = index;
                    dir = 0;
                }
            })
        } else if (this.currentIslandIndex + dir >= 0 && this.currentIslandIndex + dir <= this.islands.length - 1) {
            this.currentIslandIndex += dir;
            name = this.islands[this.currentIslandIndex];

        } else {
            return;
        }

        let node = this.getNodeByType(name);
        islandParent.stopAllActions();
        islandParent.runAction(cc.moveTo(0.5, cc.v2(-node.x, islandParent.y)));
    }

    _nodes = {
        [IsLandType.fire]: null,
        [IsLandType.nature]: null,
        [IsLandType.snack]: null,
        [IsLandType.water]: null,
        [IsLandType.castle]: null,
    }
    getNodeByType(type: IsLandType) {
        if (!this._nodes[type]) {
            let islandPath = {
                [IsLandType.fire]: 'Canvas/world/island/fireNode',
                [IsLandType.nature]: 'Canvas/world/island/natureNode',
                [IsLandType.snack]: 'Canvas/world/island/snackNode',
                [IsLandType.water]: 'Canvas/world/island/waterNode',
                [IsLandType.castle]: 'Canvas/world/island/castleNode',
            }
            this._nodes[type] = cc.find(islandPath[type]);
        }

        return this._nodes[type] as cc.Node;
    }

    getIslandTypeByPetId(petId: string) {
        let config = getPetConfigById(petId);
        let islandType: IsLandType = null;
        if (config.elements instanceof Array) {
            islandType = elementTypeToIslandType(config.elements[0]);
        } else {
            islandType = elementTypeToIslandType(config.elements as ElementType);
        }
        return islandType;
    }
    
    async shipAnimation() {
        let ship = cc.find("island/mapblocks/ship",  this.getNodeByType(IsLandType.castle));
        
        ship.runAction(cc.repeatForever(
            cc.sequence(
                cc.moveBy(1.2, 0, 8).easing(cc.easeInOut(1.2)),
                cc.moveBy(1.2, 0, -8).easing(cc.easeInOut(1.2))
            )));
    }
}

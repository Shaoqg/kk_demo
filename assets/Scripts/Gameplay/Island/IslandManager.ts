import { ElementType, IsLandType } from "../../Config";
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
            [ElementType.fire]: this.getNodeByType(ElementType.fire),
            [ElementType.nature]: this.getNodeByType(ElementType.nature),
            [ElementType.snack]: this.getNodeByType(ElementType.snack),
            [ElementType.water]: this.getNodeByType(ElementType.water)
        }

        for (const key in islandList) {
            this.initIslandBuildState(key as ElementType, islandList[key]);
        }

    }

    initIslandBuildState(type: ElementType, node: cc.Node) {
        let buildInfo = User.instance.getBuildInfo(type);
        if (buildInfo) {
            this.upgradeIslandeBuild(type, "wonder");
            this.upgradeIslandeBuild(type, "build");
        } else {
            //TODO  lock
        }
    }

    async upgradeIslandeBuild(type: ElementType, name: "wonder" | "build", playAnimatio = false) {
        let node = this.getNodeByType(type);
        let nodes: cc.Node[] = cc.find("island/mapblocks/" + name, node).children;

        if (playAnimatio) {
            this.moveToIsland(0, type);
            await delay(0.6);
            // play animation
            let  islandBuildNode = cc.find("island/mapblocks/" + name, node);
            islandBuildNode &&(await IslandVisualsHelper.runUpgradeAnim(islandBuildNode)) ;
        }
        
        let buildInfo = User.instance.getBuildInfo(type);
        nodes.forEach((node, index) => {
            if (type == ElementType.nature && name == "wonder") {
                node.active = index <= buildInfo.wonder - 1;
            } else {
                node.active = index == buildInfo[name] - 1;
            }
        });

        if (buildInfo[name] > nodes.length) {
            nodes[nodes.length -1].active = true;
        }

    }

    getCurrentIsland() {
        return this.islands[this.currentIslandIndex];
    }

    private currentIslandIndex = 2;
    private islands = [IsLandType.fire, IsLandType.nature, IsLandType.castle, IsLandType.snack, IsLandType.water]
    moveToIsland(dir: -1 | 1 | 0, name?: string) {

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

    getNodeByType(type: ElementType | string) {
        let islandPath = {
            [ElementType.fire]: 'Canvas/world/island/fireNode',
            [ElementType.nature]: 'Canvas/world/island/natureNode',
            [ElementType.snack]: 'Canvas/world/island/snackNode',
            [ElementType.water]: 'Canvas/world/island/waterNode',
            "castle": 'Canvas/world/island/islandNode',
        }

        return cc.find(islandPath[type]);
    }
}

import GlobalResources from "../../Util/GlobalResource";

export default class IslandVisualsHelper {

    static async runUpgradeAnim(blockToUpgrade: cc.Node) {
        let shakeOffset = blockToUpgrade.width * 0.03;

        let level = parseInt(blockToUpgrade.children.find((ch) => ch.active && ch.name.indexOf("level") > -1).name.split("level")[1]);
        let effectArea: cc.Rect = this.getEffectArea(blockToUpgrade, level);

        let dust = await this.createDustAnimNodes(blockToUpgrade, effectArea);
        let tools = await this.createToolAnimNode(blockToUpgrade, effectArea);

        //this.soundFx.StartJob();

        let executor = (res, rej) => {
            let seq = cc.sequence(
                cc.moveTo(0.075, blockToUpgrade.position.add(new cc.Vec2(-shakeOffset, 0))),
                cc.moveTo(0.15, blockToUpgrade.position.add(new cc.Vec2(shakeOffset, 0))),
                cc.moveTo(0.15, blockToUpgrade.position.add(new cc.Vec2(-shakeOffset, 0))),
                cc.moveTo(0.15, blockToUpgrade.position.add(new cc.Vec2(shakeOffset, 0))),
                cc.moveTo(0.15, blockToUpgrade.position.add(new cc.Vec2(-shakeOffset, 0))),
                cc.moveTo(0.15, blockToUpgrade.position.add(new cc.Vec2(shakeOffset, 0))),
                cc.moveTo(0.15, blockToUpgrade.position.add(new cc.Vec2(-shakeOffset, 0))),
                cc.moveTo(0.15, blockToUpgrade.position.add(new cc.Vec2(shakeOffset, 0))),
                cc.moveTo(0.075, blockToUpgrade.position),
                cc.callFunc(() => {
                    tools.destroy();
                    setTimeout(() => dust.forEach((cloud) => cloud.destroy()), 500);
                    res();
                }),
                cc.scaleTo(0.2, 1, 1.5).easing(cc.easeBackOut()),
                cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()),
            );

            blockToUpgrade.runAction(seq);
        }

        return new Promise(executor);
    }

    static getEffectArea(block: cc.Node, level: number): cc.Rect {
        let blockForLevel = block.getChildByName(`level${level}`);
        let area = new cc.Rect();

        if(blockForLevel) {
            let objectsInLevel: cc.Node[] = blockForLevel.children;

            objectsInLevel.forEach((object) => {
                if(!object.active) {
                    return;
                }
                area.xMin = Math.min(area.xMin, object.x - object.width/2);
                area.xMax = Math.max(area.xMax, object.x + object.width/2);
                area.yMin = Math.min(area.yMin, object.y - object.height/2);
                area.yMax = Math.max(area.yMax, object.y + object.height/2);
            })

            return area;
        }

        return area;
    }

    static async createDustAnimNodes(node: cc.Node, effectArea: cc.Rect): Promise<cc.Node[]> {
        let animNodes: cc.Node[] = [];
        let width = effectArea.width;
        let height = effectArea.height;
        let baseScale = 1;
        let cloudNumber = 2;
        let overlayEffectNode = node;

        if (width + height < 120) {
            baseScale = 0.7;
            cloudNumber = 2
        } else if (width + height < 200) {
            baseScale = 0.7;
            cloudNumber = 2;
        } else if (width + height < 280) {
            baseScale = 0.7;
            cloudNumber = 3;
        } else if(width + height > 500){
            baseScale = 1;
            cloudNumber = 10;
        }else{
            baseScale = 0.7;
            cloudNumber = 6;
        }
        for (let i = 0; i < cloudNumber; i++) {
            setTimeout(async () => {
                let prefab = await GlobalResources.getPrefab("fx/cloudDust");
                let cloud: cc.Node = cc.instantiate(prefab);

                cloud.setParent(overlayEffectNode);

                let cloudx = (width * 0.4) - (Math.random() * (width * 0.8));
                let cloudy = (height * 0.4) - (Math.random() * (height * 0.8));
                cloud.setPosition(effectArea.center.add(new cc.Vec2(cloudx, cloudy)));
                cloud.scale = baseScale + Math.random() * baseScale;
                let state = cloud.getComponent(cc.Animation).play();
                state.repeatCount = 3;

                animNodes.push(cloud);
            }, i * 150);
        }

        return animNodes;
    }
    
    static async createToolAnimNode(node: cc.Node, effectArea: cc.Rect): Promise<cc.Node> {
        let centerOfBlock = effectArea.center;
        let prefab = await GlobalResources.getPrefab("fx/tools");
        let tools: cc.Node = cc.instantiate(prefab);
        tools.setParent(node);
        let hammer = cc.find("hammer/constructionHammer", tools);
        hammer.getParent().setPosition(centerOfBlock.add(cc.v2(90, effectArea.height/6)));
        let saw = cc.find("saw/constructionSaw", tools)
        saw.getParent().setPosition(centerOfBlock.add(cc.v2(-80, -effectArea.height/6)));

        let hammerAnim = hammer.getComponent(cc.Animation).play("constructionHammer", Math.random() * 0.5)
        let sawAnim = saw.getComponent(cc.Animation).play("constructionSaw", Math.random() * 0.5)
        tools.zIndex = node.zIndex + 1;

        hammerAnim.speed = 2;
        sawAnim.speed = 2;

        let shiftInterval = setInterval(() => {
            if(!hammer.getParent() || !saw.getParent()) {
                clearInterval(shiftInterval);
                return;
            }
            hammer.getParent().setPosition(centerOfBlock.add(cc.v2(90, -1 * Math.random() * effectArea.height/5)));
            saw.getParent().setPosition(centerOfBlock.add(cc.v2(-80, Math.random() * effectArea.height/5)));
        }, 500)

        return tools;
    }

    


}

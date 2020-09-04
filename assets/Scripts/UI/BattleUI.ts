import { PetData, getPetConfigById } from "../Config";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";


export default class BattleUI {

    static _instance: BattleUI = null;
    static get instance() {
        if (!BattleUI._instance) {
            BattleUI._instance = new BattleUI();
        }

        return BattleUI._instance;
    }

    node: cc.Node = null;

    progressBG: cc.Node = null;
    checkNode: cc.Node = null;

    skillCB: (petData: PetData) => {} = null;

    skillInfo: {
        [name: string]: {
            totalCD: number,
            curCD: number,
            petData: PetData,
            progressSprite: cc.Sprite
        }
    } = {}

    constructor() {
        this.init();
    }

    init() {
        this.node = cc.find("Canvas/DialogRoot/BattleUI");

        this.progressBG = cc.find("progress/progressBG", this.node);
        this.checkNode = cc.find("progress/checkNode", this.node);

        this.checkNode.children.forEach((children) => {
            children.active = false
        });
        this.progressBG.children.forEach((children) => {
            children.getComponent(cc.Sprite).fillRange = 0;
        });

        let node = cc.find("skillNode", this.node);
        node.children.forEach((node: cc.Node) => {
            node.off(cc.Node.EventType.TOUCH_END);
            node.on(cc.Node.EventType.TOUCH_END, () => {
                this.onclick(node.name);
            })
        })
    }

    showUI(bool: boolean) {
        this.node.active = bool;
        if (bool) {
            let select = cc.find("progress/select", this.node);
            select.stopAllActions();
            select.runAction(cc.sequence(
                cc.scaleTo(0.8, 1.1),
                cc.scaleTo(0.8, 1)
            ).repeatForever())
        } else {
            this.checkNode.children.forEach((children) => {
                children.active = false
            });
            this.progressBG.children.forEach((children) => {
                children.getComponent(cc.Sprite).fillRange = 0;
            });
        }
    }

    updateProgress(num: number, progress: number) {

        this.progressBG.children[num].getComponent(cc.Sprite).fillRange = progress;

        if (progress >= 1) {
            this.checkNode.children[num].active = true;
        }
    }

    setOnclickCB(petDatas: PetData[], cb: (petData: PetData) => {}) {
        this.skillCB = cb;
        let node = cc.find("skillNode", this.node);
        node.children.forEach((node: cc.Node, index) => {

            let config = getPetConfigById(petDatas[index].petId);
            let sprite = cc.find("image", node).getComponent(cc.Sprite);
            GlobalResources.getSpriteFrame(SpriteType.Pet, config.art_asset, (sf) => {
                sprite.spriteFrame = sf;
            });
            this.skillInfo[node.name] = { curCD: 0, totalCD: 5, petData: petDatas[index], progressSprite: cc.find("bg_cd", node).getComponent(cc.Sprite) };
        });

    }

    update(dt) {
        for (const key in this.skillInfo) {
            if (this.skillInfo[key].curCD > 0) {
                this.skillInfo[key].curCD -= dt;
                let progress = this.skillInfo[key].curCD / this.skillInfo[key].totalCD;
                this.skillInfo[key].progressSprite.fillRange = progress > 0 ? progress : 0;
                if (progress <=0) {
                    this.skillInfo[key].progressSprite.node.active = false;
                }
            }
        }
    }

    onclick(name: string) {
        let info = this.skillInfo[name];
        if (!info) {
            return;
        }
        if (this.skillInfo[name].curCD <= 0) {
            this.skillInfo[name].curCD = this.skillInfo[name].totalCD;
            this.skillCB(this.skillInfo[name].petData);
            this.skillInfo[name].progressSprite.node.active = true;
        }
    }

    onEnd() {
        this.showUI(false);
    }

}

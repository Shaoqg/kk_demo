import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
const { ccclass, property } = cc._decorator;

@ccclass
export class ShipUpgrade extends ViewConnector {

    static prefabPath = 'Prefab/ShipUpgrade';

    static _instance: ShipUpgrade = null;

    root: cc.Node = null;
    rewarditem: cc.Node;


    shipParts = ["speed", "capacity", "bouns"];
    shipLevel: number = 1;
    mastLevel: number = 1;
    capacityLevel: number = 1;
    bounsLevel: number = 1;
    speeds: number[] = [24, 30, 42];
    capacitys: number[] = [5, 6, 7];
    bounss: number[] = [10, 50, 200];

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = ShipUpgrade._instance = await this.loadView<ShipUpgrade>(parentNode, ShipUpgrade);

        vc.applyData();

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    static close() {
        if (this._instance) {
            this._instance.close({});
            this._instance.destroy();
            this._instance = undefined;
        }
    }

    applyData() {

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        this.getShipInfo("speed").string = "Speed：" + this.speeds[this.mastLevel - 1] + "kn"
        this.getShipInfo("capacity").string = "Capacity：0/" + this.capacitys[this.capacityLevel - 1];
        this.getShipInfo("bouns").string = "Bouns：+" + this.bounss[this.bounsLevel - 1] + "%"
        this.updateShipLevel();

        this.shipParts.forEach((part, idx) => {
            let upgrade = cc.find("partsOnShip/shipPart" + (idx+1) + "/goal", this.root);
            let isMax=this.checkMaxLevel(part, upgrade);
            this.updatePartBonus(part,idx+1,isMax);
            
            upgrade.on(cc.Node.EventType.TOUCH_END, () => {
                this.updateShipPart(part);
                let isMax=this.checkMaxLevel(part, upgrade);
                this.updatePartBonus(part,idx+1,isMax);
            });
        });



        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        //this.adjustGameInterface();
    }

    updateShipLevel() {
        this.shipLevel = this.mastLevel + this.capacityLevel + this.bounsLevel;
        this.getShipInfo("level").string = "Level：" + this.shipLevel.toString();
    }

    updateShipPart(part: string) {
        switch (part) {
            case "speed":
                this.mastLevel++;
                this.getShipInfo("speed").string = "Speed：" + this.speeds[this.mastLevel - 1] + "kn"
                break;
            case "capacity":
                this.capacityLevel++;
                this.getShipInfo("capacity").string = "Capacity：0/" + this.capacitys[this.capacityLevel - 1];
                break;
            case "bouns":
                this.bounsLevel++;
                this.getShipInfo("bouns").string = "Bouns：+" + this.bounss[this.bounsLevel - 1] + "%"
                break;
        }
        this.updateShipLevel();
    }

    checkMaxLevel(part: string, upgrade: cc.Node) {
        switch (part) {
            case "speed":
                if (this.mastLevel >= this.speeds.length) {
                    upgrade.active = false;
                    return true;
                }
                break;
            case "capacity":
                if (this.capacityLevel >= this.capacitys.length) {
                    upgrade.active = false;
                    return true;
                }
                break;
            case "bouns":
                if (this.bounsLevel >= this.bounss.length) {
                    upgrade.active = false;
                    return true;
                }
                break;
        }
        return false;
    }

    updatePartBonus(part: string,idx:number,isMax:boolean){
        let bonusLabel = cc.find("partsOnShip/shipPart" + idx + "/bonus", this.root).getComponent(cc.Label);
        if(isMax){
            bonusLabel.string="Reached the highest level";
            return;
        }
        switch (part) {
            case "speed":
                bonusLabel.string="Speed+"+(this.speeds[this.mastLevel]-this.speeds[this.mastLevel - 1])+"kn";
                break;
            case "capacity":
                bonusLabel.string="Capacity+"+(this.capacitys[this.capacityLevel]-this.capacitys[this.capacityLevel - 1]);
                break;
            case "bouns":
                bonusLabel.string="Reward gain+"+(this.bounss[this.bounsLevel]-this.bounss[this.bounsLevel - 1])+"%";
                break;
        }
    }

    getShipInfo(path: string) {
        return cc.find("shipInfo/" + path, this.root).getComponent(cc.Label);
    }


    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}
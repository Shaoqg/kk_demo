import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import User from "../Gameplay/User";
import WorldManager from "../Gameplay/WorldManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { speeds, capacitys, bounss, speedLevelUpInfo, capacityLevelUpInfo, bounsLevelUpInfo } from "../Config";
const { ccclass, property } = cc._decorator;

@ccclass
export class ShipUpgrade extends ViewConnector {

    static prefabPath = 'Prefab/ShipUpgrade';

    static _instance: ShipUpgrade = null;

    root: cc.Node = null;
    rewarditem: cc.Node;


    shipParts = ["speed", "capacity", "bouns"];
    speeds: number[] ;
    capacitys: number[];
    bounss: number[];

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

        this.speeds = speeds;
        this.capacitys = capacitys;
        this.bounss = bounss;

        this.getShipInfo("speed").string = "Speed：" + this.speeds[User.instance.ship_speed_level] + "kn"
        this.getShipInfo("capacity").string = "Capacity：0/" + this.capacitys[User.instance.ship_capacity_level];
        this.getShipInfo("bouns").string = "Bouns：+" + this.bounss[User.instance.ship_bouns_level] + "%"
        this.updateShipLevel();

        this.shipParts.forEach((part, idx) => {
            let upgrade = cc.find("partsOnShip/shipPart" + (idx+1) + "/goal", this.root);
            let isMax=this.checkMaxLevel(part, upgrade);
            this.updatePartBonus(part,idx+1,isMax);
            this.updatePartNeeded(part,idx+1,isMax)
            this.showFinishLabel(idx+1,isMax);
            if(!this.checkResource(part)){
                this.showDisableButton(idx+1,isMax,true)
            }
            upgrade.on(cc.Node.EventType.TOUCH_END, () => {
                this.updateShipPart(part);
                let isMax=this.checkMaxLevel(part, upgrade);
                if(!this.checkResource(part)){
                    this.showDisableButton(idx+1,isMax,true)
                }
                this.updatePartBonus(part,idx+1,isMax);
                this.updatePartNeeded(part,idx+1,isMax)
                this.showFinishLabel(idx+1,isMax);
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

    showDisableButton(idx:number,isMax:boolean,isShow:boolean) {
        let btn = cc.find("partsOnShip/shipPart" + idx + "/goal_gry", this.root);
        if(isMax){
            btn.active=false;
            return;
        }
        btn.active=isShow;
    }

    updatePartNeeded(part: string, idx: number, isMax: boolean) {
        let resource = cc.find("partsOnShip/shipPart" + idx + "/resource", this.root);
        if(isMax){
            resource.active=false;
            return;
        }
        let upgradeInfo;
        switch(part){
            case "speed":
                upgradeInfo = speedLevelUpInfo[User.instance.ship_speed_level];
                break;
            case "capacity":
                upgradeInfo = capacityLevelUpInfo[User.instance.ship_capacity_level];
                break;
            case "bouns":
                upgradeInfo = bounsLevelUpInfo[User.instance.ship_bouns_level];
                break;
        }
      
       if(upgradeInfo.coin){
        let coin=resource.getChildByName("coin");
        coin.active=true;
        coin.getChildByName("need").getComponent(cc.Label).string="x"+upgradeInfo.coin.toString();
       }
       if(upgradeInfo.wood){
        let wood=resource.getChildByName("wood");
        wood.active=true;
        wood.getChildByName("need").getComponent(cc.Label).string="x"+upgradeInfo.wood.toString();
       }
       if(upgradeInfo.stone){
        let stone=resource.getChildByName("stone");
        stone.active=true;
        stone.getChildByName("need").getComponent(cc.Label).string="x"+upgradeInfo.stone.toString();
       }
       
    }
    showFinishLabel(idx: number, isMax: boolean) {
        if(isMax){
            let finishLabel = cc.find("partsOnShip/shipPart" + idx + "/finishLabel", this.root);
            finishLabel.active = true;
        }
    }

    updateShipLevel() {
        User.instance.level_ship = User.instance.ship_speed_level + User.instance.ship_capacity_level + User.instance.ship_bouns_level + 1 ;
        this.getShipInfo("level").string = "Level：" + User.instance.level_ship.toString();
    }

    updateShipPart(part: string) {
        let cost = this.checkResource(part);
        if (cost) {
            User.instance.coin -= cost.coin;
            User.instance.wood -= cost.wood;
            User.instance.stone -= cost.stone;
        } else {
            return;
        }
        switch (part) {
            case "speed":
                User.instance.ship_speed_level++;
                this.getShipInfo("speed").string = "Speed：" + this.speeds[User.instance.ship_speed_level] + "kn"
                break;
            case "capacity":
                User.instance.ship_capacity_level++;
                this.getShipInfo("capacity").string = "Capacity：0/" + this.capacitys[User.instance.ship_capacity_level];
                break;
            case "bouns":
                User.instance.ship_bouns_level++;
                this.getShipInfo("bouns").string = "Bouns：+" + this.bounss[User.instance.ship_bouns_level] + "%"
                break;
        }
        this.updateShipLevel();
        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);
        EventEmitter.emitEvent(EventType.STAR_INCREASE);
    }

    checkMaxLevel(part: string, upgrade: cc.Node) {
        switch (part) {
            case "speed":
                if (User.instance.ship_speed_level >= this.speeds.length-1) {
                    upgrade.active = false;
                    return true;
                }
                break;
            case "capacity":
                if (User.instance.ship_capacity_level >= this.capacitys.length-1) {
                    upgrade.active = false;
                    return true;
                }
                break;
            case "bouns":
                if (User.instance.ship_bouns_level >= this.bounss.length-1) {
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
            bonusLabel.node.active=false;
            return;
        }
        switch (part) {
            case "speed":
                bonusLabel.string="Speed+"+(this.speeds[User.instance.ship_speed_level+1]-this.speeds[User.instance.ship_speed_level])+"kn";
                break;
            case "capacity":
                bonusLabel.string="Capacity+"+(this.capacitys[User.instance.ship_capacity_level+1]-this.capacitys[User.instance.ship_capacity_level]);
                break;
            case "bouns":
                bonusLabel.string="Reward gain+"+(this.bounss[User.instance.ship_bouns_level+1]-this.bounss[User.instance.ship_bouns_level])+"%";
                break;
        }
    }

    checkResource(part:string){
        let upgradeInfo;
        switch(part){
            case "speed":
                upgradeInfo = speedLevelUpInfo[User.instance.ship_speed_level];
                break;
            case "capacity":
                upgradeInfo = capacityLevelUpInfo[User.instance.ship_capacity_level];
                break;
            case "bouns":
                upgradeInfo = bounsLevelUpInfo[User.instance.ship_bouns_level];
                break;
        }
        let cout=0;
        if(!upgradeInfo){
            return false;
        }
        if (upgradeInfo.coin) {
            if(User.instance.coin < upgradeInfo.coin){
                cout++;
            }
        }
        if (upgradeInfo.wood) {
            if(User.instance.wood < upgradeInfo.wood){
                cout++;
            }
        }
        if (upgradeInfo.stone) {
            if(User.instance.stone < upgradeInfo.stone){
                cout++;
            }
        }

        if(cout>0){
            return false;
        }else{
            return {coin:upgradeInfo.coin?upgradeInfo.coin:0,wood:upgradeInfo.wood?upgradeInfo.wood:0,stone:upgradeInfo.stone?upgradeInfo.stone:0};
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
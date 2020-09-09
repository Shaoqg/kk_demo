import User from "./User";
import { StateManager } from "./State/StateManager";
import { Adventure } from "../Screens/Adventure";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { AdventureArea } from "../Screens/AdventureArea";
import { TreeUpgrade } from "../Screens/TreeUpgrade";
import { Trees, AdventureAreas } from "../Config";
import { GardenPets } from "../Pet/GardenPets";
import ScreenSize from "../Tools/ScreenSize";
import { DebugScreen } from "../Screens/DebugScreen";
import { KKLoader } from "../Util/KKLoader";
import ShipObject from "../Tools/ShipObject";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WorldManager extends cc.Component {



    btn_ship:cc.Node = null;
    selectButton_ship:cc.Node = null;
    btn_levelup:cc.Node = null;
    btn_adventure:cc.Node = null;
    btn_barn: cc.Node = null;
    coin_label: cc.Node;
    star_label: cc.Node;
    woodNode: cc.Node;
    stoneNode: cc.Node;
    foodNode: cc.Node;
    magicStoneNode: cc.Node;
    btn_dailay: cc.Node;
    btn_tree1: cc.Node;
    btn_tree2: cc.Node;
    btn_tree3: cc.Node;
    btn_rotary: any;
    islandPos: number;
    btn_shop: cc.Node;
    battleIsOpen: boolean=false;
    isCap: boolean = false;
    updateTime: number = 0;
    shipDock: cc.Node;

    onLoad() {
    }

    start(){
        StateManager.instance.changeState("IslandState");
        this.init();
        this.initCastle();
        this.initTrees();
        GardenPets.setIslandPets();
        this.setship();

        //debug
        this.setDebugEvents()

        this.adjustGameInterface();

        // this.checkCaptureReward();

        EventEmitter.subscribeTo(EventType.LEVEL_UP_CASTLE, this.onLevelUp.bind(this));
        EventEmitter.subscribeTo(EventType.LEVEL_UP_TREE, this.onTreeLevelUp.bind(this));
        EventEmitter.subscribeTo(EventType.GO_CAPTURE, this.checkCaptureReward.bind(this));
        
        EventEmitter.emitEvent(EventType.CHECK_AREA_COMPELETE);
    }

    init() {

        let worldNode = cc.find("world", this.node);

        this.shipDock = cc.find("world/island/islandNode/shipDock",this.node);

    }

    initCastle() {
        let level = User.instance.level_castle;

        let castleNodes = cc.find("world/island/islandNode/island/mapblocks/build", this.node);
        castleNodes.children.forEach((node, i)=>{
            node.active = (i == level-1);
            if (level-1 > castleNodes.children.length - 1) {
                node.active = true;
            }
        })
    }

    initTrees() {

    }

    onclickShip() {
        this.switchShipState(true);
        setTimeout(()=>{
            this.switchShipState(false);
        }, 2000)
    }

    switchShipState(openSelect = true){
        // this.selectButton_ship.active = openSelect;
        // this.btn_ship.active= !openSelect;
    }

    onLevelUp(){
        this.initCastle();
        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);

    }

    onTreeLevelUp(){
        this.initTrees();
        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);

    }

    onclickTree(){
        TreeUpgrade.prompt();
    }

    adjustGameInterface() {
        // let scale = ScreenSize.getScale(1, 0.8);
        // this.node.scale = scale;
    }

     setDebugEvents() {
        let cavnasNode = cc.find("Canvas", cc.director.getScene());
        cavnasNode.on(cc.Node.EventType.TOUCH_MOVE, this.showDebugMenu, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.showDebugMenu, this);
    }

     showDebugMenu(event) {
         
        let boolean1 = event._touches ? true : false;
        let boolean2 = event.keyCode ? true : false;

        if ((boolean1 ? event._touches.length >= 3 : false) || (boolean2 ? event.keyCode === cc.macro.KEY.space : false)) {
            if(!DebugScreen.isShowing) {
                DebugScreen.prompt();
            }
        }
    }

    checkCaptureReward() {
        let time = 0;
        this.isCap=User.instance.areaCapture["unknow"];
        
        if (User.instance.areaCaptureStopTime["unknow"] != 0) {
            time = Math.floor((User.instance.areaCaptureStopTime["unknow"] - User.instance.areaCaptureTimeTakenReward["unknow"]) / 1000 / 60);
            this.isCap=false
            User.instance.wood += 5 * time
            User.instance.stone += 15 * time
            User.instance.food += 10 * time
            User.instance.areaCaptureTimeTakenReward["unknow"] = User.instance.areaCaptureStopTime["unknow"];
        }else{
            this.isCap=User.instance.areaCapture["unknow"];
            time = Math.floor((Date.now() - User.instance.areaCaptureTimeTakenReward["unknow"]) / 1000 / 60);
            if(this.isCap&&time > 0){
                User.instance.wood += 5 * time
                User.instance.stone += 15 * time
                User.instance.food += 10 * time
                User.instance.areaCaptureTimeTakenReward["unknow"] = Date.now();
                User.instance.saveUse();
            }
        }
        console.log(time,this.isCap);

        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);
    }

    async setship() {
        let shipPrefeb = await KKLoader.loadPrefab("Prefab/ShipObject");
        let shipNode = cc.instantiate(shipPrefeb);
        this.shipDock.addChild(shipNode)
    }

    update(dt) {
        StateManager.instance.update(dt);

        if (!this.isCap) {
            return;
        }
        this.updateTime += dt;
        if (this.updateTime >= 60) {
            this.updateTime -= 60;
            this.checkCaptureReward();
        }
    }
}

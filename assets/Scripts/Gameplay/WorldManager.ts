import User from "./User";
import { CastleScreen } from "../Screens/CastleScreen";
import { StateManager } from "./State/StateManager";
import { ShipUpgrade } from "../Screens/ShipUpgrade";
import { Strike } from "../Screens/Strike";
import { EventEmitter, EventType } from "../Tools/EventEmitter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WorldManager extends cc.Component {



    btn_ship:cc.Node = null;
    selectButton_ship:cc.Node = null;
    btn_levelup:cc.Node = null;
    btn_adventure:cc.Node = null;



    onLoad() {
        StateManager.instance.changeState("IslandState");

        this.init();
        this.initCastle();

        EventEmitter.subscribeTo(EventType.LEVEL_UP_CASTLE, this.onLevelUp.bind(this));
    }

    init() {

        let worldNode = cc.find("world", this.node);
        let btn_build = cc.find("island/islandUI/islandNode/island/mapblocks/btn_build", worldNode);
        btn_build.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickCastle();
        })

        this.btn_ship = cc.find("shipDock/btn_ship", worldNode);
        this.btn_ship.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickShip();
        })

        this.selectButton_ship = cc.find("shipDock/selectButton", worldNode);
        this.btn_levelup = cc.find("btn_levelup", this.selectButton_ship);
        this.btn_levelup.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclicLevelup();
        })

        this.btn_adventure = cc.find("btn_adventure", this.selectButton_ship)
        this.btn_adventure.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickAdventure();
        })
    }

    initCastle() {
        let level = User.instance.level_castle;

        let castleNodes = cc.find("world/island/islandUI/islandNode/island/mapblocks/build", this.node);
        castleNodes.children.forEach((node, i)=>{
                node.active = (i == level-1);
        })
    }

    onclickCastle() {
        StateManager.instance.changeState("CastleState");
    }

    onclickShip() {
        this.switchShipState(true);
        setTimeout(()=>{
            this.switchShipState(false);
        }, 2000)
    }

    switchShipState(openSelect = true){
        this.selectButton_ship.active = openSelect;
        this.btn_ship.active= !openSelect;
    }

    onclicLevelup(){
        this.switchShipState(false);
        ShipUpgrade.prompt();
    }

    onclickAdventure() {
        this.switchShipState(false);
        Strike.prompt();
    }


    onLevelUp(){
        this.initCastle();
    }

}

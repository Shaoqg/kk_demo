import User from "./User";
import { StateManager } from "./State/StateManager";
import { Adventure } from "../Screens/Adventure";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { AdventureArea } from "../Screens/AdventureArea";
import { TreeUpgrade } from "../Screens/TreeUpgrade";
import { Trees, AdventureAreas } from "../Config";
import { PetFactory } from "../Pet/PetFactory";
import ScreenSize from "../Tools/ScreenSize";
import { DebugScreen } from "../Screens/DebugScreen";
import ResourceManager from "./ResourcerManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WorldManager extends cc.Component {



    isCap: boolean = false;
    updateTime: number = 0;
    shipDock: cc.Node;

    onLoad() {
    }

    start(){
        StateManager.instance.changeState("IslandState");
        this.init();
        PetFactory.setIslandPets();

        //debug
        this.setDebugEvents()

        this.adjustGameInterface();

        // this.checkCaptureReward();

        EventEmitter.subscribeTo(EventType.GO_CAPTURE, this.checkCaptureReward.bind(this));
        
        EventEmitter.emitEvent(EventType.CHECK_AREA_COMPELETE);
    }

    init() {

        let worldNode = cc.find("world", this.node);

        this.shipDock = cc.find("world/island/islandNode/shipDock",this.node);

        this.addComponent(ResourceManager);

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

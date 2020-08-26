import StoreScreen from "./StoreScreen";
import User from "../Gameplay/User";
import ResourcePointScreen from "../Screens/ResourcePointScreen";
import { SelectPet } from "../Screens/SelectPet";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { Wander } from "../Pet/Wander";
import { KKLoader } from "../Util/KKLoader";
import { PetType, PetData, getPetConfigById } from "../Config";
import { PetObject } from "../Pet/PetObject";
import WorldManager from "../Gameplay/WorldManager";
import { GardenPets } from "../Pet/GardenPets";
import { ShipUpgrade } from "../Screens/ShipUpgrade";
import StickerbookScreen from "./StickerbookScreen";
import { StateManager } from "../Gameplay/State/StateManager";
import { Adventure } from "../Screens/Adventure";
import { AdventureArea } from "../Screens/AdventureArea";
import ScreenSize from "../Tools/ScreenSize";


const {ccclass, property} = cc._decorator;

@ccclass
export default class UIManager extends cc.Component {


    btn_barn:cc.Node = null;
    btn_dailay:cc.Node = null;
    btn_shop:cc.Node = null;
    btn_battle:cc.Node = null;
    btn_levelup: any;
    btn_adventure: cc.Node;
    battleIsOpen: boolean=false;
    islandPos: number;

    onLoad() {
        this.initBtn();
        this.initChangeArrow();
        this.adjustGameInterface();
    }

    initBtn(){
        let node = cc.find("top_left", this.node);
        // this.btn_barn = cc.find("btn_barn", node);
        // this.btn_dailay = cc.find("btn_dailay", node);
        // this.btn_shop = cc.find("btn_shop",node);
        // this.btn_battle = cc.find("btn_battle", node);

        // this.btn_barn.on(cc.Node.EventType.TOUCH_END,this.onclick_barn.bind(this));
        // this.btn_dailay.on(cc.Node.EventType.TOUCH_END, this.onclick_dailay.bind(this));
        // this.btn_shop.on(cc.Node.EventType.TOUCH_END, this.onclick_shop.bind(this));
        // this.btn_battle.on(cc.Node.EventType.TOUCH_END, this.onclick_battle.bind(this));

        let btn_build = cc.find("ButtomHud/btn_build", this.node);
        btn_build.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickCastle();
        })

        this.btn_levelup = cc.find("ButtomHud/btn_levelup", this.node);
        this.btn_levelup.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclicLevelup();
        })

        this.btn_adventure = cc.find("ButtomHud/btn_adventure", this.node)
        this.btn_adventure.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickAdventure();
        })

        this.btn_barn = cc.find("ButtomHud/btn_barn", this.node)
        this.btn_barn.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickPet();
        })

        this.btn_shop = cc.find("ButtomHud/btn_shop", this.node)
        this.btn_shop.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickShop();
        })

        this.btn_battle = cc.find("BattleHud/btn_battle", this.node)
        this.btn_battle.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickAdventure();
        })
    }

    onclick_barn(){

    }

    onclick_shop(){
        StoreScreen.prompt();
    }

    onclick_dailay(){

    }

    onclick_battle() {
        ResourcePointScreen.prompt();
    }

    onclickCastle() {
        this.onOpenBattle(true);
        StateManager.instance.changeState("CastleState");
    }
    
    onclickShop(){
        this.onOpenBattle(true);
        StoreScreen.prompt();
    }

    onclicLevelup(){
        this.onOpenBattle(true);
        ShipUpgrade.prompt();
    }

    onclickPet() {
        this.onOpenBattle(true);
        StickerbookScreen.prompt();
    }

    onclickAdventure() {
        // let timestamp = User.instance.getTimeStamp("Adventure");
        // if (timestamp > 0) {
        //     Adventure.prompt();
        // } else {
            AdventureArea.prompt();
        // }
    }

    onOpenBattle(close: boolean = false) {
        let battleNode = cc.find("BattleHud", this.node);
        let underlay = cc.find("underlay", battleNode);
        let ButtomHud = cc.find("ButtomHud", this.node);
        if (this.battleIsOpen||close) {
            // if (this.battleIsOpen) {
            //     ButtomHud.getComponent(cc.Animation).play("battle_out");
            // }
            battleNode.active = false;
            this.battleIsOpen = false;
        } else {
            battleNode.active = true;
            battleNode.stopAllActions();
            underlay.stopAllActions();
            battleNode.opacity = 0;
            underlay.opacity = 0;
            battleNode.runAction(cc.fadeTo(0.1, 255));
            underlay.runAction(cc.fadeTo(0.1, 100));
            // ButtomHud.getComponent(cc.Animation).play("battle");
            this.battleIsOpen = true;
        }
    }

    initChangeArrow() {
        let arrow_left = cc.find("ButtomHud/arrow_left", this.node);
        let arrow_right = cc.find("ButtomHud/arrow_right", this.node);
        let islandUI = cc.find("Canvas/world/island/islandUI");
        
        this.islandPos = 0
        arrow_left.on(cc.Node.EventType.TOUCH_END, () => {
            this.onOpenBattle(true);
            if (this.islandPos > -2) {
                islandUI.runAction(cc.moveBy(1, cc.v2(1300, 0)))
                this.islandPos--;
            }
        })
        arrow_right.on(cc.Node.EventType.TOUCH_END, () => {
            this.onOpenBattle(true);
            if (this.islandPos < 2) {
                islandUI.runAction(cc.moveBy(1, cc.v2(-1300, 0)))
                this.islandPos++;
            }
        })
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);
        this.node.scale = scale;
    }
    

   

}

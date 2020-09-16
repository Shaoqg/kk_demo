import StoreScreen from "./StoreScreen";
import User from "../Gameplay/User";
import ResourcePointScreen from "../Screens/ResourcePointScreen";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { ShipUpgrade } from "../Screens/ShipUpgrade";
import StickerbookScreen from "./StickerbookScreen";
import { StateManager } from "../Gameplay/State/StateManager";
import { AdventureArea } from "../Screens/AdventureArea";
import ScreenSize from "../Tools/ScreenSize";
import TaskScreen from "./TaskScreen";
import { BuildModel } from "../Screens/BuildModel";
import IslandManager from "../Gameplay/Island/IslandManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class UIManager extends cc.Component {

    static get instance(){
        return UIManager._instance;
    }

    private static  _instance:UIManager;

    btn_barn:cc.Node = null;
    btn_dailay:cc.Node = null;
    btn_shop:cc.Node = null;
    btn_battle:cc.Node = null;
    btn_levelup: any;
    btn_adventure: cc.Node;
    battleIsOpen: boolean=false;
    islandPos: number;
    
    coin_label: cc.Node;
    star_label: cc.Node;
    woodNode: cc.Node;
    stoneNode: cc.Node;
    foodNode: cc.Node;
    magicStoneNode: cc.Node;

    onLoad() {
        UIManager._instance = this;
        this.initBtn();
        this.initChangeArrow();
        this.adjustGameInterface();
    }

    initBtn(){
        let node = cc.find("top_left", this.node);

        let root_top_right = cc.find("top_right/root", this.node)
        this.woodNode = cc.find("wood", root_top_right)
        this.stoneNode = cc.find("stone", root_top_right)
        this.foodNode = cc.find("food", root_top_right)
        this.magicStoneNode = cc.find("magic", root_top_right)

        this.coin_label=cc.find("top_left/root/coins/button_background/desc",this.node);
        this.star_label=cc.find("top_left/root/heart/button_background/desc",this.node);

        let btn_build = cc.find("ButtomHud/root/btn_build", this.node);
        btn_build.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickCastle();
        })

        this.btn_levelup = cc.find("ButtomHud/root/btn_levelup", this.node);
        this.btn_levelup.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclicLevelup();
        })

        this.btn_dailay = cc.find("ButtomHud/root/btn_dailay", this.node)
        this.btn_dailay.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclick_dailay();
        })

        // this.btn_adventure = cc.find("ButtomHud/btn_adventure", this.node)
        // this.btn_adventure.on(cc.Node.EventType.TOUCH_END, ()=>{
        //     this.onclickAdventure();
        // })

        this.btn_barn = cc.find("ButtomHud/root/btn_barn", this.node)
        this.btn_barn.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickPet();
        })

        this.btn_shop = cc.find("ButtomHud/root/btn_shop", this.node)
        this.btn_shop.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickShop();
        })

        this.btn_battle = cc.find("ButtomHud/root/btn_battle", this.node)
        this.btn_battle.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickAdventure();
        })

        EventEmitter.subscribeTo(EventType.UPDATE_RESOURCE, this.updateAllResource.bind(this));
        EventEmitter.subscribeTo(EventType.STAR_INCREASE, this.starIncrease.bind(this));


    }

    showUI(bool = true) {
        let root_ButtomHud = cc.find("ButtomHud/root", this.node)
        let root_top_right = cc.find("top_right/root", this.node)
        let root_top_left = cc.find("top_left/root", this.node)

        root_ButtomHud.stopAllActions();
        root_top_right.stopAllActions();
        root_top_left.stopAllActions();
        if (bool) {
            root_ButtomHud.runAction(cc.moveTo(0.2, cc.v2(0,0)));
            root_top_right.runAction(cc.moveTo(0.2, cc.Vec2.ZERO));
            root_top_left.runAction(cc.moveTo(0.2, cc.Vec2.ZERO));

        } else {
            root_ButtomHud.runAction(cc.moveTo(0.2, cc.v2(0,-390)));
            root_top_right.runAction(cc.moveTo(0.2, cc.v2(175,0)));
            root_top_left.runAction(cc.moveTo(0.2, cc.v2(0,180)));
        }
        
    }

    onclick_barn(){

    }

    onclick_shop(){
        StoreScreen.prompt();
    }

    onclick_dailay() {
        TaskScreen.prompt()
    }

    onclick_battle() {
        ResourcePointScreen.prompt();
    }

    onclickCastle() {
        // this.onOpenBattle(true);
        // StateManager.instance.changeState("CastleState");

        BuildModel.prompt(IslandManager.instance.getCurrentIsland());
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
        let arrow_left = cc.find("center_left/root/arrow_left", this.node);
        let arrow_right = cc.find("center_right/root/arrow_right", this.node);
        
        this.islandPos = 0
        arrow_left.on(cc.Node.EventType.TOUCH_END, () => {
            this.onOpenBattle(true);
            
            IslandManager.instance.moveToIsland(-1);
        })
        arrow_right.on(cc.Node.EventType.TOUCH_END, () => {
            this.onOpenBattle(true);

            IslandManager.instance.moveToIsland(1);
        })
    }

    starIncrease() {
        User.instance.star++;
        this.updateStar()
        User.instance.saveUse();
    }

    updateAllResource(){
        this.updateCoinLabel();
        this.updateWoodLabel();
        this.updateStoneLabel();
        this.updateFoodLabel()
        this.updateMagicLabel()
        this.updateStar()
        User.instance.saveUse();
    }
    
    updateStar(){
        this.star_label.getComponent(cc.Label).string = User._instance.star.toString();
    }

    updateCoinLabel(){
        this.coin_label.getComponent(cc.Label).string=User._instance.coin.toString();
    }

    updateWoodLabel(){
        this.woodNode.getChildByName("Num").getComponent(cc.Label).string=User._instance.wood.toString();
    }

    updateStoneLabel(){
        this.stoneNode.getChildByName("Num").getComponent(cc.Label).string=User._instance.stone.toString();
    }

    updateFoodLabel(){
        this.foodNode.getChildByName("Num").getComponent(cc.Label).string=User._instance.food.toString();
    }

    updateMagicLabel(){
        this.magicStoneNode.getChildByName("Num").getComponent(cc.Label).string=User._instance.magic_stone.toString();
    }

    adjustGameInterface() {
        // let scale = ScreenSize.getScale(1, 0.8);
        // this.node.scale = scale;
    }
   

}

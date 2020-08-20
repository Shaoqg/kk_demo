import User from "./User";
import { CastleScreen } from "../Screens/CastleScreen";
import { StateManager } from "./State/StateManager";
import { ShipUpgrade } from "../Screens/ShipUpgrade";
import { Adventure } from "../Screens/Adventure";
import StickerbookScreen from "../UI/StickerbookScreen";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import TaskScreen from "../UI/TaskScreen";
import { AdventureArea } from "../Screens/AdventureArea";
import { TreeUpgrade } from "../Screens/TreeUpgrade";
import { Trees } from "../Config";
import { RotaryScreen } from "../Screens/RotaryScreen";

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



    onLoad() {
        StateManager.instance.changeState("IslandState");
    }

    start(){

        this.init();
        this.initCastle();
        this.initTrees();
        this.initChangeArrow();
        this.updateAllResource();
        EventEmitter.subscribeTo(EventType.UPDATE_RESOURCE, this.updateAllResource.bind(this));
        EventEmitter.subscribeTo(EventType.STAR_INCREASE, this.starIncrease.bind(this));
        EventEmitter.subscribeTo(EventType.LEVEL_UP_CASTLE, this.onLevelUp.bind(this));
        EventEmitter.subscribeTo(EventType.LEVEL_UP_TREE, this.onTreeLevelUp.bind(this));

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

        this.btn_barn = cc.find("DialogRoot/top_left/btn_barn", this.node)
        this.btn_barn.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickPet();
        })

        this.btn_dailay = cc.find("DialogRoot/top_left/btn_dailay", this.node)
        this.btn_dailay.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickDaily();
        })

        this.btn_rotary = cc.find("DialogRoot/top_left/btn_rotary", this.node)
        this.btn_rotary.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickRotary();
        })

        this.btn_tree1 = cc.find("island/islandUI/farmNode/island/mapblocks/btn_build1", worldNode);
        this.btn_tree1.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickTree();
        })
        this.btn_tree2 = cc.find("island/islandUI/farmNode/island/mapblocks/btn_build2", worldNode);
        this.btn_tree2.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickTree();
        })
        this.btn_tree3 = cc.find("island/islandUI/farmNode/island/mapblocks/btn_build3", worldNode);
        this.btn_tree3.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.onclickTree();
        })



        this.woodNode = cc.find("DialogRoot/top_right/wood", this.node)
        this.stoneNode = cc.find("DialogRoot/top_right/stone", this.node)
        this.foodNode = cc.find("DialogRoot/top_right/food", this.node)
        this.magicStoneNode = cc.find("DialogRoot/top_right/magic", this.node)

        this.coin_label=cc.find("DialogRoot/top_left/animationNode/coins/button_background/desc",this.node);
        this.star_label=cc.find("DialogRoot/top_left/animationNode/heart/button_background/desc",this.node);

    }

    initCastle() {
        let level = User.instance.level_castle;

        let castleNodes = cc.find("world/island/islandUI/islandNode/island/mapblocks/build", this.node);
        castleNodes.children.forEach((node, i)=>{
            node.active = (i == level-1);
            if (level-1 > castleNodes.children.length - 1) {
                node.active = true;
            }
        })
    }

    initTrees() {
        let treeLevels = User.instance.level_Trees;
        Trees.forEach((treeConfig) => {
            let treelevel = treeLevels[treeConfig.treeId];
            let treeNode = cc.find("world/island/islandUI/farmNode/island/mapblocks/" + treeConfig.treeId, this.node);
            treeNode.children.forEach((tree) => {
                if (treelevel == 0) {
                    tree.active = false;
                } else if (tree.name == "level" + (treelevel - 1)) {
                    tree.active = true;
                } else {
                    tree.active = false;
                }
            })
        })

    }

    initChangeArrow() {
        let arrow_left = cc.find("world/island/islandUI/arrow_left", this.node);
        let arrow_right = cc.find("world/island/islandUI/arrow_right", this.node);
        let islandUI = cc.find("world/island/islandUI", this.node);

        arrow_left.on(cc.Node.EventType.TOUCH_END, () => {
            islandUI.runAction(cc.moveBy(1, cc.v2(1300, 0)))
        })
        arrow_right.on(cc.Node.EventType.TOUCH_END, () => {
            islandUI.runAction(cc.moveBy(1, cc.v2(-1300, 0)))

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
        let timestamp = User.instance.getTimeStamp("Adventure");
        if (timestamp > 0) {
            Adventure.prompt();
        } else {
            AdventureArea.prompt();
        }
    }


    onLevelUp(){
        this.initCastle();
        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);

    }

    onTreeLevelUp(){
        this.initTrees();
        EventEmitter.emitEvent(EventType.UPDATE_RESOURCE);

    }

	onclickPet() {
        this.switchShipState(false);
        StickerbookScreen.prompt();
    }

    onclickDaily(){
        this.switchShipState(false);
        TaskScreen.prompt();
    }

    onclickRotary(){
        this.switchShipState(false);
        RotaryScreen.prompt();
    }

    onclickTree(){
        TreeUpgrade.prompt();
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

    updateStar(){
        this.star_label.getComponent(cc.Label).string = User._instance.star.toString();
    }
}

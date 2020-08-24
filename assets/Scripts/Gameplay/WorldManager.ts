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
    rotateAnimNode: cc.Node;
    islandPos: number;
    btn_shop: cc.Node;
    battleIsOpen: boolean=false;



    onLoad() {
        StateManager.instance.changeState("IslandState");
    }

    start(){

        this.init();
        this.initCastle();
        this.initTrees();
        this.updateAllResource();
        GardenPets.setIslandPets();

        //debug
        this.setDebugEvents()

        this.adjustGameInterface();

        EventEmitter.subscribeTo(EventType.UPDATE_RESOURCE, this.updateAllResource.bind(this));
        EventEmitter.subscribeTo(EventType.STAR_INCREASE, this.starIncrease.bind(this));
        EventEmitter.subscribeTo(EventType.LEVEL_UP_CASTLE, this.onLevelUp.bind(this));
        EventEmitter.subscribeTo(EventType.LEVEL_UP_TREE, this.onTreeLevelUp.bind(this));
        EventEmitter.subscribeTo(EventType.CHECK_AREA_COMPELETE, this.checkAreaIsCompelete.bind(this));
        EventEmitter.emitEvent(EventType.CHECK_AREA_COMPELETE);
    }

    init() {

        let worldNode = cc.find("world", this.node);

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

        this.rotateAnimNode=cc.find("DialogRoot/top_left/btn_rotary/rotate",this.node);

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

    onclickTree(){
        TreeUpgrade.prompt();
    }

    checkAreaIsCompelete() {
        let count = 0
        AdventureAreas.forEach((area) => {
            let areaprogress = User.instance.exploreTime[area.areaName] / area.areaCompletetime;
            if (areaprogress >= 1) {
                this.rotateAnimNode.active = true;
                count++;
            }
        });
        if (count == 0) {
            this.rotateAnimNode.active = false;
        }
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

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this.node.scale = scale;
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
}

import StoreScreen from "./StoreScreen";
import User from "../Gameplay/User";
import ResourcePointScreen from "../Screens/BattleScreen";
import { SelectPet } from "../Screens/SelectPet";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { Wander } from "../Pet/Wander";
import { KKLoader } from "../Util/KKLoader";
import { PetType, PetData, getPetConfigById } from "../Config";
import { PetObject } from "../Pet/PetObject";
import WorldManager from "../Gameplay/WorldManager";
import { GardenPets } from "../Pet/GardenPets";


const {ccclass, property} = cc._decorator;

@ccclass
export default class UIManager extends cc.Component {


    btn_barn:cc.Node = null;
    btn_dailay:cc.Node = null;
    btn_shop:cc.Node = null;
    btn_battle:cc.Node = null;

    onLoad() {
        this.initBtn();
    }

    initBtn(){
        let node = cc.find("top_left", this.node);
        this.btn_barn = cc.find("btn_barn", node);
        this.btn_dailay = cc.find("btn_dailay", node);
        this.btn_shop = cc.find("btn_shop",node);
        this.btn_battle = cc.find("btn_battle", node);

        this.btn_barn.on(cc.Node.EventType.TOUCH_END,this.onclick_barn.bind(this));
        this.btn_dailay.on(cc.Node.EventType.TOUCH_END, this.onclick_dailay.bind(this));
        this.btn_shop.on(cc.Node.EventType.TOUCH_END, this.onclick_shop.bind(this));
        this.btn_battle.on(cc.Node.EventType.TOUCH_END, this.onclick_battle.bind(this));

        let btn_reset = cc.find("top_right/btn_reset", this.node);
        btn_reset.on(cc.Node.EventType.TOUCH_END, this.onclick_reset.bind(this));

        let btn_addProgress = cc.find("top_right/btn_addProgress", this.node);
        btn_addProgress.on(cc.Node.EventType.TOUCH_END, this.onclick_progress.bind(this));

        let btn_openSelectPet = cc.find("top_right/btn_openSelectPet", this.node);
        btn_openSelectPet.on(cc.Node.EventType.TOUCH_END, this.onclick_select.bind(this));
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

    onclick_reset(){
        User.instance.resetUse();
    }

    onclick_progress(){
        User.instance.exploreTime["water"]=User.instance.exploreTime["water"] + 360 ;
        User.instance.exploreTime["fire"]=User.instance.exploreTime["fire"] + 360 ;
        User.instance.exploreTime["food"]=User.instance.exploreTime["food"] + 360 ;
        User.instance.exploreTime["nature"]=User.instance.exploreTime["nature"] + 360 ;
        User.instance.saveUse();
        EventEmitter.emitEvent(EventType.CHECK_AREA_COMPELETE);
    }

    async onclick_select(){
        let petdata=await SelectPet.prompt();
        // if(petdata){
        //     let UserPet=User.instance.findPetDataByPetId(petdata.petId);
        //     UserPet.nowUsing=true;
        //     UserPet.UsingBy="onIsland"
        //     User.instance.saveUse()
        //     GardenPets.addpet(petdata);
        // }
    }

}

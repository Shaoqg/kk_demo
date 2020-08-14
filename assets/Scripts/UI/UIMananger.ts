import StoreScreen from "./StoreScreen";
import User from "../Gameplay/User";


const {ccclass, property} = cc._decorator;

@ccclass
export default class UIManager extends cc.Component {


    btn_barn:cc.Node = null;
    btn_dailay:cc.Node = null;
    btn_shop:cc.Node = null;

    onLoad() {
        this.initBtn();
    }


    initBtn(){
        let node = cc.find("top_left", this.node);
        this.btn_barn = cc.find("btn_barn", node);
        this.btn_dailay = cc.find("btn_dailay", node);
        this.btn_shop = cc.find("btn_shop",node);

        this.btn_barn.on(cc.Node.EventType.TOUCH_END,this.onclick_barn.bind(this));
        this.btn_dailay.on(cc.Node.EventType.TOUCH_END, this.onclick_dailay.bind(this));
        this.btn_shop.on(cc.Node.EventType.TOUCH_END, this.onclick_shop.bind(this));

        let btn_reset = cc.find("top_right/btn_reset", this.node);
        btn_reset.on(cc.Node.EventType.TOUCH_END, this.onclick_reset.bind(this));


    }

    onclick_barn(){

    }

    onclick_shop(){
        StoreScreen.prompt();
    }

    onclick_dailay(){

    }

    onclick_reset(){
        User.instance.resetUse();
    }


}

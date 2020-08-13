import { Strike } from "../Screens/Strike";

const {ccclass, property} = cc._decorator;

@ccclass
export default class click extends cc.Component {
    open(){
        Strike.prompt();
    }
}

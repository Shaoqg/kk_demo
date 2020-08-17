import { Adventure } from "../Screens/Adventure";

const {ccclass, property} = cc._decorator;

@ccclass
export default class click extends cc.Component {
    open(){
        Adventure.prompt();
    }
}

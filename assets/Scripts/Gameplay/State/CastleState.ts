import { State } from "./State";
import { StateManager } from "./StateManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CastleState extends State {

    private static _self = StateManager.instance.registerState("CastleState", new CastleState());

    async startState(){
        // CastleScreen.prompt();
        return super.startState();
    }

    async endState() {

    }

}

import { State } from "./State";
import { StateManager } from "./StateManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class IslandState extends State {

    private static _self = StateManager.instance.registerState("IslandState", new IslandState());


}

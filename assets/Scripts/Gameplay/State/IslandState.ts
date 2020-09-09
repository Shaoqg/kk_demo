import { State } from "./State";
import { StateManager } from "./StateManager";
import UIManager from "../../UI/UIMananger";
import IslandManager from "../IslandManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class IslandState extends State {

    private static _self = StateManager.instance.registerState("IslandState", new IslandState());


    startState() : Promise<void> {
        UIManager.instance.showUI(true);

        IslandManager.instance.init();
        return super.startState();
    }


    endState() {

        super.endState();
    }


}

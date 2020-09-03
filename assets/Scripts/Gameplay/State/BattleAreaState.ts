import { State } from "./State";
import { PetData } from "../../Config";
import UIManager from "../../UI/UIMananger";
import BattleArea2Manager from "../BattleArea2Manager";
import { BattleArea2Screen } from "../../Screens/BattleArea2Screen";
import { VoidCallPromise, CallPromise } from "../../kk/DataUtils";
import { StateManager } from "./StateManager";


export default class BattleAreaState extends State {

    private static _self = StateManager.instance.registerState("BattleAreaState", new BattleAreaState());

    battleManager:BattleArea2Manager = null;

    async startState(petsData:PetData[]) {
        //TODO hide UI show battleUI
        // UIManager
        UIManager.instance.showUI(false);

        //TODO loader 
        let onloadedBattle = new CallPromise<cc.Node>();
        BattleArea2Screen.prompt(petsData, onloadedBattle);
        let petNodeParent = await onloadedBattle;
        //creatData
        this.battleManager = new BattleArea2Manager(petsData, petNodeParent);

        return super.startState();
    }

    updateState(dt){
        this.battleManager &&  this.battleManager.update(dt);
    }

    endState() {
        BattleArea2Screen._instance.close(null);

        super.endState();
    }

}

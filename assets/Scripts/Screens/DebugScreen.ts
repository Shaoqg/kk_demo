import { ViewConnector } from "../Tools/ViewConnector";
import { SelectPet } from "./SelectPet";
import User from "../Gameplay/User";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { BattleReward } from "./BattleReward";
import { BattleRewardOld } from "./BattleRewardOld";


const { ccclass, property } = cc._decorator;

@ccclass
export class DebugScreen extends ViewConnector {
    static prefabPath = 'Screens/DebugScreen';

    static onCloseNode: Function = null;

    static instance:DebugScreen;

    static isShowing:boolean = false;

    applyData() {

        this.adjustGameInterface();

    }

    readonly width = 750;
    readonly Height = 1334;
    readonly MaxScale = 1;
    readonly MinScale = 0.80;
    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
    adjustGameInterface() {
        let scale = 1;
        let size = cc.view.getFrameSize();
        // console.log(size);
        // let oldValue = this.Height * size.width / size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）

        let oldValue = this.width / this.Height * size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）
        scale = size.width / oldValue;

        if (scale > this.MaxScale) {
            scale = this.MaxScale;
        } else if (scale < this.MinScale) {
            scale = this.MinScale;
        }

        this.node.width = screen.width;
        this.node.height = screen.height;

        this.node.scale = scale;

    }

    update(dt) {
    }

    close(results:any){
        super.close(results);

        DebugScreen.isShowing = false;
    }

    static async prompt(): Promise<void> {

        this.isShowing = true;
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = await this.loadView<DebugScreen>(parentNode, DebugScreen);

        vc.applyData();

        this.instance = vc;

        let executor = (resolve:(any)=>void, reject:(error)=>void) =>{
            vc.onCloseCallback = resolve;
        }

        return new Promise(executor);
    }
    onclick_progress(){
        User.instance.exploreTime["water"]=User.instance.exploreTime["water"] + 360 ;
        User.instance.exploreTime["fire"]=User.instance.exploreTime["fire"] + 360 ;
        User.instance.exploreTime["food"]=User.instance.exploreTime["food"] + 360 ;
        User.instance.exploreTime["nature"]=User.instance.exploreTime["nature"] + 360 ;
        User.instance.saveUse();
        EventEmitter.emitEvent(EventType.CHECK_AREA_COMPELETE);
    }

    onclick_reset(){
        User.instance.resetUse();
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
    battlereward(){
        this.close(undefined)
       let pets= User.instance.getPetList()
       BattleRewardOld.prompt(2,61,pets[0]);
    }

    lostIsland(){
        this.close(undefined)
    

        User.instance.areaCapture["unknow"]=false;
        User.instance.areaCaptureStopTime["unknow"] = Date.now()
        User.instance.saveUse();
    }
}

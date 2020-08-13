import { ViewConnector } from "../Tools/ViewConnector";
import { delay } from "../kk/DataUtils";
import ScreenSize from "../Tools/ScreenSize";


const { ccclass, property } = cc._decorator;

@ccclass
export class PreloaderScreen extends ViewConnector {
    static prefabPath = 'Screens/PreloaderScreen';

    static onCloseNode: Function = null;

    static instance:PreloaderScreen;

    static isShowing:boolean = false;

    progressBar:cc.ProgressBar;
    progressBarLabel:cc.Label;
    progressBarRate:cc.Label;
    @property(cc.Node)
    shipNode: cc.Node = undefined;

    @property(cc.Node)
    ProgressBarNode: cc.Node = undefined;

    _accum2= 0;
    readonly _fakeprogress = 0.4;
    static _completedKeys = [];

    applyData(loadRaidStatePromise: Promise<void>, waitForSeconds: number) {
        this.progressBar=this.ProgressBarNode.getComponent<cc.ProgressBar>(cc.ProgressBar);
        this.progressBarLabel=this.ProgressBarNode.getChildByName("barLabel").getComponent(cc.Label);
        this.progressBarRate=this.ProgressBarNode.getChildByName("RateLabel").getComponent(cc.Label);
        this.progressBar.progress=0;
        Promise.all([loadRaidStatePromise, delay(waitForSeconds)]).then(() => {
            this.close(undefined);
        });

        let animComp = this.shipNode.getComponent<cc.Animation>(cc.Animation);
        if(animComp) {
            animComp.play("raidShip_moving");
        }

        this.adjustGameInterface();
    }

    updateProgressBar(current: number){
        // console.log("progress"+current);
        // this.progressBar.progress=current/100;
        // this.progressBarLabel.string="Loading:"+current+"%";
    }
    readonly width = 800;
    readonly Height = 1334;
    readonly MaxScale = 1;
    readonly MinScale = 0.80;
    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
    adjustGameInterface() {
        let scale = 1;
        scale = ScreenSize.getScale(1, 0.8);

        this.node.width = ScreenSize.width/scale;
        // this.node.height = screen.height;

        this.node.scale = scale;

    }

    update(dt) {
        this._accum2+=dt;
        if (this._accum2>0.1) {
            this._accum2-=0.25;
            this.toProgress();
            if (this.targetVlue < this.progressBar.progress) {
                this.progressBar.progress += 0.0025;
                let loadingProgressString = (this.progressBar.progress * 100).toFixed(1);
                if (this.progressBar.progress >= 1) {
                    loadingProgressString = "100";
                }
                this.progressBarRate.string = "Loading: " + loadingProgressString + "%";
            }
        }

         
        if (this.targetVlue > this.progressBar.progress ) {
            let temp = (this.targetVlue - this.progressBar.progress)/10 + 0.01;
            this.progressBar.progress += temp;
            let loadingProgress=this.progressBar.progress*100;
            let loadingProgressString=(this.progressBar.progress*100).toFixed(1);
            if(loadingProgress>=100){
                loadingProgressString="100";
            }
            this.progressBarRate.string="Loading: "+loadingProgressString+"%";

        } 
    }

    toProgress(){
        let data =  PreloaderScreen.getCurrLoader();
        let value = data.value * (1- this._fakeprogress) + this._fakeprogress;
        let string = data.string;
        this.setProgress(value, string);
    }
    targetVlue = 0;
    setProgress(value:number, label:string){
        if (value < 0 || value > 1) {
            value = value < 0 ? 0 : 1;
        }
        label && (this.progressBarLabel.string = label);
        
        if (this.targetVlue >= value) {
            return;
        }
        this.targetVlue = value;
        
        
    }

    static getCurrLoader(){
        // let TOTAL = LoadStepCounter._promises.length || 1;
        let loaderNumber = this._completedKeys.length / 10;
        let loaderStr = "";
        if ( loaderNumber > 0) {
            loaderStr = this._completedKeys[this._completedKeys.length - 1];
        }
        // }else {
        //     loaderStr = LoadKey.player;
        // }
        // let str = loaderStr ? I18N.getLoaderString(loaderStr , I18N_temp) : loaderStr;
        let str = loaderStr;
        return {value: loaderNumber, string: str};
    }
    static addStep(key:string){
        this._completedKeys.push(key);
        console.log(key);
    }

    close(results:any){
        super.close(results);
    }

    static async prompt(loadRaidStatePromise: Promise<void>, waitForSeconds: number): Promise<void> {

        let parentNode = cc.find("splash");
        parentNode.width = ScreenSize.width;
        parentNode.x = ScreenSize.width/2;
        let vc = await this.loadView<PreloaderScreen>(parentNode, PreloaderScreen);

        vc.applyData(loadRaidStatePromise, waitForSeconds);
        this.isShowing = true;

        this.instance = vc;

        let executor = (resolve:(any)=>void, reject:(error)=>void) =>{
            vc.onCloseCallback = resolve;
        }

        return new Promise(executor);
    }
}

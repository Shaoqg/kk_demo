import ScreenSize from "../Tools/ScreenSize";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Line extends cc.Component {

    @property(cc.Float)
    lineSpeed: number = 100;// x piex/s

    @property(cc.Node)
    lineNode: cc.Node = null;

    onEnable() {
        let width = 7000;
        let node = this.lineNode || this.node;
        node.stopAllActions();
        let speed = this.lineSpeed;

        let x = width/2 + 500;
        let time = (width + 1000)/ this.lineSpeed + Math.random()*3;
        node.x = Math.random()* 2*width - width;
        node.runAction(cc.sequence(
            cc.moveTo(time, cc.v2(x, node.y)),
            cc.callFunc(()=>{
                node.x = -width/2 -500;
            })
        ).repeatForever());
    }

    onDisable() {
        (this.lineNode || this.node).stopAllActions();
    }

}

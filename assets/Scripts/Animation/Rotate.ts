
const { ccclass, property } = cc._decorator;

@ccclass
export default class Rotate extends cc.Component {

    @property(cc.Float)
    rotateSpeed: number = 2;

    @property(cc.Node)
    RotateNode: cc.Node = null;

    onEnable() {
        
        let node = this.RotateNode || this.node;
        node.stopAllActions();
        node.runAction(cc.rotateBy(this.rotateSpeed, -360).repeatForever());
    }

    onDisable() {
        (this.RotateNode || this.node).stopAllActions();
    }

}

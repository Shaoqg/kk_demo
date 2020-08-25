import { KKLoader } from './../Util/KKLoader';

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class ViewConnector extends cc.Component {
    static prefabPath:string = null; // MUST override in your subclass

    onCloseCallback: (any) => void;

    @property(cc.Button)
    closeButton: cc.Button = null;

    @property()
    fitWidth: boolean = false;

    _originScale = 1;
    // default properties for an in-transition/ out-transition?

    static async loadView<ConnectorType extends ViewConnector>(parentNode:cc.Node, connectorType:typeof ViewConnector, show:boolean = true){
        let connector; 
        let scene = cc.director.getScene();
        // block all touches until complete; could be network delay
        try {
            let pf = await KKLoader.loadPrefab(connectorType.prefabPath);
            let newNode = cc.instantiate(pf);

            let canvasNode = cc.find("Canvas");
            connector = newNode.getComponent(connectorType);
            if(connector.fitWidth){
                newNode.scale = newNode.width > 0 ? canvasNode.width / newNode.width : 750;
           } else {
               // this should allow us to position with widgets instead;
               // even without a widget on newNode.
               newNode.setContentSize(canvasNode.getContentSize());
               newNode.position = cc.Vec2.ZERO;
           }

           if(!show){
               newNode.active = false;
           }
           parentNode.addChild(newNode);

            // set default close button
            connector.closeButton && connector.setClose(connector.closeButton);
        } finally{
        }

        return connector as ConnectorType;
    }

    setShow(){
        this.node.active = true;
    }

    setClose(buttonOrNode:(cc.Component | cc.Node), param = null){
        let node = getNode(buttonOrNode);
        node.once(cc.Node.EventType.TOUCH_END,
            ()=>{ this.close(param);  }
        );
    }

    close(results:any){
        this.onClose();
        this.onCloseCallback && this.onCloseCallback(results);
        this.node.destroy();
    }

    onClose(){ // override; but probably just use onCloseCallback or prompt() ?
    }

    slide(isIn: boolean, node: cc.Node, pos: cc.Vec2, duration = 0.2, callBack:Function = null){
        let move = cc.moveTo(duration, pos).easing(cc.easeIn(1));
        let fade = cc.fadeIn(duration/2);
        if (isIn) {
            node.opacity = 0;
        }else{
            fade = cc.fadeOut(duration);
        }
        node.stopAllActions();
        node.runAction(cc.sequence(
            cc.spawn(fade, move),
            cc.callFunc(()=>{callBack && callBack()})
        ));
    }

    static async preload(connectorType:typeof ViewConnector){
        let pf = await KKLoader.loadPrefab(connectorType.prefabPath);
    }
}


function getNode(buttonOrNode: cc.Component | cc.Node): cc.Node {
    let node = (<cc.Component>buttonOrNode).node;
    return node || buttonOrNode as cc.Node;
}
const {ccclass, property} = cc._decorator;

@ccclass
export default class ScreenSize extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    size:cc.Size = null;

    static readonly _width = 750;
    static readonly _Height = 1334;
    static getScale(maxScale = 1, minScale = 0.6){
        let scale = 1;
        let size = cc.view.getFrameSize();
        // console.log(size);

        let oldValue = this._width / this._Height * size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）
        scale = size.width / oldValue;

        if (scale > maxScale) {
            scale = maxScale;
        } else if (scale < minScale) {
            scale = minScale;
        }
        return scale;
    }

    static get width(){
        let size = cc.view.getFrameSize();
        // console.log(size);
        let width = size.width * this._Height / size.height;//得出屏幕需要的宽度（即完美自适应的尺寸）

        // TODO call cocos stuff, not Canvas? 
        return width;
    }

    static get scale(){
        // let size = cc.find("Canvas").getContentSize() || cc.size(750, 1334);

        // // we design to 750x1344, the iPhone 8 screen size
        // let scale = Math.min(size.width/750, size.height / 1334);
        return this.getScale(2, 0.6);
    }

    start () {
        this.size = this.size || cc.find("Canvas").getContentSize() || cc.size(750, 1334);
        this.node.setContentSize(this.size);
    }

    // TODO fix to work in editor?
    // update (dt) {
    //     if(!this.size){
    //         this.start();
    //     }
    // }

    // editor: {
    //     executeInEditMode:true;
    // }
}

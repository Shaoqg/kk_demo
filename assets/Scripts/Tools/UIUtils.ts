import { KKLoader } from './../Util/KKLoader';
import { CallPromise } from './../kk/DataUtils';

export function setActionMap(map:object){
    for(let path of Object.keys(map)){
        setAction(path, map[path]);
    }
}

export function setAction(pathToNode:string, func, parent?:cc.Node): cc.Node{
    let node = cc.find(pathToNode, parent || cc.director.getScene());
    if(!node){
        console.error('Could not find ', pathToNode)
    }
    let wb = node.getComponent(cc.Button) || node.addComponent(cc.Button);
    wb.transition = cc.Button.Transition.SCALE;
    wb.duration = 0.1;
    wb.zoomScale = 1.2;
    node.off("click"); // remove old listener
    node.on("click", func);
    return node;
}

export function setSpriteSize(sprite:cc.Sprite, sf:cc.SpriteFrame, limit_height_width:number = 100) {
    sprite.spriteFrame = sf;

    let rect = sf.getRect();
    let scale = limit_height_width / (rect.height > rect.width ? rect.height : rect.width);
    
    sprite.node.width = Math.floor(rect.width * scale);
    sprite.node.height = Math.floor(rect.height * scale);
    
    return {scale: scale, width:sprite.node.width, height: sprite.node.height}
}

export function findParent(node:cc.Node, name:string){
    while(node.getParent()){
        if(node.name == name){
            return node;
        }
        node = node.getParent();
    }
    return undefined;
}

export async function promisify(functionWithCallback){
    return new Promise(functionWithCallback);
}

export function addBlocker(node:cc.Node, func?, zIndex=-2048){
    let blocker: cc.Node = new cc.Node("blocker");
    blocker.addComponent(cc.Button);
    blocker.setContentSize(cc.director.getScene().getContentSize());
    if(func){
        blocker.on('click', func);
    }
    blocker.setParent(node);
    blocker.zIndex=zIndex;
    return blocker;
}

// TODO need to bring this back without using InventoryScreen;
// load directly to avoid circular dependency
export async function outline(node:cc.Node, zIndex = -1){
    let n = new cc.Node('outline');
    let s = n.addComponent(cc.Sprite);
    s.spriteFrame = await KKLoader.loadSprite("UI/tile_water");

    n.opacity = 255 * 0.5;
    n.setContentSize(node.getContentSize().width / node.scaleX, node.getContentSize().height / node.scaleY); // counterscale since we are child of node
    n.setAnchorPoint(node.getAnchorPoint()); // match anchorpoint to match pos
    node.addChild(n, zIndex);

}

export function pip(pos:cc.Vec2, parent:cc.Node, size=32){ // TODO move to CocosUtils
    let node = new cc.Node("pip");
    node.position = pos;

    let l = node.addComponent<cc.Label>( cc.Label);
    l.string='*';
    l.fontSize=size;
    l.horizontalAlign=cc.Label.HorizontalAlign.CENTER;
    l.verticalAlign=cc.Label.VerticalAlign.CENTER;
    node.zIndex = 4096;
    parent.addChild(node);
}

export  function interceptString(str: string ,fontInfo = {
    width_ZH:30,
    width_EN:17,
    totalWidth:100
}) {
    let num_str = 0;
    let num_num = 0;
    let currentLength = 0;
    let newStr = "";
    if (str.length > 3) {
        for (let index = 0; index < str.length; index++) {
            var cha = str[index];
            var reg = new RegExp("[\u4E00-\u9FA5]+");
            if (reg.test(cha)) {
                currentLength += fontInfo.width_ZH;
            } else {
                currentLength +=  fontInfo.width_EN;
            }
            newStr += cha;
            if (currentLength > fontInfo.totalWidth) {
                let newStr2 = str.split(" ");
                if (newStr2.length <= 1) {
                    return newStr + "...";
                } else {
                    return newStr2[0];
                }
            }
        }
        return newStr;
    } else {
        return str;
    }
}

export function getScaleSize(spriteFrame, limit_height_width = 100) {
    let rect = spriteFrame.getRect();
    let scale = limit_height_width / (rect.height > rect.width ? rect.height : rect.width);
    return {scale: scale, width:Math.floor(rect.width * scale), height: Math.floor(rect.height * scale)}
}


export type ScrollInfo = {
    contentNode: cc.Node,
    nodes: cc.Node[]
    currentY: number,
    lastY: number,
    top: number,
    buttom: number
}
export function onScrolling(scrollInfo: ScrollInfo) {
    if (scrollInfo.nodes.length <= 0) {
        return;
    }
    scrollInfo.currentY = scrollInfo.contentNode.y;
    scrollInfo.lastY = scrollInfo.currentY;

    for (let index = 0; index < scrollInfo.nodes.length; index++) {
        const node = scrollInfo.nodes[index];

        let y = scrollInfo.currentY + node.y;
        if (y < scrollInfo.top && y > scrollInfo.buttom) {
            node.active = true;
        } else {
            node.active = false;
        }
    }
}

type TiledObjectConfig = {
    height: number,
    id: string,
    name: string,
    offset: {x: number, y: number},
    rotation: number,
    type: number,
    visible: boolean,
    width: number,
    x: number,
    y: number
}

export function printTree(node:cc.Node, indent=''){
    console.log(indent+node.name, node.active? '': 'NOT_ACTIVE', node.opacity==1 ? '' : ''+node.opacity );
    node.children.forEach(
        child => printTree(child, indent+'- ')
    );
}

export class TouchPromise extends CallPromise<void>  {
    constructor(node:cc.Node){
        super();
        node.once(cc.Node.EventType.TOUCH_END, this.resolve);
    }
}

export function excludeDrag( fToWrap: (e:cc.Event.EventTouch)=>void ){
    let wrapper = (e:cc.Event.EventTouch) =>{
        let delta = e.touch.getLocation().sub(e.touch.getStartLocation()).mag();
        let wasDrag = delta>15;
        if(wasDrag){
            // this was long enough to trigger a camera drag;
            // do not activate the callback
            return; 
        }
        fToWrap(e);
    }
    return wrapper;
}

export function once<ParamType=cc.Event.EventTouch>(fToWrap:(ParamType)=>void){
    let consumed = false;
    let wrapper=(e:ParamType)=>{
        if(!consumed){
            consumed = true;
            fToWrap(e);
        }
    }
    return wrapper;
}



export function normalizeNumber(num: number, model :"normal"|"special" = "normal", decimal = 0): string {
    function getString(_num: number, divisor: number) {
        let n = Math.floor(_num / Math.pow(10, divisor));
        let str2;
        let decimalNum = _num- n * Math.pow(10, divisor);
        let decimalStr = "";
        if (decimalNum != 0 && decimal != 0) {
            let decimalStrTemp = decimalNum.toString();
            decimalStrTemp = "0".repeat(divisor - decimalStrTemp.length) + decimalStrTemp;
            decimalStr =  "."+ decimalStrTemp.slice(0, decimal);
            while(decimalStr[decimalStr.length-1] == "0") {
                decimalStr = decimalStr.slice(0,decimalStr.length-1);
                if(decimalStr == ".") {//Fix display decimal point error when the value is ".000"
                    decimalStr = "";
                }
            }
        }
        if (n > 1000) {
            let n1 = Math.floor(n / 1000);
            let n2 = n - n1 * 1000;
            let str1 = n1.toString();
            if (n2 >= 100)
                str2 = n2.toString();
            else if (n2 >= 10)
                str2 = "0" + n2.toString();
            else
                str2 = "00" + n2.toString();
            return str1 + "," + str2 + (decimal ? decimalStr: "");
        } else
            return n.toString() + (decimal ? decimalStr: "");
    }
    num=Math.round(num);
    let numStr = num.toString();
    let leng_1 = numStr.length;
    if (leng_1 == 7 && model == "special") {
        return numStr.slice(0,1) +"," + numStr.slice(1,4) + "," + numStr.slice(4);
    }

    let leng_3 = Math.ceil(leng_1/ 3);
    switch (leng_3) {
        case 2://K  4-6
            decimal = (model == "special" ? 0 : decimal);
            return model == "special" ? getString(num, 0):getString(num, 3) + "K";
        case 3://M  7-9     1000000;//6
            return getString(num, 6) + "M";
        case 4://B  10-12   1000000000;//9
            return getString(num, 9) + "B";
        case 5://T  13-15   1000000000000;//12
            return getString(num, 12) + "T";
        case 6://Q  16-18   1000000000000000;//15
            return getString(num, 15) + "Q";
        case 7://PB 19-21   1000000000000000000;//18
            return getString(num, 18) + "PB";
        case 8://EB 22-24   1000000000000000000000;//21
            return getString(num, 21) + "EB";
    }

    return num+"";
}

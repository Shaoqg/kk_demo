export type TableViewDelegate = {
    dataCount: number,
    cellFactory: (index?: number) => Promise<cc.Node>,//Width and height cannot be zero
    applyData: (cell: cc.Node, dataIndex: number) => void,
    viewSetting: {//vertical
        scrollView: cc.ScrollView,
        gridMode: { xNumber?: number, yNumber?: 0 },
        type: 'horizontal' | 'vertical',
        space: number,//cellNode.height or width + space
        top_Left: number,//scrollView 
        buttom_right: number,
        top_left_space: number //content top or left space
        buttom_right_space: number
    },

}

/**
 * When using this class, the ScrollView component is required and the content cannot be empty.
 * 
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class LoopList extends cc.Component {

    listData: TableViewDelegate = null;

    tempData = {
        isVertical: true,
        nodeList: [],
        dataLength: 0,//数据长度
        currentYX: 0,
        lastYX: 0,
        curItem_up: 0,
        curItem_Down: 0,
    }

    async init(delegate: TableViewDelegate) {
        if (!delegate) {
            console.warn("delegate can not null");
            return;
        }
        this.listData = delegate;

        //creat node 
        let heightOrWidth = Math.abs(delegate.viewSetting.top_Left - delegate.viewSetting.buttom_right) - delegate.viewSetting.top_left_space;
        let nodesNumber_Y_X = Math.ceil(heightOrWidth / delegate.viewSetting.space) + 2;
        let gridYXNumber = delegate.viewSetting.gridMode.xNumber || delegate.viewSetting.gridMode.yNumber || 1;
        let totalNode = nodesNumber_Y_X * gridYXNumber;
        if (totalNode > delegate.dataCount) {
            totalNode = delegate.dataCount;
            console.warn("space error?");
        }

        for (let index = 0; index < totalNode; index++) {
            let node = await delegate.cellFactory(index);
            delegate.applyData(node, index);
            this.tempData.nodeList.push(node);
        }

        //bind scroll event
        let event = new cc.Component.EventHandler();
        event.target = this.node;
        event.component = "LoopList";
        event.handler = "Loop_onscroll";
        delegate.viewSetting.scrollView.scrollEvents.push(event);

        // 
        if (delegate.viewSetting.type == "horizontal" && delegate.viewSetting.scrollView.node.anchorX != 0) {
            console.warn("anchorX shoulde be 0");
        } else if (delegate.viewSetting.type == "vertical" && delegate.viewSetting.scrollView.node.anchorY != 1) {
            console.warn("anchorY shoulde be 1");
        }

        //reset content height or width
        let content = delegate.viewSetting.scrollView.content;
        if (delegate.viewSetting.type == "vertical") {
            content.height = delegate.viewSetting.space * Math.ceil(delegate.dataCount / gridYXNumber) + delegate.viewSetting.top_left_space + delegate.viewSetting.buttom_right_space;
        } else {
            content.width = delegate.viewSetting.space * Math.ceil(delegate.dataCount / gridYXNumber);
        }

        //init
        this.tempData.isVertical = delegate.viewSetting.type == "vertical";
        this.tempData.dataLength = delegate.dataCount;
        this.tempData.curItem_Down = totalNode - 1;
    }

    Loop_onscroll(e) {
        if (this.tempData.isVertical) {
            this.tempData.currentYX = Math.floor(this.listData.viewSetting.scrollView.content.y);
            let isUp = (this.tempData.currentYX - this.tempData.lastYX) > 0 ? true : false;
            this.tempData.lastYX = this.tempData.currentYX;

            this.tempData.nodeList.forEach(node => {
                let y = node.y + this.tempData.currentYX;

                if (y > (this.listData.viewSetting.top_Left + this.listData.viewSetting.space) && isUp) {
                    this.checkIsNeedMove(isUp, node);
                } else if (y < -(this.listData.viewSetting.buttom_right + this.listData.viewSetting.space) && !isUp) {
                    this.checkIsNeedMove(isUp, node);
                }
            });
        } else {
            //TODO horizontal

        }
    }

    checkIsNeedMove(isUp: boolean, node: any) {
        if (isUp) {
            if (this.tempData.curItem_Down < this.tempData.dataLength - 1) {//当前item 已经处于最下面时跳过
                this.tempData.curItem_Down++;
                this.tempData.curItem_up++;
                // let data = this.tempData.data[this.tempData.curItem_Down];
                this.updateItem(node, this.tempData.curItem_Down);
            }
        } else {
            if (this.tempData.curItem_up > 0) {
                this.tempData.curItem_Down--;
                this.tempData.curItem_up--;
                //  let data = this.tempData.data[this.tempData.curItem_up];
                this.updateItem(node, this.tempData.curItem_up);
            }
        }
    }

    updateItem(node, index) {
        this.listData.applyData(node, index);
    }
}

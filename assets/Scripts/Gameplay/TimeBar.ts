
export default class TimeBar {

    node: cc.Node = null;

    currentTime = 0;
    totalTime = 0;

    private progressBar: cc.ProgressBar = null;

    timeoverCB:Function = null ;

    init(node: cc.Node, config: {totalTime: number}, timeoverCB:Function) {
        this.node = node;

        this.progressBar = this.node.getComponent(cc.ProgressBar);
        this.totalTime = config.totalTime;
        this.currentTime = 0;
        this.updateProgress(this.currentTime/this.totalTime);

        this.timeoverCB = timeoverCB;
    }

    updateProgress(number: number) {
        number = number > 1 ? 1 : (number < 0 ? 0 : number);
        this.progressBar.progress = number;
    }

    _updateCD = 0.2;
    update(dt) {
        this.currentTime += dt;
        this._updateCD -= dt;
        if (this._updateCD <=0) {
            this._updateCD += 0.2;
            this.updateProgress(this.currentTime/this.totalTime);
        }
        
        if (this.currentTime >= this.totalTime) {
            this.currentTime -= this.totalTime;
            this.timeoverCB && this.timeoverCB();
        }
    }

    onclickNode() {
        this.node.runAction(cc.sequence(
            cc.scaleTo(0.1, 1.1),
            cc.scaleTo(0.1, 1)
        ))
    }

}


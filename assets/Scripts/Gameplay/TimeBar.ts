
export default class TimeBar {

    node: cc.Node = null;

    currentTime = 0;
    totalTime = 0;

    private progressBar: cc.ProgressBar = null;

    timeoverCB:Function = null ;

    updateCB:Function = null;

    init(node: cc.Node, config: {totalTime: number}, timeoverCB:Function) {
        this.node = node;

        this.progressBar = this.node.getComponent(cc.ProgressBar);
        this.totalTime = config.totalTime;
        this.currentTime = 0;
        this.updateProgress(this.currentTime/this.totalTime);

        this.timeoverCB = timeoverCB;

        this.node.on(cc.Node.EventType.TOUCH_START, ()=>{
            this._onCliking = true;
            this.node.runAction( 
                cc.scaleTo(0.05, 1.02)
            )
        })
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, ()=>{
            this._onCliking = false;
            this.node.runAction( 
                cc.scaleTo(0.05, 1)
            )
        })
        this.node.on(cc.Node.EventType.TOUCH_END, ()=>{
            this._onCliking = false;
            this.node.runAction( 
                cc.scaleTo(0.05, 1)
            )
        })
    }

    private updateProgress(number: number) {
        number = number > 1 ? 1 : (number < 0 ? 0 : number);
        this.progressBar.progress = number;
    }

    _onCliking = false;
    _updateCD = 0.2;
    update(dt) {
        this.updateCB && this.updateCB(dt);
        
        this.currentTime += this._onCliking ? 2*dt: dt;
        this._updateCD -= dt;
        if (this._updateCD <=0) {
            this._updateCD += this._onCliking && !this.updateCB ? 0.1:0.2;
            this.updateProgress(this.currentTime/this.totalTime);
        }
        
        if (this.currentTime >= this.totalTime) {
            this.currentTime -= this.totalTime;
            this.timeoverCB && this.timeoverCB();
        }
    }

    private onclickNode() {
        this.node.runAction(cc.sequence(
            cc.scaleTo(0.05, 1.02),
            cc.scaleTo(0.05, 1)
        ))
    }

}


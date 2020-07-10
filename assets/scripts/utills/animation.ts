

export default class Animation extends cc.Component {

    public static instance: Animation = null;

    public static getInstance(): Animation {
        if(!this.instance){
            this.instance = new Animation();
        }
        return this.instance;
    }

    public init(src): void {
        console.log(src);
    }

    /**
     * 播放祯动画
     * @param node 祯动画节点
     * @param duration 每祯的时间间隔
     * @param isLoop 是否循环播放
     * @param texture 每祯动画的spriteFrame
     */
    public animationPlay(node: cc.Node, duration: number, isLoop: boolean, ...texture: cc.SpriteFrame[]): void {
        this.unscheduleAllCallbacks();
        let index: number = 0;
        const frameCnt: number = texture.length;
        const frame: cc.Sprite = node.getComponent(cc.Sprite);
        const PlayCnt: any = isLoop ? cc.macro.REPEAT_FOREVER : frameCnt;

        this.schedule(()=> {
            frame.spriteFrame = texture[index];
            index ++ ;
            if(index == frameCnt) {
                index = 0
            }
        }, duration, PlayCnt)
    }

    // onLoad () {}
    // start () {}
    // update (dt) {}
}

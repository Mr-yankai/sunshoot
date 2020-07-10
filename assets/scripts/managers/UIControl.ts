
const {ccclass, property} = cc._decorator;
import Energy from "../dataCenter/energy"

@ccclass
export default class UIControl extends cc.Component {

    protected view: any = {};
    protected gameMain = null;

    onLoad (): void {    
        this.gameMain = cc.find("Canvas/gameMain").getComponent("gameMain");
        this.view = {};
        this.load_all_object(this.node, "");
    }

    /**
     * 加载视图下所有节点的导航，方便访问
     * @param root 视图根节点
     * @param path 节点路径
     */
    protected load_all_object(root: cc.Node, path: string): void {
        for(let i: number = 0; i < root.childrenCount; i ++) {
            this.view[path + root.children[i].name] = root.children[i];
            this.load_all_object(root.children[i], path + root.children[i].name + "/");
        }
    }

    //给按钮添加回调事件
    protected onButtonListen(view_name: string, caller: object, func: Function): void {
        let view_node: cc.Node = this.view[view_name];
        if (!view_node) {
            return;
        }       
        let button: cc.Button = view_node.getComponent(cc.Button);
        if (!button) {
            return;
        }
        view_node.on("click", func, caller);
    }

    // //窗口弹出
    // protected popup_framework(view_name: string): void{
    //     this.view[view_name].active = true;
    //     this.view[view_name + "/frame"].scale = 0;
    //     this.view[view_name + "/frame"].opacity = 0;
    //     let act1: cc.Action = cc.scaleTo(0.15,1).easing(cc.easeBackOut());
    //     let act2: cc.Action = cc.fadeIn(0.15);
    //     this.view[view_name + "/frame"].runAction(act1);
    //     this.view[view_name + "/frame"].runAction(act2);

    // }

    // //隐藏窗口
    // protected hide_framework(view_name: string): void{
    //     let act1: cc.Action = cc.scaleTo(0.15,0).easing(cc.easeBackIn());
    //     let act2: cc.Action = cc.fadeOut(0.15);
    //     this.view[view_name + "/frame"].runAction(act1);
    //     this.view[view_name + "/frame"].runAction(act2);
    //     this.scheduleOnce(()=>{
    //         this.view[view_name].active = false;
    //     },0.2)

    // }

    /**
     * 体力状态展示
     * @param cnt 体力值展示节点
     * @param time 倒计时展示节点
     */
    protected setEnergyDisplay(cnt: cc.Node, time: cc.Node): void {
        cnt.getComponent(cc.Label).string = Energy.instance.currentCnt.toString();
        if(Energy.instance.timerStatus){
            let sec = Energy.instance.countdownTime % 60;
            let secStr = sec < 10 ? "0" + sec.toString() : sec.toString();
            let min = Math.floor(Energy.instance.countdownTime / 60);
            let minStr = min < 10 ? "0" + min.toString() : min.toString();
            time.getComponent(cc.Label).string = minStr + ":" + secStr;
        }
        else{
            time.getComponent(cc.Label).string = "";
        }
    }

    // start () {}

    // update (dt) {}
}

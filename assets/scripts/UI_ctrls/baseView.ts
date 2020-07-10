import UIManager from "../managers/UIManager"

const {ccclass, property} = cc._decorator;

@ccclass
export default class BaseView extends cc.Component {

    /**
     * 节点便捷访问方法
     * @param url 节点路径
     */
    protected view(path: string): cc.Node {
        let node = this.node;
        let pathList = path.split("/");
        pathList.forEach((element)=>{
            node = node.getChildByName(element);
        })
        return node;
    }

    /**
     * 按钮注册点击事件
     * @param btnode 
     * @param callback 
     * @param data 
     */
    protected onButtonEvent(btnode: cc.Node, callback: string, data): void {
        UIManager.instance.onButtonEvent(
            btnode,
            this.node,
            this.name,
            callback,
            data
        )
    }
}

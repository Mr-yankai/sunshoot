import ResLoad from "./resLoad";

export default class UIManager {

    public static instance: UIManager = null;
    public static getInstance(): UIManager {
        if(this.instance == null){
            this.instance = new UIManager();
        }
        return this.instance;
    }

    public init(src): void {
        console.log(src);
    }    

    public showSceneUI(parent: cc.Node, ui_name: string): cc.Node {
        var prefab: cc.Prefab = ResLoad.instance.getRes("ui_prefabs/" + ui_name);
        var item: cc.Node = null;
        if (prefab) {
            item = cc.instantiate(prefab);
            parent.addChild(item);
            item.addComponent(ui_name + "_ctrl");
        }
        return item;
    }

    /**
     * 给节点按钮添加点击事件
     * @param node 
     * @param caller 
     * @param func 
     */
    public onButtonListen(node: cc.Node, caller: object, func: Function): void {
        if (!node) return;      
        let button: cc.Button = node.getComponent(cc.Button);
        if (!button) {
            button = node.addComponent(cc.Button);
        }
        node.on("click", func, caller);
    }

    public onButtonEvent(
        btnode: cc.Node,         //按钮挂载的节点
        node: cc.Node,           //脚本挂载的节点
        component: string ,      //脚本组件名称
        handler: string ,        //回调函数名称
        customEventData: string  //自定义参数
        ): void{
    
        let bt = btnode.getComponent(cc.Button);
        if(bt == null) {
            bt = btnode.addComponent(cc.Button);
        }
        let event_handler = new cc.Component.EventHandler();
        event_handler.target = node;
        event_handler.component = component;
        event_handler.handler = handler;
        event_handler.customEventData = customEventData;
        // event_handler.emit(["param1", "param2"]);
        bt.clickEvents.splice(0, bt.clickEvents.length);
        bt.clickEvents.push(event_handler);
    }

    /**
     * 播放粒子特效
     * @param node 特效位置的参考节点
     * @param url 特效资源路径
     */
    public playParticle(node: cc.Node, url: string): cc.ParticleSystem {
        const wpos = node.convertToWorldSpaceAR(cc.v2(0, 0));
        const root = cc.find("Canvas");
        const pos = root.convertToNodeSpaceAR(wpos);
        let child = new cc.Node();
        root.addChild(child);
        child.setPosition(pos);
        let particle = child.addComponent(cc.ParticleSystem);
        particle.file = ResLoad.instance.getRes(url, cc.ParticleAsset);
        particle.autoRemoveOnFinish = true;
        particle.resetSystem();
        return particle;
    }

    public stopParticle(particle: cc.ParticleSystem): void {
        particle.stopSystem;
        particle.node.destroy();
    }

    /**
     * 更新节点spriteFrame
     * @param node 节点名称
     * @param resUrl 图片资源路径
     */
    public createTexture(node: cc.Node, resUrl: string): void {
        let sp = node.getComponent(cc.Sprite);
        if(!sp){
            sp = node.addComponent(cc.Sprite);
        }
        sp.spriteFrame = ResLoad.instance.getRes(resUrl, cc.SpriteFrame);
    }

    /**文本toast */
    public toastTip(parent: cc.Node, src: string, color: cc.Color, duration: number, fontSize?: number){
        let item = new cc.Node();
        item.parent = parent;
        let label = item.addComponent(cc.Label);
        label.string = src; 
        if(fontSize){
            label.fontSize = fontSize;
        }       
        item.opacity = 0;
        item.color = color;
        cc.tween(item)
            .by(0.25, 
                {opacity: 255 ,position: cc.v2(0, 40)}, 
                {easing: "backOut"}
                )
            .delay(duration)
            .by(0.25, 
                {opacity: -255 ,position: cc.v2(0, 40)}, 
                {easing: "backIn"})
            .call(()=>{
                item.destroy();
            })
            .start();
    }

    /**克隆节点 */
    public nodeClone(parent: cc.Node, target: cc.Node): cc.Node {
        let child = cc.instantiate(target);
        const wpos = target.convertToWorldSpaceAR(cc.v2(0, 0));
        const pos = parent.convertToNodeSpaceAR(wpos);
        parent.addChild(child);
        child.setPosition(pos);
        return child;
    }

    /**shader */
    public setShaderEffect(node: cc.Node, shaderName: string): cc.Material {
    
        let sprite = node.getComponent(cc.Sprite);
        if (!sprite) return;

        let texture = sprite.spriteFrame.getTexture();
        texture.packable = false;
    
        const effect = ResLoad.instance.getRes(`effect/${shaderName}`, cc.EffectAsset);
        let material = cc.Material.create(effect);
    
        material.define('USE_TEXTURE', true);
        sprite.setMaterial(0, material);

        return material;
    
    }

    /**
     * 流光shader
     * @param node 扫光节点
     * @param width 扫光宽度
     * @param step 扫光速度
     * @param max 决定扫光频率
     */
    public playFuxayEffect(node:cc.Node, width: number, step: number, max: number): void {
        const material = this.setShaderEffect(node, "Fluxay2");
        let time = 0;
        material.setProperty('width', width);
        setInterval(()=>{
            material.setProperty('time', time);
            time += step;
            if(time >= max) time = 0
        }, 1 / 60)
    }

    /**电光shader */
    public playFuxaySuperEffect(node:cc.Node, step:number): void {
        const material = this.setShaderEffect(node, "FluxaySuper");
        let time = Math.random() * 100;
        setInterval(()=>{
            material.setProperty('time', time);
            time += step;
        }, 1 / 60)
    }

    /**发光shader */
    public playGlowingEffect(node: cc.Node): void {
        this.setShaderEffect(node, "Glowing");
    }

    /**结束发光shader */
    public stopGlowingEffect(node: cc.Node): void {
        let sprite = node.getComponent(cc.Sprite);
        if (!sprite) return;
        const url = "2d-sprite";     
        let mat = cc.Material.createWithBuiltin(url);
        //mat.setProperty('texture', sprite.spriteFrame.getTexture());
        mat.define('USE_TEXTURE', true);
        sprite.setMaterial(0, mat);
    }
}


import ResLoad from "../managers/resLoad"
import UIManager from "../managers/UIManager"
import {ResList} from "../config/ResList"

export default class Scene {

    private canvas: cc.Node = null;
    private ui: cc.Node = null;
    private UIName: string = null;

    private res_pkg: object = {
        prefabs: [],    
        sprite_frames:[],        
        audio_clips: [],       
        sprite_atlases: [],
    };

    constructor(sceneName: string) {
        this.canvas = cc.find("Canvas");
        this.UIName = `${sceneName}UI`;
        this.res_pkg = ResList[sceneName];
    }

    /**
     * 预加载场景资源
     * @param on_process 进度条函数，参数为百分比
     */
    public async preload(on_process: Function): Promise<boolean> {
        try {
            await ResLoad.instance.preloadAllRes(this.res_pkg, on_process);
        } catch (error) {
            cc.log("加载资源出错！", error)
        }
        return;
    } 
 
    /**
     * 进入场景
     */
    public enter(): void {
        if (this.canvas === null) {
            cc.error("[game_app]: canvas is null");
        }
        this.ui = UIManager.instance.showSceneUI(this.canvas, this.UIName);
    }
 
    /**
     * 删除当前场景的数据
     * @param bRelease 是否执行资源卸载; 同一个场景切换不用卸载资源
     */
    public destroy(bRelease: boolean): void { 
        //this.ui.removeFromParent();
        this.ui.destroy();
        if (bRelease) { 
            ResLoad.instance.releaseAllRes(this.res_pkg);
        }
    }

}

// cc.macro.CLEANUP_IMAGE_CACHE = false;
// cc.dynamicAtlasManager.enabled = true;
// 开启调试
//cc.dynamicAtlasManager.showDebug(true);


import ResLoad from "../managers/resLoad"
import EventManager from "../managers/eventManager"
import Scene from "../utills/scene";
import UImanager from "../managers/UIManager"
import UserData from "../dataCenter/userData"
import GameData from "../dataCenter/gameData"
import SoundManager from "../managers/soundManager"
import Login from "../wx/Login";
import Advert from "../wx/advert";
import Energy from "../dataCenter/energy";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameMain extends cc.Component {

    private cur_scene = null;

    public onLoad(): void {
        this.setCollisionManagerSwith(true); 
        this.initFrameWork();               
    }

    public start(): void {
        let self = this;
        if(cc.sys.platform === cc.sys.WECHAT_GAME){
            self.showLoading();
            const loadSubpackageTask = wx.loadSubpackage({
                name: 'texture',
                success: ()=>{
                    console.log('load subpackage successfully.');
                    
                    self.enterScene("home");
                },
                fail: ()=>{
                    console.log('load subpackage failed.');
                }
            });
            
            // const loadRes = this.node.getChildByName("loadRes");
            // loadRes.active = true;
            // loadSubpackageTask.onProgressUpdate((res)=>{
            //     loadRes.getComponent(cc.Label).string = `加载资源(${Math.floor(res.progress)}%)`;
            //     if(res.progress == 100){
            //         loadRes.active = false;
            //     }
        // })
            
        }
        else{
            self.enterScene("home");
        }
    }

    update (dt) {
        
    }

    /**
     * 初始化，框架里面的每个管理模块
     */
    private initFrameWork(): void {
        
        console.log("init game framework ... ...")

        const uimanager: UImanager = UImanager.getInstance();
        uimanager.init("[UImanager]模块初始化成功！");

        const resLoad: ResLoad = ResLoad.getInstance();
        resLoad.init("[ResLoad]模块初始化成功！");

        const eventManager: EventManager = EventManager.getInstance();
        eventManager.init("[EventManager]模块初始化成功！");

        const soundManager: SoundManager = SoundManager.getInstance();
        soundManager.init("[SoundManager]模块初始化成功！")

        if(cc.sys.platform === cc.sys.WECHAT_GAME){
            const login: Login = Login.getInstance();
            login.init("[Login]模块初始化成功！"); 

            const advert: Advert = Advert.getInstance();
            advert.init("[Advert]模块初始化成功！");
        }

        const gameData: GameData = GameData.getInstance();
        gameData.init("[GameData]模块初始化成功！");

        const userData: UserData = UserData.getInstance();
        userData.init("[UserData]模块初始化成功！");

        const energy: Energy = Energy.getInstance();
        energy.init("[Energy]模块初始化成功！");

        

        console.log("init game framework success!");

    }

    /**
     * 是否开启碰撞检测系统
     * @param isOpen 是否开启
     */
    private setCollisionManagerSwith(isOpen: boolean): void {
        const manager = cc.director.getCollisionManager();
        manager.enabled = isOpen;
        //manager.enabledDebugDraw = true;
        //manager.enabledDrawBoundingBox = true;
    }

    /**
     * 切换场景函数
     * @param sceneName 场景名称
     */
    public async enterScene(sceneName: string): Promise<boolean> {
        let scene = await this._enterScene(sceneName);
        this.cur_scene = scene;
        return true;
    }

    /**
     * 单个场景进入时的处理逻辑
     * @param sceneName 场景名称 "home" or "game"
     */
    private async _enterScene(sceneName: string): Promise<Scene> {
        if (sceneName === null || sceneName === "") {
            return;
        }      
        let scene = new Scene(sceneName);
        if (this.cur_scene !== null) {
            await scene.preload(null);
            this.cur_scene.destroy(this.cur_scene === scene);
            scene.enter();
        } else {
            await scene.preload(null);
            this.hideLoading();
            scene.enter();
        }
        return scene;
    }

    private showLoading(): void {
        const loading = this.node.getChildByName("loadRes");
        const label = loading.getComponent(cc.Label);
        loading.active = true;

        const labelList = [
            "资源加载中",
            "资源加载中.",
            "资源加载中..",
            "资源加载中...",
        ]

        let index = 0;
        this.schedule(()=>{
            label.string = labelList[index];
            index ++;
            if(index > 3) index = 0;
        }, 0.8, cc.macro.REPEAT_FOREVER, 0)
    }

    private hideLoading(): void {
        this.unscheduleAllCallbacks();
        this.node.getChildByName("loadRes").active = false;
    }
}

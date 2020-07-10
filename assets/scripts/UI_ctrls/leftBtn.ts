import BaseView from "./baseView";
import SoundManager from "../managers/soundManager";
import UIManager from '../managers/UIManager';
import {openDomain} from "../wx/openDomain";
import GameData from '../dataCenter/gameData';
import homeUI_ctrl from "./homeUI_ctrl";


const {ccclass, property} = cc._decorator;

@ccclass
export default class LeftBtn extends BaseView {

    private homeUI_ctrl: homeUI_ctrl;

    onLoad(){
        this.homeUI_ctrl = this.getComponent("homeUI_ctrl");
        this.name = "leftBtn";
    }

    start(){

        /** 打开/关闭弹窗 */
        this.onButtonEvent(this.view("setting/mask"), "hideSetting","")
        this.onButtonEvent(this.view("left/setting"),"showSetting","")
        

        /** 音乐/音效/振动 开关 */
        this.onButtonEvent(this.view("setting/dialog/music/switch"),"onSwitchClick","music")
        this.onButtonEvent(this.view("setting/dialog/effect/switch"),"onSwitchClick","effect")
        this.onButtonEvent(this.view("setting/dialog/shake/switch"),"onSwitchClick","shake")

        //排行榜
        this.onButtonEvent(this.view("left/rank"),"onOpenRank","")
        this.onButtonEvent(this.view("rank/mask"),"onHideRank","")

        //分享
        this.onButtonEvent(this.view("left/share"),"onShareClick","")
    }

    

    /**
     * 设置弹窗
     */
    private showSetting(): void {        
        SoundManager.instance.playEffect("audioClip/click_x");
        const dialog = this.view("setting/dialog");
        this.view("setting").active = true;
        dialog.scale = 0;
        dialog.opacity = 0;
        const soundSwitch = SoundManager.instance.getSoundSwitch();
        this.setSwitch("music", soundSwitch.music);
        this.setSwitch("effect", soundSwitch.effect);
        this.setSwitch("shake", soundSwitch.shake);

        cc.tween(dialog)
            .to(0.3, {scale: 1, opacity: 255}, {easing: "backOut"})
            .start();
        
            this.homeUI_ctrl.openTime = new Date().getTime();
    }

    private setSwitch(type: string, turn: string): void {
        const sw = this.view(`setting/dialog/${type}/switch`);
        UIManager.instance.createTexture(sw, `texture/setting/${turn}`);
    }

    private onSwitchClick(event, data): void {
        SoundManager.instance.playEffect("audioClip/click_x");
        const settingType = data;
        const status = SoundManager.instance.getSoundSwitch();
        const hisStatus = status[settingType];
        if(hisStatus == "on"){
            SoundManager.instance.turnOff(settingType);
            this.setSwitch(settingType, "off");
        }
        else{
            SoundManager.instance.turnOn(settingType);
            this.setSwitch(settingType, "on");
        }       
    }

    private hideSetting(): void {
        const hideTime = new Date().getTime();
        const timeOffset = hideTime - this.homeUI_ctrl.openTime;
        if(timeOffset < 800) return;
        
        SoundManager.instance.playEffect("audioClip/click_s");
        const dialog = this.view("setting/dialog");
        dialog.scale = 1;
        dialog.opacity = 255;
        cc.tween(dialog)
            .to(0.3, {scale: 0, opacity: 0}, {easing: "backIn"})
            .call(()=>{
                this.view("setting").active = false;
            })
            .start();
    }

    //打开排行榜
    private async onOpenRank(event, data): Promise<void> {
        
        SoundManager.instance.playEffect("audioClip/click_x");
        if(cc.sys.platform !== cc.sys.WECHAT_GAME){
            return;
        }
        this.view("rank").active = true;
        const userId = GameData.instance.getUserData().userId;
        openDomain.openFriendRank(userId);

        this.homeUI_ctrl.openTime = new Date().getTime();
    }

    private onHideRank(event, data): void {
        const hideTime = new Date().getTime();
        const timeOffset = hideTime - this.homeUI_ctrl.openTime;
        if(timeOffset < 800) return;
        SoundManager.instance.playEffect("audioClip/click_s");
        openDomain.hideRank();
        this.view("rank").active = false;
    }

    /**
     * 分享转发
     * @param event 
     * @param data 
     */
    private onShareClick(event, data): void {
        SoundManager.instance.playEffect("audioClip/click_x");
        if(cc.sys.platform == cc.sys.WECHAT_GAME){
            openDomain.shareAppMessage();
        }               
    }
    
}

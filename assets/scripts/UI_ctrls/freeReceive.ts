import BaseView from "./baseView";
import GameData from '../dataCenter/gameData';
import UIManager from '../managers/UIManager';
import EventManager from '../managers/eventManager';
import SoundManager from "../managers/soundManager"
import {EventList, EnergyConfig, PlayAdReward} from '../config/Global'
import {translateNumber, timestampToTime} from '../utills/common';
import Advert from "../wx/advert";
import homeUI_ctrl from "./homeUI_ctrl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FreeReceive extends BaseView {

    private homeUI_ctrl: homeUI_ctrl;

    onLoad () {
        this.name = "freeReceive";
        this.homeUI_ctrl = this.getComponent("homeUI_ctrl");
    }

    start () {

        //领取体力、金币
        this.onButtonEvent(this.view("top/energy/add"),"openFreeReceive","energy")
        this.onButtonEvent(this.view("top/coin/add"),"openFreeReceive","coin")
        this.onButtonEvent(this.view("freeReceive/mask"),"hideFreeReceive","")
    }

    /**
     * 免费领取
     * @param event 
     * @param data "coin" or "energy"
     */
    private openFreeReceive(event, data): void {
        
        SoundManager.instance.playEffect("audioClip/click_x");
        const isShareOk = GameData.instance.assertShareSupport();
        const isVideoOk = GameData.instance.assertVideoSupport();
        if(!isShareOk && !isVideoOk){ //分享/视频均不可用
            UIManager.instance.toastTip(this.node, 
                "今日免费领取次数已用完", 
                cc.Color.WHITE, 0.3);
            return
        }
        const freeReceive = this.view("freeReceive");
        const window = this.view("freeReceive/window");
        freeReceive.active = true;
        this.setFreeReceive(window, data);
        window.opacity = 0;
        window.scale = 0;
        cc.tween(window)
            .to(0.5, {opacity: 255, scale: 1}, {easing: "backOut"})
            .start();

        this.homeUI_ctrl.openTime = new Date().getTime();
    }

    /**
     * 设置领取弹窗
     * @param window 
     * @param type 领取物品名称 "coin" or "energy"
     */
    private setFreeReceive(window: cc.Node, type: string): void {
        UIManager.instance.createTexture(window, `texture/freeReceive/${type}Frame`);
        UIManager.instance.createTexture(window.getChildByName("icon"), `texture/freeReceive/${type}Icon`);

        const isVideoSupport = GameData.instance.assertVideoSupport();
        const btn = window.getChildByName("btn");

        const number = window.getChildByName("number");
        const coin =translateNumber(GameData.instance.getFreeReceiveCoin()) ;
        const energy = EnergyConfig.freeReceive + "";
        const str = type == "coin" ? coin : energy;
        number.getComponent(cc.Label).string = "+" + str;
        
        if(isVideoSupport){ //能通过视频广告领取，优先使用此方式
            UIManager.instance.createTexture(btn, "texture/freeReceive/videobtn");
            this.onButtonEvent(btn, "onFreeReceiveClick", {cmd: "video", revObject: type});
        }
        else{
            UIManager.instance.createTexture(btn, "texture/freeReceive/sharebtn");
            this.onButtonEvent(btn, "onFreeReceiveClick", {cmd: "share", revObject: type});
        }

    }

    /**
     * 免费领取按钮点击事件
     * @param event 
     * @param data {cmd: "share", revObject: "coin"}
     */
    private onFreeReceiveClick(event, data): void {
        const clickTime = new Date().getTime();
        const timeOffset = clickTime - this.homeUI_ctrl.openTime;
        if(timeOffset < 800) return;

        SoundManager.instance.playEffect("audioClip/click_x");
        //保存分享/视频 对应的奖励类型，方便回调调用
        this.homeUI_ctrl.playAdReward = 
            data.revObject == "energy" ? PlayAdReward.receiveEnergy : PlayAdReward.receiveCoin;
        if(data.cmd == "video"){
            if(cc.sys.platform == cc.sys.WECHAT_GAME){
                Advert.instance.showVideoAd();
            }
            else{
                EventManager.instance.dispatch_event(EventList.playAdSuccess, "");
                const nowTime = timestampToTime(new Date().getTime());
                GameData.instance.setVideoOrShareTime("video", nowTime);
            }
        }
        else{
            if(cc.sys.platform == cc.sys.WECHAT_GAME){
                this.homeUI_ctrl.shareAppMessage();
            }
            else {
                EventManager.instance.dispatch_event(EventList.playAdSuccess, "");
                const nowTime = timestampToTime(new Date().getTime());
                GameData.instance.setVideoOrShareTime("share", nowTime);
            }
        }
        this.homeUI_ctrl.openTime = new Date().getTime();
    }

    public hideFreeReceive(event, data): void {
        const hideTime = new Date().getTime();
        const timeOffset = hideTime - this.homeUI_ctrl.openTime;
        if(timeOffset < 800) return;
        SoundManager.instance.playEffect("audioClip/click_s");
        const freeReceive = this.view("freeReceive");
        const window = this.view("freeReceive/window");
        window.opacity = 255;
        window.scale = 1;
        cc.tween(window)
            .to(0.5, {opacity: 0, scale: 0}, {easing: "backIn"})
            .call(()=>{
                freeReceive.active = false;
            })
            .start();
    }
}

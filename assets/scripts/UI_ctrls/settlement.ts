
import BaseView from "./baseView";
import GameData from '../dataCenter/gameData';
import UIManager from '../managers/UIManager';
import EventManager from '../managers/eventManager';
import SoundManager from "../managers/soundManager"
import {EventList, PlayAdReward} from '../config/Enumeration'
import {translateNumber, timestampToTime} from '../utills/common';
import Advert from "../wx/advert";
import homeUI_ctrl from "./homeUI_ctrl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Settlement extends BaseView {

    private homeUI_ctrl: homeUI_ctrl;

    onLoad () {
        this.name = "settlement";
        this.homeUI_ctrl = this.getComponent("homeUI_ctrl");
    }

    start () {}

    /**
     * 结算页面
     */
    public showTheEnd(data): void {

        this.view("theEnd").active = true;
        const resUrl = data.isVictory ? "texture/over/victory" : "texture/over/failure";
        const audioUrl = data.isVictory ? "audioClip/success" : "audioClip/fail";
        SoundManager.instance.playEffect(audioUrl);
        UIManager.instance.createTexture(this.view("theEnd/title"), resUrl);
        const label = this.view("theEnd/receive/coinCnt").getComponent(cc.Label);
        label.string = translateNumber(data.reward);
        const startY = cc.winSize.height * 0.5 + this.view("theEnd/title").height * 0.5;
        const endY = 375;
        this.view("theEnd/title").y = startY;
        cc.tween(this.view("theEnd/title"))
            .to(0.5, {y: endY}, {easing: "backOut"})
            .start();
        
        const receive = this.view("theEnd/receive");
        const multiReceive = this.view("theEnd/multiReceive");

        receive.x = - cc.winSize.width / 2 - receive.width / 2;       
        cc.tween(receive).to(0.4, {x: 0}, {easing: "backOut"}).start();
        
        const videoIdentify = GameData.instance.assertVideoSupport();
        const shareIdentify = GameData.instance.assertShareSupport();
        if(videoIdentify){  //支持视频广告
            multiReceive.active = true;
            UIManager.instance.createTexture(multiReceive, "texture/over/multiRv_video");
            multiReceive.x = cc.winSize.width / 2 + multiReceive.width / 2;
            cc.tween(multiReceive).to(0.4, {x: 0}, {easing: "backOut"}).start();
            this.onButtonEvent(multiReceive, "onMultiReceiveCoin", "video");
        }
        else if(shareIdentify){ //支持分享领取
            multiReceive.active = true;
            UIManager.instance.createTexture(multiReceive, "texture/over/multiRv_share");
            multiReceive.x = cc.winSize.width / 2 + multiReceive.width / 2;
            cc.tween(multiReceive).to(0.4, {x: 0}, {easing: "backOut"}).start();
            this.onButtonEvent(multiReceive, "onMultiReceiveCoin", "share");
        }
        else{
            multiReceive.active = false;
        }

        this.onButtonEvent(receive, "onReceiveCoin", "")

    }

    private hideTheEnd(): void {
        this.view("theEnd").active = false;
        this.view("skillRoot/skill").active = false;
        const suns = this.view("suns").children;
        suns.forEach(element => {
            cc.tween(element)
                .to(0.3, {opacity: 0})
                .call(()=>{
                    element.destroy();
                })
                .start();
        })
    }

    /**
     * 单倍领取金币 按钮事件
     */
    private onReceiveCoin(event, data): void {
        const clickTime = new Date().getTime();
        const timeOffset = clickTime - this.homeUI_ctrl.openTime;
        if(timeOffset < 2000) return;
        SoundManager.instance.playEffect("audioClip/click_x");

        //播放金币音效及特效
        SoundManager.instance.playEffect("audioClip/coin");
        UIManager.instance.playParticle(this.view("top/coin"), "particle/coin");

        setTimeout(()=>{
            GameData.instance.receiveCoin(1);
            this.hideTheEnd();
            this.homeUI_ctrl.backHome();
        }, 1000)  
        
        this.homeUI_ctrl.openTime = new Date().getTime();
    }

    /**
     * 5倍领取金币按钮事件
     */
    private onMultiReceiveCoin(event, data): void {
        const clickTime = new Date().getTime();
        const timeOffset = clickTime - this.homeUI_ctrl.openTime;
        if(timeOffset < 800) return;

        SoundManager.instance.playEffect("audioClip/click_x");
        this.homeUI_ctrl.playAdReward = PlayAdReward.multiReceive;
        if(cc.sys.platform == cc.sys.WECHAT_GAME){   
            if(data == "video"){
                Advert.instance.showVideoAd()
            }         
            else if(data == "share"){
                this.homeUI_ctrl.shareAppMessage();
            }
        }
        else{
            EventManager.instance.dispatch_event(EventList.playAdSuccess, "");
            const nowTime = timestampToTime(new Date().getTime());
            GameData.instance.setVideoOrShareTime("share", nowTime);
        }
        this.homeUI_ctrl.openTime = new Date().getTime();
    }

    /**
     * 观看视频结束 5倍领取金币
     */
    public multiReceive(): void {
        SoundManager.instance.playEffect("audioClip/coin");
        UIManager.instance.playParticle(this.view("top/coin"), "particle/coin");

        setTimeout(()=>{
            GameData.instance.receiveCoin(3);
            this.hideTheEnd();
            this.homeUI_ctrl.backHome();
        }, 1000)
        
    }
}

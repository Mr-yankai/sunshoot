
import {Wechat} from "../config/Global";
import GameData from "../dataCenter/gameData";
import EventManager from "../managers/eventManager";
import {EventList} from "../config/Global";
import {timestampToTime} from "../utills/common";


export default class Advert {

    public static instance: Advert = null;
    public static getInstance(): Advert{
        if(this.instance == null){
            this.instance = new Advert();
        }
        return this.instance;
    }

    public init(src): void {
        this.initVideoAd();
        console.log(src);
    }

    private videoAd = null;
    private isVideoAdOk = false;

    //初始化视频方法
    private initVideoAd() {
    
        let self = this;

		//实例
		let videoAd = wx.createRewardedVideoAd({
			adUnitId: Wechat.adUnitId
		})
 
        self.videoAd = videoAd;
        
        videoAd.onLoad(() => {
            console.log('激励视频广告加载成功!');
            self.isVideoAdOk = true;
        })
 
	   //捕捉错误
		videoAd.onError(err => {
            console.log(err);
            self.isVideoAdOk = false;
            if(err.errCode == 1000 || err.errCode == 1003){
                videoAd.load();
            }
		})
 
		//关闭视频的回调函数
		videoAd.onClose(res => {
			// 用户点击了【关闭广告】按钮
			// 小于 2.1.0 的基础库版本，res 是一个 undefined
            console.log(res)
            
			if (res && res.isEnded || res === undefined) {
				// 正常播放结束，可以下发游戏奖励       
                EventManager.instance.dispatch_event(
                    EventList.playAdSuccess, ""
                )
                const nowTime = timestampToTime(new Date().getTime());
                GameData.instance.setVideoOrShareTime("video", nowTime);
			} else {				
                // 播放中途退出，不下发游戏奖励
                wx.showToast({
                    title: '您的视频还没看完，无法获得奖励'
                })
			}
		})
    }
    
    public showVideoAd(): void {
        if(this.isVideoAdOk){
            this.videoAd.show();
        }
        else{
            wx.showToast({
                title: '拉取视频广告失败'
            })
        }
    }

    public getAdStatus(): boolean{
        return this.isVideoAdOk;
    }
    
}

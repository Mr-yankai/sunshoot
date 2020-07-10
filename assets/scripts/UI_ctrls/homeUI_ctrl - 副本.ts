import BaseView from "./baseView"
import GameData from '../dataCenter/gameData';
import UIManager from '../managers/UIManager';
import EventManager from '../managers/eventManager';
import SoundManager from "../managers/soundManager"
import {General, EventList, WeaponList, EnergyConfig} from '../config/Global'
import ResLoad from '../managers/resLoad';
import {translateNumber} from '../utills/common';
import {openDomain} from "../wx/openDomain"
import Advert from "../wx/advert";
import Energy from "../dataCenter/energy";
import {timestampToTime} from "../utills/common";
// import {setShaderEffect} from "../managers/shaderHelper"

const { ccclass, property } = cc._decorator;

const ShootStatus = {
    NotBegin: 0,
    Ready: 1,
}

const enum PlayAdReward  {
    fullUsed,      //满级试用
    receiveCoin,   //领取金币
    receiveEnergy, //领取体力
    multiReceive,  //5倍领取金币
    resurgence,    //复活
}

@ccclass
export default class homeUI_ctrl extends BaseView {

    private weapon: string = null;
    private weaponClick: string = null;
    private playAdReward: PlayAdReward = null;
    private shareStartTime: number = 0;
    private togetherGas: cc.ParticleSystem = null;
    private openTime: number = 0;

    onLoad(): void {

        cc.game.on(cc.game.EVENT_SHOW, this.onShareCallback, this);

        UIManager.instance.onButtonListen(
            this.view("bottom/weapon"), 
            this, 
            this.onWeaponClick
        );
        UIManager.instance.onButtonListen(
            this.view("bottom/forge"), 
            this, 
            this.onForgeClick
        );
        UIManager.instance.onButtonListen(
            this.view("bottom/skill"), 
            this, 
            this.onSkillClick
        );
        UIManager.instance.onButtonListen(
            this.view("startBt"), 
            this, 
            this.onBlankClick
        );
        
        UIManager.instance.onButtonListen(
            this.view("level"), 
            this, 
            this.nextLevel
        );

        UIManager.instance.onButtonListen(
            this.view("theEnd/receive"), 
            this, 
            this.onReceiveCoin
        );

        UIManager.instance.onButtonListen(
            this.view("unlockWeapon/mask"), 
            this, 
            this.hideUnlockWeapon
        );

        UIManager.instance.onButtonListen(
            this.view("setting/mask"), 
            this, 
            this.hideSetting
        );

        UIManager.instance.onButtonListen(
            this.view("left/setting"), 
            this, 
            this.showSetting
        );

        //设置开关
        this.onButtonEvent(
            this.view("setting/dialog/music/switch"),
            "onSwitchClick",
            "music"
        )

        this.onButtonEvent(
            this.view("setting/dialog/effect/switch"),
            "onSwitchClick",
            "effect"
        )

        this.onButtonEvent(
            this.view("setting/dialog/shake/switch"),
            "onSwitchClick",
            "shake"
        )

        //排行榜
        this.onButtonEvent(
            this.view("left/rank"),
            "onOpenRank",
            ""
        )

        this.onButtonEvent(
            this.view("rank/mask"),
            "onHideRank",
            ""
        )

        //分享
        this.onButtonEvent(
            this.view("left/share"),
            "onShareClick",
            ""
        )

        //领取体力、金币
        this.onButtonEvent(
            this.view("top/energy/add"),
            "openFreeReceive",
            "energy"
        )

        this.onButtonEvent(
            this.view("top/coin/add"),
            "openFreeReceive",
            "coin"
        )

        this.onButtonEvent(
            this.view("freeReceive/mask"),
            "hideFreeReceive",
            ""
        )
    }

    start(): void {

        UIManager.instance.playFuxaySuperEffect(this.view("BG"), 0.001);

        SoundManager.instance.playMusic("audioClip/bgMusic");

        this.weapon = GameData.instance.getCurrentWeapon();
        
        this.viewInit();
        this.setLevel();
        this.setEnergy();
        this.backgroundAction();

        EventManager.instance.add_event_listener(
            EventList.gameOver,
            this,
            this.onGameOver
        )

        EventManager.instance.add_event_listener(
            EventList.updateLife,
            this,
            this.onUpdateLife
        )

        EventManager.instance.add_event_listener(
            EventList.updateProgress,
            this,
            this.onUpdateProgress
        )

        EventManager.instance.add_event_listener(
            EventList.playAdSuccess,
            this,
            this.onPlayAdSuccess
        )

        EventManager.instance.add_event_listener(
            EventList.resurgence,
            this,
            this.showResurgence
        )

        EventManager.instance.add_event_listener(
            EventList.genSun,
            this,
            this.createSun
        )
    }

    

    /**
     * 背景动画
     */
    private backgroundAction(): void {
        cc.tween(this.view("BG/center")).repeatForever(
            cc.tween()
                .to(3, {scale: 0.92})
                .to(3, {scale: 1})
                .delay(2)
        )
            .start();

        cc.tween(this.view("BG/center_down")).parallel(
            cc.tween().repeatForever(
                cc.tween()
                    .by(4, {angle: 30})
                    .delay(1)
                    .by(4, {angle: -30})
                    .delay(2)
            ),
            cc.tween().repeatForever(
                cc.tween()
                    .by(3, {x: -60})
                    .delay(1.5)
                    .by(3, {x: 60})
                    .delay(1)
            )
        )
            .start();

        cc.tween(this.view("BG/left_down")).repeatForever(
            cc.tween()
                .delay(2)
                .by(4, {y: 60})
                .delay(1)
                .by(5, {y: -60})               
        )
            .start();

        cc.tween(this.view("BG/right_center")).repeatForever(
            cc.tween()
                .delay(1)
                .by(5, {x: -50})
                .delay(1)
                .by(3, {x: 50})
                .delay(1)
        )
            .start();
    }

    /**
     * 空白区域点击事件
     */
    private onBlankClick(): void {
        const hideTime = new Date().getTime();
        const timeOffset = hideTime - this.openTime;
        if(timeOffset < 2000) return;
        if(this.view("weaponList").active){
            this.hideWeaponList();
            this.setButtonStatus(this.view("bottom/weapon"), false);
            this.setButtonStatus(this.view("bottom/forge"), false);
            this.setButtonStatus(this.view("bottom/skill"), false);
        }
        else{
            //体力扣减
            const enough = Energy.instance.energyChange(EnergyConfig.consume * -1);
            if(enough){
                this._setEnergy();
                this.gameStart();
            }
            else {
                UIManager.instance.toastTip(
                    this.node,
                    "体力不足",
                    cc.Color.WHITE,
                    1
                )
            }
        }
        this.openTime = new Date().getTime();
    }

    /**
     * 开始游戏
     */
    private gameStart(): void {
        GameData.instance.startNewGame();
        this.hideWeaponList();
        this.hideButton();
        this.hideTop();
        this.hideLevel();
        this.hideLeft();
        this.weaponMoveDown();
        this.scheduleOnce(()=>{
            this.setStartStatus(false) ;                        
            //this.startGenSuns();
            this.showLine();
            const life = GameData.instance.getPlayerBlood();
            this.showLife(life);
            this.showProgress();
        } ,0.5)  
    }

    private viewInit(): void {
        this.updateWeaponStatus(this.weapon, ShootStatus.Ready);
        this.showButton();
        this.showTop();
        this.showLeft();
        this.showLevel();
        this.hideWeaponList();
        this.hideLine();     
        this.hideTheEnd();
        this.hidelife();
        this.hideProgress();
        this.updateCoin();
        this.setStartStatus(true);
    }

    private onWeaponClick(): void {
        SoundManager.instance.playEffect("audioClip/click_x");
        this.setButtonStatus(this.view("bottom/weapon"), true);
        this.setButtonStatus(this.view("bottom/forge"), false);
        this.setButtonStatus(this.view("bottom/skill"), false);
        this.showWeaponList();
    }

    private onForgeClick(): void {
        SoundManager.instance.playEffect("audioClip/click_x");
        this.setButtonStatus(this.view("bottom/weapon"), false);
        // this.setButtonStatus(this.view("bottom/forge"), true);
        this.setButtonStatus(this.view("bottom/skill"), false);
        this.hideWeaponList();
        UIManager.instance.toastTip(
            this.node, 
            "[武器锻造]敬请期待",
            cc.Color.WHITE,
            1
            )
    }

    private onSkillClick(): void {
        SoundManager.instance.playEffect("audioClip/click_x");
        this.setButtonStatus(this.view("bottom/weapon"), false);
        this.setButtonStatus(this.view("bottom/forge"), false);
        // this.setButtonStatus(this.view("bottom/skill"), true);
        this.hideWeaponList();
        UIManager.instance.toastTip(
            this.node, 
            "[全屏技能]敬请期待",
            cc.Color.WHITE,
            1
            )
    }

    /**
     * 设置开始按钮是否可用
     * @param isActive 
     */
    private setStartStatus(isActive: boolean): void {
        this.view("startBt").active = isActive;
    }

    /**
     * 武器下移，开始游戏
     */
    private weaponMoveDown(): void {
        const weapon = this.view("weapon");
        const target = 50 + weapon.height * 0.5 - cc.winSize.height * 0.5;
        cc.tween(weapon)
            .to(0.6, {position: cc.v2(0, target)} )  //,{easing: "backIn"}
            .call(()=>{this.onWeaponListen()})
            .start();
    }

    /**
     * 武器上移，结束游戏
     */
    private weaponMoveUp(): void {
        const weapon = this.view("weapon");
        cc.tween(weapon)
            .to(0.6, {position: cc.v2(0, 0), angle: 0})
            .call(()=>{this.offWeaponListen()})
            .start();
    }

    /**
     * 显示生命线
     */
    private showLine(): void {
        const line = this.view("line");
        line.opacity = 0;
        line.scaleX = 0;
        cc.tween(line).to(0.3, {opacity: 255, scaleX: 1}).start();
    }

    /**
     * 隐藏生命线
     */
    private hideLine(): void {
        const line = this.view("line");
        line.opacity = 255;
        //line.scaleX = 1;
        cc.tween(line).to(0.6, {opacity: 0, scaleX: 0}).start();
    }

    /**
     * 监听更新玩家血量事件
     * @param event 
     * @param data 
     */
    private onUpdateLife(event, data): void {
        
        this.showLife(data);
        //UIManager.instance.toastTip(this.view("life/count"), "  -1", cc.Color.RED, 0.5)
    }

    /**
     * 显示生命值
     * @param count 更新生命值数量
     */
    private showLife(count: number): void {
        const life = this.view("life");
        life.active = true;
        const hisCnt = life.childrenCount;
        let countOffset = count - hisCnt;
        if(countOffset > 0){
            for(let i = 0; i < countOffset; i++){
                let child = new cc.Node();
                UIManager.instance.createTexture(child, "texture/common/life64");
                life.addChild(child);
                child.opacity = 0;
                child.scale = 0;
                cc.tween(child)
                    .to(0.5, {opacity: 255, scale: 1}, {easing: "backOut"})
                    .start();
            }
        }
        if(countOffset < 0){            
            countOffset = countOffset * (-1);
            let lifes = life.children;
            for(let i = 0; i < countOffset; i++){
                lifes[0] && lifes[0].removeFromParent();
                SoundManager.instance.playVibrate();
            }
        }
    }

    private hidelife(): void {
        this.view("life").active = false;
    }

    /**
     * 展示进度条
     */
    private showProgress(): void {
        const progress = this.view("progress");
        progress.scaleY = 0;
        cc.tween(progress).to(0.5, {scaleY: 1}, {easing: "backOut"}).start();
    }

    private hideProgress(): void {
        const progress = this.view("progress");
        cc.tween(progress).to(0.5, {scaleY: 0}, {easing: "backIn"}).start();
    }

    private onUpdateProgress(event, data): void {
        const fill = this.view("progress/fill");
        const percent = this.view("progress/percent");
        fill.getComponent(cc.Sprite).fillRange = data;
        percent.getComponent(cc.Label).string = `${Math.floor(data * 100)}%`;
    }

    /**
     * 复活界面展示 data: "video" or "share"
     */
    private showResurgence(event, data): void {
        const resurgence = this.view("resurgence");
        const title = this.view("resurgence/title");
        const time = this.view("resurgence/time");
        const icon = this.view("resurgence/icon");

        resurgence.active = true; 
        const resurgenceLife = General.resurgenceLife;

        title.getComponent(cc.Label).string = `复活 生命值+${resurgenceLife}`;
        UIManager.instance.createTexture(icon, `texture/over/${data}`);

        this.onButtonEvent(icon, "onResurgenceClick", data); //复活按钮事件监听

        this.view("resurgence/icon").stopAllActions();

        let resurgenceTime = General.resurgenceTime;
        time.getComponent(cc.Label).string = resurgenceTime + "";

        UIManager.instance.playFuxayEffect(this.view("resurgence/icon"), 0.01, 0.0015); //流光效果

        cc.tween(this.view("resurgence/icon")).parallel(
            //icon抖动
            cc.tween().repeatForever(
                cc.tween()
                    .to(0.1, { scale: 1.1})
                    .to(0.1, { scale: 1 })
                    .to(0.1, { scale: 1.1})
                    .to(0.1, { scale: 1 })
                    .delay(0.6)
            ),
            //倒计时
            cc.tween().repeatForever(
                cc.tween()
                    .call(() => {
                        time.getComponent(cc.Label).string = resurgenceTime + "";
                        if (resurgenceTime < 0) {
                            GameData.instance.gamefail();
                            return;
                        }
                        SoundManager.instance.playEffect("audioClip/time");
                        resurgenceTime--;
                    })
                    .delay(1)
            ),
        )
            .start();
    }

    /**
     * 复活按钮点击事件
     * @param event 
     * @param data  "video" or "share"
     */
    private onResurgenceClick(event, data): void {
        const clickTime = new Date().getTime();
        const timeOffset = clickTime - this.openTime;
        if(timeOffset < 800) return;

        this.playAdReward = PlayAdReward.resurgence;
        if(cc.sys.platform == cc.sys.WECHAT_GAME){
            if(data == "share"){
                this.shareAppMessage();
            }
            else if(data == "video"){
                Advert.instance.showVideoAd();
            }
        }
        else {
            EventManager.instance.dispatch_event(EventList.playAdSuccess, "");
            const nowTime = timestampToTime(new Date().getTime());
            GameData.instance.setVideoOrShareTime("share", nowTime);
        }
        this.openTime = new Date().getTime();
    }

    /**
     * 复活成功回调
     */
    private onResurgenceCallback(): void {
        this.view("resurgence").active = false;
        GameData.instance.resurgence();
    }

    /**
     * 监听游戏结束事件
     * @param event 
     * @param data 
     */
    private onGameOver(event, data): void {
        this.view("resurgence").active = false;
        //延迟一秒弹出结算
        setTimeout(()=>{            
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

            this.showTheEnd();
        }, 1000);        
    }

    /**
     * 展示游戏结束领取金币界面
     * @param coinCnt 领取的金币数量
     */
    private showTheEnd(): void {
        
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
    }

    private hideTheEnd(): void {
        this.view("theEnd").active = false;
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
    private onReceiveCoin(): void {
        const clickTime = new Date().getTime();
        const timeOffset = clickTime - this.openTime;
        if(timeOffset < 2000) return;
        SoundManager.instance.playEffect("audioClip/click_x");

        //播放金币音效及特效
        SoundManager.instance.playEffect("audioClip/coin");
        UIManager.instance.playParticle(this.view("top/coin"), "particle/coin");

        setTimeout(()=>{
            GameData.instance.receiveCoin(1);
            this.updateCoin();
            this.viewInit();
            this.weaponMoveUp();
            this.changelevel();
            this.checkUnlock();
        }, 1000)  
        
        this.openTime = new Date().getTime();
    }

    /**
     * 5倍领取金币按钮事件
     */
    private onMultiReceiveCoin(event, data): void {
        const clickTime = new Date().getTime();
        const timeOffset = clickTime - this.openTime;
        if(timeOffset < 800) return;

        SoundManager.instance.playEffect("audioClip/click_x");
        this.playAdReward = PlayAdReward.multiReceive;
        if(cc.sys.platform == cc.sys.WECHAT_GAME){   
            if(data == "video"){
                Advert.instance.showVideoAd()
            }         
            else if(data == "share"){
                this.shareAppMessage();
            }
        }
        else{
            EventManager.instance.dispatch_event(EventList.playAdSuccess, "");
            const nowTime = timestampToTime(new Date().getTime());
            GameData.instance.setVideoOrShareTime("share", nowTime);
        }
        this.openTime = new Date().getTime();
    }

    /**
     * 观看视频结束 5倍领取金币
     */
    private multiReceive(): void {
        SoundManager.instance.playEffect("audioClip/coin");
        UIManager.instance.playParticle(this.view("top/coin"), "particle/coin");

        setTimeout(()=>{
            GameData.instance.receiveCoin(3);
            this.updateCoin();
            this.viewInit();
            this.weaponMoveUp();
            this.changelevel();
            this.checkUnlock();
        }, 1000)
        
    }

    /**
     * 是否解锁武器
     */
    private checkUnlock(): void {
        const unlockWeapon = GameData.instance.getUnlockWeapon();
        if(unlockWeapon != null){
            this.showUnlockWeapon(unlockWeapon);
        }
    }

    /**
     * 解锁武器
     * @param weapon 
     */
    private showUnlockWeapon(weapon: string): void {
        const unlockWeapon = this.view("unlockWeapon");
        const particleNode = this.view("unlockWeapon/particle");
        const weaponNode = this.view("unlockWeapon/particle/weapon");
        const title = this.view("unlockWeapon/title");

        //特效
        let particle = particleNode.getComponent(cc.ParticleSystem);
        if(!particle){
            particle = particleNode.addComponent(cc.ParticleSystem);
        }
        particle.file = ResLoad.instance.getRes("particle/light_unlock", cc.ParticleAsset);
        particle.resetSystem();
        UIManager.instance.createTexture(weaponNode, `texture/weaponIcon/${weapon}_1`);
        
        this.view("weapon").opacity = 0;
        unlockWeapon.active = true;
        particleNode.scale = 0;
        particleNode.opacity = 0;
        particleNode.y = 0;
        
        title.x = - cc.winSize.width * 0.5 - 200;
        this.view("unlockWeapon/mask").opacity = 128;
        cc.tween(particleNode)
            .to(0.5, {scale: 1.5, opacity: 255}, {easing: "backOut"})
            .start();
        cc.tween(title)
            .to(0.5, {x: 0}, {easing: "backOut"})
            .start();
    }

    private hideUnlockWeapon(): void {
        SoundManager.instance.playEffect("audioClip/click_x");
        const unlockWeapon = this.view("unlockWeapon");
        const particleNode = this.view("unlockWeapon/particle");
        const mask = this.view("unlockWeapon/mask");
        const title = this.view("unlockWeapon/title");
        particleNode.getComponent(cc.ParticleSystem).destroy();
        cc.tween(mask).to(0.5, {opacity: 0}).start();
        cc.tween(title)
            .to(0.5, {x: - cc.winSize.width * 0.5 - 200}, {easing: "backIn"})
            .start();
        cc.tween(particleNode)
            .to(0.5, {y: 50 - cc.winSize.height * 0.5, scale: 0, angle: 360})
            .call(()=>{
                unlockWeapon.active = false;
            })
            .start();
        cc.tween(this.view("weapon")).to(0.5, {opacity: 255}).start();
    }

    /**
     * 更新金币展示数量
     */
    private updateCoin(): void {
        const coinview = this.view("top/coin/count").getComponent(cc.Label);
        const coinCnt = GameData.instance.getCurrentCoin();
        coinview.string = translateNumber(coinCnt);
    }

    /**
     * 下一关动画
     */
    private nextLevel(): void {
        const item_0 = this.view("level/item_0");
        const item_1 = this.view("level/item_1");
        const item_2 = this.view("level/item_2");
        const item_3 = this.view("level/item_3");
        const link_0 = this.view("level/link_0");
        const link_1 = this.view("level/link_1");
        const link_2 = this.view("level/link_2");

        cc.tween(item_0)
            .to(0.3, {x: -264})
            .call(()=>{
                item_0.x = 264;
                item_0.name = "item_3";
            })
            .start();

        cc.tween(item_1)
            .to(0.3, {x: -145, scale: 90 / 142})
            .call(()=>{
                item_1.name = "item_0";
            })
            .start();

        cc.tween(item_2)
            .to(0.3, {x: 0, scale: 1})
            .call(()=>{
                item_2.name = "item_1";
            })
            .start();

        cc.tween(item_3)
            .to(0.3, {x: 145})
            .call(()=>{
                item_3.name = "item_2";
            })
            .start();

        cc.tween(link_0)
            .to(0.3, {x: -204.5})
            .call(()=>{
                link_0.name = "link_2";
                link_0.x = 204.5;
            })
            .start();

        cc.tween(link_1)
            .to(0.3, {x: -85.5})
            .call(()=>{
                link_1.name = "link_0";
            })
            .start();

        cc.tween(link_2)
            .to(0.3, {x: 85.5})
            .call(()=>{
                link_2.name = "link_1";
            })
            .start();
    }

    /**
     * “第几关”下移
     */
    private showLevel(): void {
        const level = this.view("level");
        const highty = cc.winSize.height * 0.5 - 100;
        const lowy = cc.winSize.height * 0.5 - 300;
        level.scale = 0.5;
        level.y = highty;
        cc.tween(level)
            .to(0.6, {y: lowy, scale: 1}, {easing: "backOut"})
            .start();
    }

    /**
     * “第几关”上移
     */
    private hideLevel(): void {
        const level = this.view("level");
        const highty = cc.winSize.height * 0.5 - 100;
        const lowy = cc.winSize.height * 0.5 - 300;
        level.scale = 1;
        level.y = lowy;
        cc.tween(level)
            .to(0.6, {y: highty, scale: 0.5}, {easing: "backIn"})
            .start();
    }

    /**
     * 设置关卡指示
     */
    private setLevel(): void {
        const currentLevel = GameData.instance.getCurrentLevel();

        const label_0 = this.view("level/item_0/label").getComponent(cc.Label);
        const label_1 = this.view("level/item_1/label").getComponent(cc.Label);
        const label_2 = this.view("level/item_2/label").getComponent(cc.Label);
        const label_3 = this.view("level/item_3/label").getComponent(cc.Label);

        label_0.string = (currentLevel - 1).toString();
        label_1.string = (currentLevel).toString();
        label_2.string = (currentLevel + 1).toString();
        label_3.string = (currentLevel + 2).toString();

    }

    /**
     * 是否需要转动关卡指示
     */
    private changelevel(): void {
        const centerLabel = this.view("level/item_1/label").getComponent(cc.Label);
        const currentLevel = GameData.instance.getCurrentLevel();
        if (centerLabel.string != currentLevel.toString()) {
            setTimeout(() => {
                this.nextLevel();
                setTimeout(() => {
                    this.setLevel();
                }, 400)
            }, 600)
        }
    }

    /**
     * 顶部体力、金币节点出现
     */
    private showTop(): void {
        const maxy = cc.winSize.height * 0.5 + 44;
        const mixy = cc.winSize.height * 0.5 - 44;
        const top = this.view("top");
        top.y = maxy;
        cc.tween(top).to(0.6, {y: mixy}, {easing: "backOut"}).start();
    }

    /**
     * 顶部体力、金币节点隐藏
     */
    private hideTop(): void {
        const maxy = cc.winSize.height * 0.5 + 44;
        const mixy = cc.winSize.height * 0.5 - 44;
        const top = this.view("top");
        top.y = mixy;
        cc.tween(top).to(0.6, {y: maxy}, {easing: "backIn"}).start();
    }

    /**
     * 底部按钮出现
     */
    private showButton(): void {
        const fullUseWeapon = GameData.instance.getFullUseWeapon();
        this.view("bottom/weapon/label").active = fullUseWeapon == null ? false : true;
        
        let button = this.view("bottom");
        const posy0 = -cc.winSize.height * 0.5 + button.height * 0.5;
        const posy1 = -cc.winSize.height * 0.5 - button.height * 0.5;
        button.y = posy1;
        cc.tween(button)
            .to(0.6, {y: posy0}, {easing: "backOut"})
            .start();
    }

    /**
     * 底部按钮隐藏
     */
    private hideButton(): void {
        let button = this.view("bottom");
        const posy0 = -cc.winSize.height * 0.5 + button.height * 0.5;
        const posy1 = -cc.winSize.height * 0.5 - button.height * 0.5;
        this.view("bottom/weapon/label").active = false;
        button.y = posy0;
        cc.tween(button)
            .to(0.6, {y: posy1}, {easing: "backIn"})
            .start();
    }

    /**
     * 底部按钮点击状态设置
     * @param node 按钮节点
     * @param isClick 是否是点击状态
     */
    private setButtonStatus(node: cc.Node ,isClick: boolean): void {
        const url = isClick ? "texture/button/onclick" : "texture/button/unclick";
        UIManager.instance.createTexture(node, url);
    }

    /**
     * 左边按钮出现动画
     */
    private showLeft(): void {
        this.view("left/setting").y = 500;
        this.view("left/rank").y = 500;
        this.view("left/share").y = 500;
        cc.tween(this.view("left/share"))
            .to(0.5, {y: -140})    
            .start();
        this.scheduleOnce(()=>{
            cc.tween(this.view("left/rank"))
                .to(0.5, {y: 0})   
                .start();
        }, 0.12)
        this.scheduleOnce(()=>{
            cc.tween(this.view("left/setting"))
                .to(0.5, {y: 140}) 
                .start();
        }, 0.24)
    }

    /**
     * 左边按钮消失动画
     */
    private hideLeft(): void {
        this.view("left/setting").y = 140;
        this.view("left/rank").y = 0;
        this.view("left/share").y = -140;
        const act = cc.tween().to(0.5, {y: 500});
        act.clone(this.view("left/setting")).start();
        this.scheduleOnce(()=>{
            act.clone(this.view("left/rank")).start();
        }, 0.12)
        this.scheduleOnce(()=>{
            act.clone(this.view("left/share")).start();
        }, 0.24)
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
        
        this.openTime = new Date().getTime();
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
        const timeOffset = hideTime - this.openTime;
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

        this.openTime = new Date().getTime();
    }

    private onHideRank(event, data): void {
        const hideTime = new Date().getTime();
        const timeOffset = hideTime - this.openTime;
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


    /**
     * 展示武器选择列表
     */
    private showWeaponList(): void {
        let weaponList = this.view("weaponList");
        weaponList.active = true;
        this.createWeaponList();
    }

    /**
     * 隐藏武器选择列表
     */
    private hideWeaponList(): void {
        if(!this.view("weaponList").active) return;
        SoundManager.instance.playEffect("audioClip/click_s");
        let weaponList = this.view("weaponList");
        weaponList.active = false;
    }

    /**
     * 创建武器列表
     */
    private createWeaponList(): void {
        this.view("weaponList/view/content").removeAllChildren();
        const iconPrefab = ResLoad.instance.getRes("ui_prefabs/weaponIcon");
        for(let key in WeaponList){
            let item = cc.instantiate(iconPrefab);
            this.view("weaponList/view/content").addChild(item);
            item.name = WeaponList[key];
            this.createWeaponIcon(item);            
        }
    }

    private createWeaponIcon(weaponIcon: cc.Node){       
        const weapon = weaponIcon.name;
        const uData = GameData.instance.getUserData(); 
        const userWeaponAttr = uData.weapon[`${weapon}`];
        const whetherHave = userWeaponAttr.whetherHave;
        const weaponLevel = userWeaponAttr.level;
        const fullUseWeapon = GameData.instance.getFullUseWeapon();
        const isFullUsed = fullUseWeapon == weapon;

        //武器图标
        const icon = weaponIcon.getChildByName("icon");
        let resUrl = whetherHave ? `texture/weaponIcon/${weapon}_0` : `texture/weaponIcon/${weapon}_2`;
        UIManager.instance.createTexture(icon, resUrl);

        //升级按钮
        const upgrade = weaponIcon.getChildByName("upgrade");
        const isMax = GameData.instance.assertMaxLevel(weapon, weaponLevel);
        if(isMax || isFullUsed){  //已满级 或者 设定为满级试用
            upgrade.active = false;
        }
        else{
            const upCoin = GameData.instance.getWeaponUpCoin(weapon, weaponLevel+1);
            const upCoinLable = upgrade.getChildByName("number").getComponent(cc.Label);
            upCoinLable.string = translateNumber(upCoin);
            this.UpgradeAction(upgrade.getChildByName("upIcon"));
        }
        upgrade.active = false;
        
        //等级显示
        const level = weaponIcon.getChildByName("icon").getChildByName("level");
        level.active = whetherHave;
        const lv = level.getComponent(cc.Label);
        
        lv.string = isMax? "Max" : `LV${weaponLevel}`;

        //视频图标
        const video = weaponIcon.getChildByName("icon").getChildByName("video");        
        video.active = isFullUsed;

        //事件监听
        this.onButtonEvent(icon, "onWeaponIconClick", {
            weaponIcon: weaponIcon,
            weapon: weapon,
            whetherHave: whetherHave,
            isFullUsed: isFullUsed
        });
        this.onButtonEvent(upgrade, "onUpgradeClick", {
            weaponIcon: weaponIcon,
            weapon: weapon,
            whetherHave: whetherHave,
        });
        
    }

    /**
     * 切换武器icon点击状态
     * @param weaponNode 
     * @param isClick 
     */
    private updateWeaponIconStatus(weaponNode: cc.Node, isClick: boolean): void {
        const weapon = weaponNode.name;
        const uData = GameData.instance.getUserData(); 
        const userWeaponAttr = uData.weapon[`${weapon}`];
        const whetherHave = userWeaponAttr.whetherHave;
        const weaponLevel = userWeaponAttr.level;
        const isMax = GameData.instance.assertMaxLevel(weapon, weaponLevel);
        if(!whetherHave){
            return;
        }
        const resUrl = isClick ? `texture/weaponIcon/${weapon}_1` : `texture/weaponIcon/${weapon}_0`;
        UIManager.instance.createTexture(weaponNode.getChildByName("icon"), resUrl);
        weaponNode.getChildByName("upgrade").active = isClick && !isMax;
    }

    /**
     * 升级图标跳动
     * @param node 
     */
    private UpgradeAction(node: cc.Node): void {
        node.stopAllActions();
        node.y = 0;        
        cc.tween(node)
            .repeatForever(
                cc.tween()
                .delay(2)
                .to(0, {y: 0})
                .by(0.2, { y: 10 })
                .by(0.2, { y: -10 })
                .by(0.2, { y: 10 })
                .by(0.2, { y: -10 })                
            )
            .start()
    }

    /**
     * 武器icon点击事件
     */
    private onWeaponIconClick(event, data): void {
        SoundManager.instance.playEffect("audioClip/click_s");
        if(!data.whetherHave){  //武器未解锁，不做任何处理
            return;
        }
        this.weaponClick = data.weapon;

        //有满级试用机会
        if(data.isFullUsed){
            this.playAdReward = PlayAdReward.fullUsed;
            if(cc.sys.platform === cc.sys.WECHAT_GAME){
                //调用视频广告组件                
                Advert.instance.showVideoAd();
            }
            else{ //调试用,模拟看完视频
                EventManager.instance.dispatch_event(EventList.playAdSuccess,"");
                const nowTime = timestampToTime(new Date().getTime());
                GameData.instance.setVideoOrShareTime("video", nowTime);
            }            
        }
        else{
            this.onWeaponIconClickCallback();
        }       
    }

    /**
     * 切换主武器
     */
    private onWeaponIconClickCallback(): void {
        //UIManager.instance.playParticle(this.view("weapon"), "particle/click");
        this.weapon = this.weaponClick;
        GameData.instance.updateLastWeapon(this.weapon);   //主武器切换
        this.updateWeaponStatus(this.weapon, ShootStatus.Ready)
        const icons = this.view("weaponList/view/content").children;
        //icon点击状态切换
        icons.forEach(element => {
            this.updateWeaponIconStatus(element, element.name == this.weapon);
        })
    }

    private onUpgradeClick(event, data): void {
        const weapon = data.weapon;
        const isOk = GameData.instance.weaponUpgrade(weapon);
        if(!isOk){
            SoundManager.instance.playEffect("audioClip/click_s");
            UIManager.instance.toastTip(this.node, "金币不足", cc.Color.WHITE, 1);
            return;
        }

        UIManager.instance.playParticle(this.view("weapon"), "particle/upgrade");
        SoundManager.instance.playEffect("audioClip/upgrade");

        this.updateCoin(); //更新金币展示
        const uData = GameData.instance.getUserData(); 
        const weaponLevel = uData.weapon[`${weapon}`].level;
        const isMax = GameData.instance.assertMaxLevel(weapon, weaponLevel);

        const level = data.weaponIcon.getChildByName("icon").getChildByName("level");
        const lv = level.getComponent(cc.Label);        
        lv.string = isMax? "Max" : `LV${weaponLevel}`;

        if(!isMax){
            const upCoin = GameData.instance.getWeaponUpCoin(weapon, weaponLevel+1);
            const number = data.weaponIcon.getChildByName("upgrade").getChildByName("number");
            const upCoinLable = number.getComponent(cc.Label);
            upCoinLable.string = translateNumber(upCoin);
        }
        else{
            data.weaponIcon.getChildByName("upgrade").active = false;
        }
    }

    /**
     * 观看视频广告成功回调
     */
    private onPlayAdSuccess(event, data): void {
        switch(this.playAdReward){
            case PlayAdReward.fullUsed:
                GameData.instance.fullUseBegin();
                this.onWeaponIconClickCallback();
                this.gameStart();
                break;
            case PlayAdReward.receiveCoin:
                SoundManager.instance.playEffect("audioClip/coin");
                UIManager.instance.playParticle(this.view("top/coin"), "particle/coin");
                setTimeout(()=>{
                    GameData.instance.freeReceiveCoin();
                    this.hideFreeReceive("","");
                    this.updateCoin();
                }, 1000)                 
                break;
            case PlayAdReward.receiveEnergy:
                SoundManager.instance.playEffect("audioClip/receiveEnergy");
                let child = UIManager.instance.nodeClone(this.node, this.view("freeReceive/window/icon"));
                cc.tween(child)
                    .to(0.1, {scale: 1.5})
                    .delay(0.2)
                    .to(0.7, {scale: 0, position: this.view("top").position})
                    .call(()=>{
                        Energy.instance.energyChange(EnergyConfig.freeReceive);
                        this.hideFreeReceive("","");
                        child.destroy();
                    })
                    .start();
                
                this._setEnergy();
                break;
            case PlayAdReward.multiReceive:
                this.multiReceive();
                break;
            case PlayAdReward.resurgence:
                this.onResurgenceCallback();
                break;
        }
        this.playAdReward = null;
        this.shareStartTime = 0;
        
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
                cc.Color.WHITE, 1);
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

        this.openTime = new Date().getTime();
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
        const timeOffset = clickTime - this.openTime;
        if(timeOffset < 800) return;

        SoundManager.instance.playEffect("audioClip/click_x");
        //保存分享/视频 对应的奖励类型，方便回调调用
        this.playAdReward = 
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
                this.shareAppMessage();
            }
            else {
                EventManager.instance.dispatch_event(EventList.playAdSuccess, "");
                const nowTime = timestampToTime(new Date().getTime());
                GameData.instance.setVideoOrShareTime("share", nowTime);
            }
        }
        this.openTime = new Date().getTime();
    }

    private hideFreeReceive(event, data): void {
        const hideTime = new Date().getTime();
        const timeOffset = hideTime - this.openTime;
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


/************************************************************************************ */

    /**
     * 武器添加触摸事件
     */
    private onWeaponListen(): void {
        //const weapon = this.view("weapon");
        const touchArea = this.view("touchArea");
        touchArea.on(
            cc.Node.EventType.TOUCH_START, 
            this.onWeaponTouchStart, 
            this
        );
        touchArea.on(
            cc.Node.EventType.TOUCH_MOVE, 
            this.onWeaponTouchMove, 
            this
        );
        touchArea.on(
            cc.Node.EventType.TOUCH_END, 
            this.onWeaponTouchEnd, 
            this
        );
        touchArea.on(
            cc.Node.EventType.TOUCH_CANCEL, 
            this.onWeaponTouchCancel, 
            this
        );
    }

    /**
     * 武器关闭触摸事件
     */
    private offWeaponListen(): void {
        this.view("touchArea").targetOff(this);
    }

    /**
     * 持续生成太阳
     */
    // private startGenSuns(): void {
    //     this.stopGenSuns();
    //     const interval = GameData.instance.getCurrentLevelConfig().interval;
    //     this.schedule(
    //         this.genSun, 
    //         interval, 
    //         cc.macro.REPEAT_FOREVER, 
    //         0
    //     );
    // }

    // private stopGenSuns(): void {
    //     this.unschedule(this.genSun);
    // }

    // private genSun(): void {
    //     const identify = GameData.instance.isNeedGenSun();
    //     if(identify){
    //         this.createSun();
    //         GameData.instance.genSun();
    //     }
    // }

    private createSun(event, data): void {
        const sunPrefab = ResLoad.instance.getRes("ui_prefabs/sun");
        const sun = cc.instantiate(sunPrefab);
        this.view("suns").addChild(sun);
        let s = sun.addComponent("sun");
        s.move();
    }



/*****************武器控制Begin******************* */

    /**
     * 更新武器图片
     * @param weapon 武器类型
     * @param status 武器状态
     */
    private updateWeaponStatus(weapon: string, status: number): void {
        const url = `texture/weapon/${weapon}_${status}`;
        UIManager.instance.createTexture(this.view("weapon"), url);
        cc.tween(this.view("weapon"))
            .to(0.1, {scale: 1.1})
            .to(0.1, {scale: 0.95})
            .to(0.1, {scale: 1})
            .start();
    }

    private onWeaponTouchStart(t): void {
        this.togetherGas && UIManager.instance.stopParticle(this.togetherGas);
        this.togetherGas 
            = UIManager.instance.playParticle(this.view("weapon"), "particle/juqi");
        this.updateWeaponStatus(this.weapon, ShootStatus.Ready);
    }

    private onWeaponTouchMove(t): void {
        const wpos = t.getLocation();
        const targetpos = this.node.convertToNodeSpaceAR(wpos);
        const pos =  targetpos.sub(this.view("weapon"));
        if(pos.y > 0){
            this.view("weapon").angle = pos.x >= 0 ? 90 : -90;
        }
        else{
            const cosPos = pos.x / (Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2)));
            const radian = Math.acos(-cosPos);
            const degree = radian * 180 / Math.PI;
            this.view("weapon").angle = degree - 90;
        }
    }

    private onWeaponTouchEnd(): void {
        this.togetherGas && UIManager.instance.stopParticle(this.togetherGas);
        this.togetherGas = null;
        this.arrowShoot();
    }

    private onWeaponTouchCancel(): void {
        this.togetherGas && UIManager.instance.stopParticle(this.togetherGas);
        this.togetherGas = null;
        this.arrowShoot();
    }

    /**
     * 创建“箭”节点
     * @param angle 发射角度
     */
    private createArrow(angle): void {
        SoundManager.instance.playEffect("audioClip/shoot");
        let arrow = new cc.Node();
        this.view("arrows").addChild(arrow);
        const url = `texture/weapon/${this.weapon}_arrow`;
        UIManager.instance.createTexture(arrow, url);  
        //UIManager.instance.createMotionStreak(arrow, url);
        let ctrl = arrow.addComponent("arrow");
        ctrl.shoot(angle, url); 
    }

    /**
     * 发射不同数量的箭，主要用于处理三箭齐发和三箭连发
     */
    private arrowShoot(): void {
        
        const angle = this.view("weapon").angle;
        switch (this.weapon) {
            case WeaponList.TripleArrow:
                this.tripleArrow(angle);
                break;
            case WeaponList.ContinuousArrow:
                this.continuousArrow(angle);
                break;
            default:
                this.createArrow(angle);
                break;
        }
        this.updateWeaponStatus(this.weapon, ShootStatus.NotBegin);       
    }

    /**
     * 三箭齐发
     */
    private tripleArrow(angle): void {
        this.createArrow(angle);
        this.createArrow(angle + General.TripleArrowInterval);
        this.createArrow(angle - General.TripleArrowInterval);
    }

    /**
     * 三箭连发
     */
    private continuousArrow(angle): void {
        this.createArrow(angle);
        let i = 0;
        let handler = setInterval(()=>{
            this.createArrow(angle);
            i ++;
            if(i === 2){
                clearInterval(handler);
            }
        }, 120)
    }

    /**
     * 三箭齐发 + 三箭连发
     */
    private continuousTripleArrowArrow(angle): void {
        this.tripleArrow(angle);
        let i = 0;
        let handler = setInterval(()=>{
            this.tripleArrow(angle);
            i ++;
            if(i === 2){
                clearInterval(handler);
            }
        }, 200)
    }

/*****************武器控制End******************* */

    /**
     * 体力数值展示,第秒更新一次
     */

    private setEnergy(): void {
        this.schedule(this._setEnergy, 1, cc.macro.REPEAT_FOREVER, 0);
    }

    private _setEnergy(): void {
        const cntNode = this.view("top/energy/count");
        const timeNode = this.view("top/energy/time");
        cntNode.getComponent(cc.Label).string = Energy.instance.currentCnt + "";
        if(Energy.instance.timerStatus){
            let sec = Energy.instance.countdownTime % 60;
            let secStr = sec < 10 ? "0" + sec : sec + "";
            let min = Math.floor(Energy.instance.countdownTime / 60);
            let minStr = min < 10 ? "0" + min : min + "";
            timeNode.getComponent(cc.Label).string = minStr + ":" + secStr + "  +1";
        }
        else{
            timeNode.getComponent(cc.Label).string = "";
        }
    }

    /**
     * 分享
     * @param rewardType 分享获得的奖励类型
     */
    private shareAppMessage(): void {
        const time = new Date().getTime();
        this.shareStartTime = time;
        openDomain.shareAppMessage();
    }

    private onShareCallback(): void {
        if(this.playAdReward == null || this.shareStartTime == 0){
            return;
        }
        const time = new Date().getTime();
        const timeOffset = time - this.shareStartTime;
        if(timeOffset < 2000){
            UIManager.instance.toastTip(this.node, "分享失败", cc.Color.WHITE, 1);
        }
        else{
            UIManager.instance.toastTip(this.node, "分享成功", cc.Color.WHITE, 1);
            EventManager.instance.dispatch_event(EventList.playAdSuccess, "");

            const nowTime = timestampToTime(new Date().getTime());
            GameData.instance.setVideoOrShareTime("share", nowTime);
        }
    }

}

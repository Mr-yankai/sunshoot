import BaseView from "./baseView"
import GameData from '../dataCenter/gameData';
import UIManager from '../managers/UIManager';
import EventManager from '../managers/eventManager';
import SoundManager from "../managers/soundManager"
import {EventList, ShootStatus, PlayAdReward} from '../config/Enumeration' ;
import {EnergyConfig} from '../config/Global'
import ResLoad from '../managers/resLoad';
import {translateNumber, timestampToTime} from '../utills/common';
import {openDomain} from "../wx/openDomain"
import Energy from "../dataCenter/energy";
import LeftBtn from "./leftBtn";
import BottomBtn from "./bottomBtn";
import FreeReceive from "./freeReceive";
import Fight from "./fight";
import Settlement from "./settlement";

const { ccclass, property } = cc._decorator;



@ccclass
export default class homeUI_ctrl extends BaseView {

    public weapon: string = null;
    public skill: string = null;
    public weaponClick: string = null;
    //public skillClick: string = null;
    public playAdReward: PlayAdReward = null;
    private shareStartTime: number = 0;
    public togetherGas: cc.ParticleSystem = null;
    public openTime: number = 0;

    private leftBtn: LeftBtn;
    private bottomBtn: BottomBtn;
    private freeReceive: FreeReceive;
    public fight: Fight;
    public settlement: Settlement;

    onLoad(): void {

        this.name = "homeUI_ctrl";

        this.leftBtn = this.node.addComponent("leftBtn");
        this.bottomBtn = this.node.addComponent("bottomBtn");
        this.freeReceive = this.node.addComponent("freeReceive");
        this.fight = this.node.addComponent("fight");
        this.settlement = this.node.addComponent("settlement");


        cc.game.on(cc.game.EVENT_SHOW, this.onShareCallback, this);

        this.onButtonEvent(this.view("startBt"), "onBlankClick", "")
        
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

        EventManager.instance.add_event_listener(
            EventList.combo,
            this,
            this.showCombo
        )
    }

    /**
     * 监听event:展示复活界面 data: "video" or "share"
     */
    private showResurgence(event, data): void {
        this.fight.showResurgence(data);
    }

    /**
     * 监听event:游戏结束事件 data:奖励数量
     */
    private onGameOver(event, data): void {
        this.fight.gameOver(data);        
    }

    /**
     * 监听event:更新玩家血量事件 data:生命值
     */
    private onUpdateLife(event, data): void {       
        this.fight.showLife(data);
    }

    /**
     * 监听event: 观看视频广告成功回调
     */
    private onPlayAdSuccess(event, data): void {
        switch(this.playAdReward){
            case PlayAdReward.fullUsed:
                GameData.instance.fullUseBegin();
                this.bottomBtn.onWeaponIconClickCallback();
                this.gameStart();
                break;
            case PlayAdReward.receiveCoin:
                SoundManager.instance.playEffect("audioClip/coin");
                UIManager.instance.playParticle(this.view("top/coin"), "particle/coin");
                setTimeout(()=>{
                    GameData.instance.freeReceiveCoin();
                    this.freeReceive.hideFreeReceive("","");
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
                        GameData.instance.receiveEnergy(EnergyConfig.freeReceive);
                        this.freeReceive.hideFreeReceive("","");
                        child.destroy();
                    })
                    .start();
                
                this._setEnergy();
                break;
            case PlayAdReward.multiReceive:
                this.settlement.multiReceive();
                break;
            case PlayAdReward.resurgence:
                this.fight.onResurgenceCallback();
                break;
        }
        this.playAdReward = null;
        this.shareStartTime = 0;
        
    }  

    /**
     * 监听event: 产生太阳
     */
    private createSun(event, data): void {
        const sunPrefab = ResLoad.instance.getRes("ui_prefabs/sun");
        const sun = cc.instantiate(sunPrefab);
        this.view("suns").addChild(sun);
        let s = sun.addComponent("sun");
        s.move();
    }

    /**
     * 监听event: 展示combo
     */
    private showCombo(event, data): void {
        const combo = this.view("combo");
        combo.active = true;
        const textureUrl = data == "miss" ? "texture/common/miss" : "texture/common/combo";
        UIManager.instance.createTexture(combo.getChildByName("texture"), textureUrl);
        const str = combo.getChildByName("number").getComponent(cc.Label);
        str.string = data == "miss" ? "" : "X" + data;
        combo.stopAllActions();
        combo.opacity = 0;
        combo.scale = 1.5;
        cc.tween(combo)
            .to(0.1, {opacity: 255, scale: 1})
            .delay(0.5)
            .to(0.1, {opacity: 0})
            .call(()=>{
                combo.active = false;
            })
            .start();
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
        if(timeOffset < 1000) return;
        if(this.view("weaponList").active || this.view("skillList").active){
            this.bottomBtn.hideWeaponList();
            this.bottomBtn.hideSkillList();
            this.bottomBtn.setButtonStatus(this.view("bottom/weapon"), false);
            this.bottomBtn.setButtonStatus(this.view("bottom/task"), false);
            this.bottomBtn.setButtonStatus(this.view("bottom/skill"), false);
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
                    0.5
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
        this.bottomBtn.hideWeaponList();
        this.hideButton();
        this.hideTop();
        this.hideLevel();
        this.hideLeft();
        this.weaponMoveDown();
        this.scheduleOnce(()=>{
            this.setStartStatus(false) ;   
            this.showLine();
            this.showSkill();
            const life = GameData.instance.getPlayerBlood();
            this.fight.showLife(life);
            this.showProgress();
        } ,0.5)  
    }

    private viewInit(): void {
        this.fight.updateWeaponStatus(this.weapon, ShootStatus.Ready);
        this.showButton();
        this.showTop();
        this.showLeft();
        this.showLevel();
        this.bottomBtn.hideWeaponList();
        this.bottomBtn.hideSkillList();
        this.hideLine(); 
        this.hidelife();
        this.hideSkill();
        this.hideProgress();
        this.updateCoin();
        this.setStartStatus(true);
    }

    public backHome(): void {
        this.updateCoin();
        this.viewInit();
        this.weaponMoveUp();
        this.changelevel();
        this.checkUnlock();
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
            .call(()=>{
                this.fight.onWeaponListen()
            })
            .start();
    }

    /**
     * 武器上移，结束游戏
     */
    private weaponMoveUp(): void {
        const weapon = this.view("weapon");
        cc.tween(weapon)
            .to(0.6, {position: cc.v2(0, 0), angle: 0})
            .call(()=>{this.fight.offWeaponListen()})
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

    
    /**隐藏生命节点 */
    private hidelife(): void {
        this.view("life").active = false;
    }

    /**显示技能施放节点 */
    private showSkill(): void {
        //this.view("skillRoot").active = true;
        this.fight.skillInit();
        
    }

    /**隐藏技能施放节点 */
    private hideSkill(): void {
        this.view("skillRoot").active = false;
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
        this.fight.updateProgress(data);
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

        this.onButtonEvent(this.view("unlockWeapon/mask"), "hideUnlockWeapon", "");
    }

    private hideUnlockWeapon(event, data): void {
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
    public updateCoin(): void {
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

        if(currentLevel == 1){
            label_0.string = "";
        }

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
     * 体力数值展示,第秒更新一次
     */

    private setEnergy(): void {
        this.schedule(this._setEnergy, 1, cc.macro.REPEAT_FOREVER, 0);
    }

    public _setEnergy(): void {
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
     * 分享转发(有奖励)
     */
    public shareAppMessage(): void {
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
            UIManager.instance.toastTip(this.node, "分享失败", cc.Color.WHITE, 0.5);
        }
        else{
            UIManager.instance.toastTip(this.node, "分享成功", cc.Color.WHITE, 0.5);
            EventManager.instance.dispatch_event(EventList.playAdSuccess, "");

            const nowTime = timestampToTime(new Date().getTime());
            GameData.instance.setVideoOrShareTime("share", nowTime);
        }
    }

}

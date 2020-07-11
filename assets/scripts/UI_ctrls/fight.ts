import BaseView from "./baseView";
import GameData from '../dataCenter/gameData';
import UIManager from '../managers/UIManager';
import EventManager from '../managers/eventManager';
import SoundManager from "../managers/soundManager"
import {General, EventList, WeaponList, ShootStatus, PlayAdReward, SkillList} from '../config/Global'
import {timestampToTime} from '../utills/common';
import Advert from "../wx/advert";
import homeUI_ctrl from "./homeUI_ctrl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Fight extends BaseView {

    private homeUI_ctrl: homeUI_ctrl;

    private focoRate: number = 0;       //蓄力比例
    private isFocoing: boolean = false; //是否开始蓄力

    onLoad () {
        this.name = "fight";
        this.homeUI_ctrl = this.getComponent("homeUI_ctrl");
    }

    start () {
        this.onButtonEvent(
            this.view("skillRoot/switch"),
            "onSwitchClick",
            ""
        )
    }

    /**
     * 武器添加触摸事件
     */
    public onWeaponListen(): void {
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
    public offWeaponListen(): void {
        this.view("touchArea").targetOff(this);
    }

    private onWeaponTouchStart(t): void {
        this.homeUI_ctrl.togetherGas && UIManager.instance.stopParticle(this.homeUI_ctrl.togetherGas);
        this.homeUI_ctrl.togetherGas 
            = UIManager.instance.playParticle(this.view("weapon"), "particle/juqi");
        this.updateWeaponStatus(this.homeUI_ctrl.weapon, ShootStatus.Ready);
        UIManager.instance.playGlowingEffect(this.view("weapon"));

        this.isFocoing = true;
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
        UIManager.instance.stopGlowingEffect(this.view("weapon"))
        this.homeUI_ctrl.togetherGas && UIManager.instance.stopParticle(this.homeUI_ctrl.togetherGas);
        this.homeUI_ctrl.togetherGas = null;
        this.arrowShoot();

        this.isFocoing = false;
    }

    private onWeaponTouchCancel(): void {
        UIManager.instance.stopGlowingEffect(this.view("weapon"))
        this.homeUI_ctrl.togetherGas && UIManager.instance.stopParticle(this.homeUI_ctrl.togetherGas);
        this.homeUI_ctrl.togetherGas = null;
        this.arrowShoot();

        this.isFocoing = false;
    }

    /**
     * 更新武器图片
     * @param weapon 武器名称
     * @param status 武器状态
     */
    public updateWeaponStatus(weapon: string, status: number): void {
        const url = `texture/weapon/${weapon}_${status}`;
        UIManager.instance.createTexture(this.view("weapon"), url);
        cc.tween(this.view("weapon"))
            .to(0.1, {scale: 1.1})
            .to(0.1, {scale: 0.95})
            .to(0.1, {scale: 1})
            .start();
    }

    /**
     * 创建“箭”节点
     * @param angle 发射角度
     */
    private createArrow(angle): void {
        SoundManager.instance.playEffect("audioClip/shoot");
        let arrow = new cc.Node();
        this.view("arrows").addChild(arrow);
        const url = `texture/weapon/${this.homeUI_ctrl.weapon}_arrow`;
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
        switch (this.homeUI_ctrl.weapon) {
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
        this.updateWeaponStatus(this.homeUI_ctrl.weapon, ShootStatus.NotBegin);       
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

    /**
     * 显示生命值
     * @param count 更新生命值数量
     */
    public showLife(count: number): void {
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

    /**更新游戏进度(进度条) */
    public updateProgress(data): void {
        const fill = this.view("progress/fill");
        const percent = this.view("progress/percent");
        fill.getComponent(cc.Sprite).fillRange = data;
        percent.getComponent(cc.Label).string = `${Math.floor(data * 100)}%`;
    }

    /**
     * 复活界面展示 data: "video" or "share"
     */
    public showResurgence(data): void {
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

        UIManager.instance.playFuxayEffect(this.view("resurgence/icon"), 0.03, 0.01, 2.0); //流光效果

        cc.tween(this.view("resurgence/icon")).parallel(
            //icon抖动
            cc.tween().repeatForever(
                cc.tween()
                    .delay(1.5)
                    .to(0.1, { angle: -5})
                    .to(0.1, { angle: 5 })
                    .to(0.1, { angle: -5})
                    .to(0.1, { angle: 0})
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
        const timeOffset = clickTime - this.homeUI_ctrl.openTime;
        if(timeOffset < 800) return;

        this.homeUI_ctrl.playAdReward = PlayAdReward.resurgence;
        if(cc.sys.platform == cc.sys.WECHAT_GAME){
            if(data == "share"){
                this.homeUI_ctrl.shareAppMessage();
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
        this.homeUI_ctrl.openTime = new Date().getTime();
    }

    /**
     * 复活成功回调
     */
    public onResurgenceCallback(): void {
        this.view("resurgence").active = false;
        GameData.instance.resurgence();
    }

    /**游戏结束界面 */
    public gameOver(data): void {
        this.view("resurgence").active = false;
        //延迟一秒弹出结算
        setTimeout(()=>{            
            this.homeUI_ctrl.settlement.showTheEnd(data);
        }, 1000);
    }

    /**
     * 更新蓄力比例
     */
    private updateFocoRate(): void {
        const progress = this.view("skillRoot/switch/progress");
        progress.getComponent(cc.Sprite).fillRange = this.focoRate;
    }

    /**技能施放按钮点击事件 */
    private onSwitchClick(event, data): void {
        if(this.focoRate < 1){
            UIManager.instance.toastTip(this.node, "蓄力未满", cc.Color.WHITE, 1);
            return;
        }
        this.view("skillRoot/skill").active = true;
        switch (this.homeUI_ctrl.skill) {
            case SkillList.wind:
                this.playWindSkill();
                break;
            case SkillList.fist:
                this.playFistSkill();
                break;
            default:
                break;
        }
        this.focoRate = 0;
        this.updateFocoRate();
    }


    /**技能初始化 */
    public skillInit(): void {
        this.view("skillRoot/skill").active = false;
        this.view("skillRoot/skill").children.forEach(element=>{
            element.active = false;
        })
        this.focoRate = 0;
        this.updateFocoRate();
    }

    /**
     * 施放技能：wind
     */
    private playWindSkill(): void {
        const wind = this.view("skillRoot/skill/wind");
        wind.active = true;
        wind.scale = 0;
        wind.opacity = 0;
        wind.setPosition(cc.v2(0, 0));
        wind.stopAllActions();
        
        const particle = wind.getComponent(cc.ParticleSystem);
        particle.resetSystem();
        cc.tween(wind)
            .to(1, {scale: 1, opacity: 255, x: Math.random() * 200 - 100, y: 100})
            .to(2, {x: Math.random() * 400 - 200, y: 300})
            .to(2, {x: Math.random() * 400 - 200, y: 600})
            .to(2, {x: Math.random() * 400 - 200, y: 900})
            .to(1.5, {scale: 0, opacity: 0, x: Math.random() * 200 - 100, y: 380 + cc.winSize.height * 0.5})
            .call(()=>{
                wind.children.forEach(element=>{
                    element.destroy();
                })
                wind.setPosition(cc.v2(0, 0));
                wind.active = false;
            })
            .start();
    }

    /**
     * 施放技能：fist
     */
    private playFistSkill(): void {
        const fist = this.view("skillRoot/skill/fist");
        fist.active = true;
        const fistUpDown = fist.getChildByName("fistUpDown");
        UIManager.instance.createTexture(fistUpDown, "texture/common/fistUp");
        fistUpDown.scale = 0;
        fistUpDown.opacity = 255;
        cc.tween(fistUpDown)
            .to(0.5, {scale: 3}, {easing: "backOut"})
            .call(()=>{
                UIManager.instance.createTexture(fistUpDown, "texture/common/fistDown");
                const wave = fist.getChildByName("wave");
                const particle = wave.getComponent(cc.ParticleSystem);
                particle.resetSystem();
            })
            .to(0.5, {scale: 0.8}, {easing: "backIn"})
            .call(()=>{
                EventManager.instance.dispatch_event(EventList.castSkill, SkillList.fist);
            })
            .to(1, {opacity: 0})
            .start();
        
    }

    update(dt): void {
        if(!this.isFocoing) return;
        const attr = GameData.instance.getSkillAttr(this.homeUI_ctrl.skill);
        const coolTime = attr["coolDownTime"];
        this.focoRate += dt / coolTime;
        if(this.focoRate > 1){
            this.focoRate = 1;
        }
        this.updateFocoRate();
        
    }
    
}

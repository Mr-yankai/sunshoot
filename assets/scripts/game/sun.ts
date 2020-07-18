
import UIManager from "../managers/UIManager";
import GameData from "../dataCenter/gameData";
import {WeaponList, GameProgress, EventList, SkillList} from "../config/Enumeration" 
import {General} from "../config/Global"
import SoundManager from "../managers/soundManager";
import {translateNumber} from '../utills/common';
import EventManager from "../managers/eventManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Sun extends cc.Component {

    private isMove: boolean = false;
    private moveTime: number = 0;
    private speedx: number = 0;
    private speedy: number = 0;
    private fullBlood: number = 0;
    private blood: number = 0;
    private scaleRatio: number = 1;
    //private collisionPositon: cc.Vec2;

    onLoad () {      
        this.node.x = ((Math.random() - 0.5) * cc.winSize.width) * 0.8;
        this.node.y = this.node.height * 0.5;
        //this.node.group = "SUN";
        let ccl = this.node.getComponent(cc.CircleCollider);
        ccl.radius = this.node.getChildByName("body").width ;  
        
        this.scaleRatio = 1 + Math.random() / 4;
        this.node.scale = this.scaleRatio;
    }

    start () {
        this.getSunBlood();
        this.updateBlood(); 
        this.getRandomSpeed(); 
        this.lightRotateAction();

        EventManager.instance.add_event_listener(EventList.castSkill, this, this.onSkill);
    }

    /**
     * 更换太阳皮肤
     */
    private updateSunSkin(): void {
        const bloodLeft = this.blood / this.fullBlood;
        let index = 0;
        if(bloodLeft > 0.7){
            index = Math.floor(Math.random() * 4) +1;
        }
        else if(bloodLeft > 0.3){
            index = Math.floor(Math.random() * 3) + 5;
        }
        else {
            index = Math.floor(Math.random() * 3) + 8;
        }
        const sunUrl = `texture/sun/sun_${index}` ;
        const lightUrl = `texture/sun/light_${index}` ;
        UIManager.instance.createTexture(this.node.getChildByName("body"), sunUrl);
        UIManager.instance.createTexture(this.node.getChildByName("light"), lightUrl);
    }

    /**
     * 获取初始血量
     */
    private getSunBlood(): void {
        const currenLevelConfig = GameData.instance.getCurrentLevelConfig();
        this.fullBlood = Math.random() * (
            currenLevelConfig.maxBlood 
            - currenLevelConfig.mixBlood
            ) 
            + currenLevelConfig.mixBlood;
        this.blood = this.fullBlood;
        
    }

    /**
     * 更新太阳移动速度及方向
     */
    private getRandomSpeed(): void {

        this.speedx = (
            General.SunHorizontalSpeed[1] 
            - General.SunHorizontalSpeed[0]
            ) * Math.random() 
            + General.SunHorizontalSpeed[0];

        this.speedy = (
            General.SunVerticalSpeed[1] 
            - General.SunVerticalSpeed[0]
            ) * Math.random() 
            + General.SunVerticalSpeed[0];
    }

    private lightRotateAction(): void {
        const light = this.node.getChildByName("light");

        cc.tween(this.node).repeatForever(
            cc.tween()
                .to(2, { scale: 0.9 })
                .delay(1)
                .to(1, { scale: 1.1 })
        )
        .start()
        cc.tween(light).repeatForever(
            cc.tween()
                .by(5, {angle: 180})
                .delay(1.5)
                .by(10, {angle: -270})
        )                   
        .start()
    }


    /**
     * 更新血量数值
     */
    private updateBlood(): void {
        const blood = this.node.getChildByName("blood");
        let label = blood.getComponent(cc.Label);
        label.string = Math.floor(this.blood).toString();
        this.updateSunSkin();
    }

    /**
     * 爆炸
     */
    private explode(): void {
        UIManager.instance.playParticle(this.node, "particle/explode");
        SoundManager.instance.playEffect("audioClip/explode");       
    }

    /**
     * 开始移动
     */
    public move(): void {
        this.isMove = true;
    }

    private moveStop(): void {
        this.isMove = false;
    }

    /**
     * 碰撞检测：被箭射中/技能击中 回调
     * @param other 其它碰撞组件
     * @param self 自身碰撞组件
     */
    private onCollisionEnter(other, self): void {
        switch (other.node.group) {
            case "WIND":
                this.onWindCollision(other, self);
                break;
            case "SKILLARROW":
                this.onSkillArrowCollision(other, self);
                break;
            case "FIREWORK":
                this.onFireworkCollision(other, self);
                break;
            default:
                this.onArrowCollision(other, self);
                break;
        }
    }

    /**
     * 击中对象：风
     */
    private onWindCollision(other, self): void {
        this.oncCollisionDeformation(false, true);
        this.moveStop();
        const wpos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const pos = other.node.convertToNodeSpaceAR(wpos);
        this.node.parent = other.node;
        this.node.setPosition(pos)
        cc.tween(this.node)
            .to(1, { position: cc.v2(0, 0), scale: 0 })
            .call(() => {
                this.blood = 0;
                //this.node.removeFromParent();
                this.node.destroy();
            })
            .start();
    }

    /**
     * 击中对象：技能箭--arrowBlizzard or arrowRound
     */
    private onSkillArrowCollision(other, self): void {
        this.oncCollisionDeformation(true, true);
        const skill = GameData.instance.getCurrentSkill();
        const damageRate = GameData.instance.getSkillAttr(skill).damageRate;
        this.blood -= damageRate * this.fullBlood;
        this.updateBlood();
        if (this.blood <= 0) { 
            this.explode();
            this.node.destroy();
        }
    }

    /**
     * 击中对象：防火墙
     */
    private onFireworkCollision(other, self): void {
        const upDistance = Math.random() * 40 + 40;
        cc.tween(this.node).by(0.5, {y: upDistance}).start();
    }

    /**
     * 击中对象：箭
     */
    private onArrowCollision(other, self): void {
        this.oncCollisionDeformation(true, true);
        //this.collisionPositon = self.world.position;
        const weapon = GameData.instance.getCurrentWeapon();
        switch (weapon) {
            case WeaponList.GeneralArrow:
            case WeaponList.TripleArrow:
            case WeaponList.ContinuousArrow:
                this.onUnbuff();
                break;
            case WeaponList.CritArrow:   //暴击
                this.onHitCritArrow(self.node);
                break;
            case WeaponList.FrozenArrow: //冰冻
                this.onHitFrozenArrow(self.node);
                break;
            case WeaponList.PierceArrow: //穿透
                this.onHitPierceArrow(self.node, other.node);
                break;
            default:
                break;
        }

        if (this.blood <= 0) {
            this.explode();
            this.node.destroy();
        }
    }

    /**
     * 被箭击中动画效果
     */
    private oncCollisionDeformation(isScale: boolean, isPeng: boolean): void {
        if(isScale){
            cc.tween(this.node)
                .to(0.1, {scaleX: 1.05 * this.scaleRatio, scaleY: 0.95 * this.scaleRatio}, {easing: "backOut"})
                .to(0.1, {scaleX: 0.95 * this.scaleRatio, scaleY: 1.05 * this.scaleRatio}, {easing: "backOut"})
                .to(0.1, {scaleX: this.scaleRatio, scaleY: this.scaleRatio}, {easing: "backOut"})
                .start();
        }
        if(isPeng){
            const peng = this.node.getChildByName("peng");
            peng.active = true;
            const pengIndex = Math.random() > 0.5 ? 1 : 2;
            UIManager.instance.createTexture(peng, `texture/sun/peng${pengIndex}`); 
            peng.opacity = 0;
            peng.scale = 0;
            peng.stopAllActions();
            cc.tween(peng)
                .to(0.1, {scale: 1, opacity: 255})
                .delay(0.1)
                .to(0.1, {opacity: 0})
                .call(()=>{
                    peng.active = false;
                })
                .start();
        }        
    }

    /**
     * 普通箭、三箭连发、三箭齐发
     */
    private onUnbuff(): void {
        const weaponAttr = GameData.instance.getCurrentWeaponAttr();
        this.blood -= weaponAttr.damage;
        this.updateBlood();
        //UIManager.instance.toastTip(node, "-" + translateNumber(weaponAttr.damage), cc.Color.WHITE, 0, 24);
    }

    /**
     * 暴击箭
     */
    private onHitCritArrow(node: cc.Node): void {
        const weaponAttr = GameData.instance.getCurrentWeaponAttr();
        let damage = weaponAttr.damage;
        const critRate = weaponAttr.critRate;
        const critDamage = weaponAttr.critDamage;

        let tipSrc = `-${translateNumber(damage)}`;
        if(Math.random() <= critRate){
            damage *= critDamage;
            tipSrc = `暴击 -${translateNumber(damage)}`
        }
        this.blood -= damage;
        this.updateBlood();
        //UIManager.instance.toastTip(node, tipSrc, cc.Color.WHITE, 0, 24);
    }

    /**
     * 冰冻箭
     */
    private onHitFrozenArrow(node: cc.Node): void {
        const weaponAttr = GameData.instance.getCurrentWeaponAttr();
        const damage = weaponAttr.damage;
        this.blood -= damage;
        this.updateBlood();
        //UIManager.instance.toastTip(node, "-" + translateNumber(damage), cc.Color.WHITE, 0, 24);
        const frozenRate = weaponAttr.frozenRate;
        const frozenTime = weaponAttr.frozenTime;
        if(Math.random() <= frozenRate){
            this.moveStop();
            this.unscheduleAllCallbacks();
            this.scheduleOnce(()=>{
                this.move();
            } ,frozenTime)
        }
    }

    /**
     * 穿透箭
     * @param node 射中太阳的箭节点
     */
    private onHitPierceArrow(sefnode: cc.Node, othernode: cc.Node): void {
        const weaponAttr = GameData.instance.getCurrentWeaponAttr();
        let damage = weaponAttr.damage;
        const pierceDamage = weaponAttr.pierceDamage / 100;
        const hitSunCnt = othernode.getComponent("arrow").getHitCnt();
        for(let i = 0; i < hitSunCnt; i++){
            damage *= pierceDamage;
        }
        damage = Math.floor(damage);
        this.blood -= damage;
        this.updateBlood();
        //toastTip(sefnode, "-" + translateNumber(damage), cc.Color.WHITE, 0, 24);
    }

    /**
     * 被技能击中回调
     */
    private onSkill(event, data): void {
        switch (data) {
            case SkillList.fist:
                this.oncCollisionDeformation(true, true);
                setTimeout(()=>{
                    if(this.node){
                        const rate = GameData.instance.getSkillAttr(SkillList.fist).damageRate;
                        this.blood -= this.fullBlood * rate;
                        if(this.blood <= 0){
                            this.explode();
                            this.node.destroy();
                        }
                    }                   
                }, 500)                
                break;
        
            default:
                break;
        }
    }

    update (dt) {
        if(!this.isMove) return;

        if(this.moveTime >= General.SunTurnInterval){
            this.getRandomSpeed();
            this.moveTime = 0;
        }

        const gameProgree = GameData.instance.getGameProgress();
        const rateX = (gameProgree == GameProgress.start) ? 1 : General.slowSpeed;
        const rateY = (gameProgree == GameProgress.start) ? 1 : 0;

        this.node.y -= this.speedy * dt * rateY;
        this.node.x += this.speedx * dt * rateX;
        this.moveTime += dt;

        if(Math.abs(this.node.x) + this.node.getChildByName("body").width > cc.winSize.width * 0.5){
            this.speedx = - this.speedx;
        }
        
        const line = this.node.parent.parent.getChildByName("line");
        const wpos = line.convertToWorldSpaceAR(cc.v2(0, 0));
        const posline = this.node.parent.convertToNodeSpaceAR(wpos);
        if(this.node.y < (posline.y + this.node.getChildByName("body").height * 0.5)) {
            this.node.destroy();
        }        
    }

    onDestroy() {

        //取消全局事件监听
        EventManager.instance.remove_event_listenner(EventList.castSkill, this, this.onSkill);

        if(this.blood <= 0){
            GameData.instance.updateHitCnt();
            
        }
        else {
            GameData.instance.updateLoseCnt();
        }
    }

}

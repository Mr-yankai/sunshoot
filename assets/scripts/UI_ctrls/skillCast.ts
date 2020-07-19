import BaseView from "./baseView";
import GameData from '../dataCenter/gameData';
import UIManager from '../managers/UIManager';
import EventManager from '../managers/eventManager';
import SoundManager from "../managers/soundManager"
import {EventList, WeaponList, ShootStatus, PlayAdReward, SkillList} from '../config/Enumeration'
import {General} from '../config/Global'
import {timestampToTime} from '../utills/common';
import Advert from "../wx/advert";
import homeUI_ctrl from "./homeUI_ctrl";
import ResLoad from "../managers/resLoad";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillCast extends BaseView {

    private homeUI_ctrl: homeUI_ctrl;

    onLoad () {
        this.name = "skillCast";
        this.homeUI_ctrl = this.getComponent("homeUI_ctrl");
    }

    start () {
        this.onButtonEvent(
            this.view("skillRoot/switch"),
            "onSwitchClick",
            ""
        )
    }


    /**技能施放按钮点击事件 */
    private onSwitchClick(event, data): void {
        const focoRate = this.homeUI_ctrl.fight.getFocoRate();
        if(focoRate < 1){
            UIManager.instance.toastTip(this.node, "蓄满能量才能释放哦~", cc.Color.WHITE, 0.5);
            return;
        }
        this.view("skillRoot/skill").active = true;
        const skill = GameData.instance.getCurrentSkill();
        switch (skill) {
            case SkillList.wind:
                this.playWindSkill();
                break;
            case SkillList.fist:
                this.playFistSkill();
                break;
            case SkillList.arrowBlizzard:
                this.playArrowBlizzardSkill();
                break;
            case SkillList.arrowRound:
                this.playArrowRoundSkill();
                break;
            case SkillList.firework:
                this.playFireworkSkill();
                break;
            default:
                break;
        }
        this.homeUI_ctrl.fight.resetFocoRate();
    }


    /**技能初始化 */
    public skillInit(): void {
        this.view("skillRoot").active = true;
        this.view("skillRoot/skill").active = true;
        const btn = this.view("skillRoot/switch");
        const skill = GameData.instance.getCurrentSkill();
        UIManager.instance.createTexture(
            btn.getChildByName("icon"), 
            `texture/skill/${skill}`
        );
        btn.scale = 0;
        btn.opacity = 0;
        cc.tween(btn).to(0.3, {scale: 1, opacity: 255}).start();

        this.homeUI_ctrl.fight.resetFocoRate();
    }

    /**
     * 施放技能：wind
     */
    private playWindSkill(): void {
        const skillNode = this.view("skillRoot/skill");
        const wind = cc.instantiate(ResLoad.instance.getRes("ui_prefabs/skill/wind", cc.Prefab));
        skillNode.addChild(wind);
        wind.scale = 0;
        wind.opacity = 0;
        const startY = 60 - (skillNode.height * 0.5);
        wind.setPosition(cc.v2(0, startY));
        
        const particle = wind.getComponent(cc.ParticleSystem);
        particle.resetSystem();

        const short = (skillNode.height - 60) / 8.5;
        cc.tween(wind)
            .to(1, {scale: 1, opacity: 255, x: Math.random() * 200 - 100, y: startY + short})
            .to(2, {x: Math.random() * 400 - 200, y: startY + short * 3})
            .to(2, {x: Math.random() * 400 - 200, y: startY + short * 5})
            .to(2, {x: Math.random() * 400 - 200, y: startY + short * 7})
            .to(1.5, {scale: 0, opacity: 0, x: Math.random() * 200 - 100, y: startY + short * 8.5})
            .call(()=>{
                wind.children.forEach(element=>{
                    element.destroy();
                })
                wind.destroy();
            })
            .start();
    }

    /**
     * 施放技能：fist
     */
    private playFistSkill(): void {
        const skillNode = this.view("skillRoot/skill");
        const fist = cc.instantiate(ResLoad.instance.getRes("ui_prefabs/skill/fist", cc.Prefab));
        skillNode.addChild(fist);

        const fistUpDown = fist.getChildByName("fistUpDown");
        UIManager.instance.createTexture(fistUpDown, "texture/skill/fistUp");
        fistUpDown.scale = 0;
        fistUpDown.opacity = 255;
        cc.tween(fistUpDown)
            .to(0.5, {scale: 3}, {easing: "backOut"})
            .call(()=>{
                UIManager.instance.createTexture(fistUpDown, "texture/skill/fistDown");
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

    /**
     * 施放技能：arrowBlizzard
     */
    private playArrowBlizzardSkill(): void {
        const skillNode = this.view("skillRoot/skill");
        const arrowBlizzard = new cc.Node;
        skillNode.addChild(arrowBlizzard);
        const weapon = GameData.instance.getCurrentWeapon();
        const arrowUrl = `texture/weapon/${weapon}_arrow`;
        const handler = setInterval(()=>{
            SoundManager.instance.playEffect("audioClip/shoot");
            const arrow = new cc.Node();                     
            UIManager.instance.createTexture(arrow, arrowUrl);
            UIManager.instance.setShaderEffect(arrow, "Glowing");
            arrowBlizzard.addChild(arrow);
            const randomNum = Math.random();
            let startPosX, endPosX, startPosY, endPosY;
            if(randomNum < 0.25){ //上
                startPosX = (Math.random() - 0.5) * skillNode.width;
                endPosX = (Math.random() - 0.5) * skillNode.width;
                startPosY = skillNode.height * 0.5;
                endPosY = - skillNode.height * 0.5;
                
            }
            else if(randomNum < 0.5){ //下
                startPosX = (Math.random() - 0.5) * skillNode.width;
                endPosX = (Math.random() - 0.5) * skillNode.width;
                startPosY = - skillNode.height * 0.5;
                endPosY = skillNode.height * 0.5;

            }
            else if(randomNum < 0.75){ //左
                startPosX = - skillNode.width * 0.5;
                endPosX = skillNode.width * 0.5;
                startPosY = (Math.random() -0.5) * skillNode.height;
                endPosY = (Math.random() -0.5) * skillNode.height;
            }
            else { //右
                startPosX = skillNode.width * 0.5;
                endPosX = - skillNode.width * 0.5;
                startPosY = (Math.random() -0.5) * skillNode.height;
                endPosY = (Math.random() -0.5) * skillNode.height;
            }
            this.createArrowBlizzard(arrow, cc.v2(startPosX, startPosY), cc.v2(endPosX, endPosY));
        }, 100)

        setTimeout(()=>{
            clearInterval(handler);
        }, 3000)
    }

    private createArrowBlizzard(arrow: cc.Node, startPos: cc.Vec2, endPos: cc.Vec2): void {
        const dir = endPos.sub(startPos);
        const angel = Math.atan2(dir.y, dir.x) * 180 / Math.PI - 90;
        arrow.angle = angel;
        arrow.setPosition(startPos);

        arrow.group = "SKILLARROW";
        const bcl = arrow.addComponent(cc.BoxCollider);
        bcl.offset = cc.v2(0, arrow.height * 0.5 - 25);
        bcl.size = new cc.Size(50, 50);

        cc.tween(arrow)
            .to(0.2, { position: endPos})
            .call(()=>{
                arrow.destroy();
            })
            .start();
    }

    /**
     * 施放技能：arrowRound
     */
    private playArrowRoundSkill(): void {
        const skillNode = this.view("skillRoot/skill");
        const skillCenter = new cc.Node;
        skillCenter.name = "skillCenter";
        skillCenter.group = "ARROWROUND";
        UIManager.instance.createTexture(skillCenter, "texture/skill/round");
        skillNode.addChild(skillCenter);
        
        this.arrowCenterAppear(skillCenter, true);

        setTimeout(()=>{
            skillCenter.destroy();
        }, 8000)
    }

    private arrowCenterAppear(skillCenter: cc.Node, isFirst: boolean): void {
        //首次出现：直接出现
        if(isFirst){
            skillCenter.opacity = 0;
            skillCenter.scale = 6;
            skillCenter.setPosition(
                (Math.random() - 0.5) * skillCenter.parent.width * 0.8, 
                (Math.random() - 0.5) * skillCenter.parent.height * 0.6
            );
            
            SoundManager.instance.playEffect("audioClip/arrowRound");
            cc.tween(skillCenter)
                .to(0.3, { scale: 1, opacity: 255 }) 
                .call(()=>{
                    let ccl = skillCenter.addComponent(cc.CircleCollider);
                    ccl.radius = skillCenter.width * 0.5;
                })
                .repeatForever(
                    cc.tween()
                        .delay(1)
                        .to(0.2, {scale: 1.2})
                        .to(0.2, {scale: 1})
                        .to(0.2, {scale: 1.2})
                        .to(0.2, {scale: 1})
                )
                .start();
        }       
        //非首次出现: 先消失，后出现
        else{
            skillCenter.stopAllActions();
            cc.tween(skillCenter)
                .to(0.3, {opacity: 0, scale: 0}, {easing: "backIn"}) //消失
                .call(()=>{
                    skillCenter.setPosition(
                        (Math.random() - 0.5) * skillCenter.parent.width * 0.8, 
                        (Math.random() - 0.5) * skillCenter.parent.height * 0.6
                    );
                    skillCenter.scale = 6;                   
                    SoundManager.instance.playEffect("audioClip/arrowRound");
                })
                .to(0.3, { scale: 1, opacity: 255 }) //出现
                .call(()=>{
                    let ccl = skillCenter.addComponent(cc.CircleCollider);
                    ccl.radius = skillCenter.width * 0.5;
                })
                .repeatForever(
                    cc.tween()
                        .delay(1)
                        .to(0.2, {scale: 1.2})
                        .to(0.2, {scale: 1})
                        .to(0.2, {scale: 1.2})
                        .to(0.2, {scale: 1})
                )
                .start();
        }      
    }

    public aroundShoot(): void {
        const skillCenter = this.view("skillRoot/skill/skillCenter");
        skillCenter.removeComponent(cc.CircleCollider);

        const weapon = GameData.instance.getCurrentWeapon();
        const arrowUrl = `texture/weapon/${weapon}_arrow`;

        SoundManager.instance.playEffect("audioClip/shoot");

        for(let i = 0; i < 2 * Math.PI; i += Math.PI / 6){
            const arrow = new cc.Node();  
            arrow.group = "SKILLARROW";
            arrow.addComponent(cc.BoxCollider);
            skillCenter.addChild(arrow);     
            UIManager.instance.createTexture(arrow, arrowUrl);
            UIManager.instance.setShaderEffect(arrow, "Glowing");
            arrow.setAnchorPoint(0.5, 0);
            arrow.setPosition(skillCenter.width * 0.5 * Math.cos(i), skillCenter.width * 0.5 * Math.sin(i));
            arrow.angle = 180 * i / Math.PI - 90;
            arrow.scale = 0.5

            cc.tween(arrow)
                .by(0.3, {x: cc.winSize.height * Math.cos(i), y: cc.winSize.height * Math.sin(i)})
                .call(()=>{
                    arrow.destroy();
                })
                .start();
        }
        setTimeout(()=>{
            skillCenter && this.arrowCenterAppear(skillCenter, false); 
        }, 400)
    }

    /**
     * 施放技能：firework
     */
    private playFireworkSkill(): void {
        const skillNode = this.view("skillRoot/skill");
        let firework = new cc.Node();
        skillNode.addChild(firework);
        firework.setAnchorPoint(0.5, 0);
        firework.setPosition(0, - skillNode.height / 2);
        const bcl = firework.addComponent(cc.BoxCollider);
        bcl.size = new cc.Size(cc.winSize.width / 2, 60);
        firework.group = "FIREWORK";
        const particle = firework.addComponent(cc.ParticleSystem);
        particle.file = ResLoad.instance.getRes("particle/firework", cc.ParticleAsset);
        particle.posVar = cc.v2(cc.winSize.width / 2, 6);
        particle.resetSystem();

        setTimeout(()=>{
            firework.destroy();
        }, 6000)
    }
    
}

const {ccclass, property} = cc._decorator;
import {General} from "../config/Global";
import {WeaponList, EventList, SkillList} from "../config/Enumeration";
//import {WeaponAttribute} from "../config/WeaponAttribute"
import GameData from "../dataCenter/gameData";
import UIManager from "../managers/UIManager";
import EventManager from "../managers/eventManager";

@ccclass
export default class Arrow extends cc.Component {

    private direction: number = 0;
    private isMove: boolean = false;
    private hitSunCnt: number = 0;

    onLoad(): void {
        this.node.group = "ARROW";
        const bcl = this.node.addComponent(cc.BoxCollider);
        bcl.offset = cc.v2(0, this.node.height * 0.5 - 25);
        bcl.size = new cc.Size(50, 50);
    }


    public shoot(degree: number): void {
        this.node.angle = degree;
        this.direction = (degree + 90) * Math.PI / 180;
        this.isMove = true;
    }

    private shootStop(): void {
        this.isMove = false;
    }

    /**
     * 碰撞检测
     * @param other 碰撞对象节点
     * @param self 自己节点
     */
    private onCollisionEnter(other, self): void {
        if(other.node.group == "SUN"){
            if(this.hitSunCnt == 0){
                GameData.instance.updateCombo(true);
            }
            this.hitSunCnt ++;
            
            const weapon = GameData.instance.getCurrentWeapon();
            if(weapon != WeaponList.PierceArrow){
                this.node.destroy();
            } 
        }
        else if(other.node.group == "ARROWROUND"){
            EventManager.instance.dispatch_event(EventList.castSkill, SkillList.arrowRound);
            this.hitSunCnt ++;
            const weapon = GameData.instance.getCurrentWeapon();
            if(weapon != WeaponList.PierceArrow){
                this.node.destroy();
            } 
        }
                     
    }

    public getHitCnt(): number {
        return this.hitSunCnt;
    }

    update (dt) {
        if(!this.isMove) return;
        let speedx = General.ArrowSpeed * Math.cos(this.direction);
        let speedy = General.ArrowSpeed * Math.sin(this.direction);
        this.node.x += speedx * dt;
        this.node.y += speedy * dt; 
        if(Math.abs(this.node.x) > 750 || Math.abs(this.node.y) > 1334){
            this.node.destroy();
        }
    }

    onDestroy(): void {
        if(this.hitSunCnt == 0){
            GameData.instance.updateCombo(false);
        }
    }
}

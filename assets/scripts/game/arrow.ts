const {ccclass, property} = cc._decorator;
import {General} from "../config/Global";
import {WeaponList} from "../config/Global";
//import {WeaponAttribute} from "../config/WeaponAttribute"
import GameData from "../dataCenter/gameData";
import UIManager from "../managers/UIManager";

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


    public shoot(degree: number, url: string): void {
        this.node.angle = degree;
        this.direction = (degree + 90) * Math.PI / 180;
        this.isMove = true;

        //拖尾
        // const child = new cc.Node();
        // child.parent = this.node;
        // const streak = child.addComponent(cc.MotionStreak);
        // UIManager.instance.createMotionStreak(child, url);
        // streak.fadeTime = 0.1;
        // streak.stroke = 32;
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
        const weapon = GameData.instance.getCurrentWeapon();
        switch (weapon) {
            case WeaponList.PierceArrow:
                this.hitSunCnt ++;
                break;
            default:
                this.node.destroy();
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
}

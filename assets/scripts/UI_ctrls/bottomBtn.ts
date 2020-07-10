import BaseView from "./baseView";
import SoundManager from "../managers/soundManager";
import UIManager from '../managers/UIManager';
import ResLoad from '../managers/resLoad';
import GameData from '../dataCenter/gameData';
import Advert from "../wx/advert";
import {translateNumber, timestampToTime} from '../utills/common';
import {EventList, WeaponList, ShootStatus, PlayAdReward} from '../config/Global';
import EventManager from '../managers/eventManager';
import homeUI_ctrl from "./homeUI_ctrl";



const {ccclass, property} = cc._decorator;

@ccclass
export default class BottomBtn extends BaseView {

    private homeUI_ctrl: homeUI_ctrl;

    onLoad () {

        this.name = "bottomBtn";
        this.homeUI_ctrl = this.getComponent("homeUI_ctrl");
    }

    start () {

        this.onButtonEvent(this.view("bottom/weapon"), "onWeaponClick", "");
        this.onButtonEvent(this.view("bottom/forge"),  "onForgeClick", "");
        this.onButtonEvent(this.view("bottom/skill"), "onSkillClick", "");
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
     * 底部按钮点击状态设置
     * @param node 按钮节点
     * @param isClick 是否是点击状态
     */
    public setButtonStatus(node: cc.Node ,isClick: boolean): void {
        const url = isClick ? "texture/button/onclick" : "texture/button/unclick";
        UIManager.instance.createTexture(node, url);
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
    public hideWeaponList(): void {
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
        this.homeUI_ctrl.weaponClick = data.weapon;

        //有满级试用机会
        if(data.isFullUsed){
            this.homeUI_ctrl.playAdReward = PlayAdReward.fullUsed;
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
    public onWeaponIconClickCallback(): void {
        //UIManager.instance.playParticle(this.view("weapon"), "particle/click");
        this.homeUI_ctrl.weapon = this.homeUI_ctrl.weaponClick;
        GameData.instance.updateLastWeapon(this.homeUI_ctrl.weapon);   //主武器切换
        this.homeUI_ctrl.fight.updateWeaponStatus(this.homeUI_ctrl.weapon, ShootStatus.Ready)
        const icons = this.view("weaponList/view/content").children;
        //icon点击状态切换
        icons.forEach(element => {
            this.updateWeaponIconStatus(element, element.name == this.homeUI_ctrl.weapon);
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

        this.homeUI_ctrl.updateCoin(); //更新金币展示
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
}

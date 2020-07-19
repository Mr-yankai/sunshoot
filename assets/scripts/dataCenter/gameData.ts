
import UserData from "../dataCenter/userData"
import {WeaponAttribute} from "../config/WeaponAttribute"
import {SkillAttribute} from "../config/SkillAttribute"
import {LevelConfig} from "../config/LevelConfig";
import {request} from "../game/request";
import {General} from "../config/Global";
import {EventList ,GameProgress, WeaponList} from "../config/Enumeration";
import {TaskCfg, TaskRewardStatus} from "../config/Task"
import EventManager from "../managers/eventManager";
import {timestampToTime, translateNumber} from "../utills/common";
import Energy from "../dataCenter/energy"
import Advert from "../wx/advert";
import Login from "../wx/Login";

export default class GameData  {

    private sunTotalCnt = 0;                 //本局需要产生的太阳总数
    private genSunCnt = 0;                   //已产生太阳的数量
    private hitedCnt = 0;                    //已被击爆的太阳数量
    private loseCnt = 0;                     //丢失的太阳数量
    private playerLife = 0;                  //玩家所剩余生命值
    private reward = 0;                      //本局奖励
    private gameProcess = GameProgress.end;  //游戏当前状态
    private maxCombo = 0;
    private combo = 0;
    private weaponAttr = null
    private levelConfig = null;
    private unlockWeapon = null;             //挑战成功时解锁的武器
    private baseConfig = null
    private fullUseWeapon = null;            //挑战失败时可满级试用的武器
    private isUserFullUsed: boolean = false; //是否满级试用(玩家是否观看了视频)
    private resurgenceTimes: number = 0;     //本局复活次数

    private genSunHandle: number ;

    public static instance: GameData = null;
    public static getInstance(): GameData {
        if(this.instance == null){
            this.instance = new GameData();
        }
        return this.instance;
    }

    public init(src): void {
        this.downloadAllWeaponAttr();
        this.downloadLevelConfig();
        this.downloadBaseConfig();
        console.log(src);
    }

    private async downloadBaseConfig(): Promise<void>{
        const result = await request.getBaseConfig();
        this.baseConfig = result;
    }

    private async downloadAllWeaponAttr(): Promise<void> {
        if(General.dataModel == 1){
            let result = await request.getAllWeaponAttr();
            this.weaponAttr = result;
        }
        else if(General.dataModel == 0){
            this.weaponAttr = WeaponAttribute;
        }
    }

    private async downloadLevelConfig(): Promise<void>{
        if(General.dataModel == 1){
            //get请求
            let result = await request.getLevelConfig();
            this.levelConfig = result;
        }
        else if(General.dataModel == 0){
            this.levelConfig = LevelConfig;
        }
    }

    public getBaseConfig(): any {
        return this.baseConfig;
    }

    public getUserData(): any {
        return UserData.instance.getUserData();
    }

    public getCurrentLevel(): number {
        const uData = this.getUserData();
        return (uData.maxLevel + 1);
    }

    public getCurrentWeapon(): string {
        const uData = this.getUserData();
        return uData.lastWeapon;
    }

    public getCurrentSkill(): string {
        const uData = this.getUserData();
        return uData.lastSkill;
    }

    public getTotalCount(): number {
        return this.sunTotalCnt;
    }

    /**
     * 任务信息
     */
    public getTaskCfg(): any {
        let cfg = TaskCfg;
        const uData = this.getUserData();
        for(let key in cfg){
            const taskType = cfg[key].condition.type;
            const taskValue = cfg[key].condition.value;
            let userCnt = uData[taskType];
            let userStatus = {userCnt: 0, rewardStatus: null}
            if(userCnt >= taskValue){
                userStatus.userCnt = taskValue;
                userStatus.rewardStatus = uData.task[key] ? TaskRewardStatus.received : TaskRewardStatus.unreceived;
            }
            else{
                userStatus.userCnt = userCnt;
                userStatus.rewardStatus = TaskRewardStatus.unfinished;
            }
            cfg[key]["userStatus"] = userStatus;
            cfg[key]["taskId"] = key;
        }
        return cfg;
    }

    /**武器解锁关卡 */
    public getWeaponUnlockLevel(weapon: string): number {
        const attr = this.weaponAttr[weapon];
        return attr.unlockLevel;
    }

    /**
     * 获取玩家所选武器当前属性值
     */
    public getCurrentWeaponAttr(): any {
        const uData = this.getUserData();
        const weapon = uData.lastWeapon;
        const weaponLevel = uData.weapon[weapon].level;
        const maxlvl = Object.keys(this.weaponAttr[weapon].levelInfo).length;
        const lvl = this.isUserFullUsed ? maxlvl : weaponLevel;
        const weaponAttr = this.weaponAttr[weapon].levelInfo[`Lv${lvl}`].attribute;
        return weaponAttr;
    }

    /**获取技能属性 */
    public getSkillAttr(skill: string): any {
        return SkillAttribute[skill];
    }

    /**
     * 获取玩家当前金币值
     */
    public getCurrentCoin(): number {
        const coin = this.getUserData().coin;
        return coin;
    }

    /** 
     * 获取当前关卡的配置
    */
    public getCurrentLevelConfig(): any {
        const level = this.getCurrentLevel();
        const config = this.levelConfig[`Lv${level}`];
        return config;
    }

    /**
     * 获取武器升级所需要的金币数
     * @param weapon 
     * @param level 
     */
    public getWeaponUpCoin(weapon: string, level: number): number{
        const upgradeCoin = this.weaponAttr[`${weapon}`].levelInfo[`Lv${level}`].upgradeCoin;
        return upgradeCoin;
    }

    /**
     * 校验武器是否升到顶级
     * @param weapon 
     * @param level 
     */
    public assertMaxLevel(weapon: string, level: number): boolean{
        const levelInfo = this.weaponAttr[`${weapon}`].levelInfo;
        const maxLevel = Object.keys(levelInfo).length;
        if(level == maxLevel) {
            return true;
        }
        else {
            return false;
        }
    }

    //满级试用开始
    public fullUseBegin(): void {
        this.isUserFullUsed = true;
    }

    //满级试用结束
    private fullUseEnd(): void {
        this.isUserFullUsed = false;
    }

    /**
     * 开始新的游戏
     */
    public startNewGame(): void {
        const config = this.getCurrentLevelConfig();
        this.sunTotalCnt = config.sunCount;
        this.playerLife = config.playerLife;
        this.reward = config.reward;
        this.hitedCnt = 0;
        this.loseCnt = 0;
        this.genSunCnt = 0;
        this.maxCombo = 0;
        this.combo = 0;
        this.gameProcess = GameProgress.start;
        this.unlockWeapon = null;
        this.fullUseWeapon = null;
        this.resurgenceTimes = 0;

        this.startGenSun();

        this.sendMassage(EventList.updateProgress,1);
    }

    /**
     * 计算免费领取金币数量(取最大闯关关卡对应的奖励)
     */
    public getFreeReceiveCoin(): number {
        const userData = this.getUserData();
        const maxLevel = userData.maxLevel;
        let coin = 0;
        if(maxLevel > 0){
            coin = this.levelConfig[`Lv${maxLevel}`].reward;
        }
        return coin;
    }

    /**
     * 发送消息，控制界面展示
     * @param cmd 
     * @param data 
     */
    private sendMassage(cmd: EventList, data: any){
        EventManager.instance.dispatch_event(cmd, data);
    }

    /**
     * 持续产生太阳
     */
    private startGenSun(): void {
        this.genSunHandle && clearInterval(this.genSunHandle);

        const interval = this.getCurrentLevelConfig().interval
        this.genSunHandle = setInterval(this.genSun.bind(this), interval * 1000);
    }

    private genSun(): void {
        if (this.gameProcess == GameProgress.start &&
                this.sunTotalCnt > this.genSunCnt) {
            this.sendMassage(EventList.genSun, "");
            this.genSunCnt ++;
        }
    }

    /**
     * 返回当前游戏进程状态
     */
    public getGameProgress(): GameProgress {
        return this.gameProcess;
    }

    /**
     * 更新消灭的太阳的数量
     */
    public updateHitCnt(): void {
        if(this.gameProcess == GameProgress.end){
            return;
        }
        this.hitedCnt ++;
        this.sendProgress();
        this.checkEnd();
    }

    /**
     * 更新丢失太阳的数量
     */
    public updateLoseCnt(): void {
        if(this.gameProcess == GameProgress.end){
            return;
        }
        this.loseCnt ++;
        this.playerLife --;
        this.sendMassage(EventList.updateLife, this.playerLife)
        this.sendProgress();
        this.checkEnd();
    }

    /**
     * 通知显示消灭进度
     */
    private sendProgress(): void {
        const per = (this.hitedCnt + this.loseCnt) / this.sunTotalCnt;
        let persent = 1 - per;
        if(persent < 0)  persent = 0;

        this.sendMassage(EventList.updateProgress, persent);
    }

    /**
     * 处理combo事件
     * @param isCombo 
     */
    public updateCombo(isCombo: boolean): void {
        if (isCombo) {
            this.combo++;
            this.sendMassage(EventList.combo, this.combo); //派送事件
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
        }
        else {
            this.combo = 0;
            this.sendMassage(EventList.combo, "miss"); //派送事件
        }
    }

    /**
     * 校验结束
     */
    private checkEnd(): void {
        if(this.hitedCnt + this.loseCnt == this.sunTotalCnt){ //挑战成功
            this.gameSuccess();
        }
        else if(this.playerLife == 0){  //挑战失败
            const video = this.assertVideoSupport();
            const share = this.assertShareSupport();
            if(this.resurgenceTimes == 0 && (video || share)){ //可复活-广告或分享支持且有复活次数
                const type = video ? "video" : "share";
                if(this.gameProcess != GameProgress.resurgence){//等待复活时可能技能还在继续消灭
                    this.sendMassage(EventList.resurgence, type);
                    this.gameProcess = GameProgress.resurgence;
                }                
            }
            else{             
                this.gamefail(); //本局结束
            }            
        }
    }

    /**
     * 本局结束(成功)
     */
    private gameSuccess(): void {
        this.sendMassage(EventList.gameOver, {
            reward: this.reward,
            isVictory: true
        });
        this.fullUseEnd();
        this.gameProcess = GameProgress.end;
        const level = this.getCurrentLevel();
        this.updateMaxLevel(level);
        UserData.instance.updateMaxCombo(this.maxCombo);
        UserData.instance.updateMaxHitCount(this.hitedCnt);

        //解锁武器
        for(let key in this.weaponAttr){
            if(this.weaponAttr[key].unlockLevel == level){
                this.unlockWeapon = key;
                this.unLockWeapon(key);
            }
        }
    }

    /**
     * 本局结束(失败)
     */
    public gamefail(): void {
        this.fullUseEnd();
        this.gameProcess = GameProgress.end;
        const hit = this.hitedCnt / this.sunTotalCnt;
        this.reward = Math.floor(this.reward * hit);
        this.sendMassage(EventList.gameOver, {
            reward: this.reward,
            isVictory: false
            }
        )

        UserData.instance.updateMaxCombo(this.maxCombo);
        UserData.instance.updateMaxHitCount(this.hitedCnt)

        //记录生成的满级试用武器的名称
        const status = this.assertVideoSupport();
        if (status) {
            const uData = this.getUserData();
            let lockWeaponList = [];
            for (let key in uData.weapon) {
                if (uData.weapon[key].whetherHave) {
                    lockWeaponList.push(key);
                }
            }
            this.fullUseWeapon =
                lockWeaponList[Math.floor(Math.random() * lockWeaponList.length)];
        }
    }

    /**
     * 复活成功
     */
    public resurgence(): void {
        this.resurgenceTimes ++;
        this.gameProcess = GameProgress.start;
        this.playerLife += General.resurgenceLife;
        this.sendMassage(EventList.updateLife, this.playerLife);
        this.checkEnd(); //复活期间可能太阳被技能消灭完了，复活成功后校验一次游戏是否结束
    }

    /**
     * 分享功能是否支持
     */
    public assertShareSupport(): boolean {
        let result = false;
        const auditStatus = this.baseConfig.auditStatus;

        if(auditStatus === 0){
            result = false;
        }
        else {
            const uData = this.getUserData();
            const shareTime = uData.shareTime;
            const nowTime = timestampToTime(new Date().getTime());
            let cnt = shareTime[nowTime];
            if(cnt == undefined || !cnt) cnt = 0;
            result = (cnt < General.maxShare);
        }
        return result;
    }

    /**
     * 视频广告功能是否支持
     */
    public assertVideoSupport(): boolean {
        let result = false;
        const videoStatus = this.baseConfig.videoStatus;
               
        if(videoStatus === 0){
            result = false;
        }
        else{
            const uData = this.getUserData();
            const videoTime = uData.videoTime;
            const nowTime = timestampToTime(new Date().getTime());
            let cnt = videoTime[nowTime];
            if(cnt == undefined || !cnt) cnt = 0;
            result = (cnt < General.maxVideo);
            if(cc.sys.platform == cc.sys.WECHAT_GAME){
                result = Advert.instance.getAdStatus();
            }
        }
        return result;
    }

    /**
     * 过关时解锁的武器名称
     */
    public getUnlockWeapon(): string {
        return this.unlockWeapon;
    }

    /**
     * 满级试用的武器名称
     */
    public getFullUseWeapon(): string {
        return this.fullUseWeapon;
    }

    /**
     * 获取当前玩家所剩余血量
     */
    public getPlayerBlood(): number{
        return this.playerLife;
    }

    /**
     * 领取金币
     */
    public receiveTaskCoin(coin: number): void {
        UserData.instance.updateCoin(coin);
    }

    /**
     * 领取体力
     */
    public receiveEnergy(energy: number): void {
        Energy.instance.energyChange(energy);
    }

    /**
     * 结算领取金币
     * @param multiple 领取倍数
     */
    public receiveCoin(multiple: number): void {
        this.reward = this.reward * multiple;
        UserData.instance.updateCoin(this.reward);
    }

    /**
     * 免费领取金币
     */
    public freeReceiveCoin(): void {
        const cnt = this.getFreeReceiveCoin();  
        UserData.instance.updateCoin(cnt);
    }


    /**
     * 更新玩家数据
     */
    public updateMaxLevel(maxLevel: number): void {
        UserData.instance.updateMaxLevel(maxLevel);

        if(cc.sys.platform == cc.sys.WECHAT_GAME){
            wx.setUserCloudStorage({
                KVDataList: [
                    {key: "maxLevel", value: maxLevel+''}
                ],
                success: res=>{
                    console.log("用户数据保存开放域成功！", res);
                },
                fail: res=>{
                    console.log("用户数据保存开放域失败！", res);
                }
            });

            //数据存储服务器
            const userId = this.getUserData().userId;
            const openid = Login.instance.getOpenid();
            request.updateUserMaxLevel({
                userId: userId, 
                openid: openid,
                maxLevel: maxLevel
            });
        }
    }

    public updateLastWeapon(weapon: string): void {
        UserData.instance.updateLastWeapon(weapon);
    }

    public updateLastSkill(skill: string): void {
        UserData.instance.updateLastSkill(skill);
    }

    public unLockWeapon(weapon: string): void {
        UserData.instance.unLockWeapon(weapon);
    }

    public unLockSkill(skill: string): void {
        UserData.instance.unLockSkill(skill);
    }

    public weaponUpgrade(weapon: string): boolean {
        const userCoin = this.getCurrentCoin();
        const weaponLevel = this.getUserData().weapon[`${weapon}`].level;
        const upCoin = this.getWeaponUpCoin(weapon, weaponLevel+1);
        if(userCoin < upCoin){
            return false;
        }
        else{
            UserData.instance.weaponUpgrade(weapon);
            UserData.instance.updateCoin(- upCoin);
            return true;
        }        
    }

    public receiveTaskReward(taskId): void {
        UserData.instance.receiveTaskReward(taskId);
    }

    //type: "share" or "video";  time: "2020-07-01"
    public setVideoOrShareTime(type: string, time: string): void {
        UserData.instance.setVideoOrShareTime(type, time);
    }

}

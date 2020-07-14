import {WeaponList, SkillList} from "../config/Enumeration";
import {TaskCfg} from "../config/Task";
import {genId, timestampToTime} from "../utills/common";


export default class UserData {

    private uData = {
        userId: "",    //用户id
        videoTime: {}, //观看视频广告时间记录
        shareTime: {}, //分享时间记录
        lastLoginTime: "", //上次登录时间
        continueLogin: 1, //连续登录天数
        maxLevel: 0,  //最大闯关数
        maxCombo: 0,  //最高连击数
        maxContinueLogin: 1,  //最大连续登录天数
        maxLogin: 1,          //累计登录天数
        maxHitCount: 0,       //累计干掉太阳的数量
        shareSuccessCount: 0, //累计分享的次数
        watchVideoCount: 0,   //累计观看广告的次数
        coin: 0,  //当前金币数
        lastWeapon: WeaponList.GeneralArrow, //最后选择的武器
        lastSkill: SkillList.fist, //最后选择的技能
        weapon: {
            generalArrow: {
                whetherHave: true,
                level: 1
            },           
            continuousArrow: {
                whetherHave: false,
                level: 1
            },
            pierceArrow: {
                whetherHave: false,
                level: 1
            },
            tripleArrow: {
                whetherHave: false,
                level: 1
            },
            critArrow: {
                whetherHave: false,
                level: 1
            },
            frozenArrow: {
                whetherHave: false,
                level: 1
            },
        },
        skill: {},
        task: {}
    }

    /**
     * 全局维一单例
     */
    public static instance: UserData;

    public static getInstance(): UserData{
        if(this.instance == null){
         this.instance = new UserData();
     }
     return this.instance;
    }

    public init(src): void {
        this.initUserData();
        console.log(src);
    }

    /**初始化玩家数据 */
    private initUserData(): void {
        let uData = cc.sys.localStorage.getItem("uData");
        const nowTime = new Date().getTime();
        if(uData && uData !== ""){ //有存档
            uData = JSON.parse(uData);
            if(uData["lastSkill"] == undefined){
                uData["lastSkill"] = SkillList.fist;
            }

            if(uData["skill"] == undefined){
                uData["skill"] = {};
            }
            for(let skillKey in SkillList){
                if(uData["skill"][SkillList[skillKey]] == undefined){
                    uData["skill"][SkillList[skillKey]] = false;
                }                    
            }

            if(uData["task"] == undefined){
                uData["task"] = {};
            }
            for(let taskKey in TaskCfg){
                if(uData["task"][taskKey] == undefined){
                    uData["task"][taskKey] = false;
                }
            }

            if(uData["maxCombo"] == undefined) uData["maxCombo"] = 0;
            if(uData["continueLogin"] == undefined) uData["continueLogin"] = 1;
            if(uData["maxContinueLogin"] == undefined) uData["maxContinueLogin"] = 1;
            if(uData["maxLogin"] == undefined) uData["maxLogin"] = 1;
            if(uData["maxHitCount"] == undefined) uData["maxHitCount"] = 0;
            if(uData["shareSuccessCount"] == undefined) uData["shareSuccessCount"] = 0;
            if(uData["watchVideoCount"] == undefined) uData["watchVideoCount"] = 0;

            //首次登录
            if(uData["lastLoginTime"] == undefined || uData["lastLoginTime"] == ""){
                console.log("首次登录")
                uData["lastLoginTime"] = timestampToTime(nowTime);
            }

            //上次登录是昨天
            else if(parseInt(timestampToTime(nowTime).replace(/-/g, "")) 
                    - parseInt((uData["lastLoginTime"]).replace(/-/g, "")) == 1){
                console.log("上次登录是昨天")
                uData["continueLogin"] += 1;
                uData["maxLogin"] += 1;
                if(uData["continueLogin"] > uData["maxContinueLogin"]){
                    uData["maxContinueLogin"] = uData["continueLogin"];
                }
                uData["lastLoginTime"] = timestampToTime(nowTime);
            }
            //上次登录是昨天之前  --正常断连
            else if(parseInt(timestampToTime(nowTime).replace(/-/g, "")) 
                    - parseInt((uData["lastLoginTime"]).replace(/-/g, "")) > 1){
                console.log("上次登录是昨天之前  --正常断连")
                uData["continueLogin"] = 1; //连续登录天数重置为1
                uData["maxLogin"] += 1;        //总登录天数依然累加
                uData["lastLoginTime"] = timestampToTime(nowTime);
            }
            //今日重复登录
            else{
                console.log("今日重复登录")
                uData["lastLoginTime"] = timestampToTime(nowTime);
            }

            this.uData = uData;
        }
        else{ //无存档
            this.uData.userId = genId();
            this.uData["lastLoginTime"] = timestampToTime(nowTime);
            for(let skillKey in SkillList){
                if(this.uData["skill"][SkillList[skillKey]] == undefined){
                    this.uData["skill"][SkillList[skillKey]] = false;
                }                    
            }

            for(let taskKey in TaskCfg){
                if(this.uData["task"][taskKey] == undefined){
                    this.uData["task"][taskKey] = false;
                }
            }                   
        }
        this.uDataLocalStorage(); 
    }

    

    /**
     * 获取玩家数据
     */
    public getUserData(): any {
        return this.uData;       
    }

    /**
     * 玩家数据存储
     */
    private uDataLocalStorage(): void {
        let userData = JSON.stringify(this.uData)
        cc.sys.localStorage.setItem("uData", userData);
    }

    /**
     * 更新玩家数据
     */
    public updateMaxLevel(maxLevel: number): void {
        this.uData.maxLevel = maxLevel;
        this.uDataLocalStorage();

        // request.updateUserMaxLevel(this.uData.userId, {
        //     maxLevel: maxLevel
        // })
    }

    public updateCoin(coin: number): void {
        this.uData.coin = coin;
        this.uDataLocalStorage();
    }

    public updateLastWeapon(weapon: string): void {
        this.uData.lastWeapon = weapon;
        this.uDataLocalStorage();
    }

    public updateLastSkill(skill: string): void {
        this.uData.lastSkill = skill;
        this.uDataLocalStorage();
    }

    public unLockWeapon(weapon: string): void {
        this.uData.weapon[weapon].whetherHave = true;
        this.uDataLocalStorage();
    }

    public weaponUpgrade(weapon: string): void {
        console.log("b:",this.uData.weapon[weapon].level)
        this.uData.weapon[weapon].level ++;
        console.log("a:",this.uData.weapon[weapon].level)
        this.uDataLocalStorage();
    }


    /**
     * 保存玩家看视频或者分享领取奖励的时间
     * @param type "share" or "video"
     * @param time time: "2020-07-01"
     */
    public setVideoOrShareTime(type: string, time: string): void {
        const key = (type == "share") ? "shareTime" : "videoTime";
        let value = this.uData[key][time];
        if(value == undefined || !value) {
            this.uData[key][time] = 0;
        }
        this.uData[key][time] += 1;
        this.uDataLocalStorage();
    }
}

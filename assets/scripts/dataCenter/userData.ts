import {WeaponList, SkillList, TaskList} from "../config/Enumeration";
import {genId, timestampToTime} from "../utills/common";


export default class UserData {

    private uData = {
        userId: "",
        videoTime: {}, //观看视频广告时间记录
        shareTime: {}, //分享时间记录
        lastLoginTime: "", //上次登录时间
        maxLevel: 0,
        maxCombo: 0,
        maxContinueLogin: 1,
        maxLogin: 1,
        maxHitCount: 0,
        shareSuccessCount: 0,
        watchVideoCount: 0,
        coin: 0,
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
        skill: {
            fist: true,
            wind: true,
            arrowBlizzard: true,
        },
        task: {
            task1: false, //是否已领取奖励
            task2: false,
            task3: false,
        }
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
            for(let taskKey in TaskList){
                if(uData["task"][SkillList[taskKey]] == undefined){
                    uData["task"][SkillList[taskKey]] = false;
                }
            }

            if(uData["maxCombo"] == undefined) uData["maxCombo"] = 0;
            if(uData["maxContinueLogin"] == undefined) uData["maxContinueLogin"] = 1;
            if(uData["maxLogin"] == undefined) uData["maxLogin"] = 1;
            if(uData["maxHitCount"] == undefined) uData["maxHitCount"] = 0;
            if(uData["shareSuccessCount"] == undefined) uData["shareSuccessCount"] = 0;
            if(uData["watchVideoCount"] == undefined) uData["watchVideoCount"] = 0;

            const nowTime = new Date().getTime();
            //首次登录
            if(uData["lastLoginTime"] == undefined || uData["lastLoginTime"] == ""){
                uData["lastLoginTime"] = timestampToTime(nowTime);
            }
            //非首次登录,且昨日有登录过
            else if(parseInt(timestampToTime(nowTime).replace(/-/g, "")) 
                    - parseInt(timestampToTime(uData["lastLoginTime"]).replace(/-/g, "")) == 1){
                uData["maxContinueLogin"] += 1;
                uData["maxLogin"] += 1;
            }
            //非首次登录,昨天未登录过
            else{
                uData["maxContinueLogin"] = 1; //连续登录天数重置为1
                uData["maxLogin"] += 1;        //总登录天数依然累加
            }

            this.uData = uData;
        }
        else{ //无存档
            this.uData.userId = genId();                     
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

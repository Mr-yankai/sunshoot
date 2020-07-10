import {WeaponList} from "../config/Global";
import {request} from "../game/request"
import {genId} from "../utills/common"
import GameData from "./gameData";


export default class UserData {

    private uData = {
        userId: "",
        videoTime: {},
        shareTime: {},
        maxLevel: 0,
        coin: 0,
        lastWeapon: WeaponList.GeneralArrow,
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

    private initUserData(): void {
        let uData = cc.sys.localStorage.getItem("uData");
        if(uData && uData !== ""){
            this.uData = JSON.parse(uData);
        }
        else{
            this.uData.userId = genId();
            this.uDataLocalStorage();           
        }
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

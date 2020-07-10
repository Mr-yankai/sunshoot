
import {EnergyConfig} from "../config/Global"

export default class Energy extends cc.Component {

    /**
     * 当前体力值/当前倒计时时间
     */
    public currentCnt: number = 0;
    public countdownTime: number = 0;

    /**
     * 倒计时启动状态
     */
    public timerStatus: boolean = false;

    /**
     * 全局维一单例
     */
    public static instance: Energy;

    public static getInstance(): Energy{
        if(this.instance == null){
         this.instance = new Energy();
     }
     return this.instance;
    }

    public init(src): void {
        this.updataEnergy();
        this.startEventListen();
        console.log(src);
    }


    private getLeftCnt(): number {
        let leftCnt = cc.sys.localStorage.getItem("leftCnt");
        if(!leftCnt){
            leftCnt = EnergyConfig.initCnt;
        }else{
            leftCnt = parseFloat(leftCnt);           
        }
        return leftCnt;
    }

    private getLeftTime(): number {
        let leftTime = cc.sys.localStorage.getItem("leftTime");
        if(!leftTime){
            leftTime = new Date().getTime();           
        }else{
            leftTime = parseFloat(leftTime);
        }
        return leftTime;
    }

    /**
     * 进入/回到游戏时，更新体力状态
     */
    private updataEnergy(): void {
        let leftCnt = this.getLeftCnt();
        let leftTime = this.getLeftTime();
        let nowTime = new Date().getTime();
        let timeOffset = (nowTime - leftTime) / 1000;
        let energyOffset = timeOffset / EnergyConfig.timeInterval;
        let energy = leftCnt + energyOffset;    
        this.currentCnt = Math.floor(energy);  
        //上次离开游戏时体力值已达上限
        if(leftCnt >= EnergyConfig.maxCnt) {    
            this.currentCnt = leftCnt;
            this.countdownTime = EnergyConfig.timeInterval;
        }
        //游戏切后台期间能量值上涨到上限
        else if(energy >= EnergyConfig.maxCnt){ 
            this.currentCnt = EnergyConfig.maxCnt;
            this.countdownTime = EnergyConfig.timeInterval;
        }
        //游戏切后台期间能量值未上涨到上限
        else {                                  
            let time = 1 - (energy - this.currentCnt);
            this.countdownTime = Math.floor(time * EnergyConfig.timeInterval);
            this.startTimer();
        }     
        
    }

    /**
     * 离开游戏时 储存体力状态
     * @param leftCnt 体力值
     * @param remainderTime 倒计时时间
     * @param leftTime 时间戳
     */
    private saveEnergy(): void {
        let cnt = 1 - (this.countdownTime / EnergyConfig.timeInterval);
        let leftCnt = this.currentCnt + cnt;
        let leftTime = new Date().getTime();;
        cc.sys.localStorage.setItem("leftCnt", leftCnt.toString());
        cc.sys.localStorage.setItem("leftTime", leftTime.toString());
        this.stopTimer();
    }

    /**
     * 开启体力倒时计
     */
    private startTimer(): void {
        if(this.currentCnt >= EnergyConfig.maxCnt){
            this.countdownTime = EnergyConfig.timeInterval;
            return;
        }
        if(this.timerStatus){
            return;
        }
        this.timerStatus = true;
        this.schedule(()=>{
            if(this.countdownTime == 0){
                this.currentCnt ++;                
                this.countdownTime = EnergyConfig.timeInterval;
            }
            if(this.currentCnt >= EnergyConfig.maxCnt){
                this.stopTimer();
                return;
            }
            this.countdownTime --;
        }, 1, cc.macro.REPEAT_FOREVER, 0)
    }

    /**
     * 取消体力倒时计
     */
    private stopTimer(): void {
        this.unscheduleAllCallbacks();
        this.countdownTime = EnergyConfig.timeInterval;
        this.timerStatus = false;
    }

    /**
     * 体力增加/扣减
     * @param data 体力变化数值，正数为增加，负数为扣减
     */
    public energyChange(number: number): boolean {
        if(this.currentCnt + number < 0){
            return false
        }
        else{
            this.currentCnt += number;
            if(number < 0){
                this.startTimer();
            }
            return true;
        }       
    }

    /**
     * 开启事件监听
     */
    private startEventListen(): void {
        cc.game.on(cc.game.EVENT_HIDE, this.saveEnergy, this);
        cc.game.on(cc.game.EVENT_SHOW, this.updataEnergy, this);
    }

}
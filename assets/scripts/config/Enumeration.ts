/**
 * 事件枚举
 */
export enum EventList  {

    genSun = "genSun",
    updateLife = "updateLife",
    updateProgress = "updateProgress",
    gameOver = "gameOver",
    resurgence = "resurgence",
    playAdSuccess = "playAdSuccess",
    castSkill = "castSkill",
    combo = "combo",
}

/**
 * 游戏进程标识列表
 */
export enum GameProgress {
    start,        //游戏进行中
    resurgence,   //复活等待中
    end           //已结束
}

/**武器状态 */
export enum ShootStatus {
    NotBegin,
    Ready,
}

/**观看广告奖励类型 */
export enum PlayAdReward  {
    fullUsed,      //满级试用
    receiveCoin,   //领取金币
    receiveEnergy, //领取体力
    multiReceive,  //5倍领取金币
    resurgence,    //复活
}

/**
 * 武器列表
 */
export const WeaponList = {

    GeneralArrow: "generalArrow",        //普通箭
    ContinuousArrow: "continuousArrow",  //三箭连发
    PierceArrow: "pierceArrow",          //穿透   
    TripleArrow: "tripleArrow",          //三箭齐发
    CritArrow: "critArrow",              //暴击
    FrozenArrow: "frozenArrow",          //冰冻

}

/**
 * 技能列表
 */
export const SkillList = {   
    arrowBlizzard : "arrowBlizzard",
    firework: "firework",
    wind : "wind",
    arrowRound: "arrowRound",
    fist : "fist",
}

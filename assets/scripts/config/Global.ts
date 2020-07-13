
/**
 * 游戏基础数据配置
 */
export const General = {

    dataModel: 1,                   //数据模式  0:本地  1:服务器
    env: "prod",                    //环境, dataModel=1时有效  "test" or "prod"
    
    maxVideo: 10,                   //每日视频广告有效次数
    maxShare: 6,                    //每日分享有效次数 

    ArrowSpeed: 5400,               //箭矢速度
    SunHorizontalSpeed: [-80, 80],  //太阳水平移动速度范围
    SunVerticalSpeed: [30, 90],     //太阳竖直移动速度范围
    slowSpeed: 0.1,                 //复活等待时太阳移动速度减缓程度
    SunTurnInterval: 2,             //太阳移动转变方向时间间隔
    TripleArrowInterval: 12,        //三箭齐发三根箭的夹角
    //maxFocoTime: 3,                 //蓄力满所需时间

    resurgenceTime: 5,              //复活倒计时时间
    resurgenceLife: 3,              //复活增加生命值
    
    severHost: "https://godyan.cn/server/sunshoot",
    
}


/**
 * 体力相关配置
 */
export const EnergyConfig = {
    initCnt: 40,        //初始体力值
    timeInterval: 300,  //体力增长1点时间间隔
    maxCnt: 40,         //体力值上限
    consume: 5,         //第局游戏消耗体力数量
    freeReceive: 20,    //免费(广告)领取数量
}




/**
 * 微信相关配置
 */
export const Wechat = {

    appid: "wx3fb3adfdc955936d",

    adUnitId: "", //视频广告id

    shareTitle: "看，天上有10个太阳！",
    shareImageUrl: "https://godyan.cn/pictures/share/share_1.png"

}


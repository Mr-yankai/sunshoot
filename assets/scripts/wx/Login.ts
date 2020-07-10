import {request} from "../game/request";
import GameData from "../dataCenter/gameData";
//import {WXBizDataCrypt} from "../utills/common";
import {General,Wechat} from "../config/Global"

export default class Login {

    private openid : string = "";

    public static instance: Login = null;
    public static getInstance(): Login{
        if(this.instance == null){
            this.instance = new Login();
        }
        return this.instance;
    }

    public init(src: string): void {
        this.updateManage();
        console.log(src);
    }

    //新版本判断(保证用户使用版本为最新版本)  基础库 1.9.90 
    public updateManage(): void {
        let self = this;
        if (typeof wx.getUpdateManager === 'function') {
            const updateManager = wx.getUpdateManager();
            updateManager.onCheckForUpdate(function (res) {
                // 有新版本更新游戏
                if (res.hasUpdate) {
                    wx.showModal({
                        title: '更新提示',
                        content: '有新版本正在下载中！',
                    });
                } else {
                    //没有新版本 直接进行游戏
                    self.shareInit();
                    self.wxLogin();
                }
            });
            updateManager.onUpdateReady(function () {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，是否重启应用？',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                            updateManager.applyUpdate();
                            //更新成功 进入游戏
                            self.shareInit();
                            self.wxLogin();
                        }
                    }
                })
            });
            updateManager.onUpdateFailed(function () {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本下载失败，请删除图标重新搜索游戏',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            // 应用更新失败退出游戏
                            wx.exitMiniProgram({});
                        }
                    }
                })
            });
        } else {
            wx.showModal({
                title: '更新提示',
                content: '为了游戏正常运行，建议您先升级至微信最高版本！',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        // 微信版本过低退出游戏
                        wx.exitMiniProgram({});
                    }
                }
            })
        }
    }

    //微信登录，获取openid
    private wxLogin(): void {
        let self = this;
        wx.login({
            success(res) {
                if (res.code) {
                    const baseUrl = General.severHost;
                    //发起网络请求
                    wx.request({
                        url: baseUrl + `/getLoginInfo?code=${res.code}`,
                        success: resp => {
                            self.openid = resp.data["result"].openid;
                            const maxLevel = GameData.instance.getUserData().maxLevel;
                            GameData.instance.updateMaxLevel(maxLevel);
                        }
                    })
                } else {
                    console.log('登录失败！' + res.errMsg)
                }
            }
        })
    }

    //授权登录
    public authorizationLogin(): Promise<any> {
        let self = this;
        return new Promise<string>((resolve, reject)=>{
            wx.getSetting({
                success(res) {
                    if(res.authSetting["scope.userInfo"]) {
                        console.log("用户已授权");
                        resolve();
                    }
                    else {
                        console.log("用户未授权");
                        const sysInfo = wx.getSystemInfoSync();
                        let button = wx.createUserInfoButton({
                            type: 'text',
                            text: '',
                            style: {
                                left: 0,
                                top: 0,
                                width: sysInfo.screenWidth,
                                height: sysInfo.screenHeight,
                                backgroundColor: '#00000000',//最后两位为透明度
                                color: '#ffffff',
                                fontSize: 20,
                                textAlign: "center",
                                lineHeight: sysInfo.screenHeight,
                            }
                        });
                        button.onTap((res) => {
                            if (res.userInfo) {
                                console.log("用户授权返回结果:", res);
                                //更新用户信息到服务器
                                const userId = GameData.instance.getUserData().userId;
                                
                                request.updateUserInfo(userId, {
                                    openid: self.openid,
                                    nickName: res.userInfo.nickName,
                                    avatarUrl: res.userInfo.avatarUrl
                                })
                                button.destroy();                                
                                resolve();
                            }else {
                                console.log("用户拒绝授权:", res);
                                reject();
                            }
                        });
                    }
                }
            });
        })
    }

    //初始化接口
    private shareInit(): void {
        let self = this;
        //初始化右上角分享
        wx.showShareMenu({
            withShareTicket: true
        });
        wx.onShareAppMessage(function () {
            return {
                title: Wechat.shareTitle,
                imageUrl: Wechat.shareImageUrl,
            }
        });

        //开启监听 返回小程序启动参数（只有第一次激活生效）
        // let launchOption = wx.getLaunchOptionsSync();
        // console.log('首次开启 launchOption')
        // console.log(launchOption);

        //开启监听小游戏回到前台的事件 (分享返回，下拉框返回)
        // wx.onShow(function (dt) {
        //     if (launchOption.scene == "1044") {
        //         //判断是否从群分享链接进入  打开群排行
        //         //self.open.getComponent('openDomain').openCrowdRank(launchOption.shareTicket);
        //         //console.log("launchOption.scene == 1044 打开群排行")
        //     } else if (dt.scene == 1044) {
        //         //self.open.getComponent('openDomain').openCrowdRank(dt.shareTicket);
        //         //console.log("dt.scene == 1044 打开群排行")
        //     } else if (launchOption.scene == "1007") {
        //         //判断是否为分享页进入
        //         //console.log('分享好友开启' + launchOption.query.openid);
        //     } else if (dt.scene == 1007) {
        //         //console.log('分享好友开启' + dt.query.openid);
        //     }
        // })        
    }

    public getOpenid(): string {
        console.log("openid",this.openid)
        return this.openid;
    }
}

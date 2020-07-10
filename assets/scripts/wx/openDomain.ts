import {Wechat} from "../config/Global"


//向开放域发送数据
let postMessage = function (type: string, value: string): void {
    let openDataContext = wx.getOpenDataContext();
    if(!openDataContext) {
        console.log("无法找到开放域");
        return;
    };
    openDataContext.postMessage({
        type: type,
        value: value,
    })
}

// //隐藏排行榜（子域无法被主域关闭并且【可穿透】）
let hideRank = function (): void {
    this.postMessage('hide', '');
}

// //打开好友排行
let openFriendRank = function (userId: string) {
    this.postMessage('friend', userId);
}

//主动转发
let shareAppMessage = function (): void {
    wx.shareAppMessage({
        title: Wechat.shareTitle,
        imageUrl: Wechat.shareImageUrl,
        imageUrlId: "",
        query: 'openid=110',
    });
}

export const openDomain = {
    postMessage,
    hideRank,
    openFriendRank,
    shareAppMessage
}

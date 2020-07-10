import {get ,post} from "../managers/http";
import {wxGet, wxPost} from "../wx/wxRequest";
import {General} from '../config/Global'

const baseUrl: string = General.severHost;

let getWeaponList = async function(): Promise<any>{
    const url = baseUrl + `/getWeaponList?env=${General.env}`;
    let data = null;
    if(cc.sys.platform !== cc.sys.WECHAT_GAME){
        data = await get(url);
    }
    else{
        data = await wxGet(url);
    }
    return data.result;
}

let getWeaponLevelInfo = async function (weapon: string, 
    level: number): Promise<any>{
    const url = baseUrl + `/getWeaponLevelInfo?env=${General.env}&weapon=${weapon}&level=${level}`;
    let data = null;
    if(cc.sys.platform !== cc.sys.WECHAT_GAME){
        data = await get(url);
    }
    else{
        data = await wxGet(url);
    }
    return data.result;
}

let getWeaponUnlockLevel = async function(weapon: string): Promise<any>{
    const url = baseUrl + `/getWeaponUnlockLevel?env=${General.env}&weapon=${weapon}`;
    let data = null;
    if(cc.sys.platform !== cc.sys.WECHAT_GAME){
        data = await get(url);
    }
    else{
        data = await wxGet(url);
    }
    return data.result;
}

let updateWeaponUnlockLevel = async function(weapon: string, data: any): Promise<any>{
    const url = baseUrl + `/updateWeaponUnlockLevel?env=${General.env}&weapon=${weapon}`;
    let result = null;
    if(cc.sys.platform == cc.sys.WECHAT_GAME){
        result = await wxPost(url, data);
    }
    else{
        result = await post(url, data);
    }
    return result;
}

let getWeaponAttrList = async function(weapon: string): Promise<any>{
    const url = baseUrl + `/getWeaponAttrList?env=${General.env}&weapon=${weapon}`;
    let data = null;
    if(cc.sys.platform !== cc.sys.WECHAT_GAME){
        data = await get(url);
    }
    else{
        data = await wxGet(url);
    }
    return data.result;
}

let updateWeaponAttr = async function(weapon:string, level: number, data): Promise<any>{
    const url = baseUrl + `/updateWeaponAttr?env=${General.env}&weapon=${weapon}&level=${level}`;
    let result = null;
    if(cc.sys.platform == cc.sys.WECHAT_GAME){
        result = await wxPost(url, data);
    }
    else{
        result = await post(url, data);
    }
    return result;
}

let getAllWeaponAttr = async function(): Promise<any>{
    const url = baseUrl + `/getAllWeaponAttr?env=${General.env}`;
    let data = null;
    if(cc.sys.platform !== cc.sys.WECHAT_GAME){
        data = await get(url);
    }
    else{
        data = await wxGet(url);
    }
    return data.result;
}

let getLevelConfig = async function(): Promise<any>{
    const url = baseUrl + `/getLevelConfig?env=${General.env}`;
    let data = null;
    if(cc.sys.platform !== cc.sys.WECHAT_GAME){
        data = await get(url);
    }
    else{
        data = await wxGet(url);
    }
    return data.result;
}

let updateUserMaxLevel = async function( data: any): Promise<any>{
    const url = baseUrl + `/updateUserMaxLevel?env=${General.env}`;
    let result = null;
    if(cc.sys.platform == cc.sys.WECHAT_GAME){
        result = await wxPost(url, data);
    }
    else{
        result = await post(url, data);
    }
    return result;
}

let getBaseConfig = async function(): Promise<any>{
    const url = baseUrl + `/getBaseConfig?env=${General.env}`;
    let data = null;
    if(cc.sys.platform !== cc.sys.WECHAT_GAME){
        data = await get(url);
    }
    else{
        data = await wxGet(url);
    }
    return data.result;
}

let updateUserInfo = async function(userId: string, data: any): Promise<any>{
    const url = baseUrl + `/updateUserInfo?env=${General.env}&userId=${userId}`;
    let result = null;
    if(cc.sys.platform !== cc.sys.WECHAT_GAME){
        result = await post(url, data);
    }
    else{
        result = await wxPost(url, data);
    }
    return result;
}

//些方法只在微信中调用
// let getLoginInfo = async function(code: string): Promise<any>{
//     const url = baseUrl + `/getLoginInfo?env=${General.env}&code=${code}`;
//     let data = null;
//     if(cc.sys.platform !== cc.sys.WECHAT_GAME){
//         data = await get(url);
//     }
//     else{
//         data = await wxGet(url);
//     }
//     return data.result; 
// }


export const request =  {
    getWeaponList,
    getWeaponLevelInfo,
    getWeaponUnlockLevel,
    updateWeaponUnlockLevel,
    getWeaponAttrList,
    updateWeaponAttr,
    getAllWeaponAttr,
    getLevelConfig,
    updateUserMaxLevel,
    getBaseConfig,
    updateUserInfo,
    //getLoginInfo
}
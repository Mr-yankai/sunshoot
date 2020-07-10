//import Buffer from "Buffer";
//import crypto from "crypto"
// import Buffer = require("Buffer");
// import crypto = require('crypto');

let timestampToTime = function (timestamp: number): string{
    let date = null;
    if(timestamp.toString().length == 13){
        date = new Date(timestamp);
    }
    else{
        date = new Date(timestamp * 1000);
    } 
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    const D = date.getDate() < 10 ? '0'+date.getDate() : date.getDate();
    return Y+M+D;
}


let translateNumber = function (number: number): string{
    let result: string = "";
    if(number < 1000){
        result = number.toString();
    }
    else if(number < 1024 * 1000){
        result = ((number / 1024).toFixed(1)).toString() + "K";
    }
    else if(number < 1024 * 1024 * 1000){
        result = ((number / (1024 * 1024)).toFixed(1)).toString() + "M";
    }
    else if(number < 1024 * 1024 * 1024 * 1000){
        result = ((number / (1024 * 1024 * 1024)).toFixed(1)).toString() + "G";
    }
    else if(number < 1024 * 1024 * 1024 * 1024 * 1000){
        result = ((number / (1024 * 1024 * 1024 * 1024)).toFixed(1)).toString() + "T";
    }
    else if(number < 1024 * 1024 * 1024 * 1024 * 1024 * 1000){
        result = ((number / (1024 * 1024 * 1024 * 1024 * 1024)).toFixed(1)).toString() + "P";
    }
    else {
        result = ((number / (1024 * 1024 * 1024 * 1024 * 1024 * 1024)).toFixed(1)).toString() + "E";
    }
    return result;
}

 /**
* 生成唯一id
*/
let genId = function(): string {
   let d = new Date().getTime();
   const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
           const r = (d + Math.random() * 16) % 16 | 0;
           d = Math.floor(d / 16);
           return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
       });
   return uuid;
}

// let WXBizDataCrypt = function (appId: string,
//         sessionKey: string,
//         encryptedData: string,
//         iv: string): any {
//     let result: any = null;
//     try {
//         const sessionKeyBuffer = new Buffer(sessionKey, 'base64');
//         const encryptedDataBuffer = new Buffer(encryptedData, 'base64');
//         const ivBuffer = new Buffer(iv, 'base64');
//         var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer)
//         // 设置自动 padding 为 true，删除填充补位
//         decipher.setAutoPadding(true)
//         var decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8')
//         decoded += decipher.final('utf8');
//         result = JSON.parse(decoded);
//         console.log("result:",result);
//     } catch (error) {
//         throw new Error('Illegal Buffer');
//     }
//     if(result.watermark.appid !== appId){
//         throw new Error('Illegal Buffer');
//     }
//     return result;
// }

export {
    timestampToTime,
    translateNumber,
    genId,
    //WXBizDataCrypt
}
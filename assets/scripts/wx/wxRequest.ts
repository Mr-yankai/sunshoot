let wxGet = async function getRequest(url: string){

    return new Promise<any>((resolve, reject)=>{
        wx.request( {
            url: url,
            header: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json',
            },
            //timeout: 7000,
            method: 'GET',
            success: res => {
                resolve(res.data);
            }
        })
    })
}

let wxPost = async function postRequest(url: string, data: any){

    return new Promise<any>((resolve, reject)=>{
        wx.request( {
            url: url,
            data: data,
            header: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json',
            },
            //timeout: 7000,
            method: 'POST',
            success: res => {
                resolve(res.data);
            }
        })
    })    
}

export {
    wxGet,
    wxPost
}
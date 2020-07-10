enum RequestCache {
    noCache = 'no-cache',
    default = 'default',
    reload = 'reload',
    forceCache = 'force-cache',
    onlyIfCached = 'only-if-cached',
    cache = 'cache',
}

enum RequestMode {
    noCors = 'no-cors',
    sameOrigin = 'same-origin',
    cors = 'cors',
}


/* tslint:disable */
async function mock_post (mock_res: any, url: string,
    token?: string,
    data?: any,
    mode?: RequestMode,
    cache?: RequestCache): Promise<any> {
    return mock_res;
};

/**
 * 
 * @param {string} url 
 * @param {string} token 
 * @param {string} data 
 * @param {RequestMode} mode 
 * @param {RequestCache} cache
 * @returns {Promise<any>}
 */
let post = function postRequest(url: string,
    data?: any,
    token?: string,
    mode?: RequestMode,
    cache?: RequestCache): Promise<any> {

    if (!mode) {
        mode = RequestMode.cors;
    }
    if (!cache) {
        cache = RequestCache.default;
    }

    // config request
    let config: any = {
        body: JSON.stringify(data), // must match 'Content-Type' header
        cache: cache, // 'no-cache', 
        // *default, cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *omit
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json',
            'X-Authorization': 'Bearer'+token,
        },
        method: 'POST', // *GET, PUT, DELETE, etc.
        mode: mode, // no-cors, *same-origin, cors
        redirect: 'follow', // *manual, error
        referrer: 'no-referrer', // *client
    }

    // fetch api

    return fetch(url, config)
        // decode as json
        .then((response: Response) => {
            if (response.status != 200 && response.status != 204) {   // 更改密码时,返回204
                return response.json().then(json => Promise.reject(json))
            } else if (response.statusText == 'No Content') {
                return
            } else {
                return response.json()
            }
        })
}

let mock_get = async function getRequest(mock_res: any, url: string,
    token?: string,
    data: any = {},
    mode?: RequestMode,
    cache?: RequestCache): Promise<any> {
    return mock_res;
}

let get = async function getRequest(url: string,
    token?: string,
    data: any = {},
    mode?: RequestMode,
    cache?: RequestCache): Promise<any> {

    if (!mode) {
        mode = RequestMode.cors;
    }
    if (!cache) {
        cache = RequestCache.default;
    }
    // config request
    let config: any = {
        cache: cache, // 'no-cache', 
        // *default, cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *omit
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json',
            'X-Authorization': 'Bearer'+token,
        },
        method: 'GET', // *GET, PUT, DELETE, etc.
        mode: mode, // no-cors, *same-origin, cors
        redirect: 'follow', // *manual, error
        referrer: 'no-referrer', // *client
    }

    let esc = encodeURIComponent
    let query = Object.keys(data)
        .map(k => esc(k) + '=' + esc(data[k]))
        .join('&')
    if(query != ""){
        url += '?' + query;
    }
    
    try {
        let response: Response = await fetch(url, config);
        let body = response.json();
        return Promise.resolve(body);
    } catch (error) {
        console.log(error)
    }
    
};

// let deleteReq = function deleteRequest(url: string,
//     token?: string,
//     mode?: RequestMode,
//     cache?: RequestCache): Promise<any> {

//     if (!mode) {
//         mode = RequestMode.sameOrigin;
//     }
//     if (!cache) {
//         cache = RequestCache.default;
//     }

//     // config request
//     let config: any = {
//         cache: cache, // 'no-cache', 
//         // *default, cache, reload, force-cache, only-if-cached
//         credentials: 'same-origin', // include, *omit
//         headers: {
//             'user-agent': 'Mozilla/4.0 MDN Example',
//             'content-type': 'application/json',
//             'X-Authorization': 'Bearer'+token,
//         },
//         method: 'DELETE', // *GET, PUT, DELETE, etc.
//         mode: mode, // no-cors, *same-origin, cors
//         redirect: 'follow', // *manual, error
//         referrer: 'no-referrer', // *client
//     }

//     // fetch api
//     return fetch(url, config)
//         // decode as json
//         .then((response: Response) => {
//             if (response.status === 204) {
//                 return Promise.resolve({});
//             }
//             return response.json()
//         })

// };

// let put = function putRequest(url: string,
//     token?: string,
//     data?: any,
//     mode?: RequestMode,
//     cache?: RequestCache,
//     ): Promise<any> {

//     if (!mode) {
//         mode = RequestMode.sameOrigin;
//     }
//     if (!cache) {
//         cache = RequestCache.default;
//     }

//     // config request
//     let config: any = {
//         // body: JSON.stringify(data), // must match 'Content-Type' header
//         cache: cache, // 'no-cache', 
//         // *default, cache, reload, force-cache, only-if-cached
//         credentials: 'same-origin', // include, *omit
//         headers: {
//             'user-agent': 'Mozilla/4.0 MDN Example',
//             'content-type': 'application/json',
//             'X-Authorization': 'Bearer'+token,
//         },
//         method: 'PUT', // *GET, PUT, DELETE, etc.
//         mode: mode, // no-cors, *same-origin, cors
//         redirect: 'follow', // *manual, error
//         referrer: 'no-referrer', // *client
//         body: JSON.stringify(data),

//     }
//     return fetch(url, config)
//         // decode as json
//         .then((response: Response) => {
//             if (response.status != 200 && response.status != 204) {  
//                 return response.json().then(json => Promise.reject(json))
//             } else if (response.statusText == 'No Content') {
//                 return
//             } else {
//                 return response.json()
//             }
//         })
// }

// let patch = function patchRequest(url: string,
//     token?: string,
//     data?: any,
//     mode?: RequestMode,
//     cache?: RequestCache): Promise<any> {

//     if (!mode) {
//         mode = RequestMode.sameOrigin;
//     }
//     if (!cache) {
//         cache = RequestCache.default;
//     }

//     // config request
//     let config: any = {
//         body: JSON.stringify(data),
//         cache: cache, // 'no-cache', 
//         // *default, cache, reload, force-cache, only-if-cached
//         credentials: 'same-origin', // include, *omit
//         headers: {
//             'user-agent': 'Mozilla/4.0 MDN Example',
//             'content-type': 'application/json',
//             'X-Authorization': 'Bearer'+token,
//         },
//         method: 'PATCH', // *GET, PUT, DELETE, etc.
//         mode: mode, // no-cors, *same-origin, cors
//         redirect: 'follow', // *manual, error
//         referrer: 'no-referrer', // *client
//     }

//     // fetch api

//     return fetch(url, config)
//         // decode as json
//         .then((response: Response) => {
//             if (response.status != 200)
//                 return Promise.reject(response.json())
//             else
//                 return response.json()
//         })
// }

export {
    post,
    get,
    //deleteReq,
    //put,
    RequestCache,
    RequestMode,
    //patch,
    mock_post,
    mock_get
};

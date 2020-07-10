import Login from "./Login"

export default class CloudFunc {

    /**
     * 全局维一单例
     */
    public static instance: CloudFunc;

    public static getInstance(): CloudFunc{
        if(this.instance == null){
         this.instance = new CloudFunc();
     }
     return this.instance;
    }

    public init(src): void {
      if (cc.sys.platform === cc.sys.WECHAT_GAME){
        wx.cloud.init();
      }     
      console.log(src);
    }

    /**
     * 查询关卡配置数据
     */
    public async getStageCfg(): Promise<Array<Object>> {
      let stageData = [];
      if (cc.sys.platform === cc.sys.WECHAT_GAME){
        try {
          let data = await wx.cloud.callFunction({name: 'getStageCfg'});
          stageData = data.result;
        } 
        catch (error) {
          console.log(error);
        }                
      }      
      return stageData;
    }

    public upload_data (star: number): void{
        let userInfo = Login.get_user_info();
        let img = userInfo["avatarUrl"];
        let nickname = userInfo["nickName"]; 
        wx.cloud.callFunction({
            // 云函数名称
            name: 'upload_data',
            // 传给云函数的参数
            data: {
                img: img,
                nickname: nickname,
                star:star                
            },
            success: function(res) {
              console.log(res)
            },
            fail: function(res) {
                console.log(res)
            }
          })
    }

    /**
     * 查询用户游戏数据
     */
    public async query_user_data(): Promise<any>{
      try {
        let data = await wx.cloud.callFunction({name: 'query_user_data'});
        return data.result;
      } 
      catch (error) {
        console.log(error);
      }                
    }
}

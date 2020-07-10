
export default class ResLoad {

    public static instance: ResLoad = null;

    public static getInstance(): ResLoad{
        if(this.instance == null){
         this.instance = new ResLoad();
     }
     return this.instance;
    }

    public init(src): void {
        console.log(src);
    }

    private loadPrefabRes(url: string): Promise<boolean>{
        return new Promise<boolean>((resolve)=>{
            cc.loader.loadRes(url, cc.Prefab, error=>{
                if(error){
                    cc.error("[error]:", error);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            })
        })
    }

    private loadSpriteFrameRes(url: string): Promise<boolean>{
        return new Promise<boolean>((resolve)=>{
            cc.loader.loadRes(url, cc.SpriteFrame, error=>{
                if(error){
                    cc.error("[error]:", error);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            })
        })
    }

    private loadAudioClipRes(url: string): Promise<boolean>{
        return new Promise<boolean>((resolve)=>{
            cc.loader.loadRes(url, cc.AudioClip, error=>{
                if(error){
                    cc.error("[error]:", error);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            })
        })
    }

    private loadSpriteAtlasRes(url: string): Promise<boolean>{
        return new Promise<boolean>((resolve)=>{
            cc.loader.loadRes(url, cc.SpriteAtlas, error=>{
                if(error){
                    cc.error("[error]:", error);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            })
        })
    }

    private loadParticleRes(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve)=>{
            cc.loader.loadRes(url, cc.ParticleAsset, error=>{
                if(error){
                    cc.error("[error]:", error);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            })
        })
    }

    private loadEffectRes(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve)=>{
            cc.loader.loadRes(url, cc.EffectAsset, error=>{
                if(error){
                    cc.error("[error]:", error);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            })
        })
    }

    /**
     * 预列加载场景资源集合包
     * @param res_set {prefabs: [], sprite_frames:[], audio_clips: [], sprite_atlases: []}
     * @param on_progress 进度条函数: function(per) [per: 0, 1]
     */
    public async preloadAllRes(res_set: any, on_progress: Function): Promise<boolean>{
        let pList: Promise<boolean>[] = [];
        res_set["prefabs"].forEach(element => {
            pList.push(this.loadPrefabRes(element));
        });
        res_set["sprite_frames"].forEach(element => {
            pList.push(this.loadSpriteFrameRes(element));
        });
        res_set["audio_clips"].forEach(element => {
            pList.push(this.loadAudioClipRes(element));
        });
        res_set["sprite_atlases"].forEach(element => {
            pList.push(this.loadSpriteAtlasRes(element));
        });
        res_set["particles"].forEach(element => {
            pList.push(this.loadParticleRes(element));
        });
        res_set["effects"].forEach(element => {
            pList.push(this.loadEffectRes(element));
        });

        await Promise.all(pList);
        return true;
    }
 
    
    /**
    * 释放一个资源集合包
    * @param res_set  资源集合包
    */
    public releaseAllRes(res_set: any): void {
        if (res_set.sprite_frames && res_set.sprite_frames.length > 0) {
            cc.loader.release(res_set.sprite_frames)
        }
        if (res_set.audio_clips && res_set.audio_clips.length > 0) {
            cc.loader.release(res_set.audio_clips)
        } 
        if (res_set.sprite_atlases && res_set.sprite_atlases.length > 0) {
            cc.loader.release(res_set.sprite_atlases)
        } 
        if (res_set.prefabs && res_set.prefabs.length > 0) {
            for(var i = 0; i < res_set.prefabs.length; i ++) {
                var url = res_set.prefabs[i];
                var deps = cc.loader.getDependsRecursively(url);
                cc.loader.release(deps);
                cc.loader.release(url);
            }
        }
    }
 
    /**
     * 返回需要的资源
     * @param url 资源路径
     */
    public getRes(url: string, type?: any): any {
        return cc.loader.getRes(url, type);
    }

}

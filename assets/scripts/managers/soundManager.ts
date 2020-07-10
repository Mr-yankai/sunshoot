import ResLoad from "./resLoad"

export default class SoundManager {

    public static instance: SoundManager = null;

    public static getInstance():　SoundManager{
        if(this.instance == null){
            this.instance = new SoundManager();
        }
        return this.instance;
    }

    public init(src): void {
        this.initSoundStatus();
        console.log(src);
    }

    private soundStatus = {
        music: "on",
        effect: "on",
        shake: "on",
    };

    //当前正播放的音乐url
    private musicResUrl: string = null; 

    //当前是否正在播放背景音乐
    private isMusicPlaying: boolean = false;

    //本地储存音乐开关状态
    private localStorage(): void{
        cc.sys.localStorage.setItem("soundStatus", JSON.stringify(this.soundStatus));
    }

    //初始化音乐开关状态
    private initSoundStatus(): void{
        let status: string = cc.sys.localStorage.getItem("soundStatus");
        if( status === null || status === ""){   //没有存储值,默认为开
            return;
        }
        else{
            this.soundStatus = JSON.parse(status);
        }
    }

    public getSoundSwitch(): any {
        return this.soundStatus;
    }

    
    /**
     * 打开开关
     * @param key "music" or "effect" or "shake"
     */
    public turnOn(key: string): void{
        this.soundStatus[key] = "on";
        this.localStorage();
        if(key == "music" && !this.isMusicPlaying){
            this.playMusic(this.musicResUrl);
        }
    }

    public turnOff(key: string): void {
        this.soundStatus[key] = "off";
        this.localStorage();
        if(key == "music" && this.isMusicPlaying){
            this.stopMusic();
        }
    }

    //播放背景音乐
    public playMusic(url: string){
        const musicStatus: string = this.soundStatus.music;
        if(musicStatus == "off" || this.isMusicPlaying){
            this.musicResUrl = url;
            return;
        }
        const clip = ResLoad.instance.getRes(url, cc.AudioClip);
        cc.audioEngine.playMusic(clip, true); 
        this.musicResUrl = url;
        this.isMusicPlaying = true ;     
    }

    //停止播放背景音乐
    public stopMusic(): void{
        if(!this.musicResUrl){
            return;
        }
        cc.audioEngine.stopMusic();
        this.isMusicPlaying = false;
    }

    //播放音效
    public playEffect(url: string){
        const effectStatus: string = this.soundStatus.effect;
        if(effectStatus == "off"){
            return;
        }
        const clip = ResLoad.instance.getRes(url, cc.AudioClip);
        cc.audioEngine.playEffect(clip, false);
    }

    //振动:只在微信小游戏平台有效
    public playVibrate(): void {
        const effectStatus: string = this.soundStatus.shake;
        if(effectStatus == "off" || cc.sys.platform != cc.sys.WECHAT_GAME){
            return;
        }
        wx.vibrateLong({
            success: res=>{},
            fail: res=>{},
        })
    }
}

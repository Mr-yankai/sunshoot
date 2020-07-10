
export default class EventManager {

    public events_map = {}

    public init(src) {
        console.log(src);
    }

    public static instance: EventManager = null;
    public static getInstance(): EventManager {
        if(this.instance == null){
            this.instance = new EventManager();
        }
        return this.instance;
    }

    // func(event_name, udata)
    //添加监听回调
    public add_event_listener(event_name: string, caller: object, func: Function): void {
        if (!this.events_map[event_name]) {
            this.events_map[event_name] = [];
        }

        let event_queue = this.events_map[event_name];
        event_queue.push({
            caller: caller,
            func: func
        });
    }

    //删除监听回调
    public remove_event_listenner(event_name: string, caller: object, func: Function): void {
        if (!this.events_map[event_name]) {
            return;
        }
        let event_queue = this.events_map[event_name];
        for(let i: number = 0; i < event_queue.length; i ++) {
            let obj = event_queue[i];
            if (obj.caller == caller && obj.func == func) {
                event_queue.splice(i, 1);
                break;
            }
        }

        if (event_queue.length <= 0) {
            this.events_map[event_name] = null;
        }
    }

    //派发事件
    public dispatch_event(event_name: string, udata): void {
        if (!this.events_map[event_name]) {
            return;
        }

        var event_queue = this.events_map[event_name];
        for(var i = 0; i < event_queue.length; i ++) {
            var obj = event_queue[i];
            obj.func.call(obj.caller, event_name, udata);
        }
    }

    //移除所有事件回调
    public remove_all_listenner(): void{
        this.events_map = {};
    }
}

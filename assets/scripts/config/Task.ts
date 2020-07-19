import { SkillList } from "./Enumeration"

/**
 * 任务类型列表
 */
export const TaskType = {   
    MaxLevel : "maxLevel",
    MaxCombo : "maxCombo",
    MaxContinueLogin : "maxContinueLogin",
    MaxLogin: "maxLogin",
    MaxHitCount: "maxHitCount",
    ShareSuccessCount: "shareSuccessCount",
    WatchVideoCount: "watchVideoCount",
    TotalCoin: "totalCoin",
}

/**
 * 任务奖励列表
 */
export const TaskReward = {   
    ReceiveCoin : "receiveCoin",
    ReceiveEnergy : "receiveEnergy",
    ReceiveSkill : "receiveSkill",
}

/**
 * 玩家的任务奖励状态
 */
export enum TaskRewardStatus {
    unfinished,
    unreceived,
    received
}

/**
 * 任务配置
 */
export const TaskCfg = {
    1: {
        title: "登录有礼",
        description: "首次登录",
        condition: {
            type: TaskType.MaxContinueLogin,
            value: 1,
        },
        reward: {
            type: TaskReward.ReceiveCoin,
            value: "1024",
        }
    },
    2: {
        title: "登录达人",
        description: "连续登录3天",
        condition: {
            type: TaskType.MaxContinueLogin,
            value: 3,
        },
        reward: {
            type: TaskReward.ReceiveEnergy,
            value: 20,
        }
    },
    3: {
        title: "我从不缺席",
        description: "连续登录7天",
        condition: {
            type: TaskType.MaxContinueLogin,
            value: 7,
        },
        reward: {
            type: TaskReward.ReceiveSkill,
            value: SkillList.arrowRound,
        }
    },
    4: {
        title: "铁杆粉丝就是我啦",
        description: "累计登录7天",
        condition: {
            type: TaskType.MaxLogin,
            value: 7,
        },
        reward: {
            type: TaskReward.ReceiveEnergy,
            value: 40,
        }
    },
    5: {
        title: "高端选手",
        description: "最大连击数达到40",
        condition: {
            type: TaskType.MaxCombo,
            value: 40,
        },
        reward: {
            type: TaskReward.ReceiveCoin,
            value: 20480,
        }
    },
    6: {
        title: "箭无虚发",
        description: "最大连击数达到60",
        condition: {
            type: TaskType.MaxCombo,
            value: 60,
        },
        reward: {
            type: TaskReward.ReceiveEnergy,
            value: 30,
        }
    },
    7: {
        title: "百步穿杨",
        description: "最大连击数达到100",
        condition: {
            type: TaskType.MaxCombo,
            value: 100,
        },
        reward: {
            type: TaskReward.ReceiveCoin,
            value: 51200,
        }
    },
    8: {
        title: "好东西要分享",
        description: "分享游戏成功2次",
        condition: {
            type: TaskType.ShareSuccessCount,
            value: 2,
        },
        reward: {
            type: TaskReward.ReceiveEnergy,
            value: 10,
        }
    },
    9: {
        title: "分享使我快乐",
        description: "分享游戏成功5次",
        condition: {
            type: TaskType.ShareSuccessCount,
            value: 5,
        },
        reward: {
            type: TaskReward.ReceiveEnergy,
            value: 20,
        }
    },
    10: {
        title: "看广告也是一种享受",
        description: "观看视频广告4次",
        condition: {
            type: TaskType.WatchVideoCount,
            value: 4,
        },
        reward: {
            type: TaskReward.ReceiveSkill,
            value: SkillList.firework,
        }
    },
    11: {
        title: "这广告也太好看了吧",
        description: "观看视频广告10次",
        condition: {
            type: TaskType.WatchVideoCount,
            value: 10,
        },
        reward: {
            type: TaskReward.ReceiveSkill,
            value: SkillList.wind,
        }
    },
    12: {
        title: "闯关天才",
        description: "闯关通过50关",
        condition: {
            type: TaskType.MaxLevel,
            value: 50,
        },
        reward: {
            type: TaskReward.ReceiveCoin,
            value: 51200,
        }
    },
    13: {
        title: "刀山火海任我闯",
        description: "闯关通过150关",
        condition: {
            type: TaskType.MaxLevel,
            value: 150,
        },
        reward: {
            type: TaskReward.ReceiveSkill,
            value: SkillList.fist,
        }
    },
    14: {
        title: "太阳什么的,最讨厌了",
        description: "累计消灭太阳4000个",
        condition: {
            type: TaskType.MaxHitCount,
            value: 4000,
        },
        reward: {
            type: TaskReward.ReceiveEnergy,
            value: 30,
        }
    },
    15: {
        title: "这么热的天,太阳你去死吧",
        description: "累计消灭太阳10000个",
        condition: {
            type: TaskType.MaxHitCount,
            value: 10000,
        },
        reward: {
            type: TaskReward.ReceiveEnergy,
            value: 60,
        }
    },
    16: {
        title: "赚钱什么的,我最在行了",
        description: "累计获得1G金币",
        condition: {
            type: TaskType.TotalCoin,
            value: 1073741824,
        },
        reward: {
            type: TaskReward.ReceiveEnergy,
            value: 20,
        }
    },
    17: {
        title: "其实我是隐藏的富豪",
        description: "累计获得1T金币",
        condition: {
            type: TaskType.TotalCoin,
            value: 1099511627776,
        },
        reward: {
            type: TaskReward.ReceiveEnergy,
            value: 40,
        }
    },
}
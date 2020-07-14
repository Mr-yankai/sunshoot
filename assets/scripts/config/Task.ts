
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
    WatchVideoCount: "watchVideoCount"
}

/**
 * 任务奖励列表
 */
export const TaskReward = {   
    ReceiveCoin : "receiveCoin",
    ReceiveEnergy : "receiveEnergy",
    ReceiveSkill : "receiveSkill",
}

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
        title: "登录达人",
        description: "连续登录3天",
        condition: {
            type: TaskType.MaxContinueLogin,
            value: 3,
        },
        reward: {
            type: TaskReward.ReceiveSkill,
            value: "fist",
        }
    },
    2: {
        title: "登录狂魔",
        description: "连续登录7天",
        condition: {
            type: TaskType.MaxContinueLogin,
            value: 7,
        },
        reward: {
            type: TaskReward.ReceiveCoin,
            value: 50000,
        }
    },
    3: {
        title: "登录狂魔",
        description: "连续登录7天",
        condition: {
            type: TaskType.MaxContinueLogin,
            value: 7,
        },
        reward: {
            type: TaskReward.ReceiveEnergy,
            value: 10,
        }
    },
    4: {
        title: "登录狂魔",
        description: "连续登录7天",
        condition: {
            type: TaskType.MaxContinueLogin,
            value: 7,
        },
        reward: {
            type: TaskReward.ReceiveSkill,
            value: "wind",
        }
    },
    5: {
        title: "登录狂魔",
        description: "连续登录7天",
        condition: {
            type: TaskType.MaxContinueLogin,
            value: 7,
        },
        reward: {
            type: TaskReward.ReceiveSkill,
            value: "arrowBlizzard",
        }
    },
    6: {
        title: "登录狂魔",
        description: "连续登录7天",
        condition: {
            type: TaskType.MaxContinueLogin,
            value: 7,
        },
        reward: {
            type: TaskReward.ReceiveCoin,
            value: 50000,
        }
    },
    7: {
        title: "登录狂魔",
        description: "连续登录7天",
        condition: {
            type: TaskType.MaxContinueLogin,
            value: 7,
        },
        reward: {
            type: TaskReward.ReceiveCoin,
            value: 50000,
        }
    },
}
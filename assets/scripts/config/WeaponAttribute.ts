
/**
 * 武器升级数据
 */
export const WeaponAttribute = {
    generalArrow: {
        unlockLevel: 0,
        levelInfo: {
            Lv1: {
                upgradeCoin: 1000,
                attribute: {
                    damage: 100,
                }
                
            },
            Lv2: {
                upgradeCoin: 2000,
                attribute: {
                    damage: 200,
                }
            },
        }
        

    },

    tripleArrow: {
        unlockLevel: 10,
        levelInfo: {
            Lv1: {
                upgradeCoin: 1000,
                attribute: {
                    damage: 100,
                }
            },
            Lv2: {
                upgradeCoin: 2000,
                attribute: {
                    damage: 200,
                }
            },
        }
        
    },

    continuousArrow: {
        unlockLevel: 20,
        levelInfo: {
            Lv1: {
                upgradeCoin: 1000,
                attribute: {
                    damage: 100,
                }
            },
            Lv2: {
                upgradeCoin: 2000,
                attribute: {
                    damage: 200,
                }
            },
        }
        
    },

    pierceArrow: {
        unlockLevel: 30,
        levelInfo: {
            Lv1: {
                upgradeCoin: 1000,
                attribute: {
                    damage: 100,
                    pierceDamage: 0.6
                }            
            },
            Lv2: {
                upgradeCoin: 2000,
                attribute: {
                    damage: 200,
                    pierceDamage: 0.65
                }
            },
        }
        
    },

    critArrow: {
        unlockLevel: 40,
        levelInfo: {
            Lv1: {
                upgradeCoin: 1000,
                attribute: {
                    damage: 100,
                    critRate: 0.3,
                    critDamage: 1.5
                }            
            },
            Lv2: {
                upgradeCoin: 2000,
                attribute: {
                    damage: 200,
                    critRate: 0.32,
                    pierceDamage: 1.55
                }           
            },
        }
        
    },

    frozenArrow: {
        unlockLevel: 50,
        levelInfo: {
            Lv1: {
                upgradeCoin: 1000,
                attribute: {
                    damage: 100,
                    frozenRate: 0.3,
                    frozenTime: 2,
                }           
            },
            Lv2: {
                upgradeCoin: 2000,
                attribute: {
                    damage: 200,
                    frozenRate: 0.32,
                    frozenTime: 2.3,
                }             
            },
        }
        
    },
}
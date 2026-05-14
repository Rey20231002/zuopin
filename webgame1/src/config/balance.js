// 游戏平衡参数
;(function() {
    'use strict'
    window.config = window.config || {}
    window.config.balance = {
        trackLength: 25,          // 赛道格数（第25格为终点"摘莲台"）
        diceMin: 1,               // 签筒点数最小值
        diceMax: 3,               // 签筒点数最大值
        startCoins: 3,            // 起始铜钱
        aiCount: 4,               // AI对手数量
        maxPlayers: 6,            // 热座最大人数

        // 特殊龟参数
        specialDiceCount: 1,      // 黑白龟每轮只有1颗骰子

        // 回合押注结算 [§2.4]
        roundBetRewards: {
            first:  [5, 3, 2],
            second: 1,
            other: -1
        },

        // 全程竞猜结算 [§2.5]
        finalBetRewards: [8, 5, 3, 2, 1],
        finalBetPenalty: -1,

        pouchTriggerReward: 1,
        signTicketReward: 1
    }
})()

// 测试下注结算（6龟系统）
;(function() {
    'use strict'

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store); playerSystem.init(store)
        roundSystem.init(store); betSystem.init(store)
        store.dispatch('INIT_PLAYERS', { totalPlayers: 2, isSolo: false })
        store.dispatch('INIT_RACE', { startPositions: [0, 1, 2, 0, 0, 0] })
        store.dispatch('START_ROUND', {})
        store.dispatch('TAKE_ROUND_BET', { playerId: 0, turtleId: 'huang', ticketIndex: 0, removeFromRound: true })
        var s = store.state
        TestRunner.assert(s.bets.roundBets.length === 1, '下注记录1条')
        store.dispatch('SETTLE_ROUND', {})
        s = store.state
        TestRunner.assert(s.players[0].coins >= 7, '押对第1名第0张券得5铜钱(3+5=8)')
    })()

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store); playerSystem.init(store)
        roundSystem.init(store); betSystem.init(store)
        store.dispatch('INIT_PLAYERS', { totalPlayers: 2, isSolo: false })
        // 赤霄格3#1, 墨渊格1#2, 白泽格0#3
        // bai格1=#2
        store.dispatch('INIT_RACE', { startPositions: [0, 3, 0, 1, 0, 0] })
        store.state.bets.roundBets = [{ playerId: 0, turtleId: 'bai', ticketIndex: 0 }]
        store.dispatch('SETTLE_ROUND', {})
        var s = store.state
        TestRunner.assert(s.players[0].coins === 4, '押对第2名(bai)得1铜钱(3+1=4)')
    })()

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store); playerSystem.init(store)
        roundSystem.init(store); betSystem.init(store)
        store.dispatch('INIT_PLAYERS', { totalPlayers: 3, isSolo: false })
        // 青玄格3#1
        store.dispatch('INIT_RACE', { startPositions: [3, 1, 0, 0, 0, 0] })
        var s = store.state
        s.bets.finalFirst = [
            { playerId: 0, turtleId: 'qing', order: 0 },
            { playerId: 1, turtleId: 'chi', order: 1 }
        ]
        store.dispatch('SETTLE_FINALS', {})
        s = store.state
        TestRunner.assert(s.players[0].coins === 11, '猜对鳌头第1个中得8文(3+8=11)')
        TestRunner.assert(s.players[1].coins === 2, '猜错鳌头赔1文(3-1=2)')
    })()

})()

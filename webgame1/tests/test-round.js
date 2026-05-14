// 测试回合流程（6普龟+1逆行签=7签）
;(function() {
    'use strict'

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store); playerSystem.init(store)
        roundSystem.init(store); betSystem.init(store)
        store.dispatch('INIT_PLAYERS', { totalPlayers: 2, isSolo: false })
        store.dispatch('INIT_RACE', { startPositions: [0,1,2,3,4,0] })
        store.dispatch('START_ROUND', {})
        var s = store.state
        TestRunner.assert(s.round.number === 1, '回合编号从1开始')
        TestRunner.assert(s.round.signsRemaining.length === 7, '签筒有7支签(6普通+1逆行)')
        TestRunner.assert(s.round.ticketsRemaining.length === 18, '回合押注券共18张(6色x3)')
        for (var i = 0; i < s.round.signsRemaining.length; i++) {
            TestRunner.assert(s.round.signsRemaining[i].value >= 1 && s.round.signsRemaining[i].value <= 3, '签点数1-3')
        }
    })()

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store); playerSystem.init(store)
        roundSystem.init(store)
        store.dispatch('INIT_PLAYERS', { totalPlayers: 2, isSolo: false })
        store.dispatch('INIT_RACE', { startPositions: [0,1,2,3,4,0] })
        store.dispatch('START_ROUND', {})
        var s = store.state
        s.round.signsRemaining = []
        store.dispatch('NEXT_PLAYER', {})
        s = store.state
        TestRunner.assert(s.round.phase === 'settle', '签筒空后切换到settle')
    })()

})()

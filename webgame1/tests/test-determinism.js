// 测试确定性回放
;(function() {
    'use strict'

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store); playerSystem.init(store)
        roundSystem.init(store); betSystem.init(store)
        store.dispatch('INIT_PLAYERS', { totalPlayers: 2, isSolo: false })
        store.dispatch('INIT_RACE', { startPositions: [0,1,2,0,0,0] })
        store.dispatch('START_ROUND', {})
        var snapshot = JSON.parse(JSON.stringify(store.state))
        var history = store.history.slice()

        store.clearAll(); store.resetState(42)
        raceSystem.init(store); playerSystem.init(store)
        roundSystem.init(store); betSystem.init(store)
        for (var i = 0; i < history.length; i++) {
            store.dispatch(history[i].type, history[i].payload)
        }
        TestRunner.assertDeepEqual(store.state, snapshot, '相同seed回放一致')
    })()

    ;(function() {
        store.clearAll(); store.resetState(12345)
        var v1 = []; for (var i=0;i<10;i++) v1.push(store.prng.next(1,100))
        store.clearAll(); store.resetState(12345)
        var v2 = []; for (var j=0;j<10;j++) v2.push(store.prng.next(1,100))
        for (var k=0;k<10;k++) TestRunner.assert(v1[k]===v2[k], 'PRNG一致')
    })()

    ;(function() {
        store.clearAll(); store.resetState(100)
        var v1 = []; for (var i=0;i<5;i++) v1.push(store.prng.next(1,100))
        store.clearAll(); store.resetState(200)
        var v2 = []; for (var j=0;j<5;j++) v2.push(store.prng.next(1,100))
        var same = true; for (var k=0;k<5;k++) if (v1[k]!==v2[k]) same=false
        TestRunner.assert(!same, '不同seed不同序列')
    })()

})()

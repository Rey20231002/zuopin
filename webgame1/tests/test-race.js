// 测试灵龟移动、叠罗汉、锦囊触发（6普龟+2逆行龟）
;(function() {
    'use strict'

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store)
        store.dispatch('INIT_RACE', { startPositions: [0, 1, 2, 3, 4, 0] })
        var s = store.state
        TestRunner.assert(s.race.cells[0].length >= 1, '青玄在格子0')
        TestRunner.assert(s.race.cells[0].indexOf('qing') !== -1, '青玄在格子0')
        // 特殊龟在终点
        TestRunner.assert(s.race.cells[24].length >= 2, '终点有2只逆行龟')
    })()

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store)
        // 6只普通龟分散
        store.dispatch('INIT_RACE', { startPositions: [0, 1, 2, 3, 4, 5] })
        store.dispatch('DRAW_SIGN', { turtleId: 'qing', steps: 2 })
        var s = store.state
        TestRunner.assert(s.race.cells[0].length === 0, '青玄离开格子0')
        TestRunner.assert(s.race.cells[2].indexOf('qing') !== -1, '青玄到达格子2')
    })()

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store)
        store.dispatch('INIT_RACE', { startPositions: [0, 1, 0, 0, 0, 0] })
        var s = store.state
        TestRunner.assert(s.race.cells[0].length >= 4, '多只龟在起点')
        // 终点有2只逆行龟
        TestRunner.assert(s.race.cells[24].length === 2, '逆行龟在终点')
    })()

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store)
        store.dispatch('INIT_RACE', { startPositions: [0, 0, 0, 0, 0, 0] })
        // 移动墨渊(配置索引5)单独1步
        store.dispatch('DRAW_SIGN', { turtleId: 'hei', steps: 1 })
        var s = store.state
        TestRunner.assert(s.race.cells[0].length === 4, 'hei和zi被驮走，剩4只')
        TestRunner.assert(s.race.cells[1].indexOf('hei') !== -1, '墨渊在格子1')
    })()

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store)
        store.dispatch('INIT_RACE', { startPositions: [0, 0, 0, 0, 0, 0] })
        var s = store.state
        // 青玄(底部)走1步，背上5只一起驮走
        store.dispatch('DRAW_SIGN', { turtleId: 'qing', steps: 1 })
        s = store.state
        TestRunner.assert(s.race.cells[0].length === 0, '所有龟被驮走')
        TestRunner.assert(s.race.cells[1].length === 6, '全部6只到达格子1')
    })()

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store)
        pouchSystem.init(store)
        store.dispatch('INIT_RACE', { startPositions: [0, 1, 2, 3, 4, 5] })
        store.state.pouches = [{ cell: 2, playerId: 0, type: 'lotus' }]
        store.dispatch('DRAW_SIGN', { turtleId: 'qing', steps: 2 })
        store.dispatch('TRIGGER_POUCH', { turtleId: 'qing', direction: 1 })
        var s = store.state
        TestRunner.assert(s.race.cells[3].indexOf('qing') !== -1, '青玄被浮萍推到格子3')
    })()

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store)
        store.dispatch('INIT_RACE', { startPositions: [0, 0, 23, 0, 0, 0] })
        store.dispatch('DRAW_SIGN', { turtleId: 'huang', steps: 3 })
        var s = store.state
        TestRunner.assert(raceSystem.hasFinished(s), '黄枢越过终点线')
    })()

    ;(function() {
        store.clearAll(); store.resetState(42)
        raceSystem.init(store)
        store.dispatch('INIT_RACE', { startPositions: [0, 0, 0, 0, 0, 0] })
        // 特殊龟反向移动
        store.dispatch('DRAW_SPECIAL', { steps: 2 })
        var s = store.state
        var found = false
        for (var c = 0; c < 25; c++) {
            if (s.race.cells[c].indexOf('black') !== -1 || s.race.cells[c].indexOf('white') !== -1) {
                found = true
            }
        }
        TestRunner.assert(found, '特殊龟已从终点移动')
    })()

})()

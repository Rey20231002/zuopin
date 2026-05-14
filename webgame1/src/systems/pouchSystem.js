// 锦囊系统 — 放置浮萍(+1)/漩涡(-1)
;(function() {
    'use strict'

    var pouchSystem = {
        init: function(store) {
            var self = this
            self.store = store

            store.state.pouches = []   // [{ cell, playerId, type: 'lotus'|'vortex' }]

            store.register('PLACE_POUCH', function(state, payload) {
                self._placePouch(state, payload)
            }, 'pouches')

            store.register('CLEAR_POUCH', function(state, payload) {
                self._clearPouch(state, payload)
            }, 'pouches')
        },

        _placePouch: function(state, payload) {
            var playerId = payload.playerId
            var cell = payload.cell
            var type = payload.type  // 'lotus' or 'vortex'
            var trackLen = config.balance.trackLength

            // 验证：不能放第1格
            if (cell === 0) return

            // 验证：不能放在有龟的格
            var raceCells = state.race.cells
            if (raceCells[cell] && raceCells[cell].length > 0) return

            // 验证：不能与现有锦囊相邻
            var pouches = state.pouches
            for (var i = 0; i < pouches.length; i++) {
                if (Math.abs(pouches[i].cell - cell) <= 1) return
            }

            // 放置锦囊
            pouches.push({ cell: cell, playerId: playerId, type: type })

            // 标记该玩家已放置锦囊
            var players = state.players
            for (var p = 0; p < players.length; p++) {
                if (players[p].id === playerId) {
                    players[p].pouchPlaced = true
                    players[p].pouchType = type
                    players[p].pouchCell = cell
                    break
                }
            }

            store.dispatch('NEXT_PLAYER', {})
        },

        // 清除指定格上的锦囊
        _clearPouch: function(state, payload) {
            var cell = payload.cell
            var pouches = state.pouches
            for (var i = 0; i < pouches.length; i++) {
                if (pouches[i].cell === cell) {
                    pouches.splice(i, 1)
                    break
                }
            }
        },

        // 检查某格是否有锦囊
        getPouchAt: function(state, cell) {
            var pouches = state.pouches
            for (var i = 0; i < pouches.length; i++) {
                if (pouches[i].cell === cell) return pouches[i]
            }
            return null
        },

        // 确认某玩家是否已放锦囊
        hasPlacedPouch: function(state, playerId) {
            var players = state.players
            for (var i = 0; i < players.length; i++) {
                if (players[i].id === playerId) return players[i].pouchPlaced
            }
            return false
        }
    }

    window.pouchSystem = pouchSystem
})()

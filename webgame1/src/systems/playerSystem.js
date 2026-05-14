// 玩家管理系统 — 玩家数据、铜钱收支
;(function() {
    'use strict'

    var playerSystem = {
        init: function(store) {
            var self = this
            self.store = store

            store.state.players = []

            store.register('INIT_PLAYERS', function(state, payload) {
                self._initPlayers(state, payload)
            }, 'players')

            store.register('ADD_COINS', function(state, payload) {
                self._addCoins(state, payload)
            }, 'players')
        },

        _initPlayers: function(state, payload) {
            state.players = []
            var totalPlayers = payload.totalPlayers
            var isSolo = payload.isSolo
            var aiNames = config.strings.aiNames

            // 人类玩家
            state.players.push({
                id: 0,
                name: payload.humanName || '你',
                coins: config.balance.startCoins,
                isHuman: true,
                color: '#c04040',    // 朱砂红
                pouchPlaced: false,
                pouchType: null,
                pouchCell: null
            })

            if (isSolo) {
                // 添加AI玩家
                for (var i = 0; i < config.balance.aiCount; i++) {
                    state.players.push({
                        id: i + 1,
                        name: aiNames[i],
                        coins: config.balance.startCoins,
                        isHuman: false,
                        isAI: true,
                        personality: config.strings.aiPersonalities[i],
                        color: ['#5b7f95', '#d4a843', '#5b8c5a', '#7b5b7b'][i],
                        pouchPlaced: false,
                        pouchType: null,
                        pouchCell: null
                    })
                }
            } else {
                // 热座多人
                for (var j = 1; j < totalPlayers; j++) {
                    state.players.push({
                        id: j,
                        name: '玩家' + (j + 1),
                        coins: config.balance.startCoins,
                        isHuman: true,
                        isAI: false,
                        color: ['#5b7f95', '#d4a843', '#5b8c5a', '#7b5b7b', '#c04040'][j % 5],
                        pouchPlaced: false,
                        pouchType: null,
                        pouchCell: null
                    })
                }
            }
        },

        _addCoins: function(state, payload) {
            var players = state.players
            for (var i = 0; i < players.length; i++) {
                if (players[i].id === payload.playerId) {
                    players[i].coins += payload.amount
                    if (players[i].coins < 0) players[i].coins = 0
                    return
                }
            }
        },

        // 获取玩家信息
        getPlayer: function(state, playerId) {
            var players = state.players
            for (var i = 0; i < players.length; i++) {
                if (players[i].id === playerId) return players[i]
            }
            return null
        }
    }

    window.playerSystem = playerSystem
})()

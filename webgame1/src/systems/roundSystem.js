// 回合管理系统 — 一巡流程、签筒状态、回合阶段切换
;(function() {
    'use strict'

    var roundSystem = {
        init: function(store) {
            var self = this
            self.store = store

            store.state.round = {
                number: 0,              // 当前第几巡
                phase: 'init',          // init | player_turn | settle | game_over
                currentPlayerIndex: 0,  // 当前操作的玩家
                signsRemaining: [],     // [{ turtleId, value }] 未抽的签
                signsDrawn: [],         // [{ turtleId, value }] 已抽的签
                ticketsRemaining: [],   // 回合押注券 [{ turtleId, ticketIndex: 0|1|2 }]
                signTicketsHeld: {},    // { playerIndex: count } 玩家持有的签筹数量
                playerOrder: [],        // 本回合玩家行动顺序
                turnActionsDone: 0      // 当前回合已行动次数
            }

            store.register('START_ROUND', function(state, payload) {
                self._startRound(state, payload)
            }, 'round')

            store.register('NEXT_PLAYER', function(state, payload) {
                self._nextPlayer(state, payload)
            }, 'round')

            store.register('TAKE_TICKET', function(state, payload) {
                self._takeTicket(state, payload)
            }, 'round')

            store.register('ADD_SIGN_TICKET', function(state, payload) {
                self._addSignTicket(state, payload)
            }, 'round')
        },

        _startRound: function(state, payload) {
            var r = state.round
            r.number++
            r.phase = 'player_turn'
            r.currentPlayerIndex = 0
            r.signsDrawn = []
            r.turnActionsDone = 0

            // 生成签筒：6支普通签 + 1支黑白逆行签
            r.signsRemaining = []
            r.specialSignRemaining = true
            var turtleIds = config.turtles.map(function(t) { return t.id })
            for (var i = 0; i < turtleIds.length; i++) {
                r.signsRemaining.push({
                    turtleId: turtleIds[i],
                    value: store.prng.next(config.balance.diceMin, config.balance.diceMax),
                    isSpecial: false
                })
            }
            // 黑白逆行签
            r.signsRemaining.push({
                turtleId: 'special',
                value: store.prng.next(config.balance.diceMin, config.balance.diceMax),
                isSpecial: true
            })

            // 重置回合押注券（6色x3张=18张）
            r.ticketsRemaining = []
            for (var t = 0; t < config.turtles.length; t++) {
                for (var ti = 0; ti < 3; ti++) {
                    r.ticketsRemaining.push({ turtleId: config.turtles[t].id, ticketIndex: ti })
                }
            }

            // 重置黑白龟移动标记
            state.race.specialMovedThisRound = false

            // 重置签筹持有数
            r.signTicketsHeld = {}
            var players = state.players
            for (var p = 0; p < players.length; p++) {
                r.signTicketsHeld[p] = 0
            }

            // 玩家按铜钱数量排行动顺序（铜钱少的先行动）
            r.playerOrder = players.map(function(pl, idx) { return idx })
            r.playerOrder.sort(function(a, b) {
                return players[a].coins - players[b].coins
            })
            r.currentPlayerIndex = 0
        },

        _nextPlayer: function(state, payload) {
            var r = state.round
            r.turnActionsDone++

            // 检查签筒是否已空 → 结算
            if (r.signsRemaining.length === 0) {
                r.phase = 'settle'
                return
            }

            // 循环到下一位玩家
            var order = r.playerOrder
            var currentIdxInOrder = order.indexOf(r.currentPlayerIndex)
            var nextIdxInOrder = (currentIdxInOrder + 1) % order.length
            r.currentPlayerIndex = order[nextIdxInOrder]
        },

        _takeTicket: function(state, payload) {
            var r = state.round
            var remaining = r.ticketsRemaining
            for (var i = 0; i < remaining.length; i++) {
                if (remaining[i].turtleId === payload.turtleId && remaining[i].ticketIndex === payload.ticketIndex) {
                    remaining.splice(i, 1)
                    return
                }
            }
        },

        _addSignTicket: function(state, payload) {
            var r = state.round
            var playerIdx = payload.playerIndex
            if (r.signTicketsHeld[playerIdx] === undefined) {
                r.signTicketsHeld[playerIdx] = 0
            }
            r.signTicketsHeld[playerIdx]++
        },

        // 获取当前玩家
        getCurrentPlayer: function(state) {
            return state.round.currentPlayerIndex
        },

        // 获取可抽取的签
        getAvailableSigns: function(state) {
            return state.round.signsRemaining.slice()
        },

        // 获取剩余回合押注券
        getAvailableTickets: function(state) {
            return state.round.ticketsRemaining.slice()
        }
    }

    window.roundSystem = roundSystem
})()

// 日志系统 — 监听所有dispatch，转为人读的回合记录
;(function() {
    'use strict'

    var logSystem = {
        init: function(store) {
            var self = this
            self.store = store

            store.state.log = []  // { round, playerName, action, detail }

            // 全局订阅，拦截所有action
            store.subscribe(function(state, type, payload) {
                self._record(state, type, payload)
            })
        },

        _record: function(state, type, payload) {
            if (!payload) return
            var round = state.round ? state.round.number : 0
            var playerIdx = payload.playerId !== undefined ? payload.playerId : -1
            var player = state.players && playerIdx >= 0 ? state.players[playerIdx] : null
            var pname = player ? player.name : '系统'

            var msg = ''
            var turtleName = ''
            if (payload.turtleId) {
                for (var t = 0; t < config.turtles.length; t++) {
                    if (config.turtles[t].id === payload.turtleId) {
                        turtleName = config.turtles[t].name
                        break
                    }
                }
            }

            switch (type) {
                case 'DRAW_SIGN':
                    break
                case 'DRAW_SPECIAL':
                    // 获取当前玩家
                    var cpIdx = state.round ? state.round.currentPlayerIndex : -1
                    var cp = (cpIdx >= 0 && state.players) ? state.players[cpIdx] : null
                    var drawerName = cp ? cp.name : '未知'
                    var specialName = ''
                    if (state.race._lastSpecialMove) {
                        for (var st = 0; st < config.specialTurtles.length; st++) {
                            if (config.specialTurtles[st].id === state.race._lastSpecialMove.turtleId) {
                                specialName = config.specialTurtles[st].name; break
                            }
                        }
                    }
                    state.log.push({
                        round: round,
                        playerName: drawerName,
                        action: '摇签 — 抽中逆行签「' + (specialName || '逆行龟') + '」后退' + payload.steps + '步',
                        detail: '',
                        isDivider: false
                    })
                    return
                case 'TAKE_ROUND_BET':
                    msg = '领取回合押注券 — 押「' + turtleName + '」第' + (payload.ticketIndex + 1) + '张'
                    break
                case 'PLACE_POUCH':
                    var pouchName = payload.type === 'lotus' ? '浮萍(+1)' : '漩涡(-1)'
                    msg = '投放锦囊 — ' + pouchName + ' 于第' + (payload.cell + 1) + '格'
                    break
                case 'PLACE_FINAL_BET':
                    var betTypeName = payload.betType === 'first' ? '鳌头' : '殿后'
                    msg = '全程竞猜 — 押「' + turtleName + '」为' + betTypeName
                    break
                case 'START_ROUND':
                    state.log.push({ round: round, playerName: '———', action: '第' + round + '巡开始 ———', detail: '', isDivider: true })
                    return
                case 'SETTLE_ROUND':
                    state.log.push({ round: round, playerName: '———', action: '第' + round + '巡结算（验莲榜）', detail: '', isDivider: true })
                    return
                default:
                    return
            }

            if (msg) {
                state.log.push({
                    round: round,
                    playerName: pname,
                    action: msg,
                    detail: '',
                    isDivider: false
                })
            }
        },

        // 手动记录抽签（因为DRAW_SIGN不带playerId）
        logDrawSign: function(state, playerIdx, turtleId, steps) {
            var player = state.players[playerIdx]
            var pname = player ? player.name : '系统'
            var turtleName = ''
            for (var t = 0; t < config.turtles.length; t++) {
                if (config.turtles[t].id === turtleId) {
                    turtleName = config.turtles[t].name
                    break
                }
            }
            state.log.push({
                round: state.round.number,
                playerName: pname,
                action: '摇签 — 抽中「' + turtleName + '」前进' + steps + '步',
                detail: '',
                isDivider: false
            })
        }
    }

    window.logSystem = logSystem
})()

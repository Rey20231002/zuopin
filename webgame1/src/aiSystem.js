// AI决策系统
;(function() {
    'use strict'

    var aiSystem = {
        init: function(store) {
            this.store = store
            store.state.ai = { pendingAction: false }
        },

        // 每帧检查：当前轮到AI玩家时自动决策
        update: function(state, dt) {
            if (state.ai._thinking) return  // 正在决策中
            if (state.round.phase !== 'player_turn') return

            var currentIdx = state.round.currentPlayerIndex
            var player = state.players[currentIdx]
            if (!player || player.isHuman) return

            // AI决策（1500ms模拟思考）
            var self = this
            state.ai._thinking = true
            var thinkStart = Date.now()
            setTimeout(function() {
                // 安全网：如果阶段已不是player_turn，放弃行动
                if (state.round.phase !== 'player_turn') {
                    state.ai._thinking = false
                    return
                }
                try {
                    self._decide(state, currentIdx)
                } catch (e) {
                    // 捕获异常防止_thinking永久卡死
                }
                state.ai._thinking = false
            }, 1500)
        },

        _decide: function(state, playerIdx) {
            // 再次确认阶段合法性
            if (state.round.phase !== 'player_turn') return

            var player = state.players[playerIdx]
            if (!player) return
            var personality = player.personality || 'conservative'
            var round = state.round
            var ranking = raceSystem.getRanking(state)
            var balance = config.balance

            // 概率偏向：激进型更爱全程竞猜，搅局型更爱放锦囊
            var aggressiveChance = personality === 'aggressive' ? 0.4 : (personality === 'disruptor' ? 0.2 : 0.1)
            var pouchChance = personality === 'disruptor' ? 0.5 : (personality === 'aggressive' ? 0.1 : 0.2)

            var rand = store.prng.next(1, 100) / 100

            // 1. 搅局型优先考虑放锦囊
            if (!player.pouchPlaced && rand < pouchChance) {
                var pouchCell = this._findPouchCell(state)
                if (pouchCell !== -1) {
                    var pouchType = store.prng.next(0, 1) === 0 ? 'lotus' : 'vortex'
                    // 如果落后龟多，倾向放浮萍帮落后龟；领先龟多则放漩涡
                    if (ranking.length > 0) {
                        var leader = ranking[0].turtleId
                        // 检查领先龟是否和其他龟叠在一起
                        var leaderCell = -1
                        for (var c = 0; c < state.race.cells.length; c++) {
                            if (state.race.cells[c].indexOf(leader) !== -1) { leaderCell = c; break }
                        }
                        if (leaderCell > state.race.trackLength * 0.6) {
                            pouchType = 'vortex'  // 领先龟快到了，放漩涡阻拦
                        }
                    }
                    store.dispatch('PLACE_POUCH', { playerId: player.id, cell: pouchCell, type: pouchType })
                    return
                }
            }

            // 2. 拿回合押注券（领先龟明确时）
            if (ranking.length > 0 && round.ticketsRemaining.length > 0 && rand < 0.5) {
                var leaderId = ranking[0].turtleId
                var available = round.ticketsRemaining.filter(function(t) { return t.turtleId === leaderId })
                if (available.length > 0) {
                    var ticket = available[0]
                    store.dispatch('TAKE_ROUND_BET', {
                        playerId: player.id,
                        turtleId: ticket.turtleId,
                        ticketIndex: ticket.ticketIndex,
                        removeFromRound: true
                    })
                    return
                }
            }

            // 3. 全程竞猜（从第2巡开始，越后越频繁）
            var leaderCell = 0
            for (var lc = state.race.cells.length - 1; lc >= 0; lc--) {
                if (state.race.cells[lc].length > 0) { leaderCell = lc; break }
            }
            var raceProgress = leaderCell / state.race.trackLength  // 0~1
            var finalBetChance = aggressiveChance + raceProgress * 0.3  // 基础+赛道进度加成
            if (round.number >= 2 && rand < finalBetChance) {
                var betType = store.prng.next(0, 1) === 0 ? 'first' : 'last'
                var candidateTurtles = ranking.map(function(r) { return r.turtleId })
                if (betType === 'first') {
                    // 猜冠军：选前2名之一
                    var pick = candidateTurtles[store.prng.next(0, Math.min(1, candidateTurtles.length - 1))]
                    store.dispatch('PLACE_FINAL_BET', { playerId: player.id, turtleId: pick, betType: 'first' })
                    return
                } else {
                    // 猜殿后：选后2名之一
                    var len = candidateTurtles.length
                    var pickLast = candidateTurtles[store.prng.next(Math.max(0, len - 2), len - 1)]
                    store.dispatch('PLACE_FINAL_BET', { playerId: player.id, turtleId: pickLast, betType: 'last' })
                    return
                }
            }

            // 4. 兜底：抽签（稳定收入）
            if (round.signsRemaining.length > 0) {
                var signIdx = store.prng.next(0, round.signsRemaining.length - 1)
                var sign = round.signsRemaining[signIdx]
                var turtleId = sign.turtleId
                var steps = sign.value

                // 从签筒移除
                var isSpecial = sign.isSpecial || false
                round.signsRemaining.splice(signIdx, 1)
                round.signsDrawn.push({ turtleId: turtleId, value: steps, isSpecial: isSpecial })

                // 签筹+1
                var held = round.signTicketsHeld[playerIdx]
                round.signTicketsHeld[playerIdx] = (held || 0) + 1

                if (isSpecial) {
                    store.dispatch('DRAW_SPECIAL', { steps: steps })
                } else {
                    store.dispatch('DRAW_SIGN', { turtleId: turtleId, steps: steps })
                    logSystem.logDrawSign(state, playerIdx, turtleId, steps)
                }

                // 检查锦囊触发
                var pendingPouch = raceSystem.getPendingPouch(state)
                if (pendingPouch) {
                    raceSystem.clearPendingPouch(state)
                    // 给锦囊主人1铜钱
                    var players = state.players
                    for (var p = 0; p < players.length; p++) {
                        if (players[p].id === pendingPouch.playerId) {
                            players[p].coins += config.balance.pouchTriggerReward
                            break
                        }
                    }
                    // 触发移动
                    var direction = pendingPouch.type === 'lotus' ? 1 : -1
                    var triggerTurtle = pendingPouch.movingTurtles[0]
                    store.dispatch('TRIGGER_POUCH', { turtleId: triggerTurtle, direction: direction })
                    store.dispatch('CLEAR_POUCH', { cell: pendingPouch.cell })
                }

                store.dispatch('NEXT_PLAYER', {})

                // 检查终点（在NEXT_PLAYER之后，防止被覆盖为settle）
                if (raceSystem.hasFinished(state)) {
                    state.round.phase = 'game_over'
                }
                return
            }

            // 5. 实在没选择了
            store.dispatch('NEXT_PLAYER', {})
        },

        // 找放置锦囊的好位置
        _findPouchCell: function(state) {
            var cells = state.race.cells
            var pouches = state.pouches
            var bestCell = -1
            var bestScore = -Infinity

            for (var c = 1; c < cells.length - 1; c++) {
                // 不能放在有龟的格
                if (cells[c].length > 0) continue

                // 不能与现有锦囊相邻
                var tooClose = false
                for (var p = 0; p < pouches.length; p++) {
                    if (Math.abs(pouches[p].cell - c) <= 1) { tooClose = true; break }
                }
                if (tooClose) continue

                // 评分：越靠近领先龟得分越高
                var score = 0
                for (var cc = 0; cc < cells.length; cc++) {
                    if (cells[cc].length > 0) {
                        score += cells[cc].length * (10 - Math.abs(c - cc))
                    }
                }
                if (score > bestScore) {
                    bestScore = score
                    bestCell = c
                }
            }
            return bestCell
        }
    }

    window.aiSystem = aiSystem
})()

// 下注系统 — 回合押注券、全程竞猜
;(function() {
    'use strict'

    var betSystem = {
        init: function(store) {
            var self = this
            self.store = store

            store.state.bets = {
                roundBets: [],       // [{ playerId, turtleId, ticketIndex }] 本回合下注记录
                finalFirst: [],      // [{ playerId, turtleId, order }] 鳌头竞猜
                finalLast: []        // [{ playerId, turtleId, order }] 殿后竞猜
            }

            store.register('TAKE_ROUND_BET', function(state, payload) {
                self._takeRoundBet(state, payload)
            }, 'bets')

            store.register('PLACE_FINAL_BET', function(state, payload) {
                self._placeFinalBet(state, payload)
            }, 'bets')

            store.register('SETTLE_ROUND', function(state, payload) {
                self._settleRound(state, payload)
            }, 'bets')

            store.register('SETTLE_FINALS', function(state, payload) {
                self._settleFinals(state, payload)
            }, 'bets')
        },

        // 领取回合押注券
        _takeRoundBet: function(state, payload) {
            state.bets.roundBets.push({
                playerId: payload.playerId,
                turtleId: payload.turtleId,
                ticketIndex: payload.ticketIndex
            })

            // 从回合可用券中移除
            if (payload.removeFromRound) {
                var remaining = state.round.ticketsRemaining
                for (var i = 0; i < remaining.length; i++) {
                    if (remaining[i].turtleId === payload.turtleId && remaining[i].ticketIndex === payload.ticketIndex) {
                        remaining.splice(i, 1)
                        break
                    }
                }
            }

            store.dispatch('NEXT_PLAYER', {})
        },

        // 下注全程竞猜
        _placeFinalBet: function(state, payload) {
            var bet = {
                playerId: payload.playerId,
                turtleId: payload.turtleId,
                order: 0
            }

            if (payload.betType === 'first') {
                bet.order = state.bets.finalFirst.length
                state.bets.finalFirst.push(bet)
            } else {
                bet.order = state.bets.finalLast.length
                state.bets.finalLast.push(bet)
            }

            store.dispatch('NEXT_PLAYER', {})
        },

        // 回合结算
        _settleRound: function(state, payload) {
            var ranking = raceSystem.getRanking(state)
            var balance = config.balance
            var self = this

            // 快照结算前的铜钱
            var coinsBefore = self._snapshotCoins(state)

            // 统计每色押对的券（按名次）
            var firstColor = ranking[0] ? ranking[0].turtleId : null
            var secondColor = ranking[1] ? ranking[1].turtleId : null

            // 处理每张下注券
            var roundBets = state.bets.roundBets
            var firstWinners = []   // 押对第1名的 { playerId, order }
            var secondWinners = []  // 押对第2名的

            for (var i = 0; i < roundBets.length; i++) {
                var bet = roundBets[i]
                if (bet.turtleId === firstColor) {
                    firstWinners.push({ playerId: bet.playerId, ticketIndex: bet.ticketIndex })
                } else if (bet.turtleId === secondColor) {
                    secondWinners.push({ playerId: bet.playerId })
                } else {
                    // 押错：赔1文
                    self._payCoins(state, bet.playerId, balance.roundBetRewards.other)
                }
            }

            // 第1名按ticketIndex排序（小index=先押=奖励高）
            firstWinners.sort(function(a, b) { return a.ticketIndex - b.ticketIndex })
            for (var f = 0; f < firstWinners.length; f++) {
                var reward = f < balance.roundBetRewards.first.length
                    ? balance.roundBetRewards.first[f]
                    : balance.roundBetRewards.first[balance.roundBetRewards.first.length - 1]
                self._payCoins(state, firstWinners[f].playerId, reward)
            }

            // 第2名各得1文
            for (var s = 0; s < secondWinners.length; s++) {
                self._payCoins(state, secondWinners[s].playerId, balance.roundBetRewards.second)
            }

            // 签筹兑钱
            var signTickets = state.round.signTicketsHeld
            var playerIds = Object.keys(signTickets)
            for (var p = 0; p < playerIds.length; p++) {
                var count = signTickets[playerIds[p]]
                self._payCoins(state, parseInt(playerIds[p]), count * balance.signTicketReward)
            }

            // 清空本回合下注
            state.bets.roundBets = []

            // 记录铜钱变化到日志
            self._logCoinChanges(state, coinsBefore, state.round.number)
        },

        // 终局结算
        _settleFinals: function(state, payload) {
            var ranking = raceSystem.getRanking(state)
            var firstColor = ranking[0] ? ranking[0].turtleId : null
            var lastColor = ranking[ranking.length - 1] ? ranking[ranking.length - 1].turtleId : null
            var balance = config.balance
            var self = this

            // 结算鳌头
            var firstBets = state.bets.finalFirst
            var firstCorrect = []
            for (var i = 0; i < firstBets.length; i++) {
                if (firstBets[i].turtleId === firstColor) {
                    firstCorrect.push(firstBets[i])
                } else {
                    self._payCoins(state, firstBets[i].playerId, balance.finalBetPenalty)
                }
            }
            for (var fc = 0; fc < firstCorrect.length; fc++) {
                var rewardIdx = Math.min(fc, balance.finalBetRewards.length - 1)
                self._payCoins(state, firstCorrect[fc].playerId, balance.finalBetRewards[rewardIdx])
            }

            // 结算殿后
            var lastBets = state.bets.finalLast
            var lastCorrect = []
            for (var j = 0; j < lastBets.length; j++) {
                if (lastBets[j].turtleId === lastColor) {
                    lastCorrect.push(lastBets[j])
                } else {
                    self._payCoins(state, lastBets[j].playerId, balance.finalBetPenalty)
                }
            }
            for (var lc = 0; lc < lastCorrect.length; lc++) {
                var rIdx = Math.min(lc, balance.finalBetRewards.length - 1)
                self._payCoins(state, lastCorrect[lc].playerId, balance.finalBetRewards[rIdx])
            }
        },

        _payCoins: function(state, playerId, amount) {
            var players = state.players
            for (var i = 0; i < players.length; i++) {
                if (players[i].id === playerId) {
                    players[i].coins += amount
                    if (players[i].coins < 0) players[i].coins = 0
                    return
                }
            }
        },

        _snapshotCoins: function(state) {
            var snap = []
            var players = state.players
            for (var i = 0; i < players.length; i++) {
                snap.push({ id: players[i].id, name: players[i].name, coins: players[i].coins })
            }
            return snap
        },

        _logCoinChanges: function(state, before, roundNum) {
            if (!state.log) return
            var players = state.players
            var st = state.round.signTicketsHeld

            // 分别收集令牌收益和下注收益
            var tokenEntries = []
            var betEntries = []
            for (var i = 0; i < players.length; i++) {
                var oldCoins = 0
                for (var b = 0; b < before.length; b++) {
                    if (before[b].id === players[i].id) { oldCoins = before[b].coins; break }
                }
                var tokenGain = (st[String(i)] || 0) * config.balance.signTicketReward
                var betDelta = (players[i].coins - oldCoins) - tokenGain

                if (tokenGain > 0) {
                    tokenEntries.push(players[i].name + ' +' + tokenGain + '文')
                }
                if (betDelta !== 0) {
                    var sign = betDelta > 0 ? '+' : ''
                    betEntries.push(players[i].name + ' ' + sign + betDelta + '文')
                }
            }

            if (betEntries.length > 0) {
                state.log.push({
                    round: roundNum, playerName: '结算',
                    action: '下注: ' + betEntries.join('，'),
                    detail: '', isDivider: false, isCoinLog: true
                })
            }
            if (tokenEntries.length > 0) {
                state.log.push({
                    round: roundNum, playerName: '结算',
                    action: '令牌: ' + tokenEntries.join('，'),
                    detail: '', isDivider: false, isCoinLog: true
                })
            }
            if (betEntries.length === 0 && tokenEntries.length === 0) {
                state.log.push({
                    round: roundNum, playerName: '结算',
                    action: '铜钱变化: 无人变动',
                    detail: '',
                    isDivider: false,
                    isCoinLog: true
                })
            }
        },

        // 获取某玩家的全程竞猜（用于热座隐藏）
        getPlayerFinalBets: function(state, playerId) {
            var first = []
            var last = []
            var fb = state.bets.finalFirst
            var fl = state.bets.finalLast
            for (var i = 0; i < fb.length; i++) {
                if (fb[i].playerId === playerId) first.push(fb[i])
            }
            for (var j = 0; j < fl.length; j++) {
                if (fl[j].playerId === playerId) last.push(fl[j])
            }
            return { first: first, last: last }
        }
    }

    window.betSystem = betSystem
})()

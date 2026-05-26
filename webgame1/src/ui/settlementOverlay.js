// 结算弹窗 - 回合结算(验莲榜)、终局揭榜
;(function() {
    'use strict'

    var dc = { qing: '#3a6b3a', chi: '#a03030', huang: '#a07820', bai: '#6b6040', hei: '#3a3a42' }

    var settlementOverlay = {
        container: null,

        mount: function(container) {
            this.container = container
        },

        // ==================== 回合结算 ====================

        showRoundSettle: function(state, onDone) {
            var self = this
            var ranking = raceSystem.getRanking(state)
            var players = state.players

            // 快照：结算前的铜钱和令牌
            var coinsBefore = []
            var tokensBefore = {}
            for (var p = 0; p < players.length; p++) {
                coinsBefore.push({ id: players[p].id, name: players[p].name, coins: players[p].coins })
            }
            var st = state.round.signTicketsHeld
            for (var key in st) {
                if (st.hasOwnProperty(key)) tokensBefore[key] = st[key]
            }

            store.dispatch('SETTLE_ROUND', {})

            // 计算每人令牌收益和下注收益
            var tokenEarnings = {}  // { playerId: coinAmount }
            var betEarnings = {}    // { playerId: coinAmount }
            for (var k = 0; k < players.length; k++) {
                var pid = players[k].id
                var oldC = 0
                for (var cb = 0; cb < coinsBefore.length; cb++) {
                    if (coinsBefore[cb].id === pid) { oldC = coinsBefore[cb].coins; break }
                }
                var totalDelta = players[k].coins - oldC
                var tokenGain = (tokensBefore[String(k)] || 0) * config.balance.signTicketReward
                tokenEarnings[pid] = tokenGain
                betEarnings[pid] = totalDelta - tokenGain
            }

            var c = self._makeOverlay(config.strings.settleRoundTitle)
            var box = c.box

            // 排名
            var rankDiv = el('div', [
                'font-size:22px;color:#1a1010;text-align:center;',
                'font-family:"GameKai",KaiTi,STKaiti,"Microsoft YaHei",sans-serif;',
                'letter-spacing:4px;margin-bottom:16px;line-height:2.2;'
            ])
            var rankNames = ['一甲', '二甲', '三甲', '四甲', '五甲']
            for (var r = 0; r < Math.min(ranking.length, 5); r++) {
                var tid = ranking[r].turtleId
                var tcfg = null
                for (var t = 0; t < config.turtles.length; t++) {
                    if (config.turtles[t].id === tid) { tcfg = config.turtles[t]; break }
                }
                var line = el('div')
                line.innerHTML = rankNames[r] + '：<span style="color:' + (dc[tcfg.id] || tcfg.color) +
                    ';font-weight:bold;font-size:24px;">' + tcfg.name + '</span>'
                rankDiv.appendChild(line)
            }
            box.appendChild(rankDiv)

            // 分隔线
            box.appendChild(el('div', 'width:60%;height:1px;background:#a09080;margin:0 auto 14px auto;'))

            // 下注收益
            var betTitle = el('div', 'font-size:14px;color:#8b7355;text-align:center;margin-bottom:6px;')
            betTitle.textContent = '—— 下注盈亏 ——'
            box.appendChild(betTitle)
            var betDiv = el('div', 'font-size:16px;color:#3d3228;text-align:center;line-height:2;')
            for (var bi = 0; bi < players.length; bi++) {
                var bp = players[bi]
                var be = betEarnings[bp.id] || 0
                if (be !== 0) {
                    var bl = el('div')
                    var sign = be > 0 ? '+' : ''
                    var bColor = be > 0 ? '#3a6b3a' : '#c04040'
                    bl.innerHTML = bp.name + ': <span style="color:' + bColor + ';font-weight:bold;">' + sign + be + '文</span>'
                    betDiv.appendChild(bl)
                }
            }
            if (betDiv.children.length === 0) {
                betDiv.appendChild(el('div', 'font-size:14px;color:#a09080;')).textContent = '无变动'
            }
            box.appendChild(betDiv)

            // 令牌收益
            var tokenTitle = el('div', 'font-size:14px;color:#8b7355;text-align:center;margin-top:10px;margin-bottom:6px;')
            tokenTitle.textContent = '—— 摇签收益（令牌兑钱） ——'
            box.appendChild(tokenTitle)
            var tokenDiv = el('div', 'font-size:16px;color:#3d3228;text-align:center;line-height:2;')
            var anyToken = false
            for (var ti = 0; ti < players.length; ti++) {
                var tp = players[ti]
                var te = tokenEarnings[tp.id] || 0
                var tc = tokensBefore[String(ti)] || 0
                if (tc > 0) {
                    anyToken = true
                    var tl = el('div')
                    tl.innerHTML = tp.name + ': <span style="color:#b48c32;font-weight:bold;">抽签' + tc + '次 +' + te + '文</span>'
                    tokenDiv.appendChild(tl)
                }
            }
            if (!anyToken) {
                var ne = el('div')
                ne.textContent = '本巡无人抽签'
                ne.style.cssText = 'font-size:14px;color:#a09080;'
                tokenDiv.appendChild(ne)
            }
            box.appendChild(tokenDiv)

            // 分隔线
            box.appendChild(el('div', 'width:60%;height:1px;background:#a09080;margin:10px auto 14px auto;'))

            // 玩家铜钱总结
            var coinDiv = el('div', 'font-size:18px;color:#1a1010;text-align:center;line-height:2.2;font-weight:bold;letter-spacing:2px;')
            for (var cp = 0; cp < players.length; cp++) {
                var cpl = players[cp]
                var csp = el('div')
                csp.textContent = cpl.name + ': ' + cpl.coins + ' 文'
                coinDiv.appendChild(csp)
            }
            box.appendChild(coinDiv)

            // 继续按钮
            var btn = el('button', [
                'margin-top:28px;padding:12px 48px;background:#c04040;color:#fff;',
                'border:2px solid #8b3030;border-radius:4px;font-size:20px;',
                'font-family:"GameKai",KaiTi,STKaiti,"Microsoft YaHei",sans-serif;',
                'cursor:pointer;letter-spacing:4px;font-weight:bold;'
            ])
            btn.textContent = '继续'
            btn.addEventListener('click', function() {
                c.outer.remove()
                onDone()
            })
            box.appendChild(btn)

            this.container.appendChild(c.outer)
        },

        // ==================== 终局揭榜 ====================

        showFinalReveal: function(state, onDone) {
            var self = this
            store.dispatch('SETTLE_FINALS', {})

            var players = state.players
            var ranking = raceSystem.getRanking(state)
            var firstId = ranking[0] ? ranking[0].turtleId : null
            var lastId = ranking[ranking.length - 1] ? ranking[ranking.length - 1].turtleId : null

            var firstCfg = null, lastCfg = null
            for (var t = 0; t < config.turtles.length; t++) {
                if (config.turtles[t].id === firstId) firstCfg = config.turtles[t]
                if (config.turtles[t].id === lastId) lastCfg = config.turtles[t]
            }

            var c = self._makeOverlay(config.strings.settleFinalTitle)
            var box = c.box

            // 鳌头
            var firstDiv = el('div', 'font-size:22px;color:#1a1010;text-align:center;margin-bottom:14px;font-weight:bold;letter-spacing:2px;')
            var fdc = firstCfg ? (dc[firstCfg.id] || firstCfg.color) : '#1a1010'
            firstDiv.innerHTML = config.strings.settleChampion + '（冠军）：<span style="color:' + fdc +
                ';font-weight:bold;font-size:26px;">' + (firstCfg ? firstCfg.name : '?') + '</span>'
            box.appendChild(firstDiv)

            // 殿后
            var lastDiv = el('div', 'font-size:22px;color:#1a1010;text-align:center;margin-bottom:24px;font-weight:bold;letter-spacing:2px;')
            var ldc = lastCfg ? (dc[lastCfg.id] || lastCfg.color) : '#1a1010'
            lastDiv.innerHTML = config.strings.settleLastPlace + '（末位）：<span style="color:' + ldc +
                ';font-weight:bold;font-size:26px;">' + (lastCfg ? lastCfg.name : '?') + '</span>'
            box.appendChild(lastDiv)

            // 竞猜揭示
            var revealDiv = el('div', 'font-size:16px;text-align:center;line-height:2.2;color:#2a2018;margin-bottom:18px;')

            var firstBets = state.bets.finalFirst
            for (var f = 0; f < firstBets.length; f++) {
                var bet = firstBets[f]
                var bettor = null
                for (var p = 0; p < players.length; p++) {
                    if (players[p].id === bet.playerId) { bettor = players[p]; break }
                }
                var betTcfg = null
                for (var tb = 0; tb < config.turtles.length; tb++) {
                    if (config.turtles[tb].id === bet.turtleId) { betTcfg = config.turtles[tb]; break }
                }
                var correct = bet.turtleId === firstId
                var l = el('div')
                l.innerHTML = bettor.name + ' 押鳌头「' + betTcfg.name + '」' +
                    (correct ? ' <span style="color:#3a6b3a;font-weight:bold;">&#10003; 中!</span>'
                             : ' <span style="color:#c04040;">&#10007; 错</span>')
                revealDiv.appendChild(l)
            }

            var lastBets = state.bets.finalLast
            for (var lb = 0; lb < lastBets.length; lb++) {
                var lbet = lastBets[lb]
                var lbettor = null
                for (var lp = 0; lp < players.length; lp++) {
                    if (players[lp].id === lbet.playerId) { lbettor = players[lp]; break }
                }
                var lTcfg = null
                for (var t2 = 0; t2 < config.turtles.length; t2++) {
                    if (config.turtles[t2].id === lbet.turtleId) { lTcfg = config.turtles[t2]; break }
                }
                var lcorrect = lbet.turtleId === lastId
                var ll = el('div')
                ll.innerHTML = lbettor.name + ' 押殿后「' + lTcfg.name + '」' +
                    (lcorrect ? ' <span style="color:#3a6b3a;font-weight:bold;">&#10003; 中!</span>'
                              : ' <span style="color:#c04040;">&#10007; 错</span>')
                revealDiv.appendChild(ll)
            }
            box.appendChild(revealDiv)

            // 最终排名
            var sorted = players.slice().sort(function(a, b) { return b.coins - a.coins })

            var winnerDiv = el('div', 'font-size:22px;color:#1a1010;text-align:center;margin:18px 0;font-weight:bold;letter-spacing:3px;')
            winnerDiv.innerHTML = '封号 <span style="color:#c04040;font-weight:bold;font-size:30px;">' +
                config.strings.winnerTitle + '</span>：<span style="color:' + sorted[0].color +
                ';font-weight:bold;font-size:26px;">' + sorted[0].name + '</span> (' + sorted[0].coins + ' 文)'
            box.appendChild(winnerDiv)

            var rankTable = el('div', 'font-size:16px;text-align:center;line-height:2.2;color:#2a2018;font-weight:bold;')
            for (var s = 0; s < sorted.length; s++) {
                var row = el('div')
                row.textContent = '第' + (s + 1) + '名: ' + sorted[s].name + ' - ' + sorted[s].coins + ' 文'
                rankTable.appendChild(row)
            }
            box.appendChild(rankTable)

            var restartBtn = el('button', [
                'margin-top:24px;padding:12px 44px;background:#c04040;color:#fff;',
                'border:2px solid #8b3030;border-radius:4px;font-size:20px;',
                'font-family:"GameKai",KaiTi,STKaiti,"Microsoft YaHei",sans-serif;',
                'cursor:pointer;letter-spacing:4px;font-weight:bold;'
            ])
            restartBtn.textContent = '再来一局'
            restartBtn.addEventListener('click', function() {
                c.outer.remove()
                onDone()
            })
            box.appendChild(restartBtn)

            this.container.appendChild(c.outer)
        },

        // ==================== 内部 ====================

        _makeOverlay: function(title) {
            var outer = el('div', [
                'position:absolute;top:0;left:0;width:1100px;height:700px;',
                'background:rgba(0,0,0,0.4);display:flex;flex-direction:column;',
                'align-items:center;justify-content:center;z-index:300;',
                'backdrop-filter:blur(3px);'
            ])

            var box = el('div', [
                'background:linear-gradient(180deg, #fefcf6 0%, #f7f2e8 100%);',
                'border:1px solid rgba(139,115,85,0.25);border-radius:6px;',
                'padding:32px 44px;min-width:440px;max-width:580px;',
                'box-shadow:0 2px 10px rgba(61,50,40,0.1), 0 0 0 5px rgba(139,115,85,0.03);',
                'max-height:560px;overflow-y:auto;'
            ])

            var titleEl = el('div', [
                'font-size:30px;color:#1a1010;text-align:center;',
                'font-family:"GameKai",KaiTi,STKaiti,"Microsoft YaHei",sans-serif;',
                'letter-spacing:8px;margin-bottom:22px;',
                'border-bottom:3px solid #c04040;padding-bottom:16px;font-weight:bold;'
            ])
            titleEl.textContent = title
            box.appendChild(titleEl)

            outer.appendChild(box)
            return { outer: outer, box: box }
        }
    }

    function el(tag, css) {
        var e = document.createElement(tag)
        if (css) {
            e.style.cssText = Array.isArray(css) ? css.join('') : css
        }
        return e
    }

    window.settlementOverlay = settlementOverlay
})()

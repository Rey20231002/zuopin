// 行动面板 — 4种行动的按钮与交互界面
;(function() {
    'use strict'

    var actionPanel = {
        panel: null,
        container: null,

        mount: function(container) {
            var self = this
            self.container = container

            var panel = document.createElement('div')
            panel.id = 'action-panel'
            panel.style.cssText = [
                'position: absolute; bottom: 0; left: 0;',
                'width: 1100px; height: 120px;',
                'background: linear-gradient(180deg, rgba(250,247,240,0.96) 0%, rgba(242,236,224,0.96) 100%);',
                'border-top: 1px solid rgba(139,115,85,0.25);',
                'display: flex; align-items: center; justify-content: center;',
                'gap: 16px; padding: 0 24px;',
                'z-index: 50;',
                'font-family: KaiTi, STKaiti, "Microsoft YaHei", sans-serif;',
                'backdrop-filter: blur(4px);'
            ].join('')

            // 4个行动按钮
            self.buttons = {}
            var actions = [
                { key: 'roundBet',  label: config.strings.actionTakeRoundBet,   cls: '' },
                { key: 'pouch',     label: config.strings.actionPlacePouch,     cls: 'secondary' },
                { key: 'drawSign',  label: config.strings.actionDrawSign,       cls: '' },
                { key: 'finalFirst',label: config.strings.actionFinalBetFirst,  cls: 'secondary' },
                { key: 'finalLast', label: config.strings.actionFinalBetLast,   cls: 'secondary' }
            ]

            for (var a = 0; a < actions.length; a++) {
                var act = actions[a]
                var btn = self._createBtn(act.label, act.cls)
                btn.addEventListener('click', (function(key) {
                    return function() { self._onAction(key) }
                })(act.key))
                panel.appendChild(btn)
                self.buttons[act.key] = btn
            }

            container.appendChild(panel)
            self.panel = panel
        },

        _createBtn: function(text, extraClass) {
            var btn = document.createElement('button')
            btn.textContent = text
            var bgMain = extraClass === 'secondary' ? '#638aa0' : '#c84848'
            var bgBot = extraClass === 'secondary' ? '#4d7085' : '#a83838'
            var bdCol = extraClass === 'secondary' ? 'rgba(61,93,112,0.45)' : 'rgba(139,48,48,0.45)'
            btn.style.cssText = [
                'padding: 10px 16px;',
                'background: linear-gradient(180deg, ' + bgMain + ' 0%, ' + bgBot + ' 100%);',
                'color: #fdf5f0;',
                'border: 1px solid ' + bdCol + ';',
                'border-radius: 3px;',
                'font-family: KaiTi, STKaiti, "Microsoft YaHei", sans-serif;',
                'font-size: 14px; font-weight: bold;',
                'letter-spacing: 2px; cursor: pointer;',
                'box-shadow: 0 1px 2px rgba(61,50,40,0.06), inset 0 1px 0 rgba(255,255,255,0.1);',
                'transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), filter 0.18s ease, box-shadow 0.18s ease;',
                'min-width: 80px;'
            ].join('')
            btn.addEventListener('mouseenter', function() {
                btn.style.transform = 'translateY(-1px) scale(1.04)'
                btn.style.filter = 'brightness(1.08)'
                btn.style.boxShadow = '0 3px 6px rgba(61,50,40,0.1), inset 0 1px 0 rgba(255,255,255,0.14)'
            })
            btn.addEventListener('mouseleave', function() {
                btn.style.transform = ''
                btn.style.filter = ''
                btn.style.boxShadow = '0 1px 2px rgba(61,50,40,0.06), inset 0 1px 0 rgba(255,255,255,0.1)'
            })
            btn.addEventListener('mousedown', function() {
                btn.style.transform = 'translateY(1px) scale(0.97)'
                btn.style.filter = 'brightness(0.94)'
            })
            return btn
        },

        _onAction: function(actionKey) {
            var state = store.state
            if (state.round.phase !== 'player_turn') return

            var playerIdx = state.round.currentPlayerIndex
            var player = state.players[playerIdx]
            if (!player || !player.isHuman) return

            var self = this

            switch (actionKey) {
                case 'roundBet':
                    self._showRoundBetPicker(player)
                    break
                case 'pouch':
                    self._showPouchPlacer(player)
                    break
                case 'drawSign':
                    self._doDrawSign(playerIdx)
                    break
                case 'finalFirst':
                    self._showFinalBetPicker(player, 'first')
                    break
                case 'finalLast':
                    self._showFinalBetPicker(player, 'last')
                    break
            }
        },

        _showRoundBetPicker: function(player) {
            var state = store.state
            var remaining = state.round.ticketsRemaining
            if (remaining.length === 0) return

            var self = this
            self._showOverlay('选择押注的灵龟', function(overlay) {
                // 按颜色分组显示可用的券
                var grouped = {}
                for (var i = 0; i < remaining.length; i++) {
                    var t = remaining[i]
                    if (!grouped[t.turtleId]) grouped[t.turtleId] = []
                    grouped[t.turtleId].push(t)
                }

                var turtleIds = Object.keys(grouped)
                for (var ti = 0; ti < turtleIds.length; ti++) {
                    ;(function(tid, tickets) {
                        var tcfg = null
                        for (var tc = 0; tc < config.turtles.length; tc++) {
                            if (config.turtles[tc].id === tid) { tcfg = config.turtles[tc]; break }
                        }
                        var btn = self._createPickerBtn(
                            tcfg.name + ' (' + tickets.length + '张)',
                            tcfg.color
                        )
                        btn.addEventListener('click', function() {
                            var ticket = tickets[0]
                            store.dispatch('TAKE_ROUND_BET', {
                                playerId: player.id,
                                turtleId: ticket.turtleId,
                                ticketIndex: ticket.ticketIndex,
                                removeFromRound: true
                            })
                            self._clearOverlay()
                        })
                        overlay.appendChild(btn)
                    })(turtleIds[ti], grouped[turtleIds[ti]])
                }
            })
        },

        _showPouchPlacer: function(player) {
            var state = store.state
            if (player.pouchPlaced) return

            // 先选类型
            var self = this
            self._showOverlay('选择锦囊: 浮萍(+1) 或 漩涡(-1)', function(overlay) {
                var lotusBtn = self._createPickerBtn(config.strings.pouchLotus, '#6bab6b')
                lotusBtn.addEventListener('click', function() {
                    self._clearOverlay()
                    self._showCellPicker(player, 'lotus')
                })
                overlay.appendChild(lotusBtn)

                var vortexBtn = self._createPickerBtn(config.strings.pouchVortex, '#6b8fbf')
                vortexBtn.addEventListener('click', function() {
                    self._clearOverlay()
                    self._showCellPicker(player, 'vortex')
                })
                overlay.appendChild(vortexBtn)
            })
        },

        _showCellPicker: function(player, type) {
            var state = store.state
            var self = this
            var cells = state.race.cells
            var pouches = state.pouches
            var trackLen = config.balance.trackLength

            self._showOverlay('选择赛道位置（第2-' + trackLen + '格）', function(overlay) {
                overlay.style.flexDirection = 'row'
                overlay.style.flexWrap = 'wrap'
                overlay.style.maxWidth = '600px'

                for (var c = 1; c < trackLen; c++) {
                    // 检查是否合法
                    var hasTurtle = cells[c].length > 0
                    var tooClose = false
                    for (var p = 0; p < pouches.length; p++) {
                        if (Math.abs(pouches[p].cell - c) <= 1) { tooClose = true; break }
                    }
                    var valid = !hasTurtle && !tooClose

                    ;(function(cellIdx, isValid) {
                        var btn = self._createPickerBtn('第' + (cellIdx + 1) + '格', isValid ? '#8b7355' : '#c0b0a0')
                        btn.style.minWidth = '60px'
                        btn.style.fontSize = '12px'
                        btn.style.opacity = isValid ? '1' : '0.4'
                        if (isValid) {
                            btn.addEventListener('click', function() {
                                store.dispatch('PLACE_POUCH', {
                                    playerId: player.id,
                                    cell: cellIdx,
                                    type: type
                                })
                                self._clearOverlay()
                            })
                        }
                        overlay.appendChild(btn)
                    })(c, valid)
                }
            })
        },

        _doDrawSign: function(playerIdx) {
            var state = store.state
            var signs = state.round.signsRemaining
            if (signs.length === 0) return

            // 随机选一支签（人类玩家点击抽签，随机抽取）
            var signIdx = store.prng.next(0, signs.length - 1)
            var sign = signs[signIdx]

            signs.splice(signIdx, 1)
            state.round.signsDrawn.push({ turtleId: sign.turtleId, value: sign.value, isSpecial: sign.isSpecial || false })

            // 签筹+1
            var held = state.round.signTicketsHeld[playerIdx]
            state.round.signTicketsHeld[playerIdx] = (held || 0) + 1

            if (sign.isSpecial) {
                store.dispatch('DRAW_SPECIAL', { steps: sign.value })
            } else {
                store.dispatch('DRAW_SIGN', { turtleId: sign.turtleId, steps: sign.value })
                logSystem.logDrawSign(store.state, playerIdx, sign.turtleId, sign.value)
            }

            // 处理锦囊触发
            var pendingPouch = raceSystem.getPendingPouch(state)
            if (pendingPouch) {
                raceSystem.clearPendingPouch(state)
                // 锦囊主人得铜钱
                var players = state.players
                for (var i = 0; i < players.length; i++) {
                    if (players[i].id === pendingPouch.playerId) {
                        players[i].coins += config.balance.pouchTriggerReward
                        break
                    }
                }
                var direction = pendingPouch.type === 'lotus' ? 1 : -1
                var triggerTurtle = pendingPouch.movingTurtles[0]
                store.dispatch('TRIGGER_POUCH', { turtleId: triggerTurtle, direction: direction })
                store.dispatch('CLEAR_POUCH', { cell: pendingPouch.cell })
            }

            // 检查终点
            if (raceSystem.hasFinished(state)) {
                state.round.phase = 'settle'
            }

            store.dispatch('NEXT_PLAYER', {})
        },

        _showFinalBetPicker: function(player, betType) {
            var state = store.state
            var self = this
            var label = betType === 'first' ? '押「鳌头」(总冠军)' : '押「殿后」(末位)'

            self._showOverlay(label, function(overlay) {
                var turtleConfigs = config.turtles
                for (var i = 0; i < turtleConfigs.length; i++) {
                    ;(function(tcfg) {
                        var btn = self._createPickerBtn(tcfg.name, tcfg.color)
                        btn.addEventListener('click', function() {
                            store.dispatch('PLACE_FINAL_BET', {
                                playerId: player.id,
                                turtleId: tcfg.id,
                                betType: betType
                            })
                            self._clearOverlay()
                        })
                        overlay.appendChild(btn)
                    })(turtleConfigs[i])
                }
            })
        },

        _showOverlay: function(title, buildFn) {
            var self = this

            // 先清除之前的弹窗
            self._clearOverlay()

            var overlay = document.createElement('div')
            overlay.className = 'picker-overlay'
            overlay.style.cssText = [
                'position: absolute; top: 0; left: 0;',
                'width: 1100px; height: 560px;',
                'background: rgba(0,0,0,0.35);',
                'display: flex; flex-direction: column;',
                'align-items: center; justify-content: center;',
                'z-index: 200; gap: 8px;',
                'backdrop-filter: blur(2px);'
            ].join('')

            self._activeOverlay = overlay

            var inner = document.createElement('div')
            inner.style.cssText = [
                'background: linear-gradient(180deg, #fefcf6 0%, #f7f2e8 100%);',
                'border: 1px solid rgba(139,115,85,0.3); border-radius: 6px;',
                'padding: 24px; max-width: 700px;',
                'display: flex; flex-direction: column;',
                'align-items: center; gap: 8px;',
                'box-shadow: 0 2px 6px rgba(61,50,40,0.08);'
            ].join('')

            var titleEl = document.createElement('div')
            titleEl.textContent = title
            titleEl.style.cssText = [
                'font-size: 18px; color: #3d3228;',
                'font-family: KaiTi, STKaiti, "Microsoft YaHei", sans-serif;',
                'letter-spacing: 2px; margin-bottom: 8px;'
            ].join('')
            inner.appendChild(titleEl)

            var btnContainer = document.createElement('div')
            btnContainer.style.cssText = [
                'display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;'
            ].join('')
            inner.appendChild(btnContainer)

            // 取消按钮
            var cancelBtn = document.createElement('button')
            cancelBtn.textContent = '取消'
            cancelBtn.style.cssText = [
                'margin-top: 8px; padding: 6px 20px;',
                'background: transparent; color: #8b7b6b;',
                'border: 1px solid rgba(139,115,85,0.2); border-radius: 3px;',
                'cursor: pointer; font-family: KaiTi, STKaiti, "Microsoft YaHei", sans-serif;',
                'font-size: 14px; letter-spacing: 2px;',
                'transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), color 0.18s ease, border-color 0.18s ease;'
            ].join('')
            cancelBtn.addEventListener('click', function() { self._clearOverlay() })
            inner.appendChild(cancelBtn)

            overlay.appendChild(inner)
            this.container.appendChild(overlay)

            buildFn(btnContainer)
        },

        _clearOverlay: function() {
            if (this._activeOverlay) {
                if (this._activeOverlay.parentNode) {
                    this._activeOverlay.parentNode.removeChild(this._activeOverlay)
                }
                this._activeOverlay = null
            }
        },

        _createPickerBtn: function(text, color) {
            var btn = document.createElement('button')
            btn.textContent = text
            btn.style.cssText = [
                'padding: 8px 16px;',
                'background: linear-gradient(180deg, ' + color + ' 0%, ' + darken(color, 0.12) + ' 100%);',
                'color: #fdf5f0;',
                'border: 1px solid rgba(0,0,0,0.15); border-radius: 3px;',
                'font-family: KaiTi, STKaiti, "Microsoft YaHei", sans-serif;',
                'font-size: 14px; cursor: pointer;',
                'letter-spacing: 2px;',
                'box-shadow: 0 1px 2px rgba(61,50,40,0.05), inset 0 1px 0 rgba(255,255,255,0.1);',
                'transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), filter 0.18s ease, box-shadow 0.18s ease;'
            ].join('')
            btn.addEventListener('mouseenter', function() {
                btn.style.transform = 'translateY(-1px) scale(1.04)'
                btn.style.filter = 'brightness(1.08)'
                btn.style.boxShadow = '0 3px 6px rgba(61,50,40,0.1), inset 0 1px 0 rgba(255,255,255,0.14)'
            })
            btn.addEventListener('mouseleave', function() {
                btn.style.transform = ''
                btn.style.filter = ''
                btn.style.boxShadow = '0 1px 2px rgba(61,50,40,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
            })
            btn.addEventListener('mousedown', function() {
                btn.style.transform = 'translateY(1px) scale(0.97)'
                btn.style.filter = 'brightness(0.94)'
            })
            return btn
        },

        // 根据游戏状态更新按钮启用/禁用
        updateState: function(state) {
            var playerIdx = state.round.currentPlayerIndex
            var player = state.players[playerIdx]
            if (!player) return

            var isHumanTurn = player.isHuman && state.round.phase === 'player_turn'
            var remaining = state.round.ticketsRemaining
            var signs = state.round.signsRemaining

            if (this.buttons.roundBet) {
                this.buttons.roundBet.disabled = !isHumanTurn || remaining.length === 0
            }
            if (this.buttons.pouch) {
                this.buttons.pouch.disabled = !isHumanTurn || player.pouchPlaced
            }
            if (this.buttons.drawSign) {
                this.buttons.drawSign.disabled = !isHumanTurn || signs.length === 0
                // 查找人类玩家，始终显示人类玩家的令牌持有量
                var humanIdx = playerIdx
                if (!player.isHuman) {
                    for (var hi = 0; hi < state.players.length; hi++) {
                        if (state.players[hi].isHuman) { humanIdx = hi; break }
                    }
                }
                var tokens = state.round.signTicketsHeld[humanIdx] || 0
                this.buttons.drawSign.textContent = tokens > 0
                    ? config.strings.actionDrawSign + ' (令牌×' + tokens + ')'
                    : config.strings.actionDrawSign
            }
            if (this.buttons.finalFirst) {
                this.buttons.finalFirst.disabled = !isHumanTurn
            }
            if (this.buttons.finalLast) {
                this.buttons.finalLast.disabled = !isHumanTurn
            }
        }
    }

    function darken(hex, amt) {
        var r = parseInt(hex.slice(1,3), 16)
        var g = parseInt(hex.slice(3,5), 16)
        var b = parseInt(hex.slice(5,7), 16)
        r = Math.floor(r * (1 - amt)); g = Math.floor(g * (1 - amt)); b = Math.floor(b * (1 - amt))
        return '#' + [r,g,b].map(function(v) { return ('0' + v.toString(16)).slice(-2) }).join('')
    }

    window.actionPanel = actionPanel
})()

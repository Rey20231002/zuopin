// 灵龟赛跑系统 — 8龟移动、叠罗汉、排名、黑白逆行龟
;(function() {
    'use strict'

    var raceSystem = {
        init: function(store) {
            var self = this
            self.store = store

            store.state.race = {
                cells: [],
                finishedOrder: [],
                trackLength: config.balance.trackLength,
                specialMovedThisRound: false  // 本轮黑白龟是否已移动
            }

            for (var i = 0; i < config.balance.trackLength; i++) {
                store.state.race.cells.push([])
            }

            store.register('INIT_RACE', function(state, payload) {
                self._initRace(state, payload)
            }, 'race')

            store.register('DRAW_SIGN', function(state, payload) {
                self._drawSign(state, payload)
            }, 'race')

            store.register('DRAW_SPECIAL', function(state, payload) {
                self._drawSpecial(state, payload)
            }, 'race')

            store.register('TRIGGER_POUCH', function(state, payload) {
                self._triggerPouch(state, payload)
            }, 'race')
        },

        // 初始化：6只普通龟随机0-2格，2只特殊龟在终点
        _initRace: function(state, payload) {
            var cells = state.race.cells = []
            for (var i = 0; i < state.race.trackLength; i++) {
                cells.push([])
            }
            state.race.finishedOrder = []
            state.race.specialMovedThisRound = false

            // 6只普通龟
            var betable = config.turtles
            for (var t = 0; t < betable.length; t++) {
                var sp = payload.startPositions && payload.startPositions[t] !== undefined
                    ? payload.startPositions[t]
                    : store.prng.next(0, 2)
                if (sp >= 0 && sp < cells.length) {
                    cells[sp].push(betable[t].id)
                } else {
                    cells[0].push(betable[t].id)
                }
            }

            // 2只特殊龟放在终点（最后一格）
            var specials = config.specialTurtles
            var lastCell = state.race.trackLength - 1
            for (var s = 0; s < specials.length; s++) {
                cells[lastCell].push(specials[s].id)
            }
        },

        // 普通龟移动
        _drawSign: function(state, payload) {
            var turtleId = payload.turtleId
            var steps = payload.steps
            var forward = payload.forward !== false

            this._moveTurtle(state, turtleId, steps, forward)
        },

        // 特殊龟移动（随机黑白）
        _drawSpecial: function(state, payload) {
            var self = this
            var specials = config.specialTurtles
            // 随机选黑白
            var idx = store.prng.next(0, 1)
            var turtle = specials[idx]
            var steps = payload.steps

            self._moveTurtle(state, turtle.id, steps, false)
            state.race.specialMovedThisRound = true

            // 存储移动信息供日志使用
            state.race._lastSpecialMove = { turtleId: turtle.id, steps: steps }
        },

        // 通用移动逻辑
        _moveTurtle: function(state, turtleId, steps, forward) {
            var cells = state.race.cells
            var currentCell = -1
            var stackIdx = -1

            for (var c = 0; c < cells.length; c++) {
                stackIdx = cells[c].indexOf(turtleId)
                if (stackIdx !== -1) { currentCell = c; break }
            }
            if (currentCell === -1) return

            // 取出该龟及以上所有龟
            var movingTurtles = cells[currentCell].splice(stackIdx)
            var targetCell, overFinish

            if (forward) {
                targetCell = currentCell + steps
                overFinish = targetCell >= state.race.trackLength
                if (overFinish) targetCell = state.race.trackLength - 1
            } else {
                targetCell = currentCell - steps
                if (targetCell < 0) targetCell = 0
                overFinish = false
            }

            // 放入目标格，叠在已有龟上面
            for (var m = 0; m < movingTurtles.length; m++) {
                cells[targetCell].push(movingTurtles[m])
            }

            // 记录过终点的龟
            if (overFinish) {
                for (var f = 0; f < movingTurtles.length; f++) {
                    if (state.race.finishedOrder.indexOf(movingTurtles[f]) === -1) {
                        state.race.finishedOrder.push(movingTurtles[f])
                    }
                }
            }

            // 逆行龟相遇：把目标格的普通龟推向前1步
            if (!forward) {
                this._pushForward(state, targetCell, movingTurtles)
            }

            // 锦囊检查
            if (state.pouches && state.pouches.length > 0) {
                for (var p = 0; p < state.pouches.length; p++) {
                    if (state.pouches[p].cell === targetCell) {
                        var pouch = state.pouches[p]
                        if (movingTurtles.length > 0 && movingTurtles[0] === turtleId) {
                            state.race._pendingPouch = {
                                cell: targetCell,
                                playerId: pouch.playerId,
                                type: pouch.type,
                                movingTurtles: movingTurtles.slice()
                            }
                        }
                        break
                    }
                }
            }

            state.race._pendingMove = {
                turtleId: turtleId,
                fromCell: currentCell,
                toCell: targetCell,
                steps: steps,
                movingTurtles: movingTurtles.slice(),
                forward: forward
            }
        },

        // 逆行龟推动前方普通龟
        _pushForward: function(state, cell, excludeIds) {
            var cells = state.race.cells
            var toPush = []
            var stack = cells[cell]

            // 找出该格中不是逆行龟的龟（普通龟）
            for (var i = 0; i < stack.length; i++) {
                var tid = stack[i]
                var isSpecial = false
                for (var s = 0; s < config.specialTurtles.length; s++) {
                    if (config.specialTurtles[s].id === tid) { isSpecial = true; break }
                }
                if (!isSpecial) {
                    toPush.push({ id: tid, idx: i })
                }
            }

            // 将普通龟推向前1格（从栈顶往下，逐个推进）
            for (var p = toPush.length - 1; p >= 0; p--) {
                var item = toPush[p]
                var idxInStack = cells[cell].indexOf(item.id)
                if (idxInStack === -1) continue
                var pushed = cells[cell].splice(idxInStack, 1)
                var nextCell = Math.min(cell + 1, state.race.trackLength - 1)
                for (var m = 0; m < pushed.length; m++) {
                    cells[nextCell].push(pushed[m])
                }
            }
        },

        // 锦囊触发
        _triggerPouch: function(state, payload) {
            var cells = state.race.cells
            var turtleId = payload.turtleId
            var direction = payload.direction
            var currentCell = -1, stackIdx = -1

            for (var c = 0; c < cells.length; c++) {
                stackIdx = cells[c].indexOf(turtleId)
                if (stackIdx !== -1) { currentCell = c; break }
            }
            if (currentCell === -1) return

            if (direction === 1) {
                var moving = cells[currentCell].splice(stackIdx)
                var target = Math.min(currentCell + 1, state.race.trackLength - 1)
                for (var m = 0; m < moving.length; m++) {
                    cells[target].push(moving[m])
                }
            } else {
                var moving = cells[currentCell].splice(stackIdx)
                var target = Math.max(currentCell - 1, 0)
                cells[target] = moving.concat(cells[target])
            }
        },

        // 获取排名（只计可下注的6只普通龟）
        getRanking: function(state) {
            var result = []
            var cells = state.race.cells
            var finished = state.race.finishedOrder
            var betableSet = {}
            var betableIds = config.betableTurtleIds
            for (var b = 0; b < betableIds.length; b++) {
                betableSet[betableIds[b]] = true
            }

            var finishedSet = {}
            for (var f = finished.length - 1; f >= 0; f--) {
                var tid = finished[f]
                if (betableSet[tid] && !finishedSet[tid]) {
                    result.push({ turtleId: tid, cell: state.race.trackLength, stackPosition: 0, finished: true })
                    finishedSet[tid] = true
                }
            }

            for (var c = cells.length - 1; c >= 0; c--) {
                var stack = cells[c]
                for (var s = stack.length - 1; s >= 0; s--) {
                    var tid = stack[s]
                    if (betableSet[tid] && !finishedSet[tid]) {
                        result.push({ turtleId: tid, cell: c, stackPosition: s, finished: false })
                        finishedSet[tid] = true
                    }
                }
            }

            return result
        },

        hasFinished: function(state) {
            return state.race.finishedOrder.length > 0
        },

        getPendingPouch: function(state) {
            return state.race._pendingPouch || null
        },

        clearPendingPouch: function(state) {
            state.race._pendingPouch = null
        },

        update: function(state, dt) {}
    }

    window.raceSystem = raceSystem
})()

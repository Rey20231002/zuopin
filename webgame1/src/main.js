// 莲池竞渡 — 主入口
// 游戏循环、系统初始化、状态机编排
;(function() {
    'use strict'

    var canvas, ctx, container
    var gameConfig = null      // { mode: 'solo'|'hotseat', difficulty, playerCount }
    var hotseatMask = null     // 热座过渡遮罩

    // ==================== 初始化 ====================

    function init() {
        container = document.getElementById('game-container')

        // 创建Canvas
        canvas = document.createElement('canvas')
        canvas.width = 1100
        canvas.height = 700
        canvas.style.display = 'none'
        container.appendChild(canvas)
        ctx = canvas.getContext('2d')

        // 初始化渲染器
        trackRenderer.init(canvas)
        turtleRenderer.init(canvas)

        // 显示开始页面
        startScreen.show(container, function(config) {
            gameConfig = config
            startGame()
        })
    }

    // ==================== 开始游戏 ====================

    function startGame() {
        // 隐藏开始页，显示canvas
        canvas.style.display = 'block'

        // 挂载UI组件
        playerBar.mount(container)
        actionPanel.mount(container)
        roundInfo.mount(container, canvas)
        settlementOverlay.mount(container)
        historyLog.mount(container)
        unactedPanel.mount(container)

        // 完全重置store（清除上一局的handlers和subscribers）
        store.clearAll()
        var seed = Date.now()
        store.resetState(seed)

        // 初始化各系统
        raceSystem.init(store)
        roundSystem.init(store)
        playerSystem.init(store)
        betSystem.init(store)
        pouchSystem.init(store)
        logSystem.init(store)
        aiSystem.init(store)

        // 初始化玩家
        var totalPlayers = gameConfig.mode === 'solo'
            ? config.balance.aiCount + 1
            : gameConfig.playerCount

        store.dispatch('INIT_PLAYERS', {
            totalPlayers: totalPlayers,
            isSolo: gameConfig.mode === 'solo',
            humanName: gameConfig.mode === 'solo' ? '你' : '玩家1'
        })

        // 随机初始位置
        var startPositions = []
        for (var i = 0; i < config.turtles.length; i++) {
            startPositions.push(store.prng.next(0, 2))
        }

        store.dispatch('INIT_RACE', { startPositions: startPositions })

        // 开始第一巡
        store.dispatch('START_ROUND', {})

        // 启动游戏循环
        lastTime = 0
        accumulator = 0
        requestAnimationFrame(gameLoop)
    }

    // ==================== 游戏循环 ====================

    var FIXED_DT = 1 / 60
    var accumulator = 0
    var lastTime = 0
    var settlePending = false
    var finalPending = false

    function gameLoop(timestamp) {
        var elapsed = Math.min((timestamp - lastTime) / 1000, 0.1)
        lastTime = timestamp
        accumulator += elapsed

        while (accumulator >= FIXED_DT) {
            store.tick()

            // 更新AI系统
            aiSystem.update(store.state, FIXED_DT)

            // 更新race系统（动画过渡等）
            raceSystem.update(store.state, FIXED_DT)

            accumulator -= FIXED_DT
        }

        var s = store.state

        // 游戏未激活时跳过状态机
        if (!gameConfig) { requestAnimationFrame(gameLoop); return }

        // 处理回合结算（在渲染前）
        if (s.round.phase === 'settle' && !settlePending) {
            // 强制清除AI思考状态，防止卡死
            store.state.ai._thinking = false
            actionPanel._clearOverlay()
            settlePending = true
            handleRoundSettle()
        }

        // 检查游戏结束
        if (s.round.phase === 'game_over' && !finalPending) {
            finalPending = true
            store.state.ai._thinking = false
            actionPanel._clearOverlay()
            setTimeout(function() {
                settlementOverlay.showFinalReveal(store.state, function() {
                    resetGame()
                })
            }, 300)
        }

        // 渲染
        render(s)
        requestAnimationFrame(gameLoop)
    }

    // ==================== 回合结算处理 ====================

    function handleRoundSettle() {
        var s = store.state

        settlementOverlay.showRoundSettle(s, function() {
            var cur = store.state
            if (raceSystem.hasFinished(cur)) {
                settlePending = false
                return
            }

            var players = cur.players
            for (var pi = 0; pi < players.length; pi++) {
                players[pi].pouchPlaced = false
                players[pi].pouchType = null
                players[pi].pouchCell = null
            }

            cur.pouches = []
            store.dispatch('START_ROUND', {})
            settlePending = false

            if (gameConfig.mode === 'hotseat') {
                showHotseatPass(cur)
            }
        })
    }

    // ==================== 热座过渡 ====================

    function showHotseatPass(state) {
        var currentPlayer = state.players[state.round.currentPlayerIndex]
        if (!currentPlayer || currentPlayer.id === 0) return  // 玩家1不需要遮罩

        var mask = document.createElement('div')
        mask.style.cssText = [
            'position: absolute; top: 0; left: 0;',
            'width: 960px; height: 640px;',
            'background: rgba(0,0,0,0.7);',
            'display: flex; flex-direction: column;',
            'align-items: center; justify-content: center;',
            'z-index: 400;',
            'font-family: "GameKai", KaiTi, STKaiti, serif;'
        ].join('')

        var passText = document.createElement('div')
        passText.textContent = config.strings.hotseatPass + currentPlayer.name
        passText.style.cssText = [
            'font-size: 32px; color: #f5f0e8;',
            'letter-spacing: 4px; margin-bottom: 24px;'
        ].join('')
        mask.appendChild(passText)

        var confirmBtn = document.createElement('button')
        confirmBtn.textContent = config.strings.hotseatConfirm
        confirmBtn.style.cssText = [
            'padding: 12px 36px;',
            'background: #c04040; color: #f5f0e8;',
            'border: 2px solid #8b3030; border-radius: 6px;',
            'font-size: 20px; font-family: "GameKai", KaiTi, serif;',
            'cursor: pointer; letter-spacing: 4px;'
        ].join('')
        confirmBtn.addEventListener('click', function() {
            mask.remove()
            hotseatMask = null
        })
        mask.appendChild(confirmBtn)

        container.appendChild(mask)
        hotseatMask = mask
    }

    // ==================== 渲染 ====================

    function render(state) {
        trackRenderer.render(state)
        turtleRenderer.render(state)
        roundInfo.render(state)

        // 更新DOM面板
        playerBar.render(state)
        actionPanel.updateState(state)
        historyLog.render(state)
        unactedPanel.render(state)
    }

    // ==================== 重置 ====================

    function resetGame() {
        settlePending = false
        finalPending = false
        gameConfig = null

        // 清理DOM面板
        var panels = container.querySelectorAll('#player-bar, #action-panel')
        for (var i = 0; i < panels.length; i++) {
            panels[i].remove()
        }

        canvas.style.display = 'none'

        // 重新显示开始页
        startScreen.show(container, function(config) {
            gameConfig = config
            startGame()
        })
    }

    // ==================== 启动 ====================

    init()

})()

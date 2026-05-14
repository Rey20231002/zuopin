// 回合信息显示 — 第几巡、签筒状态
;(function() {
    'use strict'

    var roundInfo = {
        panel: null,
        canvas: null,

        mount: function(container, gameCanvas) {
            this.canvas = gameCanvas
            // 回合信息绘制在canvas的底部，不在DOM中另建面板
        },

        render: function(state) {
            if (!this.canvas) return
            var ctx = this.canvas.getContext('2d')
            var w = this.canvas.width
            var h = this.canvas.height

            var round = state.round
            if (!round || round.number === 0) return

            // 背景条
            var infoY = h - 46
            ctx.fillStyle = 'rgba(245,240,232,0.92)'
            ctx.fillRect(0, infoY, w, 46)
            ctx.strokeStyle = '#8b7355'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(0, infoY)
            ctx.lineTo(w, infoY)
            ctx.stroke()

            // 第X巡
            ctx.fillStyle = '#3d3228'
            ctx.font = 'bold 15px "GameKai", KaiTi, STKaiti, serif'
            ctx.textAlign = 'left'
            var roundText = config.strings.roundLabel + ' ' + toChineseNum(round.number) + ' ' + config.strings.roundSuffix
            ctx.fillText(roundText, 24, infoY + 28)

            // 签筒状态
            var signsRemaining = round.signsRemaining
            var signsDrawn = round.signsDrawn
            var allTurtles = config.turtles

            // 已抽之签
            ctx.textAlign = 'center'
            ctx.font = '13px "GameSong", SimSun, serif'
            var startX = 220
            ctx.fillStyle = '#3d3228'
            ctx.fillText(config.strings.signsDrawn + ':', startX, infoY + 28)

            var dotX = startX + 80
            for (var d = 0; d < allTurtles.length; d++) {
                var tid = allTurtles[d].id
                var isDrawn = false
                var drawnValue = 0
                for (var dd = 0; dd < signsDrawn.length; dd++) {
                    if (signsDrawn[dd].turtleId === tid) {
                        isDrawn = true
                        drawnValue = signsDrawn[dd].value
                        break
                    }
                }
                ctx.fillStyle = isDrawn ? allTurtles[d].color : '#c8b898'
                ctx.beginPath()
                ctx.arc(dotX + d * 36, infoY + 18, 9, 0, Math.PI * 2)
                ctx.fill()
                ctx.strokeStyle = '#3d3228'
                ctx.lineWidth = 1
                ctx.stroke()

                if (isDrawn && drawnValue > 0) {
                    ctx.fillStyle = '#f5f0e8'
                    ctx.font = 'bold 10px "GameSong", SimSun, serif'
                    ctx.fillText(String(drawnValue), dotX + d * 36, infoY + 21)
                }
            }

            // 签筒余签
            var remainX = startX + 80 + allTurtles.length * 36 + 30
            ctx.fillStyle = '#3d3228'
            ctx.font = '13px "GameSong", SimSun, serif'
            ctx.textAlign = 'left'
            ctx.fillText(config.strings.signsRemain + ': ' + signsRemaining.length + ' 支', remainX, infoY + 28)

            // 回合阶段提示
            if (round.phase === 'settle') {
                ctx.fillStyle = '#c04040'
                ctx.font = 'bold 14px "GameKai", KaiTi, serif'
                ctx.textAlign = 'right'
                ctx.fillText('结算中...', w - 24, infoY + 28)
            }
        }
    }

    // 数字转中文
    function toChineseNum(n) {
        var chars = ['零','一','二','三','四','五','六','七','八','九','十']
        if (n <= 10) return chars[n]
        if (n < 20) return '十' + chars[n - 10]
        return String(n)
    }

    window.roundInfo = roundInfo
})()

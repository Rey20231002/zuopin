// 赛道渲染器 — Canvas绘制莲池赛道
;(function() {
    'use strict'

    var trackRenderer = {
        canvas: null,
        ctx: null,
        cellWidth: 0,
        trackY: 0,
        trackHeight: 0,
        paddingX: 50,
        paddingY: 0,

        init: function(canvas) {
            this.canvas = canvas
            this.ctx = canvas.getContext('2d')
        },

        render: function(state) {
            var ctx = this.ctx
            var w = this.canvas.width
            var h = this.canvas.height
            var trackLen = config.balance.trackLength

            this.cellWidth = (w - this.paddingX * 2) / trackLen
            this.trackY = h * 0.25
            this.trackHeight = 140

            ctx.clearRect(0, 0, w, h)

            // 背景 — 宣纸纹理渐变
            var bgGrad = ctx.createLinearGradient(0, 0, 0, h)
            bgGrad.addColorStop(0, '#f6f2ea')
            bgGrad.addColorStop(0.3, '#f2ece1')
            bgGrad.addColorStop(0.7, '#ebe3d4')
            bgGrad.addColorStop(1, '#e4dac8')
            ctx.fillStyle = bgGrad
            ctx.fillRect(0, 0, w, h)

            // 池塘底色
            var pondY = this.trackY - 20
            var pondH = this.trackHeight + 40
            var pondGrad = ctx.createLinearGradient(0, pondY, 0, pondY + pondH)
            pondGrad.addColorStop(0, '#d4e8d0')
            pondGrad.addColorStop(0.5, '#c8dcc0')
            pondGrad.addColorStop(1, '#b8cfa8')
            ctx.fillStyle = pondGrad
            this._roundRect(ctx, this.paddingX - 10, pondY, w - (this.paddingX - 10) * 2, pondH, 12)
            ctx.fill()

            // 池水波纹
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'
            ctx.lineWidth = 1
            for (var ry = pondY + 10; ry < pondY + pondH - 10; ry += 18) {
                ctx.beginPath()
                for (var rx = this.paddingX; rx < w - this.paddingX; rx += 4) {
                    var wy = ry + Math.sin(rx * 0.05 + state.round.number * 0.3) * 2
                    if (rx === this.paddingX) ctx.moveTo(rx, wy)
                    else ctx.lineTo(rx, wy)
                }
                ctx.stroke()
            }

            // 赛道石阶
            var cellW = this.cellWidth
            for (var i = 0; i < trackLen; i++) {
                var x = this.paddingX + i * cellW
                var y = this.trackY
                var isEnd = (i === trackLen - 1)
                var isStart = (i === 0)

                // 石阶
                ctx.fillStyle = isEnd ? '#e8d4a0' : (isStart ? '#e0d8c8' : '#dcd4c0')
                ctx.fillRect(x + 1, y + 8, cellW - 2, this.trackHeight - 16)

                // 石阶边框
                ctx.strokeStyle = '#b8a888'
                ctx.lineWidth = 1
                ctx.strokeRect(x + 1, y + 8, cellW - 2, this.trackHeight - 16)

                // 莲花分隔线
                if (i < trackLen - 1) {
                    ctx.fillStyle = '#9bbf8a'
                    ctx.fillRect(x + cellW - 3, y + 8, 3, this.trackHeight - 16)
                }

                // 起点标记
                if (isStart) {
                    ctx.fillStyle = '#5b4b3b'
                    ctx.font = 'bold 14px KaiTi, STKaiti, "Microsoft YaHei", sans-serif'
                    ctx.textAlign = 'center'
                    ctx.fillText('起莲台', x + cellW / 2, y - 8)
                }

                // 终点标记
                if (isEnd) {
                    // 金色莲蓬
                    ctx.fillStyle = '#d4a843'
                    ctx.beginPath()
                    ctx.arc(x + cellW / 2, y + this.trackHeight / 2, 16, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.fillStyle = '#8b6914'
                    for (var si = 0; si < 5; si++) {
                        var angle = (si / 5) * Math.PI * 2
                        var sx = x + cellW / 2 + Math.cos(angle) * 7
                        var sy = y + this.trackHeight / 2 + Math.sin(angle) * 7
                        ctx.beginPath()
                        ctx.arc(sx, sy, 2, 0, Math.PI * 2)
                        ctx.fill()
                    }
                    ctx.fillStyle = '#c04040'
                    ctx.font = 'bold 14px KaiTi, STKaiti, "Microsoft YaHei", sans-serif'
                    ctx.textAlign = 'center'
                    ctx.fillText('摘莲台', x + cellW / 2, y - 8)

                    // 金色光晕（距离终点近时）
                    var nearestCell = 0
                    var cells = state.race.cells
                    for (var nc = cells.length - 1; nc >= 0; nc--) {
                        if (cells[nc].length > 0) { nearestCell = nc; break }
                    }
                    if (nearestCell >= trackLen - 3) {
                        var glowAlpha = (nearestCell - (trackLen - 3)) / 3 * 0.3
                        ctx.fillStyle = 'rgba(255, 215, 80, ' + glowAlpha + ')'
                        ctx.beginPath()
                        ctx.arc(x + cellW / 2, y + this.trackHeight / 2, 24, 0, Math.PI * 2)
                        ctx.fill()
                    }
                }
            }

            // 格子数字
            ctx.fillStyle = '#a09080'
            ctx.font = '9px "GameSong", SimSun, serif'
            ctx.textAlign = 'center'
            for (var gi = 0; gi < trackLen; gi++) {
                var gx = this.paddingX + gi * cellW + cellW / 2
                ctx.fillText(String(gi + 1), gx, this.trackY + this.trackHeight + 14)
            }

            // 赛道两侧装饰 — 垂柳
            ctx.fillStyle = '#7ba878'
            for (var wi = 0; wi < 6; wi++) {
                var wx = this.paddingX + wi * (w - this.paddingX * 2) / 5
                ctx.beginPath()
                ctx.moveTo(wx, pondY)
                ctx.quadraticCurveTo(wx + 15, pondY - 25, wx + 5, pondY - 40)
                ctx.quadraticCurveTo(wx, pondY - 20, wx - 5, pondY)
                ctx.fill()
            }

            // 锦囊标记
            var pouches = state.pouches || []
            for (var pi = 0; pi < pouches.length; pi++) {
                var pouch = pouches[pi]
                var px = this.paddingX + pouch.cell * cellW + cellW / 2
                var py = this.trackY - 10
                ctx.fillStyle = pouch.type === 'lotus' ? '#7bc87b' : '#6b8fbf'
                ctx.beginPath()
                ctx.arc(px, py, 8, 0, Math.PI * 2)
                ctx.fill()
                ctx.strokeStyle = '#3d3228'
                ctx.lineWidth = 1.5
                ctx.stroke()
                ctx.fillStyle = '#3d3228'
                ctx.font = 'bold 10px "GameSong", SimSun, serif'
                ctx.textAlign = 'center'
                ctx.fillText(pouch.type === 'lotus' ? '浮' : '漩', px, py + 4)
            }

            // 储存布局参数供turtleRenderer使用
            this._cellW = cellW
            this._trackY = this.trackY
            this._trackH = this.trackHeight
        },

        getLayout: function() {
            return {
                cellWidth: this._cellW || (this.canvas.width - this.paddingX * 2) / config.balance.trackLength,
                trackY: this._trackY || this.canvas.height * 0.28,
                trackHeight: this._trackH || 120,
                paddingX: this.paddingX
            }
        },

        _roundRect: function(ctx, x, y, w, h, r) {
            ctx.beginPath()
            ctx.moveTo(x + r, y)
            ctx.lineTo(x + w - r, y)
            ctx.quadraticCurveTo(x + w, y, x + w, y + r)
            ctx.lineTo(x + w, y + h - r)
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
            ctx.lineTo(x + r, y + h)
            ctx.quadraticCurveTo(x, y + h, x, y + h - r)
            ctx.lineTo(x, y + r)
            ctx.quadraticCurveTo(x, y, x + r, y)
            ctx.closePath()
        }
    }

    window.trackRenderer = trackRenderer
})()

// 灵龟渲染器 — Canvas绘制5色灵龟与叠罗汉
;(function() {
    'use strict'

    var turtleRenderer = {
        init: function(canvas) {
            this.canvas = canvas
            this.ctx = canvas.getContext('2d')
        },

        render: function(state) {
            var ctx = this.ctx
            var layout = trackRenderer.getLayout()
            var cellW = layout.cellWidth
            var trackY = layout.trackY
            var trackH = layout.trackHeight
            var padX = layout.paddingX

            var cells = state.race.cells
            var allConfigs = config.allTurtles
            var turtleMap = {}
            for (var t = 0; t < allConfigs.length; t++) {
                turtleMap[allConfigs[t].id] = allConfigs[t]
            }

            var specialIds = {}
            for (var sp = 0; sp < config.specialTurtles.length; sp++) {
                specialIds[config.specialTurtles[sp].id] = true
            }

            for (var c = 0; c < cells.length; c++) {
                var stack = cells[c]
                if (stack.length === 0) continue

                var cx = padX + c * cellW + cellW / 2
                var baseY = trackY + trackH - 20

                for (var s = 0; s < stack.length; s++) {
                    var turtleId = stack[s]
                    var tcfg = turtleMap[turtleId]
                    if (!tcfg) continue

                    // 堆叠偏移：每层向上偏移
                    var offsetY = s * 22
                    var tx = cx
                    var ty = baseY - offsetY

                    // 阴影
                    ctx.fillStyle = 'rgba(0,0,0,0.15)'
                    ctx.beginPath()
                    ctx.ellipse(tx, ty + 16, 16, 6, 0, 0, Math.PI * 2)
                    ctx.fill()

                    // 龟身
                    var isSpecial = !!specialIds[turtleId]
                    var bodyColor = tcfg.color
                    var bodyGrad = ctx.createLinearGradient(tx - 14, ty, tx + 14, ty)
                    bodyGrad.addColorStop(0, bodyColor)
                    bodyGrad.addColorStop(0.5, this._lighten(bodyColor, 0.15))
                    bodyGrad.addColorStop(1, this._darken(bodyColor, 0.1))
                    ctx.fillStyle = bodyGrad
                    ctx.beginPath()
                    ctx.ellipse(tx, ty, 16, 10, 0, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.strokeStyle = this._darken(bodyColor, 0.3)
                    ctx.lineWidth = isSpecial ? 2.5 : 1.5
                    ctx.stroke()

                    // 龟壳花纹
                    if (!isSpecial) {
                        ctx.strokeStyle = this._darken(bodyColor, 0.2)
                        ctx.lineWidth = 1
                        this._drawPattern(ctx, tx, ty, tcfg.pattern, bodyColor)
                    } else {
                        // 逆行龟标记: ◀ 箭头
                        ctx.fillStyle = turtleId === 'black' ? '#e8e4dc' : '#222228'
                        ctx.font = 'bold 12px sans-serif'
                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'middle'
                        ctx.fillText('◀', tx, ty)
                    }

                    // 龟头
                    ctx.fillStyle = this._lighten(bodyColor, 0.1)
                    ctx.beginPath()
                    ctx.ellipse(tx + 14, ty - 2, 6, 5, 0.2, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.strokeStyle = this._darken(bodyColor, 0.3)
                    ctx.lineWidth = 1
                    ctx.stroke()

                    // 眼睛
                    ctx.fillStyle = isSpecial ? (turtleId === 'black' ? '#e8e4dc' : '#111') : '#111'
                    ctx.beginPath()
                    ctx.arc(tx + 16, ty - 3, 1.5, 0, Math.PI * 2)
                    ctx.fill()

                    // 最上层标识
                    if (s === stack.length - 1 && stack.length > 1) {
                        ctx.strokeStyle = 'rgba(255,215,80,0.6)'
                        ctx.lineWidth = 2
                        ctx.beginPath()
                        ctx.ellipse(tx, ty, 17, 11, 0, 0, Math.PI * 2)
                        ctx.stroke()
                    }
                }
            }
        },

        _drawPattern: function(ctx, cx, cy, pattern, color) {
            var dark = this._darken(color, 0.15)
            ctx.strokeStyle = dark
            ctx.lineWidth = 0.8

            switch (pattern) {
                case 'bamboo': // 竹叶纹
                    for (var i = 0; i < 3; i++) {
                        var bx = cx - 6 + i * 6
                        ctx.beginPath()
                        ctx.moveTo(bx, cy - 4)
                        ctx.lineTo(bx, cy + 4)
                        ctx.stroke()
                        ctx.beginPath()
                        ctx.moveTo(bx, cy)
                        ctx.lineTo(bx + 3, cy - 3)
                        ctx.lineTo(bx + 3, cy + 3)
                        ctx.stroke()
                    }
                    break
                case 'flame': // 火焰纹
                    for (var f = 0; f < 3; f++) {
                        var fx = cx - 8 + f * 8
                        ctx.beginPath()
                        ctx.moveTo(fx, cy + 4)
                        ctx.quadraticCurveTo(fx + 2, cy - 6, fx + 4, cy + 4)
                        ctx.stroke()
                    }
                    break
                case 'cloud': // 云雷纹
                    for (var cl = 0; cl < 3; cl++) {
                        var clx = cx - 8 + cl * 8
                        ctx.beginPath()
                        ctx.moveTo(clx, cy - 2)
                        ctx.lineTo(clx + 2, cy - 4)
                        ctx.lineTo(clx + 4, cy - 2)
                        ctx.lineTo(clx + 6, cy)
                        ctx.stroke()
                    }
                    break
                case 'water': // 水波纹
                    for (var w = 0; w < 3; w++) {
                        var wy = cy - 4 + w * 4
                        ctx.beginPath()
                        ctx.moveTo(cx - 8, wy)
                        ctx.quadraticCurveTo(cx, wy - 2, cx + 8, wy)
                        ctx.stroke()
                    }
                    break
                case 'star': // 星辰纹
                    for (var st = 0; st < 5; st++) {
                        var angle = (st / 5) * Math.PI * 2
                        var sx = cx - 2 + Math.cos(angle) * 7
                        var sy = cy + Math.sin(angle) * 4
                        ctx.fillStyle = dark
                        ctx.beginPath()
                        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2)
                        ctx.fill()
                    }
                    break
                case 'zigzag': // 闪电纹（紫电）
                    ctx.lineWidth = 1.2
                    for (var z = 0; z < 3; z++) {
                        var zx = cx - 8 + z * 8
                        ctx.beginPath()
                        ctx.moveTo(zx, cy + 4)
                        ctx.lineTo(zx + 3, cy - 4)
                        ctx.lineTo(zx + 6, cy)
                        ctx.stroke()
                    }
                    break
            }
        },

        _lighten: function(hex, amount) {
            var r = parseInt(hex.slice(1,3), 16)
            var g = parseInt(hex.slice(3,5), 16)
            var b = parseInt(hex.slice(5,7), 16)
            r = Math.min(255, Math.floor(r + (255 - r) * amount))
            g = Math.min(255, Math.floor(g + (255 - g) * amount))
            b = Math.min(255, Math.floor(b + (255 - b) * amount))
            return '#' + [r,g,b].map(function(v) {
                return ('0' + v.toString(16)).slice(-2)
            }).join('')
        },

        _darken: function(hex, amount) {
            var r = parseInt(hex.slice(1,3), 16)
            var g = parseInt(hex.slice(3,5), 16)
            var b = parseInt(hex.slice(5,7), 16)
            r = Math.floor(r * (1 - amount))
            g = Math.floor(g * (1 - amount))
            b = Math.floor(b * (1 - amount))
            return '#' + [r,g,b].map(function(v) {
                return ('0' + v.toString(16)).slice(-2)
            }).join('')
        }
    }

    window.turtleRenderer = turtleRenderer
})()

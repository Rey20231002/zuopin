// 未行动乌龟面板 — 右下角显示本轮还剩哪些龟未抽出
;(function() {
    'use strict'

    var unactedPanel = {
        panel: null,

        mount: function(container) {
            var panel = document.createElement('div')
            panel.id = 'unacted-panel'
            panel.style.cssText = [
                'position: absolute; right: 8px; bottom: 128px;',
                'width: 200px; max-height: 180px;',
                'background: linear-gradient(180deg, rgba(252,249,242,0.95) 0%, rgba(242,236,224,0.95) 100%);',
                'border: 1px solid rgba(139,115,85,0.2); border-radius: 4px;',
                'padding: 6px 10px;',
                'font-family: KaiTi, STKaiti, "Microsoft YaHei", sans-serif;',
                'font-size: 12px;',
                'z-index: 60;',
                'box-shadow: 0 1px 3px rgba(61,50,40,0.06);',
                'backdrop-filter: blur(4px);'
            ].join('')

            var title = document.createElement('div')
            title.textContent = '签筒余签'
            title.style.cssText = [
                'font-weight: bold; color: #3d3228;',
                'border-bottom: 1px solid rgba(139,115,85,0.1);',
                'padding-bottom: 4px; margin-bottom: 6px;',
                'text-align: center; letter-spacing: 2px;'
            ].join('')
            panel.appendChild(title)

            var list = document.createElement('div')
            list.id = 'unacted-list'
            list.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;'
            panel.appendChild(list)

            container.appendChild(panel)
            this.panel = panel
        },

        render: function(state) {
            if (!this.panel) return
            var list = document.getElementById('unacted-list')
            if (!list) return

            while (list.firstChild) list.removeChild(list.firstChild)

            var round = state.round
            if (!round || round.phase !== 'player_turn') return

            var remaining = round.signsRemaining
            if (!remaining || remaining.length === 0) return

            // 显示未抽出的签
            var turtleConfigs = config.turtles
            var specialConfigs = config.specialTurtles
            var hasDisplayed = {}

            for (var i = 0; i < remaining.length; i++) {
                var sign = remaining[i]

                if (sign.isSpecial) {
                    var badge = document.createElement('div')
                    badge.style.cssText = [
                        'display: flex; align-items: center; gap: 2px;',
                        'padding: 3px 8px;',
                        'background: linear-gradient(90deg, #222228 0%, #e8e4dc 100%);',
                        'border: 1px solid rgba(0,0,0,0.2); border-radius: 3px;',
                        'color: #999; font-weight: bold; font-size: 11px;'
                    ].join('')
                    badge.textContent = '逆行签 ' + sign.value
                    list.appendChild(badge)
                } else {
                    var tid = sign.turtleId
                    if (hasDisplayed[tid]) continue
                    hasDisplayed[tid] = true

                    var tcfg = null
                    for (var t = 0; t < turtleConfigs.length; t++) {
                        if (turtleConfigs[t].id === tid) { tcfg = turtleConfigs[t]; break }
                    }
                    if (!tcfg) continue

                    var dc = { qing: '#3a6b3a', chi: '#a03030', huang: '#a07820', bai: '#6b6040', hei: '#3a3a42', zi: '#6b4e8a' }

                    var chip = document.createElement('div')
                    chip.style.cssText = [
                        'display: inline-flex; align-items: center; gap: 3px;',
                        'padding: 3px 8px;',
                        'background: ' + (tcfg.color) + ';',
                        'border: 1px solid rgba(0,0,0,0.15); border-radius: 3px;',
                        'color: #fff; font-weight: bold; font-size: 11px;',
                        'text-shadow: 0 0 1px rgba(0,0,0,0.3);'
                    ].join('')
                    chip.textContent = tcfg.name + ' ' + sign.value
                    list.appendChild(chip)
                }
            }
        }
    }

    window.unactedPanel = unactedPanel
})()

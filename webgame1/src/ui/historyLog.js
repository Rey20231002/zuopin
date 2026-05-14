// 历史记录面板 — 左下角显示每轮行为
;(function() {
    'use strict'

    var historyLog = {
        panel: null,
        container: null,
        listEl: null,
        collapsed: false,

        mount: function(container) {
            var self = this
            self.container = container

            // 清除上一局的旧面板
            if (self.panel && self.panel.parentNode) {
                self.panel.parentNode.removeChild(self.panel)
            }
            self._lastRendered = 0
            self.collapsed = false

            var panel = document.createElement('div')
            panel.id = 'history-log'
            panel.style.cssText = [
                'position: absolute; left: 8px; bottom: 128px;',
                'width: 240px; max-height: 200px;',
                'background: linear-gradient(180deg, rgba(252,249,242,0.95) 0%, rgba(242,236,224,0.95) 100%);',
                'border: 1px solid rgba(139,115,85,0.2); border-radius: 4px;',
                'padding: 0;',
                'font-family: FangSong, STFangsong, SimSun, STSong, serif;',
                'font-size: 11px;',
                'z-index: 60;',
                'overflow: hidden;',
                'box-shadow: 0 1px 3px rgba(61,50,40,0.06);',
                'transition: max-height 0.3s;',
                'backdrop-filter: blur(4px);'
            ].join('')

            // 标题栏
            var header = document.createElement('div')
            header.style.cssText = [
                'padding: 4px 8px;',
                'background: linear-gradient(180deg, rgba(139,115,85,0.08) 0%, rgba(139,115,85,0.04) 100%);',
                'border-bottom: 1px solid rgba(139,115,85,0.1);',
                'font-family: KaiTi, STKaiti, "Microsoft YaHei", sans-serif;',
                'font-size: 12px; font-weight: bold;',
                'color: #3d3228;',
                'cursor: pointer;',
                'display: flex; justify-content: space-between; align-items: center;'
            ].join('')

            var titleSpan = document.createElement('span')
            titleSpan.textContent = '📜 赛况录'
            header.appendChild(titleSpan)

            var toggleSpan = document.createElement('span')
            toggleSpan.textContent = '−'
            toggleSpan.style.cssText = 'font-size: 14px; color: #8b7355;'
            header.appendChild(toggleSpan)

            header.addEventListener('click', function() {
                self.collapsed = !self.collapsed
                if (self.collapsed) {
                    panel.style.maxHeight = '24px'
                    toggleSpan.textContent = '+'
                } else {
                    panel.style.maxHeight = '200px'
                    toggleSpan.textContent = '−'
                }
            })
            panel.appendChild(header)

            // 列表区域
            var list = document.createElement('div')
            list.style.cssText = [
                'max-height: 170px; overflow-y: auto;',
                'padding: 4px 8px;',
                'line-height: 1.6;'
            ].join('')
            panel.appendChild(list)
            self.listEl = list

            container.appendChild(panel)
            self.panel = panel
        },

        render: function(state) {
            if (!this.listEl) return
            var log = state.log
            if (!log || log.length === 0) return

            // 只渲染最新的条目（增量更新）
            var lastRendered = this._lastRendered || 0
            if (log.length === lastRendered) return

            for (var i = lastRendered; i < log.length; i++) {
                var entry = log[i]
                var row = document.createElement('div')

                if (entry.isDivider) {
                    row.style.cssText = [
                        'color: #c04040; font-weight: bold;',
                        'text-align: center; font-size: 11px;',
                        'padding: 2px 0; border-top: 1px dotted #d4c8a8;',
                        'margin-top: 2px;'
                    ].join('')
                    row.textContent = entry.action
                } else if (entry.isCoinLog) {
                    row.style.cssText = [
                        'color: #8b6914; font-weight: bold;',
                        'font-size: 11px; padding: 1px 0;',
                        'background: rgba(212,168,67,0.12);',
                        'border-radius: 2px; padding-left: 4px;'
                    ].join('')
                    row.textContent = '💰 ' + entry.action
                } else {
                    var playerColor = '#3d3228'
                    if (entry.playerName === '你') playerColor = '#c04040'

                    var prefix = '[' + entry.playerName + '] '
                    var prefixSpan = document.createElement('span')
                    prefixSpan.textContent = prefix
                    prefixSpan.style.cssText = 'color: ' + playerColor + '; font-weight: bold;'

                    var actionSpan = document.createElement('span')
                    actionSpan.textContent = entry.action

                    row.appendChild(prefixSpan)
                    row.appendChild(actionSpan)
                }

                this.listEl.appendChild(row)
            }

            this._lastRendered = log.length

            // 自动滚动到底部
            this.listEl.scrollTop = this.listEl.scrollHeight
        }
    }

    window.historyLog = historyLog
})()

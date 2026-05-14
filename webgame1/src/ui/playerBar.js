// 铜钱栏 - 显示所有玩家的铜钱数和状态
;(function() {
    'use strict'

    var playerBar = {
        bar: null,

        mount: function(container) {
            var bar = document.createElement('div')
            bar.id = 'player-bar'
            bar.style.cssText = [
                'position: absolute; top: 0; left: 0;',
                'width: 1100px; height: 44px;',
                'background: linear-gradient(180deg, rgba(250,247,240,0.96) 0%, rgba(240,234,220,0.94) 100%);',
                'border-bottom: 1px solid rgba(139,115,85,0.18);',
                'display: flex; align-items: center; justify-content: center;',
                'gap: 14px; padding: 0 16px;',
                'z-index: 50;',
                'font-family: KaiTi, STKaiti, "Microsoft YaHei", sans-serif;',
                'font-size: 13px;',
                'backdrop-filter: blur(4px);'
            ].join('')

            container.appendChild(bar)
            this.bar = bar
        },

        render: function(state) {
            if (!this.bar) return
            var players = state.players
            if (!players) return

            while (this.bar.firstChild) this.bar.removeChild(this.bar.firstChild)

            var currentPlayerIdx = state.round ? state.round.currentPlayerIndex : -1

            for (var i = 0; i < players.length; i++) {
                var p = players[i]
                var isCurrent = (i === currentPlayerIdx && state.round.phase === 'player_turn')

                var card = document.createElement('div')
                card.style.cssText = [
                    'display: flex; align-items: center; gap: 6px;',
                    'padding: 4px 12px;',
                    'background: ' + (isCurrent
                        ? 'linear-gradient(180deg, rgba(212,168,67,0.2) 0%, rgba(180,140,50,0.12) 100%)'
                        : 'rgba(255,255,255,0.35)') + ';',
                    'border: 1px solid ' + (isCurrent ? 'rgba(180,140,50,0.4)' : 'rgba(139,115,85,0.15)') + ';',
                    'border-radius: 3px;',
                    'box-shadow: ' + (isCurrent ? '0 1px 3px rgba(180,140,50,0.08)' : '0 1px 1px rgba(61,50,40,0.03)') + ';',
                    'transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;',
                    'min-width: 80px; justify-content: center;'
                ].join('')

                var nameSpan = document.createElement('span')
                nameSpan.textContent = p.name
                nameSpan.style.cssText =
                    'color: ' + p.color + '; font-weight: bold; letter-spacing: 1px;'
                card.appendChild(nameSpan)

                if (isCurrent) {
                    var indicator = document.createElement('span')
                    indicator.textContent = '◀'
                    indicator.style.cssText = 'color: #b48c32; font-size: 10px;'
                    card.appendChild(indicator)
                }

                var coinSpan = document.createElement('span')
                coinSpan.style.cssText =
                    'display: flex; align-items: center; gap: 2px; color: #8b6914; font-weight: bold;'

                var coinIcon = document.createElement('span')
                coinIcon.textContent = '◎'
                coinIcon.style.cssText = 'color: #b48c32; font-size: 14px;'
                coinSpan.appendChild(coinIcon)

                var coinValue = document.createElement('span')
                coinValue.textContent = p.coins + config.strings.coins
                coinSpan.appendChild(coinValue)

                card.appendChild(coinSpan)
                this.bar.appendChild(card)
            }
        }
    }

    window.playerBar = playerBar
})()

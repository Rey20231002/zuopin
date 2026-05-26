// 开始页面 — 模式选择
;(function() {
    'use strict'

    var startScreen = {
        overlay: null,
        callback: null,

        show: function(container, onStart) {
            var self = this
            self.callback = onStart

            // 创建覆盖层
            var overlay = document.createElement('div')
            overlay.id = 'start-screen'
            overlay.style.cssText = [
                'position: absolute; top: 0; left: 0;',
                'width: 1100px; height: 700px;',
                'background: linear-gradient(175deg, #e8dfd2 0%, #f2ece3 20%, #f7f3eb 50%, #ede4d6 80%, #dfd4c0 100%);',
                'display: flex; flex-direction: column;',
                'align-items: center; justify-content: center;',
                'z-index: 100;',
                'font-family: KaiTi, STKaiti, "Microsoft YaHei", sans-serif;'
            ].join('')

            // 标题
            var title = document.createElement('div')
            title.textContent = config.strings.title
            title.style.cssText = [
                'font-size: 52px; color: #3d3228;',
                'letter-spacing: 14px; margin-bottom: 8px;',
                'font-family: KaiTi, STKaiti, serif;',
                'text-shadow: 1px 1px 0 rgba(139,115,85,0.12);'
            ].join('')
            overlay.appendChild(title)

            // 副标题
            var subtitle = document.createElement('div')
            subtitle.textContent = config.strings.subtitle
            subtitle.style.cssText = [
                'font-size: 18px; color: #8b7355;',
                'letter-spacing: 4px; margin-bottom: 40px;'
            ].join('')
            overlay.appendChild(subtitle)

            // 装饰线
            var divider = document.createElement('div')
            divider.style.cssText = [
                'width: 240px; height: 2px;',
                'background: linear-gradient(90deg, transparent, #c04040, transparent);',
                'margin-bottom: 32px;'
            ].join('')
            overlay.appendChild(divider)

            // 单人模式按钮
            var soloBtn = self._createSealBtn(config.strings.soloMode, config.strings.soloModeDesc)
            soloBtn.style.marginBottom = '16px'
            soloBtn.addEventListener('click', function() {
                self._showSoloOptions(overlay)
            })
            overlay.appendChild(soloBtn)

            // 热座模式按钮
            var hotseatBtn = self._createSealBtn(config.strings.hotseatMode, config.strings.hotseatModeDesc, true)
            hotseatBtn.addEventListener('click', function() {
                self._showHotseatOptions(overlay)
            })
            overlay.appendChild(hotseatBtn)

            // 规则解读按钮
            var rulesBtn = document.createElement('div')
            rulesBtn.textContent = '规则解读'
            rulesBtn.style.cssText = [
                'margin-top: 28px; cursor: pointer;',
                'color: #8b7355; font-size: 14px;',
                'letter-spacing: 4px;',
                'font-family: "GameKai", KaiTi, STKaiti, serif;',
                'border-bottom: 1px dashed #c8b898;',
                'padding-bottom: 2px;',
                'transition: color 0.2s;'
            ].join('')
            rulesBtn.addEventListener('mouseenter', function() { rulesBtn.style.color = '#c04040' })
            rulesBtn.addEventListener('mouseleave', function() { rulesBtn.style.color = '#8b7355' })
            rulesBtn.addEventListener('click', function() { self._showRules(overlay) })
            overlay.appendChild(rulesBtn)

            container.appendChild(overlay)
            self.overlay = overlay
        },

        _showRules: function(parent) {
            var self = this
            while (parent.firstChild) parent.removeChild(parent.firstChild)

            var rules = document.createElement('div')
            rules.style.cssText = [
                'width: 700px; max-height: 520px; overflow-y: auto;',
                'padding: 20px 28px;',
                'font-family: "GameSong", SimSun, serif;',
                'font-size: 13px; line-height: 1.9;',
                'color: #3d3228;'
            ].join('')

            rules.innerHTML = [
                '<div style="font-size:22px;color:#3d3228;text-align:center;letter-spacing:6px;margin-bottom:4px;">规则解读</div>',
                '<div style="text-align:center;color:#8b7355;font-size:12px;margin-bottom:16px;">—— 莲池竞渡 · 灵龟赛跑 ——</div>',

                '<div style="color:#c04040;font-size:15px;font-weight:bold;margin-top:12px;">壹 · 游戏简介</div>',
                '<p>时值盛唐，城中莲花池畔举办一年一度的"莲池竞渡"。六只灵龟（青玄、赤霄、黄枢、白泽、墨渊、紫电）与两只逆行龟（玄冥、素影）在25段莲池赛道上角逐。你与各方宾客通过<strong>下注</strong>和<strong>布囊设局</strong>赢得铜钱，铜钱最多者封号<strong>"莲池伯"</strong>。</p>',

                '<div style="color:#c04040;font-size:15px;font-weight:bold;margin-top:12px;">贰 · 核心规则</div>',
                '<p><strong>叠罗汉：</strong>灵龟落于同格时会叠在一起。背上有龟时，下方的龟移动会驮着背上所有龟一起走。最上层的龟视为最领先。</p>',
                '<p><strong>签筒：</strong>每巡（回合）签筒内有7支签（6支普龟签+1支逆行签），点数1~3。逐支抽出，对应灵龟移动相应步数。7支签抽完该巡结束。</p>',
                '<p><strong>逆行龟：</strong>玄冥（黑）与素影（白）从终点出发向起点反向移动，共用1颗骰子。当逆行龟与其他灵龟相遇时，会自动将前方灵龟<strong>向终点推动1步</strong>。逆行龟不可下注。</p>',

                '<div style="color:#c04040;font-size:15px;font-weight:bold;margin-top:12px;">叁 · 四种行动</div>',
                '<p>轮到玩家时，从以下行动中任选其一：</p>',
                '<ol>',
                '<li><strong>观莲下注</strong> — 拿取一张回合押注券（每色3张共18张），巡结束时按当前名次结算：第一名得5/3/2文，第二名得1文，其余赔1文。</li>',
                '<li><strong>布囊设局</strong> — 将自己的锦囊放于赛道空格（选浮萍+1或漩涡-1）。不能放在第1格、有龟的格、已有锦囊的相邻格。有龟踩中时，锦囊主人立即得1文。</li>',
                '<li><strong>摇签问路</strong> — 从签筒抽一支签，对应灵龟移动。<strong>每抽一支签立即获得1枚令牌</strong>（显示在按钮上）。巡结算时每枚令牌兑换1文铜钱，与下注收益分别结算。是游戏中最稳定的收入来源。</li>',
                '<li><strong>一卦定局</strong> — 下注全程"鳌头"（总冠军）或"殿后"（末位）。猜错赔1文，猜对按预测先后获得8/5/3/2/1文。</li>',
                '</ol>',

                '<div style="color:#c04040;font-size:15px;font-weight:bold;margin-top:12px;">肆 · 锦囊妙用</div>',
                '<p><strong>浮萍(+1)：</strong>龟踩中后再前进1步。"顺水推舟"。</p>',
                '<p><strong>漩涡(-1)：</strong>龟踩中后退1步，退到目标格最下方（"背起"后面的龟）。<strong>这是逆转局势的关键</strong>——领先者一旦踩中漩涡，瞬间变成垫底。</p>',

                '<div style="color:#c04040;font-size:15px;font-weight:bold;margin-top:12px;">伍 · 结算说明</div>',
                '<p><strong>验莲榜（巡结算）：</strong>7支签全抽完后，验莲榜会分三块展示：（1）灵龟当前排名，（2）下注盈亏（押对奖励/押错扣钱），（3）摇签收益（每枚令牌换1文）。</p>',
                '<p><strong>揭榜（终局）：</strong>任意灵龟抵达第25格"摘莲台"时比赛结束。先进行最后一次验莲榜，再翻开所有全程竞猜签结算奖惩。<strong>铜钱最多者</strong>封号莲池伯。</p>',

                '<div style="color:#c04040;font-size:15px;font-weight:bold;margin-top:12px;">陆 · 策略要诀</div>',
                '<ul>',
                '<li><strong>摇签是稳定收入来源</strong>——每次抽签得1令牌，巡结束换1文。一巡可多次抽签，积少成多</li>',
                '<li>漩涡放在领先龟前方可逆转格局，但也可能坑到后面跟上的龟</li>',
                '<li>叠在别人上面的龟"搭顺风车"——不需要自己的签被抽出就能前进</li>',
                '<li>先下注全程竞猜奖励高（8文），但信息少风险大；后下注信息多但奖励低</li>',
                '<li>逆行龟从终点反向移动，可能推动前方灵龟——<strong>既可能帮也可能坑</strong></li>',
                '<li>布囊（锦囊）只能用一次，选准时机再出手</li>',
                '</ul>'
            ].join('')

            parent.appendChild(rules)

            // 返回按钮
            var backBtn = document.createElement('div')
            backBtn.textContent = '← 返回'
            backBtn.style.cssText = [
                'margin-top: 16px; cursor: pointer; color: #8b7355;',
                'font-size: 14px; letter-spacing: 2px;',
                'font-family: "GameKai", KaiTi, STKaiti, serif;'
            ].join('')
            backBtn.addEventListener('mouseenter', function() { backBtn.style.color = '#c04040' })
            backBtn.addEventListener('mouseleave', function() { backBtn.style.color = '#8b7355' })
            backBtn.addEventListener('click', function() {
                parent.remove()
                self.show(document.getElementById('game-container'), self.callback)
            })
            parent.appendChild(backBtn)
        },

        _createSealBtn: function(text, desc, secondary) {
            var btn = document.createElement('div')
            var bgMain = secondary ? '#638aa0' : '#c84848'
            var bgBot = secondary ? '#4d7085' : '#a83838'
            var bdCol = secondary ? 'rgba(61,93,112,0.45)' : 'rgba(139,48,48,0.45)'
            btn.style.cssText = [
                'width: 220px; padding: 14px 0;',
                'text-align: center; cursor: pointer;',
                'background: linear-gradient(180deg, ' + bgMain + ' 0%, ' + bgBot + ' 100%);',
                'color: #fdf5f0;',
                'border: 1px solid ' + bdCol + ';',
                'border-radius: 4px;',
                'font-size: 22px; font-weight: bold;',
                'font-family: KaiTi, STKaiti, "Microsoft YaHei", sans-serif;',
                'letter-spacing: 6px;',
                'box-shadow: 0 1px 3px rgba(61,50,40,0.1), inset 0 1px 0 rgba(255,255,255,0.1);',
                'transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease, filter 0.2s ease;'
            ].join('')

            var titleSpan = document.createElement('div')
            titleSpan.textContent = text
            btn.appendChild(titleSpan)

            var descSpan = document.createElement('div')
            descSpan.textContent = desc
            descSpan.style.cssText = 'font-size: 12px; opacity: 0.75; letter-spacing: 2px; margin-top: 4px;'
            btn.appendChild(descSpan)

            btn.addEventListener('mouseenter', function() {
                btn.style.transform = 'translateY(-2px) scale(1.05)'
                btn.style.boxShadow = '0 4px 8px rgba(61,50,40,0.14), inset 0 1px 0 rgba(255,255,255,0.14)'
                btn.style.filter = 'brightness(1.08)'
            })
            btn.addEventListener('mouseleave', function() {
                btn.style.transform = ''
                btn.style.boxShadow = '0 1px 3px rgba(61,50,40,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                btn.style.filter = ''
            })
            btn.addEventListener('mousedown', function() {
                btn.style.transform = 'translateY(1px) scale(0.97)'
                btn.style.filter = 'brightness(0.94)'
            })

            return btn
        },

        _showSoloOptions: function(parent) {
            var self = this
            // 清空覆盖层
            while (parent.firstChild) parent.removeChild(parent.firstChild)

            var title = document.createElement('div')
            title.textContent = '选择难度'
            title.style.cssText = 'font-size: 28px; color: #3d3228; letter-spacing: 4px; margin-bottom: 24px;'
            parent.appendChild(title)

            var diffs = config.strings.difficulty
            for (var i = 0; i < diffs.length; i++) {
                ;(function(idx) {
                    var btn = self._createSealBtn(diffs[idx], '', idx === 1)
                    btn.style.marginBottom = '12px'
                    btn.addEventListener('click', function() {
                        parent.remove()
                        if (self.callback) self.callback({ mode: 'solo', difficulty: idx })
                    })
                    parent.appendChild(btn)
                })(i)
            }

            var backBtn = document.createElement('div')
            backBtn.textContent = '← 返回'
            backBtn.style.cssText = [
                'margin-top: 16px; cursor: pointer; color: #8b7355;',
                'font-size: 14px; letter-spacing: 2px;'
            ].join('')
            backBtn.addEventListener('click', function() {
                parent.remove()
                self.show(document.getElementById('game-container'), self.callback)
            })
            parent.appendChild(backBtn)
        },

        _showHotseatOptions: function(parent) {
            var self = this
            while (parent.firstChild) parent.removeChild(parent.firstChild)

            var title = document.createElement('div')
            title.textContent = '选择玩家人数'
            title.style.cssText = 'font-size: 28px; color: #3d3228; letter-spacing: 4px; margin-bottom: 24px;'
            parent.appendChild(title)

            for (var i = 2; i <= config.balance.maxPlayers; i++) {
                ;(function(count) {
                    var btn = self._createSealBtn(count + ' 人', '', count % 2 === 0)
                    btn.style.marginBottom = '12px'
                    btn.addEventListener('click', function() {
                        parent.remove()
                        if (self.callback) self.callback({ mode: 'hotseat', playerCount: count })
                    })
                    parent.appendChild(btn)
                })(i)
            }

            var backBtn = document.createElement('div')
            backBtn.textContent = '← 返回'
            backBtn.style.cssText = [
                'margin-top: 16px; cursor: pointer; color: #8b7355;',
                'font-size: 14px; letter-spacing: 2px;'
            ].join('')
            backBtn.addEventListener('click', function() {
                parent.remove()
                self.show(document.getElementById('game-container'), self.callback)
            })
            parent.appendChild(backBtn)
        }
    }

    window.startScreen = startScreen
})()

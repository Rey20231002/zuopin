# 莲池竞渡 — 实现任务列表

## 阶段 1: 项目骨架搭建
- [ ] **T1** 创建 `src/config/units.js` — 灵龟基础数据（5色、名称、龟壳花纹类型）[DESIGN §1]
- [ ] **T2** 创建 `src/config/balance.js` — 游戏平衡参数（铜钱奖励表、赛道格数、签筒点数范围）[DESIGN §2.4, §2.5]
- [ ] **T3** 创建 `src/config/strings.js` — 所有UI文案（按钮文字、提示语、AI名称、回合术语）[DESIGN §5, §6]
- [ ] **T4** 更新 `src/index.html` — 添加所有 `<script>` 标签（按依赖顺序：config → systems → ui → main）。添加古风基础CSS样式（宣纸底色、回纹边框、楷体字体）[DESIGN §3]

## 阶段 2: 核心游戏逻辑
- [ ] **T5** 创建 `src/systems/raceSystem.js` — 灵龟状态初始化、移动、叠罗汉逻辑。切片: `state.race`。注册 `DRAW_SIGN` handler（签筒抽签→对应龟移动→检测叠罗汉→检测锦囊触发）。连续模拟部分: `update()` 处理移动动画中间状态 [DESIGN §2.1]
- [ ] **T6** 创建 `src/systems/roundSystem.js` — 回合管理。切片: `state.round`。注册 `START_ROUND`、`NEXT_PLAYER`。管理签筒状态（5支签的抽取情况）、回合阶段切换 [DESIGN §2.2]
- [ ] **T7** 创建 `src/systems/playerSystem.js` — 玩家管理。切片: `state.players`。注册 `ADD_PLAYER`、`GAIN_COINS`、`LOSE_COINS`。管理铜钱收支、玩家顺序 [DESIGN §2.2]
- [ ] **T8** 创建 `src/systems/betSystem.js` — 下注系统。切片: `state.bets`。注册 `TAKE_ROUND_BET`（拿回合押注券）、`PLACE_FINAL_BET`（押全程竞猜）。回合结算函数 `settleRoundBets`、终局结算函数 `settleFinalBets` [DESIGN §2.4, §2.5]
- [ ] **T9** 创建 `src/systems/pouchSystem.js` — 锦囊系统。切片: `state.pouch`。注册 `PLACE_POUCH`（投放浮萍/漩涡）。处理锦囊触发: 龟踩中时移动+1或-1，主人得1铜钱 [DESIGN §2.3]

## 阶段 3: AI系统
- [ ] **T10** 创建 `src/systems/aiSystem.js` — AI决策。切片: `state.ai`。`update()` 中检测当前是否为AI玩家回合，按优先级评估行动: (1)有锦囊→找关键格投放 (2)领先龟明确→拿该色回合押注券 (3)签筒剩余>1→抽签 (4)赛程过半→全程竞猜 (5)兜底抽签。3种性格参数化（激进/保守/搅局）[DESIGN §5]

## 阶段 4: UI界面
- [ ] **T11** 创建 `src/ui/startScreen.js` — 开始页面。"独坐观莲"/"群贤共弈"两个按钮，单人模式AI难度选择，多人模式人数选择。古风印章按钮样式 [DESIGN §6.1]
- [ ] **T12** 创建 `src/ui/trackRenderer.js` — Canvas赛道渲染。绘制16格莲池赛道（池水波纹、莲花分隔、终点摘莲台）、赛道两侧柳枝/竹影装饰。`subscribeTo('race.positions', render)` [DESIGN §3.2]
- [ ] **T13** 创建 `src/ui/turtleRenderer.js` — Canvas灵龟渲染。5色灵龟绘制（龟壳花纹+颜色）、叠罗汉时的高度偏移。`subscribeTo('race.positions', render)` [DESIGN §3.3]
- [ ] **T14** 创建 `src/ui/actionPanel.js` — 行动面板。4个行动按钮 + 锦囊放置界面（选择+1/-1面 + 选择赛道位置）+ 回合押注券选择 + 全程竞猜颜色选择。每项dispatch对应action [DESIGN §2.2, §7]
- [ ] **T15** 创建 `src/ui/playerBar.js` — 铜钱栏。显示所有玩家名称与当前铜钱数。`subscribeTo('players', render)` [DESIGN §7]
- [ ] **T16** 创建 `src/ui/roundInfo.js` — 回合信息显示。当前第几巡、已抽之签/未抽之签。`subscribeTo('round', render)` [DESIGN §7]
- [ ] **T17** 创建 `src/ui/settlementOverlay.js` — 结算弹窗。回合结算卷轴动画（验莲榜）、终局揭榜动画（翻鳌头/殿后签）、宣布胜者封号"莲池伯" [DESIGN §4.2]

## 阶段 5: 游戏流程整合
- [ ] **T18** 更新 `src/main.js` — 将所有system和UI串联。`init()` 中调用各system的`init(store)`和UI的`mount()`。`gameLoop` 中调用各system的`update()`。游戏状态机：START_SCREEN → INIT → ROUND_START → PLAYER_TURN → ROUND_SETTLE → CHECK_END → FINAL_REVEAL → GAME_OVER [DESIGN §8]
- [ ] **T19** 实现热座多人模式。每位玩家操作前显示过渡遮罩（"请将席位交予 玩家X"）。竞猜签对他人隐藏（封印标记）。揭示时逐个展示 [DESIGN §6.2]

## 阶段 6: 测试
- [ ] **T20** 更新 `tests/index.html` — 添加所有新脚本的 `<script>` 标签
- [ ] **T21** 创建 `tests/test-race.js` — 测试灵龟移动、叠罗汉逻辑、锦囊触发
- [ ] **T22** 创建 `tests/test-bet.js` — 测试回合押注结算、全程竞猜结算
- [ ] **T23** 创建 `tests/test-round.js` — 测试完整回合流程、状态机转换
- [ ] **T24** 创建 `tests/test-determinism.js` — 测试确定性回放（相同seed→相同结果）

## 依赖关系

```
T1 T2 T3 ──→ T4 ──→ T5 T6 T7 T8 T9 ──→ T10 ──→ T18
                      │                      │
                      └──→ T11 T12 T13 T14 T15 T16 T17
                                                 │
                                                 └──→ T19
T18 T19 ──→ T20 ──→ T21 T22 T23 T24
```

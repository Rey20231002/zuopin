# 作品集

> 网页游戏 & 交互式项目集合

---

## webgame1 · 莲池竞渡

古风灵龟赛跑网页游戏，改编自桌游《骆驼大赛》(Camel Up)。

### 快速启动

#### 方式一：直接双击（推荐）

进入 `webgame1/src/` 文件夹，用浏览器打开 `index.html` 即可。

```
作品集/
└── webgame1/
    └── src/
        └── index.html    ← 双击这个文件
```

#### 方式二：本地服务器

```bash
cd webgame1/src
npx serve .
# 打开 http://localhost:3000
```

### 系统要求

- 任意现代浏览器（Chrome / Edge / Firefox）
- 无需安装任何软件
- 无需 Node.js
- 无需网络连接

### 项目结构

```
webgame1/
├── README.md                    # 本文件
├── AGENTS.md                    # AI Agent 规则
├── ARCHITECTURE.md              # 技术架构
├── DESIGN_RULES.md              # 设计原则
├── DESIGN.md                    # 游戏设计文档
├── TODO.md                      # 实现任务列表
├── FIRST_PROMPT.md              # 首次开发提示
├── src/                         # 游戏源码
│   ├── index.html               # 入口
│   ├── main.js                  # 游戏循环
│   ├── store/store.js           # 状态引擎
│   ├── config/                  # 游戏配置
│   ├── systems/                 # 游戏逻辑（7个系统）
│   └── ui/                      # 界面组件（9个组件）
├── tests/                       # 测试套件（42项）
├── docs/                        # 文档
│   ├── 游戏拆解文档.md           # 完整游戏拆解
│   ├── 游戏拆解文档.html         # 可打印版本
│   ├── 设计难点与解决方案.md      # 9个难点分析
│   └── 设计难点与解决方案.html    # 可打印版本
└── LICENSE                      # MIT
```

### 文档说明

| 文档 | 内容 |
|------|------|
| `docs/游戏拆解文档` | 玩法机制、技术架构、AI系统、视觉设计全面拆解 |
| `docs/设计难点与解决方案` | 9个开发难点的问题描述、排查过程、解决方案 |

> 💡 打开 HTML 版本文档，使用浏览器的「打印 → 另存为 PDF」即可生成 PDF 版本。

### 游戏特色

- 6只灵龟 + 2只逆行龟的叠罗汉竞速
- 4种策略行动（下注、锦囊、抽签、全程竞猜）
- 4名不同性格的AI对手
- 单人模式和热座多人模式
- 古风视觉（宣纸渐变、楷体排版、印章按钮）

---

## 许可

MIT License

// UI文案
;(function() {
    'use strict'
    window.config = window.config || {}
    window.config.strings = {
        title: '莲池竞渡',
        subtitle: '灵龟赛跑 · 一卦定局',

        // 开始页面
        soloMode: '独坐观莲',
        soloModeDesc: '单人 vs AI',
        hotseatMode: '群贤共弈',
        hotseatModeDesc: '2-6人轮流对战',

        // AI 名称
        aiNames: ['张员外', '李书生', '赵镖头', '钱掌柜'],
        aiPersonalities: ['conservative', 'aggressive', 'disruptor', 'conservative'],

        // 难度
        difficulty: ['路过看客', '常客熟手', '莲池老手'],

        // 行动按钮
        actionTakeRoundBet: '观莲下注',
        actionPlacePouch: '布囊设局',
        actionDrawSign: '摇签问路',
        actionFinalBetFirst: '一卦定局·鳌头',
        actionFinalBetLast: '一卦定局·殿后',

        // 锦囊
        pouchLotus: '浮萍 (+1)',
        pouchVortex: '漩涡 (-1)',
        pouchPlaceTitle: '选择锦囊投放位置',
        pouchPickType: '选择锦囊类型',

        // 回合信息
        roundLabel: '第',
        roundSuffix: '巡',
        signsDrawn: '已抽之签',
        signsRemain: '签筒余签',

        // 结算
        settleRoundTitle: '验莲榜',
        settleFinalTitle: '揭榜',
        settleChampion: '鳌头',
        settleLastPlace: '殿后',
        winnerTitle: '莲池伯',

        // 热座
        hotseatPass: '请将席位交予 ',
        hotseatConfirm: '已就座，开始',

        // 通用
        ok: '确定',
        cancel: '取消',
        endTurn: '结束回合',
        coins: '文',
        trackStart: '起莲台',
        trackEnd: '摘莲台'
    }
})()

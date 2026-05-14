// 灵龟基础数据 — 6只普通龟 + 2只黑白逆行龟
;(function() {
    'use strict'
    window.config = window.config || {}
    window.config.turtles = [
        { id: 'qing',   name: '青玄', color: '#5b8c5a', element: '木', pattern: 'bamboo',  desc: '竹叶青龟' },
        { id: 'chi',    name: '赤霄', color: '#c44545', element: '火', pattern: 'flame',   desc: '烈焰赤龟' },
        { id: 'huang',  name: '黄枢', color: '#d4a843', element: '土', pattern: 'cloud',   desc: '云雷黄龟' },
        { id: 'bai',    name: '白泽', color: '#c8c0b8', element: '金', pattern: 'water',   desc: '水波白龟' },
        { id: 'hei',    name: '墨渊', color: '#4a4a52', element: '水', pattern: 'star',    desc: '星辰墨龟' },
        { id: 'zi',     name: '紫电', color: '#7b5ea0', element: '雷', pattern: 'zigzag',  desc: '紫电灵龟' }
    ]

    // 黑白逆行龟 - 不可下注
    window.config.specialTurtles = [
        { id: 'black',  name: '玄冥', color: '#222228', pattern: 'reverse', dir: -1, desc: '逆行玄龟' },
        { id: 'white',  name: '素影', color: '#e8e4dc', pattern: 'reverse', dir: -1, desc: '逆行素龟' }
    ]

    // 所有龟（用于渲染）
    window.config.allTurtles = window.config.turtles.concat(window.config.specialTurtles)

    // 可下注的龟ID列表
    window.config.betableTurtleIds = window.config.turtles.map(function(t) { return t.id })
})()

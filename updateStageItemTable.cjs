const fs = require("fs")

fs.readFile("./ArknightsGamedataPure/excel/stage_table.json", "utf8", (err, dataStr) => {
    const data = JSON.parse(dataStr)
    const stageTable = {}
    for (let k in data['stages']) {
        if (!k.includes('camp') && !k.includes('#f#') && !k.includes('bossrush') && !k.includes('act1lock_a') && !k.includes('act17d7_01') && !k.includes('lt_') && !k.includes('tr_')) {
            if (data['stages'][k]['apCost'] > 0) {
                let items = []
                for (let item of data['stages'][k]['stageDropInfo']['displayRewards']) {
                    if (item['dropType'] === 2 || item['dropType'] === 3) {
                        items.push(item['id'])
                    }
                }
                if (items.length > 0 || k.includes('act24side')) {
                    const stageName = data['stages'][k]['stageId'].includes('#s') ? '[险地]' + data['stages'][k]['name'] : data['stages'][k]['name']
                    stageTable[k] = {
                        name: stageName,
                        code: data['stages'][k]['code'],
                        ap: data['stages'][k]['apCost'],
                        items: items
                    }
                }
            }
        }
    }
    console.log('analysis done')
    fs.writeFile("./public/data/stages.json", JSON.stringify(stageTable), (err) => {
        if (err) {
            console.log(err)
        }
    })
})

fs.readFile("./ArknightsGamedataPure/excel/item_table.json", "utf8", (err, dataStr) => {
    const data = JSON.parse(dataStr)
    const items = {}
    for (let k in data['items']) {
        items[k] = {
            name: data['items'][k]['name'],
            icon: data['items'][k]['iconId']
        }
    }
    console.log('analysis done')
    fs.writeFile("./public/data/items.json", JSON.stringify(items), (err) => {
        if (err) {
            console.log(err)
        }
    })
})
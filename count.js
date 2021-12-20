const data = require('./saves/ZIBA Havok MapEd Save.json')

const items = {}
for (let item of data.data) {
  if (!items.hasOwnProperty(item.name)) {
    items[item.name] = 1;
  }
}

console.log(Object.keys(items).length)
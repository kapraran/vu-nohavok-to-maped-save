/**
 * script to extract stuff for guidDictionary
 */
const { existsSync } = require('fs');
const { readFile, writeFile, access } = require('fs').promises;
const { resolve } = require('path');
const { EBX_PATH } = require('../../config/config');
const guidDict = require('../guidDictionary.json');
const guidDictValuesIndex = Object.values(guidDict).reduce((acc, item) => {
  acc[item] = 1;
  return acc;
}, {});

const checkGuidDict = (guid, name) => {
  if (guidDictValuesIndex.hasOwnProperty(name)) console.log('found name');
};

const relPathToFile = 'Levels\\MP_Subway\\MP_Subway.txt';

const main = async () => {
  const contents = await readFile(resolve(EBX_PATH, relPathToFile), 'utf8');
  const lines = contents.split('\n').map((line) => line.trim());

  await Promise.all(
    lines.map(async (line) => {
      if (!line.startsWith('MemberType')) return;
      const [, assetData] = line.split(' ');

      const parts = assetData.split('/');
      const guid = parts.pop();
      const name = parts.join('/');

      const possiblePaths = [resolve(EBX_PATH, `${name}.txt`), resolve(EBX_PATH, `${name}_D.txt`)];

      for (const p of possiblePaths) {
        if (!existsSync(p)) continue;

        const partitionContents = await readFile(p, 'utf8');
        const partitionGuid = partitionContents.split('\n')[0].trim().split(' ')[1].toLowerCase();

        if (guidDict.hasOwnProperty(partitionGuid)) return;

        console.log(`"${partitionGuid.toLowerCase()}" : "${name}"`);
        guidDict[partitionGuid.toLowerCase()] = name;
        break;
      }
    })
  );

  console.log('updating guidDict file');
  await writeFile(
    resolve(__dirname, '../guidDictionary.json'),
    JSON.stringify(guidDict, null, 2),
    'utf8'
  );
};

main();

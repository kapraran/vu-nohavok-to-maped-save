/**
 * script to extract stuff for guidDictionary
 */
const { existsSync } = require('fs');
const { readFile, writeFile } = require('fs').promises;
const { resolve } = require('path');
const { EBX_PATH } = require('../../config/config');
const guidDictionary = require('../../assets/guidDictionary.json');

const extractNameFromsEbx = async (relPathToFile) => {
  const filePath = resolve(EBX_PATH, `${relPathToFile}.txt`);
  const contents = await readFile(filePath, 'utf8');
  const lines = contents.split('\n').map((line) => line.trim());

  const startingKeysLen = Object.keys(guidDictionary).length;

  await Promise.all(
    lines.map(async (line) => {
      if (!line.startsWith('MemberType')) return;
      const [, assetData] = line.split(' ');

      const parts = assetData.split('/');
      const name = parts.slice(0, parts.length - 1).join('/');

      const possiblePaths = [resolve(EBX_PATH, `${name}.txt`), resolve(EBX_PATH, `${name}_D.txt`)];

      for (const p of possiblePaths) {
        if (!existsSync(p)) continue;

        const partitionContents = await readFile(p, 'utf8');
        const partitionGuid = partitionContents.split('\n')[0].trim().split(' ')[1].toLowerCase();

        if (guidDictionary.hasOwnProperty(partitionGuid)) return;

        console.log(
          `Adding missing asset information for "${partitionGuid.toLowerCase()}" ("${name}")`
        );
        guidDictionary[partitionGuid.toLowerCase()] = name;
        break;
      }
    })
  );

  const keysDiff = Object.keys(guidDictionary).length - startingKeysLen;
  if (keysDiff === 0) {
    console.log('No new assets found to add');
    return;
  }

  console.log(`Updating 'guidDictionary.json' file with ${keysDiff} new assets`);
  await writeFile(
    resolve(__dirname, '../../assets/guidDictionary.json'),
    JSON.stringify(guidDictionary, null, 2),
    'utf8'
  );
};

module.exports = {
  extractNameFromsEbx,
};

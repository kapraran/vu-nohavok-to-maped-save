const { resolve } = require('path');
const { readHavokLuaFile } = require('./scripts/read-havok-lua');
const { readMapEbx } = require('./scripts/read-map-ebx');
const { createSave } = require('./scripts/create-save');
const saveFilesData = require('../config/saveFiles');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { extractNameFromsEbx } = require('./scripts/extract-names');
const argv = yargs(hideBin(process.argv)).argv;

async function main() {
  // const havokTransforms = await readHavokLuaFile(
  //   resolve(__dirname, "assets/havok.lua")
  // );

  const havokTransforms = require(resolve(__dirname, '../assets/data.json'));

  let saveFilesDataToUse = saveFilesData;

  if (argv.map && argv.mode) {
    saveFilesDataToUse = [
      {
        projectName: `${argv.map} Havok MapEd Save`,
        mapName: argv.map,
        gameModeName: argv.mode,
        ebxFiles: [`Levels/${argv.map}/${argv.map}`],
      },
    ];
  } else if (argv.project) {
    const saveFileConfigData = saveFilesData.find((d) => d.projectName === argv.project);
    if (saveFileConfigData !== undefined) saveFilesDataToUse = [saveFileConfigData];
  }

  for (const saveFileConfigData of saveFilesDataToUse) {
    console.log(saveFileConfigData.projectName);

    if (argv.fixMissingAssets) {
      await extractNameFromsEbx(saveFileConfigData.ebxFiles[0]);
    }

    const items = await readMapEbx(havokTransforms, saveFileConfigData);
    const saveFilePath = resolve(__dirname, `../saves/${saveFileConfigData.projectName}.json`);

    await createSave(saveFileConfigData, items, saveFilePath, argv.minify);
  }
}

main();

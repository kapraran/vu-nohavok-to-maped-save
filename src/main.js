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

  // if you want to create a save for a single project
  // uncomment the next line an put the correct project name
  if (argv.project) {
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

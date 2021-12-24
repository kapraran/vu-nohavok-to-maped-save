const { resolve } = require("path");
const { readHavokLuaFile } = require("./scripts/read-havok-lua");
const { readMapEbx } = require("./scripts/read-map-ebx");
const { createSave } = require("./scripts/create-save");
const saveFilesData = require("./config/saveFiles");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

async function main() {
  // const havokTransforms = await readHavokLuaFile(
  //   resolve(__dirname, "assets/havok.lua")
  // );

  havokTransforms = require(resolve(__dirname, "./assets/data.json"));

  let saveFilesDataToUse = saveFilesData;

  if (argv.tryFixMissingAssets) console.log('yes i will')

  // if you want to create a save for a single project
  // uncomment the next line an put the correct project name
  // saveFilesDataToUse = [saveFilesData.find(d => d.projectName === 'XP5_003 Havok MapEd Save')]

  for (const saveFileConfigData of saveFilesDataToUse) {
    console.log(saveFileConfigData.projectName);

    const items = await readMapEbx(havokTransforms, saveFileConfigData);
    const saveFilePath = resolve(
      __dirname,
      `saves/${saveFileConfigData.projectName}.json`
    );

    await createSave(saveFileConfigData, items, saveFilePath, argv.minifySave);
  }
}

main();

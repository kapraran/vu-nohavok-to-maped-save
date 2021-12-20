const { resolve } = require("path");
const { readHavokLuaFile } = require("./scripts/read-havok-lua");
const { readMapEbx } = require("./scripts/read-map-ebx");
const { createSave } = require("./scripts/create-save");
const saveFilesData = require("./config/saveFiles");

async function main() {
  // const havokTransforms = await readHavokLuaFile(
  //   resolve(__dirname, "havok.lua")
  // );

  havokTransforms = require(resolve(__dirname, "./data.json"))

  let saveFilesDataToUse = saveFilesData

  // if you want to create a save for a single project
  // uncomment the next line an put the correct project name
  // saveFilesDataToUse = [saveFilesData.find(d => d.projectName === 'XP5_003 Havok MapEd Save')]

  for (const saveFileConfigData of saveFilesDataToUse) {
    console.log(saveFileConfigData.projectName)

    const items = await readMapEbx(havokTransforms, saveFileConfigData);
    const saveFilePath = resolve(
      __dirname,
      `saves/${saveFileConfigData.projectName}.json`
    );

    await createSave(saveFileConfigData, items, saveFilePath);
  }
}

main();

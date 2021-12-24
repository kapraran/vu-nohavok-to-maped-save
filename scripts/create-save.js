const { writeFile } = require("fs").promises;
const { v4 } = require("uuid");

const randomGUID = v4;

const ZERO_GUID = "00000000-0000-0000-0000-000000000000";

const toVec3 = (x, y, z) => ({ x, y, z });

const addDefaultRequiredBundles = (levelName, requiredBundles = []) => {
  const bundles = [
    `Levels/${levelName}/${levelName}`,
    "gameconfigurations/game",
    "Levels/MP_Subway/MP_Subway_Settings_win32",
    ...requiredBundles,
  ];

  return [...new Set(bundles)];
};

/**
 *
 * @param {*} configData
 * @returns
 */
const createHeader = (configData) => ({
  header: {
    id: Math.floor(Math.random() * 1000),
    timeStamp: Date.now(),
    projectName: configData.projectName,
    mapName: configData.mapName,
    gameModeName: configData.gameModeName,
    requiredBundles: addDefaultRequiredBundles(
      configData.mapName,
      configData.requiredBundles
    ).reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {}
    ),
  },
});

const createDataItem = (itemData) => ({
  origin: 2,
  guid: randomGUID(),
  name: itemData.assetName,
  variation: itemData.variation,
  overrides: {},
  blueprintCtrRef: {
    typeName: "ObjectBlueprint",
    name: itemData.assetName,
    partitionGuid: itemData.partitionGuid.toUpperCase(),
    instanceGuid: itemData.instanceGuid.toUpperCase(),
  },
  transform: itemData.transform,
  parentData: {
    typeName: "custom_root",
    guid: ZERO_GUID,
    primaryInstanceGuid: ZERO_GUID,
    partitionGuid: ZERO_GUID,
  },
  originalRef: {
    partitionGuid: "nil",
    instanceGuid: "nil",
  },
});

const createData = (itemsData) => ({
  data: itemsData.map((itemData) => createDataItem(itemData)),
});

async function createSave(configData, itemsData, filepath) {
  const saveFileData = {
    ...createHeader(configData),
    ...createData(itemsData),
  };

  const json = JSON.stringify(saveFileData, null, 2);
  await writeFile(filepath, json, "utf8");
}

module.exports = {
  createSave,
};

const { resolve } = require("path");
const { EBX_JSON_PATH } = require("../config/config");
const { readFile } = require("fs").promises;
const guidDict = require("../assets/guidDictionary.json");
const Quaternion = require("quaternion");

const extraXYZFromEbxObject = (obj) =>
  Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key]["$value"],
    }),
    {}
  );

const ebxTransformToLT = (ebxTrans) => {
  // const transRaw = ebxTrans.trans["$value"];
  // const trans = Object.keys(transRaw).reduce(
  //   (acc, key) => ({
  //     ...acc,
  //     [key]: transRaw[key]["$value"],
  //   }),
  //   {}
  // );

  const left = extraXYZFromEbxObject(ebxTrans.right["$value"]);
  const up = extraXYZFromEbxObject(ebxTrans.up["$value"]);
  const forward = extraXYZFromEbxObject(ebxTrans.forward["$value"]);
  const trans = extraXYZFromEbxObject(ebxTrans.trans["$value"]);

  return {
    left,
    up,
    forward,
    trans,
  };
};

const toXYZ = (arr) => ({ x: arr[0], y: arr[1], z: arr[2] });

const havokTransformToLT = (havokTrans) => {
  return havokTrans;

  // old
  // const havokQuat = new Quaternion(havokTrans[0])
  // const matrix = havokQuat.toMatrix(true)

  // matrix[0] = matrix[0].map(n => -n)
  // matrix[1] = matrix[1].map(n => -n)

  // return {
  //   left: toXYZ(matrix[0]),
  //   up: toXYZ(matrix[1]),
  //   forward: toXYZ(matrix[2]),
  //   trans: toXYZ(havokTrans[1]),
  // };
};

const resolveVariations = (memberData) => {
  const instanceCount = memberData["InstanceCount"]["$value"];
  const variations = memberData["InstanceObjectVariation"]["$value"];

  return variations.length < 1 ? new Array(instanceCount).fill(0) : variations;
};

const resolveAssetName = (partitionGuid) =>
  guidDict.hasOwnProperty(partitionGuid)
    ? guidDict[partitionGuid].replaceAll("\\", "/")
    : undefined;

const resolveTransforms = (memberData, allHavokTransforms, transformIndex) => {
  const instanceCount = memberData["InstanceCount"]["$value"];
  const ebxTransforms = memberData["InstanceTransforms"]["$value"];

  // if they are defined we use those
  if (ebxTransforms.length > 0)
    return ebxTransforms.map((t) => ebxTransformToLT(t));

  const transforms = allHavokTransforms.slice(
    transformIndex.value,
    transformIndex.value + instanceCount
  );
  transformIndex.value += instanceCount;

  return transforms.map((t) => havokTransformToLT(t));
};

const resolveAssetInfo = async (memberData) => {
  const partitionGuid = memberData["MemberType"]["$value"]["$partitionGuid"];

  const ebxSubPath = guidDict[partitionGuid];

  if (ebxSubPath === undefined)
    return {
      assetName: undefined,
      partitionGuid: undefined,
      instanceGuid: undefined,
    };

  const fullPath = resolve(
    EBX_JSON_PATH,
    `${ebxSubPath.replaceAll("\\", "/")}.json`
  );
  const contents = await readFile(fullPath, "utf8");
  const contentsJson = JSON.parse(contents);

  return {
    assetName: contentsJson["$name"],
    partitionGuid: contentsJson["$guid"],
    instanceGuid: contentsJson["$primaryInstance"],
  };
};

const readMapEbx = async (havokTransforms, saveFileConfigData) => {
  let memberDatas = [];
  const havokTransformsKeys = [];
  for (const filename of saveFileConfigData.ebxFiles) {
    const fullEbxPath = resolve(EBX_JSON_PATH, `${filename}.json`);
    const ebxJson = JSON.parse(await readFile(fullEbxPath, "utf8"));

    const staticModelGroupEntityData = ebxJson["$instances"].find(
      (line) => line["$type"] === "StaticModelGroupEntityData"
    );

    const groupHavokAsset = ebxJson["$instances"].find(
      (line) => line["$type"] === "GroupHavokAsset"
    );

    if (staticModelGroupEntityData === undefined) {
      throw new Error("Could not find 'staticModelGroupEntityData'!");
    }

    havokTransformsKeys.push(groupHavokAsset["$fields"]["Name"]["$value"].toLowerCase())

    memberDatas = [
      ...memberDatas,
      ...staticModelGroupEntityData["$fields"]["MemberDatas"]["$value"],
    ];
  }

  // concat havok transforms
  const allHavokTransforms = havokTransformsKeys.reduce(
    (acc, key) => [...acc, ...havokTransforms[key]],
    []
  );

  const transformIndex = { value: 0 };
  let allAssetData = await Promise.all(
    memberDatas.map(async (memberData, index) => {
      const partitionGuid =
        memberData["MemberType"]["$value"]["$partitionGuid"];

      const currIndex = transformIndex.value;
      if (memberData["InstanceTransforms"]["$value"].length < 1)
        transformIndex.value += memberData["InstanceCount"]["$value"];

      const assetInfo = await resolveAssetInfo(memberData);

      return {
        partitionGuid,
        instanceGuid:
          assetInfo.instanceGuid ||
          memberData["MemberType"]["$value"]["$instanceGuid"],
        instanceCount: memberData["InstanceCount"]["$value"],
        variations: resolveVariations(memberData),
        assetName: assetInfo.assetName || resolveAssetName(partitionGuid),
        transforms: resolveTransforms(memberData, allHavokTransforms, {
          value: currIndex,
        }),
      };
    })
  );

  allAssetData = allAssetData.filter((d) => d.assetName !== undefined);

  const flattenAssetData = allAssetData.reduce((acc, assetData) => {
    const thisAssetArr = new Array(assetData.instanceCount)
      .fill(undefined)
      .map((_, i) => ({
        assetName: assetData.assetName,
        partitionGuid: assetData.partitionGuid,
        instanceGuid: assetData.instanceGuid,
        variation: assetData.variations[i],
        transform: assetData.transforms[i],
      }));

    return [...acc, ...thisAssetArr];
  }, []);

  return flattenAssetData;
};

module.exports = {
  readMapEbx,
};

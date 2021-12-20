const { readFile } = require("fs").promises;
const havokLTData = require('../data.json')

const regexKeyLine = /\['(.*)'\] = {/i;
const regexTransformLine =
  /{ { (.*), (.*), (.*), (.*) }, { (.*), (.*), (.*) } }/i;

/**
 *
 * @param {string} line
 * @returns
 */
const getKeyFromLine = (line) => line.match(regexKeyLine)[1];

/**
 *
 * @param {string} line
 * @returns
 */
const getTransformFromLine = (line) => {
  const parsedLine = Array.from(line.match(regexTransformLine))
    .slice(1)
    .map((item) => parseFloat(item));

  return [parsedLine.slice(0, 4), parsedLine.slice(4, 7)];
};

/**
 *
 * @param {string} srcPath
 * @returns
 */
const readHavokLuaFile = async (srcPath) => {
  const havokLua = await readFile(srcPath, "utf8");
  const havokLuaLines = havokLua.split("\n").map((line) => line.trim());

  const havokTransforms = {};
  let latestKey = undefined;

  havokLuaLines.forEach((line) => {
    if (line.match(regexKeyLine)) {
      latestKey = getKeyFromLine(line);
    } else if (latestKey !== undefined && line.match(regexTransformLine)) {
      const transform = getTransformFromLine(line);

      if (!havokTransforms.hasOwnProperty(latestKey))
        havokTransforms[latestKey] = [];

      havokTransforms[latestKey].push(transform);
    }
  });

  return havokTransforms;
};

module.exports = {
  readHavokLuaFile,
};

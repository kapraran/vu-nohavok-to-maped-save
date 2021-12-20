module.exports = [
  {
    projectName: "ZIBA Havok MapEd Save",
    mapName: "XP1_002",
    gameModeName: "Domination0",
    requiredBundles: [
      "Levels/XP1_002/XP1_002",
      "gameconfigurations/game",
      "Levels/MP_Subway/MP_Subway_Settings_win32",
    ],
    mapEbxPath: "Levels/XP1_002/XP1_002",
    havokTransforms: [
      "levels/xp1_002/xp1_002/staticmodelgroup_physics_win32",
      "levels/xp1_002/cq_l/staticmodelgroup_physics_win32"
    ],
    ebxFiles: [
      "Levels/XP1_002/XP1_002.json",
      "Levels/XP1_002/CQ_L.txt"
    ]
  },
  {
    projectName: "XP5_003 Havok MapEd Save",
    mapName: "XP5_003",
    gameModeName: "ConquestLarge0",
    requiredBundles: [
      "Levels/XP5_003/XP5_003",
      "gameconfigurations/game",
      "Levels/MP_Subway/MP_Subway_Settings_win32",
    ],
    mapEbxPath: "Levels/XP5_003/XP5_003",
    havokTransforms: ["levels/xp5_003/xp5_003/staticmodelgroup_physics_win32"],
    ebxFiles: [
      "Levels/XP1_002/XP1_002.json",
      "Levels/XP1_002/CQ_L.txt"
    ]
  },
];

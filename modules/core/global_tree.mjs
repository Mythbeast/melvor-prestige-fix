// core/global_tree.mjs -- Global Prestige Skill Tree

let _deps = null;
let _ctx  = null;

const STORAGE_KEY = 'global_tree_data';

export const TREE_NODES = [
  { id:"hub", label:"Prestige Core", alias:"Core", desc:"Foundation of all prestige mastery.", branch:"hub", tier:0, cost:0, x:1500, y:1500, modId:null, modValue:0, isPercent:false, isNotable:false },
  { id:"g0", label:"+0.5% XP for all skills", alias:"Skill XP", desc:"+0.5% XP for all skills", branch:"gathering", tier:1, cost:1, x:1422, y:1422, modId:"melvorD:skillXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gA1", label:"+0.5% gem find chance", alias:"Gem Chance", desc:"+0.5% gem find chance", branch:"gathering", tier:2, cost:3, x:1304, y:1400, modId:"melvorD:miningGemChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gA2", label:"+0.5% Rare Drop", alias:"Rare Drop", desc:"+0.5% rare item find chance", branch:"gathering", tier:3, cost:6, x:1197, y:1346, modId:"melvorD:additionalRandomSkillItemChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gA3", label:"+1 flat mining node HP", alias:"Node HP", desc:"+1 flat mining node HP", branch:"gathering", tier:4, cost:10, x:1090, y:1291, modId:"melvorD:flatMiningNodeHP", modValue:1, isPercent:false, isNotable:false },
  { id:"gA4", label:"+1% gem find chance", alias:"Gem Chance", desc:"+1% gem find chance", branch:"gathering", tier:5, cost:15, x:983, y:1237, modId:"melvorD:miningGemChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gA5", label:"+1 flat mining node HP", alias:"Node HP", desc:"+1 flat mining node HP", branch:"gathering", tier:6, cost:20, x:876, y:1182, modId:"melvorD:flatMiningNodeHP", modValue:1, isPercent:false, isNotable:false },
  { id:"gA6", label:"+2% gem find chance", alias:"Gem Chance", desc:"+2% gem find chance", branch:"gathering", tier:7, cost:25, x:769, y:1128, modId:"melvorD:miningGemChance", modValue:2, isPercent:true, isNotable:false },
  { id:"gA7", label:"+1% Rare Drop", alias:"Rare Drop", desc:"+1% rare item find chance", branch:"gathering", tier:8, cost:30, x:662, y:1073, modId:"melvorD:additionalRandomSkillItemChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gA8", label:"+2% gem find chance", alias:"Gem Chance", desc:"+2% gem find chance", branch:"gathering", tier:9, cost:30, x:556, y:1019, modId:"melvorD:miningGemChance", modValue:2, isPercent:true, isNotable:false },
  { id:"gCA", label:"+5% gem find chance", alias:"Gem Master", desc:"+5% gem find chance", branch:"gathering", tier:10, cost:40, x:431, y:955, modId:"melvorD:miningGemChance", modValue:5, isPercent:true, isNotable:false },
  { id:"gB1", label:"+0.5% gem find chance", alias:"Gem Chance", desc:"+0.5% gem find chance", branch:"gathering", tier:2, cost:3, x:1322, y:1371, modId:"melvorD:miningGemChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gB2", label:"+0.5% XP for all skills", alias:"Skill XP", desc:"+0.5% XP for all skills", branch:"gathering", tier:3, cost:6, x:1225, y:1300, modId:"melvorD:skillXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gB3", label:"+1% gem find chance", alias:"Gem Chance", desc:"+1% gem find chance", branch:"gathering", tier:4, cost:10, x:1128, y:1230, modId:"melvorD:miningGemChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gB4", label:"+1% XP for all skills", alias:"Skill XP", desc:"+1% XP for all skills", branch:"gathering", tier:5, cost:15, x:1031, y:1159, modId:"melvorD:skillXP", modValue:1, isPercent:true, isNotable:false },
  { id:"gB5", label:"+1 flat mining node HP", alias:"Node HP", desc:"+1 flat mining node HP", branch:"gathering", tier:6, cost:20, x:934, y:1089, modId:"melvorD:flatMiningNodeHP", modValue:1, isPercent:false, isNotable:false },
  { id:"gB6", label:"+1% gem find chance", alias:"Gem Chance", desc:"+1% gem find chance", branch:"gathering", tier:7, cost:25, x:837, y:1018, modId:"melvorD:miningGemChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gB7", label:"+2% XP for all skills", alias:"Skill XP", desc:"+2% XP for all skills", branch:"gathering", tier:8, cost:30, x:740, y:947, modId:"melvorD:skillXP", modValue:2, isPercent:true, isNotable:false },
  { id:"gB8", label:"+2% gem find chance", alias:"Gem Chance", desc:"+2% gem find chance", branch:"gathering", tier:9, cost:30, x:642, y:877, modId:"melvorD:miningGemChance", modValue:2, isPercent:true, isNotable:false },
  { id:"gCB", label:"+4% gem find chance", alias:"Gem & XP", desc:"+4% gem find chance", branch:"gathering", tier:10, cost:40, x:529, y:795, modId:"melvorD:miningGemChance", modValue:4, isPercent:true, isNotable:false },
  { id:"gC1", label:"+0.5% XP for all skills", alias:"Skill XP", desc:"+0.5% XP for all skills", branch:"gathering", tier:2, cost:3, x:1344, y:1344, modId:"melvorD:skillXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gC2", label:"+0.5% skill item doubling chance", alias:"Item Dbl", desc:"+0.5% skill item doubling chance", branch:"gathering", tier:3, cost:6, x:1260, y:1260, modId:"melvorD:skillItemDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gC3", label:"+1% XP for all skills", alias:"Skill XP", desc:"+1% XP for all skills", branch:"gathering", tier:4, cost:10, x:1175, y:1175, modId:"melvorD:skillXP", modValue:1, isPercent:true, isNotable:false },
  { id:"gC4", label:"+1% skill item doubling chance", alias:"Item Dbl", desc:"+1% skill item doubling chance", branch:"gathering", tier:5, cost:15, x:1090, y:1090, modId:"melvorD:skillItemDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gC5", label:"+1% XP for all skills", alias:"Skill XP", desc:"+1% XP for all skills", branch:"gathering", tier:6, cost:20, x:1005, y:1005, modId:"melvorD:skillXP", modValue:1, isPercent:true, isNotable:false },
  { id:"gC6", label:"+2% XP for all skills", alias:"Skill XP", desc:"+2% XP for all skills", branch:"gathering", tier:7, cost:25, x:920, y:920, modId:"melvorD:skillXP", modValue:2, isPercent:true, isNotable:false },
  { id:"gC7", label:"+1% skill item doubling chance", alias:"Item Dbl", desc:"+1% skill item doubling chance", branch:"gathering", tier:8, cost:30, x:835, y:835, modId:"melvorD:skillItemDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gC8", label:"+2% skill item doubling chance", alias:"Item Dbl", desc:"+2% skill item doubling chance", branch:"gathering", tier:9, cost:30, x:750, y:750, modId:"melvorD:skillItemDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"gCC", label:"+5% XP for all skills", alias:"Gathering", desc:"+5% XP for all skills", branch:"gathering", tier:10, cost:40, x:651, y:651, modId:"melvorD:skillXP", modValue:5, isPercent:true, isNotable:false },
  { id:"gD1", label:"+0.5% skill item doubling chance", alias:"Item Dbl", desc:"+0.5% skill item doubling chance", branch:"gathering", tier:2, cost:3, x:1371, y:1322, modId:"melvorD:skillItemDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gD2", label:"+0.5% Rare Drop", alias:"Rare Drop", desc:"+0.5% rare item find chance", branch:"gathering", tier:3, cost:6, x:1300, y:1225, modId:"melvorD:additionalRandomSkillItemChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gD3", label:"+1% skill item doubling chance", alias:"Item Dbl", desc:"+1% skill item doubling chance", branch:"gathering", tier:4, cost:10, x:1230, y:1128, modId:"melvorD:skillItemDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gD4", label:"+1% XP for all skills", alias:"Skill XP", desc:"+1% XP for all skills", branch:"gathering", tier:5, cost:15, x:1159, y:1031, modId:"melvorD:skillXP", modValue:1, isPercent:true, isNotable:false },
  { id:"gD5", label:"+1% Rare Drop", alias:"Rare Drop", desc:"+1% rare item find chance", branch:"gathering", tier:6, cost:20, x:1089, y:934, modId:"melvorD:additionalRandomSkillItemChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gD6", label:"+2% skill item doubling chance", alias:"Item Dbl", desc:"+2% skill item doubling chance", branch:"gathering", tier:7, cost:25, x:1018, y:837, modId:"melvorD:skillItemDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"gD7", label:"+1% Rare Drop", alias:"Rare Drop", desc:"+1% rare item find chance", branch:"gathering", tier:8, cost:30, x:947, y:740, modId:"melvorD:additionalRandomSkillItemChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gD8", label:"+2% skill item doubling chance", alias:"Item Dbl", desc:"+2% skill item doubling chance", branch:"gathering", tier:9, cost:30, x:877, y:642, modId:"melvorD:skillItemDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"gCD", label:"+5% skill item doubling chance", alias:"Doubling", desc:"+5% skill item doubling chance", branch:"gathering", tier:10, cost:40, x:795, y:529, modId:"melvorD:skillItemDoublingChance", modValue:5, isPercent:true, isNotable:false },
  { id:"gE1", label:"+0.5% Rare Drop", alias:"Rare Drop", desc:"+0.5% rare item find chance", branch:"gathering", tier:2, cost:3, x:1400, y:1304, modId:"melvorD:additionalRandomSkillItemChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gE2", label:"+0.5% skill item doubling chance", alias:"Item Dbl", desc:"+0.5% skill item doubling chance", branch:"gathering", tier:3, cost:6, x:1346, y:1197, modId:"melvorD:skillItemDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"gE3", label:"+1% Rare Drop", alias:"Rare Drop", desc:"+1% rare item find chance", branch:"gathering", tier:4, cost:10, x:1291, y:1090, modId:"melvorD:additionalRandomSkillItemChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gE4", label:"+1% skill item doubling chance", alias:"Item Dbl", desc:"+1% skill item doubling chance", branch:"gathering", tier:5, cost:15, x:1237, y:983, modId:"melvorD:skillItemDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gE5", label:"+1% Rare Drop", alias:"Rare Drop", desc:"+1% rare item find chance", branch:"gathering", tier:6, cost:20, x:1182, y:876, modId:"melvorD:additionalRandomSkillItemChance", modValue:1, isPercent:true, isNotable:false },
  { id:"gE6", label:"+2% Rare Drop", alias:"Rare Drop", desc:"+2% rare item find chance", branch:"gathering", tier:7, cost:25, x:1128, y:769, modId:"melvorD:additionalRandomSkillItemChance", modValue:2, isPercent:true, isNotable:false },
  { id:"gE7", label:"+2% skill item doubling chance", alias:"Item Dbl", desc:"+2% skill item doubling chance", branch:"gathering", tier:8, cost:30, x:1073, y:662, modId:"melvorD:skillItemDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"gE8", label:"+2% Rare Drop", alias:"Rare Drop", desc:"+2% rare item find chance", branch:"gathering", tier:9, cost:30, x:1019, y:556, modId:"melvorD:additionalRandomSkillItemChance", modValue:2, isPercent:true, isNotable:false },
  { id:"gCE", label:"+5% Rare Drop", alias:"Rare Drop", desc:"+5% rare item find chance", branch:"gathering", tier:10, cost:40, x:955, y:431, modId:"melvorD:additionalRandomSkillItemChance", modValue:5, isPercent:true, isNotable:false },
  { id:"gN1", label:"Mother Lode", alias:"Mother Lode", desc:"+8 Node HP. +20% gem. +8% rare.", branch:"gathering", tier:11, cost:60, x:538, y:538, modId:"melvorD:flatMiningNodeHP", modValue:8, isPercent:false, isNotable:true },
  { id:"gN2", label:"Ancient Roots", alias:"Ancient Roots", desc:"+12% skill XP. +8% item dbl.", branch:"gathering", tier:11, cost:50, x:363, y:753, modId:"melvorD:skillXP", modValue:12, isPercent:true, isNotable:true },
  { id:"gN3", label:"Vein of Fortune", alias:"Vein Fortune", desc:"+25% gem. +8% item dbl.", branch:"gathering", tier:11, cost:50, x:753, y:363, modId:"melvorD:miningGemChance", modValue:25, isPercent:true, isNotable:true },
  { id:"gN4", label:"Keen Eye", alias:"Keen Eye", desc:"+12% gem. +5 Node HP.", branch:"gathering", tier:11, cost:42, x:236, y:999, modId:"melvorD:miningGemChance", modValue:12, isPercent:true, isNotable:true },
  { id:"gN5", label:"Bounty Hunter", alias:"Bounty Hunter", desc:"+15% item dbl. +8% rare.", branch:"gathering", tier:11, cost:42, x:999, y:236, modId:"melvorD:skillItemDoublingChance", modValue:15, isPercent:true, isNotable:true },
  { id:"gN6", label:"Earth Shaper", alias:"Earth Shaper", desc:"+6 Node HP. +10% gem.", branch:"gathering", tier:11, cost:48, x:298, y:864, modId:"melvorD:flatMiningNodeHP", modValue:6, isPercent:false, isNotable:true },
  { id:"gN7", label:"Treasure Sense", alias:"Treas.Sense", desc:"+10% item dbl. +10% rare.", branch:"gathering", tier:11, cost:48, x:864, y:298, modId:"melvorD:skillItemDoublingChance", modValue:10, isPercent:true, isNotable:true },
  { id:"p0", label:"+0.5% Mastery XP", alias:"Mastery XP", desc:"+0.5% Mastery XP", branch:"production", tier:1, cost:1, x:1578, y:1422, modId:"melvorD:masteryXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pA1", label:"+0.5% skill preservation chance", alias:"Skill Pres", desc:"+0.5% skill preservation chance", branch:"production", tier:2, cost:3, x:1600, y:1304, modId:"melvorD:skillPreservationChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pA2", label:"+0.5% potion charge preservation", alias:"Pot. Pres", desc:"+0.5% potion charge preservation", branch:"production", tier:3, cost:6, x:1654, y:1197, modId:"melvorD:potionChargePreservationChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pA3", label:"+1% skill preservation chance", alias:"Skill Pres", desc:"+1% skill preservation chance", branch:"production", tier:4, cost:10, x:1709, y:1090, modId:"melvorD:skillPreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"pA4", label:"+1% potion charge preservation", alias:"Pot. Pres", desc:"+1% potion charge preservation", branch:"production", tier:5, cost:15, x:1763, y:983, modId:"melvorD:potionChargePreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"pA5", label:"+2% skill preservation chance", alias:"Skill Pres", desc:"+2% skill preservation chance", branch:"production", tier:6, cost:20, x:1818, y:876, modId:"melvorD:skillPreservationChance", modValue:2, isPercent:true, isNotable:false },
  { id:"pA6", label:"+1% consumable preservation", alias:"Consumable", desc:"+1% consumable preservation", branch:"production", tier:7, cost:25, x:1872, y:769, modId:"melvorD:consumablePreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"pA7", label:"+2% potion charge preservation", alias:"Pot. Pres", desc:"+2% potion charge preservation", branch:"production", tier:8, cost:30, x:1927, y:662, modId:"melvorD:potionChargePreservationChance", modValue:2, isPercent:true, isNotable:false },
  { id:"pA8", label:"+3% skill preservation chance", alias:"Skill Pres", desc:"+3% skill preservation chance", branch:"production", tier:9, cost:30, x:1981, y:556, modId:"melvorD:skillPreservationChance", modValue:3, isPercent:true, isNotable:false },
  { id:"pCA", label:"+5% skill preservation chance", alias:"Preservation", desc:"+5% skill preservation chance", branch:"production", tier:10, cost:40, x:2045, y:431, modId:"melvorD:skillPreservationChance", modValue:5, isPercent:true, isNotable:false },
  { id:"pB1", label:"+0.5% skill preservation chance", alias:"Skill Pres", desc:"+0.5% skill preservation chance", branch:"production", tier:2, cost:3, x:1629, y:1322, modId:"melvorD:skillPreservationChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pB2", label:"+0.5% Mastery XP", alias:"Mastery XP", desc:"+0.5% Mastery XP", branch:"production", tier:3, cost:6, x:1700, y:1225, modId:"melvorD:masteryXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pB3", label:"+1% skill preservation chance", alias:"Skill Pres", desc:"+1% skill preservation chance", branch:"production", tier:4, cost:10, x:1770, y:1128, modId:"melvorD:skillPreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"pB4", label:"+1% Mastery XP", alias:"Mastery XP", desc:"+1% Mastery XP", branch:"production", tier:5, cost:15, x:1841, y:1031, modId:"melvorD:masteryXP", modValue:1, isPercent:true, isNotable:false },
  { id:"pB5", label:"+1% skill preservation chance", alias:"Skill Pres", desc:"+1% skill preservation chance", branch:"production", tier:6, cost:20, x:1911, y:934, modId:"melvorD:skillPreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"pB6", label:"+2% Mastery XP", alias:"Mastery XP", desc:"+2% Mastery XP", branch:"production", tier:7, cost:25, x:1982, y:837, modId:"melvorD:masteryXP", modValue:2, isPercent:true, isNotable:false },
  { id:"pB7", label:"+2% skill preservation chance", alias:"Skill Pres", desc:"+2% skill preservation chance", branch:"production", tier:8, cost:30, x:2053, y:740, modId:"melvorD:skillPreservationChance", modValue:2, isPercent:true, isNotable:false },
  { id:"pB8", label:"+2% Mastery XP", alias:"Mastery XP", desc:"+2% Mastery XP", branch:"production", tier:9, cost:30, x:2123, y:642, modId:"melvorD:masteryXP", modValue:2, isPercent:true, isNotable:false },
  { id:"pCB", label:"+4% skill preservation chance", alias:"Pres&Mastery", desc:"+4% skill preservation chance", branch:"production", tier:10, cost:40, x:2205, y:529, modId:"melvorD:skillPreservationChance", modValue:4, isPercent:true, isNotable:false },
  { id:"pC1", label:"+0.5% Mastery XP", alias:"Mastery XP", desc:"+0.5% Mastery XP", branch:"production", tier:2, cost:3, x:1656, y:1344, modId:"melvorD:masteryXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pC2", label:"+0.5% skill item doubling chance", alias:"Output Dbl", desc:"+0.5% skill item doubling chance", branch:"production", tier:3, cost:6, x:1740, y:1260, modId:"melvorD:skillItemDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pC3", label:"+1% Mastery XP", alias:"Mastery XP", desc:"+1% Mastery XP", branch:"production", tier:4, cost:10, x:1825, y:1175, modId:"melvorD:masteryXP", modValue:1, isPercent:true, isNotable:false },
  { id:"pC4", label:"+1% skill item doubling chance", alias:"Output Dbl", desc:"+1% skill item doubling chance", branch:"production", tier:5, cost:15, x:1910, y:1090, modId:"melvorD:skillItemDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"pC5", label:"+2% Mastery XP", alias:"Mastery XP", desc:"+2% Mastery XP", branch:"production", tier:6, cost:20, x:1995, y:1005, modId:"melvorD:masteryXP", modValue:2, isPercent:true, isNotable:false },
  { id:"pC6", label:"+1% skill item doubling chance", alias:"Output Dbl", desc:"+1% skill item doubling chance", branch:"production", tier:7, cost:25, x:2080, y:920, modId:"melvorD:skillItemDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"pC7", label:"+2% skill item doubling chance", alias:"Output Dbl", desc:"+2% skill item doubling chance", branch:"production", tier:8, cost:30, x:2165, y:835, modId:"melvorD:skillItemDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"pC8", label:"+3% Mastery XP", alias:"Mastery XP", desc:"+3% Mastery XP", branch:"production", tier:9, cost:30, x:2250, y:750, modId:"melvorD:masteryXP", modValue:3, isPercent:true, isNotable:false },
  { id:"pCC", label:"+5% Mastery XP", alias:"Mastery Pwr", desc:"+5% Mastery XP", branch:"production", tier:10, cost:40, x:2349, y:651, modId:"melvorD:masteryXP", modValue:5, isPercent:true, isNotable:false },
  { id:"pD1", label:"+0.5% skill item doubling chance", alias:"Output Dbl", desc:"+0.5% skill item doubling chance", branch:"production", tier:2, cost:3, x:1678, y:1371, modId:"melvorD:skillItemDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pD2", label:"+0.5% potion charge preservation", alias:"Pot. Pres", desc:"+0.5% potion charge preservation", branch:"production", tier:3, cost:6, x:1775, y:1300, modId:"melvorD:potionChargePreservationChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pD3", label:"+1% skill item doubling chance", alias:"Output Dbl", desc:"+1% skill item doubling chance", branch:"production", tier:4, cost:10, x:1872, y:1230, modId:"melvorD:skillItemDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"pD4", label:"+1% potion charge preservation", alias:"Pot. Pres", desc:"+1% potion charge preservation", branch:"production", tier:5, cost:15, x:1969, y:1159, modId:"melvorD:potionChargePreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"pD5", label:"+2% skill item doubling chance", alias:"Output Dbl", desc:"+2% skill item doubling chance", branch:"production", tier:6, cost:20, x:2066, y:1089, modId:"melvorD:skillItemDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"pD6", label:"+1% Mastery XP", alias:"Mastery XP", desc:"+1% Mastery XP", branch:"production", tier:7, cost:25, x:2163, y:1018, modId:"melvorD:masteryXP", modValue:1, isPercent:true, isNotable:false },
  { id:"pD7", label:"+2% potion charge preservation", alias:"Pot. Pres", desc:"+2% potion charge preservation", branch:"production", tier:8, cost:30, x:2260, y:947, modId:"melvorD:potionChargePreservationChance", modValue:2, isPercent:true, isNotable:false },
  { id:"pD8", label:"+2% skill item doubling chance", alias:"Output Dbl", desc:"+2% skill item doubling chance", branch:"production", tier:9, cost:30, x:2358, y:877, modId:"melvorD:skillItemDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"pCD", label:"+5% skill item doubling chance", alias:"Output Pwr", desc:"+5% skill item doubling chance", branch:"production", tier:10, cost:40, x:2471, y:795, modId:"melvorD:skillItemDoublingChance", modValue:5, isPercent:true, isNotable:false },
  { id:"pE1", label:"+0.5% skill item doubling chance", alias:"Output Dbl", desc:"+0.5% skill item doubling chance", branch:"production", tier:2, cost:3, x:1696, y:1400, modId:"melvorD:skillItemDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pE2", label:"+0.5% Mastery XP", alias:"Mastery XP", desc:"+0.5% Mastery XP", branch:"production", tier:3, cost:6, x:1803, y:1346, modId:"melvorD:masteryXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"pE3", label:"+1% skill item doubling chance", alias:"Output Dbl", desc:"+1% skill item doubling chance", branch:"production", tier:4, cost:10, x:1910, y:1291, modId:"melvorD:skillItemDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"pE4", label:"+1% Mastery XP", alias:"Mastery XP", desc:"+1% Mastery XP", branch:"production", tier:5, cost:15, x:2017, y:1237, modId:"melvorD:masteryXP", modValue:1, isPercent:true, isNotable:false },
  { id:"pE5", label:"+2% skill item doubling chance", alias:"Output Dbl", desc:"+2% skill item doubling chance", branch:"production", tier:6, cost:20, x:2124, y:1182, modId:"melvorD:skillItemDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"pE6", label:"+2% skill item doubling chance", alias:"Output Dbl", desc:"+2% skill item doubling chance", branch:"production", tier:7, cost:25, x:2231, y:1128, modId:"melvorD:skillItemDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"pE7", label:"+3% Mastery XP", alias:"Mastery XP", desc:"+3% Mastery XP", branch:"production", tier:8, cost:30, x:2338, y:1073, modId:"melvorD:masteryXP", modValue:3, isPercent:true, isNotable:false },
  { id:"pE8", label:"+3% skill item doubling chance", alias:"Output Dbl", desc:"+3% skill item doubling chance", branch:"production", tier:9, cost:30, x:2444, y:1019, modId:"melvorD:skillItemDoublingChance", modValue:3, isPercent:true, isNotable:false },
  { id:"pCE", label:"+5% skill item doubling chance", alias:"Out.Mastery", desc:"+5% skill item doubling chance", branch:"production", tier:10, cost:40, x:2569, y:955, modId:"melvorD:skillItemDoublingChance", modValue:5, isPercent:true, isNotable:false },
  { id:"pN1", label:"Grandmaster", alias:"Grandmaster", desc:"+12% out dbl. +8% skill pres. +5% mast XP.", branch:"production", tier:11, cost:60, x:2462, y:538, modId:"melvorD:skillItemDoublingChance", modValue:12, isPercent:true, isNotable:true },
  { id:"pN2", label:"Eff. Crafter", alias:"Eff. Crafter", desc:"+10% skill pres. +5% potion pres.", branch:"production", tier:11, cost:50, x:2247, y:363, modId:"melvorD:skillPreservationChance", modValue:10, isPercent:true, isNotable:true },
  { id:"pN3", label:"Mastery Overflow", alias:"Mastery Flow", desc:"+18% mastery XP. +8% out dbl.", branch:"production", tier:11, cost:50, x:2637, y:753, modId:"melvorD:masteryXP", modValue:18, isPercent:true, isNotable:true },
  { id:"pN4", label:"Pres. Master", alias:"Pres. Master", desc:"+12% all pres. +5% consumable.", branch:"production", tier:11, cost:42, x:2001, y:236, modId:"melvorD:skillPreservationChance", modValue:12, isPercent:true, isNotable:true },
  { id:"pN5", label:"Art. Prodigy", alias:"Art. Prodigy", desc:"+15% out dbl. +8% mastery XP.", branch:"production", tier:11, cost:42, x:2764, y:999, modId:"melvorD:skillItemDoublingChance", modValue:15, isPercent:true, isNotable:true },
  { id:"pN6", label:"Potion Expert", alias:"Potion Expert", desc:"+10% potion pres. +8% skill pres.", branch:"production", tier:11, cost:48, x:2136, y:298, modId:"melvorD:potionChargePreservationChance", modValue:10, isPercent:true, isNotable:true },
  { id:"pN7", label:"M. Craftsman", alias:"M. Craftsman", desc:"+12% out dbl. +10% mastery XP.", branch:"production", tier:11, cost:48, x:2702, y:864, modId:"melvorD:skillItemDoublingChance", modValue:12, isPercent:true, isNotable:true },
  { id:"c0", label:"+0.5% XP for all skills", alias:"Combat XP", desc:"+0.5% XP for all skills", branch:"combat", tier:1, cost:1, x:1578, y:1578, modId:"melvorD:skillXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"cA1", label:"+0.5% combat loot doubling", alias:"Loot Dbl", desc:"+0.5% combat loot doubling", branch:"combat", tier:2, cost:3, x:1696, y:1600, modId:"melvorD:combatLootDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"cA2", label:"+0.5% damage to bosses", alias:"Boss Dmg", desc:"+0.5% damage to bosses", branch:"combat", tier:3, cost:6, x:1803, y:1654, modId:"melvorD:damageDealtToBosses", modValue:0.5, isPercent:true, isNotable:false },
  { id:"cA3", label:"+1% combat loot doubling", alias:"Loot Dbl", desc:"+1% combat loot doubling", branch:"combat", tier:4, cost:10, x:1910, y:1709, modId:"melvorD:combatLootDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"cA4", label:"+1% damage to bosses", alias:"Boss Dmg", desc:"+1% damage to bosses", branch:"combat", tier:5, cost:15, x:2017, y:1763, modId:"melvorD:damageDealtToBosses", modValue:1, isPercent:true, isNotable:false },
  { id:"cA5", label:"+2% combat loot doubling", alias:"Loot Dbl", desc:"+2% combat loot doubling", branch:"combat", tier:6, cost:20, x:2124, y:1818, modId:"melvorD:combatLootDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"cA6", label:"+2% damage to bosses", alias:"Boss Dmg", desc:"+2% damage to bosses", branch:"combat", tier:7, cost:25, x:2231, y:1872, modId:"melvorD:damageDealtToBosses", modValue:2, isPercent:true, isNotable:false },
  { id:"cA7", label:"+2% combat loot doubling", alias:"Loot Dbl", desc:"+2% combat loot doubling", branch:"combat", tier:8, cost:30, x:2338, y:1927, modId:"melvorD:combatLootDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"cA8", label:"+3% damage to bosses", alias:"Boss Dmg", desc:"+3% damage to bosses", branch:"combat", tier:9, cost:30, x:2444, y:1981, modId:"melvorD:damageDealtToBosses", modValue:3, isPercent:true, isNotable:false },
  { id:"cCA", label:"+5% combat loot doubling", alias:"Loot&Boss", desc:"+5% combat loot doubling", branch:"combat", tier:10, cost:40, x:2569, y:2045, modId:"melvorD:combatLootDoublingChance", modValue:5, isPercent:true, isNotable:false },
  { id:"cB1", label:"+0.5% combat loot doubling", alias:"Loot Dbl", desc:"+0.5% combat loot doubling", branch:"combat", tier:2, cost:3, x:1678, y:1629, modId:"melvorD:combatLootDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"cB2", label:"+0.5% damage to slayer task monsters", alias:"Slayer Dmg", desc:"+0.5% damage to slayer task monsters", branch:"combat", tier:3, cost:6, x:1775, y:1700, modId:"melvorD:damageDealtToSlayerTasks", modValue:0.5, isPercent:true, isNotable:false },
  { id:"cB3", label:"+1% combat loot doubling", alias:"Loot Dbl", desc:"+1% combat loot doubling", branch:"combat", tier:4, cost:10, x:1872, y:1770, modId:"melvorD:combatLootDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"cB4", label:"+1% damage to slayer task monsters", alias:"Slayer Dmg", desc:"+1% damage to slayer task monsters", branch:"combat", tier:5, cost:15, x:1969, y:1841, modId:"melvorD:damageDealtToSlayerTasks", modValue:1, isPercent:true, isNotable:false },
  { id:"cB5", label:"+1% combat loot doubling", alias:"Loot Dbl", desc:"+1% combat loot doubling", branch:"combat", tier:6, cost:20, x:2066, y:1911, modId:"melvorD:combatLootDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"cB6", label:"+2% damage to slayer task monsters", alias:"Slayer Dmg", desc:"+2% damage to slayer task monsters", branch:"combat", tier:7, cost:25, x:2163, y:1982, modId:"melvorD:damageDealtToSlayerTasks", modValue:2, isPercent:true, isNotable:false },
  { id:"cB7", label:"+2% combat loot doubling", alias:"Loot Dbl", desc:"+2% combat loot doubling", branch:"combat", tier:8, cost:30, x:2260, y:2053, modId:"melvorD:combatLootDoublingChance", modValue:2, isPercent:true, isNotable:false },
  { id:"cB8", label:"+2% damage to slayer task monsters", alias:"Slayer Dmg", desc:"+2% damage to slayer task monsters", branch:"combat", tier:9, cost:30, x:2358, y:2123, modId:"melvorD:damageDealtToSlayerTasks", modValue:2, isPercent:true, isNotable:false },
  { id:"cCB", label:"+4% combat loot doubling", alias:"Loot&Slay", desc:"+4% combat loot doubling", branch:"combat", tier:10, cost:40, x:2471, y:2205, modId:"melvorD:combatLootDoublingChance", modValue:4, isPercent:true, isNotable:false },
  { id:"cC1", label:"+0.5% XP for all skills", alias:"Combat XP", desc:"+0.5% XP for all skills", branch:"combat", tier:2, cost:3, x:1656, y:1656, modId:"melvorD:skillXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"cC2", label:"+0.5% damage to all monsters", alias:"Monster Dmg", desc:"+0.5% damage to all monsters", branch:"combat", tier:3, cost:6, x:1740, y:1740, modId:"melvorD:damageDealtToAllMonsters", modValue:0.5, isPercent:true, isNotable:false },
  { id:"cC3", label:"+1% XP for all skills", alias:"Combat XP", desc:"+1% XP for all skills", branch:"combat", tier:4, cost:10, x:1825, y:1825, modId:"melvorD:skillXP", modValue:1, isPercent:true, isNotable:false },
  { id:"cC4", label:"+1% damage to all monsters", alias:"Monster Dmg", desc:"+1% damage to all monsters", branch:"combat", tier:5, cost:15, x:1910, y:1910, modId:"melvorD:damageDealtToAllMonsters", modValue:1, isPercent:true, isNotable:false },
  { id:"cC5", label:"+2% XP for all skills", alias:"Combat XP", desc:"+2% XP for all skills", branch:"combat", tier:6, cost:20, x:1995, y:1995, modId:"melvorD:skillXP", modValue:2, isPercent:true, isNotable:false },
  { id:"cC6", label:"+1% damage to all monsters", alias:"Monster Dmg", desc:"+1% damage to all monsters", branch:"combat", tier:7, cost:25, x:2080, y:2080, modId:"melvorD:damageDealtToAllMonsters", modValue:1, isPercent:true, isNotable:false },
  { id:"cC7", label:"+2% damage to all monsters", alias:"Monster Dmg", desc:"+2% damage to all monsters", branch:"combat", tier:8, cost:30, x:2165, y:2165, modId:"melvorD:damageDealtToAllMonsters", modValue:2, isPercent:true, isNotable:false },
  { id:"cC8", label:"+3% XP for all skills", alias:"Combat XP", desc:"+3% XP for all skills", branch:"combat", tier:9, cost:30, x:2250, y:2250, modId:"melvorD:skillXP", modValue:3, isPercent:true, isNotable:false },
  { id:"cCC", label:"+5% damage to all monsters", alias:"Combat Pwr", desc:"+5% damage to all monsters", branch:"combat", tier:10, cost:40, x:2349, y:2349, modId:"melvorD:damageDealtToAllMonsters", modValue:5, isPercent:true, isNotable:false },
  { id:"cD1", label:"+10 Max HP", alias:"Max HP", desc:"+10 max hitpoints", branch:"combat", tier:2, cost:3, x:1629, y:1678, modId:"melvorD:flatMaxHitpoints", modValue:1, isPercent:false, isNotable:false },
  { id:"cD2", label:"+0.5% auto eat efficiency", alias:"Auto Eat", desc:"+0.5% auto eat efficiency", branch:"combat", tier:3, cost:6, x:1700, y:1775, modId:"melvorD:autoEatEfficiency", modValue:0.5, isPercent:true, isNotable:false },
  { id:"cD3", label:"+20 Max HP", alias:"Max HP", desc:"+20 max hitpoints", branch:"combat", tier:4, cost:10, x:1770, y:1872, modId:"melvorD:flatMaxHitpoints", modValue:2, isPercent:false, isNotable:false },
  { id:"cD4", label:"+1% auto eat efficiency", alias:"Auto Eat", desc:"+1% auto eat efficiency", branch:"combat", tier:5, cost:15, x:1841, y:1969, modId:"melvorD:autoEatEfficiency", modValue:1, isPercent:true, isNotable:false },
  { id:"cD5", label:"+30 Max HP", alias:"Max HP", desc:"+30 max hitpoints", branch:"combat", tier:6, cost:20, x:1911, y:2066, modId:"melvorD:flatMaxHitpoints", modValue:3, isPercent:false, isNotable:false },
  { id:"cD6", label:"+1% auto eat efficiency", alias:"Auto Eat", desc:"+1% auto eat efficiency", branch:"combat", tier:7, cost:25, x:1982, y:2163, modId:"melvorD:autoEatEfficiency", modValue:1, isPercent:true, isNotable:false },
  { id:"cD7", label:"+30 Max HP", alias:"Max HP", desc:"+30 max hitpoints", branch:"combat", tier:8, cost:30, x:2053, y:2260, modId:"melvorD:flatMaxHitpoints", modValue:3, isPercent:false, isNotable:false },
  { id:"cD8", label:"+2% auto eat efficiency", alias:"Auto Eat", desc:"+2% auto eat efficiency", branch:"combat", tier:9, cost:30, x:2123, y:2358, modId:"melvorD:autoEatEfficiency", modValue:2, isPercent:true, isNotable:false },
  { id:"cCD", label:"+80 Max HP", alias:"HP&AutoEat", desc:"+80 max hitpoints", branch:"combat", tier:10, cost:40, x:2205, y:2471, modId:"melvorD:flatMaxHitpoints", modValue:8, isPercent:false, isNotable:false },
  { id:"cE1", label:"+10 Max HP", alias:"Max HP", desc:"+10 max hitpoints", branch:"combat", tier:2, cost:3, x:1600, y:1696, modId:"melvorD:flatMaxHitpoints", modValue:1, isPercent:false, isNotable:false },
  { id:"cE2", label:"+0.5% HP regeneration", alias:"HP Regen", desc:"+0.5% HP regeneration", branch:"combat", tier:3, cost:6, x:1654, y:1803, modId:"melvorD:hitpointRegeneration", modValue:0.5, isPercent:true, isNotable:false },
  { id:"cE3", label:"+20 Max HP", alias:"Max HP", desc:"+20 max hitpoints", branch:"combat", tier:4, cost:10, x:1709, y:1910, modId:"melvorD:flatMaxHitpoints", modValue:2, isPercent:false, isNotable:false },
  { id:"cE4", label:"+1% HP regeneration", alias:"HP Regen", desc:"+1% HP regeneration", branch:"combat", tier:5, cost:15, x:1763, y:2017, modId:"melvorD:hitpointRegeneration", modValue:1, isPercent:true, isNotable:false },
  { id:"cE5", label:"+30 Max HP", alias:"Max HP", desc:"+30 max hitpoints", branch:"combat", tier:6, cost:20, x:1818, y:2124, modId:"melvorD:flatMaxHitpoints", modValue:3, isPercent:false, isNotable:false },
  { id:"cE6", label:"+1% HP regeneration", alias:"HP Regen", desc:"+1% HP regeneration", branch:"combat", tier:7, cost:25, x:1872, y:2231, modId:"melvorD:hitpointRegeneration", modValue:1, isPercent:true, isNotable:false },
  { id:"cE7", label:"+50 Max HP", alias:"Max HP", desc:"+50 max hitpoints", branch:"combat", tier:8, cost:30, x:1927, y:2338, modId:"melvorD:flatMaxHitpoints", modValue:5, isPercent:false, isNotable:false },
  { id:"cE8", label:"+2% HP regeneration", alias:"HP Regen", desc:"+2% HP regeneration", branch:"combat", tier:9, cost:30, x:1981, y:2444, modId:"melvorD:hitpointRegeneration", modValue:2, isPercent:true, isNotable:false },
  { id:"cCE", label:"+100 Max HP", alias:"HP&Regen", desc:"+100 max hitpoints", branch:"combat", tier:10, cost:40, x:2045, y:2569, modId:"melvorD:flatMaxHitpoints", modValue:10, isPercent:false, isNotable:false },
  { id:"cN1", label:"Warlord", alias:"Warlord", desc:"+12% monster dmg. +8% loot dbl. +5% boss dmg.", branch:"combat", tier:11, cost:60, x:2462, y:2462, modId:"melvorD:damageDealtToAllMonsters", modValue:12, isPercent:true, isNotable:true },
  { id:"cN2", label:"Slayer's Mark", alias:"Slayer's Mk", desc:"+25% slayer dmg. +15% slayer task length.", branch:"combat", tier:11, cost:50, x:2637, y:2247, modId:"melvorD:damageDealtToSlayerTasks", modValue:25, isPercent:true, isNotable:true },
  { id:"cN3", label:"+60 Max HP", alias:"Iron Will", desc:"+60 max hitpoints", branch:"combat", tier:11, cost:50, x:2247, y:2637, modId:"melvorD:flatMaxHitpoints", modValue:6, isPercent:false, isNotable:true },
  { id:"cN4", label:"Berserker", alias:"Berserker", desc:"+10% boss dmg. +8% loot dbl.", branch:"combat", tier:11, cost:42, x:2764, y:2001, modId:"melvorD:damageDealtToBosses", modValue:10, isPercent:true, isNotable:true },
  { id:"cN5", label:"+30 Max HP", alias:"Battle Hard.", desc:"+30 max hitpoints", branch:"combat", tier:11, cost:42, x:2001, y:2764, modId:"melvorD:flatMaxHitpoints", modValue:3, isPercent:false, isNotable:true },
  { id:"cN6", label:"Reaper", alias:"Reaper", desc:"+8% monster dmg. +10% loot dbl.", branch:"combat", tier:11, cost:48, x:2702, y:2136, modId:"melvorD:damageDealtToAllMonsters", modValue:8, isPercent:true, isNotable:true },
  { id:"cN7", label:"+40 Max HP", alias:"Fortress", desc:"+40 max hitpoints", branch:"combat", tier:11, cost:48, x:2136, y:2702, modId:"melvorD:flatMaxHitpoints", modValue:4, isPercent:false, isNotable:true },
  { id:"e0", label:"+0.5% GP from monster drops", alias:"GP Monsters", desc:"+0.5% GP from monster drops", branch:"economy", tier:1, cost:1, x:1422, y:1578, modId:"melvorD:currencyGainFromMonsterDrops", modValue:0.5, isPercent:true, isNotable:false },
  { id:"eA1", label:"+0.5% GP from monster drops", alias:"GP", desc:"+0.5% GP from monster drops", branch:"economy", tier:2, cost:3, x:1400, y:1696, modId:"melvorD:currencyGainFromMonsterDrops", modValue:0.5, isPercent:true, isNotable:false },
  { id:"eA2", label:"+0.5% GP from slayer task drops", alias:"GP Slayer", desc:"+0.5% GP from slayer task drops", branch:"economy", tier:3, cost:6, x:1346, y:1803, modId:"melvorD:currencyGainFromSlayerTaskMonsterDrops", modValue:0.5, isPercent:true, isNotable:false },
  { id:"eA3", label:"+1% GP from monster drops", alias:"GP", desc:"+1% GP from monster drops", branch:"economy", tier:4, cost:10, x:1291, y:1910, modId:"melvorD:currencyGainFromMonsterDrops", modValue:1, isPercent:true, isNotable:false },
  { id:"eA4", label:"+1% GP from slayer task drops", alias:"GP Slayer", desc:"+1% GP from slayer task drops", branch:"economy", tier:5, cost:15, x:1237, y:2017, modId:"melvorD:currencyGainFromSlayerTaskMonsterDrops", modValue:1, isPercent:true, isNotable:false },
  { id:"eA5", label:"+2% GP from monster drops", alias:"GP", desc:"+2% GP from monster drops", branch:"economy", tier:6, cost:20, x:1182, y:2124, modId:"melvorD:currencyGainFromMonsterDrops", modValue:2, isPercent:true, isNotable:false },
  { id:"eA6", label:"+2% GP from slayer task drops", alias:"GP Slayer", desc:"+2% GP from slayer task drops", branch:"economy", tier:7, cost:25, x:1128, y:2231, modId:"melvorD:currencyGainFromSlayerTaskMonsterDrops", modValue:2, isPercent:true, isNotable:false },
  { id:"eA7", label:"+2% GP from monster drops", alias:"GP", desc:"+2% GP from monster drops", branch:"economy", tier:8, cost:30, x:1073, y:2338, modId:"melvorD:currencyGainFromMonsterDrops", modValue:2, isPercent:true, isNotable:false },
  { id:"eA8", label:"+3% GP from slayer task drops", alias:"GP Slayer", desc:"+3% GP from slayer task drops", branch:"economy", tier:9, cost:30, x:1019, y:2444, modId:"melvorD:currencyGainFromSlayerTaskMonsterDrops", modValue:3, isPercent:true, isNotable:false },
  { id:"eCA", label:"+5% GP from monster drops", alias:"GP Mastery", desc:"+5% GP from monster drops", branch:"economy", tier:10, cost:40, x:955, y:2569, modId:"melvorD:currencyGainFromMonsterDrops", modValue:5, isPercent:true, isNotable:false },
  { id:"eB1", label:"+0.5% item sale value", alias:"Item Value", desc:"+0.5% item sale value", branch:"economy", tier:2, cost:3, x:1371, y:1678, modId:"melvorD:itemSaleCurrencyGain", modValue:0.5, isPercent:true, isNotable:false },
  { id:"eB2", label:"+0.5% GP from monster drops", alias:"GP", desc:"+0.5% GP from monster drops", branch:"economy", tier:3, cost:6, x:1300, y:1775, modId:"melvorD:currencyGainFromMonsterDrops", modValue:0.5, isPercent:true, isNotable:false },
  { id:"eB3", label:"+1% item sale value", alias:"Item Value", desc:"+1% item sale value", branch:"economy", tier:4, cost:10, x:1230, y:1872, modId:"melvorD:itemSaleCurrencyGain", modValue:1, isPercent:true, isNotable:false },
  { id:"eB4", label:"+1% GP from monster drops", alias:"GP", desc:"+1% GP from monster drops", branch:"economy", tier:5, cost:15, x:1159, y:1969, modId:"melvorD:currencyGainFromMonsterDrops", modValue:1, isPercent:true, isNotable:false },
  { id:"eB5", label:"+2% item sale value", alias:"Item Value", desc:"+2% item sale value", branch:"economy", tier:6, cost:20, x:1089, y:2066, modId:"melvorD:itemSaleCurrencyGain", modValue:2, isPercent:true, isNotable:false },
  { id:"eB6", label:"+1% GP from slayer task drops", alias:"GP Slayer", desc:"+1% GP from slayer task drops", branch:"economy", tier:7, cost:25, x:1018, y:2163, modId:"melvorD:currencyGainFromSlayerTaskMonsterDrops", modValue:1, isPercent:true, isNotable:false },
  { id:"eB7", label:"+2% GP from monster drops", alias:"GP", desc:"+2% GP from monster drops", branch:"economy", tier:8, cost:30, x:947, y:2260, modId:"melvorD:currencyGainFromMonsterDrops", modValue:2, isPercent:true, isNotable:false },
  { id:"eB8", label:"+2% item sale value", alias:"Item Value", desc:"+2% item sale value", branch:"economy", tier:9, cost:30, x:877, y:2358, modId:"melvorD:itemSaleCurrencyGain", modValue:2, isPercent:true, isNotable:false },
  { id:"eCB", label:"+4% GP from monster drops", alias:"GP&Value", desc:"+4% GP from monster drops", branch:"economy", tier:10, cost:40, x:795, y:2471, modId:"melvorD:currencyGainFromMonsterDrops", modValue:4, isPercent:true, isNotable:false },
  { id:"eC1", label:"+0.5% item sale value", alias:"Item Value", desc:"+0.5% item sale value", branch:"economy", tier:2, cost:3, x:1344, y:1656, modId:"melvorD:itemSaleCurrencyGain", modValue:0.5, isPercent:true, isNotable:false },
  { id:"eC2", label:"+1 bank slots", alias:"Bank Slots", desc:"+1 bank slots", branch:"economy", tier:3, cost:6, x:1260, y:1740, modId:"melvorD:bankSpace", modValue:1, isPercent:false, isNotable:false },
  { id:"eC3", label:"+1% item sale value", alias:"Item Value", desc:"+1% item sale value", branch:"economy", tier:4, cost:10, x:1175, y:1825, modId:"melvorD:itemSaleCurrencyGain", modValue:1, isPercent:true, isNotable:false },
  { id:"eC4", label:"+2 bank slots", alias:"Bank Slots", desc:"+2 bank slots", branch:"economy", tier:5, cost:15, x:1090, y:1910, modId:"melvorD:bankSpace", modValue:2, isPercent:false, isNotable:false },
  { id:"eC5", label:"+2% item sale value", alias:"Item Value", desc:"+2% item sale value", branch:"economy", tier:6, cost:20, x:1005, y:1995, modId:"melvorD:itemSaleCurrencyGain", modValue:2, isPercent:true, isNotable:false },
  { id:"eC6", label:"+2 bank slots", alias:"Bank Slots", desc:"+2 bank slots", branch:"economy", tier:7, cost:25, x:920, y:2080, modId:"melvorD:bankSpace", modValue:2, isPercent:false, isNotable:false },
  { id:"eC7", label:"+2% item sale value", alias:"Item Value", desc:"+2% item sale value", branch:"economy", tier:8, cost:30, x:835, y:2165, modId:"melvorD:itemSaleCurrencyGain", modValue:2, isPercent:true, isNotable:false },
  { id:"eC8", label:"+3 bank slots", alias:"Bank Slots", desc:"+3 bank slots", branch:"economy", tier:9, cost:30, x:750, y:2250, modId:"melvorD:bankSpace", modValue:3, isPercent:false, isNotable:false },
  { id:"eCC", label:"+5% item sale value", alias:"Value&Bank", desc:"+5% item sale value", branch:"economy", tier:10, cost:40, x:651, y:2349, modId:"melvorD:itemSaleCurrencyGain", modValue:5, isPercent:true, isNotable:false },
  { id:"eD1", label:"+1 bank slots", alias:"Bank Slots", desc:"+1 bank slots", branch:"economy", tier:2, cost:3, x:1322, y:1629, modId:"melvorD:bankSpace", modValue:1, isPercent:false, isNotable:false },
  { id:"eD2", label:"+0.5% rune preservation", alias:"Rune Pres", desc:"+0.5% rune preservation", branch:"economy", tier:3, cost:6, x:1225, y:1700, modId:"melvorD:runePreservationChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"eD3", label:"+2 bank slots", alias:"Bank Slots", desc:"+2 bank slots", branch:"economy", tier:4, cost:10, x:1128, y:1770, modId:"melvorD:bankSpace", modValue:2, isPercent:false, isNotable:false },
  { id:"eD4", label:"+1% rune preservation", alias:"Rune Pres", desc:"+1% rune preservation", branch:"economy", tier:5, cost:15, x:1031, y:1841, modId:"melvorD:runePreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"eD5", label:"+2 bank slots", alias:"Bank Slots", desc:"+2 bank slots", branch:"economy", tier:6, cost:20, x:934, y:1911, modId:"melvorD:bankSpace", modValue:2, isPercent:false, isNotable:false },
  { id:"eD6", label:"+1% rune preservation", alias:"Rune Pres", desc:"+1% rune preservation", branch:"economy", tier:7, cost:25, x:837, y:1982, modId:"melvorD:runePreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"eD7", label:"+3 bank slots", alias:"Bank Slots", desc:"+3 bank slots", branch:"economy", tier:8, cost:30, x:740, y:2053, modId:"melvorD:bankSpace", modValue:3, isPercent:false, isNotable:false },
  { id:"eD8", label:"+2% rune preservation", alias:"Rune Pres", desc:"+2% rune preservation", branch:"economy", tier:9, cost:30, x:642, y:2123, modId:"melvorD:runePreservationChance", modValue:2, isPercent:true, isNotable:false },
  { id:"eCD", label:"+6 bank slots", alias:"Bank&Runes", desc:"+6 bank slots", branch:"economy", tier:10, cost:40, x:529, y:2205, modId:"melvorD:bankSpace", modValue:6, isPercent:false, isNotable:false },
  { id:"eE1", label:"+0.5% rune preservation", alias:"Rune Pres", desc:"+0.5% rune preservation", branch:"economy", tier:2, cost:3, x:1304, y:1600, modId:"melvorD:runePreservationChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"eE2", label:"+0.5% ammo preservation", alias:"Ammo Pres", desc:"+0.5% ammo preservation", branch:"economy", tier:3, cost:6, x:1197, y:1654, modId:"melvorD:ammoPreservationChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"eE3", label:"+1% rune preservation", alias:"Rune Pres", desc:"+1% rune preservation", branch:"economy", tier:4, cost:10, x:1090, y:1709, modId:"melvorD:runePreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"eE4", label:"+1% ammo preservation", alias:"Ammo Pres", desc:"+1% ammo preservation", branch:"economy", tier:5, cost:15, x:983, y:1763, modId:"melvorD:ammoPreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"eE5", label:"+2% rune preservation", alias:"Rune Pres", desc:"+2% rune preservation", branch:"economy", tier:6, cost:20, x:876, y:1818, modId:"melvorD:runePreservationChance", modValue:2, isPercent:true, isNotable:false },
  { id:"eE6", label:"+1% ammo preservation", alias:"Ammo Pres", desc:"+1% ammo preservation", branch:"economy", tier:7, cost:25, x:769, y:1872, modId:"melvorD:ammoPreservationChance", modValue:1, isPercent:true, isNotable:false },
  { id:"eE7", label:"+2% rune preservation", alias:"Rune Pres", desc:"+2% rune preservation", branch:"economy", tier:8, cost:30, x:662, y:1927, modId:"melvorD:runePreservationChance", modValue:2, isPercent:true, isNotable:false },
  { id:"eE8", label:"+2% ammo preservation", alias:"Ammo Pres", desc:"+2% ammo preservation", branch:"economy", tier:9, cost:30, x:556, y:1981, modId:"melvorD:ammoPreservationChance", modValue:2, isPercent:true, isNotable:false },
  { id:"eCE", label:"+5% rune preservation", alias:"Preservation", desc:"+5% rune preservation", branch:"economy", tier:10, cost:40, x:431, y:2045, modId:"melvorD:runePreservationChance", modValue:5, isPercent:true, isNotable:false },
  { id:"eN1", label:"Merch. Prince", alias:"Merch.Prince", desc:"+12% GP. +8% item value.", branch:"economy", tier:11, cost:60, x:538, y:2462, modId:"melvorD:currencyGainFromMonsterDrops", modValue:12, isPercent:true, isNotable:true },
  { id:"eN2", label:"Alch. Touch", alias:"Alch.Touch", desc:"+18% item value. +8% GP.", branch:"economy", tier:11, cost:50, x:753, y:2637, modId:"melvorD:itemSaleCurrencyGain", modValue:18, isPercent:true, isNotable:true },
  { id:"eN3", label:"Hoarder", alias:"Hoarder", desc:"+12 bank slots. +8% ammo pres.", branch:"economy", tier:11, cost:50, x:363, y:2247, modId:"melvorD:bankSpace", modValue:12, isPercent:false, isNotable:true },
  { id:"eN4", label:"Gold Rush", alias:"Gold Rush", desc:"+12% GP slayer. +8% item value.", branch:"economy", tier:11, cost:42, x:999, y:2764, modId:"melvorD:currencyGainFromSlayerTaskMonsterDrops", modValue:12, isPercent:true, isNotable:true },
  { id:"eN5", label:"Vault Keeper", alias:"Vault Keeper", desc:"+10 bank slots. +5% rune pres.", branch:"economy", tier:11, cost:42, x:236, y:2001, modId:"melvorD:bankSpace", modValue:10, isPercent:false, isNotable:true },
  { id:"eN6", label:"Trade Baron", alias:"Trade Baron", desc:"+10% item value. +10% GP.", branch:"economy", tier:11, cost:48, x:864, y:2702, modId:"melvorD:itemSaleCurrencyGain", modValue:10, isPercent:true, isNotable:true },
  { id:"eN7", label:"Archivist", alias:"Archivist", desc:"+8 bank slots. +6% rune & ammo pres.", branch:"economy", tier:11, cost:48, x:298, y:2136, modId:"melvorD:bankSpace", modValue:8, isPercent:false, isNotable:true },
  { id:"xGPp1", label:"+0.5% XP for all skills", alias:"Skill XP", desc:"+0.5% XP for all skills", branch:"cross", tier:3, cost:3, x:1500, y:1220, modId:"melvorD:skillXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xGPp2", label:"+0.5% Mastery XP", alias:"Mastery XP", desc:"+0.5% Mastery XP", branch:"cross", tier:4, cost:4, x:1500, y:1120, modId:"melvorD:masteryXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xGPp3", label:"+0.5% skill item doubling chance", alias:"Item Dbl", desc:"+0.5% skill item doubling chance", branch:"cross", tier:5, cost:5, x:1500, y:1030, modId:"melvorD:skillItemDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xGPp4", label:"GP Synergy", alias:"GP Synergy", desc:"+4% XP for all skills", branch:"cross", tier:6, cost:22, x:1500, y:930, modId:"melvorD:skillXP", modValue:4, isPercent:true, isNotable:true },
  { id:"xGPp5", label:"+1% Mastery XP", alias:"Mastery XP", desc:"+1% Mastery XP", branch:"cross", tier:7, cost:5, x:1500, y:840, modId:"melvorD:masteryXP", modValue:1, isPercent:true, isNotable:false },
  { id:"xGPp6", label:"+1% XP for all skills", alias:"Skill XP", desc:"+1% XP for all skills", branch:"cross", tier:8, cost:6, x:1500, y:750, modId:"melvorD:skillXP", modValue:1, isPercent:true, isNotable:false },
  { id:"xGPp7", label:"+1% skill item doubling chance", alias:"Item Dbl", desc:"+1% skill item doubling chance", branch:"cross", tier:9, cost:8, x:1500, y:660, modId:"melvorD:skillItemDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"xGPp8", label:"Mastery Syn.", alias:"Mastery Syn.", desc:"+6% Mastery XP", branch:"cross", tier:10, cost:28, x:1500, y:560, modId:"melvorD:masteryXP", modValue:6, isPercent:true, isNotable:true },
  { id:"xPCp1", label:"+0.5% skill item doubling chance", alias:"Output Dbl", desc:"+0.5% skill item doubling chance", branch:"cross", tier:3, cost:3, x:1780, y:1500, modId:"melvorD:skillItemDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xPCp2", label:"+0.5% combat loot doubling", alias:"Loot Dbl", desc:"+0.5% combat loot doubling", branch:"cross", tier:4, cost:4, x:1880, y:1500, modId:"melvorD:combatLootDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xPCp3", label:"+0.5% Mastery XP", alias:"Mastery XP", desc:"+0.5% Mastery XP", branch:"cross", tier:5, cost:5, x:1970, y:1500, modId:"melvorD:masteryXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xPCp4", label:"Craft Synergy", alias:"Craft Synergy", desc:"+4% skill item doubling chance", branch:"cross", tier:6, cost:22, x:2070, y:1500, modId:"melvorD:skillItemDoublingChance", modValue:4, isPercent:true, isNotable:true },
  { id:"xPCp5", label:"+1% damage to all monsters", alias:"Monster Dmg", desc:"+1% damage to all monsters", branch:"cross", tier:7, cost:5, x:2160, y:1500, modId:"melvorD:damageDealtToAllMonsters", modValue:1, isPercent:true, isNotable:false },
  { id:"xPCp6", label:"+1% combat loot doubling", alias:"Loot Dbl", desc:"+1% combat loot doubling", branch:"cross", tier:8, cost:6, x:2250, y:1500, modId:"melvorD:combatLootDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"xPCp7", label:"+1% Mastery XP", alias:"Mastery XP", desc:"+1% Mastery XP", branch:"cross", tier:9, cost:8, x:2340, y:1500, modId:"melvorD:masteryXP", modValue:1, isPercent:true, isNotable:false },
  { id:"xPCp8", label:"Combat Syn.", alias:"Combat Syn.", desc:"+4% combat loot doubling", branch:"cross", tier:10, cost:28, x:2440, y:1500, modId:"melvorD:combatLootDoublingChance", modValue:4, isPercent:true, isNotable:true },
  { id:"xCEp1", label:"+0.5% combat loot doubling", alias:"Loot Dbl", desc:"+0.5% combat loot doubling", branch:"cross", tier:3, cost:3, x:1500, y:1780, modId:"melvorD:combatLootDoublingChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xCEp2", label:"+0.5% GP from monster drops", alias:"GP", desc:"+0.5% GP from monster drops", branch:"cross", tier:4, cost:4, x:1500, y:1880, modId:"melvorD:currencyGainFromMonsterDrops", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xCEp3", label:"+0.5% damage to all monsters", alias:"Monster Dmg", desc:"+0.5% damage to all monsters", branch:"cross", tier:5, cost:5, x:1500, y:1970, modId:"melvorD:damageDealtToAllMonsters", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xCEp4", label:"War Synergy", alias:"War Synergy", desc:"+4% damage to all monsters", branch:"cross", tier:6, cost:22, x:1500, y:2070, modId:"melvorD:damageDealtToAllMonsters", modValue:4, isPercent:true, isNotable:true },
  { id:"xCEp5", label:"+1% item sale value", alias:"Item Value", desc:"+1% item sale value", branch:"cross", tier:7, cost:5, x:1500, y:2160, modId:"melvorD:itemSaleCurrencyGain", modValue:1, isPercent:true, isNotable:false },
  { id:"xCEp6", label:"+1% combat loot doubling", alias:"Loot Dbl", desc:"+1% combat loot doubling", branch:"cross", tier:8, cost:6, x:1500, y:2250, modId:"melvorD:combatLootDoublingChance", modValue:1, isPercent:true, isNotable:false },
  { id:"xCEp7", label:"+1% GP from monster drops", alias:"GP", desc:"+1% GP from monster drops", branch:"cross", tier:9, cost:8, x:1500, y:2340, modId:"melvorD:currencyGainFromMonsterDrops", modValue:1, isPercent:true, isNotable:false },
  { id:"xCEp8", label:"Wealth Syn.", alias:"Wealth Syn.", desc:"+5% GP from monster drops", branch:"cross", tier:10, cost:28, x:1500, y:2440, modId:"melvorD:currencyGainFromMonsterDrops", modValue:5, isPercent:true, isNotable:true },
  { id:"xEGp1", label:"+0.5% GP from monster drops", alias:"GP", desc:"+0.5% GP from monster drops", branch:"cross", tier:3, cost:3, x:1220, y:1500, modId:"melvorD:currencyGainFromMonsterDrops", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xEGp2", label:"+0.5% XP for all skills", alias:"Skill XP", desc:"+0.5% XP for all skills", branch:"cross", tier:4, cost:4, x:1120, y:1500, modId:"melvorD:skillXP", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xEGp3", label:"+0.5% gem find chance", alias:"Gem Chance", desc:"+0.5% gem find chance", branch:"cross", tier:5, cost:5, x:1030, y:1500, modId:"melvorD:miningGemChance", modValue:0.5, isPercent:true, isNotable:false },
  { id:"xEGp4", label:"Trade Synergy", alias:"Trade Synergy", desc:"+4% item sale value", branch:"cross", tier:6, cost:22, x:930, y:1500, modId:"melvorD:itemSaleCurrencyGain", modValue:4, isPercent:true, isNotable:true },
  { id:"xEGp5", label:"+1% Rare Drop", alias:"Rare Drop", desc:"+1% rare item find chance", branch:"cross", tier:7, cost:5, x:840, y:1500, modId:"melvorD:additionalRandomSkillItemChance", modValue:1, isPercent:true, isNotable:false },
  { id:"xEGp6", label:"+1% gem find chance", alias:"Gem Chance", desc:"+1% gem find chance", branch:"cross", tier:8, cost:6, x:750, y:1500, modId:"melvorD:miningGemChance", modValue:1, isPercent:true, isNotable:false },
  { id:"xEGp7", label:"+1% XP for all skills", alias:"Skill XP", desc:"+1% XP for all skills", branch:"cross", tier:9, cost:8, x:660, y:1500, modId:"melvorD:skillXP", modValue:1, isPercent:true, isNotable:false },
  { id:"xEGp8", label:"Fortune Syn.", alias:"Fortune Syn.", desc:"+5% item sale value", branch:"cross", tier:10, cost:28, x:560, y:1500, modId:"melvorD:itemSaleCurrencyGain", modValue:5, isPercent:true, isNotable:true },
];

export const TREE_EDGES = [
  ["hub", "g0"],
  ["hub", "p0"],
  ["hub", "c0"],
  ["hub", "e0"],
  ["g0", "gC1"],
  ["gC1", "gB1"],
  ["gB1", "gA1"],
  ["gC1", "gD1"],
  ["gD1", "gE1"],
  ["gA1", "gA2"],
  ["gA2", "gA3"],
  ["gA3", "gA4"],
  ["gA4", "gA5"],
  ["gA5", "gA6"],
  ["gA6", "gA7"],
  ["gA7", "gA8"],
  ["gA8", "gCA"],
  ["gB1", "gB2"],
  ["gB2", "gB3"],
  ["gB3", "gB4"],
  ["gB4", "gB5"],
  ["gB5", "gB6"],
  ["gB6", "gB7"],
  ["gB7", "gB8"],
  ["gB8", "gCB"],
  ["gC1", "gC2"],
  ["gC2", "gC3"],
  ["gC3", "gC4"],
  ["gC4", "gC5"],
  ["gC5", "gC6"],
  ["gC6", "gC7"],
  ["gC7", "gC8"],
  ["gC8", "gCC"],
  ["gD1", "gD2"],
  ["gD2", "gD3"],
  ["gD3", "gD4"],
  ["gD4", "gD5"],
  ["gD5", "gD6"],
  ["gD6", "gD7"],
  ["gD7", "gD8"],
  ["gD8", "gCD"],
  ["gE1", "gE2"],
  ["gE2", "gE3"],
  ["gE3", "gE4"],
  ["gE4", "gE5"],
  ["gE5", "gE6"],
  ["gE6", "gE7"],
  ["gE7", "gE8"],
  ["gE8", "gCE"],
  ["gA4", "gB4"],
  ["gB4", "gC4"],
  ["gC4", "gD4"],
  ["gD4", "gE4"],
  ["gA6", "gB6"],
  ["gB6", "gC6"],
  ["gC6", "gD6"],
  ["gD6", "gE6"],
  ["gA8", "gB8"],
  ["gB8", "gC8"],
  ["gC8", "gD8"],
  ["gD8", "gE8"],
  ["gCA", "gCB"],
  ["gCB", "gCC"],
  ["gCC", "gCD"],
  ["gCD", "gCE"],
  ["gCA", "gN6"],
  ["gCB", "gN2"],
  ["gCC", "gN1"],
  ["gCD", "gN3"],
  ["gCE", "gN7"],
  ["p0", "pC1"],
  ["pC1", "pB1"],
  ["pB1", "pA1"],
  ["pC1", "pD1"],
  ["pD1", "pE1"],
  ["pA1", "pA2"],
  ["pA2", "pA3"],
  ["pA3", "pA4"],
  ["pA4", "pA5"],
  ["pA5", "pA6"],
  ["pA6", "pA7"],
  ["pA7", "pA8"],
  ["pA8", "pCA"],
  ["pB1", "pB2"],
  ["pB2", "pB3"],
  ["pB3", "pB4"],
  ["pB4", "pB5"],
  ["pB5", "pB6"],
  ["pB6", "pB7"],
  ["pB7", "pB8"],
  ["pB8", "pCB"],
  ["pC1", "pC2"],
  ["pC2", "pC3"],
  ["pC3", "pC4"],
  ["pC4", "pC5"],
  ["pC5", "pC6"],
  ["pC6", "pC7"],
  ["pC7", "pC8"],
  ["pC8", "pCC"],
  ["pD1", "pD2"],
  ["pD2", "pD3"],
  ["pD3", "pD4"],
  ["pD4", "pD5"],
  ["pD5", "pD6"],
  ["pD6", "pD7"],
  ["pD7", "pD8"],
  ["pD8", "pCD"],
  ["pE1", "pE2"],
  ["pE2", "pE3"],
  ["pE3", "pE4"],
  ["pE4", "pE5"],
  ["pE5", "pE6"],
  ["pE6", "pE7"],
  ["pE7", "pE8"],
  ["pE8", "pCE"],
  ["pA4", "pB4"],
  ["pB4", "pC4"],
  ["pC4", "pD4"],
  ["pD4", "pE4"],
  ["pA6", "pB6"],
  ["pB6", "pC6"],
  ["pC6", "pD6"],
  ["pD6", "pE6"],
  ["pA8", "pB8"],
  ["pB8", "pC8"],
  ["pC8", "pD8"],
  ["pD8", "pE8"],
  ["pCA", "pCB"],
  ["pCB", "pCC"],
  ["pCC", "pCD"],
  ["pCD", "pCE"],
  ["pCA", "pN6"],
  ["pCB", "pN2"],
  ["pCC", "pN1"],
  ["pCD", "pN3"],
  ["pCE", "pN7"],
  ["c0", "cC1"],
  ["cC1", "cB1"],
  ["cB1", "cA1"],
  ["cC1", "cD1"],
  ["cD1", "cE1"],
  ["cA1", "cA2"],
  ["cA2", "cA3"],
  ["cA3", "cA4"],
  ["cA4", "cA5"],
  ["cA5", "cA6"],
  ["cA6", "cA7"],
  ["cA7", "cA8"],
  ["cA8", "cCA"],
  ["cB1", "cB2"],
  ["cB2", "cB3"],
  ["cB3", "cB4"],
  ["cB4", "cB5"],
  ["cB5", "cB6"],
  ["cB6", "cB7"],
  ["cB7", "cB8"],
  ["cB8", "cCB"],
  ["cC1", "cC2"],
  ["cC2", "cC3"],
  ["cC3", "cC4"],
  ["cC4", "cC5"],
  ["cC5", "cC6"],
  ["cC6", "cC7"],
  ["cC7", "cC8"],
  ["cC8", "cCC"],
  ["cD1", "cD2"],
  ["cD2", "cD3"],
  ["cD3", "cD4"],
  ["cD4", "cD5"],
  ["cD5", "cD6"],
  ["cD6", "cD7"],
  ["cD7", "cD8"],
  ["cD8", "cCD"],
  ["cE1", "cE2"],
  ["cE2", "cE3"],
  ["cE3", "cE4"],
  ["cE4", "cE5"],
  ["cE5", "cE6"],
  ["cE6", "cE7"],
  ["cE7", "cE8"],
  ["cE8", "cCE"],
  ["cA4", "cB4"],
  ["cB4", "cC4"],
  ["cC4", "cD4"],
  ["cD4", "cE4"],
  ["cA6", "cB6"],
  ["cB6", "cC6"],
  ["cC6", "cD6"],
  ["cD6", "cE6"],
  ["cA8", "cB8"],
  ["cB8", "cC8"],
  ["cC8", "cD8"],
  ["cD8", "cE8"],
  ["cCA", "cCB"],
  ["cCB", "cCC"],
  ["cCC", "cCD"],
  ["cCD", "cCE"],
  ["cCA", "cN6"],
  ["cCB", "cN2"],
  ["cCC", "cN1"],
  ["cCD", "cN3"],
  ["cCE", "cN7"],
  ["e0", "eC1"],
  ["eC1", "eB1"],
  ["eB1", "eA1"],
  ["eC1", "eD1"],
  ["eD1", "eE1"],
  ["eA1", "eA2"],
  ["eA2", "eA3"],
  ["eA3", "eA4"],
  ["eA4", "eA5"],
  ["eA5", "eA6"],
  ["eA6", "eA7"],
  ["eA7", "eA8"],
  ["eA8", "eCA"],
  ["eB1", "eB2"],
  ["eB2", "eB3"],
  ["eB3", "eB4"],
  ["eB4", "eB5"],
  ["eB5", "eB6"],
  ["eB6", "eB7"],
  ["eB7", "eB8"],
  ["eB8", "eCB"],
  ["eC1", "eC2"],
  ["eC2", "eC3"],
  ["eC3", "eC4"],
  ["eC4", "eC5"],
  ["eC5", "eC6"],
  ["eC6", "eC7"],
  ["eC7", "eC8"],
  ["eC8", "eCC"],
  ["eD1", "eD2"],
  ["eD2", "eD3"],
  ["eD3", "eD4"],
  ["eD4", "eD5"],
  ["eD5", "eD6"],
  ["eD6", "eD7"],
  ["eD7", "eD8"],
  ["eD8", "eCD"],
  ["eE1", "eE2"],
  ["eE2", "eE3"],
  ["eE3", "eE4"],
  ["eE4", "eE5"],
  ["eE5", "eE6"],
  ["eE6", "eE7"],
  ["eE7", "eE8"],
  ["eE8", "eCE"],
  ["eA4", "eB4"],
  ["eB4", "eC4"],
  ["eC4", "eD4"],
  ["eD4", "eE4"],
  ["eA6", "eB6"],
  ["eB6", "eC6"],
  ["eC6", "eD6"],
  ["eD6", "eE6"],
  ["eA8", "eB8"],
  ["eB8", "eC8"],
  ["eC8", "eD8"],
  ["eD8", "eE8"],
  ["eCA", "eCB"],
  ["eCB", "eCC"],
  ["eCC", "eCD"],
  ["eCD", "eCE"],
  ["eCA", "eN6"],
  ["eCB", "eN2"],
  ["eCC", "eN1"],
  ["eCD", "eN3"],
  ["eCE", "eN7"],
  ["xGPp1", "gE2"],
  ["xGPp1", "pA2"],
  ["xGPp1", "xGPp2"],
  ["xGPp2", "gE3"],
  ["xGPp2", "pA3"],
  ["xGPp2", "xGPp3"],
  ["xGPp3", "gE4"],
  ["xGPp3", "pA4"],
  ["xGPp3", "xGPp4"],
  ["xGPp4", "gE5"],
  ["xGPp4", "pA5"],
  ["xGPp4", "xGPp5"],
  ["xGPp5", "gE6"],
  ["xGPp5", "pA6"],
  ["xGPp5", "xGPp6"],
  ["xGPp6", "gE7"],
  ["xGPp6", "pA7"],
  ["xGPp6", "xGPp7"],
  ["xGPp7", "gE8"],
  ["xGPp7", "pA8"],
  ["xGPp7", "xGPp8"],
  ["xPCp1", "pE2"],
  ["xPCp1", "cA2"],
  ["xPCp1", "xPCp2"],
  ["xPCp2", "pE3"],
  ["xPCp2", "cA3"],
  ["xPCp2", "xPCp3"],
  ["xPCp3", "pE4"],
  ["xPCp3", "cA4"],
  ["xPCp3", "xPCp4"],
  ["xPCp4", "pE5"],
  ["xPCp4", "cA5"],
  ["xPCp4", "xPCp5"],
  ["xPCp5", "pE6"],
  ["xPCp5", "cA6"],
  ["xPCp5", "xPCp6"],
  ["xPCp6", "pE7"],
  ["xPCp6", "cA7"],
  ["xPCp6", "xPCp7"],
  ["xPCp7", "pE8"],
  ["xPCp7", "cA8"],
  ["xPCp7", "xPCp8"],
  ["xCEp1", "cE2"],
  ["xCEp1", "eA2"],
  ["xCEp1", "xCEp2"],
  ["xCEp2", "cE3"],
  ["xCEp2", "eA3"],
  ["xCEp2", "xCEp3"],
  ["xCEp3", "cE4"],
  ["xCEp3", "eA4"],
  ["xCEp3", "xCEp4"],
  ["xCEp4", "cE5"],
  ["xCEp4", "eA5"],
  ["xCEp4", "xCEp5"],
  ["xCEp5", "cE6"],
  ["xCEp5", "eA6"],
  ["xCEp5", "xCEp6"],
  ["xCEp6", "cE7"],
  ["xCEp6", "eA7"],
  ["xCEp6", "xCEp7"],
  ["xCEp7", "cE8"],
  ["xCEp7", "eA8"],
  ["xCEp7", "xCEp8"],
  ["xEGp1", "eE2"],
  ["xEGp1", "gA2"],
  ["xEGp1", "xEGp2"],
  ["xEGp2", "eE3"],
  ["xEGp2", "gA3"],
  ["xEGp2", "xEGp3"],
  ["xEGp3", "eE4"],
  ["xEGp3", "gA4"],
  ["xEGp3", "xEGp4"],
  ["xEGp4", "eE5"],
  ["xEGp4", "gA5"],
  ["xEGp4", "xEGp5"],
  ["xEGp5", "eE6"],
  ["xEGp5", "gA6"],
  ["xEGp5", "xEGp6"],
  ["xEGp6", "eE7"],
  ["xEGp6", "gA7"],
  ["xEGp6", "xEGp7"],
  ["xEGp7", "eE8"],
  ["xEGp7", "gA8"],
  ["xEGp7", "xEGp8"],
];


const BRANCH_COLORS = {
  hub:        { fill:'#f0c040', stroke:'#b8940a' },
  gathering:  { fill:'#22c55e', stroke:'#16a34a' },
  production: { fill:'#f97316', stroke:'#ea580c' },
  combat:     { fill:'#ef4444', stroke:'#dc2626' },
  economy:    { fill:'#eab308', stroke:'#ca8a04' },
  cross:      { fill:'#a855f7', stroke:'#7c3aed' },
};
const BRANCH_NAMES = {gathering:'Gathering',production:'Production',combat:'Combat',economy:'Economy',cross:'Cross-branch',hub:'Core'};

// Adjacency map built from TREE_EDGES for fast lookup
let _adjMap = null;
function getAdjMap() {
  if (_adjMap) return _adjMap;
  _adjMap = {};
  TREE_EDGES.forEach(([a,b])=>{
    if (!_adjMap[a]) _adjMap[a]=[];
    if (!_adjMap[b]) _adjMap[b]=[];
    _adjMap[a].push(b);
    _adjMap[b].push(a);
  });
  return _adjMap;
}


// ─── Storage ──────────────────────────────────────────────────────────────────
function loadTreeData() {
  try { const r=_ctx.characterStorage.getItem(STORAGE_KEY); if(r) return JSON.parse(r); } catch(e) {}
  return { allocated:[], globalPoints:0 };
}
function saveTreeData(d) { try { _ctx.characterStorage.setItem(STORAGE_KEY,JSON.stringify(d)); } catch(e) {} }
export function getTreeData() { return loadTreeData(); }
export function addGlobalPrestigePoint() { syncPoints(); updateTreeSidebar(); }
export function getGlobalPoints() {
  const d=loadTreeData();
  const spent=(d.allocated??[]).reduce((s,id)=>{ const n=TREE_NODES.find(x=>x.id===id); return s+(n?.cost??0); },0);
  return { total:d.globalPoints??0, spent, available:(d.globalPoints??0)-spent };
}
function syncPoints() {
  if(!_deps||!_ctx) return;
  try {
    const d=loadTreeData();
    let total=0;
    [...(_deps.skillsM?.SKILLS??[]),...(_deps.combatM?.COMBAT_SKILLS??[])].forEach(s=>{
      try { total+=_deps.stateM.getState(s.id)?.prestigeCount??0; } catch(e) {}
    });
    if(total>(d.globalPoints??0)){ d.globalPoints=total; saveTreeData(d); }
  } catch(e) {}
}
const TREE_SOURCE = { id:'global-tree', name:'Prestige Tree' };

export function applyTreeModifiers() {
  try {
    const d=loadTreeData();
    const player=game.combat?.player;
    if(!player?.modifiers) return;
    player.modifiers.removeModifiers(TREE_SOURCE);
    const merged={};
    (d.allocated??[]).forEach(id=>{
      const node=TREE_NODES.find(n=>n.id===id);
      if(!node?.modId) return;
      merged[node.modId]=(merged[node.modId]??0)+node.modValue;
    });
    Object.entries(merged).forEach(([modId,value])=>{
      try {
        const mod=game.modifierRegistry?.getObjectByID(modId);
        if(!mod) return;
        player.modifiers.addModifier(TREE_SOURCE,new ModifierValue(mod,value,{}),1,1);
      } catch(e) {}
    });
    // Force immediate stat recalc so HP and other stats update without waiting for a tick
    if (!applyTreeModifiers._computing) {
      applyTreeModifiers._computing = true;
      try {
        const prevMax = player.stats?.maxHitpoints ?? player.hitpoints;
        const wasAtMax = player.hitpoints >= prevMax;
        player.computeMaxHP?.();
        player.computePostModifierStats?.();
        // If player was at full HP before, top them up to the new max
        if (wasAtMax && player.stats?.maxHitpoints != null)
          player.hitpoints = player.stats.maxHitpoints;
        player.renderStats?.();
        game.combat?.renderCombat?.();
      } catch(e) {}
      applyTreeModifiers._computing = false;
    }
  } catch(e) {}
}
export function getRespecCost(spent) { return Math.floor(1000*spent*(1+spent*0.1)); }

// ─── Init ─────────────────────────────────────────────────────────────────────
export function initGlobalTree(deps,ctx) {
  _deps=deps; _ctx=ctx;
  syncPoints();
  const d=loadTreeData();
  // Auto-allocate hub only — gateways must be purchased
  if(!(d.allocated??[]).includes('hub')){
    d.allocated=[...(d.allocated??[]),'hub'];
    saveTreeData(d);
  }
  injectSidebarEntry();
  applyTreeModifiers();
}
function injectSidebarEntry() {
  const check=setInterval(()=>{
    const items=sidebar?.category?.('Non-Combat')?.items?.();
    if(!items?.length) return;
    clearInterval(check);
    if(document.getElementById('sp-tree-li')) return;
    const firstItem=sidebar.category('Non-Combat').item(items[0].id).itemEl;
    const ul=firstItem?.closest('ul')??firstItem?.parentElement;
    if(!ul) return;
    const {available}=getGlobalPoints();
    const li=document.createElement('li');
    li.id='sp-tree-li';
    li.innerHTML=`<a style="display:flex;align-items:center;gap:8px;padding:6px 12px;cursor:pointer;background:linear-gradient(90deg,#1a0a2e,transparent);border-left:3px solid #f0c040;text-decoration:none">
      <span style="color:#f0c040">&#9733;</span>
      <span style="color:#f0c040;font-weight:bold;font-size:0.85em">Prestige Tree</span>
      <span id="sp-tree-aside" style="margin-left:auto;color:#f0c04080;font-size:0.75em">${available} pts</span>
    </a>`;
    li.querySelector('a').addEventListener('click',showTreePage);
    ul.insertBefore(li,ul.firstChild);
  },700);
}
export function updateTreeSidebar() {
  const {available}=getGlobalPoints();
  const el=document.getElementById('sp-tree-aside');
  if(el) el.textContent=available+' pts';
}

// ─── Tree page ────────────────────────────────────────────────────────────────
export function showTreePage() {
  document.getElementById('sp-tree-page')?.remove();
  const page=document.createElement('div');
  page.id='sp-tree-page';
  page.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;overflow:hidden;background:#070510';
  page.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;padding:8px 14px;background:#0d0a1a;border-bottom:1px solid #f0c04040;flex-shrink:0">
      <button id="sp-tb" style="background:#ffffff15;border:1px solid #ffffff30;color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.85em">&#8592; Back</button>
      <span style="color:#f0c040;font-weight:bold">&#9733; Global Prestige Tree</span>
      <span style="color:#ffffff40;font-size:0.78em">Scroll to zoom &middot; Drag to pan &middot; Click to stage</span>
      <div id="sp-pending-bar" style="margin-left:auto;display:none;align-items:center;gap:8px">
        <span id="sp-pending-cost" style="color:#f0c040;font-size:0.85em"></span>
        <button id="sp-confirm" style="background:linear-gradient(135deg,#16a34a,#22c55e);border:none;color:#fff;border-radius:6px;padding:4px 12px;cursor:pointer;font-weight:bold;font-size:0.85em">Confirm</button>
        <button id="sp-cancel-p" style="background:#ff444420;border:1px solid #ff444440;color:#f87171;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.85em">Cancel</button>
      </div>
      <span id="sp-tree-pts" style="color:#f0c040;font-size:0.85em"></span>
      <button id="sp-tr" style="background:#ff444420;border:1px solid #ff444440;color:#f87171;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.85em">Respec</button>
    </div>
    <div style="display:flex;flex:1;min-height:0;overflow:hidden">
      <canvas id="sp-tc" style="flex:1;cursor:grab;touch-action:none;min-width:0"></canvas>
      <div id="sp-tp" style="width:245px;flex-shrink:0;overflow-y:auto;background:#0d0a1a;border-left:1px solid #f0c04020;padding:10px;box-sizing:border-box"></div>
    </div>
    <div id="sp-tt" style="position:fixed;display:none;background:#1a1230;border:1px solid #f0c04080;border-radius:8px;padding:10px 12px;pointer-events:none;z-index:10000;max-width:210px;font-size:0.8em;line-height:1.5"></div>`;
  document.body.appendChild(page);
  document.getElementById('sp-tb').addEventListener('click',()=>page.remove());
  document.getElementById('sp-tr').addEventListener('click',doRespec);
  document.getElementById('sp-confirm').addEventListener('click',confirmPending);
  document.getElementById('sp-cancel-p').addEventListener('click',cancelPending);
  initCanvas();
  renderPanel();
}

// ─── Canvas ───────────────────────────────────────────────────────────────────
let _cv,_cx,_pan={x:0,y:0},_zoom=0.38;
let _drag=false,_ds=null,_ps=null,_hov=null,_dat=null;
let _pending=[];

function npos(n) { return {x:n.x*_zoom+_pan.x, y:n.y*_zoom+_pan.y}; }
function nrad(n) {
  if(n.id==='hub') return 20*_zoom;
  if(n.isNotable)  return 14*_zoom;
  return 7*_zoom;
}
function edgePt(from,to,r) {
  const dx=to.x-from.x,dy=to.y-from.y,d=Math.sqrt(dx*dx+dy*dy)||1;
  return {x:from.x+dx/d*r,y:from.y+dy/d*r};
}
function isAlloc(id) { return (_dat?.allocated??[]).includes(id); }
function isPending(id) { return _pending.includes(id); }
function isAllocOrPending(id) { return isAlloc(id)||isPending(id); }
// A node is available if it's adjacent to any allocated/pending node
function isAvail(id) {
  if(!_dat) return false;
  if(id==='hub') return true;
  if(isAllocOrPending(id)) return true;
  const adj=getAdjMap()[id]??[];
  return adj.some(r=>isAllocOrPending(r));
}
function pendingCost() {
  return _pending.reduce((s,id)=>{ const n=TREE_NODES.find(x=>x.id===id); return s+(n?.cost??0); },0);
}

function initCanvas() {
  _cv=document.getElementById('sp-tc');
  _cx=_cv.getContext('2d');
  _dat=loadTreeData();
  _pending=[];
  _adjMap=null; // reset adjacency cache
  const resize=()=>{
    const w=_cv.offsetWidth||(_cv.parentElement?.offsetWidth-245)||800;
    const h=_cv.offsetHeight||(window.innerHeight-48)||600;
    _cv.width=w; _cv.height=h;
    _pan.x=w/2-1500*_zoom;
    _pan.y=h/2-1500*_zoom;
    draw();
  };
  setTimeout(resize,20); setTimeout(resize,100); setTimeout(resize,300);
  new ResizeObserver(resize).observe(_cv);
  _cv.addEventListener('mousedown',e=>{_ds={x:e.clientX,y:e.clientY};_ps={..._pan};_drag=false;_cv.style.cursor='grabbing';});
  _cv.addEventListener('mousemove',onMove);
  _cv.addEventListener('mouseup',()=>{_ds=null;_cv.style.cursor='grab';});
  _cv.addEventListener('mouseleave',()=>{_ds=null;_hov=null;hideT();draw();});
  _cv.addEventListener('wheel',onWheel,{passive:false});
  _cv.addEventListener('click',onClick);
}

function draw() {
  if(!_cv||!_cx) return;
  const ctx=_cx;
  ctx.clearRect(0,0,_cv.width,_cv.height);
  ctx.fillStyle='#070510'; ctx.fillRect(0,0,_cv.width,_cv.height);

  // Branch glows
  [{cx:780,cy:780,col:'#22c55e'},{cx:2220,cy:780,col:'#f97316'},
   {cx:2220,cy:2220,col:'#ef4444'},{cx:780,cy:2220,col:'#eab308'}].forEach(g=>{
    const sx=g.cx*_zoom+_pan.x,sy=g.cy*_zoom+_pan.y,sr=870*_zoom;
    const grad=ctx.createRadialGradient(sx,sy,20*_zoom,sx,sy,sr);
    grad.addColorStop(0,g.col+'22'); grad.addColorStop(1,g.col+'00');
    ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fill();
  });

  // Draw all edges from TREE_EDGES
  TREE_EDGES.forEach(([aid,bid])=>{
    const na=TREE_NODES.find(x=>x.id===aid);
    const nb=TREE_NODES.find(x=>x.id===bid);
    if(!na||!nb) return;
    const a=npos(na),b=npos(nb);
    const start=edgePt(a,b,nrad(na)),end=edgePt(b,a,nrad(nb));
    const aAlloc=isAllocOrPending(aid), bAlloc=isAllocOrPending(bid);
    const bothAlloc=isAlloc(aid)&&isAlloc(bid);
    const bothAP=aAlloc&&bAlloc;
    const col=BRANCH_COLORS[na.branch]?.stroke??BRANCH_COLORS[nb.branch]?.stroke??'#888';
    ctx.beginPath(); ctx.moveTo(start.x,start.y); ctx.lineTo(end.x,end.y);
    ctx.strokeStyle=bothAlloc?col:bothAP?col+'99':'#ffffff40';
    ctx.lineWidth=bothAlloc?2*_zoom:bothAP?1.5*_zoom:0.8*_zoom;
    if(bothAP&&!bothAlloc){ctx.setLineDash([4*_zoom,3*_zoom]);}
    ctx.stroke(); ctx.setLineDash([]);
  });

  // Draw nodes
  TREE_NODES.forEach(node=>{
    const {x,y}=npos(node),r=nrad(node);
    const alloc=isAlloc(node.id),pend=isPending(node.id),avail=isAvail(node.id);
    const hov=_hov===node.id;
    const col=BRANCH_COLORS[node.branch]??BRANCH_COLORS.hub;
    const {available}=getGlobalPoints();
    const canAff=(available-pendingCost())>=(TREE_NODES.find(n=>n.id===node.id)?.cost??0);

    ctx.beginPath();
    if(node.isNotable&&node.id!=='hub'){
      ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();
    } else { ctx.arc(x,y,r,0,Math.PI*2); }

    ctx.fillStyle=alloc?col.fill
                 :pend?col.fill+'99'
                 :avail&&canAff?col.fill+'44'
                 :avail?col.fill+'20'
                 :'#ffffff04';  // unavailable nodes nearly invisible
    ctx.fill();
    if(pend){ctx.setLineDash([3*_zoom,2*_zoom]);}
    ctx.strokeStyle=alloc?col.fill
                   :pend?col.fill+'cc'
                   :avail&&canAff?col.fill+'88'
                   :avail?col.fill+'44'
                   :'#ffffff0a';  // unavailable border barely visible
    ctx.lineWidth=hov?2.5*_zoom:alloc||pend?2*_zoom:avail?1.2*_zoom:0.5*_zoom;
    ctx.stroke(); ctx.setLineDash([]);

    if(node.id==='hub'&&_zoom>0.35){
      ctx.fillStyle='#1a0a00';
      ctx.font=`${Math.max(6,Math.round(7*_zoom))}px sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('Core',x,y);
    }
  });
}

function nodeAt(mx,my) {
  for(const n of TREE_NODES){
    const {x,y}=npos(n),r=nrad(n)+5;
    if((mx-x)*(mx-x)+(my-y)*(my-y)<r*r) return n.id;
  }
  return null;
}

function onMove(e) {
  const rect=_cv.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top;
  if(_ds){const dx=e.clientX-_ds.x,dy=e.clientY-_ds.y;if(Math.abs(dx)>3||Math.abs(dy)>3){_drag=true;_pan.x=_ps.x+dx;_pan.y=_ps.y+dy;draw();}}
  const h=nodeAt(mx,my);
  if(h!==_hov){_hov=h;draw();if(h)showT(e,h);else hideT();}else if(h)moveT(e);
}
function onWheel(e) {
  e.preventDefault();
  const rect=_cv.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top;
  const f=e.deltaY>0?0.88:1.14,nz=Math.max(0.18,Math.min(2,_zoom*f));
  _pan.x=mx-(mx-_pan.x)*(nz/_zoom);_pan.y=my-(my-_pan.y)*(nz/_zoom);_zoom=nz;draw();
}
function onClick(e) {
  if(_drag) return;
  const rect=_cv.getBoundingClientRect();
  const id=nodeAt(e.clientX-rect.left,e.clientY-rect.top);
  if(!id||id==='hub') return;
  const node=TREE_NODES.find(n=>n.id===id);
  const {available}=getGlobalPoints();
  const rem=available-pendingCost();
  if(isAlloc(id)){flashMsg('Use Respec to remove confirmed nodes.');return;}
  if(isPending(id)){
    // Can remove if all remaining staged nodes stay connected to confirmed allocated nodes
    // Use flood fill from allocated nodes through remaining pending to check full connectivity
    const testPending = _pending.filter(p=>p!==id);
    
    // Flood fill: start from all allocated nodes, spread through testPending via edges
    const reached = new Set();
    const queue = [...(_dat.allocated??[])];
    queue.forEach(n=>reached.add(n));
    let changed = true;
    while(changed){
      changed = false;
      testPending.forEach(pid=>{
        if(reached.has(pid)) return;
        const adj = getAdjMap()[pid]??[];
        if(adj.some(r=>reached.has(r))){
          reached.add(pid);
          changed = true;
        }
      });
    }
    // Check all remaining pending are reachable
    const wouldBreak = testPending.some(pid=>!reached.has(pid));
    if(wouldBreak){
      flashMsg('Cannot remove — other staged nodes depend on this path.');
      return;
    }
    _pending = testPending;
    updatePendingBar(); renderPanel(); draw(); return;
  }
  if(!isAvail(id)){
    const node2=TREE_NODES.find(n=>n.id===id);
    flashMsg(`Not adjacent — this is a tier ${node2?.tier??'?'} node. Follow the path from the hub first.`);
    return;
  }
  if(node.cost>rem){flashMsg('Not enough pts.');return;}
  _pending.push(id);
  updatePendingBar(); renderPanel(); draw();
}
function removePendingCascade(id) {
  _pending=_pending.filter(p=>p!==id);
}
function updatePendingBar() {
  const cost=pendingCost();
  const bar=document.getElementById('sp-pending-bar');
  const costEl=document.getElementById('sp-pending-cost');
  if(!bar||!costEl) return;
  if(_pending.length>0){
    bar.style.display='flex';
    costEl.textContent=`${_pending.length} staged \u00b7 ${cost} pts`;
  } else { bar.style.display='none'; }
}
function confirmPending() {
  if(!_pending.length) return;
  _dat.allocated=[...(_dat.allocated??[]),..._pending];
  _pending=[];
  saveTreeData(_dat); applyTreeModifiers(); renderPanel(); draw(); updatePendingBar(); updateTreeSidebar();
  document.dispatchEvent(new CustomEvent('skill-prestige:tree-confirmed'));
}
function cancelPending() { _pending=[]; updatePendingBar(); renderPanel(); draw(); }

function showT(e,id) {
  const node=TREE_NODES.find(n=>n.id===id); if(!node) return;
  const col=BRANCH_COLORS[node.branch]?.fill??'#f0c040';
  const alloc=isAlloc(id),pend=isPending(id),avail=isAvail(id);
  const {available}=getGlobalPoints(),rem=available-pendingCost();
  const tip=document.getElementById('sp-tt');
  // Build modifier line
  let modLine='';
  if(node.modId){
    const val=node.isPercent?`+${node.modValue}%`:`+${node.modValue}`;
    const modName=node.modId.replace('melvorD:','').replace(/([A-Z])/g,' $1').trim();
    modLine=`<div style="color:#a3e635;font-size:0.88em;margin-bottom:4px">${val} ${modName}</div>`;
  }
  tip.innerHTML=`<div style="color:${col};font-weight:bold;margin-bottom:3px">${node.label}</div>
    ${modLine}
    <div style="color:#ffffff70">Cost: <span style="color:${col}">${node.cost}pt${node.cost!==1?'s':''}</span>
    ${alloc?'<span style="color:#4ade80;margin-left:5px">&#10003; Confirmed</span>':''}
    ${pend?'<span style="color:#f87171;margin-left:5px">&#9711; Staged — click to unstage</span>':''}
    ${!alloc&&!pend&&avail&&rem>=node.cost?'<span style="color:#60a5fa;margin-left:5px">Click to stage</span>':''}
    ${!alloc&&!pend&&avail&&rem<node.cost?'<span style="color:#f87171;margin-left:5px">Not enough pts</span>':''}
    ${!avail?'<span style="color:#f87171;margin-left:5px">Not adjacent</span>':''}</div>`;
  tip.style.display='block'; moveT(e);
}
function moveT(e) {
  const t=document.getElementById('sp-tt'); if(!t) return;
  t.style.left=Math.min(e.clientX+16,window.innerWidth-215)+'px';
  t.style.top =Math.min(e.clientY+16,window.innerHeight-120)+'px';
}
function hideT() { const t=document.getElementById('sp-tt'); if(t) t.style.display='none'; }
function flashMsg(msg) {
  const t=document.getElementById('sp-tt'); if(!t) return;
  t.innerHTML=`<span style="color:#f87171">${msg}</span>`;
  t.style.left='50%'; t.style.top='70px'; t.style.display='block'; t.style.transform='translateX(-50%)';
  setTimeout(()=>{hideT();t.style.transform='';},2000);
}
function renderPanel() {
  const panel=document.getElementById('sp-tp'); if(!panel) return;
  const {total,spent,available}=getGlobalPoints();
  const d=loadTreeData();

  // Helper: tally modifiers from a list of node IDs, grouped by branch
  // Global modifier display names — branch-agnostic
  const MOD_NAMES = {
    'melvorD:skillXP':                                   'Skill XP (All)',
    'melvorD:nonCombatSkillXP':                          'Skill XP (Non-Combat)',
    'melvorD:masteryXP':                                 'Mastery XP',
    'melvorD:skillItemDoublingChance':                   'Item Doubling',
    'melvorD:skillPreservationChance':                   'Skill Preservation',
    'melvorD:potionChargePreservationChance':             'Potion Preservation',
    'melvorD:consumablePreservationChance':               'Consumable Preservation',
    'melvorD:flatMiningNodeHP':                          'Mining Node HP',
    'melvorD:miningGemChance':                           'Gem Find Chance',
    'melvorD:additionalRandomSkillItemChance':            'Rare Item Chance',
    'melvorD:combatLootDoublingChance':                  'Combat Loot Doubling',
    'melvorD:damageDealtToBosses':                       'Damage to Bosses',
    'melvorD:damageDealtToSlayerTasks':                  'Damage to Slayer Tasks',
    'melvorD:damageDealtToAllMonsters':                  'Damage to All Monsters',
    'melvorD:maxHitpoints':                              'Max Hitpoints',
    'melvorD:autoEatEfficiency':                         'Auto Eat Efficiency',
    'melvorD:hitpointRegeneration':                      'HP Regeneration',
    'melvorD:currencyGainFromMonsterDrops':              'GP from Monsters',
    'melvorD:currencyGainFromSlayerTaskMonsterDrops':    'GP from Slayer Tasks',
    'melvorD:itemSaleCurrencyGain':                      'Item Sale Value',
    'melvorD:bankSpace':                                 'Bank Slots',
    'melvorD:runePreservationChance':                    'Rune Preservation',
    'melvorD:ammoPreservationChance':                    'Ammo Preservation',
  };

  function tallyByBranch(ids, tintColor) {
    const byBranch={};
    ids.forEach(id=>{
      const node=TREE_NODES.find(x=>x.id===id);
      if(!node?.modId||node.id==='hub') return;
      const br=node.branch;
      if(!byBranch[br]) byBranch[br]={};
      if(!byBranch[br][node.modId]) byBranch[br][node.modId]={total:0,isPercent:node.isPercent};
      byBranch[br][node.modId].total     += node.modValue;
      byBranch[br][node.modId].isPercent  = node.isPercent;
    });
    const branchOrder=['gathering','production','combat','economy','cross'];
    return branchOrder.filter(b=>byBranch[b]).map(br=>{
      const col=BRANCH_COLORS[br]?.fill??'#fff';
      const rows=Object.entries(byBranch[br]).map(([modId,{total,isPercent}])=>{
        const name=MOD_NAMES[modId]??modId.replace('melvorD:','').replace(/([A-Z])/g,' $1').trim();
        const val=isPercent?`+${total%1===0?total:total.toFixed(1)}%`:`+${total}`;
        return `<div style="display:flex;justify-content:space-between;padding:2px 0 2px 8px;font-size:0.79em;border-bottom:1px solid #ffffff08">
          <span style="color:#ffffffaa">${name}</span>
          <span style="color:${tintColor};font-weight:bold;flex-shrink:0;margin-left:4px">${val}</span></div>`;
      }).join('');
      return `<div style="color:${col};font-size:0.78em;font-weight:bold;margin:6px 0 2px">${BRANCH_NAMES[br]}</div>${rows}`;
    }).join('');
  }

  const confirmedSections = tallyByBranch(d.allocated??[], '#4ade80');
  const pendingSections   = tallyByBranch(_pending, '#60a5fa');
  const pendingCostTotal  = pendingCost();

  const ptsEl=document.getElementById('sp-tree-pts');
  if(ptsEl) ptsEl.textContent=`${available} free / ${total} total`;

  panel.innerHTML=`
    <div style="color:#f0c040;font-weight:bold;margin-bottom:8px;font-size:0.92em">Points</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:12px">
      ${[['Total',total,'#f0c040'],['Spent',spent,'#f87171'],['Free',available,'#4ade80']].map(([l,v,c])=>
        `<div style="background:#ffffff08;border:1px solid ${c}25;border-radius:6px;padding:5px;text-align:center">
          <div style="color:#ffffff50;font-size:0.72em">${l}</div>
          <div style="color:${c};font-weight:bold">${v}</div></div>`).join('')}
    </div>

    ${_pending.length>0?`
    <div style="color:#60a5fa;font-weight:bold;margin-bottom:4px;font-size:0.85em;border-bottom:1px solid #60a5fa30;padding-bottom:3px">
      Staged Bonuses <span style="color:#ffffff50;font-weight:normal">(${_pending.length} nodes · ${pendingCostTotal}pts)</span>
    </div>
    ${pendingSections||'<div style="color:#ffffff30;font-style:italic;font-size:0.82em;margin:4px 0 8px">No modifiers in staged path</div>'}
    `:''}

    <div style="color:#f0c040;font-weight:bold;margin-bottom:4px;font-size:0.88em;border-bottom:1px solid #ffffff12;padding-bottom:4px">
      ${_pending.length>0?'Confirmed Bonuses':'Active Bonuses'}
    </div>
    ${confirmedSections||'<div style="color:#ffffff30;font-style:italic;font-size:0.82em;margin:6px 0">No nodes confirmed</div>'}

    ${spent>0?`<div style="color:#ffffff40;font-size:0.76em;margin-top:10px;padding-top:8px;border-top:1px solid #ffffff10">Respec: <span style="color:#f0c040">${getRespecCost(spent).toLocaleString()} GP</span></div>`:''}
    <div style="margin-top:10px;padding-top:8px;border-top:1px solid #ffffff10">
      ${[['#22c55e','Gathering'],['#f97316','Production'],['#ef4444','Combat'],['#eab308','Economy'],['#a855f7','Cross']].map(([c,l])=>
        `<div style="color:${c};font-size:0.76em;margin-bottom:2px">&#9632; ${l}</div>`).join('')}
      <div style="color:#ffffff40;font-size:0.74em;margin-top:3px">&#9671; = Notable</div>
    </div>`;
}

// ─── Respec ───────────────────────────────────────────────────────────────────
function doRespec() {
  const {spent}=getGlobalPoints(); if(!spent){flashMsg('Nothing confirmed.');return;}
  const cost=getRespecCost(spent);
  if((game.gp?.amount??0)<cost){flashMsg('Need '+cost.toLocaleString()+' GP.');return;}
  const m=document.createElement('div');
  m.style.cssText='position:fixed;inset:0;background:#000000cc;z-index:10001;display:flex;align-items:center;justify-content:center';
  m.innerHTML=`<div style="background:#1a1230;border:1px solid #ef4444;border-radius:10px;padding:22px;max-width:300px;width:90%">
    <h3 style="color:#ef4444;margin:0 0 10px">Reset Tree?</h3>
    <p style="color:#ffffffcc;font-size:0.88em">Refunds all ${spent} pts spent.</p>
    <p style="color:#f0c040;font-size:0.88em">Cost: ${cost.toLocaleString()} GP</p>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button id="sp-rc" style="flex:1;background:#ffffff15;border:1px solid #ffffff30;color:#fff;border-radius:6px;padding:7px;cursor:pointer">Cancel</button>
      <button id="sp-rc2" style="flex:1;background:#b91c1c;border:none;color:#fff;border-radius:6px;padding:7px;cursor:pointer;font-weight:bold">Confirm</button>
    </div></div>`;
  document.body.appendChild(m);
  m.querySelector('#sp-rc').addEventListener('click',()=>m.remove());
  m.querySelector('#sp-rc2').addEventListener('click',()=>{
    game.gp?.remove?.(cost);
    _dat.allocated=['hub']; _pending=[];
    saveTreeData(_dat); applyTreeModifiers(); renderPanel(); draw(); updatePendingBar(); updateTreeSidebar(); m.remove();
    document.dispatchEvent(new CustomEvent('skill-prestige:tree-confirmed'));
  });
}

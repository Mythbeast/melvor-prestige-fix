// core/combat.mjs -- combat skill prestige system
// Uses native game modifiers so bonuses stack with equipment

export const COMBAT_SKILLS = [
  {
    id:       'attack',
    name:     'Attack',
    skillId:  'melvorD:Attack',
    icon:     '&#9876;',
    color:    '#e04040',
    bg1:      '#200808',
    bg2:      '#3a1010',
    border:   '#a03030',
    btnBg:    '#3a1010',
    dark:     '#100404',
    gameSkill: () => game.attack,
    upgrades: [
      { id:'meleeAccuracy', name:'Precise Strikes', icon:'&#127919;', description:'+3 Melee Accuracy Rating per rank.', modId:'melvorD:meleeAccuracyRating', valuePerRank:3, isPercent:false, costScale:2 },
      { id:'stabBonus', name:'Stab Master', icon:'&#9876;', description:'+2 Stab Attack Bonus per rank.', modId:'melvorD:flatStabAttackBonus', valuePerRank:2, isPercent:false, costScale:1.5 },
      { id:'slashBonus', name:'Slash Master', icon:'&#9876;', description:'+2 Slash Attack Bonus per rank.', modId:'melvorD:flatSlashAttackBonus', valuePerRank:2, isPercent:false, costScale:1.5 },
      { id:'blockBonus', name:'Block Master', icon:'&#128737;', description:'+2 Block Attack Bonus per rank.', modId:'melvorD:flatBlockAttackBonus', valuePerRank:2, isPercent:false, costScale:1.5 },
      { id:'meleeInterval', name:'Swift Blade', icon:'&#9201;', description:'-2% Melee Attack Interval per rank.', modId:'melvorD:meleeAttackInterval', valuePerRank:-2, isPercent:true, costScale:3 },
      { id:'meleeLifesteal', name:'Vampiric Strike', icon:'&#129864;', description:'+0.2% Melee Lifesteal per rank.', modId:'melvorD:meleeLifesteal', valuePerRank:0.2, isPercent:true, costScale:3 },
      { id:'meleeCrit', name:'Critical Eye', icon:'&#128150;', description:'+0.5% Melee Critical Strike Chance per rank.', modId:'melvorD:meleeCritChance', valuePerRank:0.5, isPercent:true, costScale:3 },
      { id:'skillXP', name:'Veteran Fighter', icon:'&#128218;', description:'+10% Attack XP per rank.', modId:null, valuePerRank:0.1, isPercent:true, costScale:1.5 },
    ],
  },
  {
    id:       'strength',
    name:     'Strength',
    skillId:  'melvorD:Strength',
    icon:     '&#128170;',
    color:    '#e06020',
    bg1:      '#201008',
    bg2:      '#3a1e08',
    border:   '#a04010',
    btnBg:    '#3a1e08',
    dark:     '#100800',
    gameSkill: () => game.strength,
    upgrades: [
      { id:'meleeStrength', name:'Raw Power', icon:'&#128170;', description:'+2 Melee Strength Bonus per rank.', modId:'melvorD:meleeStrengthBonus', valuePerRank:2, isPercent:false, costScale:2 },
      { id:'meleeMaxHit', name:'Crushing Blow', icon:'&#128293;', description:'+1% Melee Max Hit per rank.', modId:'melvorD:meleeMaxHit', valuePerRank:1, isPercent:true, costScale:3 },
      { id:'meleeMinHit', name:'Relentless', icon:'&#128312;', description:'+0.5% Melee Min Hit (based on Max Hit) per rank.', modId:'melvorD:meleeMinHitBasedOnMaxHit', valuePerRank:0.5, isPercent:true, costScale:3 },
      { id:'twoHandBonus', name:'Two-Handed Mastery', icon:'&#9876;', description:'+2 2H Melee Strength Bonus per rank.', modId:'melvorD:meleeStrengthBonusWith2HWeapon', valuePerRank:2, isPercent:false, costScale:1.5 },
      { id:'enemyDRBonus', name:'Armour Breaker', icon:'&#129761;', description:'+1 Melee Strength per 10 Enemy DR per rank.', modId:'melvorD:meleeStrengthBonusPer10EnemyDR', valuePerRank:1, isPercent:false, costScale:1.5 },
      { id:'skillXP', name:'Veteran Brawler', icon:'&#128218;', description:'+10% Strength XP per rank.', modId:null, valuePerRank:0.1, isPercent:true, costScale:1.5 },
    ],
  },
  {
    id:       'defence',
    name:     'Defence',
    skillId:  'melvorD:Defence',
    icon:     '&#128737;',
    color:    '#4080e0',
    bg1:      '#08142e',
    bg2:      '#102040',
    border:   '#2858a0',
    btnBg:    '#102040',
    dark:     '#040a18',
    gameSkill: () => game.defence,
    upgrades: [
      { id:'meleeEvasion', name:'Iron Wall', icon:'&#128737;', description:'+2% Melee Evasion per rank.', modId:'melvorD:meleeEvasion', valuePerRank:2, isPercent:true, costScale:3 },
      { id:'rangedEvasion', name:'Dodge Roll', icon:'&#127939;', description:'+2% Ranged Evasion per rank.', modId:'melvorD:rangedEvasion', valuePerRank:2, isPercent:true, costScale:3 },
      { id:'magicEvasion', name:'Magic Ward', icon:'&#10024;', description:'+2% Magic Evasion per rank.', modId:'melvorD:magicEvasion', valuePerRank:2, isPercent:true, costScale:3 },
      { id:'reflectDmg', name:'Thorn Shield', icon:'&#129761;', description:'+1% Reflect Damage per rank.', modId:'melvorD:reflectDamage', valuePerRank:1, isPercent:true, costScale:3 },
      { id:'meleeProtect', name:'Melee Guard', icon:'&#128737;', description:'Sets your chance to be hit by Melee attacks to a flat (100 - 5 per rank)%, bypassing normal evasion math. Toggle on only if this beats your current melee hit chance.', modId:'melvorD:meleeProtection', valuePerRank:5, isPercent:false, costScale:3, toggleable:true },
      { id:'rangedProtect', name:'Arrow Guard', icon:'&#128737;', description:'Sets your chance to be hit by Ranged attacks to a flat (100 - 5 per rank)%, bypassing normal evasion math. Toggle on only if this beats your current ranged hit chance.', modId:'melvorD:rangedProtection', valuePerRank:5, isPercent:false, costScale:3, toggleable:true },
      { id:'magicProtect', name:'Spell Guard', icon:'&#128737;', description:'Sets your chance to be hit by Magic attacks to a flat (100 - 5 per rank)%, bypassing normal evasion math. Toggle on only if this beats your current magic hit chance.', modId:'melvorD:magicProtection', valuePerRank:5, isPercent:false, costScale:3, toggleable:true },
      { id:'evasionHP', name:'Nimble Body', icon:'&#129354;', description:'+1% Global Evasion HP Scaling per rank.', modId:'melvorD:globalEvasionHPScaling', valuePerRank:1, isPercent:true, costScale:3 },
      { id:'skillXP', name:'Veteran Guardian', icon:'&#128218;', description:'+10% Defence XP per rank.', modId:null, valuePerRank:0.1, isPercent:true, costScale:1.5 },
    ],
  },
  {
    id:       'hitpoints',
    name:     'Hitpoints',
    skillId:  'melvorD:Hitpoints',
    icon:     '&#10084;',
    color:    '#e04060',
    bg1:      '#200810',
    bg2:      '#3a1020',
    border:   '#a03050',
    btnBg:    '#3a1020',
    dark:     '#100408',
    gameSkill: () => game.hitpoints,
    upgrades: [
      { id:'maxHitpoints', name:'Vitality', icon:'&#10084;', description:'+10 Max Hitpoints per rank.', modId:'melvorD:flatMaxHitpoints', valuePerRank:1, isPercent:false, costScale:2 },
      { id:'hpRegen', name:'Rapid Recovery', icon:'&#129354;', description:'+1% HP Regeneration per rank.', modId:'melvorD:hitpointRegeneration', valuePerRank:1, isPercent:true, costScale:2 },
      { id:'regenOnDamage', name:'Battle Hardened', icon:'&#128293;', description:'+1% HP Regen per damage taken per rank.', modId:'melvorD:regenPerDamageTaken', valuePerRank:1, isPercent:true, costScale:3 },
      { id:'regenHighEvasion', name:'Elusive Recovery', icon:'&#127939;', description:'+1% HP Regen when enemy has more Evasion per rank.', modId:'melvorD:hpRegenWhenEnemyHasMoreEvasion', valuePerRank:1, isPercent:true, costScale:3 },
      { id:'lifestealHP', name:'Sanguine Feast', icon:'&#129864;', description:'+0.2% Lifesteal based on current HP per rank.', modId:'melvorD:lifestealDamageBasedOnCurrentHitpoints', valuePerRank:0.2, isPercent:true, costScale:3 },
      { id:'skillXP', name:'Veteran Survivor', icon:'&#128218;', description:'+10% Hitpoints XP per rank.', modId:null, valuePerRank:0.1, isPercent:true, costScale:1.5 },
    ],
  },
  {
    id:       'ranged',
    name:     'Ranged',
    skillId:  'melvorD:Ranged',
    icon:     '&#127993;',
    color:    '#40c060',
    bg1:      '#081a0e',
    bg2:      '#103020',
    border:   '#208040',
    btnBg:    '#103020',
    dark:     '#040c06',
    gameSkill: () => game.ranged,
    upgrades: [
      { id:'rangedAccuracy', name:'Eagle Eye', icon:'&#128065;', description:'+3 Ranged Accuracy Rating per rank.', modId:'melvorD:rangedAccuracyRating', valuePerRank:3, isPercent:false, costScale:2 },
      { id:'rangedStrength', name:'Power Draw', icon:'&#127993;', description:'+2 Ranged Strength Bonus per rank.', modId:'melvorD:rangedStrengthBonus', valuePerRank:2, isPercent:false, costScale:2 },
      { id:'rangedMaxHit', name:'Lethal Shot', icon:'&#128150;', description:'+1% Ranged Max Hit per rank.', modId:'melvorD:rangedMaxHit', valuePerRank:1, isPercent:true, costScale:3 },
      { id:'rangedMinHit', name:'Pinpoint', icon:'&#128312;', description:'+0.5% Ranged Min Hit (based on Max Hit) per rank.', modId:'melvorD:rangedMinHitBasedOnMaxHit', valuePerRank:0.5, isPercent:true, costScale:3 },
      { id:'rangedInterval', name:'Rapid Fire', icon:'&#9201;', description:'-2% Ranged Attack Interval per rank.', modId:'melvorD:rangedAttackInterval', valuePerRank:-2, isPercent:true, costScale:3 },
      { id:'rangedLifesteal', name:'Bloodshot', icon:'&#129864;', description:'+0.2% Ranged Lifesteal per rank.', modId:'melvorD:rangedLifesteal', valuePerRank:0.2, isPercent:true, costScale:3 },
      { id:'rangedCrit', name:'Sniper', icon:'&#128269;', description:'+0.5% Ranged Critical Strike Chance per rank.', modId:'melvorD:rangedCritChance', valuePerRank:0.5, isPercent:true, costScale:3 },
      { id:'ammoPreserve', name:'Ammo Conservation', icon:'&#129432;', description:'+1% Ammo Preservation Chance per rank.', modId:'melvorD:ammoPreservationChance', valuePerRank:1, isPercent:true, costScale:2, maxRank:100 },
      { id:'rangedTwoHand', name:'Longbow Mastery', icon:'&#127993;', description:'+2 2H Ranged Strength Bonus per rank.', modId:'melvorD:rangedStrengthBonusWith2HWeapon', valuePerRank:2, isPercent:false, costScale:1.5 },
      { id:'skillXP', name:'Veteran Archer', icon:'&#128218;', description:'+10% Ranged XP per rank.', modId:null, valuePerRank:0.1, isPercent:true, costScale:1.5 },
    ],
  },
  {
    id:       'magic',
    name:     'Magic',
    skillId:  'melvorD:Magic',
    icon:     '&#10024;',
    color:    '#a060e0',
    bg1:      '#140820',
    bg2:      '#201040',
    border:   '#6030a0',
    btnBg:    '#201040',
    dark:     '#0a0414',
    gameSkill: () => game.skills.getObjectByID('melvorD:Magic'),
    upgrades: [
      { id:'magicAccuracy', name:'Arcane Focus', icon:'&#128161;', description:'+3 Magic Accuracy Rating per rank.', modId:'melvorD:magicAccuracyRating', valuePerRank:3, isPercent:false, costScale:2 },
      { id:'magicDamage', name:'Spell Power', icon:'&#10024;', description:'+2% Magic Damage Bonus per rank.', modId:'melvorD:magicDamageBonus', valuePerRank:2, isPercent:true, costScale:3 },
      { id:'magicMaxHit', name:'Overcharge', icon:'&#128150;', description:'+1% Magic Max Hit per rank.', modId:'melvorD:magicMaxHit', valuePerRank:1, isPercent:true, costScale:3 },
      { id:'magicMinHit', name:'Arcane Precision', icon:'&#128312;', description:'+0.5% Magic Min Hit (based on Max Hit) per rank.', modId:'melvorD:magicMinHitBasedOnMaxHit', valuePerRank:0.5, isPercent:true, costScale:3 },
      { id:'magicInterval', name:'Quickcast', icon:'&#9201;', description:'-2% Magic Attack Interval per rank.', modId:'melvorD:magicAttackInterval', valuePerRank:-2, isPercent:true, costScale:3 },
      { id:'magicLifesteal', name:'Mana Drain', icon:'&#129864;', description:'+0.2% Magic Lifesteal per rank.', modId:'melvorD:magicLifesteal', valuePerRank:0.2, isPercent:true, costScale:3 },
      { id:'magicCrit', name:'Critical Surge', icon:'&#9889;', description:'+0.5% Magic Critical Strike Chance per rank.', modId:'melvorD:magicCritChance', valuePerRank:0.5, isPercent:true, costScale:3 },
      { id:'runePreserve', name:'Rune Mastery', icon:'&#128161;', description:'+1% Rune Preservation Chance per rank.', modId:'melvorD:runePreservationChance', valuePerRank:1, isPercent:true, costScale:2, maxRank:100 },
      { id:'prayerMaxHit', name:'Holy Surge', icon:'&#128591;', description:'+1% Magic Max Hit with Active Prayer per rank.', modId:'melvorD:magicMaxHitWithActivePrayer', valuePerRank:1, isPercent:true, costScale:3 },
      { id:'skillXP', name:'Veteran Mage', icon:'&#128218;', description:'+10% Magic XP per rank (applies to Alt Magic too).', modId:null, modId2:'melvorD:altMagicSkillXP', valuePerRank:0.1, isPercent:true, costScale:1.5 },
    ],
  },
  {
    id:       'prayer',
    name:     'Prayer',
    skillId:  'melvorD:Prayer',
    icon:     '&#128591;',
    color:    '#e0c040',
    bg1:      '#1e1800',
    bg2:      '#382e00',
    border:   '#a08810',
    btnBg:    '#382e00',
    dark:     '#0e0c00',
    gameSkill: () => game.skills.getObjectByID('melvorD:Prayer'),
    upgrades: [
      { id:'prayerPreserve', name:'Devoted', icon:'&#128591;', description:'+1% Prayer Point Preservation per rank.', modId:'melvorD:prayerPointPreservationChance', valuePerRank:1, isPercent:true, costScale:2, maxRank:100 },
      { id:'prayerCost', name:'Pious', icon:'&#128149;', description:'-1 Prayer Point Cost per rank.', modId:'melvorD:prayerPointCost', valuePerRank:-1, isPercent:false, costScale:2, baseCost:3 },
      { id:'prayerFromBury', name:'Sacred Burial', icon:'&#128690;', description:'+1 Prayer Points from Burying per rank.', modId:'melvorD:prayerPointsFromBurying', valuePerRank:1, isPercent:false, costScale:1.5 },
      { id:'prayerPerPoint', name:'Faithful', icon:'&#128150;', description:'+0.5% Prayer Preservation per Point active per rank.', modId:'melvorD:prayerPointPreservationChancePerPoint', valuePerRank:0.5, isPercent:true, costScale:2 },
      { id:'unholyPreserve', name:'Dark Devotion', icon:'&#129754;', description:'+1% Unholy Prayer Preservation per rank.', modId:'melvorD:unholyPrayerPointPreservationChance', valuePerRank:1, isPercent:true, costScale:2, maxRank:100 },
      { id:'skillXP', name:'Veteran Cleric', icon:'&#128218;', description:'+10% Prayer XP per rank.', modId:null, valuePerRank:0.1, isPercent:true, costScale:1.5 },
    ],
  },
  {
    id:       'slayer',
    name:     'Slayer',
    skillId:  'melvorD:Slayer',
    icon:     '&#9876;',
    color:    '#c0a020',
    bg1:      '#181000',
    bg2:      '#301e00',
    border:   '#806010',
    btnBg:    '#301e00',
    dark:     '#0c0800',
    gameSkill: () => game.slayer,
    upgrades: [
      { id:'slayerDamage',   name:'Slayer Mastery',    icon:'&#9876;',   description:'+1% damage to Slayer task monsters per rank.', modId:'melvorD:damageDealtToSlayerTasks', valuePerRank:1, isPercent:true, costScale:2 },
      { id:'slayerCoins',    name:'Bounty Hunter',     icon:'&#128176;', description:'+2% Slayer Coins from task drops per rank.', modId:'melvorD:currencyGainFromSlayerTaskMonsterDrops', valuePerRank:2, isPercent:true, costScale:2 },
      { id:'taskLength',     name:'Extended Contract', icon:'&#128196;', description:'+2% Slayer task length per rank.', modId:'melvorD:slayerTaskLength', valuePerRank:2, isPercent:true, costScale:2 },
      { id:'slayerEvasion',  name:'Monster Study',     icon:'&#128065;', description:'+1 Damage Reduction vs Slayer task monsters per rank.', modId:'melvorD:flatResistanceAgainstSlayerTasks', valuePerRank:1, isPercent:false, costScale:2 },
      { id:'masteryAnchor',  name:'Mastery Anchor',    icon:'&#9889;',   description:'Prestiging no longer fully resets monster mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', modId:null, valuePerRank:1, isPercent:false, costScale:1.5, maxRank:99 },
      { id:'masteryXP',      name:'Monster Hunter',    icon:'&#127757;', description:'+10% Slayer Monster Mastery XP per rank.', modId:null, valuePerRank:0.1, isPercent:true, costScale:1.5 },
      { id:'skillXP',        name:'Veteran Slayer',    icon:'&#128218;', description:'+10% Slayer XP per rank.', modId:null, valuePerRank:0.1, isPercent:true, costScale:1.5 },
    ],
  },
];

export function getCombatSkill(skillId) { return COMBAT_SKILLS.find(s => s.id === skillId); }

// Cost formula: rank 0 → 1pt always, then multiplies by costScale each rank.
// costScale 1.5 → gentle growth, 2 → doubles each rank, 3 → triples each rank.
export function getCombatUpgradeCost(upgrade, currentRank) {
  const base  = upgrade.baseCost ?? 1;
  const scale = upgrade.costScale ?? 2;
  if (currentRank === 0) return base;
  return Math.min(Math.ceil(base * Math.pow(scale, currentRank)), 999);
}

export function formatCombatBonus(upgrade, rank) {
  if (upgrade.id === 'masteryAnchor') return `Mastery Level ${rank} floor`;
  if (upgrade.id === 'meleeProtect' || upgrade.id === 'rangedProtect' || upgrade.id === 'magicProtect') {
    const protection = upgrade.valuePerRank * rank;
    return `${100 - protection}% flat hit chance`;
  }
  const total = upgrade.valuePerRank * rank;
  if (upgrade.isPercent) {
    const pct = upgrade.id === 'skillXP' ? total * 100 : total;
    const display = Number.isInteger(pct) ? pct : parseFloat(pct.toFixed(1));
    return (total >= 0 ? '+' : '') + display + '%';
  }
  // flatMaxHitpoints uses Melvor's ×10 internal scaling — multiply for display
  const display = upgrade.modId === 'melvorD:flatMaxHitpoints' ? total * 10 : total;
  return (total >= 0 ? '+' : '') + display;
}

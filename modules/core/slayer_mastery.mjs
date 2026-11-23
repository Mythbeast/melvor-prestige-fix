// core/slayer_mastery.mjs -- per-monster mastery system for Slayer
// Slayer has no native mastery in Melvor. This module adds one: completing
// a task grants mastery XP to the specific monster fought, scaled by kills.
// Mastery level grants a damage bonus against that monster.

let _deps = null;

const MASTERY_XP_PER_KILL = 10; // base mastery XP granted per kill on task completion

export function initSlayerMastery(deps) {
  _deps = deps;
}

function getState() {
  return _deps?.stateM?.getState('slayer') ?? null;
}

function getMasteryStore() {
  const state = getState();
  if (!state) return {};
  if (!state.slayerMonsterMastery) state.slayerMonsterMastery = {};
  return state.slayerMonsterMastery;
}

function getEntry(monsterId) {
  const store = getMasteryStore();
  if (!store[monsterId]) store[monsterId] = { xp: 0, level: 1 };
  return store[monsterId];
}

export function getMasteryLevel(monsterId) {
  const store = getMasteryStore();
  return store[monsterId]?.level ?? 1;
}

export function getMasteryXP(monsterId) {
  const store = getMasteryStore();
  return store[monsterId]?.xp ?? 0;
}

// Grant mastery XP for a monster, scaled by number of kills on the completed task.
// Recomputes level from XP using the same curve as native mastery (capped at 99).
export function grantMasteryXP(monsterId, kills) {
  if (!monsterId || !kills) return;
  const entry = getEntry(monsterId);
  const state = getState();
  const rank  = state?.upgrades?.masteryXP ?? 0;
  const bonus = 1 + rank * 0.1; // +10% per rank
  const xpGain = Math.round(MASTERY_XP_PER_KILL * kills * bonus);
  entry.xp += xpGain;
  // Recompute level from XP table (search up from current level for speed)
  let lvl = entry.level;
  while (lvl < 99 && entry.xp >= _deps.stateM.xpForLevel(lvl + 1)) lvl++;
  const leveledUp = lvl > entry.level;
  entry.level = lvl;
  document.dispatchEvent(new CustomEvent('skill-prestige:slayer-mastery-xp', {
    detail: { monsterId, xpGain, level: entry.level, leveledUp }
  }));
  try { _deps.stateM.saveStateDeferred(); } catch(e) {}
}

// Damage bonus per mastery level against a specific monster.
// rank = prestige upgrade rank for 'monsterStudy' style scaling; here it's flat per level.
const DAMAGE_BONUS_PER_LEVEL   = 0.005;  // +0.5% damage per mastery level, +49.5% at level 99
const ACCURACY_BONUS_PER_LEVEL = 0.01; // +1% accuracy per mastery level, +98% at level 99

export function getDamageBonus(monsterId) {
  const level = getMasteryLevel(monsterId);
  return (level - 1) * DAMAGE_BONUS_PER_LEVEL; // level 1 = no bonus
}

export function getAccuracyBonus(monsterId) {
  const level = getMasteryLevel(monsterId);
  return (level - 1) * ACCURACY_BONUS_PER_LEVEL; // level 1 = no bonus
}

// Called on prestige reset -- caps mastery at the masteryAnchor upgrade rank,
// same semantics as the non-combat skill version: levels at or below rank are
// kept as-is, levels above rank are capped down to rank.
export function applyPrestigeReset() {
  const state = getState();
  if (!state) return;
  const anchorRank = state.upgrades?.masteryAnchor ?? 0;
  const store = getMasteryStore();
  Object.keys(store).forEach(monsterId => {
    const entry = store[monsterId];
    if (!entry) return;
    if (anchorRank > 0 && entry.level <= anchorRank) return; // keep as-is
    const newLevel = anchorRank > 0 ? anchorRank : 1;
    entry.level = newLevel;
    entry.xp    = _deps.stateM.xpForLevel(newLevel);
  });
}

// Returns array of all tracked monsters with mastery info, for UI display.
// Includes monster name/icon resolved from the game object if available.
export function getAllMasteryEntries() {
  const store = getMasteryStore();
  return Object.entries(store).map(([monsterId, entry]) => {
    let name = monsterId;
    let icon = null;
    try {
      const monster = game.monsters?.getObjectByID?.(monsterId);
      if (monster) { name = monster.name ?? monsterId; icon = monster.media ?? null; }
    } catch(e) {}
    const nextLevelXP = entry.level < 99 ? _deps.stateM.xpForLevel(entry.level + 1) : null;
    const thisLevelXP = _deps.stateM.xpForLevel(entry.level);
    return {
      monsterId, name, icon,
      level: entry.level,
      xp: entry.xp,
      xpIntoLevel: entry.xp - thisLevelXP,
      xpForNextLevel: nextLevelXP !== null ? nextLevelXP - thisLevelXP : null,
      isMaxLevel: entry.level >= 99,
      damageBonusPct: Math.round(getDamageBonus(monsterId) * 1000) / 10, // e.g. 49.5
      accuracyBonusPct: Math.round(getAccuracyBonus(monsterId) * 1000) / 10, // e.g. 4.9
    };
  }).sort((a, b) => b.level - a.level || b.xp - a.xp);
}

// core/prestige.mjs -- prestige logic for all skills

let _deps = null;
export function initPrestige(deps) { _deps = deps; }
export function performPrestige(skillId, gameSkill) {
  const state  = _deps.stateM.getState(skillId);
  const vLevel = _deps.stateM.getVirtualLevel(gameSkill);
  const needed = _deps.stateM.nextPrestigeLevel(skillId);
  if (vLevel < needed) return false;

  if (skillId === 'slayer') {
    try { _deps.slayerMasteryM?.applyPrestigeReset(); } catch(e) {}
  }

  // Hard block: never reset a combat skill while in an active fight
  const isCombatSkill = !!_deps.combatM?.getCombatSkill(skillId);
  if (isCombatSkill && (game.combat?.isActive ?? false)) return false;

  state.lastPrestigeLevel = needed;
  const basePPP    = Math.min(5, Math.max(1, _deps.stateM.getSettings(skillId).pointsPerPrestige ?? 1));
  // +5% bonus per prestige already completed (before this one), so prestige 1 = base,
  // prestige 2 = base×1.05, prestige 20 = base×2.0, etc.
  const multiplier = 1 + (state.prestigeCount * 0.05);
  const ppp        = Math.max(1, Math.floor(basePPP * multiplier));
  state.prestigeCount += 1;
  state.totalPoints = (state.totalPoints ?? state.prestigeCount - 1) + ppp;

  // Award one global prestige tree point per prestige across all skills
  try { _deps.globalTreeM?.addGlobalPrestigePoint?.(); } catch(e) {}
  try { _deps.globalTreeM?.updateTreeSidebar?.(); } catch(e) {}

  // Reset skill to its starting level (Hitpoints starts at 10, others at 1)
  const resetLevel = skillId === 'hitpoints' ? 10 : 1;
  // Use the game's own exp table to get the exact XP for that level
  const resetXP = (exp.levelToXP(resetLevel) ?? _deps.stateM.xpForLevel(resetLevel)) + 1;
  gameSkill.setXP(resetXP);
  // After setXP, restore HP to full at the new max so the player isn't left at 0
  if (skillId === 'hitpoints') {
    try {
      const player = game.combat.player;
      if (player.stats?.maxHitpoints != null)
        player.hitpoints = player.stats.maxHitpoints;
    } catch(e) {}
  }
  // Capture each rock's true base HP before zeroing mastery.
  // maxHP = baseHP + (masteryLevel - 1), so baseHP = maxHP - (masteryLevel - 1).
  // We store baseHP on the rock as _prestigeBaseHP so we can restore it after reset.
  if (skillId === 'mining') {
    try {
      const miningState = _deps.stateM.getState('mining');
      const rockHPRank  = miningState.upgrades['rockHP'] ?? 0;
      const rockHPMult  = 1 + rockHPRank * 0.10;
      game.mining.actions.allObjects.forEach(rock => {
        rock._prestigeBaseHP       = Math.floor(5 * rockHPMult);
        rock._rockHPMult           = rockHPMult;
        rock._originalMasteryLevel = game.mining.actionMastery.get(rock)?.level ?? 1;
      });
    } catch(e) {}
  }

  try {
    if (gameSkill.actionMastery instanceof Map) {
      // Mastery Anchor -- cap mastery at the upgrade's rank on prestige instead of
      // fully resetting to 1. Levels already at or below the rank are untouched;
      // levels above the rank are brought down to the rank.
      const anchorRank = _deps.stateM.getState(skillId)?.upgrades?.masteryAnchor ?? 0;
      gameSkill.actionMastery.forEach(v => {
        if (!v || typeof v !== 'object') return;
        const currentLevel = v.level ?? 1;
        if (anchorRank > 0 && currentLevel <= anchorRank) {
          // Already at or below the anchor -- leave untouched
          return;
        }
        if (anchorRank > 0) {
          v.level = anchorRank;
          v.xp    = _deps.stateM.xpForLevel(anchorRank);
        } else {
          v.xp    = 0;
          v.level = 1;
        }
      });
    }
  } catch(e) {}

  // Mining: after mastery is zeroed to level 1, restore maxHP to baseHP + 0
  // (mastery 1 = no bonus above base). Patch onMasteryLevelUp once so each
  // level gained adds back +1 HP naturally, using the stored _prestigeBaseHP.
  if (skillId === 'mining') {
    try {
      // Set maxHP and currentHP directly from stored base values
      game.mining.actions.allObjects.forEach(rock => {
        if (rock._prestigeBaseHP !== undefined) {
          const initHP     = Math.floor(5 * rock._rockHPMult);
          rock.maxHP       = initHP;
          rock.currentHP   = initHP;
          const rq = game.mining.renderQueue;
          if (rq?.rockHP instanceof Set) rq.rockHP.add(rock);
        }
      });

      // Patch onMasteryLevelUp once so HP climbs back naturally as mastery rises
      if (!game.mining._prestigeHPPatched) {
        game.mining._prestigeHPPatched = true;

        const reapplyHP = function(action) {
          if (action?._prestigeBaseHP === undefined) return;
          const masteryLevel = game.mining.actionMastery.get(action)?.level ?? 1;
          // Formula: floor((5 + masteryLevel - 1) * (1 + rockHPRank * 0.10))
          // _prestigeBaseHP stores the rockHP multiplier separately so we can recalc
          const rawHP  = 5 + (masteryLevel - 1);
          const newHP  = Math.floor(rawHP * action._rockHPMult);
          action.maxHP     = newHP;
          action.currentHP = Math.min(action.currentHP, newHP);
          const rq = game.mining.renderQueue;
          if (rq?.rockHP instanceof Set) rq.rockHP.add(action);
          if (masteryLevel >= (action._originalMasteryLevel ?? 999)) {
            delete action._prestigeBaseHP;
            delete action._originalMasteryLevel;
            delete action._rockHPMult;
          }
        };

        const origOnMasteryLevelUp = game.mining.onMasteryLevelUp.bind(game.mining);
        game.mining.onMasteryLevelUp = function(action, oldLevel, newLevel) {
          origOnMasteryLevelUp(action, oldLevel, newLevel);
          reapplyHP(action);
        };

        const origPostAction = game.mining.postAction.bind(game.mining);
        game.mining.postAction = function(...args) {
          origPostAction(...args);
          // Re-apply override for any rock that still has _prestigeBaseHP set
          game.mining.actions.allObjects.forEach(rock => reapplyHP(rock));
        };
      }

      game.mining.render();
    } catch(e) { console.warn('[Prestige] mining HP patch error:', e); }
  }

  // Clear selected recipe/action if it's now locked due to level reset.
  try {
    // Pattern 1: recipe-based skills (Smithing, Fletching, Crafting, Runecrafting, Herblore, Cooking)
    const selected = gameSkill.selectedRecipe;
    if (selected && (selected.level ?? 1) > 1) {
      const firstValid = gameSkill.actions?.allObjects?.find(a => (a.level ?? 1) <= 1 && a.realm === gameSkill.currentRealm)
                      ?? gameSkill.actions?.allObjects?.find(a => (a.level ?? 1) <= 1);
      if (firstValid) {
        gameSkill.selectedRecipeInRealm?.set(gameSkill.currentRealm, firstValid);
        if (typeof gameSkill.selectRecipeOnClick === 'function') gameSkill.selectRecipeOnClick(firstValid);
        else gameSkill.selectedRecipe = firstValid;
      }
    }
  } catch(e) {}
  try {
    // Pattern 2: action-based skills (Woodcutting, Fishing, Mining etc.)
    const selected = gameSkill.selectedAction ?? gameSkill.activeAction;
    if (selected && !gameSkill.selectedRecipe && (selected.level ?? 1) > 1) {
      const firstValid = gameSkill.actions?.allObjects?.find(a => (a.level ?? 1) <= 1);
      if (firstValid) {
        if (typeof gameSkill.selectActionOnClick === 'function') gameSkill.selectActionOnClick(firstValid);
        else if (typeof gameSkill.selectOnClick === 'function') gameSkill.selectOnClick(firstValid);
        else gameSkill.selectedAction = firstValid;
      }
    }
  } catch(e) {}

  try { if (gameSkill.isActive) gameSkill.stop(); } catch(e) {}

  // Clear worker assignments for recipes/actions now locked due to level reset
  try {
    const workers = _deps.stateM.getWorkers(skillId);
    let changed = false;
    workers.forEach((w, i) => {
      const assignedId = w.recipeId || w.treeId || w.constellationId;
      if (!assignedId) return;
      // Find the assigned action and check if it's still accessible at level 1
      const action = gameSkill.actions?.getObjectByID?.(assignedId);
      if (action && (action.level ?? 1) > 1) {
        w.recipeId        = null;
        w.treeId          = null;
        w.constellationId = null;
        _deps.workersM.stopWorkerByIndex?.(skillId, i);
        changed = true;
      }
    });
    if (changed) _deps.stateM.setWorkers(skillId, workers);
  } catch(e) {}
  try {
    const rq = gameSkill.renderQueue;
    if (rq) {
      // Only queue safe render flags -- skip recipeInfo/selectedRecipe which crash if no active recipe
      ['xp','level','previousLevel','progressBar'].forEach(k => {
        if (k in rq) rq[k] = true;
      });
      gameSkill.actions?.forEach(a => { if (rq.actionMastery?.add) rq.actionMastery.add(a); });
      if (rq.masteryPool instanceof Set) game.realms?.forEach(r => rq.masteryPool.add(r));
    }
    gameSkill.queueAllMasteryPoolsForRender?.();
  } catch(e) {}

  _deps.stateM.saveState();
  document.dispatchEvent(new CustomEvent('skill-prestige:prestiged', { detail: { skillId, count: state.prestigeCount } }));
  return true;
}

export function purchaseUpgrade(skillId, upgradeId, availablePoints) {
  const state   = _deps.stateM.getState(skillId);
  const upgrade = _deps.upgradesM.getUpgrade(skillId, upgradeId);
  if (!upgrade) return false;

  if (upgrade.worker) {
    const count = _deps.workersM.getWorkerCount(skillId);
    const cost  = _deps.upgradesM.getWorkerCost(count);
    if (availablePoints < cost) return false;
    state.spentPoints += cost;
    _deps.stateM.saveState();
    _deps.workersM.hireWorker(skillId);
    document.dispatchEvent(new CustomEvent('skill-prestige:upgrade-purchased', { detail: { skillId, upgradeId } }));
    return true;
  }

  const currentRank = state.upgrades[upgradeId] ?? 0;
  if (upgrade.maxRank && currentRank >= upgrade.maxRank) return false;
  const cost        = _deps.upgradesM.getCost(currentRank, upgradeId);
  if (availablePoints < cost) return false;
  state.upgrades[upgradeId] = currentRank + 1;
  state.spentPoints        += cost;
  _deps.stateM.saveState();
  document.dispatchEvent(new CustomEvent('skill-prestige:upgrade-purchased', { detail: { skillId, upgradeId } }));
  return true;
}

export function toggleUpgrade(skillId, upgradeId) {
  const state = _deps.stateM.getState(skillId);
  if (!state.disabled) state.disabled = {};
  state.disabled[upgradeId] = !state.disabled[upgradeId];
  _deps.stateM.saveState();
  document.dispatchEvent(new CustomEvent('skill-prestige:upgrade-toggled', { detail: { skillId, upgradeId } }));
}

export function purchaseCombatUpgrade(skillId, upgradeId, availablePoints) {
  const state       = _deps.stateM.getState(skillId);
  const combatSkill = _deps.combatM.getCombatSkill(skillId);
  if (!combatSkill) return false;
  const upgrade     = combatSkill.upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return false;
  const currentRank = state.upgrades[upgradeId] ?? 0;
  if (upgrade.maxRank && currentRank >= upgrade.maxRank) return false;
  const cost        = _deps.combatM.getCombatUpgradeCost(upgrade, currentRank);
  if (availablePoints < cost) return false;
  state.upgrades[upgradeId] = currentRank + 1;
  state.spentPoints        += cost;
  _deps.stateM.saveState();
  document.dispatchEvent(new CustomEvent('skill-prestige:upgrade-purchased', { detail: { skillId, upgradeId } }));
  return true;
}

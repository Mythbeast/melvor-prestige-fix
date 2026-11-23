// core/workers.mjs -- all background workers for all skills

const XP = 0.25;
const _intervals = {}; // skillId -> array of interval IDs

let _deps = null;
export function initAllWorkers(deps) { _deps = deps;
  Object.keys(_intervals).forEach(sid => {
    (_intervals[sid] ?? []).forEach((iv, i) => { if (iv) clearInterval(iv); });
  });
  // Start workers for all skills based on saved state
  ['woodcutting','fishing','firemaking','cooking','mining','smithing',
   'thieving','fletching','crafting','runecrafting','herblore','summoning',
   'astrology','agility','farming'].forEach(sid => {
    _intervals[sid] = [];
    _deps.stateM.getWorkers(sid).forEach((w, i) => {
      if (w.enabled !== false && (w.recipeId || w.treeId || w.constellationId || sid === 'agility' || sid === 'farming')) startWorker(sid, i);
    });
  });
}

export function hireWorker(skillId) {
  const workers = _deps.stateM.getWorkers(skillId);
  const index   = workers.length;
  workers.push({ enabled: true, recipeId: null, treeId: null, constellationId: null });
  _deps.stateM.setWorkers(skillId, workers);
  _deps.stateM.saveState();
  if (!_intervals[skillId]) _intervals[skillId] = [];
  document.dispatchEvent(new CustomEvent('skill-prestige:worker-hired', { detail: { skillId, index } }));
}

export function assignWorker(skillId, index, value) {
  const workers = _deps.stateM.getWorkers(skillId);
  if (!workers[index]) return;
  workers[index].recipeId       = value || null;
  workers[index].treeId         = value || null;
  workers[index].constellationId = value || null;
  _deps.stateM.setWorkers(skillId, workers);
  _deps.stateM.saveStateDeferred();
  stopWorker(skillId, index);
  if (value && workers[index].enabled) startWorker(skillId, index);
  document.dispatchEvent(new CustomEvent('skill-prestige:worker-assigned', { detail: { skillId, index } }));
}

export function toggleWorker(skillId, index) {
  const workers = _deps.stateM.getWorkers(skillId);
  if (!workers[index]) return;
  workers[index].enabled = !workers[index].enabled;
  _deps.stateM.setWorkers(skillId, workers);
  _deps.stateM.saveStateDeferred();
  if (workers[index].enabled) startWorker(skillId, index);
  else stopWorker(skillId, index);
  document.dispatchEvent(new CustomEvent('skill-prestige:worker-toggled', { detail: { skillId, index } }));
}

export function isWorkerRunning(skillId, index) { return !!(_intervals[skillId]?.[index]); }
export function getWorkerCount(skillId) { return _deps.stateM.getWorkers(skillId).length; }

function startWorker(skillId, index) {
  if (!_intervals[skillId]) _intervals[skillId] = [];
  if (_intervals[skillId][index]) return;
  const ms = getWorkerInterval(skillId);
  _intervals[skillId][index] = setInterval(() => tick(skillId, index), ms);
}
export function stopWorkerByIndex(skillId, index) { stopWorker(skillId, index); }
function stopWorker(skillId, index) {
  if (!_intervals[skillId]?.[index]) return;
  clearInterval(_intervals[skillId][index]);
  _intervals[skillId][index] = null;
}

function getWorkerInterval(skillId) {
  const map = { woodcutting:5000, fishing:6000, firemaking:7000, cooking:6000, mining:5000,
    smithing:5000, thieving:8000, fletching:5000, crafting:5000, runecrafting:5000,
    herblore:5000, summoning:5000, astrology:5000, agility:7000, farming:60000 };
  return map[skillId] ?? 5000;
}

function tick(skillId, index) {
  const workers = _deps.stateM.getWorkers(skillId);
  const w       = workers[index];
  if (!w || w.enabled === false) { stopWorker(skillId, index); return; }

  try {
    switch(skillId) {
      case 'woodcutting':  tickWoodcutting(w, index); break;
      case 'fishing':      tickFishing(w, index); break;
      case 'firemaking':   tickFiremaking(w, index); break;
      case 'cooking':      tickCooking(w, index); break;
      case 'mining':       tickMining(w, index); break;
      case 'agility':      tickAgility(w, index); break;
      case 'thieving':     tickThieving(w, index); break;
      case 'astrology':    tickAstrology(w, index); break;
      case 'farming':      tickFarming(w, index); break;
      default:             tickArtisan(skillId, w, index); break;
    }
  } catch(e) { console.warn(`[Prestige] Worker tick error for ${skillId}:`, e); }
}

function tickWoodcutting(w, index) {
  const sk = game.woodcutting;
  const tree = w.treeId ? sk.actions.getObjectByID(w.treeId) : null;
  if (!tree) return;
  if (sk.level < (tree.level ?? 1)) return;
  if (tree.product?.id) game.bank.addItem(tree.product, tree.baseQuantity ?? 1, true, false, false);
  sk.addXP(Math.max(1, Math.floor((tree.baseExperience ?? 0) * XP)), tree);
  try { sk.addMasteryXP(tree, Math.max(1, Math.floor((tree.baseExperience ?? 0) * XP))); } catch(e) {}
}

function tickFishing(w, index) {
  const sk = game.fishing;
  const fish = w.recipeId ? sk.actions?.getObjectByID(w.recipeId) : null;
  if (!fish) return;
  if (sk.level < (fish.level ?? 1)) return;
  if (fish.product?.id) game.bank.addItem(fish.product, 1, true, false, false);
  sk.addXP(Math.max(1, Math.floor((fish.baseExperience ?? 0) * XP)), fish);
  try { sk.addMasteryXP(fish, Math.max(1, Math.floor((fish.baseExperience ?? 0) * XP))); } catch(e) {}
}

function tickFiremaking(w, index) {
  const sk  = game.firemaking;
  const recipe = w.recipeId ? sk.actions.getObjectByID(w.recipeId) : null;
  if (!recipe) return;
  const logItem = recipe.log ?? recipe;
  if (!logItem || game.bank.getQty(logItem) < 1) return;
  game.bank.removeItemQuantity(logItem, 1, true);
  if (recipe.primaryProducts?.length > 0) recipe.primaryProducts.forEach(item => {
    if (!item) return;
    try { const info = sk.getPrimaryProductInfo(item, recipe); if (info?.chance > 0 && Math.random() * 100 < info.chance) if(item?.id) game.bank.addItem(item, info.quantity ?? 1, true, false, false); } catch(e) {}
  });
  sk.addXP(Math.max(1, Math.floor((recipe.baseExperience ?? 0) * XP)), recipe);
  try { sk.addMasteryXP(recipe, Math.max(1, Math.floor((recipe.baseExperience ?? 0) * XP))); } catch(e) {}
}

function tickCooking(w, index) {
  const sk = game.cooking;
  const recipe = w.recipeId ? sk.actions.getObjectByID(w.recipeId) : null;
  if (!recipe) return;
  if (sk.level < (recipe.level ?? 1)) return;
  for (const cost of (recipe.itemCosts ?? [])) { if (!cost?.item || game.bank.getQty(cost.item) < (cost.quantity ?? 1)) return; }
  for (const cost of (recipe.itemCosts ?? [])) { if (cost?.item) game.bank.removeItemQuantity(cost.item, cost.quantity ?? 1, true); }
  if (recipe.product?.id) game.bank.addItem(recipe.product, recipe.baseQuantity ?? 1, true, false, false);
  sk.addXP(Math.max(1, Math.floor((recipe.baseExperience ?? 0) * XP)), recipe);
  try { sk.addMasteryXP(recipe, Math.max(1, Math.floor((recipe.baseExperience ?? 0) * XP))); } catch(e) {}
}

function tickMining(w, index) {
  const sk   = game.mining;
  const rock = w.recipeId ? sk.actions.getObjectByID(w.recipeId) : null;
  if (!rock || rock.isRespawning || rock.currentHP <= 0) return;
  if (rock.product?.id) game.bank.addItem(rock.product, 1, true, false, false);
  sk.addXP(Math.max(1, Math.floor((rock.baseExperience ?? 0) * XP)), rock);
  try { sk.addMasteryXP(rock, Math.max(1, Math.floor((rock.baseExperience ?? 0) * XP))); } catch(e) {}
}

function tickThieving(w, index) {
  const sk  = game.thieving;
  const npc = w.recipeId ? sk.actions.getObjectByID(w.recipeId) : null;
  if (!npc) return;
  const successRate = sk.getNPCSuccessRate(npc) / 100;
  if (Math.random() >= successRate) return;
  // Currency
  if (npc.currencyDrops?.length > 0) npc.currencyDrops.forEach(drop => {
    if (!drop?.currency || !drop.quantity) return;
    try { const { min, max } = sk.getNPCCurrencyRange(npc, drop.currency, drop.quantity); drop.currency.add(min + Math.floor(Math.random() * (max - min + 1))); } catch(e) { drop.currency.add(drop.quantity); }
  });
  // Loot table
  if (npc.lootTable?.drops?.length > 0 && npc.lootTable.totalWeight > 0) {
    let roll = Math.random() * npc.lootTable.totalWeight;
    for (const drop of npc.lootTable.drops) {
      roll -= drop.weight;
      if (roll <= 0) { if (drop?.item) { const min = drop.minQuantity ?? 1, max = drop.maxQuantity ?? min; try { if(drop.item?.id) game.bank.addItem(drop.item, min + Math.floor(Math.random() * (max - min + 1)), true, false, false); } catch(e) {} } break; }
    }
  }
  // Area unique
  if (npc.area?.uniqueDrops?.length > 0 && Math.random() < sk.areaUniqueChance) {
    const drop = npc.area.uniqueDrops[Math.floor(Math.random() * npc.area.uniqueDrops.length)];
    if (drop?.item) try { if(drop.item?.id) game.bank.addItem(drop.item, drop.quantity ?? 1, true, false, false); } catch(e) {}
  }
  sk.addXP(Math.max(1, Math.floor((npc.baseExperience ?? 0) * XP)), npc);
  try { sk.addMasteryXP(npc, Math.max(1, Math.floor((npc.baseExperience ?? 0) * XP))); } catch(e) {}
}

function tickAstrology(w, index) {
  const sk           = game.astrology;
  const constellation = w.constellationId ? sk.actions.getObjectByID(w.constellationId) : null;
  if (!constellation || sk.level < (constellation.level ?? 1)) return;
  sk.addXP(Math.max(1, Math.floor((constellation.baseExperience ?? 0) * XP)), constellation);
  try { sk.addMasteryXP(constellation, Math.max(1, Math.floor((constellation.baseExperience ?? 0) * XP))); } catch(e) {}
}

function tickAgility(w, index) {
  const ag = game.agility;
  let totalXP = 0, totalGP = 0;
  try {
    // Try forEachActiveObstacle first (preferred)
    if (typeof ag.forEachActiveObstacle === 'function') {
      ag.forEachActiveObstacle(
        obs => {
          totalXP += obs.baseExperience ?? 0;
          (obs.currencyRewards ?? []).forEach(r => { if (r?.currency?.id === 'melvorD:GP') totalGP += r.quantity ?? 0; });
        },
        pil => { totalXP += pil.baseExperience ?? 0; }
      );
    } else {
      // Fallback: iterate obstacles directly
      ag.courses?.forEach(course => {
        course?.builtObstacles?.forEach(obs => {
          if (!obs) return;
          totalXP += obs.baseExperience ?? 0;
          (obs.currencyRewards ?? []).forEach(r => { if (r?.currency?.id === 'melvorD:GP') totalGP += r.quantity ?? 0; });
        });
        course?.builtPillars?.forEach(pil => { if (pil) totalXP += pil.baseExperience ?? 0; });
      });
    }
  } catch(e) { console.warn('[Prestige] tickAgility error:', e); }
  if (totalXP <= 0) return;
  // ag.addXP requires a valid action object -- pass a real obstacle instead of null
  // Find the first active obstacle to use as the action context
  let firstObs = null;
  try {
    ag.forEachActiveObstacle(obs => { if (!firstObs && obs) firstObs = obs; }, () => {});
  } catch(e) {}
  const xp = Math.max(1, Math.floor(totalXP * XP));
  try {
    if (firstObs) ag.addXP(xp, firstObs);
    else game.agility.xp = Math.min(game.agility.xp + xp, 200000000);
  } catch(e) {
    try { game.agility.xp = Math.min(game.agility.xp + xp, 200000000); } catch(e2) {}
  }
  if (totalGP > 0) try { game.gp.add(Math.max(1, Math.floor(totalGP * XP))); } catch(e) {}
}

function tickArtisan(skillId, w, index) {
  const skillMap = { smithing:game.smithing, fletching:game.fletching, crafting:game.crafting,
    runecrafting:game.runecrafting, herblore:game.herblore, summoning:game.summoning };
  const sk = skillMap[skillId];
  if (!sk) return;
  const recipe = w.recipeId ? sk.actions.getObjectByID(w.recipeId) : null;
  if (!recipe || sk.level < (recipe.level ?? 1)) return;
  for (const cost of (recipe.itemCosts ?? [])) { if (!cost?.item || game.bank.getQty(cost.item) < (cost.quantity ?? 1)) return; }
  for (const cost of (recipe.itemCosts ?? [])) { if (cost?.item) game.bank.removeItemQuantity(cost.item, cost.quantity ?? 1, true); }
  const product = skillId === 'herblore' ? recipe.potions?.[0] : recipe.product;
  if (product?.id) game.bank.addItem(product, recipe.baseQuantity ?? 1, true, false, false);
  sk.addXP(Math.max(1, Math.floor((recipe.baseExperience ?? 0) * XP)), recipe);
  try { sk.addMasteryXP(recipe, Math.max(1, Math.floor((recipe.baseExperience ?? 0) * XP))); } catch(e) {}
}

function tickFarming(w, index) {
  const sk = game.farming;
  if (!sk) return;
  // Harvest all ready plots then replant with the same seed
  const plots = sk.plots?.allObjects ?? sk.actions?.allObjects ?? [];
  plots.forEach(plot => {
    try {
      if (!plot) return;
      // Harvest if ready
      const isReady = plot.state === 'Ready' || plot.isReadyToHarvest?.() || plot.readyToHarvest;
      if (isReady && typeof sk.harvest === 'function') {
        const seed = plot.crop ?? plot.seedItem ?? null;
        sk.harvest(plot);
        // Replant same crop if we have seeds
        if (seed && game.bank.getQty(seed) > 0 && typeof sk.plant === 'function') {
          game.bank.removeItemQuantity(seed, 1, true);
          sk.plant(plot, seed);
        }
      }
    } catch(e) {}
  });
  // Award passive XP proportional to number of plots being worked
  const activePlots = plots.filter(p => p && (p.crop || p.seedItem));
  if (activePlots.length > 0) {
    const baseXP = 10 * activePlots.length;
    sk.addXP(Math.max(1, Math.floor(baseXP * XP)), activePlots[0]);
  }
}

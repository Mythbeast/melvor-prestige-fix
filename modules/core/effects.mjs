// core/effects.mjs -- all skill effect patches
let _uiM = null;
export function setUIM(uiM) { _uiM = uiM; }
function toast(skillId, msg) { try { _uiM?.showEffectToast(skillId, msg); } catch(e) {} }
function isOfflineRunning() { return !!(game._forceOfflineLoop || (game._offlineInfo?.startTime > 0)); }


const SKILL_XP_SOURCE    = { id: 'skill-prestige-skillxp',    name: 'Prestige Upgrades' };
const MASTERY_XP_SOURCE  = { id: 'skill-prestige-masteryxp',  name: 'Prestige Upgrades' };

function injectMasteryXPModifiers(skills, deps) {
  try {
    const player = game.combat?.player;
    if (!player?.modifiers) return;
    const pm     = player.modifiers;
    pm.removeModifiers(MASTERY_XP_SOURCE.id ?? MASTERY_XP_SOURCE);
    const modDef = game.modifierRegistry?.getObjectByID('melvorD:masteryXP');
    if (!modDef) return;
    skills.forEach(skill => {
      try {
        const rank = deps.stateM.getState(skill.id).upgrades.masteryXP ?? 0;
        if (rank === 0) return;
        const bonus     = deps.upgradesM.getTotalBonus('masteryXP', rank, skill.id) * 100;
        const gsObj     = skill.gameSkill?.();
        if (!gsObj) return;
        const mv = new ModifierValue(modDef, bonus, { skill: gsObj });
        pm.addModifier(MASTERY_XP_SOURCE, mv, 1, 1);
      } catch(e) {}
    });
  } catch(e) {}
}

function injectSkillXPModifiers(skills, deps) {
  try {
    const player = game.combat?.player;
    if (!player?.modifiers) return;
    const pm = player.modifiers;
    // Always remove and re-add -- computeModifiers rebuilds the table from scratch
    // so our modifiers are wiped on every call regardless of whether ranks changed.
    pm.removeModifiers(SKILL_XP_SOURCE.id ?? SKILL_XP_SOURCE);
    const modDef = game.modifierRegistry?.getObjectByID('melvorD:skillXP');
    if (!modDef) return;
    skills.forEach(skill => {
      try {
        const rank = deps.stateM.getState(skill.id).upgrades.skillXP ?? 0;
        if (rank === 0) return;
        const bonus = deps.upgradesM.getTotalBonus('skillXP', rank, skill.id) * 100;
        const gameSkillObj = skill.gameSkill?.();
        if (!gameSkillObj) return;
        const mv = new ModifierValue(modDef, bonus, { skill: gameSkillObj });
        pm.addModifier(SKILL_XP_SOURCE, mv, 1, 1);
      } catch(e) {}
    });
  } catch(e) {}
}

// Per-skill throttle for xp-gained events -- avoids allocating events on every XP tick
const _xpEventThrottle = {};
function dispatchXPGained(skillId) {
  if (_xpEventThrottle[skillId]) return;
  _xpEventThrottle[skillId] = true;
  document.dispatchEvent(new CustomEvent('skill-prestige:xp-gained', { detail: { skillId } }));
  setTimeout(() => { _xpEventThrottle[skillId] = false; }, 500);
}

export function setupAllEffects(ctx, skills, deps) {
  // Guard against Forgotten Shore items corrupting the bank
  // Return true (not false) on blocked items so Melvor doesn't stop the skill
  try {
    ctx.patch(Bank, 'addItem').replace(function(o, item, quantity, ...args) {
      if (!item?.sellsFor?.currency) return true;
      try { return o(item, quantity, ...args); } catch(e) {
        if (e instanceof TypeError) return true;
        throw e;
      }
    });
  } catch(e) {}
  try {
    ctx.patch(Bank, 'render').replace(function(o) {
      try { return o(); } catch(e) {
        if (e instanceof TypeError) return;
        throw e;
      }
    });
  } catch(e) {}

  // Patch Player.computeModifiers to re-inject skill XP modifiers on every stat recalc.
  // This is the same pattern combat_effects uses for combat modifiers.
  try {
    ctx.patch(Player, 'computeModifiers').after(function() {
      injectSkillXPModifiers(skills, deps);
      injectMasteryXPModifiers(skills, deps);
      // Also re-inject star alignment modifiers -- computeModifiers wipes them too
      try { deps.starM?.reinjectable?.(); } catch(e2) {}
    });
  } catch(e) {
    setInterval(() => { injectSkillXPModifiers(skills, deps); try { deps.starM?.reinjectable?.(); } catch(e2) {} }, 1000);
  }

  // Star Alignment: patch Skill.addXP to apply the XP bonus when a skill is buffed
  try {
    ctx.patch(Skill, 'addXP').replace(function(o, amount, action) {
      const match = skills.find(s => { try { return s.gameSkill()?.id === this.id; } catch(_) { return false; } });
      if (!match) return o(amount, action);
      const actionId = action?.id ?? null;
      return o(deps.starM.applyXPBonus(match.id, amount, actionId), action);
    });
  } catch(e) {}

  // Re-inject immediately when a non-combat upgrade is purchased
  const skillIds = new Set(skills.map(s => s.id));
  document.addEventListener('skill-prestige:upgrade-purchased', e => {
    if (!skillIds.has(e.detail?.skillId)) return;
    try {
      const player = game.combat?.player;
      injectSkillXPModifiers(skills, deps);
      injectMasteryXPModifiers(skills, deps);
      player?.computeModifiers?.();
    } catch(e2) {}
  });

  skills.forEach(skill => setupSkillEffects(ctx, skill, deps));
}

function setupSkillEffects(ctx, skill, deps) {
  const sid = skill.skillId;
  const id  = skill.id;
  const gs  = skill.gameSkill;
  const gc  = skill.gameClass;

  try {
    const GC = gc();
    if (GC && GC.prototype.addXP) {
      ctx.patch(GC, 'addXP').replace(function(o, amount, masteryAction) {
        const result = o(amount, masteryAction);
        if (!isOfflineRunning()) dispatchXPGained(id);
        const vLevel = deps.stateM.getVirtualLevel(gs());
        if (vLevel >= deps.stateM.nextPrestigeLevel(id))
          document.dispatchEvent(new CustomEvent('skill-prestige:ready', { detail: { skillId: id } }));
        return result;
      });
    } else {
      ctx.patch(Skill, 'addXP').replace(function(o, amount, masteryAction) {
        if (this.id !== sid) return o(amount, masteryAction);
        const result = o(amount, masteryAction);
        if (!isOfflineRunning()) dispatchXPGained(id);
        const vLevel = deps.stateM.getVirtualLevel(gs());
        if (vLevel >= deps.stateM.nextPrestigeLevel(id))
          document.dispatchEvent(new CustomEvent('skill-prestige:ready', { detail: { skillId: id } }));
        return result;
      });
    }
  } catch(e) {
    ctx.patch(Skill, 'addXP').replace(function(o, amount, masteryAction) {
      if (this.id !== sid) return o(amount, masteryAction);
      const result = o(amount, masteryAction);
      if (!isOfflineRunning()) dispatchXPGained(id);
      const vLevel = deps.stateM.getVirtualLevel(gs());
      if (vLevel >= deps.stateM.nextPrestigeLevel(id))
        document.dispatchEvent(new CustomEvent('skill-prestige:ready', { detail: { skillId: id } }));
      return result;
    });
  }

  // Mastery XP patch -- patch specific class to avoid 14-layer chain
  // masteryXP bonus applied via melvorD:masteryXP modifier injection -- shows in UI breakdown

  // Mastery Share patch -- distribute fraction of mastery XP to other unlocked actions
  try {
    const GC = gc();
    if (GC && GC.prototype.addMasteryXP) {
      ctx.patch(GC, 'addMasteryXP').replace(function(o, action, xp) {
        const result = o(action, xp);
        const state  = deps.stateM.getState(id);
        const rank   = (!state.disabled?.masteryShare) ? (state.upgrades.masteryShare ?? 0) : 0;
        if (rank === 0 || !(xp > 0)) return result;
        // chance = rank * 0.5%, shareAmount = (1% + rank * 0.5%) of xp gained
        const triggerChance = rank * 0.005;
        if (Math.random() >= triggerChance) return result;
        const shareRate = 0.01 + (rank * 0.005);
        const shareXP   = xp * shareRate;
        if (shareXP <= 0) return result;
        const allActions = gs().actions?.allObjects ?? [];
        allActions.forEach(other => {
          if (!other || other.id === action?.id) return;
          try {
            const masteryLevel = gs().getMasteryLevel?.(other) ?? 0;
            if (masteryLevel === 0 && (other.level ?? 1) > (gs().level ?? 0)) return;
            o(other, shareXP);
          } catch(e) {}
        });
        return result;
      });
    }
  } catch(e) {}

  // Interval patch -- getPercentageIntervalModifier + modifyInterval floor bypass
  try {
    const GameClass = gc();
    if (GameClass && GameClass.prototype.getPercentageIntervalModifier) {
      ctx.patch(GameClass, 'getPercentageIntervalModifier').replace(function(o, action) {
        const base = o(action);
        const rank = deps.stateM.getState(id).upgrades.interval ?? 0;
        if (rank === 0) return base;
        return base - (deps.upgradesM.getTotalBonus('interval', rank, id) * 100);
      });
    }
  } catch(e) {}

  try {
    const GameClass = gc();
    if (GameClass && GameClass.prototype.modifyInterval) {
      ctx.patch(GameClass, 'modifyInterval').replace(function(o, interval, action) {
        const rank = deps.stateM.getState(id).upgrades.interval ?? 0;
        const pct  = this.getPercentageIntervalModifier ? this.getPercentageIntervalModifier(action) : 0;
        const flat = this.getFlatIntervalModifier ? this.getFlatIntervalModifier(action) : 0;
        let r = interval * (1 + pct / 100) + flat;
        if (this.game?.modifiers?.halveSkillInterval > 0) r /= 2;
        // Apply prestige interval reduction
        if (rank > 0) r *= (1 - deps.upgradesM.getTotalBonus('interval', rank, id));
        // Apply star alignment bonus
        // Apply star alignment interval bonus (action-specific)
        try {
          const actionId = action?.id ?? null;
          r = deps.starM.applyIntervalBonus(id, r, actionId);
        } catch(_) {}
        return Math.max(Math.round(r / 50) * 50, deps.stateM.getIntervalFloorMs());
      });
    }
  } catch(e) {}

  // Astrology constellation interval
  if (id === 'astrology') {
    try {
      ctx.patch(Astrology, 'getConstellationInterval').replace(function(o, constellation) {
        const base = o(constellation);
        if (!Number.isFinite(base) || base <= 0) return base;
        const rank = deps.stateM.getState(id).upgrades.interval ?? 0;
        if (rank === 0) return base;
        const bonus = deps.upgradesM.getTotalBonus('interval', rank, id) * 100;
        return Math.max(deps.stateM.getIntervalFloorMs(), Math.round(base * (1 - bonus / 100) / 50) * 50);
      });
    } catch(e) {}
  }

  // Action rewards patch
  setupActionEffects(ctx, skill, deps);
}

function setupActionEffects(ctx, skill, deps) {
  const id = skill.id;
  const gs = skill.gameSkill;

  // Skills that use action not actionRewards
  const useActionPatch = ['woodcutting','fishing','firemaking','cooking','mining',
                          'thieving','agility','astrology'];

  if (id === 'agility') {
    ctx.patch(Agility, 'action').replace(function(o) {
      if (!gs().isActive) return o();
      const result = o();
      const state  = deps.stateM.getState(id);
      const gpRank = state.upgrades.bonusGP ?? 0;
      if (gpRank > 0) {
        let obs; try { obs = gs().activeObstacle; } catch(e) {}
        if (obs?.currencyRewards?.length > 0) {
          const chance = deps.upgradesM.getTotalBonus('bonusGP', gpRank, id);
          const bonus  = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
          if (bonus > 0) obs.currencyRewards.forEach(r => { if (r?.currency?.id === 'melvorD:GP') r.currency.add((r.quantity ?? 0) * bonus); });
        }
      }
      return result;
    });
    try {
      ctx.patch(Agility, 'getObstacleNegMult').replace(function(o) {
        const base = o();
        const rank = deps.stateM.getState(id).upgrades.negMult ?? 0;
        if (rank === 0) return base;
        return Math.max(0, base - deps.upgradesM.getTotalBonus('negMult', rank, id));
      });
    } catch(e) {}
  }

  if (id === 'astrology') {
    ctx.patch(Astrology, 'action').replace(function(o) {
      const result = o();
      const state  = deps.stateM.getState(id);
      const bonusRank = state.upgrades.bonusStardust ?? 0;
      if (bonusRank > 0) {
        // Normal stardust: 2% per rank
        const normalChance = bonusRank * 0.02;
        const normalBonus  = Math.floor(normalChance) + (Math.random() < (normalChance % 1) ? 1 : 0);
        if (normalBonus > 0) {
          try {
            let sd = game.items.getObjectByID('melvorD:Stardust');
            if (!sd) sd = game.items.getObjectByID('melvorF:Stardust');
            if (sd) { game.bank.addItem(sd, normalBonus, true, false, false); toast(id, 'Stardust Collector: +' + normalBonus + ' Stardust'); }
          } catch(e) {}
        }
        // Golden stardust: 1% per rank
        const goldenChance = bonusRank * 0.01;
        const goldenBonus  = Math.floor(goldenChance) + (Math.random() < (goldenChance % 1) ? 1 : 0);
        if (goldenBonus > 0) {
          try {
            let gsd = game.items.getObjectByID('melvorD:Golden_Stardust');
            if (!gsd) gsd = game.items.getObjectByID('melvorF:Golden_Stardust');
            if (gsd) { game.bank.addItem(gsd, goldenBonus, true, false, false); toast(id, 'Stardust Collector: +' + goldenBonus + ' Golden Stardust'); }
          } catch(e) {}
        }
      }
      const meteorRank = state.upgrades.meteoriteChance ?? 0;
      if (meteorRank > 0) {
        const extraChance = deps.upgradesM.getTotalBonus('meteoriteChance', meteorRank, id);
        if (Math.random() < extraChance) {
          try { gs().rollForMeteorite(); toast(id, 'Meteorite Hunter: found a meteorite!'); } catch(e) {}
        }
      }
      return result;
    });
  }

  if (id === 'thieving') {
    ctx.patch(Thieving, 'action').replace(function(o) {
      if (!gs().isActive) return o();
      const result = o();
      const state  = deps.stateM.getState(id);
      let npc; try { npc = gs().masteryAction; } catch(e) { return result; }
      if (!npc) return result;
      const lootRank = state.upgrades.bonusLoot ?? 0;
      if (lootRank > 0 && npc.lootTable?.drops?.length > 0 && npc.lootTable.totalWeight > 0) {
        const chance = deps.upgradesM.getTotalBonus('bonusLoot', lootRank, id);
        const extras = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
        for (let i = 0; i < extras; i++) rollLootTable(npc);
        if (extras > 0) toast(id, 'Extra Pockets: +' + extras + ' bonus loot roll');
      }
      const gpRank = state.upgrades.bonusGP ?? 0;
      if (gpRank > 0 && npc.currencyDrops?.length > 0) {
        const chance = deps.upgradesM.getTotalBonus('bonusGP', gpRank, id);
        const extras = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
        if (extras > 0) npc.currencyDrops.forEach(drop => {
          if (!drop?.currency || !drop.quantity) return;
          try { const { min, max } = gs().getNPCCurrencyRange(npc, drop.currency, drop.quantity); drop.currency.add((min + Math.floor(Math.random() * (max - min + 1))) * extras); } catch(e) { drop.currency.add(drop.quantity * extras); }
        });
      }
      return result;
    });
    try {
      ctx.patch(Thieving, 'getPercentageIntervalModifier').replace(function(o, action) {
        const base = o(action);
        const rank = deps.stateM.getState(id).upgrades.interval ?? 0;
        if (rank === 0) return base;
        return base - (deps.upgradesM.getTotalBonus('interval', rank, id) * 100);
      });
      ctx.patch(Thieving, 'getStealthAgainstNPC').replace(function(o, npc) {
        const base  = o(npc);
        const bonus = deps.upgradesM.getTotalBonus('perception', deps.stateM.getState(id).upgrades.perception ?? 0, id);
        return base + bonus;
      });
    } catch(e) {}
  }

  if (id === 'firemaking') {
    // Grand Bonfire -- extends bonfire duration/XP bonus
    try {
      ctx.patch(Firemaking, 'getBonfireInterval').replace(function(o, recipe) {
        const base = o(recipe);
        if (!Number.isFinite(base) || base <= 0) return base;
        const rank = deps.stateM.getState(id).upgrades.bonfireXP ?? 0;
        if (rank === 0) return base;
        return Math.floor(base * (1 + deps.upgradesM.getTotalBonus('bonfireXP', rank, id)));
      });
    } catch(e) {}

    ctx.patch(Firemaking, 'action').replace(function(o) {
      if (!gs().isActive) return o();
      const result = o();
      const state  = deps.stateM.getState(id);
      let recipe; try { recipe = gs().activeRecipe; } catch(e) { return result; }
      if (!recipe) return result;
      const bonusRank = state.upgrades.bonusItem ?? 0;
      if (bonusRank > 0) {
        const chance = deps.upgradesM.getTotalBonus('bonusItem', bonusRank, id);
        const bonus  = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
        if (bonus > 0 && recipe.log) {
          for (let i = 0; i < bonus; i++) { gs().addXP(recipe.baseExperience, recipe); try { gs().addMasteryXP(recipe, recipe.baseExperience); } catch(e) {} }
        }
      }
      const byproductRank = state.upgrades.byproduct ?? 0;
      if (byproductRank > 0 && recipe.primaryProducts?.length > 0) {
        const chance = deps.upgradesM.getTotalBonus('byproduct', byproductRank, id);
        const extras = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
        if (extras > 0) recipe.primaryProducts.forEach(item => { if (item) try { const info = gs().getPrimaryProductInfo(item, recipe); game.bank.addItem(item, (info?.quantity ?? 1) * extras, true, false, false); } catch(e) {} });
      }
      return result;
    });
  }

  if (id === 'cooking') {
    ctx.patch(Cooking, 'action').replace(function(o) {
      if (!gs().isActive) return o();
      const result = o();
      const state  = deps.stateM.getState(id);
      let recipe; try { recipe = gs().activeRecipe; } catch(e) { return result; }
      if (!recipe) return result;
      const bonusRank = state.upgrades.bonusItem ?? 0;
      if (bonusRank > 0 && recipe.product) {
        const chance = deps.upgradesM.getTotalBonus('bonusItem', bonusRank, id);
        const bonus  = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
        if (bonus > 0) { game.bank.addItem(recipe.product, bonus * (recipe.baseQuantity ?? 1), true, false, false); for (let i = 0; i < bonus; i++) { gs().addXP(recipe.baseExperience, recipe); try { gs().addMasteryXP(recipe, recipe.baseExperience); } catch(e) {} } toast(id, 'Double Portion: +' + bonus + ' bonus cooked item'); }
      }
      const batchRank = state.upgrades.batchCook ?? 0;
      if (batchRank > 0 && recipe) {
        const chance = deps.upgradesM.getTotalBonus('batchCook', batchRank, id);
        const batchProc = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
        if (batchProc > 0) {
          let extras = 0;
          for (let i = 0; i < 1 + batchRank; i++) {
            if ((recipe.itemCosts ?? []).every(c => c?.item && game.bank.getQty(c.item) >= (c.quantity ?? 1) * (i + 1))) extras++;
            else break;
          }
          if (extras > 0) {
            (recipe.itemCosts ?? []).forEach(c => { if (c?.item) game.bank.removeItemQuantity(c.item, (c.quantity ?? 1) * extras, true); });
            if (recipe.product) game.bank.addItem(recipe.product, extras * (recipe.baseQuantity ?? 1), true, false, false);
            for (let i = 0; i < extras; i++) { gs().addXP(recipe.baseExperience, recipe); try { gs().addMasteryXP(recipe, recipe.baseExperience); } catch(e) {} }
          }
        }
      }
      const healRank = state.upgrades.healingBonus ?? 0;
      if (healRank > 0 && recipe?.product) {
        const item = recipe.product;
        if (item && typeof item.healingValue !== 'undefined') { if (!item._prestigeHealBase) item._prestigeHealBase = item.healingValue; item.healingValue = item._prestigeHealBase + deps.upgradesM.getTotalBonus('healingBonus', healRank, id); }
      }
      return result;
    });
  }

  if (id === 'mining') {
    // Reinforced Pickaxe -- increases rock max HP
    try {
      ctx.patch(Mining, 'getRockMaxHP').replace(function(o, rock) {
        const base = o(rock);
        const rank = deps.stateM.getState(id).upgrades.rockHP ?? 0;
        if (rank === 0) return base;
        return Math.max(1, Math.floor(base * (1 + deps.upgradesM.getTotalBonus('rockHP', rank, id))));
      });
    } catch(e) {}

    ctx.patch(Mining, 'action').replace(function(o) {
      if (!gs().isActive) return o();
      const result = o();
      const state  = deps.stateM.getState(id);
      let rock; try { rock = gs().activeRock; } catch(e) {}
      const preserveRank = state.upgrades.preserveHP ?? 0;
      if (preserveRank > 0 && rock && rock.currentHP < rock.maxHP) {
        if (Math.random() < deps.upgradesM.getTotalBonus('preserveHP', preserveRank, id)) rock.currentHP = Math.min(rock.currentHP + 1, rock.maxHP);
      }
      const smeltRank = (state.upgrades.smeltOre ?? 0) && !state.disabled?.smeltOre ? state.upgrades.smeltOre : 0;

      // Rich Vein — bonus ore chance (works on all rocks including rune essence)
      const bonusRank = state.upgrades.bonusItem ?? 0;
      if (bonusRank > 0 && rock?.product?.sellsFor?.currency) {
        const chance = deps.upgradesM.getTotalBonus('bonusItem', bonusRank, id);
        const bonus  = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
        if (bonus > 0) {
          game.bank.addItem(rock.product, bonus, true, false, false);
          gs().addXP(rock.xp ?? 0, rock);
          try { gs().addMasteryXP(rock, rock.xp ?? 0); } catch(e) {}
          toast(id, 'Rich Vein: +' + bonus + ' ' + (rock.product._name ?? 'Ore'));
        }
      }

      // Gem Seeker — gem drop chance (works on all rocks including rune essence)
      const gemRank = state.upgrades.gemChance ?? 0;
      if (gemRank > 0) {
        const chance = deps.upgradesM.getTotalBonus('gemChance', gemRank, id);
        if (Math.random() < chance) {
          try {
            // Use Melvor's gem table if available, otherwise pick from known gems
            const gems = game.mining?.gemTable ?? [
              'melvorD:Sapphire','melvorD:Ruby','melvorD:Emerald','melvorD:Diamond',
              'melvorD:Topaz','melvorD:Jade','melvorD:Opal'
            ].map(id => game.items.getObjectByID(id)).filter(Boolean);
            if (gems?.length) {
              const gem = Array.isArray(gems) ? gems[Math.floor(Math.random()*gems.length)] : gems.getDrop?.()?.item;
              if (gem?.sellsFor?.currency) {
                game.bank.addItem(gem, 1, true, false, false);
                toast(id, 'Gem Seeker: Found ' + (gem._name ?? 'Gem') + '!');
              }
            }
          } catch(e) {}
        }
      }
      if (smeltRank > 0 && rock?.product) {
        const chance = deps.upgradesM.getTotalBonus('smeltOre', smeltRank, id);
        const procs  = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
        if (procs > 0) {
          const recipe = game.smithing?.actions?.find(r => r.itemCosts?.some(c => c.item?.id === rock.product.id));
          if (recipe?.product) {
            const oreCost = recipe.itemCosts.find(c => c.item?.id === rock.product.id);
            const actual  = Math.min(procs, Math.floor(game.bank.getQty(rock.product) / (oreCost?.quantity ?? 1)));
            if (actual > 0) {
              game.bank.removeItemQuantity(rock.product, (oreCost?.quantity ?? 1) * actual, true);
              recipe.itemCosts.forEach(cost => { if (cost.item?.id === rock.product.id) return; const n = (cost.quantity ?? 1) * actual; if (game.bank.getQty(cost.item) >= n) game.bank.removeItemQuantity(cost.item, n, true); });
              game.bank.addItem(recipe.product, actual * (recipe.baseQuantity ?? 1), true, false, false);
              toast(id, 'Field Smelter: smelted ' + actual + ' ore into bar');
              game.smithing.addXP(recipe.baseExperience * actual, recipe);
              try { game.smithing.addMasteryXP(recipe, recipe.baseExperience * actual); } catch(e) {}
            }
          }
        }
      }
      return result;
    });
    try {
      ctx.patch(Mining, 'startRespawningRock').replace(function(o, rock) {
        const rank = deps.stateM.getState(id).upgrades.fastRespawn ?? 0;
        if (rank === 0) return o(rock);
        const orig = rock.baseRespawnInterval;
        rock.baseRespawnInterval = Math.max(200, Math.floor(orig * (1 - deps.upgradesM.getTotalBonus('fastRespawn', rank, id))));
        const r = o(rock);
        rock.baseRespawnInterval = orig;
        return r;
      });
    } catch(e) {}
  }

  // Generic ArtisanSkill action patch (smithing, fletching, crafting, runecrafting, herblore, summoning)
  const artisanSkills = { smithing:Smithing, fletching:Fletching, crafting:Crafting, runecrafting:Runecrafting, herblore:Herblore, summoning:Summoning };
  const GameClass = artisanSkills[id];
  if (GameClass) {
    ctx.patch(GameClass, 'action').replace(function(o) {
      if (!gs().isActive) return o();
      const result = o();
      const state  = deps.stateM.getState(id);
      let recipe; try { recipe = gs().activeRecipe; } catch(e) { return result; }
      if (!recipe) return result;
      // Bonus item
      const bonusRank = state.upgrades.bonusItem ?? 0;
      if (bonusRank > 0) {
        const chance = deps.upgradesM.getTotalBonus('bonusItem', bonusRank, id);
        const bonus  = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
        const product = id === 'herblore' ? recipe.potions?.[0] : recipe.product;
        if (bonus > 0 && product) { game.bank.addItem(product, bonus * (recipe.baseQuantity ?? 1), true, false, false); for (let i = 0; i < bonus; i++) { gs().addXP(recipe.baseExperience, recipe); try { gs().addMasteryXP(recipe, recipe.baseExperience); } catch(e) {} } toast(id, 'Bonus output: +' + bonus + ' ' + (product._name ?? product._localID ?? 'item')); }
      }
      // Preserve mats
      const preserveRank = (state.upgrades.preserveMats ?? 0) && !state.disabled?.preserveMats ? state.upgrades.preserveMats : 0;
      if (preserveRank > 0) {
        const chance = deps.upgradesM.getTotalBonus('preserveMats', preserveRank, id);
        if (Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0) > 0) {
          (recipe.itemCosts ?? []).forEach(cost => { if (cost?.item) game.bank.addItem(cost.item, cost.quantity ?? 1, true, false, false); }); toast(id, 'Preserved materials');
        }
      }
      return result;
    });
  }

  // Fishing action patch -- Seaside Chef + bonus fish
  if (id === 'fishing') {
    // Treasure Hunter -- reduce junk chance, transfer to fish
    try {
      ctx.patch(Fishing, 'getAreaChances').replace(function(o, area, fish) {
        const chances = o(area, fish);
        const rank    = deps.stateM.getState(id).upgrades.specialFind ?? 0;
        if (rank === 0 || !chances) return chances;
        const reduction = Math.min(deps.upgradesM.getTotalBonus('specialFind', rank, id), chances.junk ?? 0);
        chances.junk = Math.max(0, (chances.junk ?? 0) - reduction);
        chances.fish = Math.min(100, (chances.fish ?? 0) + reduction);
        return chances;
      });
    } catch(e) {}

    try {
      ctx.patch(Fishing, 'action').replace(function(o) {
        const result = o();
        const state  = deps.stateM.getState(id);
        // Get the active fish
        let fish = null;
        try {
          const area = gs().activeArea;
          fish = area?.fish?.find(f => gs().level >= (f.level ?? 1)) ?? null;
          if (!fish) fish = gs().activeFish ?? null;
        } catch(e) {}
        if (!fish?.product) return result;

        // Bonus fish
        const bonusRank = state.upgrades.bonusItem ?? 0;
        if (bonusRank > 0) {
          const chance = deps.upgradesM.getTotalBonus('bonusItem', bonusRank, id);
          const bonus  = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
          if (bonus > 0) {
            game.bank.addItem(fish.product, bonus, true, false, false);
            gs().addXP(fish.baseExperience * bonus, fish);
            try { gs().addMasteryXP(fish, fish.baseExperience * bonus); } catch(e) {}
            toast(id, 'Full Net: +' + bonus + ' ' + (fish.product?._name ?? 'Fish'));
          }
        }

        // Treasure Hunter -- extra special item rolls
        const specialRank = state.upgrades.specialFind ?? 0;
        if (specialRank > 0) {
          const totalChance = deps.upgradesM.getTotalBonus('specialFind', specialRank, id);
          const extras      = Math.floor(totalChance) + (Math.random() < (totalChance % 1) ? 1 : 0);
          if (extras > 0) {
            try {
              let area; try { area = gs().activeArea; } catch(e) {}
              const pool = area?.specialItems ?? fish?.area?.specialItems ?? [];
              if (pool.length > 0) {
                for (let i = 0; i < extras; i++) {
                  const pick = pool[Math.floor(Math.random() * pool.length)];
                  if (pick?.item) game.bank.addItem(pick.item, 1, true, false, false);
                }
                toast(id, 'Treasure Hunter: found ' + extras + ' special item');
              }
            } catch(e) {}
          }
        }

        // Seaside Chef -- cook caught fish
        const cookRank = (!state.disabled?.cookFish) ? (state.upgrades.cookFish ?? 0) : 0;
        if (cookRank > 0) {
          const totalChance = deps.upgradesM.getTotalBonus('cookFish', cookRank, id);
          const wantToCook  = Math.floor(totalChance) + (Math.random() < (totalChance % 1) ? 1 : 0);
          const rawItem     = fish.product;
          const bankQty     = game.bank.getQty(rawItem);
          const actualCook  = Math.min(wantToCook, bankQty);
          if (actualCook > 0) {
            const recipe = game.cooking?.actions.find(r => r.itemCosts?.some(c => c.item?.id === rawItem.id));
            if (recipe?.product) {
              game.bank.removeItemQuantity(rawItem, actualCook, true);
              game.bank.addItem(recipe.product, actualCook * (recipe.baseQuantity ?? 1), true, false, false);
              for (let i = 0; i < actualCook; i++) {
                game.cooking.addXP(recipe.baseExperience, recipe);
                try { game.cooking.addMasteryXP(recipe, recipe.baseExperience); } catch(e) {}
              }
              toast(id, 'Seaside Chef: cooked ' + actualCook + ' ' + (recipe.product._name ?? 'fish'));
            }
          }
        }

        return result;
      });
    } catch(e) {}
  }

  // Woodcutting bonuses triggered via addXP hook (safe — fires after rewards complete)
  if (id === 'woodcutting') {
    try {
      let _wcLastTick = -1;
      let _wcLastMs   = 0;
      ctx.patch(Woodcutting, 'addXP').after(function() {
        try {
          if (!game.woodcutting.isActive) return;
          // Deduplicate across multi-tree addXP calls in the same game tick.
          // game.tickCount may not exist; fall back to a 100ms performance window.
          const tick = game.tickCount;
          const now  = performance.now();
          if (tick !== undefined) {
            if (tick === _wcLastTick) return;
            _wcLastTick = tick;
          } else {
            if (now - _wcLastMs < 100) return;
            _wcLastMs = now;
          }
          const state  = deps.stateM.getState(id);
          const activeTrees = gs().activeTrees;
          if (!activeTrees || activeTrees.size === 0) return;
          const bonusRank    = state.upgrades.bonusItem  ?? 0;
          const autoBurnRank = !state.disabled?.autoBurn ? (state.upgrades.autoBurn ?? 0) : 0;
          const nestRank     = state.upgrades.birdNest   ?? 0;
          activeTrees.forEach(tree => {
            if (!tree?.product) return;
            if (bonusRank > 0 && tree.product?.id) {
              const chance = deps.upgradesM.getTotalBonus('bonusItem', bonusRank, id);
              const bonus  = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
              if (bonus > 0) { try { game.bank.addItem(tree.product, bonus * (tree.baseQuantity ?? 1), true, true, true); toast(id, 'Bountiful Harvest: +' + (bonus * (tree.baseQuantity ?? 1)) + ' ' + (tree.product?._name ?? 'Log')); } catch(e) {} }
            }
            if (nestRank > 0) {
              const chance = deps.upgradesM.getTotalBonus('birdNest', nestRank, id);
              if (Math.random() < chance) {
                try {
                  const nestItem = game.items.getObjectByID('melvorD:Bird_Nest');
                  if (nestItem) {
                    game.bank.addItem(nestItem, 1, true, false, false);
                    toast(id, 'Nest Hunter: Bird Nest ×1');
                  }
                } catch(e) {}
              }
            }
            if (autoBurnRank > 0 && tree.product) {
              const chance = deps.upgradesM.getTotalBonus('autoBurn', autoBurnRank, id);
              if (Math.random() < chance) {
                try {
                  const fmRecipe = game.firemaking.actions.find(r => r.log?.id === tree.product.id);
                  if (fmRecipe) {
                    game.firemaking.addXP(fmRecipe.baseExperience, fmRecipe);
                    try { game.firemaking.addMasteryXP(fmRecipe, fmRecipe.baseExperience); } catch(e) {}
                  }
                } catch(e) {}
              }
            }
          });
        } catch(e) {}
      });
    } catch(e) {}
  }
  // Farming action effects
  if (id === 'farming') {
    // Green Thumb -- reduce crop growth time
    try {
      ctx.patch(Farming, 'getGrowthTime').replace(function(o, plot) {
        const base = o(plot);
        const state = deps.stateM.getState(id);
        const rank  = state.upgrades.interval ?? 0;
        if (rank === 0) return base;
        const reduction = deps.upgradesM.getTotalBonus('interval', rank, id);
        return Math.max(Math.floor(base * (1 - reduction)), 1000); // minimum 1 second
      });
    } catch(e) {
      // Fallback: patch the growthTime getter on FarmingPlot if getGrowthTime doesn't exist
      try {
        ctx.patch(FarmingPlot, 'growthTime', {
          get: function(o) {
            const base = o.call(this);
            const state = deps.stateM.getState(id);
            const rank  = state.upgrades.interval ?? 0;
            if (rank === 0) return base;
            const reduction = deps.upgradesM.getTotalBonus('interval', rank, id);
            return Math.max(Math.floor(base * (1 - reduction)), 1000);
          }
        });
      } catch(e2) {}
    }
    // Bountiful Harvest -- bonus crop on harvest
    try {
      ctx.patch(Farming, 'harvest').replace(function(o, plot) {
        const result = o(plot);
        const state  = deps.stateM.getState(id);
        const bonusRank = state.upgrades.bonusItem ?? 0;
        if (bonusRank > 0 && plot?.crop?.product) {
          const chance = deps.upgradesM.getTotalBonus('bonusItem', bonusRank, id);
          const bonus  = Math.floor(chance) + (Math.random() < (chance % 1) ? 1 : 0);
          if (bonus > 0) {
            const qty = plot.crop.baseQuantity ?? 1;
            game.bank.addItem(plot.crop.product, bonus * qty, true, false, false);
            gs().addXP(plot.crop.baseExperience * bonus, plot.crop);
            try { gs().addMasteryXP(plot.crop, plot.crop.baseExperience * bonus); } catch(e2) {}
            toast(id, 'Bountiful Harvest: +' + (bonus * qty) + ' ' + (plot.crop.product._name ?? 'crop'));
          }
        }
        // Super Soil -- bonus yield when compost was applied
        const compostRank = state.upgrades.compostBonus ?? 0;
        if (compostRank > 0 && plot?.compostLevel > 0 && plot?.crop?.product) {
          const bonus = deps.upgradesM.getTotalBonus('compostBonus', compostRank, id);
          const extra = Math.floor(bonus) + (Math.random() < (bonus % 1) ? 1 : 0);
          if (extra > 0) {
            const qty = plot.crop.baseQuantity ?? 1;
            game.bank.addItem(plot.crop.product, extra * qty, true, false, false);
            toast(id, 'Super Soil: +' + (extra * qty) + ' bonus yield');
          }
        }
        // Auto-Compost -- re-apply compost after harvest
        const autoRank = (!state.disabled?.autoCompost) ? (state.upgrades.autoCompost ?? 0) : 0;
        if (autoRank > 0 && plot) {
          const chance = deps.upgradesM.getTotalBonus('autoCompost', autoRank, id);
          if (Math.random() < chance) {
            try {
              // Find the best compost item the player has
              const composts = [
                'melvorD:Compost', 'melvorD:Weird_Gloop',
              ].map(cid => game.items.getObjectByID(cid)).filter(Boolean);
              for (const c of composts.reverse()) {
                if (game.bank.getQty(c) > 0) {
                  game.bank.removeItemQuantity(c, 1, true);
                  if (typeof plot.applyCompost === 'function') plot.applyCompost(c);
                  toast(id, 'Auto-Compost: applied ' + (c._name ?? 'compost'));
                  break;
                }
              }
            } catch(e2) {}
          }
        }
        return result;
      });
    } catch(e) {}

    // Seed Conservation -- chance to not consume seed when planting
    try {
      ctx.patch(Farming, 'plant').replace(function(o, plot, seed) {
        const state = deps.stateM.getState(id);
        const rank  = state.upgrades.preserveSeed ?? 0;
        if (rank > 0) {
          const chance = deps.upgradesM.getTotalBonus('preserveSeed', rank, id);
          if (Math.random() < chance) {
            // Add the seed back after planting so net cost is zero
            const result = o(plot, seed);
            if (seed) game.bank.addItem(seed, 1, true, false, false);
            toast(id, 'Seed Conservation: seed preserved!');
            return result;
          }
        }
        return o(plot, seed);
      });
    } catch(e) {}
  }
}

function rollLootTable(npc) {
  const table = npc.lootTable;
  if (!table?.drops?.length || table.totalWeight <= 0) return;
  let roll = Math.random() * table.totalWeight;
  for (const drop of table.drops) {
    roll -= drop.weight;
    if (roll <= 0) { if (drop?.item) { const min = drop.minQuantity ?? 1, max = drop.maxQuantity ?? min; try { game.bank.addItem(drop.item, min + Math.floor(Math.random() * (max - min + 1)), true, false, false); } catch(e) {} } return; }
  }
}

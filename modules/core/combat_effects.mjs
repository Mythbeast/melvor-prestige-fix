// core/combat_effects.mjs
// Uses PlayerModifierTable.addModifier / removeModifiers API with proper ModifierValue objects.
// Our source key is 'skill-prestige-combat' — we remove then re-add on every computeModifiers call.

let _deps = null;
const SOURCE = { id:'skill-prestige-combat', name:'Prestige Upgrades' };

export function initCombatEffects(deps) { _deps = deps; }

export function setupCombatEffects(ctx, combatSkills) {
  // Slayer Mastery -- grant mastery XP on task completion, apply damage bonus per monster
  try {
    ctx.patch(SlayerTask, 'addKill').replace(function(o) {
      const monsterId = this.monster?.id ?? null;
      const willComplete = this.killsLeft <= 1; // about to hit 0 inside original addKill
      const taskLength = willComplete ? (this.getTaskLength?.(this.category) ?? null) : null;
      const result = o();
      if (willComplete && monsterId) {
        try {
          _deps.slayerMasteryM?.grantMasteryXP(monsterId, taskLength ?? 1);
        } catch(e) {}
      }
      return result;
    });
  } catch(e) {}

  try {
    ctx.patch(Player, 'applyDamageModifiers').replace(function(o, target, damage) {
      let result = o(target, damage);
      try {
        const monsterId = target?.monster?.id ?? target?.id ?? null;
        if (monsterId && _deps.slayerMasteryM) {
          const bonus = _deps.slayerMasteryM.getDamageBonus(monsterId);
          if (bonus > 0) result = Math.floor(result * (1 + bonus));
        }
      } catch(e) {}
      return result;
    });
  } catch(e) {}

  // Per-monster accuracy bonus from Slayer mastery -- accuracy is computed once per
  // stat refresh (not per-attack), so we add the bonus here based on the currently
  // active enemy, and force a recompute whenever the enemy changes (selectMonster).
  try {
    ctx.patch(Player, 'getAccuracyModifier').replace(function(o) {
      let modifier = o();
      try {
        const enemy     = game.combat?.enemy;
        const monsterId = enemy?.monster?.id ?? enemy?.id ?? null;
        if (monsterId && _deps.slayerMasteryM) {
          modifier += _deps.slayerMasteryM.getAccuracyBonus(monsterId) * 100;
        }
      } catch(e) {}
      return modifier;
    });
  } catch(e) {}

  try {
    ctx.patch(CombatManager, 'selectMonster').after(function() {
      try { this.player?.computeAccuracy?.(); } catch(e) {}
    });
  } catch(e) {}

  // addXP patch — apply skillXP upgrade bonus directly (combat skills gain XP via
  // rewardXPAndPetsForDamage which calls addXP directly, bypassing modifyXP entirely)
  // and dispatch events for UI updates.
  combatSkills.forEach(skill => {
    try {
      ctx.patch(Skill, 'addXP').replace(function(o, amount, masteryAction) {
        if (this.id !== skill.skillId) return o(amount, masteryAction);
        let boosted = amount;
        try {
          const rank = _deps?.stateM?.getState(skill.id)?.upgrades?.skillXP ?? 0;
          if (rank > 0) boosted = amount * (1 + _deps.upgradesM.getTotalBonus('skillXP', rank, skill.id));
        } catch(e2) {}
        const result = o(boosted, masteryAction);
        if (!game.isOfflineProgressRunning && !game._isOfflineProgress) document.dispatchEvent(new CustomEvent('skill-prestige:xp-gained', { detail: { skillId: skill.id } }));
        const gs     = skill.gameSkill?.();
        const vLevel = gs?.virtualLevel ?? gs?.level ?? 0;
        if (vLevel >= _deps.stateM.nextPrestigeLevel(skill.id))
          document.dispatchEvent(new CustomEvent('skill-prestige:ready', { detail: { skillId: skill.id } }));
        return result;
      });
    } catch(e) {}
  });

  // skillXP now handled via modifyXP patch (no per-combat-skill modifiers exist in Melvor registry)

  // Single modifyXP patch covering ALL combat skills + Alt Magic
  try {
    ctx.patch(Skill, 'modifyXP').replace(function(o, amount, action) {
      if (!_deps) return o(amount, action);
      const match = combatSkills.find(s =>
        this.id === s.skillId ||
        (s.skillId === 'melvorD:Magic' && this.id === 'melvorD:AltMagic')
      );
      if (!match) return o(amount, action);
      const rank = _deps.stateM?.getState(match.id)?.upgrades?.skillXP ?? 0;
      if (rank === 0) return o(amount, action);
      const bonus = _deps.upgradesM.getTotalBonus('skillXP', rank, match.id);
      return o(amount, action) * (1 + bonus);
    });
  } catch(e) {}

  // Patch computeModifiers — fires every stat recalc; we remove+re-add our modifiers here
  try {
    ctx.patch(Player, 'computeModifiers').after(function() {
      injectModifiers(this);
      try { _deps?.globalTreeM?.applyTreeModifiers?.(); } catch(e) {}
    });
    console.log('[Prestige Combat] Patched Player.computeModifiers successfully.');
  } catch(e) {
    console.warn('[Prestige Combat] Could not patch computeModifiers:', e);
    setInterval(() => {
      try { injectModifiers(game.combat?.player); } catch(e2) {}
    }, 500);
  }
}

// Build array of {modId, value} from all purchased combat upgrades
function buildContributions() {
  if (!_deps) return [];
  const out = [];
  _deps.combatM.COMBAT_SKILLS.forEach(skill => {
    const state = _deps.stateM.getState(skill.id);
    skill.upgrades.forEach(upgrade => {
      const rank = (!state.disabled?.[upgrade.id]) ? (state.upgrades[upgrade.id] ?? 0) : 0;
      if (rank === 0) return;
      const raw = upgrade.valuePerRank * rank;
      const isSkillXP = upgrade.id === 'skillXP';
      const value = isSkillXP ? raw * 100 : raw;
      if (upgrade.modId)  out.push({ modId: upgrade.modId,  value });
      if (upgrade.modId2) out.push({ modId: upgrade.modId2, value });
    });
  });
  return out;
}

function injectModifiers(player) {
  if (!player || !_deps) return;
  const pm = player.modifiers;
  if (!pm) return;

  // Always remove our previous entries first
  pm.removeModifiers(SOURCE.id ?? SOURCE);

  const contributions = buildContributions();
  if (contributions.length === 0) return;

  // Merge contributions with the same modId (e.g. global lifesteal from multiple sources)
  const merged = {};
  for (const { modId, value } of contributions) {
    merged[modId] = (merged[modId] ?? 0) + value;
  }

  for (const [modId, value] of Object.entries(merged)) {
    try {
      const modifier = game.modifierRegistry.getObjectByID(modId);
      if (!modifier) { console.warn('[Prestige Combat] Modifier not found:', modId); continue; }
      const mv = new ModifierValue(modifier, value, {});
      pm.addModifier(SOURCE, mv, 1, 1);
    } catch(e) {
      console.warn('[Prestige Combat] Failed to add modifier', modId, e);
    }
  }
}

export function applyCombatModifiers(skillId, combatM) {
  try { game.combat?.player?.computeModifiers?.(); } catch(e) {}
}

export function validateModifierIds(combatSkills) {
  try {
    const bad = [];
    combatSkills.forEach(skill => {
      (skill.upgrades ?? []).forEach(u => {
        [u.modId, u.modId2].filter(Boolean).forEach(modId => {
          if (!game.modifierRegistry?.getObjectByID(modId)) bad.push(`${skill.id}.${u.id}: ${modId}`);
        });
      });
    });
    if (bad.length) console.warn('[Prestige] Unknown modifier IDs (will be silently ignored):\n' + bad.join('\n'));
    else console.log('[Prestige] All combat modifier IDs validated OK');
  } catch(e) {}
}

export function applyAllCombatModifiers(combatSkills, combatM) {
  function forceHPUpdate() {
    try {
      const player = game.combat?.player;
      if (!player) return;
      const prevMax = player.stats?.maxHitpoints ?? player.hitpoints;
      const wasAtMax = player.hitpoints >= prevMax;
      player.computeModifiers?.();
      player.computeMaxHP?.();
      player.computePostModifierStats?.();
      if (player.stats?.maxHitpoints != null) {
        if (wasAtMax)
          player.hitpoints = player.stats.maxHitpoints; // top up if was at full
        else if (player.hitpoints > player.stats.maxHitpoints)
          player.hitpoints = player.stats.maxHitpoints; // clamp if over max
      }
      player.renderStats?.();
      game.combat?.renderCombat?.();
    } catch(e) { console.warn('[Prestige] forceHPUpdate error:', e); }
  }

  forceHPUpdate();

  // Force stat recalc when any combat skill upgrade is purchased or tree node confirmed
  const combatSkillIds = new Set(combatSkills.map(s => s.id));
  document.addEventListener('skill-prestige:upgrade-purchased', e => {
    if (!combatSkillIds.has(e.detail.skillId)) return;
    forceHPUpdate();
  });
  document.addEventListener('skill-prestige:tree-confirmed', () => forceHPUpdate());
}

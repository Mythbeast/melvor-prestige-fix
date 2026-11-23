// core/star_alignment.mjs -- Astrology Star Alignment prestige upgrade
// Each unlocked constellation has its own independent timer.
// Multiple blessings can be active simultaneously.

const _CONSTELLATION_MAP = [
  { keys: ['melvorF:Deedree',  'melvorD:Deedree'],  skills: ['woodcutting', 'farming'] },
  { keys: ['melvorF:Iridan',   'melvorD:Iridan'],   skills: ['attack', 'smithing'] },
  { keys: ['melvorF:Ameria',   'melvorD:Ameria'],   skills: ['fishing', 'firemaking'] },
  { keys: ['melvorF:Terra',    'melvorD:Terra'],    skills: ['strength', 'mining'] },
  { keys: ['melvorF:Vale',     'melvorD:Vale'],     skills: ['hitpoints', 'cooking'] },
  { keys: ['melvorF:Ko',       'melvorD:Ko'],       skills: ['ranged', 'fletching'] },
  { keys: ['melvorF:Arachi',   'melvorD:Arachi'],   skills: ['defence', 'crafting'] },
  { keys: ['melvorF:Syllia',   'melvorD:Syllia'],   skills: ['magic', 'runecrafting'] },
  { keys: ['melvorF:Qimican',  'melvorD:Qimican'],  skills: ['prayer', 'herblore'] },
  { keys: ['melvorF:Hyden',    'melvorD:Hyden'],    skills: ['slayer', 'thieving', 'summoning'] },
];

export const CONSTELLATION_SKILLS = {};
_CONSTELLATION_MAP.forEach(e => e.keys.forEach(k => { CONSTELLATION_SKILLS[k] = e.skills; }));

const BASE_INTERVAL_MS  = 10 * 60 * 1000;
const BASE_DURATION_MS  = 30 * 1000;
const BASE_BONUS        = 0.20;
const BONUS_PER_MASTERY = 0.008; // +0.8% per mastery level, reaches 100% at mastery 99

function getConstellationBonus(constId) {
  try {
    const sk = game.astrology;
    if (!sk) return BASE_BONUS;
    const action = sk.actions.getObjectByID(constId);
    if (!action) return BASE_BONUS;
    const masteryLevel = sk.getMasteryLevel(action);
    return BASE_BONUS + masteryLevel * BONUS_PER_MASTERY;
  } catch(e) { return BASE_BONUS; }
}

// Keep these for external references
export function getXPBonus()       { return BASE_BONUS; }
export function getIntervalBonus() { return BASE_BONUS; }
export function getConstellationBonusPct(constId) {
  return getConstellationBonus(constId) * 100;
}

const COMBAT_SKILL_IDS = new Set(['attack','strength','defence','hitpoints','ranged','magic','prayer','slayer']);
const STAR_MODIFIER_SOURCE = { id: 'skill-prestige-star-alignment', name: 'Star Alignment' };

let _deps = null;

// Per-constellation state -- keyed by constellation ID (e.g. 'melvorF:Deedree')
// Each entry: { timer, buffTimer, nextFireAt, buffEndsAt, scheduledCooldown, skills, actions }
const _consts = {};

export function initStarAlignment(deps) {
  _deps = deps;
}

function getState() {
  return _deps?.stateM?.getState('astrology') ?? null;
}

function isEnabled() {
  const state = getState();
  if (!state) return false;
  const rank = state.upgrades?.starAlignment ?? 0;
  if (rank === 0) return false;
  if (state.disabled?.starAlignment) return false;
  return true;
}

function getRank() {
  return getState()?.upgrades?.starAlignment ?? 0;
}

function getIntervalMs() {
  const rank = getRank();
  return Math.floor(BASE_INTERVAL_MS * (1 - Math.min(rank * 0.01, 0.80)));
}

function getDurationMs() {
  return BASE_DURATION_MS + getRank() * 1000;
}

function getUnlockedConstellations() {
  try {
    const sk = game.astrology;
    if (!sk) return [];
    const currently = sk.actions.allObjects.filter(c => sk.level >= (c.level ?? 1));
    // Persist newly unlocked constellations to state so they survive prestige resets
    const state = _deps?.stateM?.getState('astrology');
    if (state) {
      if (!state.everUnlockedConsts) state.everUnlockedConsts = [];
      currently.forEach(c => {
        if (!state.everUnlockedConsts.includes(c.id)) state.everUnlockedConsts.push(c.id);
      });
    }
    // Return union of currently unlocked + ever unlocked
    const everIds = new Set(state?.everUnlockedConsts ?? []);
    const everUnlocked = sk.actions.allObjects.filter(c => everIds.has(c.id));
    // Merge, dedup by ID
    const seen = new Set();
    return [...currently, ...everUnlocked].filter(c => seen.has(c.id) ? false : seen.add(c.id));
  } catch(e) { return []; }
}

function pickAction(skillId) {
  if (COMBAT_SKILL_IDS.has(skillId)) return null;
  try {
    const skill  = _deps?.skillsM?.SKILLS?.find(s => s.id === skillId);
    const gs     = skill?.gameSkill?.();
    if (!gs) return null;
    const vLevel = _deps?.stateM?.getVirtualLevel?.(gs) ?? gs.level;
    const acts   = (gs.actions?.allObjects ?? []).filter(a => vLevel >= (a.level ?? 1));
    if (!acts.length) return null;
    const p = acts[Math.floor(Math.random() * acts.length)];
    return { id: p.id, name: p._name ?? p.name ?? p._localID ?? p.id };
  } catch(e) { return null; }
}

function scheduleConstellation(constId, delayMs) {
  const c = _consts[constId];
  if (!c) return;
  if (c.timer) { clearTimeout(c.timer); c.timer = null; }
  c.nextFireAt       = Date.now() + delayMs;
  c.scheduledCooldown = delayMs;
  c.timer = setTimeout(() => {
    c.timer = null;
    c.nextFireAt = null;
    c.scheduledCooldown = null;
    if (!isEnabled()) return;
    triggerConstellation(constId);
  }, delayMs);
}

function triggerConstellation(constId) {
  const c = _consts[constId];
  if (!c) return;
  const skills  = CONSTELLATION_SKILLS[constId] ?? [];
  const actions = {};
  skills.forEach(sid => { const a = pickAction(sid); if (a) actions[sid] = a; });

  c.skills  = skills;
  c.actions = actions;
  c.buffEndsAt = Date.now() + getDurationMs();
  if (c.buffTimer) clearTimeout(c.buffTimer);
  c.buffTimer = setTimeout(() => {
    c.buffTimer  = null;
    c.buffEndsAt = null;
    c.skills  = [];
    c.actions = {};
    document.dispatchEvent(new CustomEvent('skill-prestige:star-alignment-end', { detail: { constellationId: constId } }));
    try {
      const constName = constId.split(':')[1] ?? constId;
      notifyPlayer(game.astrology, '&#127774; ' + constName + ' blessing fades...', 'info');
    } catch(e) {}
    refreshSkillUIs(skills);
    scheduleConstellation(constId, getIntervalMs());
  }, getDurationMs());

  document.dispatchEvent(new CustomEvent('skill-prestige:star-alignment-start', {
    detail: { constellationId: constId, skills, actions, durationMs: getDurationMs() }
  }));

  // Toast notification on blessing start
  try {
    const constName  = constId.split(':')[1] ?? constId;
    const bonusPct   = Math.round(getConstellationBonus(constId) * 100);
    const actionParts = Object.entries(actions).map(([sid, a]) => {
      const def = _deps?.skillsM?.SKILLS?.find(s => s.id === sid);
      const skillName = def?.name ?? sid;
      return skillName + ': ' + a.name;
    });
    const actionStr  = actionParts.length ? ' (' + actionParts.join(', ') + ')' : '';
    const msg        = '&#11088; ' + constName + ' blessing! +' + bonusPct + '% XP &amp; Speed' + actionStr;
    notifyPlayer(game.astrology, msg, 'success');
  } catch(e) {}

  refreshSkillUIs(skills);
}

export function startStarAlignment() {
  if (!isEnabled()) return;
  const unlocked = getUnlockedConstellations();
  const newCooldown = getIntervalMs();

  unlocked.forEach(c => {
    const id = c.id;
    if (!_consts[id]) {
      // New constellation -- initialize with a random offset so constellations
      // don't all fire at the same time. First blessing arrives somewhere between
      // 10% and 100% of the cooldown from now.
      _consts[id] = { timer: null, buffTimer: null, nextFireAt: null, buffEndsAt: null,
                      scheduledCooldown: null, skills: [], actions: {} };
      const randomDelay = Math.round(newCooldown * (0.1 + Math.random() * 0.9));
      scheduleConstellation(id, randomDelay);
    } else {
      // Existing -- rescale remaining cooldown proportionally (rank upgrade)
      const existing = _consts[id];
      if (existing.timer && existing.nextFireAt && existing.scheduledCooldown) {
        const remaining   = Math.max(0, existing.nextFireAt - Date.now());
        const pctElapsed  = Math.min(1 - remaining / existing.scheduledCooldown, 1);
        const newRemaining = Math.round(newCooldown * (1 - pctElapsed));
        scheduleConstellation(id, newRemaining);
      }
    }
  });

  // Stop timers for constellations that are no longer unlocked
  const unlockedIds = new Set(unlocked.map(c => c.id));
  Object.keys(_consts).forEach(id => {
    if (!unlockedIds.has(id)) {
      const c = _consts[id];
      if (c.timer)     clearTimeout(c.timer);
      if (c.buffTimer) clearTimeout(c.buffTimer);
      delete _consts[id];
    }
  });
}

// Only start timers for constellations not yet tracked -- used on level-up
// so existing timers are never disturbed
export function startNewConstellations() {
  if (!isEnabled()) return;
  const unlocked    = getUnlockedConstellations();
  const newCooldown = getIntervalMs();
  unlocked.forEach(c => {
    if (_consts[c.id]) return; // already running, leave it alone
    _consts[c.id] = { timer: null, buffTimer: null, nextFireAt: null, buffEndsAt: null,
                      scheduledCooldown: null, skills: [], actions: {} };
    const randomDelay = Math.round(newCooldown * (0.1 + Math.random() * 0.9));
    scheduleConstellation(c.id, randomDelay);
  });
}

export function stopStarAlignment() {
  Object.keys(_consts).forEach(id => {
    const c = _consts[id];
    if (c.timer)     clearTimeout(c.timer);
    if (c.buffTimer) clearTimeout(c.buffTimer);
  });
  Object.keys(_consts).forEach(id => delete _consts[id]);
}

// Returns array of all currently active blessings for UI
export function getActiveBlessings() {
  return Object.entries(_consts)
    .filter(([, c]) => c.buffEndsAt && c.buffEndsAt > Date.now())
    .map(([constId, c]) => ({ constId, skills: c.skills, actions: c.actions, buffEndsAt: c.buffEndsAt }));
}

// Returns per-constellation timer info for UI display
export function getConstellationTimers() {
  return Object.entries(_consts).map(([constId, c]) => ({
    constId,
    nextFireAt:        c.nextFireAt,
    buffEndsAt:        c.buffEndsAt,
    scheduledCooldown: c.scheduledCooldown,
    skills:            c.skills,
    actions:           c.actions,
    isActive:          !!(c.buffEndsAt && c.buffEndsAt > Date.now()),
  }));
}

// XP/interval bonus checks -- any active constellation blessing this skill
export function isSkillBuffed(skillId) {
  return Object.values(_consts).some(c => c.buffEndsAt && c.buffEndsAt > Date.now() && c.skills.includes(skillId));
}

export function applyXPBonus(skillId, amount, actionId) {
  let bonus = 1;
  Object.entries(_consts).forEach(([constId, c]) => {
    if (!c.buffEndsAt || c.buffEndsAt <= Date.now()) return;
    if (!c.skills.includes(skillId)) return;
    const a = c.actions[skillId];
    if (a && actionId && a.id !== actionId) return;
    bonus += getConstellationBonus(constId);
  });
  return amount * bonus;
}

export function applyIntervalBonus(skillId, interval, actionId) {
  let reduction = 0;
  Object.entries(_consts).forEach(([constId, c]) => {
    if (!c.buffEndsAt || c.buffEndsAt <= Date.now()) return;
    if (!c.skills.includes(skillId)) return;
    const a = c.actions[skillId];
    if (a && actionId && a.id !== actionId) return;
    reduction += getConstellationBonus(constId);
  });
  return reduction > 0 ? Math.floor(interval * (1 - Math.min(reduction, 0.95))) : interval;
}



// Called from effects.mjs computeModifiers patch -- re-injects without triggering computeModifiers
export function reinjectable() {
  // Build map of skillId -> highest bonus across all active constellations
  const skillBonusMap = {};
  Object.entries(_consts).forEach(([constId, c]) => {
    if (!c.buffEndsAt || c.buffEndsAt <= Date.now()) return;
    const bonus = getConstellationBonus(constId);
    c.skills.forEach(sid => {
      skillBonusMap[sid] = (skillBonusMap[sid] ?? 0) + bonus;
    });
  });
  if (!Object.keys(skillBonusMap).length) return;
  try {
    const player = game.combat?.player;
    const pm     = player?.modifiers;
    if (!pm) return;
    const modDef = game.modifierRegistry?.getObjectByID('melvorD:skillXP');
    if (!modDef) return;
    pm.removeModifiers(STAR_MODIFIER_SOURCE.id ?? STAR_MODIFIER_SOURCE);
    const skills = _deps?.skillsM?.SKILLS ?? [];
    Object.entries(skillBonusMap).forEach(([sid, bonus]) => {
      try {
        const def   = skills.find(s => s.id === sid);
        const gsObj = def?.gameSkill?.();
        if (!gsObj) return;
        const mv = new ModifierValue(modDef, bonus * 100, { skill: gsObj });
        pm.addModifier(STAR_MODIFIER_SOURCE, mv, 1, 1);
      } catch(e) {}
    });
  } catch(e) {}
}

function refreshSkillUIs(skillIds) {
  // Re-inject XP modifier and re-render skill pages
  const allBuffed = new Set();
  Object.values(_consts).forEach(c => {
    if (c.buffEndsAt && c.buffEndsAt > Date.now()) c.skills.forEach(s => allBuffed.add(s));
  });
  try {
    const player = game.combat?.player;
    const pm     = player?.modifiers;
    const modDef = pm ? game.modifierRegistry?.getObjectByID('melvorD:skillXP') : null;
    if (pm && modDef) {
      pm.removeModifiers(STAR_MODIFIER_SOURCE.id ?? STAR_MODIFIER_SOURCE);
      // Build skill->bonus map across all active constellations
      const skillBonusMap = {};
      Object.entries(_consts).forEach(([constId, c]) => {
        if (!c.buffEndsAt || c.buffEndsAt <= Date.now()) return;
        const bonus = getConstellationBonus(constId);
        c.skills.forEach(sid => { skillBonusMap[sid] = (skillBonusMap[sid] ?? 0) + bonus; });
      });
      const skillDefs = _deps?.skillsM?.SKILLS ?? [];
      Object.entries(skillBonusMap).forEach(([sid, bonus]) => {
        try {
          const def   = skillDefs.find(s => s.id === sid);
          const gsObj = def?.gameSkill?.();
          if (!gsObj) return;
          pm.addModifier(STAR_MODIFIER_SOURCE, new ModifierValue(modDef, bonus * 100, { skill: gsObj }), 1, 1);
        } catch(e) {}
      });
      player.computeModifiers?.();
    }
  } catch(e) {}
  // Re-render skill pages for interval display
  const skillDefs = _deps?.skillsM?.SKILLS ?? [];
  skillIds.forEach(sid => {
    try {
      const def = skillDefs.find(s => s.id === sid);
      const gs  = def?.gameSkill?.();
      if (gs && typeof gs.render === 'function') gs.render();
    } catch(e) {}
  });
}

export function registerTestHook() {
  window.spStarTest = (constId) => {
    const unlocked = getUnlockedConstellations();
    const target   = constId
      ? unlocked.find(c => c.id === constId || c.id.includes(constId))
      : unlocked[Math.floor(Math.random() * unlocked.length)];
    if (!target) { console.warn('[StarAlignment] no constellation found for', constId); return; }
    if (!_consts[target.id]) {
      _consts[target.id] = { timer: null, buffTimer: null, nextFireAt: null, buffEndsAt: null,
                              scheduledCooldown: null, skills: [], actions: {} };
    }
    const c = _consts[target.id];
    if (c.timer) { clearTimeout(c.timer); c.timer = null; }
    triggerConstellation(target.id);
    console.log('[StarAlignment] triggered', target.id);
  };
  window.spStarState = () => _consts;
  window.spStarAll   = () => getUnlockedConstellations().forEach(c => window.spStarTest(c.id));
  console.log('[StarAlignment] hooks: spStarTest(constId?), spStarAll(), spStarState()');
}

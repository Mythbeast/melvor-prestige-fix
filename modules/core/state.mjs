// core/state.mjs -- shared state factory for all skill prestiges
const STORAGE_KEY = 'skill_prestige_v1';
let _ctx = null, _state = null;

export const SKILL_IDS = [
  'woodcutting','fishing','firemaking','cooking','mining','smithing',
  'thieving','fletching','crafting','runecrafting','herblore','summoning',
  'astrology','agility','farming',
  'attack','strength','defence','hitpoints','ranged','magic','prayer','slayer'
];

function defaultSkill() {
  return { prestigeCount: 0, totalPoints: 0, spentPoints: 0, lastPrestigeLevel: 0, disabled: {}, upgrades: {} };
}

function defaultState() {
  const s = { skills: {}, workers: {} };
  SKILL_IDS.forEach(id => { s.skills[id] = defaultSkill(); s.workers[id] = []; });
  return s;
}

export function initState(ctx) {
  _ctx = ctx;
  const saved = ctx.characterStorage.getItem(STORAGE_KEY);
  _state = (saved !== null && saved !== undefined) ? saved : defaultState();
  // Ensure all skills exist
  SKILL_IDS.forEach(id => {
    if (!_state.skills[id])  _state.skills[id]  = defaultSkill();
    if (!_state.workers[id]) _state.workers[id] = [];
    if (!_state.skills[id].disabled)             _state.skills[id].disabled = {};
    if (!_state.skills[id].upgrades)             _state.skills[id].upgrades = {};
    if (!_state.skills[id].lastPrestigeLevel)    _state.skills[id].lastPrestigeLevel = 0;
    if (id === 'astrology' && !_state.skills[id].everUnlockedConsts)
      _state.skills[id].everUnlockedConsts = [];
    if (id === 'slayer' && !_state.skills[id].slayerMonsterMastery)
      _state.skills[id].slayerMonsterMastery = {};
    // Migrate: if totalPoints missing, derive from prestigeCount (old format assumed 1pt per prestige)
    if (_state.skills[id].totalPoints === undefined) _state.skills[id].totalPoints = _state.skills[id].prestigeCount;
    _state.workers[id].forEach(w => { if (w.enabled === undefined) w.enabled = true; });
  });
}

export function getState(skillId) {
  if (!_state) _state = defaultState();
  return _state.skills[skillId] ?? defaultSkill();
}
export function getWorkers(skillId) {
  if (!_state) _state = defaultState();
  return _state.workers[skillId] ?? [];
}
export function setWorkers(skillId, workers) {
  if (!_state) _state = defaultState();
  _state.workers[skillId] = workers;
}
export function saveState() {
  if (_ctx) _ctx.characterStorage.setItem(STORAGE_KEY, _state);
}

// Debounced save for non-critical writes (worker assignments, toggles).
// Waits 600ms of idle before flushing -- avoids a storage write on every
// dropdown scroll event while still persisting within a normal play session.
let _saveDebounceTimer = null;
export function saveStateDeferred() {
  if (_saveDebounceTimer) clearTimeout(_saveDebounceTimer);
  _saveDebounceTimer = setTimeout(() => {
    _saveDebounceTimer = null;
    saveState();
  }, 600);
}

// Settings -- reads from mod settings API with localStorage fallback
let _settingsSection = null;
export function setSettingsSection(s) { _settingsSection = s; }

function safeGetSetting(key, fallback) {
  try {
    const v = _settingsSection?.get(key);
    return v === undefined || v === null ? fallback : v;
  } catch(e) {
    return fallback;
  }
}

export function getSettings(skillId) {
  try {
    if (_settingsSection) {
      const skillFirst  = Number(safeGetSetting(skillId + '_firstPrestigeLevel', 0));
      const skillPts    = Number(safeGetSetting(skillId + '_pointsPerPrestige', 0));
      const globalFirst = Number(safeGetSetting('global_firstPrestigeLevel', 25));
      const globalPts   = Number(safeGetSetting('global_pointsPerPrestige', 1));
      const levelsPerPrestige = Number(safeGetSetting('global_levelsPerPrestige', 1));
      const intervalFloorMs   = Number(safeGetSetting('global_intervalFloorMs', 50));
      // skillPts of 0 means "use global". skillPts of 1 could be the old default or intentional.
      // Only override global if skillPts is explicitly > global (user intentionally set it higher)
      // OR if skillPts > 1 (not the ambiguous default value)
      const rawPts = (skillPts > 1) ? skillPts : globalPts;
      const rawFirst = (skillFirst > 0) ? skillFirst : globalFirst;
      return {
        firstPrestigeLevel: rawFirst,
        pointsPerPrestige:  Math.min(5, Math.max(1, rawPts || 1)),
        levelsPerPrestige:  Math.max(1, levelsPerPrestige || 1),
        intervalFloorMs:    Math.min(250, Math.max(50, intervalFloorMs || 50)),
      };
    }
  } catch(e) { console.log('[Prestige DEBUG] getSettings error:', e); }
  try {
    const raw = localStorage.getItem('smxrpg_prestige_settings_v1');
    if (raw) return { firstPrestigeLevel: 25, pointsPerPrestige: 1, levelsPerPrestige: 1, intervalFloorMs: 50, ...JSON.parse(raw) };
  } catch(e) {}
  return { firstPrestigeLevel: 25, pointsPerPrestige: 1, levelsPerPrestige: 1, intervalFloorMs: 50 };
}

export function nextPrestigeLevel(skillId) {
  const state = getState(skillId);
  const settings = getSettings(skillId);
  const first = settings.firstPrestigeLevel ?? 25;
  const step  = settings.levelsPerPrestige ?? 1;
  // Next prestige level = firstPrestigeLevel + (how many times already prestiged * level step)
  // So changing firstPrestigeLevel or levelsPerPrestige shifts all future requirements
  return first + (state.prestigeCount ?? 0) * step;
}
export function getIntervalFloorMs() {
  return getSettings(null).intervalFloorMs ?? 50;
}
export function availablePoints(skillId) {
  const s = getState(skillId);
  return (s.totalPoints ?? s.prestigeCount) - s.spentPoints;
}
export function getVirtualLevel(gameSkill) {
  try { return gameSkill.virtualLevel ?? gameSkill.level; } catch(e) { return 0; }
}
// Precomputed XP table for levels 1-120 -- avoids O(n) recomputation on every XP gain
const _XP_TABLE = (() => {
  const t = [0, 0]; // index 0 unused, level 1 = 0 XP
  for (let l = 1; l <= 120; l++) {
    const prev = t[l] ?? 0;
    t.push(prev + Math.floor(l + 300 * Math.pow(2, l / 7)));
  }
  return t.map((_, i) => i < 2 ? 0 : Math.floor(t[i] / 4));
})();
export function xpForLevel(level) {
  if (level <= 1) return 0;
  return _XP_TABLE[Math.min(level, 120)] ?? _XP_TABLE[120];
}

// Returns the actual points that will be awarded on the NEXT prestige,
// incorporating the +5%/prestige compound bonus.
export function nextPrestigePoints(skillId) {
  const state      = getState(skillId);
  const basePPP    = Math.min(5, Math.max(1, getSettings(skillId).pointsPerPrestige ?? 1));
  const multiplier = 1 + (state.prestigeCount * 0.05);
  return Math.max(1, Math.floor(basePPP * multiplier));
}


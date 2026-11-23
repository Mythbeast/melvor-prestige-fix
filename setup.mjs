// setup.mjs -- Skill Prestige (combined mod)
export async function setup(ctx) {
  ctx.loadStylesheet('styles/prestige.css');

  const stateM    = await ctx.loadModule('modules/core/state.mjs');
  const upgradesM = await ctx.loadModule('modules/core/upgrades.mjs');
  const skillsM   = await ctx.loadModule('modules/core/skills.mjs');
  const effectsM  = await ctx.loadModule('modules/core/effects.mjs');
  const workersM  = await ctx.loadModule('modules/core/workers.mjs');
  const prestigeM = await ctx.loadModule('modules/core/prestige.mjs');
  const uiM           = await ctx.loadModule('modules/core/ui.mjs');
  const combatM       = await ctx.loadModule('modules/core/combat.mjs');
  const combatEffectsM = await ctx.loadModule('modules/core/combat_effects.mjs');
  const combatUIM     = await ctx.loadModule('modules/core/combat_ui.mjs');
  const globalTreeM   = await ctx.loadModule('modules/core/global_tree.mjs');
  const starM         = await ctx.loadModule('modules/core/star_alignment.mjs');
  const slayerMasteryM = await ctx.loadModule('modules/core/slayer_mastery.mjs');

  // Register mod settings
  const section = ctx.settings.section('Jkurs Prestige Mod');
  section.add([
    { type:'number', name:'global_firstPrestigeLevel', label:'Default First Prestige Level (all skills)', hint:'Global default for all skills. Default: 25.', default:25, min:1, max:120 },
    { type:'number', name:'global_pointsPerPrestige',  label:'Default Points Per Prestige (all skills)',  hint:'Min: 1, Max: 5. Values outside this range are clamped automatically when a prestige occurs.', default:1, min:1, max:5 },
    { type:'number', name:'global_levelsPerPrestige',  label:'Levels Required Per Subsequent Prestige',   hint:'How much the required level increases after each prestige. Default: 1 (e.g. prestige at 25, then 26, 27...). Set to 5 or 10 to require bigger level jumps between prestiges.', default:1, min:1, max:50 },
    { type:'number', name:'global_intervalFloorMs',     label:'Minimum Action Interval (ms)',              hint:'The fastest an action interval can be reduced to by prestige upgrades. Default: 50ms. Raise this (e.g. to 150-250ms) if very fast intervals cause lag on your PC.', default:50, min:50, max:250 },
  ]);
  skillsM.SKILLS.forEach(skill => {
    section.add([
      { type:'number', name:`${skill.id}_firstPrestigeLevel`, label:`${skill.name} -- First Prestige Level`, hint:'0 = use global default above.', default:0, min:0, max:120 },
      { type:'number', name:`${skill.id}_pointsPerPrestige`,  label:`${skill.name} -- Points Per Prestige`,  hint:'Min: 1, Max: 5 (clamped on prestige). Set to 0 to use global default above.', default:0, min:0, max:5 },
    ]);
  });
  combatM.COMBAT_SKILLS.forEach(skill => {
    section.add([
      { type:'number', name:skill.id + '_firstPrestigeLevel', label:skill.name + ' -- First Prestige Level', hint:'0 = use global default above.', default:0, min:0, max:120 },
      { type:'number', name:skill.id + '_pointsPerPrestige',  label:skill.name + ' -- Points Per Prestige',  hint:'0 = use global default above. Min:1 Max:5 (clamped).', default:0, min:0, max:5 },
    ]);
  });
  stateM.setSettingsSection(section);

  // Build deps bundle
  const deps = { stateM, upgradesM, skillsM, workersM, prestigeM, uiM, combatM, combatEffectsM, globalTreeM, starM, slayerMasteryM };

  ctx.onCharacterLoaded(() => {
    stateM.initState(ctx);
    prestigeM.initPrestige(deps);
    workersM.initAllWorkers(deps);
    effectsM.setUIM(uiM);
    effectsM.setupAllEffects(ctx, skillsM.SKILLS, deps);
    starM.initStarAlignment(deps);
    slayerMasteryM.initSlayerMastery(deps);
    starM.startStarAlignment();
    starM.registerTestHook();

    // When astrology levels up, only start timers for newly unlocked constellations
    // without disturbing existing ones
    let _lastAstrologyLevel = 0;
    document.addEventListener('skill-prestige:xp-gained', e => {
      if (e.detail?.skillId !== 'astrology') return;
      try {
        const gs = game.astrology;
        if (!gs) return;
        const vLevel = deps.stateM.getVirtualLevel(gs);
        if (vLevel !== _lastAstrologyLevel) {
          _lastAstrologyLevel = vLevel;
          starM.startNewConstellations();
        }
      } catch(e2) {}
    });

    // Restart on upgrade purchase (rank changed, cooldown/duration may have changed)
    document.addEventListener('skill-prestige:upgrade-purchased', e => {
      if (e.detail?.skillId === 'astrology' && e.detail?.upgradeId === 'starAlignment') {
        starM.startStarAlignment();
      }
    });
    // Stop/start on toggle
    document.addEventListener('skill-prestige:upgrade-toggled', e => {
      if (e.detail?.skillId === 'astrology' && e.detail?.upgradeId === 'starAlignment') {
        const state = deps.stateM.getState('astrology');
        if (state.disabled?.starAlignment) starM.stopStarAlignment();
        else starM.startStarAlignment();
      }
    });
    combatEffectsM.initCombatEffects(deps);
    combatEffectsM.setupCombatEffects(ctx, combatM.COMBAT_SKILLS);
    combatEffectsM.applyAllCombatModifiers(combatM.COMBAT_SKILLS, combatM);
    globalTreeM.initGlobalTree(deps, ctx);
  });

  ctx.onInterfaceReady(() => {
    uiM.buildAllUI(deps);
    combatUIM.buildCombatUI(deps);
    // Apply tree modifiers here — player is fully initialized and combat stats are ready
    try { globalTreeM.applyTreeModifiers(); } catch(e) {}
  });
}

// core/combat_ui.mjs -- UI for combat skill prestiges (banners + pages)

let _d = null;
const openPages = {};

export function buildCombatUI(deps) {
  _d = deps;
  injectCombatPanel();
  // Re-inject if the combat tab is rebuilt
  const observer = new MutationObserver(() => injectCombatPanel());
  observer.observe(document.body, { childList: true, subtree: false });

  document.addEventListener('click', e => {
    deps.combatM.COMBAT_SKILLS.forEach(skill => {
      const page   = openPages[skill.id];
      const banner = document.getElementById('sp-banner-' + skill.id);
      if (!page) return;
      if (!page.contains(e.target) && !(banner && banner.contains(e.target))) {
        page.remove();
        delete openPages[skill.id];
      }
    });
  });

  document.addEventListener('skill-prestige:xp-gained', e => {
    const { skillId } = e.detail;
    if (!deps.combatM.getCombatSkill(skillId)) return;
    refreshCombatBanner(skillId);
    const page = openPages[skillId];
    if (page) renderCombatPage(skillId, page);
  });
  document.addEventListener('skill-prestige:slayer-mastery-xp', () => {
    const page = openPages['slayer'];
    if (page) renderCombatPage('slayer', page);
  });
  document.addEventListener('skill-prestige:upgrade-purchased', e => {
    if (!deps.combatM.getCombatSkill(e.detail.skillId)) return;
    const p = openPages[e.detail.skillId];
    if (p) renderCombatPage(e.detail.skillId, p);
    // Re-apply modifiers after purchase
    deps.combatEffectsM.applyCombatModifiers(e.detail.skillId, deps.combatM);
    try { game.combat?.player?.computeAllStats?.(); } catch(e2) {}
  });
  document.addEventListener('skill-prestige:prestiged', e => {
    if (!deps.combatM.getCombatSkill(e.detail.skillId)) return;
    refreshCombatBanner(e.detail.skillId);
    const p = openPages[e.detail.skillId];
    if (p) renderCombatPage(e.detail.skillId, p);
    updateCombatSidebarLabel(e.detail.skillId);
  });

  // Apply labels on load for any combat skills already prestiged in a previous session
  [200, 500, 1500].forEach(delay => setTimeout(() => {
    deps.combatM.COMBAT_SKILLS.forEach(skill => updateCombatSidebarLabel(skill.id));
  }, delay));
}

// Inject a single combined combat prestige panel into #combat-container.
// Melvor has no per-skill pages for combat skills — they all live inside the
// combat UI.  We prepend one panel that holds one banner slot per skill.
function injectCombatPanel() {
  if (document.getElementById('sp-combat-panel')) {
    refreshAllCombatBanners();
    return;
  }
  // Try the common container IDs in order
  const container =
    document.getElementById('combat-container') ??
    document.getElementById('melvorD:Combat-container') ??
    document.querySelector('[id$="Combat-container"]');
  if (!container) return;

  const panel = document.createElement('div');
  panel.id = 'sp-combat-panel';
  _d.combatM.COMBAT_SKILLS.forEach(skill => {
    const banner = document.createElement('div');
    banner.id = 'sp-banner-' + skill.id;
    panel.appendChild(banner);
  });
  container.prepend(panel);
  refreshAllCombatBanners();
}

function refreshAllCombatBanners() {
  if (!_d) return;
  _d.combatM.COMBAT_SKILLS.forEach(s => refreshCombatBanner(s.id));
}

export function refreshCombatBanner(skillId) {
  const banner = document.getElementById('sp-banner-' + skillId);
  if (!banner) return;
  const skill     = _d.combatM.getCombatSkill(skillId);
  const state     = _d.stateM.getState(skillId);
  const gs        = skill.gameSkill();
  const vLevel    = gs?.virtualLevel ?? gs?.level ?? 0;
  const needed    = _d.stateM.nextPrestigeLevel(skillId);
  const avail     = _d.stateM.availablePoints(skillId);
  const canPrestige  = vLevel >= needed;
  const hasPrestiged = state.prestigeCount > 0;
  const ppp       = _d.stateM.nextPrestigePoints(skillId);
  const pppLabel  = ppp + ' pt' + (ppp !== 1 ? 's' : '');

  let subText = '';
  if (hasPrestiged && canPrestige)
    subText = 'Prestige <strong>x' + state.prestigeCount + '</strong> &nbsp;|&nbsp; <span class="sp-pts">' + avail + ' pt' + (avail !== 1 ? 's' : '') + '</span> &nbsp;|&nbsp; <span class="sp-ready">Ready!</span>';
  else if (hasPrestiged)
    subText = 'Prestige <strong>x' + state.prestigeCount + '</strong> &nbsp;|&nbsp; <span class="sp-pts">' + avail + ' pt' + (avail !== 1 ? 's' : '') + '</span> &nbsp;|&nbsp; Next at level <strong>' + needed + '</strong>';
  else if (canPrestige)
    subText = 'Virtual level <strong>' + vLevel + '</strong> &mdash; ready to prestige!';
  else
    subText = 'Reach virtual level <strong>' + needed + '</strong> &mdash; currently <strong>' + vLevel + '</strong>';

  banner.innerHTML =
    '<div class="sp-banner" style="border:1px solid ' + skill.border + ';background:linear-gradient(135deg,' + skill.bg1 + ',' + skill.bg2 + ')">' +
      '<div class="sp-banner-left">' +
        '<span class="sp-banner-icon" style="color:' + skill.color + '">' + skill.icon + '</span>' +
        '<div><div class="sp-banner-title" style="color:' + skill.color + '">' + skill.name + ' Prestige</div>' +
        '<div class="sp-banner-sub">' + subText + '</div></div>' +
      '</div>' +
      '<div class="sp-banner-right">' +
        (canPrestige ? '<div class="sp-btn sp-buy-safe" style="background:' + skill.btnBg + ';border:1px solid ' + skill.border + ';color:' + skill.color + '" id="sp-prestige-btn-' + skillId + '">&#9733; Prestige (+' + pppLabel + ')</div>' : '') +
        '<div class="sp-btn sp-buy-safe" style="background:' + skill.btnBg + ';border:1px solid ' + skill.border + ';color:' + skill.color + '" id="sp-view-btn-' + skillId + '">View Upgrades</div>' +
      '</div>' +
    '</div>';

  document.getElementById('sp-prestige-btn-' + skillId)?.addEventListener('click', e => { e.stopPropagation(); showCombatConfirmModal(skillId); });
  document.getElementById('sp-view-btn-' + skillId)?.addEventListener('click', e => { e.stopPropagation(); showCombatPage(skillId); });
}

function showCombatConfirmModal(skillId) {
  document.getElementById('sp-modal-' + skillId)?.remove();
  const skill    = _d.combatM.getCombatSkill(skillId);

  // Block if combat is active — resetting a combat skill level mid-fight is lethal
  const inCombat = game.combat?.isActive ?? false;
  if (inCombat) {
    const overlay  = document.createElement('div');
    overlay.id        = 'sp-modal-' + skillId;
    overlay.className = 'sp-modal-overlay';
    overlay.innerHTML =
      '<div class="sp-modal" style="border-color:' + skill.border + ';background:' + skill.dark + '">' +
        '<div class="sp-modal-icon" style="color:#f0c040">&#9888;</div>' +
        '<h3 style="color:#f0c040">Cannot Prestige in Combat</h3>' +
        '<p>Resetting a combat skill during an active fight would be fatal.</p>' +
        '<p style="color:#aaa">Leave combat first, then prestige <strong style="color:' + skill.color + '">' + skill.name + '</strong>.</p>' +
        '<div class="sp-modal-btns">' +
          '<button class="btn btn-danger sp-buy-safe" id="sp-modal-no-' + skillId + '">OK</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.getElementById('sp-modal-no-' + skillId).addEventListener('click', e => { e.stopPropagation(); overlay.remove(); });
    overlay.addEventListener('click', ev => { if (ev.target === overlay) overlay.remove(); });
    return;
  }

  const needed   = _d.stateM.nextPrestigeLevel(skillId);
  const ppp      = _d.stateM.nextPrestigePoints(skillId);
  const pppLabel = ppp + ' Prestige Point' + (ppp !== 1 ? 's' : '');
  const overlay  = document.createElement('div');
  overlay.id        = 'sp-modal-' + skillId;
  overlay.className = 'sp-modal-overlay';
  overlay.innerHTML =
    '<div class="sp-modal" style="border-color:' + skill.border + ';background:' + skill.dark + '">' +
      '<div class="sp-modal-icon" style="color:' + skill.color + '">' + skill.icon + '</div>' +
      '<h3 style="color:' + skill.color + '">Prestige ' + skill.name + '?</h3>' +
      '<p>Your <strong>' + skill.name + '</strong> level will reset to 1.</p>' +
      '<p>You will receive <span class="sp-reward">+' + pppLabel + '</span>.</p>' +
      '<p>Next prestige at virtual level <strong>' + (needed + 1) + '</strong>.</p>' +
      '<p class="sp-warn">&#9888; Cannot be undone.</p>' +
      '<div class="sp-modal-btns">' +
        '<button class="btn btn-success sp-buy-safe" id="sp-modal-yes-' + skillId + '">Confirm</button>' +
        '<button class="btn btn-danger sp-buy-safe" id="sp-modal-no-' + skillId + '">Cancel</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  document.getElementById('sp-modal-yes-' + skillId).addEventListener('click', e => {
    e.stopPropagation(); overlay.remove();
    const success = _d.prestigeM.performPrestige(skillId, skill.gameSkill());
    if (success) {
      const newCount = _d.stateM.getState(skillId).prestigeCount;
      _d.uiM.showEffectToast(skillId, '&#127881; Prestiged to P' + newCount + '! Spend your points.');
    }
    refreshCombatBanner(skillId);
  });
  document.getElementById('sp-modal-no-' + skillId).addEventListener('click', e => { e.stopPropagation(); overlay.remove(); });
  overlay.addEventListener('click', ev => { if (ev.target === overlay) overlay.remove(); });
}

function showCombatPage(skillId) {
  const existing = openPages[skillId];
  if (existing) { existing.remove(); delete openPages[skillId]; return; }
  const main = document.getElementById('main-container') ?? document.body;
  const page = document.createElement('div');
  page.id        = 'sp-page-' + skillId;
  page.className = 'sp-page';
  const skill    = _d.combatM.getCombatSkill(skillId);
  if (skill) page.style.background = 'linear-gradient(160deg,' + skill.dark + ',' + skill.bg1 + ')';
  main.appendChild(page);
  openPages[skillId] = page;
  renderCombatPage(skillId, page);
}

function buildSlayerMasterySection(skill) {
  const entries = _d.slayerMasteryM?.getAllMasteryEntries?.() ?? [];
  if (!entries.length) {
    return '<div class="sp-section-title" style="color:' + skill.color + ';border-bottom:1px solid ' + skill.border + '40">Monster Mastery</div>' +
      '<div class="sp-locked" style="background:' + skill.bg1 + ';border:1px solid ' + skill.border + '60"><span>&#9876;</span><div>Complete Slayer tasks to begin building mastery against specific monsters.</div></div>';
  }
  const rows = entries.map(e => {
    const pct = e.isMaxLevel ? 100 : Math.round((e.xpIntoLevel / e.xpForNextLevel) * 100);
    const xpLabel = e.isMaxLevel ? 'Max Level' : (e.xpIntoLevel.toLocaleString() + ' / ' + e.xpForNextLevel.toLocaleString());
    return '<div class="sp-mastery-row" style="border:1px solid ' + skill.border + '30;background:' + skill.dark + '">' +
      '<div class="sp-mastery-name" style="color:' + skill.color + '">' + e.name + '</div>' +
      '<div class="sp-mastery-level">Lv. ' + e.level + ' <span class="sp-mastery-dmg">(+' + e.damageBonusPct + '% dmg, +' + e.accuracyBonusPct + '% acc)</span></div>' +
      '<div class="sp-mastery-bar-wrap"><div class="sp-mastery-bar-fill" style="width:' + pct + '%;background:' + skill.color + '"></div></div>' +
      '<div class="sp-mastery-xp">' + xpLabel + '</div>' +
    '</div>';
  }).join('');
  return '<div class="sp-section-title" style="color:' + skill.color + ';border-bottom:1px solid ' + skill.border + '40">Monster Mastery (' + entries.length + ' tracked)</div>' +
    '<div class="sp-mastery-list">' + rows + '</div>';
}

function renderCombatPage(skillId, page) {
  const skill    = _d.combatM.getCombatSkill(skillId);
  const state    = _d.stateM.getState(skillId);
  const gs       = skill.gameSkill();
  const vLevel   = gs?.virtualLevel ?? gs?.level ?? 0;
  const needed   = _d.stateM.nextPrestigeLevel(skillId);
  const avail    = _d.stateM.availablePoints(skillId);
  const canPrestige  = vLevel >= needed;
  const hasPrestiged = state.prestigeCount > 0;
  const ppp      = _d.stateM.nextPrestigePoints(skillId);
  const pppLabel = ppp + ' pt' + (ppp !== 1 ? 's' : '');
  const basePPP    = Math.min(5, Math.max(1, _d.stateM.getSettings(skillId).pointsPerPrestige ?? 1));
  const pppMult    = 1 + (state.prestigeCount * 0.05);
  const pppMultPct = Math.round(pppMult * 100);
  const xpNeeded = _d.stateM.xpForLevel(needed);
  const xpPct    = Math.min(Math.floor(((gs?.xp ?? 0) / Math.max(xpNeeded, 1)) * 100), 100);

  const xpBar = !canPrestige
    ? '<div class="sp-xp-wrap" style="background:' + skill.dark + ';border:1px solid ' + skill.border + '40"><div class="sp-xp-label"><span>Progress to prestige (level ' + needed + ')</span><span>' + xpPct + '%</span></div><div class="sp-xp-track"><div class="sp-xp-fill" style="width:' + xpPct + '%;background:linear-gradient(90deg,' + skill.border + '66,' + skill.border + ')"></div></div><div class="sp-xp-sub" style="color:' + skill.color + '88">Level <strong>' + vLevel + '</strong> / <strong>' + needed + '</strong></div></div>'
    : '<div class="sp-xp-wrap" style="background:' + skill.bg1 + ';border:1px solid ' + skill.border + '"><div class="sp-xp-label" style="color:' + skill.color + '"><span>&#9733; Ready to prestige at level ' + vLevel + '!</span><span>100%</span></div><div class="sp-xp-track"><div class="sp-xp-fill" style="width:100%;background:' + skill.border + '"></div></div></div>';

  const activeBonuses = skill.upgrades.filter(u => (state.upgrades[u.id] ?? 0) > 0);
  const modSection = activeBonuses.length > 0
    ? '<div class="sp-section-title" style="color:' + skill.color + ';border-bottom:1px solid ' + skill.border + '40">Active Bonuses</div>' +
      '<div class="sp-modifier-list" style="background:' + skill.dark + ';border:1px solid ' + skill.border + '40">' +
      activeBonuses.map(u => '<div class="sp-modifier-row"><span class="sp-modifier-icon">' + u.icon + '</span><span class="sp-modifier-name" style="color:' + skill.color + '">' + u.name + '</span><span class="sp-modifier-value" style="color:' + skill.color + '">' + _d.combatM.formatCombatBonus(u, state.upgrades[u.id]) + '</span><span class="sp-modifier-rank">rank ' + state.upgrades[u.id] + '</span></div>').join('') +
      '</div>' : '';

  const cards = skill.upgrades.map(u => {
    const rank      = state.upgrades[u.id] ?? 0;
    const isMaxed   = !!(u.maxRank && rank >= u.maxRank);
    const cost      = isMaxed ? 0 : _d.combatM.getCombatUpgradeCost(u, rank);
    const canBuy    = hasPrestiged && avail >= cost && !isMaxed;
    const isDisabled = !!(state.disabled?.[u.id]);
    const toggleBtn = u.toggleable && rank > 0
      ? '<div class="sp-toggle-btn ' + (isDisabled ? 'sp-toggle-off' : 'sp-toggle-on') + '" data-upgrade-id="' + u.id + '" style="' + (isDisabled ? 'border:1px solid #9e4a4a;color:#cf7e7e;cursor:pointer' : 'background:' + skill.btnBg + ';border:1px solid ' + skill.border + ';color:' + skill.color + ';cursor:pointer') + '">' + (isDisabled ? '&#9646; Off' : '&#9654; On') + '</div>'
      : '';
    return '<div class="sp-card" style="border-color:' + (hasPrestiged ? skill.border : '#333') + ';background:linear-gradient(135deg,' + skill.bg1 + ',' + skill.dark + ')">' +
      '<div class="sp-card-top"><div class="sp-card-icon-name"><span class="sp-card-icon">' + u.icon + '</span><span class="sp-card-name" style="color:' + skill.color + '">' + u.name + '</span></div>' +
      (rank > 0 ? '<span class="sp-rank-badge" style="border-color:' + skill.border + ';color:' + skill.color + ';background:' + skill.dark + '">Rank ' + rank + '</span>' : '') +
      '</div>' +
      '<div class="sp-card-desc">' + u.description + '</div>' +
      (rank > 0 ? '<div class="sp-card-current" style="color:' + skill.color + '">Bonus: <strong>' + _d.combatM.formatCombatBonus(u, rank) + '</strong> ' + toggleBtn + '</div>' : '') +
      '<div class="sp-card-footer" style="border-top:1px solid ' + skill.border + '30">' +
        (isMaxed ? '' : '<div class="sp-next-cost">Next: <strong style="color:#f0c040">' + cost + ' pt' + (cost !== 1 ? 's' : '') + '</strong></div>') +
        (isMaxed
          ? '<div class="sp-buy-btn sp-buy-disabled" style="color:#f0c040;border:1px solid #f0c040">MAX</div>'
          : !hasPrestiged
          ? '<div class="sp-buy-btn sp-buy-disabled">Locked</div>'
          : '<div class="sp-buy-btn' + (canBuy ? '' : ' sp-buy-disabled') + '" data-upgrade-id="' + u.id + '" style="' + (canBuy ? 'background:' + skill.btnBg + ';border:1px solid ' + skill.border + ';color:' + skill.color + ';cursor:pointer' : '') + '">Buy <span class="sp-cost" style="color:#f0c040">' + cost + ' pt' + (cost !== 1 ? 's' : '') + '</span></div>') +
      '</div></div>';
  }).join('');

  page.innerHTML =
    '<div class="sp-page-inner">' +
      '<div class="sp-page-header">' +
        '<div class="sp-btn" style="background:#1a1a1a;border:1px solid #444;color:#aaa;cursor:pointer" id="sp-back-' + skillId + '">&#8592; Back</div>' +
        '<div class="sp-page-title" style="color:' + skill.color + '">' + skill.icon + ' ' + skill.name + ' Prestige</div>' +
        (canPrestige ? '<div class="sp-btn sp-buy-safe" style="background:' + skill.btnBg + ';border:1px solid ' + skill.border + ';color:' + skill.color + '" id="sp-page-prestige-' + skillId + '">&#9733; Prestige (+' + pppLabel + ')</div>' : '') +
      '</div>' +
      xpBar +
      (!hasPrestiged ? '<div class="sp-locked" style="background:' + skill.bg1 + ';border:1px solid ' + skill.border + '60"><span>&#128274;</span><div><strong>Upgrades locked</strong> &mdash; prestige at virtual level ' + needed + ' to start.</div></div>' : '') +
      '<div class="sp-stats-row">' +
        '<div class="sp-stat-card" style="background:' + skill.dark + ' !important;border:1px solid ' + skill.border + '40"><div class="sp-stat-label">Virtual Level</div><div class="sp-stat-value ' + (canPrestige ? 'sp-ready-val' : '') + '" style="' + (canPrestige ? 'color:' + skill.color : '') + '">' + vLevel + '</div></div>' +
        '<div class="sp-stat-card" style="background:' + skill.dark + ' !important;border:1px solid ' + skill.border + '40"><div class="sp-stat-label">Prestige Count</div><div class="sp-stat-value" style="color:' + skill.color + '">' + state.prestigeCount + '</div></div>' +
        '<div class="sp-stat-card" style="background:' + skill.dark + ' !important;border:2px solid ' + skill.border + '"><div class="sp-stat-label">Points Available</div><div class="sp-stat-value" style="color:' + skill.color + '">' + avail + '</div></div>' +
        '<div class="sp-stat-card" style="background:' + skill.dark + ' !important;border:1px solid ' + skill.border + '40"><div class="sp-stat-label">Next Prestige</div><div class="sp-stat-value sp-muted">Level ' + needed + '</div></div>' +
        '<div class="sp-stat-card" style="background:' + skill.dark + ' !important;border:1px solid ' + skill.border + '40"><div class="sp-stat-label">Point Bonus</div><div class="sp-stat-value" style="color:' + skill.color + '">' + pppMultPct + '% <span style="font-size:0.7em;color:' + skill.color + '88">(' + basePPP + '&rarr;' + ppp + ')</span></div></div>' +
      '</div>' +
      modSection +
      (skillId === 'slayer' ? buildSlayerMasterySection(skill) : '') +
      '<div class="sp-section-title" style="color:' + skill.color + ';border-bottom:1px solid ' + skill.border + '40">Prestige Upgrades</div>' +
      '<div class="sp-grid">' + cards + '</div>' +
    '</div>';

  document.getElementById('sp-back-' + skillId)?.addEventListener('click', e => { e.stopPropagation(); page.remove(); delete openPages[skillId]; });
  document.getElementById('sp-page-prestige-' + skillId)?.addEventListener('click', e => { e.stopPropagation(); showCombatConfirmModal(skillId); });
  page.querySelectorAll('.sp-buy-btn:not(.sp-buy-disabled)').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const upgradeId = btn.dataset.upgradeId;
      if (_d.prestigeM.purchaseCombatUpgrade(skillId, upgradeId, avail)) {
        _d.combatEffectsM.applyCombatModifiers(skillId, _d.combatM);
        try { game.combat?.player?.computeAllStats?.(); } catch(e2) {}
        renderCombatPage(skillId, page);
      }
    });
  });
  page.querySelectorAll('.sp-toggle-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const upgradeId = btn.dataset.upgradeId;
      _d.prestigeM.toggleUpgrade(skillId, upgradeId);
      _d.combatEffectsM.applyCombatModifiers(skillId, _d.combatM);
      try { game.combat?.player?.computeAllStats?.(); } catch(e2) {}
      renderCombatPage(skillId, page);
    });
  });
}

function updateCombatSidebarLabel(skillId) {
  try {
    const skill = _d.combatM.COMBAT_SKILLS.find(s => s.id === skillId);
    if (!skill) return;
    const state = _d.stateM.getState(skillId);
    const count = state.prestigeCount ?? 0;

    const SUP_ID = 'sp-prestige-sup-' + skillId;
    const applyLabel = () => {
      try {
        // Slayer lives under Non-Combat; Attack/Strength/etc. live under Combat
        const cats = ['Combat', 'Non-Combat'];
        let nameEl = null;
        for (const cat of cats) {
          try { nameEl = sidebar.category(cat).item(skill.skillId).nameEl; } catch(e2) {}
          if (nameEl) break;
        }
        if (!nameEl) return;
        // Remove any previous sup we injected
        nameEl.querySelector('#' + SUP_ID)?.remove();
        if (count <= 0) return;
        // Find the first text node containing the skill name and split after it,
        // preserving any existing child elements (HP counter, prayer points, etc.)
        const sup = document.createElement('sup');
        sup.id = SUP_ID;
        sup.style.cssText = 'color:#f0c040;font-size:0.7em;font-weight:bold;vertical-align:super;line-height:1';
        sup.textContent = 'P' + count;
        // Insert after the first text node (skill name), before any dynamic value nodes
        let inserted = false;
        for (const node of Array.from(nameEl.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            node.after(sup);
            inserted = true;
            break;
          }
        }
        // Fallback: append at end if no text node found
        if (!inserted) nameEl.appendChild(sup);
      } catch(e) {}
    };

    applyLabel();
    [200, 500, 1500].forEach(delay => setTimeout(applyLabel, delay));
  } catch(e) {}
}

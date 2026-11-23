// core/ui.mjs -- shared UI for all skill prestiges

// Track open pages per skill
const openPages = {};
let _selectCooldown = false;

let _d = null;
export function buildAllUI(deps) { _d = deps;
  _d.skillsM.SKILLS.forEach(skill => buildSkillUI(skill));
  listenForEvents();
}

function listenForEvents() {
  document.addEventListener('focusin', e => {
    if (e.target?.tagName === 'SELECT') {
      _selectCooldown = true;
      // Clear cooldown when focus leaves the select
      e.target.addEventListener('blur', () => { _selectCooldown = false; }, { once: true });
    }
  });
  document.addEventListener('change', e => {
    if (e.target?.tagName === 'SELECT') {
      _selectCooldown = true;
      setTimeout(() => { _selectCooldown = false; }, 600);
    }
  });

  const _bannerThrottle = {};
  const _renderThrottle = {};
  const _lastSkillLevel  = {};
  document.addEventListener('skill-prestige:xp-gained', e => {
    const { skillId } = e.detail;
    if (game._forceOfflineLoop || (game._offlineInfo?.startTime > 0)) return;
    // This event fires for combat skills too -- only proceed if it's one of ours
    const skill = _d.skillsM.SKILLS.find(s => s.id === skillId);
    if (!skill) return;
    const gs = skill.gameSkill();
    const lvl = gs?.level ?? 0;
    if ((_lastSkillLevel[skillId] ?? -1) !== lvl) {
      _lastSkillLevel[skillId] = lvl;
      invalidateSelectCache(skillId);
    }
    // Throttle banner refresh to once per second too
    if (!_bannerThrottle[skillId]) {
      refreshBanner(skillId);
      _bannerThrottle[skillId] = setTimeout(() => { _bannerThrottle[skillId] = null; }, 1000);
    }
    const page = openPages[skillId];
    if (!page) return;
    if (_selectCooldown) return;
    if (_renderThrottle[skillId]) return;
    _renderThrottle[skillId] = setTimeout(() => {
      _renderThrottle[skillId] = null;
      const p = openPages[skillId];
      if (p) refreshXPBar(skillId, p);
    }, 500);
  });
  document.addEventListener('skill-prestige:prestiged',         e => { refreshBanner(e.detail.skillId); const p = openPages[e.detail.skillId]; if (p) renderPage(e.detail.skillId, p); updateSidebarLabel(e.detail.skillId); });
  document.addEventListener('skill-prestige:upgrade-purchased', e => { const p = openPages[e.detail.skillId]; if (p) renderPage(e.detail.skillId, p); });
  document.addEventListener('skill-prestige:upgrade-toggled',   e => { const p = openPages[e.detail.skillId]; if (p) renderPage(e.detail.skillId, p); });
  document.addEventListener('skill-prestige:worker-hired',      e => { const p = openPages[e.detail.skillId]; if (p) renderPage(e.detail.skillId, p); });
  document.addEventListener('skill-prestige:worker-assigned', e => {
    const p = openPages[e.detail.skillId];
    if (!p) return;
    // Sync status badges
    p.querySelectorAll('.sp-worker-status').forEach((el, i) => {
      const running = _d.workersM.isWorkerRunning(e.detail.skillId, i);
      el.textContent = running ? '\u25B6 Active' : '\u23F8 Idle';
      el.style.color = running ? '#4ade80' : '#ffffff60';
    });
    // Sync custom dropdown label in-place -- no re-render needed
    const { index } = e.detail;
    const dd = p.querySelector(`.sp-dd[data-index="${index}"]`);
    if (dd) {
      const workers = _d.stateM.getWorkers(e.detail.skillId);
      const w = workers[index];
      const val = w?.recipeId ?? w?.treeId ?? w?.constellationId ?? '';
      syncDropdown(dd, val);
    }
  });
  document.addEventListener('skill-prestige:worker-toggled',    e => { const p = openPages[e.detail.skillId]; if (p) renderPage(e.detail.skillId, p); });

  // Star Alignment -- apply/remove glow on buffed skill pages and banners
  function applyStarGlow(sid, action, constName, durationMs, constellationId) {
    const skillDef   = _d.skillsM.SKILLS.find(s => s.id === sid);
    const actionLabel = action ? action.name : null;
    const durLabel    = Math.round(durationMs / 1000) + 's';
    const bonusPct    = _d.starM.getConstellationBonusPct ? _d.starM.getConstellationBonusPct(constellationId) : 20;
    const bannerText  = '&#11088; ' + constName + ' blessing: +' + bonusPct.toFixed(0) + '% XP &amp; Speed' +
                        (actionLabel ? ' on <strong>' + actionLabel + '</strong>' : '') +
                        ' (' + durLabel + ')';
    const bannerId    = 'sp-star-skill-banner-' + sid + '-' + constName;

    // Glow on open prestige overlay page
    const page = openPages[sid];
    if (page) {
      if (!document.getElementById('sp-star-banner-' + sid + '-' + constName)) {
        const hdr = page.querySelector('.sp-page-header');
        if (hdr) {
          const banner = document.createElement('div');
          banner.className = 'sp-star-banner';
          banner.id = 'sp-star-banner-' + sid + '-' + constName;
          banner.innerHTML = bannerText;
          hdr.after(banner);
        }
      }
    }

    // Glow action card and banner in Melvor's skill page
    if (skillDef?.container) {
      const container = document.getElementById(skillDef.container);
      if (container) {
        if (action) {
          const glowEl = findActionCardElement(container, action.id);
          if (glowEl) {
            glowEl.classList.add('sp-star-glow');
            glowEl.dataset.spStarConst = (glowEl.dataset.spStarConst ?? '') + ' ' + constName;
          }
        }
        if (!document.getElementById(bannerId)) {
          const banner = document.createElement('div');
          banner.id = bannerId;
          banner.className = 'sp-star-banner';
          banner.style.cssText = 'margin:8px 8px 0;border-radius:6px';
          banner.innerHTML = bannerText;
          container.prepend(banner);
        }
      }
    }
  }

  function removeStarGlow(constName) {
    // Remove banners for this constellation
    document.querySelectorAll(`[id*="-${constName}"]`).forEach(el => {
      if (el.id.startsWith('sp-star-')) el.remove();
    });
    // Remove glow from cards that were only blessed by this constellation
    document.querySelectorAll('.sp-star-glow[data-sp-star-const]').forEach(el => {
      const consts = (el.dataset.spStarConst ?? '').trim().split(/\s+/).filter(Boolean);
      const remaining = consts.filter(c => c !== constName);
      el.dataset.spStarConst = remaining.join(' ');
      if (!remaining.length) el.classList.remove('sp-star-glow');
    });
  }

  document.addEventListener('skill-prestige:star-alignment-start', e => {
    const { skills, constellationId, durationMs, actions } = e.detail;
    const constName = constellationId.split(':')[1] ?? constellationId;
    skills.forEach(sid => applyStarGlow(sid, actions?.[sid], constName, durationMs, constellationId));
    // Refresh astrology timer widget
    if (openPages['astrology']) mountStarTimer('astrology');
  });

  document.addEventListener('skill-prestige:star-alignment-end', e => {
    const constName = e.detail?.constellationId?.split(':')[1] ?? e.detail?.constellationId;
    if (constName) removeStarGlow(constName);
    else {
      document.querySelectorAll('.sp-star-glow').forEach(el => el.classList.remove('sp-star-glow'));
      document.querySelectorAll('[id^="sp-star-banner-"],[id^="sp-star-skill-banner-"]').forEach(el => el.remove());
    }
    if (openPages['astrology']) mountStarTimer('astrology');
  });

  // Close page when clicking outside it
  // Close any open custom dropdowns when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.sp-dd')) {
      document.querySelectorAll('.sp-dd[data-open]').forEach(d => d.removeAttribute('data-open'));
    }
  });

  document.addEventListener('click', e => {
    _d.skillsM.SKILLS.forEach(skill => {
      const page   = openPages[skill.id];
      const banner = document.getElementById('sp-banner-' + skill.id);
      if (!page) return;
      if (!page.contains(e.target) && !(banner && banner.contains(e.target))) {
        page.remove();
        delete openPages[skill.id];
      }
    });
  });
}

function buildSkillUI(skill) {
  const id = skill.id;

  // Inject banner into skill container
  function injectBanner() {
    if (document.getElementById(`sp-banner-${id}`)) { refreshBanner(id); return; }
    const container = document.getElementById(skill.container);
    if (!container) return;
    const banner = document.createElement('div');
    banner.id = `sp-banner-${id}`;
    container.prepend(banner);
    refreshBanner(id);
    // Only update sidebar label if we've actually prestiged -- avoids touching
    // Melvor's sidebar entries before they're fully populated
    const _state = _d.stateM.getState(id);
    if ((_state.prestigeCount ?? 0) > 0) {
      setTimeout(() => updateSidebarLabel(id), 300);
    }
  }

  // Try immediately and also on skill page visits
  injectBanner();
  const observer = new MutationObserver(() => injectBanner());
  observer.observe(document.body, { childList: true, subtree: false });
}

export function refreshBanner(skillId) {
  const banner = document.getElementById('sp-banner-' + skillId);
  if (!banner) return;
  const skill     = _d.skillsM.SKILLS.find(s => s.id === skillId);
  if (!skill) return;
  const state     = _d.stateM.getState(skillId);
  const gameSkill = skill.gameSkill();
  const vLevel    = _d.stateM.getVirtualLevel(gameSkill);
  const needed    = _d.stateM.nextPrestigeLevel(skillId);
  const avail     = _d.stateM.availablePoints(skillId);
  const canPrestige   = vLevel >= needed;
  const hasPrestiged  = state.prestigeCount > 0;
  const ppp = _d.stateM.nextPrestigePoints(skillId);
  const pppLabel = ppp + ' pt' + (ppp !== 1 ? 's' : '');

  let subText = '';
  if (hasPrestiged && canPrestige) {
    subText = `Prestige <strong>x${state.prestigeCount}</strong> &nbsp;|&nbsp; <span class="sp-pts">${avail} pt${avail !== 1 ? 's' : ''}</span> &nbsp;|&nbsp; <span class="sp-ready">Ready!</span>`;
  } else if (hasPrestiged) {
    subText = `Prestige <strong>x${state.prestigeCount}</strong> &nbsp;|&nbsp; <span class="sp-pts">${avail} pt${avail !== 1 ? 's' : ''}</span> &nbsp;|&nbsp; Next at level <strong>${needed}</strong>`;
  } else if (canPrestige) {
    subText = `Virtual level <strong>${vLevel}</strong> &mdash; ready to prestige!`;
  } else {
    subText = `Reach virtual level <strong>${needed}</strong> &mdash; currently <strong>${vLevel}</strong>`;
  }

  banner.innerHTML = `
    <div class="sp-banner" style="border:1px solid ${skill.border};background:linear-gradient(135deg,${skill.bg1},${skill.bg2})">
      <div class="sp-banner-left">
        <span class="sp-banner-icon" style="color:${skill.color}">${skill.icon}</span>
        <div>
          <div class="sp-banner-title" style="color:${skill.color}">${skill.name} Prestige</div>
          <div class="sp-banner-sub">${subText}</div>
        </div>
      </div>
      <div class="sp-banner-right">
        ${canPrestige ? `<div class="sp-btn sp-buy-safe" style="background:${skill.btnBg};border:1px solid ${skill.border};color:${skill.color}" id="sp-prestige-btn-${skillId}">&#9733; Prestige (+${pppLabel})</div>` : ''}
        <div class="sp-btn sp-buy-safe" style="background:${skill.btnBg};border:1px solid ${skill.border};color:${skill.color}" id="sp-view-btn-${skillId}">View Upgrades</div>
      </div>
    </div>`;

  // Use event delegation on the banner element — attach once, survives innerHTML rebuilds
  if (!banner._listenersAttached) {
    banner._listenersAttached = true;
    banner.addEventListener('click', e => {
      if (e.target.closest(`#sp-prestige-btn-${skillId}`)) { e.stopPropagation(); showConfirmModal(skillId); }
      if (e.target.closest(`#sp-view-btn-${skillId}`))    { e.stopPropagation(); showPage(skillId); }
    });
  }
}



// Stacking effect toasts — newest at bottom, oldest fade out after 2s
// Same-message toasts within the window merge with an updated count
const _TOAST_DURATION = 2000;
const _MAX_TOASTS = 8;
const _activeToasts = new Map(); // key -> {el, count, timer}

function _getToastContainer() {
  let c = document.getElementById('sp-effect-toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'sp-effect-toast-container';
    c.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99998;display:flex;flex-direction:column;gap:6px;pointer-events:none;align-items:flex-end';
    document.body.appendChild(c);
  }
  return c;
}

export function showEffectToast(skillId, message) {
  const skill = _d?.skillsM?.SKILLS?.find(s => s.id === skillId);
  if (!skill) return;
  const container = _getToastContainer();

  // Dedup key — skill + base message (strip trailing count like "×2")
  const baseMsg = message.replace(/ ×\d+$/, '');
  const key = skillId + '|' + baseMsg;

  if (_activeToasts.has(key)) {
    // Merge — increment count, reset opacity and timer
    const entry = _activeToasts.get(key);
    entry.count++;
    entry.el.style.opacity = '1'; // cancel any in-progress fade
    const countEl = entry.el.querySelector('.sp-toast-count');
    if (countEl) countEl.textContent = ' ×' + entry.count;
    clearTimeout(entry.timer);
    entry.timer = setTimeout(() => {
      entry.el.style.opacity = '0';
      setTimeout(() => { entry.el.remove(); _activeToasts.delete(key); }, 300);
    }, _TOAST_DURATION);
    return;
  }

  // Trim oldest if too many
  while (container.children.length >= _MAX_TOASTS) {
    container.firstElementChild?.remove();
  }

  const toast = document.createElement('div');
  toast.style.cssText =
    'background:linear-gradient(135deg,' + skill.bg1 + ',' + skill.dark + ');' +
    'border:1px solid ' + skill.border + ';border-radius:8px;' +
    'padding:7px 12px;color:#ddd;font-size:0.82em;' +
    'display:flex;align-items:center;gap:8px;pointer-events:auto;' +
    'box-shadow:0 4px 16px rgba(0,0,0,0.6);max-width:280px;' +
    'opacity:1;transition:opacity 0.3s ease';
  toast.innerHTML =
    '<span style="font-size:1.1em;flex-shrink:0">' + skill.icon + '</span>' +
    '<span style="color:' + skill.color + ';font-weight:bold;flex-shrink:0">' + skill.name + '</span>' +
    '<span style="color:#aaa">' + baseMsg + '<span class="sp-toast-count"></span></span>';

  container.appendChild(toast);

  const timer = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.remove(); _activeToasts.delete(key); }, 300);
  }, _TOAST_DURATION);

  _activeToasts.set(key, { el: toast, count: 1, timer });
}


function showPrestigeToast(skillId, count, skill) {
  document.getElementById('sp-toast-' + skillId)?.remove();
  const avail = _d.stateM.availablePoints(skillId);
  const toast = document.createElement('div');
  toast.id = 'sp-toast-' + skillId;
  toast.className = 'sp-toast';
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;' +
    'background:linear-gradient(135deg,' + skill.bg1 + ',' + skill.bg2 + ');' +
    'border:2px solid ' + skill.border + ';border-radius:12px;padding:16px 24px;' +
    'color:#ddd;text-align:center;min-width:320px;max-width:480px;' +
    'box-shadow:0 8px 32px rgba(0,0,0,0.7);animation:sp-toast-in 0.3s ease';
  toast.innerHTML =
    '<div style="font-size:1.6em;margin-bottom:6px">' + skill.icon + ' &#127881;</div>' +
    '<div style="font-size:1.1em;font-weight:bold;color:' + skill.color + ';margin-bottom:4px">' +
      'Congratulations! ' + skill.name + ' P' + count +
    '</div>' +
    '<div style="font-size:0.88em;color:#aaa;margin-bottom:10px">' +
      'You have <strong style="color:' + skill.color + '">' + avail + ' point' + (avail !== 1 ? 's' : '') + '</strong> to spend!' +
    '</div>' +
    '<div class="sp-btn sp-buy-safe" style="display:inline-flex;background:' + skill.btnBg + ';border:1px solid ' + skill.border + ';color:' + skill.color + ';cursor:pointer;padding:6px 16px;border-radius:6px;font-weight:bold" id="sp-toast-open-' + skillId + '">' +
      'Spend Points &#8594;' +
    '</div>';
  document.body.appendChild(toast);
  document.getElementById('sp-toast-open-' + skillId)?.addEventListener('click', e => {
    e.stopPropagation();
    toast.remove();
    showPage(skillId);
  });
  // Auto-dismiss after 8 seconds
  setTimeout(() => { toast.style.animation = 'sp-toast-out 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 8000);
  // Click anywhere on toast (not button) to dismiss
  toast.addEventListener('click', e => { if (e.target === toast || !toast.querySelector('#sp-toast-open-' + skillId)?.contains(e.target)) { toast.remove(); } });
}

function showConfirmModal(skillId) {
  document.getElementById(`sp-modal-${skillId}`)?.remove();
  const skill    = _d.skillsM.SKILLS.find(s => s.id === skillId);
  const state    = _d.stateM.getState(skillId);
  const needed   = _d.stateM.nextPrestigeLevel(skillId);
  const ppp      = _d.stateM.nextPrestigePoints(skillId);
  const pppLabel = ppp + ' Prestige Point' + (ppp !== 1 ? 's' : '');
  const overlay  = document.createElement('div');
  overlay.id        = `sp-modal-${skillId}`;
  overlay.className = 'sp-modal-overlay';
  overlay.innerHTML = `
    <div class="sp-modal" style="border-color:${skill.border};background:${skill.dark}">
      <div class="sp-modal-icon" style="color:${skill.color}">${skill.icon}</div>
      <h3 style="color:${skill.color}">Prestige ${skill.name}?</h3>
      <p>Your <strong>${skill.name}</strong> level and mastery will reset to 1.</p>
      <p>You will receive <span class="sp-reward">+${pppLabel}</span>.</p>
      <p>Next prestige at virtual level <strong>${needed + 1}</strong>.</p>
      <p class="sp-warn">&#9888; Cannot be undone.</p>
      <div class="sp-modal-btns">
        <button class="btn btn-success sp-buy-safe" id="sp-modal-yes-${skillId}">Confirm</button>
        <button class="btn btn-danger sp-buy-safe" id="sp-modal-no-${skillId}">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById(`sp-modal-yes-${skillId}`).addEventListener('click', e => {
    e.stopPropagation(); overlay.remove();
    const skill   = _d.skillsM.SKILLS.find(s => s.id === skillId);
    _d.prestigeM.performPrestige(skillId, skill.gameSkill());
    refreshBanner(skillId);
  });
  document.getElementById(`sp-modal-no-${skillId}`).addEventListener('click', e => { e.stopPropagation(); overlay.remove(); });
  overlay.addEventListener('click', ev => { if (ev.target === overlay) overlay.remove(); });
}

function showPage(skillId) {
  const existing = openPages[skillId];
  if (existing) { existing.remove(); delete openPages[skillId]; return; }
  const main = document.getElementById('main-container') ?? document.body;
  const page = document.createElement('div');
  page.id        = `sp-page-${skillId}`;
  const _skill = _d.skillsM.SKILLS.find(s => s.id === skillId);
  page.className = 'sp-page';
  if (_skill) { page.style.background = `linear-gradient(160deg,${_skill.dark},${_skill.bg1})`; }
  main.appendChild(page);
  openPages[skillId] = page;

  // Attach delegated listeners ONCE here — they survive re-renders since page element persists
  page.addEventListener('click', e => {
    const back = e.target.closest(`#sp-back-${skillId}`);
    if (back) { e.stopPropagation(); page.remove(); delete openPages[skillId]; if (skillId === 'astrology' && _starTimerInterval) { clearInterval(_starTimerInterval); _starTimerInterval = null; } try { const found = findSidebarCategoryAndId(skillId); if (found) sidebar.category(found.category).item(found.sidebarId).click(); } catch(_) {} return; }
    const prestige = e.target.closest(`#sp-page-prestige-${skillId}`);
    if (prestige) { e.stopPropagation(); showConfirmModal(skillId); return; }
    const buyBtn = e.target.closest('.sp-buy-btn');
    if (buyBtn?.dataset.upgradeId) { e.stopPropagation(); const av = _d.stateM.availablePoints(skillId); if (_d.prestigeM.purchaseUpgrade(skillId, buyBtn.dataset.upgradeId, av)) renderPage(skillId, page); return; }
    const toggleBtn = e.target.closest('.sp-toggle-btn');
    if (toggleBtn?.dataset.upgradeId) { e.stopPropagation(); _d.prestigeM.toggleUpgrade(skillId, toggleBtn.dataset.upgradeId); renderPage(skillId, page); return; }
    const workerToggle = e.target.closest('.sp-worker-toggle');
    if (workerToggle?.dataset.index != null) { e.stopPropagation(); _d.workersM.toggleWorker(skillId, parseInt(workerToggle.dataset.index, 10)); return; }
  });
  // Custom dropdown item click -- replaces native <select> change event
  page.addEventListener('click', e => {
    // Toggle open/close on trigger click
    const trigger = e.target.closest('.sp-dd-trigger');
    if (trigger) {
      e.stopPropagation();
      const dd = trigger.closest('.sp-dd');
      const isOpen = dd.hasAttribute('data-open');
      // Close all other open dropdowns on this page
      page.querySelectorAll('.sp-dd[data-open]').forEach(d => { if (d !== dd) d.removeAttribute('data-open'); });
      if (isOpen) dd.removeAttribute('data-open');
      else dd.setAttribute('data-open', '');
      return;
    }
    // Item selection
    const item = e.target.closest('.sp-dd-item');
    if (item) {
      e.stopPropagation();
      const dd = item.closest('.sp-dd');
      if (!dd) return;
      const val = item.dataset.value || null;
      dd.removeAttribute('data-open');
      _selectCooldown = true;
      setTimeout(() => { _selectCooldown = false; }, 500);
      _d.workersM.assignWorker(skillId, parseInt(dd.dataset.index, 10), val);
      return;
    }
  });

  renderPage(skillId, page);
}

// Find the glowable card element for a given action ID inside a skill container.
// Handles both mastery-display skills (woodcutting, mining, fishing etc.)
// and artisan-recipe skills (smithing, fletching, crafting etc.)
function findActionCardElement(container, actionId) {
  // Strategy 1: mastery-display[data-action-id] -- woodcutting, mining, fishing, firemaking etc.
  // The DOM may use a shortened ID (e.g. "melvorD:Normal" for "melvorD:Normal_Tree")
  const allMastery = container.querySelectorAll('mastery-display[data-action-id]');
  for (const md of allMastery) {
    const domId = md.getAttribute('data-action-id');
    if (actionId === domId || actionId.startsWith(domId) || domId.startsWith(actionId)) {
      // Walk up to find the card element -- stop at the first .block div/anchor,
      // or a hyphenated custom element that is NOT a broad area wrapper.
      // Area wrappers (fishing-area-menu etc.) contain many cards so we skip them.
      const AREA_WRAPPERS = new Set(['FISHING-AREA-MENU','FIREMAKING-LOG-MENU','MASTERY-SKILL-OPTIONS']);
      let el = md.parentElement;
      while (el && el !== container) {
        // a.block or div.block -- this is the individual card
        if (el.classList.contains('block') && (el.tagName === 'A' || el.tagName === 'DIV')) {
          return el;
        }
        // Custom element card (woodcutting-tree, smithing-recipe-option etc.) -- not an area wrapper
        if (el.tagName.includes('-') && !AREA_WRAPPERS.has(el.tagName)) {
          return el.querySelector('a.block, a.block-rounded, a.nav-link') ?? el;
        }
        el = el.parentElement;
      }
      return null;
    }
  }

  // Strategy 2: artisan-recipe-{actionId} image ID -- smithing, fletching, crafting, herblore etc.
  const img = container.querySelector(`[id="artisan-recipe-${actionId}"]`);
  if (img) {
    // Walk up to the custom element card (smithing-recipe-option etc.)
    let el = img.parentElement;
    while (el && el.parentElement) {
      if (el.tagName && el.tagName.includes('-')) {
        return el.querySelector('a.block, a.block-rounded, a.nav-link') ?? el;
      }
      el = el.parentElement;
    }
  }

  return null;
}

// Star alignment timer -- updates the progress bar on the upgrade card
let _starTimerInterval = null;
function mountStarTimer(skillId) {
  const wrap = document.getElementById('sp-star-timer-' + skillId);
  if (!wrap) return;
  if (_starTimerInterval) { clearInterval(_starTimerInterval); _starTimerInterval = null; }

  function render() {
    const starM = _d.starM;
    if (!starM) return;
    const rank    = _d.stateM.getState(skillId).upgrades.starAlignment ?? 0;
    const dur     = 30000 + rank * 1000;
    const cdTotal = Math.floor(600000 * (1 - Math.min(rank * 0.01, 0.80)));
    const now     = Date.now();
    const timers  = starM.getConstellationTimers ? starM.getConstellationTimers() : [];

    if (!timers.length) {
      wrap.innerHTML = '<div class="sp-star-status" style="color:#888">Waiting for first blessing...</div>';
      return;
    }

    const rows = timers.map(t => {
      const constName = t.constId.split(':')[1] ?? t.constId;
      const skillDefs = _d.skillsM.SKILLS;
      if (t.isActive && t.buffEndsAt) {
        const endMs  = Math.max(0, t.buffEndsAt - now);
        const pct    = Math.round((endMs / dur) * 100);
        const actionLines = Object.entries(t.actions ?? {}).map(([sid, a]) => {
          const def = skillDefs.find(s => s.id === sid);
          return `<span style="color:#ccc">${def ? def.name : sid}:</span> <strong style="color:#f0c040">${a.name}</strong>`;
        }).join(' &nbsp;|&nbsp; ');
        const bonus = _d.starM.getConstellationBonusPct ? _d.starM.getConstellationBonusPct(t.constId) : 20;
        return `<div class="sp-star-const-row">` +
          `<div class="sp-star-status" style="color:#f0c040">&#11088; ${constName} active! <span style="color:#ffe88a">+${bonus.toFixed(0)}% XP &amp; Speed</span></div>` +
          (actionLines ? `<div class="sp-star-actions">${actionLines}</div>` : '') +
          `<div class="sp-star-bar-wrap"><div class="sp-star-bar-fill sp-star-bar-active" style="width:${pct}%"></div></div>` +
          `<div class="sp-star-bar-label">${Math.ceil(endMs/1000)}s remaining</div></div>`;
      } else if (t.nextFireAt) {
        const nextMs = Math.max(0, t.nextFireAt - now);
        const pct    = Math.round(((cdTotal - nextMs) / cdTotal) * 100);
        const mins   = Math.floor(nextMs / 60000);
        const secs   = Math.floor((nextMs % 60000) / 1000);
        const label  = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        return `<div class="sp-star-const-row">` +
          `<div class="sp-star-status" style="color:#888">&#11088; ${constName}: ${label}</div>` +
          `<div class="sp-star-bar-wrap"><div class="sp-star-bar-fill" style="width:${pct}%"></div></div>` +
          `</div>`;
      }
      return '';
    }).filter(Boolean).join('');

    wrap.innerHTML = rows || '<div class="sp-star-status" style="color:#888">Waiting...</div>';
  }

  render();
  _starTimerInterval = setInterval(render, 1000);
}

function refreshXPBar(skillId, page) {
  const xpWrap = page.querySelector('.sp-xp-wrap');
  if (!xpWrap) return; // page not fully rendered yet, skip
  const skill     = _d.skillsM.SKILLS.find(s => s.id === skillId);
  const state     = _d.stateM.getState(skillId);
  const gameSkill = skill.gameSkill();
  const vLevel    = _d.stateM.getVirtualLevel(gameSkill);
  const needed    = _d.stateM.nextPrestigeLevel(skillId);
  const canPrestige = vLevel >= needed;
  const c         = skill.color;

  if (canPrestige) {
    xpWrap.style.border      = `1px solid ${skill.border}`;
    xpWrap.style.background  = skill.bg1;
    xpWrap.innerHTML = `<div class="sp-xp-label" style="color:${c}"><span>&#9733; Ready to prestige at level ${vLevel}!</span><span>100%</span></div><div class="sp-xp-track"><div class="sp-xp-fill" style="width:100%;background:${c}"></div></div>`;
  } else {
    const currentXP = gameSkill?.xp ?? 0;
    const xpNeeded  = _d.stateM.xpForLevel(needed);
    const xpPct     = Math.min(Math.floor((currentXP / Math.max(xpNeeded, 1)) * 100), 100);
    xpWrap.style.border      = `1px solid ${skill.border}40`;
    xpWrap.style.background  = skill.dark;
    xpWrap.innerHTML = `<div class="sp-xp-label"><span>Progress to prestige (level ${needed})</span><span>${xpPct}%</span></div><div class="sp-xp-track"><div class="sp-xp-fill" style="width:${xpPct}%;background:linear-gradient(90deg,${c}66,${c})"></div></div><div class="sp-xp-sub" style="color:${skill.color}88">Level <strong>${vLevel}</strong> / <strong>${needed}</strong></div>`;
  }

  // Also update the Virtual Level stat card and prestige button -- cheap targeted DOM writes
  const vlCard = page.querySelector('.sp-stat-value');
  if (vlCard) {
    vlCard.textContent = vLevel;
    vlCard.className   = 'sp-stat-value' + (canPrestige ? ' sp-ready-val' : '');
    vlCard.style.color = canPrestige ? c : '';
  }
  const hdr = page.querySelector('.sp-page-header');
  if (hdr) {
    const existingBtn = hdr.querySelector(`#sp-page-prestige-${skillId}`);
    const avail = _d.stateM.availablePoints(skillId);
    const ppp   = _d.stateM.nextPrestigePoints(skillId);
    const pppLabel = ppp + ' pt' + (ppp !== 1 ? 's' : '');
    if (canPrestige && !existingBtn) {
      const btn = document.createElement('div');
      btn.className = 'sp-btn sp-buy-safe';
      btn.id        = `sp-page-prestige-${skillId}`;
      btn.style.cssText = `background:${skill.btnBg};border:1px solid ${skill.border};color:${skill.color}`;
      btn.innerHTML = `&#9733; Prestige (+${pppLabel})`;
      hdr.appendChild(btn);
    } else if (!canPrestige && existingBtn) {
      existingBtn.remove();
    }
  }
}

function renderPage(skillId, page) {
  const skill     = _d.skillsM.SKILLS.find(s => s.id === skillId);
  const state     = _d.stateM.getState(skillId);
  const gameSkill = skill.gameSkill();
  const vLevel    = _d.stateM.getVirtualLevel(gameSkill);
  const needed    = _d.stateM.nextPrestigeLevel(skillId);
  const avail     = _d.stateM.availablePoints(skillId);
  const canPrestige   = vLevel >= needed;
  const hasPrestiged  = state.prestigeCount > 0;
  const ppp = _d.stateM.nextPrestigePoints(skillId);
  const basePPP    = Math.min(5, Math.max(1, _d.stateM.getSettings(skillId).pointsPerPrestige ?? 1));
  const pppMult    = 1 + (state.prestigeCount * 0.05);
  const pppMultPct = Math.round(pppMult * 100);
  const pppLabel = ppp + ' pt' + (ppp !== 1 ? 's' : '');
  const upgrades      = _d.upgradesM.getUpgrades(skillId);
  const currentXP     = gameSkill?.xp ?? 0;
  const xpNeeded      = _d.stateM.xpForLevel(needed);
  const xpPct         = Math.min(Math.floor((currentXP / Math.max(xpNeeded, 1)) * 100), 100);
  const c             = skill.color;

  const xpBar = !canPrestige
    ? `<div class="sp-xp-wrap" style="background:${skill.dark};border:1px solid ${skill.border}40"><div class="sp-xp-label"><span>Progress to prestige (level ${needed})</span><span>${xpPct}%</span></div><div class="sp-xp-track"><div class="sp-xp-fill" style="width:${xpPct}%;background:linear-gradient(90deg,${c}66,${c})"></div></div><div class="sp-xp-sub" style="color:${skill.color}88">Level <strong>${vLevel}</strong> / <strong>${needed}</strong></div></div>`
    : `<div class="sp-xp-wrap" style="border:1px solid ${skill.border};background:${skill.bg1}"><div class="sp-xp-label" style="color:${skill.color}"><span>&#9733; Ready to prestige at level ${vLevel}!</span><span>100%</span></div><div class="sp-xp-track"><div class="sp-xp-fill" style="width:100%;background:${c}"></div></div></div>`;

  const lockedNotice = !hasPrestiged
    ? `<div class="sp-locked" style="background:${skill.bg1};border:1px solid ${skill.border}60"><span>&#128274;</span><div><strong>Upgrades locked</strong> &mdash; prestige at virtual level ${needed} to start.</div></div>` : '';

  const activeBonuses = upgrades.filter(u => !u.worker && (state.upgrades[u.id] ?? 0) > 0);
  const modSection = activeBonuses.length > 0 ? `
    <div class="sp-section-title" style="color:${skill.color};border-bottom:1px solid ${skill.border}40">Active Bonuses</div>
    <div class="sp-modifier-list" style="background:${skill.dark};border:1px solid ${skill.border}40">${activeBonuses.map(u => `
      <div class="sp-modifier-row">
        <span class="sp-modifier-icon">${u.icon}</span>
        <span class="sp-modifier-name" style="color:${skill.color}">${u.name}</span>
        <span class="sp-modifier-value" style="color:${skill.color}">+${_d.upgradesM.formatBonus(u.id, state.upgrades[u.id], skillId)}</span>
        <span class="sp-modifier-rank">rank ${state.upgrades[u.id]}</span>
      </div>`).join('')}
    </div>` : '';

  // Snapshot open dropdown state before innerHTML wipe
  const _openDDs = new Set();
  page.querySelectorAll('.sp-dd[data-open]').forEach(dd => _openDDs.add(dd.dataset.index));

  page.innerHTML = `
    <div class="sp-page-inner" style="--skill-bg1:${skill.bg1};--skill-dark:${skill.dark}">
      <div class="sp-page-header">
        <div class="sp-btn" style="background:#1a1a1a;border:1px solid #444;color:#aaa;cursor:pointer" id="sp-back-${skillId}">&#8592; Back</div>
        <div class="sp-page-title" style="color:${c}">${skill.icon} ${skill.name} Prestige</div>
        ${canPrestige ? `<div class="sp-btn sp-buy-safe" style="background:${skill.btnBg};border:1px solid ${skill.border};color:${skill.color}" id="sp-page-prestige-${skillId}">&#9733; Prestige (+${pppLabel})</div>` : ''}
      </div>
      ${xpBar}${lockedNotice}
      <div class="sp-stats-row" style="--c:${c}">
        <div class="sp-stat-card" style="background:${skill.dark} !important;border:1px solid ${skill.border}40"><div class="sp-stat-label">Virtual Level</div><div class="sp-stat-value ${canPrestige ? 'sp-ready-val' : ''}" style="${canPrestige ? `color:${c}` : ''}">${vLevel}</div></div>
        <div class="sp-stat-card" style="background:${skill.dark} !important;border:1px solid ${skill.border}40"><div class="sp-stat-label">Prestige Count</div><div class="sp-stat-value" style="color:${c}">${state.prestigeCount}</div></div>
        <div class="sp-stat-card" style="border:2px solid ${skill.border} !important;background:${skill.dark} !important"><div class="sp-stat-label">Points Available</div><div class="sp-stat-value" style="color:${c}">${avail}</div></div>
        <div class="sp-stat-card" style="background:${skill.dark} !important;border:1px solid ${skill.border}40"><div class="sp-stat-label">Next Prestige</div><div class="sp-stat-value sp-muted">Level ${needed}</div></div>
        <div class="sp-stat-card" style="background:${skill.dark} !important;border:1px solid ${skill.border}40"><div class="sp-stat-label">Point Bonus</div><div class="sp-stat-value" style="color:${c}">${pppMultPct}% <span style="font-size:0.7em;color:${c}88">(${basePPP}&rarr;${ppp})</span></div></div>
      </div>
      ${modSection}
      <div class="sp-section-title" style="color:${skill.color};border-bottom:1px solid ${skill.border}40">Prestige Upgrades</div>
      <div class="sp-grid">${upgrades.map(u => buildCard(u, skillId, state, avail, hasPrestiged, skill)).join('')}</div>
    </div>`;

  // Mount star alignment timer widget if this skill has the upgrade
  if (skillId === 'astrology') mountStarTimer(skillId);

  // Sync custom dropdown labels/selection state after render, restore open state
  page.querySelectorAll('.sp-dd').forEach(dd => {
    const idx = parseInt(dd.dataset.index, 10);
    const workers = _d.stateM.getWorkers(skillId);
    const w = workers[idx];
    const val = w ? (w.constellationId ?? w.treeId ?? w.recipeId ?? '') : '';
    syncDropdown(dd, val);
    if (_openDDs.has(dd.dataset.index)) dd.setAttribute('data-open', '');
  });
  // Listeners are attached via delegation in showPage — nothing to add here
}

function buildCard(upgrade, skillId, state, avail, hasPrestiged, skill) {
  if (upgrade.worker) return buildWorkerCard(upgrade, skillId, state, avail, hasPrestiged, skill);
  const rank      = state.upgrades[upgrade.id] ?? 0;
  const isMaxed   = !!(upgrade.maxRank && rank >= upgrade.maxRank);
  const nextCost  = isMaxed ? 0 : _d.upgradesM.getCost(rank, upgrade.id);
  const canAfford = avail >= nextCost;
  const isDisabled = !!(state.disabled?.[upgrade.id]);
  const canBuy = hasPrestiged && canAfford && !isMaxed;

  const toggleBtn = upgrade.toggleable && rank > 0
    ? `<div class="sp-toggle-btn ${isDisabled ? 'sp-toggle-off' : 'sp-toggle-on'}" data-upgrade-id="${upgrade.id}" style="${isDisabled ? 'border:1px solid #9e4a4a;color:#cf7e7e;cursor:pointer' : `background:${skill.btnBg};border:1px solid ${skill.border};color:${skill.color};cursor:pointer`}">${isDisabled ? '&#9646; Off' : '&#9654; On'}</div>` : '';

  const actionHTML = isMaxed
    ? `<div class="sp-buy-btn sp-buy-disabled" style="color:#f0c040;border:1px solid #f0c040">MAX</div>`
    : !hasPrestiged
    ? `<div class="sp-buy-btn sp-buy-disabled">Locked</div>`
    : `<div class="sp-buy-btn${canBuy ? '' : ' sp-buy-disabled'}" data-upgrade-id="${upgrade.id}" style="${canBuy ? `background:${skill.btnBg};border:1px solid ${skill.border};color:${skill.color};cursor:pointer` : ''}">Buy <span class="sp-cost" style="color:#f0c040">${nextCost} pt${nextCost !== 1 ? 's' : ''}</span></div>`;

  return `<div class="sp-card sp-card" style="border-color:${hasPrestiged ? skill.border : '#333'};background:linear-gradient(135deg,${skill.bg1},${skill.dark}) !important;opacity:${canAfford && hasPrestiged ? '1' : '0.65'}">
    <div class="sp-card-top">
      <div class="sp-card-icon-name"><span class="sp-card-icon">${upgrade.icon}</span><span class="sp-card-name" style="color:${skill.color}">${upgrade.name}</span></div>
      <div class="sp-card-top-right">${toggleBtn}${rank > 0 ? `<span class="sp-rank-badge" style="border-color:${skill.border};color:${skill.color};background:${skill.dark}">Rank ${rank}</span>` : ''}</div>
    </div>
    <div class="sp-card-desc">${upgrade.description}</div>
    ${rank > 0 ? `<div class="sp-card-current" style="color:${skill.color}">Bonus: <strong>${_d.upgradesM.formatBonus(upgrade.id, rank, skillId)}</strong>${isDisabled ? ' <span style="color:#9e4a4a">(disabled)</span>' : ''}</div>` : ''}
    ${upgrade.id === 'starAlignment' && rank > 0 ? `<div id="sp-star-timer-${skillId}" class="sp-star-timer-wrap"></div>` : ''}
    <div class="sp-card-footer" style="border-top:1px solid ${skill.border}30">
      <div class="sp-next-cost">Next: <strong style="color:#f0c040">${nextCost} pt${nextCost !== 1 ? 's' : ''}</strong></div>
      ${actionHTML}
    </div></div>`;
}

function buildWorkerCard(upgrade, skillId, state, avail, hasPrestiged, skill) {
  const count    = _d.workersM.getWorkerCount(skillId);
  const nextCost = _d.upgradesM.getWorkerCost(count);
  const canHire  = hasPrestiged && avail >= nextCost;
  const workers  = _d.stateM.getWorkers(skillId);

  const panels = workers.map((w, index) => {
    const running = _d.workersM.isWorkerRunning(skillId, index);
    const enabled = w.enabled !== false;
    const selectOpts = buildWorkerSelectOpts(skillId, w);
    return `<div class="sp-worker-slot" style="background:${skill.bg1};border:1px solid ${skill.border}40">
      <div class="sp-worker-slot-hdr">
        <span class="sp-worker-title" style="color:${skill.color}">${upgrade.workerName ?? skill.workerName} #${index + 1}</span>
        <div style="display:flex;gap:6px;align-items:center">
          <span class="sp-worker-status ${running ? 'sp-ws-active' : 'sp-ws-idle'}" style="${running ? `color:${skill.color};border-color:${skill.border}` : ''}">${running ? '&#9654; Active' : '&#9646; Idle'}</span>
          <div class="sp-worker-toggle sp-buy-safe ${enabled ? 'sp-toggle-on' : 'sp-toggle-off'}" data-index="${index}" style="${enabled ? `background:${skill.btnBg};border:1px solid ${skill.border};color:${skill.color};cursor:pointer` : 'border:1px solid #9e4a4a;color:#cf7e7e;cursor:pointer'}">${enabled ? 'On' : 'Off'}</div>
        </div>
      </div>
      ${selectOpts ? `<div class="sp-worker-row"><label class="sp-worker-label">Assign:</label><div class="sp-dd" data-index="${index}"><div class="sp-dd-trigger"><span class="sp-dd-label">-- Select --</span><span class="sp-dd-arrow">&#9660;</span></div><div class="sp-dd-list"><div class="sp-dd-item" data-value="">-- Select --</div>${selectOpts}</div></div></div>` : ''}
    </div>`;
  }).join('');

  return `<div class="sp-card ${canHire ? 'sp-card-available' : ''}" style="border-color:${hasPrestiged ? skill.border : '#333'};background:linear-gradient(135deg,${skill.bg1},${skill.dark}) !important;opacity:${canHire ? '1' : '0.65'}">
    <div class="sp-card-top">
      <div class="sp-card-icon-name"><span class="sp-card-icon">${upgrade.icon}</span><span class="sp-card-name" style="color:${skill.color}">${upgrade.name}</span></div>
      ${count > 0 ? `<span class="sp-rank-badge" style="border-color:${skill.border};color:${skill.color};background:${skill.dark}">${count} hired</span>` : ''}
    </div>
    <div class="sp-card-desc">${upgrade.description}</div>
    ${panels}
    ${count > 0 ? buildWorkerInfo(skillId, skill) : ''}
    <div class="sp-card-footer" style="border-top:1px solid ${skill.border}30">
      <div class="sp-next-cost">${count > 0 ? 'Next hire:' : 'Cost:'} <strong style="color:#f0c040">${nextCost} pts</strong></div>
      ${!hasPrestiged ? `<div class="sp-buy-btn sp-buy-disabled">Locked</div>`
        : `<div class="sp-buy-btn${canHire ? '' : ' sp-buy-disabled'}" data-upgrade-id="${upgrade.id}" style="${canHire ? `background:${skill.btnBg};border:1px solid ${skill.border};color:${skill.color};cursor:pointer` : ''}">Hire <span class="sp-cost" style="color:#f0c040">${nextCost} pts</span></div>`}
    </div></div>`;
}

// Cache select option HTML per skill+level -- options only change on level-up, not on every render
const _selectOptsCache = {};

// Update a custom dropdown's trigger label and selected item highlight
function syncDropdown(dd, val) {
  const items = dd.querySelectorAll('.sp-dd-item');
  let label = '-- Select --';
  items.forEach(item => {
    const match = item.dataset.value === val || (item.dataset.value === '' && !val);
    item.toggleAttribute('data-selected', match);
    if (match && item.dataset.value) label = item.textContent;
  });
  const labelEl = dd.querySelector('.sp-dd-label');
  if (labelEl) labelEl.textContent = label;
}
// Clear cached options for a skill when its level changes (new recipes unlock)
function invalidateSelectCache(skillId) {
  Object.keys(_selectOptsCache).forEach(k => { if (k.startsWith(skillId + ':')) delete _selectOptsCache[k]; });
}
function buildWorkerSelectOpts(skillId, w) {
  const skill = _d.skillsM.SKILLS.find(s => s.id === skillId);
  const gs    = skill.gameSkill();
  if (skillId === 'agility') return null; // no select needed

  // Determine the currently selected value
  const selectedVal = w.constellationId ?? w.treeId ?? w.recipeId ?? '';

  // Cache options HTML by skillId+level -- only rebuild when level changes
  const cacheKey = skillId + ':' + gs.level;
  if (!_selectOptsCache[cacheKey]) {
    let opts = '';
    if (skillId === 'astrology') {
      opts = gs.actions.allObjects
        .filter(c => gs.level >= (c.level ?? 1))
        .map(c => `<div class="sp-dd-item" data-value="${c.id}">${c._name} (Lv.${c.level})</div>`)
        .join('');
    } else if (skillId === 'woodcutting') {
      opts = gs.actions.allObjects
        .filter(r => gs.level >= (r.level ?? 1))
        .map(r => `<div class="sp-dd-item" data-value="${r.id}">${r._name ?? r._localID}</div>`)
        .join('');
    } else if (skillId === 'fishing') {
      opts = (gs.actions?.allObjects ?? [])
        .filter(r => gs.level >= (r.level ?? 1))
        .map(r => `<div class="sp-dd-item" data-value="${r.id}">${r._name ?? r._localID}</div>`)
        .join('');
    } else {
      opts = (gs.actions?.allObjects ?? [])
        .filter(r => gs.level >= (r.level ?? 1))
        .map(r => `<div class="sp-dd-item" data-value="${r.id}">${r._name ?? r._localID}</div>`)
        .join('');
    }
    _selectOptsCache[cacheKey] = opts;
  }

  // Return cached options -- selected attribute is set via select.value after render
  return _selectOptsCache[cacheKey];
}

function getWorkerSelectValue(skillId, w) {
  return w.constellationId ?? w.treeId ?? w.recipeId ?? '';
}

function buildWorkerInfo(skillId, skill) {
  if (skillId === 'agility') {
    let xp = 0, gp = 0;
    try { game.agility.forEachActiveObstacle(o => { xp += o.baseExperience ?? 0; (o.currencyRewards ?? []).forEach(r => { if (r?.currency?.id === 'melvorD:GP') gp += r.quantity ?? 0; }); }, () => {}); } catch(e) {}
    return `<div class="sp-worker-info" style="color:#888">${xp > 0 ? `~${Math.floor(xp * 0.25)} XP / ~${Math.floor(gp * 0.25)} GP per run` : 'No course built yet'}</div>`;
  }
  return `<div class="sp-worker-info" style="color:#888">1 action / ${skillId === 'thieving' ? '8' : skillId === 'firemaking' ? '7' : skillId === 'fishing' || skillId === 'cooking' ? '6' : '5'}s &nbsp;|&nbsp; 25% XP</div>`;
}

function findSidebarCategoryAndId(skillId) {
  const skill = _d.skillsM.SKILLS.find(s => s.id === skillId);
  if (!skill) return null;
  const alt = skill.skillId.startsWith('melvorF:')
    ? skill.skillId.replace('melvorF:', 'melvorD:')
    : skill.skillId.replace('melvorD:', 'melvorF:');
  for (const cat of ['Non-Combat', 'Passive']) {
    let existingIds;
    try { existingIds = new Set(sidebar.category(cat).items().map(i => i.id)); }
    catch(e) { continue; }
    if (existingIds.has(skill.skillId)) return { category: cat, sidebarId: skill.skillId };
    if (existingIds.has(alt))           return { category: cat, sidebarId: alt };
  }
  return null;
}

function updateSidebarLabel(skillId) {
  try {
    const skill = _d.skillsM.SKILLS.find(s => s.id === skillId);
    const state = _d.stateM.getState(skillId);
    const count = state.prestigeCount ?? 0;

    const applyLabel = () => {
      try {
        const found = findSidebarCategoryAndId(skillId);
        if (!found) return;
        const nameEl = sidebar.category(found.category).item(found.sidebarId).nameEl;
        if (!nameEl) return;
        if (count > 0) {
          nameEl.innerHTML = skill.name + ' <sup style="color:#f0c040;font-size:0.7em;font-weight:bold;vertical-align:super;line-height:1">P' + count + '</sup>';
        } else {
          nameEl.textContent = skill.name;
        }
      } catch(e) {}
    };

    applyLabel();
    [200, 500, 1500].forEach(delay => setTimeout(applyLabel, delay));
  } catch(e) {}
}

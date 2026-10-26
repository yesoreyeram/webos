/* Shared helpers for WebOS prototypes: icons, app tiles, top bar and dock. */
(function () {
  const params = new URLSearchParams(location.search);
  if (params.get('theme') === 'dark') document.documentElement.dataset.theme = 'dark';

  const APPS = {
    files: { name: 'Files', icon: 'folder', g: ['#60a5fa', '#2563eb'] },
    editor: { name: 'Text Editor', icon: 'notebook-pen', g: ['#a78bfa', '#6d28d9'] },
    terminal: { name: 'Terminal', icon: 'square-terminal', g: ['#475569', '#0f172a'] },
    calendar: { name: 'Calendar', icon: 'calendar-days', g: ['#fb7185', '#e11d48'] },
    clock: { name: 'Clock', icon: 'clock', g: ['#5eead4', '#0f766e'] },
    media: { name: 'Media Viewer', icon: 'image', g: ['#f0abfc', '#c026d3'] },
    calculator: { name: 'Calculator', icon: 'calculator', g: ['#fdba74', '#ea580c'] },
    settings: { name: 'Settings', icon: 'settings', g: ['#cbd5e1', '#64748b'] },
    trash: { name: 'Trash', icon: 'trash-2', g: ['#e2e8f0', '#94a3b8'] },
  };

  function icon(name, cls = '', style = '') {
    const body = window.ICONS && window.ICONS[name];
    if (!body) {
      console.error(`Missing icon: ${name}`);
      return '';
    }
    return `<svg class="i ${cls}" style="${style}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  function tile(id, size = 44) {
    const app = APPS[id];
    if (!app) {
      console.error(`Unknown app: ${id}`);
      return '';
    }
    return `<span class="app-tile" style="--s:${size}px;--g1:${app.g[0]};--g2:${app.g[1]}" role="img" aria-label="${app.name}">${icon(app.icon)}</span>`;
  }

  const brandSvg =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="13" height="10" rx="2.5" fill="#fff" fill-opacity=".55"/><rect x="8" y="9" width="13" height="11" rx="2.5" fill="#fff"/><rect x="8" y="9" width="13" height="3" rx="1.5" fill="#6366f1" fill-opacity=".35"/></svg>';

  const googleG =
    '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

  function topbar(o = {}) {
    const ws = (o.workspaces || ['Main', 'Research'])
      .map((w, i) => `<span class="ws ${i === (o.activeWs || 0) ? 'active' : ''}" role="tab" aria-selected="${i === (o.activeWs || 0)}">${w}${o.wsCounts ? `<span class="count">${o.wsCounts[i]}</span>` : ''}</span>`)
      .join('');
    const notif = o.notifications ?? 3;
    return `
    <header class="topbar" role="banner">
      <div class="tb-left">
        <span class="tb-btn icon" role="button" aria-label="WebOS menu"><span class="brand">${brandSvg}</span></span>
        <div class="ws-switch"><span class="row" style="gap:2px" role="tablist" aria-label="Workspaces">${ws}</span><span class="ws add" role="button" aria-label="New workspace">${icon('plus', '', 'width:13px;height:13px')}</span></div>
      </div>
      <div class="tb-center">
        <div class="tb-search ${o.searchActive ? 'focus' : ''}">${icon('search', '', 'width:14px;height:14px')}<span>Search apps, files, and actions</span><span class="kbd">Ctrl K</span></div>
      </div>
      <div class="tb-right">
        <span class="tb-btn icon" title="Saved locally">${icon('cloud-check', '', 'color:var(--success)')}</span>
        <span class="tb-btn icon ${o.open === 'notifications' ? 'open' : ''}">${icon('bell')}${notif ? `<span class="badge-dot">${notif}</span>` : ''}</span>
        <span class="tb-btn icon ${o.open === 'quick' ? 'open' : ''}">${icon('sliders-horizontal')}</span>
        <span class="tb-sep"></span>
        <span class="tb-btn tb-clock ${o.open === 'clock' ? 'open' : ''}"><span class="date">Mon 26 Oct</span>10:42</span>
        <span class="tb-btn tb-profile ${o.open === 'profile' ? 'open' : ''}"><span class="avatar" style="--size:24px">JD</span><span>${o.profile || 'Work'}</span>${icon('chevron-down', '', 'width:14px;height:14px;color:var(--text-3)')}</span>
      </div>
    </header>`;
  }

  function dock(o = {}) {
    const pinned = o.pinned || ['files', 'editor', 'terminal', 'calendar', 'media', 'calculator', 'settings'];
    const running = new Set(o.running || []);
    const items = pinned
      .map((id) => {
        const dot = running.has(id) ? `<span class="dot ${o.active === id ? 'active' : ''}"></span>` : '';
        const tip = o.tooltip === id ? `<span class="tooltip">${APPS[id].name}<span class="kbd">Alt ${pinned.indexOf(id) + 1}</span></span>` : '';
        return `<span class="dock-item ${o.tooltip === id ? 'hover' : ''}">${tile(id, 44)}${dot}${tip}</span>`;
      })
      .join('');
    const extra = (o.extra || [])
      .map((id) => `<span class="dock-item">${tile(id, 44)}<span class="dot"></span></span>`)
      .join('');
    return `
    <nav class="dock glass" aria-label="Dock">
      <span class="dock-item ${o.launcherOpen ? 'hover' : ''}"><span class="dock-launcher">${icon('layout-grid')}</span></span>
      <span class="dock-sep"></span>
      ${items}
      ${extra ? `<span class="dock-sep"></span>${extra}` : ''}
      <span class="dock-sep"></span>
      <span class="dock-item">${tile('trash', 44)}</span>
    </nav>`;
  }

  function hydrate(root = document) {
    root.querySelectorAll('i[data-icon]').forEach((el) => {
      const span = document.createElement('span');
      span.innerHTML = icon(el.dataset.icon, el.className, el.getAttribute('style') || '');
      el.replaceWith(span.firstElementChild || span);
    });
    root.querySelectorAll('i[data-tile]').forEach((el) => {
      const span = document.createElement('span');
      span.innerHTML = tile(el.dataset.tile, Number(el.dataset.size || 44));
      el.replaceWith(span.firstElementChild);
    });
    root.querySelectorAll('[data-brand]').forEach((el) => (el.innerHTML = brandSvg));
    root.querySelectorAll('[data-google]').forEach((el) => (el.innerHTML = googleG));
  }

  function init(o = {}) {
    const screen = document.getElementById('screen');
    if (o.topbar !== false) screen.insertAdjacentHTML('afterbegin', topbar(o.topbar));
    if (o.dock !== false) screen.insertAdjacentHTML('beforeend', dock(o.dock));
    hydrate();
    Promise.all([document.fonts.ready, ...[...document.images].map((img) => img.decode().catch(() => console.error(`Broken image: ${img.src}`)))])
      .then(() => (window.__protoReady = true));
  }

  window.Shell = { APPS, icon, tile, topbar, dock, hydrate, init, brandSvg, googleG };
})();

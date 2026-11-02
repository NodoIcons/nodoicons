// Interface mockups built from real kit icons. They return markup with [data-ic] slots, so the
// whole mockup re-renders in any style (swapStyle) and is themed by --m-* variables (mockups.css).

const i = (name, cls = '') => `<i data-ic="${name}" class="${cls}"></i>`;
const statusBar = `<div class="m-status"><span>9:41</span><span class="m-status-r">${i('wifi')}${i('battery-full')}</span></div>`;
const spark = (pts, cls = '') => {
  const w = 100, h = 32, max = Math.max(...pts), min = Math.min(...pts);
  const d = pts.map((v, k) => `${((k / (pts.length - 1)) * w).toFixed(1)},${(h - ((v - min) / (max - min || 1)) * (h - 4) - 2).toFixed(1)}`).join(' ');
  return `<svg class="m-spark ${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${d}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};
const bars = (vals) => `<div class="m-bars">${vals.map((v, k) => `<span style="--h:${v}%;--k:${k}"></span>`).join('')}</div>`;

const PHONES = {
  wallet: () => `
    ${statusBar}
    <div class="m-head"><div><small>Good morning</small><b>Alex Rivera</b></div><span class="m-iconbtn">${i('bell-dot')}</span></div>
    <div class="m-card m-balance">
      <div class="m-row"><small>Total balance</small>${i('card-contactless')}</div>
      <strong>$12,480.20</strong>
      <div class="m-row"><span class="m-pill">${i('trending-up')} +4.2%</span><small>•••• 4821</small></div>
    </div>
    <div class="m-actions">
      ${[['send', 'Send'], ['download', 'Request'], ['exchange', 'Swap'], ['qr-code', 'Scan']].map(([n, l]) => `<div><span class="m-tile">${i(n)}</span><small>${l}</small></div>`).join('')}
    </div>
    <div class="m-sec"><b>Activity</b><small>See all</small></div>
    <ul class="m-list">
      ${[['coffee', 'Blue Bottle', 'Today · Food', '-$6.40'], ['shopping-bag', 'Market Hall', 'Today · Shopping', '-$48.10'], ['plane', 'Lisbon trip', 'Yesterday · Travel', '-$312.00'], ['money-transfer', 'From Sam', 'Mon · Transfer', '+$120.00']]
        .map(([n, t, s, a]) => `<li><span class="m-tile">${i(n)}</span><div><b>${t}</b><small>${s}</small></div><em class="${a[0] === '+' ? 'pos' : ''}">${a}</em></li>`).join('')}
    </ul>
    <nav class="m-tabbar">${['home', 'chart-pie', 'wallet', 'user'].map((n, k) => `<span class="${k === 0 ? 'on' : ''}">${i(n)}</span>`).join('')}</nav>`,

  settings: () => `
    ${statusBar}
    <div class="m-title">Settings</div>
    <div class="m-search">${i('search')}<span>Search</span></div>
    <div class="m-profile"><span class="m-avatar">${i('user')}</span><div><b>Alex Rivera</b><small>Account, iCloud, media</small></div>${i('chevron-right', 'm-chev')}</div>
    ${[
      [['bell', 'Notifications'], ['moon', 'Focus', 'toggle'], ['timer', 'Screen time']],
      [['wifi', 'Wi-Fi', 'Studio 5G'], ['bluetooth', 'Bluetooth', 'On'], ['lock', 'Privacy'], ['face-id', 'Face ID & passcode']],
      [['globe', 'Language', 'English'], ['help', 'Help']],
    ].map((g) => `<ul class="m-group">${g.map(([n, l, v]) => `<li><span class="m-tile">${i(n)}</span><span>${l}</span>${v === 'toggle' ? '<span class="m-toggle"></span>' : `<small>${v || ''}</small>${i('chevron-right', 'm-chev')}`}</li>`).join('')}</ul>`).join('')}`,

  fitness: () => `
    ${statusBar}
    <div class="m-head"><div><small>Thursday</small><b>Today</b></div><span class="m-iconbtn">${i('calendar')}</span></div>
    <div class="m-ring-card m-card"><div class="m-rings"><span></span><span></span><span></span></div>
      <ul><li>${i('flame')}<b>486</b><small>kcal</small></li><li>${i('stopwatch')}<b>42</b><small>min</small></li><li>${i('running')}<b>6.4</b><small>km</small></li></ul></div>
    <div class="m-grid2">
      <div class="m-card">${i('heart-pulse')}<small>Heart</small><b>72 <i>bpm</i></b>${spark([5, 7, 6, 9, 6, 8, 7, 10, 7, 8])}</div>
      <div class="m-card">${i('moon')}<small>Sleep</small><b>7h 40</b>${bars([40, 70, 55, 90, 60, 75, 85])}</div>
    </div>
    <div class="m-sec"><b>Workouts</b><small>Plan</small></div>
    <ul class="m-list">
      ${[['yoga', 'Morning flow', '25 min · Easy'], ['dumbbell', 'Upper body', '40 min · Strength'], ['bicycle', 'Evening ride', '18 km · Cardio']]
        .map(([n, t, s]) => `<li><span class="m-tile">${i(n)}</span><div><b>${t}</b><small>${s}</small></div>${i('play', 'm-chev')}</li>`).join('')}
    </ul>
    <nav class="m-tabbar">${['home', 'heart-pulse', 'trophy', 'user'].map((n, k) => `<span class="${k === 1 ? 'on' : ''}">${i(n)}</span>`).join('')}</nav>`,
};

export function phone(kind = 'wallet') {
  return `<div class="m-phone"><div class="m-screen">${PHONES[kind]()}</div></div>`;
}

const chrome = (title, browser) => browser
  ? `<div class="m-chrome"><span class="m-dots"><i></i><i></i><i></i></span><div class="m-url">${i('lock')}<span>${title}</span></div><span class="m-chrome-r">${i('share')}${i('plus')}</span></div>`
  : `<div class="m-chrome"><span class="m-dots"><i></i><i></i><i></i></span><span class="m-wtitle">${title}</span><span></span></div>`;

const DESKTOPS = {
  dashboard: () => `
    ${chrome('Northwind — Overview', false)}
    <div class="m-app">
      <aside class="m-side">
        <div class="m-brand">${i('layers')}<b>Northwind</b></div>
        ${[['layout-dashboard', 'Overview', 1], ['chart-bar', 'Analytics'], ['wallet', 'Payments'], ['users', 'Customers'], ['package', 'Products'], ['mail', 'Messages']].map(([n, l, on]) => `<a class="${on ? 'on' : ''}">${i(n)}<span>${l}</span></a>`).join('')}
        <div class="m-side-sep"></div>
        ${[['settings', 'Settings'], ['help', 'Support']].map(([n, l]) => `<a>${i(n)}<span>${l}</span></a>`).join('')}
      </aside>
      <main class="m-main">
        <div class="m-topbar"><div class="m-search">${i('search')}<span>Search anything…</span><kbd>⌘K</kbd></div><span class="m-iconbtn">${i('bell')}</span><span class="m-avatar sm">${i('user')}</span></div>
        <div class="m-kpis">
          ${[['coins', 'Revenue', '$84.2k', '+12%'], ['users', 'Customers', '3,904', '+5%'], ['cart', 'Orders', '1,286', '+8%'], ['trending-up', 'Conversion', '3.6%', '+0.4']]
            .map(([n, l, v, d]) => `<div class="m-card m-kpi"><span class="m-tile">${i(n)}</span><small>${l}</small><b>${v}</b><span class="m-pill">${i('arrow-up-right')} ${d}</span></div>`).join('')}
        </div>
        <div class="m-split">
          <div class="m-card m-chart"><div class="m-row"><b>Revenue</b><span class="m-seg"><span class="on">Week</span><span>Month</span><span>Year</span></span></div>${bars([35, 52, 44, 68, 58, 80, 64, 92, 74, 86, 70, 96])}</div>
          <div class="m-card"><div class="m-row"><b>Activity</b>${i('more-horizontal')}</div>
            <ul class="m-feed">${[['check-circle', 'Invoice #1042 paid'], ['package', 'Order shipped to Oslo'], ['user', 'New customer signed up'], ['alert-triangle', 'Card payment retried'], ['star', 'New 5★ review']].map(([n, t]) => `<li>${i(n)}<span>${t}</span></li>`).join('')}</ul>
          </div>
        </div>
      </main>
    </div>`,

  saas: () => `
    ${chrome('app.trellis.io/board/launch', true)}
    <div class="m-app">
      <aside class="m-side">
        <div class="m-brand">${i('sparkles')}<b>Trellis</b></div>
        ${[['home', 'Home'], ['inbox', 'Inbox'], ['kanban', 'Board', 1], ['calendar', 'Calendar'], ['file-text', 'Docs'], ['folder', 'Files'], ['chart-line', 'Reports']].map(([n, l, on]) => `<a class="${on ? 'on' : ''}">${i(n)}<span>${l}</span></a>`).join('')}
        <div class="m-side-sep"></div>
        ${[['users', 'Team'], ['settings', 'Settings']].map(([n, l]) => `<a>${i(n)}<span>${l}</span></a>`).join('')}
      </aside>
      <main class="m-main">
        <div class="m-topbar"><b class="m-h">Launch v2</b><span class="m-tools">${['filter', 'sliders-horizontal', 'share'].map((n) => `<span class="m-iconbtn">${i(n)}</span>`).join('')}</span><span class="m-btn">${i('plus')}New task</span></div>
        <div class="m-board">
          ${[
            ['To do', [['Write release notes', ['file-text', 'clock'], '2d'], ['Icon audit — settings', ['bug', 'chat'], '4'], ['Pricing page copy', ['edit', 'paperclip'], '1']]],
            ['In progress', [['Onboarding flow', ['smartphone', 'chat'], '7'], ['Billing migration', ['database', 'clock'], '3d']]],
            ['Done', [['Dark mode', ['moon', 'check-circle'], '✓'], ['Search revamp', ['search', 'check-circle'], '✓']]],
          ].map(([col, cards]: [string, [string, [string, string], string][]]) => `<div class="m-col"><div class="m-row"><b>${col}</b><small>${cards.length}</small></div>${cards.map(([t, [a, b], m]) => `<div class="m-card m-task"><span>${t}</span><div class="m-row"><span class="m-meta">${i(a)}${i(b)}<small>${m}</small></span><span class="m-avatar xs">${i('user')}</span></div></div>`).join('')}</div>`).join('')}
        </div>
      </main>
    </div>`,

  mail: () => `
    ${chrome('Inbox — Post', false)}
    <div class="m-app m-mail">
      <aside class="m-side">
        <span class="m-btn">${i('edit')}Compose</span>
        ${[['inbox', 'Inbox', 1, 12], ['star', 'Starred'], ['send', 'Sent'], ['file', 'Drafts', 0, 2], ['archive', 'Archive'], ['trash', 'Trash']].map(([n, l, on, c]) => `<a class="${on ? 'on' : ''}">${i(n)}<span>${l}</span>${c ? `<small>${c}</small>` : ''}</a>`).join('')}
        <div class="m-side-sep"></div>
        ${[['tag', 'Clients'], ['tag', 'Invoices']].map(([n, l]) => `<a>${i(n)}<span>${l}</span></a>`).join('')}
      </aside>
      <section class="m-msgs">
        <div class="m-search">${i('search')}<span>Search mail</span></div>
        ${[['Maya Chen', 'Final logo files', 'Attached the outlined SVGs…', 'paperclip', 1], ['Stripe', 'Payout sent', '$2,140.00 is on its way', 'bank'], ['Jonas', 'Lunch on Friday?', 'There is a new ramen place…', 'coffee'], ['Figgo Studio', 'Invoice #318', 'Due in 14 days', 'receipt'], ['Lena', 'Trip photos', '42 new images shared', 'images']]
          .map(([f, s, p, n, on]) => `<div class="m-msg ${on ? 'on' : ''}"><span class="m-avatar sm">${i(n)}</span><div><b>${f}</b><span>${s}</span><small>${p}</small></div></div>`).join('')}
      </section>
      <main class="m-read">
        <div class="m-topbar"><span class="m-tools">${['archive', 'trash', 'bookmark', 'clock'].map((n) => `<span class="m-iconbtn">${i(n)}</span>`).join('')}</span><span class="m-tools">${['share', 'more-horizontal'].map((n) => `<span class="m-iconbtn">${i(n)}</span>`).join('')}</span></div>
        <h4>Final logo files</h4>
        <div class="m-from"><span class="m-avatar sm">${i('user')}</span><div><b>Maya Chen</b><small>to me · 10:24</small></div></div>
        <p>Hi! Attached the outlined SVGs and the PDF catalog. Let me know if the icon sizes work for the app bar.</p>
        <div class="m-files">${[['file', 'logo-final.svg'], ['image', 'preview.png']].map(([n, l]) => `<span class="m-card">${i(n)}<small>${l}</small></span>`).join('')}</div>
      </main>
    </div>`,
};

export function desktop(kind = 'dashboard') {
  return `<div class="m-window">${DESKTOPS[kind]()}</div>`;
}

export function watch() {
  return `<div class="m-watch"><div class="m-watch-screen">
    <small>10:09</small>${i('heart-pulse', 'm-watch-ic')}<b>72</b><small>BPM</small>
    <div class="m-watch-row">${i('flame')}${i('running')}${i('timer')}</div>
  </div></div>`;
}

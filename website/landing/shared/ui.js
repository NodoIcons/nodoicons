// shadcn/ui-flavoured interface fragments built with Nodo icons. Markup only: style lives in ui.css,
// icons are [data-ic] slots (hydrate / swapStyle). Rows marked [data-item] can be highlighted.

const i = (n, cls = '') => `<i data-ic="${n}"${cls ? ` class="${cls}"` : ''}></i>`;
const item = (ic, label, { kbd = '', trail = '', cls = '' } = {}) =>
  `<div class="ui-item ${cls}" data-item>${i(ic)}<span>${label}</span>${kbd ? `<kbd>${kbd}</kbd>` : ''}${trail ? i(trail, 'ui-trail') : ''}</div>`;
const sep = '<div class="ui-sep"></div>';

export function dropdown() {
  return `<div class="ui-menu">
    <div class="ui-label">My Account</div>${sep}
    ${item('user', 'Profile', { kbd: '⇧⌘P' })}${item('credit-card', 'Billing', { kbd: '⌘B' })}${item('settings', 'Settings', { kbd: '⌘S' })}${item('keyboard', 'Keyboard shortcuts', { kbd: '⌘K' })}
    ${sep}${item('users', 'Team')}${item('user-plus', 'Invite users', { trail: 'chevron-right' })}${item('plus-circle', 'New Team', { kbd: '⌘T' })}
    ${sep}${item('headset', 'Support')}${item('cloud', 'API', { cls: 'disabled' })}
    ${sep}${item('log-out', 'Log out', { kbd: '⇧⌘Q' })}
  </div>`;
}

export function command() {
  return `<div class="ui-cmd">
    <div class="ui-cmd-input">${i('search')}<span>Type a command or search…</span></div>
    <div class="ui-cmd-list">
      <div class="ui-group">Suggestions</div>
      ${item('calendar', 'Calendar')}${item('smile', 'Search emoji')}${item('calculator', 'Calculator', { cls: 'disabled' })}
      ${sep}<div class="ui-group">Settings</div>
      ${item('user', 'Profile', { kbd: '⌘P' })}${item('credit-card', 'Billing', { kbd: '⌘B' })}${item('settings', 'Settings', { kbd: '⌘S' })}
    </div>
  </div>`;
}

export function notifications() {
  const notes = [['Your call has been confirmed.', '1 hour ago'], ['You have a new message!', '1 hour ago'], ['Your subscription is expiring soon!', '2 hours ago']];
  return `<div class="ui-card ui-notifs">
    <div class="ui-card-h"><b>Notifications</b><small>You have 3 unread messages.</small></div>
    <div class="ui-card-c">
      <div class="ui-switchrow" data-item>${i('bell-dot')}<div><b>Push notifications</b><small>Send notifications to device.</small></div><span class="ui-switch on"></span></div>
      ${notes.map(([t, d]) => `<div class="ui-note"><span class="dot"></span><div><b>${t}</b><small>${d}</small></div></div>`).join('')}
    </div>
    <div class="ui-card-f"><span class="ui-btn ui-btn-primary w" data-item>${i('check')}Mark all as read</span></div>
  </div>`;
}

export function toolbar() {
  return `<div class="ui-tools">
    <div class="ui-tg">${['bold', 'italic', 'underline', 'strikethrough'].map((n, k) => `<span class="${k === 0 ? 'on' : ''}" data-item>${i(n)}</span>`).join('')}<b></b>${['align-left', 'align-center', 'align-right', 'list-bullet'].map((n, k) => `<span class="${k === 0 ? 'on' : ''}" data-item>${i(n)}</span>`).join('')}</div>
    <div class="ui-row"><span class="ui-btn ui-btn-primary" data-item>${i('upload')}Upload</span><span class="ui-btn ui-btn-outline" data-item>${i('share')}Share</span><span class="ui-btn ui-btn-ghost icon" data-item>${i('more-horizontal')}</span></div>
    <div class="ui-row"><span class="ui-btn ui-btn-secondary" data-item>${i('loader', 'spin')}Please wait</span><span class="ui-btn ui-btn-outline icon" data-item>${i('undo')}</span><span class="ui-btn ui-btn-outline icon" data-item>${i('redo')}</span></div>
    <div class="ui-row ui-pager"><span class="ui-btn ui-btn-ghost sm" data-item>${i('chevron-left')}Previous</span><span class="ui-btn ui-btn-ghost icon sm">1</span><span class="ui-btn ui-btn-outline icon sm">2</span><span class="ui-btn ui-btn-ghost icon sm">3</span><span class="ui-btn ui-btn-ghost sm" data-item>Next${i('chevron-right')}</span></div>
  </div>`;
}

export function toasts() {
  const t = [['calendar', 'Event has been created', 'Sunday, December 03 at 9:00 AM', 'Undo'], ['check-circle', 'Payment received', '$2,140.00 from Northwind', ''], ['alert-circle', 'Storage almost full', 'You have used 92% of 50 GB.', '']];
  return `<div class="ui-toasts">${t.map(([n, a, b, act], k) => `<div class="ui-toast" style="--k:${k}" data-item>${i(n)}<div><b>${a}</b><small>${b}</small></div>${act ? `<span class="ui-btn ui-btn-primary sm">${act}</span>` : ''}</div>`).join('')}</div>`;
}

/** Small liquid-glass set for a bento tile: floating toolbar, segmented control, tab bar + action button. */
export function glassBar() {
  return `<div class="ui-glass">
    <div class="ui-wall"><i></i><i></i><i></i></div>
    <div class="g-toolbar lgl">${['edit-square', 'copy', 'share', 'trash'].map((n) => `<span data-item>${i(n)}</span>`).join('')}</div>
    <div class="g-seg lgl">${[['view-grid', 'Grid'], ['view-list', 'List'], ['images', 'Media']].map(([n, l], k) => `<span class="${k === 0 ? 'on' : ''}" data-item>${i(n)}<small>${l}</small></span>`).join('')}</div>
    <div class="g-bar"><div class="g-tabs lgl">${['home', 'search', 'bookmark', 'user'].map((n, k) => `<span class="${k === 0 ? 'on' : ''}" data-item>${i(n)}</span>`).join('')}</div><span class="g-fab lgl" data-item>${i('plus')}</span></div>
  </div>`;
}

export function sidebarApp() {
  const nav = (n, l, extra = '') => `<div class="ui-item" data-item>${i(n)}<span>${l}</span>${extra}</div>`;
  return `<div class="ui-app">
    <aside class="ui-sb">
      <div class="ui-team"><span class="ui-logo">${i('command')}</span><div><b>Acme Inc</b><small>Enterprise</small></div>${i('chevron-up-down', 'ui-trail')}</div>
      <div class="ui-group">Platform</div>
      ${nav('terminal', 'Playground', i('chevron-down', 'ui-trail'))}
      <div class="ui-sub"><span>History</span><span class="on">Starred</span><span>Settings</span></div>
      ${nav('robot', 'Models', i('chevron-right', 'ui-trail'))}${nav('book-open', 'Documentation', i('chevron-right', 'ui-trail'))}${nav('settings', 'Settings', i('chevron-right', 'ui-trail'))}
      <div class="ui-group">Projects</div>
      ${nav('pen-tool', 'Design Engineering')}${nav('chart-pie', 'Sales & Marketing')}${nav('map', 'Travel')}${nav('more-horizontal', 'More')}
      <div class="ui-sb-foot"><span class="ui-av">${i('user')}</span><div><b>shadcn</b><small>m@example.com</small></div>${i('chevron-up-down', 'ui-trail')}</div>
    </aside>
    <main class="ui-main">
      <header class="ui-hd">${i('sidebar-left')}<span class="ui-vsep"></span><span class="ui-crumb">Building Your Application ${i('chevron-right')} <b>Data Fetching</b></span></header>
      <div class="ui-tiles"><span></span><span></span><span></span><span></span></div>
    </main>
  </div>`;
}

/* ── Large compositions for the showcase ───────────────── */

export function dashboard() {
  const kpi = [['coins', 'Total Revenue', '$45,231.89', '+20.1% from last month'], ['users', 'Subscriptions', '+2,350', '+180.1% from last month'], ['credit-card', 'Sales', '+12,234', '+19% from last month'], ['chart-line', 'Active Now', '+573', '+201 since last hour']];
  const sales = [['Olivia Martin', 'olivia.martin@email.com', '+$1,999.00'], ['Jackson Lee', 'jackson.lee@email.com', '+$39.00'], ['Isabella Nguyen', 'isabella.nguyen@email.com', '+$299.00'], ['William Kim', 'will@email.com', '+$99.00'], ['Sofia Davis', 'sofia.davis@email.com', '+$39.00']];
  const bars = [62, 38, 80, 45, 92, 54, 70, 33, 86, 58, 76, 49];
  return `<div class="ui-app ui-dash">
    <aside class="ui-sb">
      <div class="ui-team"><span class="ui-logo">${i('command')}</span><div><b>Acme Inc</b><small>Enterprise</small></div>${i('chevron-up-down', 'ui-trail')}</div>
      <div class="ui-group">Platform</div>
      ${[['layout-dashboard', 'Dashboard', 1], ['inbox', 'Inbox'], ['chart-bar', 'Analytics'], ['folder', 'Projects'], ['users', 'Team'], ['calendar', 'Calendar']].map(([n, l, on]) => `<div class="ui-item ${on ? 'active' : ''}" data-item>${i(n)}<span>${l}</span></div>`).join('')}
      <div class="ui-group">Settings</div>
      ${[['settings', 'General'], ['credit-card', 'Billing'], ['shield-check', 'Security']].map(([n, l]) => `<div class="ui-item" data-item>${i(n)}<span>${l}</span></div>`).join('')}
      <div class="ui-sb-foot"><span class="ui-av">${i('user')}</span><div><b>shadcn</b><small>m@example.com</small></div>${i('chevron-up-down', 'ui-trail')}</div>
    </aside>
    <main class="ui-main">
      <header class="ui-hd">${i('sidebar-left')}<span class="ui-vsep"></span><span class="ui-crumb">Dashboard</span><span class="ui-input sm">${i('search')}<span>Search…</span></span><span class="ui-btn ui-btn-ghost icon" data-item>${i('bell-dot')}</span><span class="ui-btn ui-btn-ghost icon" data-item>${i('moon')}</span></header>
      <div class="ui-body">
        <div class="ui-titlebar"><h3>Dashboard</h3><span class="ui-btn ui-btn-outline" data-item>${i('calendar')}Jan 20 – Feb 09</span><span class="ui-btn ui-btn-primary" data-item>${i('download')}Download</span></div>
        <div class="ui-tabs"><span class="on">Overview</span><span>Analytics</span><span>Reports</span><span>Notifications</span></div>
        <div class="ui-kpis">${kpi.map(([n, t, v, d]) => `<div class="ui-card ui-kpi" data-item><div class="ui-row-b"><small>${t}</small>${i(n)}</div><b>${v}</b><small>${d}</small></div>`).join('')}</div>
        <div class="ui-split">
          <div class="ui-card ui-chart"><b>Overview</b><div class="ui-bars">${bars.map((h) => `<span style="--h:${h}%"></span>`).join('')}</div></div>
          <div class="ui-card ui-sales"><b>Recent Sales</b><small>You made 265 sales this month.</small>${sales.map(([n, e, a]) => `<div class="ui-sale"><span class="ui-av round">${n.split(' ').map((w) => w[0]).join('')}</span><div><b>${n}</b><small>${e}</small></div><em>${a}</em></div>`).join('')}</div>
        </div>
      </div>
    </main>
  </div>`;
}

export function settingsForm() {
  return `<div class="ui-app ui-settings">
    <div class="ui-body">
      <div class="ui-titlebar col"><h3>Settings</h3><small>Manage your account settings and set e-mail preferences.</small></div>
      <div class="ui-sep wide"></div>
      <div class="ui-set">
        <nav>${[['user', 'Profile', 1], ['settings', 'Account'], ['palette', 'Appearance'], ['bell', 'Notifications'], ['monitor', 'Display'], ['lock', 'Security']].map(([n, l, on]) => `<div class="ui-item ${on ? 'active' : ''}" data-item>${i(n)}<span>${l}</span></div>`).join('')}</nav>
        <section>
          <div class="ui-titlebar col"><b>Profile</b><small>This is how others will see you on the site.</small></div>
          <div class="ui-sep"></div>
          <label>Username<span class="ui-input">shadcn</span><small>This is your public display name.</small></label>
          <label>Email<span class="ui-input ui-select" data-item><span>m@example.com</span>${i('chevron-down')}</span></label>
          <label>Bio<span class="ui-input area">I own a computer.</span></label>
          <label>URLs<span class="ui-input" data-item>${i('link')}<span>https://shadcn.com</span></span><span class="ui-input" data-item>${i('at-sign')}<span>@shadcn</span></span></label>
          <div class="ui-row"><span class="ui-btn ui-btn-outline sm" data-item>${i('plus')}Add URL</span><span class="ui-btn ui-btn-primary" data-item>${i('check')}Update profile</span></div>
        </section>
      </div>
    </div>
  </div>`;
}

/** Liquid glass applied to generic UI: nav bar, sidebar, menu, segmented control, sliders, toast, tab bar. */
export function glassScene() {
  const row = (n, l, extra = '', on = false) => `<div class="g-item${on ? ' on' : ''}" data-item>${i(n)}<span>${l}</span>${extra}</div>`;
  return `<div class="g-scene">
    <div class="ui-wall big"><i></i><i></i><i></i></div>
    <header class="g-nav lgl"><span class="g-btn" data-item>${i('chevron-left')}</span><b>Library</b><span class="g-nav-r">${['search', 'share', 'more-horizontal'].map((n) => `<span class="g-btn" data-item>${i(n)}</span>`).join('')}</span></header>
    <aside class="g-side lgl">
      ${row('home', 'Home', '', true)}${row('images', 'Photos', '<small>2,140</small>')}${row('bookmark', 'Saved')}${row('folder', 'Projects')}${row('heart', 'Favourites')}
      <div class="g-sep"></div>${row('settings', 'Settings')}
    </aside>
    <div class="g-menu lgl">
      ${row('edit-square', 'Edit')}${row('copy', 'Duplicate')}${row('share', 'Share')}${row('pushpin', 'Pin to top')}<div class="g-sep"></div>${row('trash', 'Delete', '', false).replace('g-item', 'g-item danger')}
    </div>
    <div class="g-col">
      <div class="g-seg lgl">${[['view-grid', 'Grid'], ['view-list', 'List'], ['calendar', 'Timeline']].map(([n, l], k) => `<span class="${k === 0 ? 'on' : ''}" data-item>${i(n)}<small>${l}</small></span>`).join('')}</div>
      <div class="g-sliders lgl">
        <div class="g-slider" data-item>${i('volume-low')}<span class="g-track"><b style="width:62%"></b></span>${i('volume-high')}</div>
        <div class="g-slider" data-item>${i('moon')}<span class="g-track"><b style="width:40%"></b></span>${i('sun')}</div>
      </div>
      <div class="g-toast lgl" data-item>${i('bell-ring')}<div><b>Standup in 10 minutes</b><small>Design team · Room 4</small></div></div>
      <div class="g-search lgl">${i('search')}<span>Search</span>${i('microphone')}</div>
    </div>
    <div class="g-bar wide"><div class="g-tabs lgl">${['home', 'search', 'images', 'bookmark', 'user'].map((n, k) => `<span class="${k === 0 ? 'on' : ''}" data-item>${i(n)}</span>`).join('')}</div><span class="g-fab lgl" data-item>${i('plus')}</span></div>
  </div>`;
}

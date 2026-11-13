/**
 * <builda-board> — Zero-dependency Drop-in Blueprint Workflow & User Role Builder
 *
 * Combines:
 *  - Customizable dot-matrix paper canvas (pan, zoom, snap-to-dots)
 *  - Floating UI-style elevated cards with edge ports & smooth cubic-bezier SVG wires
 *  - Snap!-inspired categorized palette with compact magnetic sockets & inline parameters
 *  - Accessible keyboard & single-pointer alternatives for every drag interaction
 *
 * Public API:
 *  - el.getBlueprint()
 *  - el.setBlueprint(blueprintJson)
 *  - el.setPalette(paletteConfig)
 *  - el.setDotSettings({ dotSpacing, dotSize, dotOpacity, color, dotColor, canvasBg, snapToDots })
 *  - el.simulateFlow() / el.stopSimulation()
 *  - el.fitView() / el.resetView()
 *  - Events: 'blueprint-change' (detail: blueprint JSON)
 */

const DEFAULT_PALETTE = {
  cards: [
    {
      type: 'role',
      label: 'User Role',
      shortLabel: 'User Role',
      description: 'Permissions & access rules',
      icon: 'shield',
    },
    {
      type: 'workflow',
      label: 'Workflow Stage',
      shortLabel: 'Workflow',
      description: 'Trigger, checks & branches',
      icon: 'git-branch',
    },
    {
      type: 'action-group',
      label: 'Outcome Card',
      shortLabel: 'Outcome',
      description: 'Notifications & updates',
      icon: 'zap',
    },
  ],
  permissions: [
    {
      id: 'perm-view-dashboard',
      type: 'permissions',
      label: 'View Dashboard',
      paramLabel: 'Scope',
      defaultParam: 'All Teams',
      icon: 'eye',
    },
    {
      id: 'perm-create-edit',
      type: 'permissions',
      label: 'Create & Edit Items',
      paramLabel: 'Target',
      defaultParam: 'Own Drafts',
      icon: 'edit',
    },
    {
      id: 'perm-approve',
      type: 'permissions',
      label: 'Approve Requests',
      paramLabel: 'Limit',
      defaultParam: 'Up to $5,000',
      icon: 'check-circle',
    },
    {
      id: 'perm-manage-roles',
      type: 'permissions',
      label: 'Manage Team Roles',
      paramLabel: 'Level',
      defaultParam: 'Department',
      icon: 'users',
    },
    {
      id: 'perm-export',
      type: 'permissions',
      label: 'Export Reports',
      paramLabel: 'Format',
      defaultParam: 'CSV & PDF',
      icon: 'download',
    },
    {
      id: 'perm-delete',
      type: 'permissions',
      label: 'Delete Records',
      paramLabel: 'Safeguard',
      defaultParam: 'Confirm First',
      icon: 'trash',
    },
  ],
  triggers: [
    {
      id: 'trig-form-submit',
      type: 'triggers',
      label: 'Form Submitted',
      paramLabel: 'Form',
      defaultParam: 'Purchase Request',
      icon: 'inbox',
    },
    {
      id: 'trig-status-change',
      type: 'triggers',
      label: 'Record Status Changed',
      paramLabel: 'To',
      defaultParam: 'Pending Review',
      icon: 'refresh',
    },
    {
      id: 'trig-new-user',
      type: 'triggers',
      label: 'New User Signed Up',
      paramLabel: 'Source',
      defaultParam: 'Team Portal',
      icon: 'user-plus',
    },
    {
      id: 'trig-timer',
      type: 'triggers',
      label: 'Scheduled Timer',
      paramLabel: 'Every',
      defaultParam: 'Weekday 9 AM',
      icon: 'clock',
    },
    {
      id: 'trig-approval-req',
      type: 'triggers',
      label: 'Approval Requested',
      paramLabel: 'Queue',
      defaultParam: 'Content Review',
      icon: 'bell',
    },
  ],
  conditions: [
    {
      id: 'cond-amount',
      type: 'conditions',
      label: 'Amount Under Threshold',
      paramLabel: 'Max',
      defaultParam: '$1,000',
      icon: 'sliders',
    },
    {
      id: 'cond-hours',
      type: 'conditions',
      label: 'During Business Hours',
      paramLabel: 'Window',
      defaultParam: '9 AM – 5 PM',
      icon: 'sun',
    },
    {
      id: 'cond-2fa',
      type: 'conditions',
      label: '2FA Verified',
      paramLabel: 'Required',
      defaultParam: 'Yes',
      icon: 'lock',
    },
    {
      id: 'cond-department',
      type: 'conditions',
      label: 'Same Department',
      paramLabel: 'Match',
      defaultParam: 'Requester Dept',
      icon: 'building',
    },
    {
      id: 'cond-manager',
      type: 'conditions',
      label: 'Has Manager Role',
      paramLabel: 'Min Tier',
      defaultParam: 'Team Lead',
      icon: 'award',
    },
  ],
  actions: [
    {
      id: 'act-email',
      type: 'actions',
      label: 'Send Email Alert',
      paramLabel: 'To',
      defaultParam: 'Assigned Approver',
      icon: 'mail',
    },
    {
      id: 'act-assign-role',
      type: 'actions',
      label: 'Assign User Role',
      paramLabel: 'Role',
      defaultParam: 'Contributor',
      icon: 'user-check',
    },
    {
      id: 'act-update-status',
      type: 'actions',
      label: 'Update Record Status',
      paramLabel: 'Set To',
      defaultParam: 'Approved',
      icon: 'check-square',
    },
    {
      id: 'act-chat-ping',
      type: 'actions',
      label: 'Send Slack / Teams Ping',
      paramLabel: 'Channel',
      defaultParam: '#ops-approvals',
      icon: 'message',
    },
    {
      id: 'act-audit',
      type: 'actions',
      label: 'Write Audit Log',
      paramLabel: 'Detail',
      defaultParam: 'Full Snapshot',
      icon: 'file-text',
    },
    {
      id: 'act-webhook',
      type: 'actions',
      label: 'Webhook Call',
      paramLabel: 'Route',
      defaultParam: '/api/publish',
      icon: 'globe',
    },
  ],
};

const CARD_ARCHETYPES = {
  role: {
    badge: 'User Role',
    defaultTitle: 'New User Role',
    accent: 'role',
    slots: [
      { key: 'permissions', label: 'Allowed Capabilities', accepts: 'permissions', emptyHint: 'Drop permission or click + Add' },
      { key: 'conditions', label: 'Role Constraints', accepts: 'conditions', emptyHint: 'Drop security rule or + Add' },
    ],
    ports: [
      { id: 'in', dir: 'in', label: 'Assigned From', defaultWireLabel: 'Grants' },
      { id: 'role-out', dir: 'out', label: 'Authorizes', defaultWireLabel: 'Authorizes' },
    ],
  },
  workflow: {
    badge: 'Workflow Stage',
    defaultTitle: 'New Workflow Stage',
    accent: 'workflow',
    slots: [
      { key: 'triggers', label: 'When This Happens', accepts: 'triggers', emptyHint: 'Drop trigger or click + Add' },
      { key: 'conditions', label: 'Only If', accepts: 'conditions', emptyHint: 'Drop rule or click + Add' },
      { key: 'actions', label: 'Actions to Run', accepts: 'actions', emptyHint: 'Drop action or click + Add' },
    ],
    ports: [
      { id: 'in', dir: 'in', label: 'Allowed Role / Input', defaultWireLabel: 'Then' },
      { id: 'then', dir: 'out', label: 'Then', defaultWireLabel: 'Then' },
      { id: 'else', dir: 'out', label: 'On Reject', defaultWireLabel: 'On Reject' },
    ],
  },
  'action-group': {
    badge: 'Outcome / Actions',
    defaultTitle: 'New Outcome Card',
    accent: 'action-group',
    slots: [
      { key: 'actions', label: 'Actions to Execute', accepts: 'actions', emptyHint: 'Drop action or click + Add' },
    ],
    ports: [
      { id: 'in', dir: 'in', label: 'Run When Reached', defaultWireLabel: 'Then' },
      { id: 'then', dir: 'out', label: 'Next Step', defaultWireLabel: 'Then' },
    ],
  },
};

const ICONS = {
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'git-branch': '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  pencil: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="18"/><line x1="15" y1="22" x2="15" y2="18"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/><line x1="12" y1="6" x2="12" y2="6.01"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/>',
  award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',
  'check-square': '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  grip: '<circle cx="9" cy="5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="5" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="19" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="19" r="1.2" fill="currentColor" stroke="none"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  maximize: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  chevronUp: '<polyline points="18 15 12 9 6 15"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
};

function renderIcon(name, size = 15) {
  const path = ICONS[name] || ICONS.zap;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function hexToRgba(color, opacity) {
  const op = Math.max(0, Math.min(1, Number(opacity ?? 1)));
  const str = String(color || '#a0a0a0').trim();
  const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(str);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${op})`;
  }
  return str;
}

const DEFAULT_SETTINGS = {
  dotSpacing: 20,
  dotSize: 1.5,
  dotOpacity: 0.9,
  dotColor: '#a0a0a0',
  canvasBg: '#ffffff',
  snapToDots: true,
};

const STYLES = `
:host {
  --bb-font: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --bb-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --bb-radius: 14px;
  --bb-outer-border: 1px solid var(--bb-border);
  --bb-canvas-bg: #ffffff;
  --bb-surface: #ffffff;
  --bb-surface-subtle: #f8fafc;
  --bb-surface-hover: #f1f5f9;
  --bb-border: #e2e8f0;
  --bb-border-strong: #cbd5e1;
  --bb-text: #0f172a;
  --bb-text-muted: #475569;
  --bb-text-soft: #64748b;
  --bb-shadow-card: 0 12px 32px -8px rgba(15, 23, 42, 0.11), 0 4px 10px -2px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.06);
  --bb-shadow-float: 0 18px 42px -10px rgba(15, 23, 42, 0.18), 0 6px 14px rgba(15, 23, 42, 0.07);
  --bb-role-accent: #7c3aed;
  --bb-role-soft: #f3e8ff;
  --bb-role-border: #d8b4fe;
  --bb-workflow-accent: #2563eb;
  --bb-workflow-soft: #eff6ff;
  --bb-workflow-border: #bfdbfe;
  --bb-action-accent: #059669;
  --bb-action-soft: #ecfdf5;
  --bb-action-border: #a7f3d0;
  --bb-cond-accent: #d97706;
  --bb-cond-soft: #fffbeb;
  --bb-cond-border: #fde68a;
  --bb-danger: #dc2626;
  display: block;
  inline-size: 100%;
  block-size: 100%;
  min-block-size: 540px;
  font-family: var(--bb-font);
  color: var(--bb-text);
  box-sizing: border-box;
  position: relative;
}

:host([theme="dark"]) {
  --bb-canvas-bg: #0f172a;
  --bb-surface: #1e293b;
  --bb-surface-subtle: #111827;
  --bb-surface-hover: #334155;
  --bb-border: #334155;
  --bb-border-strong: #475569;
  --bb-text: #f8fafc;
  --bb-text-muted: #cbd5e1;
  --bb-text-soft: #94a3b8;
  --bb-shadow-card: 0 16px 36px -8px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(148, 163, 184, 0.18);
  --bb-shadow-float: 0 22px 46px -10px rgba(0, 0, 0, 0.72);
  --bb-role-soft: rgba(124, 58, 237, 0.18);
  --bb-role-border: rgba(167, 139, 250, 0.42);
  --bb-workflow-soft: rgba(37, 99, 235, 0.18);
  --bb-workflow-border: rgba(96, 165, 250, 0.42);
  --bb-action-soft: rgba(5, 150, 105, 0.18);
  --bb-action-border: rgba(52, 211, 153, 0.42);
  --bb-cond-soft: rgba(217, 119, 6, 0.18);
  --bb-cond-border: rgba(251, 191, 36, 0.42);
}

*, *::before, *::after {
  box-sizing: border-box;
}

.visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: clip;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.bb-shell {
  display: grid;
  grid-template-columns: 328px minmax(0, 1fr);
  inline-size: 100%;
  block-size: 100%;
  min-block-size: inherit;
  background: var(--bb-canvas-bg);
  border: var(--bb-outer-border);
  border-radius: var(--bb-radius);
  overflow: clip;
  position: relative;
}

.bb-shell.palette-collapsed {
  grid-template-columns: 0px minmax(0, 1fr);
}

/* ==================== LEFT PALETTE SIDEBAR ==================== */
.bb-palette {
  background: var(--bb-surface);
  border-inline-end: 1px solid var(--bb-border);
  display: flex;
  flex-direction: column;
  block-size: 100%;
  min-block-size: 0;
  overflow: clip;
  z-index: 20;
  transition: opacity 0.16s ease;
}

.bb-shell.palette-collapsed .bb-palette {
  opacity: 0;
  pointer-events: none;
  border-inline-end: none;
}

.palette-top {
  padding: 16px 16px 14px;
  border-block-end: 1px solid var(--bb-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bb-surface);
}

.palette-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.palette-step-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--bb-text-soft);
  margin: 0;
}

.palette-launcher-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.card-launcher {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: 11px;
  border: 1px solid var(--bb-border);
  background: var(--bb-surface-subtle);
  color: var(--bb-text);
  font-family: inherit;
  cursor: grab;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  transition: transform 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
}

.card-launcher:hover {
  transform: translateY(-1px);
  background: var(--bb-surface);
  border-color: var(--bb-border-strong);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.07);
}

.card-launcher:active {
  cursor: grabbing;
}

.launcher-badge {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
}

.tone-role .launcher-badge,
.tone-role .palette-item-icon,
.tone-permissions .palette-item-icon {
  background: var(--bb-role-soft);
  color: var(--bb-role-accent);
  border: 1px solid var(--bb-role-border);
}

.tone-workflow .launcher-badge,
.tone-workflow .palette-item-icon,
.tone-triggers .palette-item-icon {
  background: var(--bb-workflow-soft);
  color: var(--bb-workflow-accent);
  border: 1px solid var(--bb-workflow-border);
}

.tone-conditions .palette-item-icon {
  background: var(--bb-cond-soft);
  color: var(--bb-cond-accent);
  border: 1px solid var(--bb-cond-border);
}

.tone-action-group .launcher-badge,
.tone-action-group .palette-item-icon,
.tone-actions .palette-item-icon {
  background: var(--bb-action-soft);
  color: var(--bb-action-accent);
  border: 1px solid var(--bb-action-border);
}

.launcher-name {
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1.2;
}

.palette-blocks-header {
  padding: 12px 16px 10px;
  border-block-end: 1px solid var(--bb-border);
  background: var(--bb-surface-subtle);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.palette-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.palette-search-icon {
  position: absolute;
  inset-inline-start: 10px;
  color: var(--bb-text-soft);
  pointer-events: none;
  display: flex;
}

.palette-search {
  inline-size: 100%;
  block-size: 34px;
  padding-block: 0;
  padding-inline: 32px 10px;
  border-radius: 9px;
  border: 1px solid var(--bb-border);
  background: var(--bb-surface);
  color: var(--bb-text);
  font-size: 12.5px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.palette-search:focus {
  border-color: var(--bb-workflow-accent);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
}

.palette-tabs {
  display: flex;
  flex-wrap: wrap;
  flex-wrap: balance;
  gap: 5px;
}

.palette-tab {
  border: 1px solid transparent;
  background: transparent;
  color: var(--bb-text-muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
}

.palette-tab:hover {
  background: var(--bb-surface-hover);
  color: var(--bb-text);
}

.palette-tab[aria-selected="true"] {
  background: var(--bb-surface);
  color: var(--bb-text);
  border-color: var(--bb-border-strong);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.palette-scroll {
  flex: 1;
  min-block-size: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
  padding: 14px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.palette-group-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bb-text-soft);
  margin: 0 0 8px 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.palette-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 11px;
  border: 1px solid var(--bb-border);
  background: var(--bb-surface);
  cursor: grab;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  text-align: start;
  inline-size: 100%;
  font-family: inherit;
  color: inherit;
  transition: transform 0.12s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.palette-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.07);
  border-color: var(--bb-border-strong);
}

.palette-item:active {
  cursor: grabbing;
}

.palette-item-icon {
  inline-size: 30px;
  block-size: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.palette-item-body {
  min-inline-size: 0;
  flex: 1;
}

.palette-item-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--bb-text);
  line-height: 1.25;
}

.palette-item-sub {
  font-size: 11.5px;
  color: var(--bb-text-soft);
  line-height: 1.3;
  margin-block-start: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.palette-item-grip {
  color: var(--bb-text-soft);
  opacity: 0.45;
  flex-shrink: 0;
}

.palette-item:hover .palette-item-grip {
  opacity: 0.9;
}

/* ==================== CANVAS VIEWPORT ==================== */
.bb-viewport {
  position: relative;
  inline-size: 100%;
  block-size: 100%;
  overflow: clip;
  background-color: var(--bb-canvas-bg);
  cursor: grab;
  touch-action: none;
}

.bb-viewport.panning {
  cursor: grabbing;
}

.bb-dot-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  will-change: background-position, background-size;
}

.bb-world {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  inline-size: 0;
  block-size: 0;
  transform-origin: 0 0;
  will-change: transform;
}

.bb-wires-svg {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  inline-size: 1px;
  block-size: 1px;
  overflow: visible;
  pointer-events: none;
  z-index: 1;
}

.wire-hit {
  fill: none;
  stroke: transparent;
  stroke-width: 20px;
  pointer-events: stroke;
  cursor: pointer;
}

.wire-glow {
  fill: none;
  stroke-width: 8px;
  opacity: 0;
  transition: opacity 0.16s ease;
  pointer-events: none;
}

.wire-group:hover .wire-glow,
.wire-group.selected .wire-glow {
  opacity: 0.28;
}

.wire-path {
  fill: none;
  stroke-width: 2.5px;
  stroke-linecap: round;
  pointer-events: none;
  transition: stroke-width 0.15s ease;
}

.wire-group.selected .wire-path {
  stroke-width: 3.4px;
}

.wire-path.sim-active {
  stroke-dasharray: 9 6;
  animation: bb-dash 0.7s linear infinite;
  stroke-width: 3.8px;
}

.wire-preview {
  fill: none;
  stroke: var(--bb-workflow-accent);
  stroke-width: 2.6px;
  stroke-dasharray: 6 5;
  stroke-linecap: round;
  pointer-events: none;
}

@keyframes bb-dash {
  from { stroke-dashoffset: 30; }
  to { stroke-dashoffset: 0; }
}

.bb-wire-pills {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  inline-size: 0;
  block-size: 0;
  pointer-events: none;
  z-index: 4;
}

.wire-pill {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  background: var(--bb-surface);
  color: var(--bb-text-muted);
  border: 1px solid var(--bb-border-strong);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
}

.wire-pill:hover,
.wire-pill.selected {
  border-color: var(--bb-workflow-accent);
  color: var(--bb-text);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.18);
  transform: translate(-50%, -50%) scale(1.04);
}

.wire-pill.tone-role {
  color: var(--bb-role-accent);
  border-color: var(--bb-role-border);
}

.wire-pill.tone-else {
  color: var(--bb-cond-accent);
  border-color: var(--bb-cond-border);
}

.wire-pill-delete {
  display: inline-grid;
  place-items: center;
  inline-size: 16px;
  block-size: 16px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--bb-text-soft);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 0;
}

.wire-pill-delete:hover {
  background: rgba(220, 38, 38, 0.14);
  color: var(--bb-danger);
}

.bb-nodes-layer {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  inline-size: 0;
  block-size: 0;
  z-index: 3;
}

/* ==================== SPACIOUS FLOATING CARDS ==================== */
.bb-card {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  inline-size: 348px;
  background: var(--bb-surface);
  border-radius: 16px;
  box-shadow: var(--bb-shadow-card);
  border: 1px solid var(--bb-border);
  transition: box-shadow 0.18s ease, border-color 0.18s ease;
  display: flex;
  flex-direction: column;
}

.bb-card.selected {
  border-color: var(--bb-workflow-accent);
  box-shadow: var(--bb-shadow-float), 0 0 0 2px rgba(37, 99, 235, 0.22);
}

.bb-card.wire-drop-target {
  border-color: var(--bb-action-accent);
  box-shadow: var(--bb-shadow-float), 0 0 0 3px rgba(5, 150, 105, 0.26);
}

.bb-card.sim-active {
  border-color: var(--bb-action-accent);
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.30), var(--bb-shadow-float);
}

.bb-card.sim-visited {
  border-color: var(--bb-action-border);
}

.card-accent-bar {
  block-size: 5px;
  border-radius: 16px 16px 0 0;
  inline-size: 100%;
}

.card-type-role .card-accent-bar { background: var(--bb-role-accent); }
.card-type-workflow .card-accent-bar { background: var(--bb-workflow-accent); }
.card-type-action-group .card-accent-bar { background: var(--bb-action-accent); }

/* Card Header — Draggable anywhere on header */
.card-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-block-end: 1px solid var(--bb-border);
  background: color-mix(in srgb, var(--bb-surface) 92%, var(--bb-surface-subtle));
  cursor: grab;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}

.card-header.dragging {
  cursor: grabbing;
}

/* Left-Edge Input Port anchored on header */
.port-anchor-in {
  position: absolute;
  inset-inline-start: -14px;
  inset-block-start: 50%;
  transform: translateY(-50%);
  z-index: 6;
}

.card-drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 26px;
  block-size: 28px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--bb-text-soft);
  cursor: grab;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  flex-shrink: 0;
  padding: 0;
}

.card-drag-handle:hover,
.card-drag-handle:focus-visible {
  background: var(--bb-surface-hover);
  color: var(--bb-text);
  outline: 2px solid var(--bb-workflow-accent);
  outline-offset: 1px;
}

.card-drag-handle.dragging {
  cursor: grabbing;
  background: var(--bb-surface-hover);
}

.card-title-wrap {
  flex: 1;
  min-inline-size: 0;
}

.card-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-block-end: 4px;
}

.card-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 999px;
}

.card-type-role .card-badge {
  background: var(--bb-role-soft);
  color: var(--bb-role-accent);
}

.card-type-workflow .card-badge {
  background: var(--bb-workflow-soft);
  color: var(--bb-workflow-accent);
}

.card-type-action-group .card-badge {
  background: var(--bb-action-soft);
  color: var(--bb-action-accent);
}

.card-title-display {
  margin: 0;
  font-size: 15.5px;
  font-weight: 750;
  color: var(--bb-text);
  line-height: 1.3;
  letter-spacing: -0.01em;
  word-break: break-word;
}

.card-title-input {
  inline-size: 100%;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  color: var(--bb-text);
  background: var(--bb-surface);
  border: 1.5px solid var(--bb-workflow-accent);
  border-radius: 7px;
  padding: 3px 8px;
  outline: none;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.icon-btn {
  inline-size: 28px;
  block-size: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--bb-text-soft);
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.14s ease, color 0.14s ease;
}

.icon-btn:hover {
  background: var(--bb-surface-hover);
  color: var(--bb-text);
}

.icon-btn.danger:hover {
  background: rgba(220, 38, 38, 0.12);
  color: var(--bb-danger);
}

/* ==================== COMPACT SOCKETS & ROOMY SLOTS ==================== */
.card-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-slot {
  border-radius: 11px;
  border: 1px dashed var(--bb-border-strong);
  background: var(--bb-surface-subtle);
  padding: 10px;
  transition: border-color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease, padding 0.16s ease, transform 0.16s ease;
}

.card-slot.is-empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  min-block-size: 38px;
}

.card-slot.is-empty .slot-empty-left {
  display: flex;
  align-items: center;
  gap: 7px;
  min-inline-size: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--bb-text-soft);
}

.card-slot.is-empty .slot-empty-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-slot.is-populated {
  border-style: solid;
  border-color: var(--bb-border);
  padding: 10px 11px;
}

.card-slot.accepting {
  border-style: dashed;
  border-width: 1.5px;
  border-color: var(--bb-workflow-accent);
  background: color-mix(in srgb, var(--bb-workflow-soft) 55%, var(--bb-surface));
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.card-slot.is-empty.accepting {
  padding: 12px 10px;
}

.card-slot.accepting[data-accepts="permissions"] {
  border-color: var(--bb-role-accent);
  background: color-mix(in srgb, var(--bb-role-soft) 55%, var(--bb-surface));
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.card-slot.accepting[data-accepts="conditions"] {
  border-color: var(--bb-cond-accent);
  background: color-mix(in srgb, var(--bb-cond-soft) 55%, var(--bb-surface));
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
}

.card-slot.accepting[data-accepts="actions"] {
  border-color: var(--bb-action-accent);
  background: color-mix(in srgb, var(--bb-action-soft) 55%, var(--bb-surface));
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.12);
}

.card-slot.drop-hover {
  border-style: solid;
  transform: scale(1.015);
}

.slot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-block-end: 8px;
}

.slot-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--bb-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.slot-dot {
  inline-size: 8px;
  block-size: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.slot-dot.permissions { background: var(--bb-role-accent); }
.slot-dot.triggers { background: var(--bb-workflow-accent); }
.slot-dot.conditions { background: var(--bb-cond-accent); }
.slot-dot.actions { background: var(--bb-action-accent); }

.slot-add-btn {
  border: 1px solid var(--bb-border-strong);
  background: var(--bb-surface);
  color: var(--bb-text-muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
}

.slot-add-btn:hover {
  background: var(--bb-surface-hover);
  color: var(--bb-text);
  border-color: var(--bb-text-soft);
}

.slot-blocks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Snapped Block Pill inside Slot */
.snapped-block {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px 9px 13px;
  border-radius: 10px;
  background: var(--bb-surface);
  border: 1px solid var(--bb-border);
  box-shadow: 0 2px 5px rgba(15, 23, 42, 0.04);
  cursor: grab;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  animation: bb-snap-in 0.18s cubic-bezier(0.2, 1.3, 0.4, 1);
}

.snapped-block::before {
  content: '';
  position: absolute;
  inset-inline-start: 0;
  inset-block: 4px;
  inline-size: 4px;
  border-radius: 0 4px 4px 0;
}

.snapped-block.tone-permissions::before { background: var(--bb-role-accent); }
.snapped-block.tone-triggers::before { background: var(--bb-workflow-accent); }
.snapped-block.tone-conditions::before { background: var(--bb-cond-accent); }
.snapped-block.tone-actions::before { background: var(--bb-action-accent); }

.snapped-block.is-dragging-source {
  opacity: 0.4;
}

.snapped-block.sim-pulse {
  border-color: var(--bb-action-accent);
  box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.25);
}

@keyframes bb-snap-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.snapped-block-icon {
  inline-size: 26px;
  block-size: 26px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.snapped-block-content {
  flex: 1;
  min-inline-size: 0;
}

.snapped-block-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--bb-text);
  line-height: 1.25;
}

.snapped-block-param-row {
  margin-block-start: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.param-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-family: inherit;
  color: var(--bb-text-muted);
  background: var(--bb-surface-subtle);
  border: 1px solid var(--bb-border);
  border-radius: 6px;
  padding: 2px 8px;
  cursor: pointer;
  max-inline-size: 100%;
}

.param-chip:hover {
  border-color: var(--bb-workflow-accent);
  color: var(--bb-text);
}

.param-chip-key {
  color: var(--bb-text-soft);
}

.param-chip-val {
  font-weight: 600;
  color: var(--bb-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.param-input {
  font-family: inherit;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1.5px solid var(--bb-workflow-accent);
  background: var(--bb-surface);
  color: var(--bb-text);
  inline-size: 150px;
  outline: none;
}

.snapped-block-controls {
  display: flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.14s ease;
}

.snapped-block:hover .snapped-block-controls,
.snapped-block:focus-within .snapped-block-controls {
  opacity: 1;
  pointer-events: auto;
}

.mini-btn {
  inline-size: 22px;
  block-size: 22px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--bb-text-soft);
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  line-height: 1;
}

.mini-btn:hover:not(:disabled) {
  background: var(--bb-surface-hover);
  color: var(--bb-text);
}

.mini-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.mini-btn.remove:hover {
  background: rgba(220, 38, 38, 0.14);
  color: var(--bb-danger);
}

/* ==================== RIGHT-EDGE OUTPUT PORT RAIL ==================== */
.card-outputs {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  padding: 10px 16px 12px;
  border-block-start: 1px solid var(--bb-border);
  background: var(--bb-surface-subtle);
  border-radius: 0 0 16px 16px;
}

.output-port-row {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-inline-end: 6px;
}

.output-pill-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--bb-workflow-soft);
  color: var(--bb-workflow-accent);
  border: 1px solid var(--bb-workflow-border);
}

.output-pill-label.port-role-out {
  background: var(--bb-role-soft);
  color: var(--bb-role-accent);
  border-color: var(--bb-role-border);
}

.output-pill-label.port-else {
  background: var(--bb-cond-soft);
  color: var(--bb-cond-accent);
  border-color: var(--bb-cond-border);
}

.port-anchor-out {
  position: relative;
  margin-inline-end: -30px;
  z-index: 6;
}

/* Generous 28px hit target around crisp 14px circle */
.port-handle {
  inline-size: 28px;
  block-size: 28px;
  border: none;
  background: transparent;
  cursor: crosshair;
  padding: 0;
  display: grid;
  place-items: center;
  position: relative;
  border-radius: 999px;
}

.port-handle::before {
  content: '';
  inline-size: 14px;
  block-size: 14px;
  border-radius: 999px;
  background: var(--bb-surface);
  border: 3px solid var(--bb-border-strong);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.14);
  transition: transform 0.14s ease, border-color 0.14s ease, background 0.14s ease, box-shadow 0.14s ease;
}

.port-handle::after {
  content: '';
  position: absolute;
  inline-size: 6px;
  block-size: 6px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.14s ease;
}

.port-handle:hover::before,
.port-handle.connected::before {
  border-color: var(--bb-workflow-accent);
  transform: scale(1.18);
}

.port-handle.connected::after {
  background: var(--bb-workflow-accent);
}

.port-handle.port-role-out::before {
  border-color: var(--bb-role-accent);
}

.port-handle.port-role-out.connected::after {
  background: var(--bb-role-accent);
}

.port-handle.port-else::before {
  border-color: var(--bb-cond-accent);
}

.port-handle.port-else.connected::after {
  background: var(--bb-cond-accent);
}

.port-handle.connect-source::before {
  box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.28);
  transform: scale(1.25);
}

.port-handle.connect-target-valid::before {
  border-color: var(--bb-action-accent);
  box-shadow: 0 0 0 5px rgba(5, 150, 105, 0.26);
  animation: bb-port-pulse 1.1s ease-in-out infinite;
}

.port-handle.connect-snap::before {
  transform: scale(1.36);
  background: var(--bb-action-soft);
}

@keyframes bb-port-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.22); }
  50% { box-shadow: 0 0 0 7px rgba(5, 150, 105, 0.36); }
}

/* ==================== FLOATING BOTTOM-CENTER DOCK ==================== */
.bb-palette-reopen {
  position: absolute;
  inset-block-start: 14px;
  inset-inline-start: 14px;
  z-index: 15;
}

.bb-bottom-dock {
  position: absolute;
  inset-block-end: 16px;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  z-index: 15;
  max-inline-size: calc(100% - 24px);
}

.hud-pill {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  background: color-mix(in srgb, var(--bb-surface) 92%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--bb-border);
  border-radius: 14px;
  padding: 6px 10px;
  box-shadow: var(--bb-shadow-float);
  font-size: 12.5px;
  color: var(--bb-text);
}

.hud-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  block-size: 32px;
  padding: 0 11px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--bb-text-muted);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
}

.hud-btn:hover {
  background: var(--bb-surface-hover);
  color: var(--bb-text);
}

.hud-btn.active {
  background: var(--bb-workflow-soft);
  color: var(--bb-workflow-accent);
  border-color: var(--bb-workflow-border);
}

.hud-btn.sim-primary {
  background: var(--bb-action-soft);
  color: var(--bb-action-accent);
  border-color: var(--bb-action-border);
}

.hud-btn.sim-running {
  background: var(--bb-action-accent);
  color: #ffffff;
  border-color: var(--bb-action-accent);
}

.hud-sep {
  inline-size: 1px;
  block-size: 20px;
  background: var(--bb-border);
  margin-inline: 2px;
}

.hud-zoom-readout {
  min-inline-size: 46px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--bb-text-muted);
  font-variant-numeric: tabular-nums;
}

/* Simulation Toast */
.sim-toast {
  position: absolute;
  inset-block-start: 16px;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  max-inline-size: 480px;
  background: var(--bb-surface);
  border: 1px solid var(--bb-action-border);
  box-shadow: var(--bb-shadow-float);
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 16;
  font-size: 13px;
  font-weight: 600;
}

.sim-pulse-dot {
  inline-size: 10px;
  block-size: 10px;
  border-radius: 999px;
  background: var(--bb-action-accent);
  box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.22);
  flex-shrink: 0;
}

/* Contextual Slot "+ Add" Popover & Help Popover */
.bb-popover {
  position: fixed;
  z-index: 100;
  min-inline-size: 240px;
  max-inline-size: 290px;
  max-block-size: 320px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
  background: var(--bb-surface);
  border: 1px solid var(--bb-border-strong);
  border-radius: 12px;
  box-shadow: var(--bb-shadow-float);
  padding: 6px;
}

.popover-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bb-text-soft);
  padding: 6px 9px;
}

.popover-option {
  display: flex;
  align-items: center;
  gap: 9px;
  inline-size: 100%;
  text-align: start;
  padding: 8px 9px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--bb-text);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.popover-option:hover,
.popover-option:focus-visible {
  background: var(--bb-surface-hover);
  outline: none;
}

.help-card {
  position: absolute;
  inset-block-end: 74px;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  inline-size: 340px;
  max-inline-size: calc(100% - 24px);
  background: var(--bb-surface);
  border: 1px solid var(--bb-border-strong);
  border-radius: 14px;
  box-shadow: var(--bb-shadow-float);
  padding: 14px 16px;
  z-index: 30;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--bb-text-muted);
}

.help-card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--bb-text);
}

.help-card ul {
  margin: 0;
  padding-inline-start: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.help-card kbd {
  font-family: var(--bb-mono);
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--bb-surface-subtle);
  border: 1px solid var(--bb-border-strong);
}

/* Floating Drag Ghost */
.drag-ghost {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%) rotate(-1.5deg) scale(1.03);
  box-shadow: var(--bb-shadow-float);
  inline-size: 240px;
  opacity: 0.96;
}

@media (max-width: 820px) {
  .bb-shell {
    grid-template-columns: 264px minmax(0, 1fr);
  }
}
`;

export class BuildaBoardElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._palette = deepClone(DEFAULT_PALETTE);
    this._state = {
      metadata: {
        name: 'Untitled Blueprint',
        version: '1.0',
      },
      settings: { ...DEFAULT_SETTINGS },
      nodes: [],
      wires: [],
    };

    this._view = {
      panX: 60,
      panY: 60,
      scale: 0.95,
    };

    this._ui = {
      paletteCollapsed: false,
      paletteTab: 'all',
      paletteQuery: '',
      selectedNodeId: null,
      selectedWireId: null,
      editingNodeTitleId: null,
      editingBlockRef: null, // { nodeId, slotKey, blockUid }
      connectingPort: null,  // { nodeId, portId }
      slotMenu: null,        // { nodeId, slotKey, x, y }
      showHelp: false,
      simulating: false,
      simMessage: '',
      simActiveNodes: new Set(),
      simVisitedNodes: new Set(),
      simActiveWires: new Set(),
      simActiveBlocks: new Set(),
    };

    this._simTimer = null;
    this._announceTimer = null;
    this._dragGhostEl = null;
    this._livePreviewWireEl = null;

    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onDocPointerDown = this._handleOutsidePointerDown.bind(this);
  }

  connectedCallback() {
    if (this._state.nodes.length === 0) {
      this._loadDefaultStarter();
    }
    this._render();
    window.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('pointerdown', this._onDocPointerDown);
  }

  disconnectedCallback() {
    this.stopSimulation();
    window.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('pointerdown', this._onDocPointerDown);
  }

  // ==================== PUBLIC API ====================

  getBlueprint() {
    return {
      metadata: deepClone(this._state.metadata),
      settings: deepClone(this._state.settings),
      nodes: deepClone(this._state.nodes),
      wires: deepClone(this._state.wires),
      palette: deepClone(this._palette),
    };
  }

  setBlueprint(data) {
    if (!data || typeof data !== 'object') return;
    this.stopSimulation();

    if (data.palette && typeof data.palette === 'object') {
      this.setPalette(data.palette, { silent: true });
    }

    this._state = {
      metadata: {
        name: data.metadata?.name || 'Blueprint',
        version: data.metadata?.version || '1.0',
      },
      settings: {
        ...DEFAULT_SETTINGS,
        ...(data.settings || {}),
      },
      nodes: Array.isArray(data.nodes) ? deepClone(data.nodes) : [],
      wires: Array.isArray(data.wires) ? deepClone(data.wires) : [],
    };

    this._ui.selectedNodeId = null;
    this._ui.selectedWireId = null;
    this._ui.connectingPort = null;
    this._ui.slotMenu = null;

    this._render();
    requestAnimationFrame(() => {
      this.fitView();
      this._renderWires();
    });
    this._emitChange();
  }

  setPalette(customPalette, options = {}) {
    if (!customPalette || typeof customPalette !== 'object') return;
    const next = deepClone(DEFAULT_PALETTE);
    for (const key of ['cards', 'permissions', 'triggers', 'conditions', 'actions']) {
      if (Array.isArray(customPalette[key])) {
        next[key] = deepClone(customPalette[key]);
      }
    }
    this._palette = next;
    if (!options.silent) {
      this._render();
      this._emitChange();
    }
  }

  setDotSettings(patch = {}) {
    this._state.settings = {
      ...this._state.settings,
      ...patch,
    };
    this._applyCanvasTransform();
    this._renderHudOnly();
    this._emitChange();
  }

  zoomIn() {
    this._zoomAroundViewportCenter(1.15);
  }

  zoomOut() {
    this._zoomAroundViewportCenter(1 / 1.15);
  }

  resetView() {
    this._view = { panX: 60, panY: 60, scale: 1 };
    this._applyCanvasTransform();
    this._renderHudOnly();
  }

  fitView() {
    const viewport = this.shadowRoot.querySelector('.bb-viewport');
    if (!viewport || this._state.nodes.length === 0) {
      this.resetView();
      return;
    }

    const rect = viewport.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of this._state.nodes) {
      const cardEl = this.shadowRoot.querySelector(`.bb-card[data-node-id="${node.id}"]`);
      const w = cardEl ? cardEl.offsetWidth : 348;
      const h = cardEl ? cardEl.offsetHeight : 220;
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + w);
      maxY = Math.max(maxY, node.y + h);
    }

    const padX = 56;
    const padTop = 44;
    const padBottom = 86;
    const contentW = Math.max(220, maxX - minX);
    const contentH = Math.max(200, maxY - minY);
    const scaleX = (rect.width - padX * 2) / contentW;
    const scaleY = (rect.height - padTop - padBottom) / contentH;
    const nextScale = Math.max(0.55, Math.min(1.0, Math.min(scaleX, scaleY)));

    this._view.scale = nextScale;
    this._view.panX = (rect.width - contentW * nextScale) / 2 - minX * nextScale;
    this._view.panY = padTop + (rect.height - padTop - padBottom - contentH * nextScale) / 2 - minY * nextScale;

    this._applyCanvasTransform();
    this._renderHudOnly();
  }

  simulateFlow() {
    this.stopSimulation();
    if (this._state.nodes.length === 0) return;

    this._ui.simulating = true;
    this._ui.simActiveNodes.clear();
    this._ui.simVisitedNodes.clear();
    this._ui.simActiveWires.clear();
    this._ui.simActiveBlocks.clear();

    const hasIncoming = new Set(this._state.wires.map((w) => w.toNodeId));
    let frontier = this._state.nodes.filter((n) => !hasIncoming.has(n.id)).map((n) => n.id);
    if (frontier.length === 0) {
      frontier = [this._state.nodes[0].id];
    }

    const visited = new Set();
    const waves = [];

    let currentWave = frontier.filter((id) => !visited.has(id));
    while (currentWave.length > 0) {
      currentWave.forEach((id) => visited.add(id));
      const outgoingWires = this._state.wires.filter((w) => currentWave.includes(w.fromNodeId));
      waves.push({
        nodeIds: [...currentWave],
        wireIds: outgoingWires.map((w) => w.id),
      });
      const nextSet = new Set();
      for (const wire of outgoingWires) {
        if (!visited.has(wire.toNodeId)) {
          nextSet.add(wire.toNodeId);
        }
      }
      currentWave = [...nextSet];
    }

    let stepIdx = 0;
    const runStep = () => {
      if (!this._ui.simulating) return;
      if (stepIdx >= waves.length) {
        this._ui.simMessage = 'Simulation complete — every connected role, rule, and action verified.';
        this._ui.simActiveNodes.clear();
        this._ui.simActiveWires.clear();
        this._ui.simActiveBlocks.clear();
        this._applySimulationClasses();
        this._renderSimToast();
        this._simTimer = setTimeout(() => this.stopSimulation(), 2200);
        return;
      }

      const wave = waves[stepIdx];
      this._ui.simActiveNodes = new Set(wave.nodeIds);
      wave.nodeIds.forEach((id) => this._ui.simVisitedNodes.add(id));
      this._ui.simActiveWires = new Set(wave.wireIds);

      const blockUids = new Set();
      const names = [];
      for (const nid of wave.nodeIds) {
        const node = this._state.nodes.find((n) => n.id === nid);
        if (node) {
          names.push(node.title);
          Object.values(node.slots || {}).forEach((arr) => {
            arr.forEach((b) => blockUids.add(b.uid));
          });
        }
      }
      this._ui.simActiveBlocks = blockUids;
      this._ui.simMessage = `Step ${stepIdx + 1}/${waves.length}: ${names.join(' + ')}`;

      this._applySimulationClasses();
      this._renderSimToast();
      stepIdx += 1;
      this._simTimer = setTimeout(runStep, 1150);
    };

    this._renderHudOnly();
    runStep();
  }

  stopSimulation() {
    if (this._simTimer) {
      clearTimeout(this._simTimer);
      this._simTimer = null;
    }
    const wasRunning = this._ui.simulating;
    this._ui.simulating = false;
    this._ui.simMessage = '';
    this._ui.simActiveNodes.clear();
    this._ui.simVisitedNodes.clear();
    this._ui.simActiveWires.clear();
    this._ui.simActiveBlocks.clear();
    if (wasRunning && this.shadowRoot) {
      this._applySimulationClasses();
      this._renderHudOnly();
      this._renderSimToast();
    }
  }

  // ==================== INTERNAL HELPERS ====================

  _loadDefaultStarter() {
    this._state = {
      metadata: { name: 'Role-Based Approval Workflow', version: '1.0' },
      settings: { ...DEFAULT_SETTINGS },
      nodes: [
        {
          id: 'node-role-editor',
          type: 'role',
          title: 'Content Editor',
          x: 60,
          y: 80,
          slots: {
            permissions: [
              { uid: 'blk-1', id: 'perm-view-dashboard', type: 'permissions', label: 'View Dashboard', paramLabel: 'Scope', param: 'Marketing', icon: 'eye' },
              { uid: 'blk-2', id: 'perm-create-edit', type: 'permissions', label: 'Create & Edit Items', paramLabel: 'Target', param: 'Campaign Drafts', icon: 'edit' },
            ],
            conditions: [
              { uid: 'blk-3', id: 'cond-2fa', type: 'conditions', label: '2FA Verified', paramLabel: 'Required', param: 'Yes', icon: 'lock' },
            ],
          },
        },
        {
          id: 'node-wf-review',
          type: 'workflow',
          title: 'Approval Workflow',
          x: 470,
          y: 80,
          slots: {
            triggers: [
              { uid: 'blk-4', id: 'trig-form-submit', type: 'triggers', label: 'Form Submitted', paramLabel: 'Form', param: 'Publish Request', icon: 'inbox' },
            ],
            conditions: [
              { uid: 'blk-5', id: 'cond-hours', type: 'conditions', label: 'During Business Hours', paramLabel: 'Window', param: '9 AM – 5 PM', icon: 'sun' },
            ],
            actions: [],
          },
        },
        {
          id: 'node-out-publish',
          type: 'action-group',
          title: 'Notify & Publish',
          x: 880,
          y: 20,
          slots: {
            actions: [
              { uid: 'blk-6', id: 'act-update-status', type: 'actions', label: 'Update Record Status', paramLabel: 'Set To', param: 'Live', icon: 'check-square' },
              { uid: 'blk-7', id: 'act-chat-ping', type: 'actions', label: 'Send Slack / Teams Ping', paramLabel: 'Channel', param: '#launches', icon: 'message' },
            ],
          },
        },
        {
          id: 'node-out-escalate',
          type: 'action-group',
          title: 'Manager Escalation',
          x: 880,
          y: 280,
          slots: {
            actions: [
              { uid: 'blk-8', id: 'act-email', type: 'actions', label: 'Send Email Alert', paramLabel: 'To', param: 'Department Lead', icon: 'mail' },
              { uid: 'blk-9', id: 'act-audit', type: 'actions', label: 'Write Audit Log', paramLabel: 'Detail', param: 'Reason Required', icon: 'file-text' },
            ],
          },
        },
      ],
      wires: [
        { id: 'wire-1', fromNodeId: 'node-role-editor', fromPort: 'role-out', toNodeId: 'node-wf-review', toPort: 'in', label: 'Authorizes' },
        { id: 'wire-2', fromNodeId: 'node-wf-review', fromPort: 'then', toNodeId: 'node-out-publish', toPort: 'in', label: 'Then' },
        { id: 'wire-3', fromNodeId: 'node-wf-review', fromPort: 'else', toNodeId: 'node-out-escalate', toPort: 'in', label: 'On Reject' },
      ],
    };
  }

  _snapCoord(val) {
    if (!this._state.settings.snapToDots) return Math.round(val);
    const step = Math.max(4, Number(this._state.settings.dotSpacing) || 20);
    return Math.round(val / step) * step;
  }

  _announce(text) {
    const region = this.shadowRoot.querySelector('.bb-live-region');
    if (!region) return;
    region.textContent = '';
    clearTimeout(this._announceTimer);
    this._announceTimer = setTimeout(() => {
      region.textContent = text;
    }, 30);
  }

  _emitChange() {
    this.dispatchEvent(
      new CustomEvent('blueprint-change', {
        detail: this.getBlueprint(),
        bubbles: true,
        composed: true,
      }),
    );
  }

  _clientToWorld(clientX, clientY) {
    const viewport = this.shadowRoot.querySelector('.bb-viewport');
    const rect = viewport.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this._view.panX) / this._view.scale,
      y: (clientY - rect.top - this._view.panY) / this._view.scale,
    };
  }

  _zoomAroundPoint(factor, clientX, clientY) {
    const viewport = this.shadowRoot.querySelector('.bb-viewport');
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const oldScale = this._view.scale;
    const nextScale = Math.max(0.4, Math.min(2.0, oldScale * factor));
    if (nextScale === oldScale) return;

    const worldX = (px - this._view.panX) / oldScale;
    const worldY = (py - this._view.panY) / oldScale;

    this._view.scale = nextScale;
    this._view.panX = px - worldX * nextScale;
    this._view.panY = py - worldY * nextScale;

    this._applyCanvasTransform();
    this._renderHudOnly();
  }

  _zoomAroundViewportCenter(factor) {
    const viewport = this.shadowRoot.querySelector('.bb-viewport');
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    this._zoomAroundPoint(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  _createNode(type, x, y) {
    const arch = CARD_ARCHETYPES[type] || CARD_ARCHETYPES.workflow;
    const slots = {};
    for (const slot of arch.slots) {
      slots[slot.key] = [];
    }
    const node = {
      id: uid('node'),
      type,
      title: arch.defaultTitle,
      x: this._snapCoord(x),
      y: this._snapCoord(y),
      slots,
    };
    this._state.nodes.push(node);
    this._ui.selectedNodeId = node.id;
    this._ui.selectedWireId = null;
    this._render();
    this._announce(`Added ${node.title} card`);
    this._emitChange();
    return node;
  }

  _duplicateNode(nodeId) {
    const orig = this._state.nodes.find((n) => n.id === nodeId);
    if (!orig) return;
    const copy = deepClone(orig);
    copy.id = uid('node');
    copy.title = `${orig.title} (Copy)`;
    copy.x = this._snapCoord(orig.x + 40);
    copy.y = this._snapCoord(orig.y + 40);
    for (const slotKey of Object.keys(copy.slots || {})) {
      copy.slots[slotKey] = copy.slots[slotKey].map((b) => ({ ...b, uid: uid('blk') }));
    }
    this._state.nodes.push(copy);
    this._ui.selectedNodeId = copy.id;
    this._render();
    this._announce(`Duplicated ${orig.title}`);
    this._emitChange();
  }

  _deleteNode(nodeId) {
    const node = this._state.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    this._state.nodes = this._state.nodes.filter((n) => n.id !== nodeId);
    this._state.wires = this._state.wires.filter((w) => w.fromNodeId !== nodeId && w.toNodeId !== nodeId);
    if (this._ui.selectedNodeId === nodeId) this._ui.selectedNodeId = null;
    this._render();
    this._announce(`Deleted ${node.title}`);
    this._emitChange();
  }

  _addBlockToSlot(nodeId, slotKey, paletteItem, insertIndex = null) {
    const node = this._state.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const arch = CARD_ARCHETYPES[node.type];
    const slotDef = arch?.slots.find((s) => s.key === slotKey);
    if (!slotDef || slotDef.accepts !== paletteItem.type) return;

    if (!node.slots[slotKey]) node.slots[slotKey] = [];
    const block = {
      uid: uid('blk'),
      id: paletteItem.id,
      type: paletteItem.type,
      label: paletteItem.label,
      paramLabel: paletteItem.paramLabel || 'Value',
      param: paletteItem.defaultParam || '',
      icon: paletteItem.icon || 'zap',
    };

    if (insertIndex !== null && insertIndex >= 0 && insertIndex <= node.slots[slotKey].length) {
      node.slots[slotKey].splice(insertIndex, 0, block);
    } else {
      node.slots[slotKey].push(block);
    }

    this._ui.selectedNodeId = nodeId;
    this._ui.slotMenu = null;
    this._render();
    this._announce(`Snapped ${block.label} into ${node.title}`);
    this._emitChange();
  }

  _relocateBlock(fromNodeId, fromSlotKey, blockUid, toNodeId, toSlotKey, insertIndex = null) {
    const fromNode = this._state.nodes.find((n) => n.id === fromNodeId);
    const toNode = this._state.nodes.find((n) => n.id === toNodeId);
    if (!fromNode || !toNode) return;
    const fromList = fromNode.slots?.[fromSlotKey];
    if (!fromList) return;

    const srcIdx = fromList.findIndex((b) => b.uid === blockUid);
    if (srcIdx < 0) return;

    if (!toNode.slots[toSlotKey]) toNode.slots[toSlotKey] = [];
    const toList = toNode.slots[toSlotKey];

    const [moved] = fromList.splice(srcIdx, 1);
    let targetIdx = insertIndex === null ? toList.length : insertIndex;
    if (fromNodeId === toNodeId && fromSlotKey === toSlotKey && srcIdx < targetIdx) {
      targetIdx = Math.max(0, targetIdx - 1);
    }
    targetIdx = Math.max(0, Math.min(toList.length, targetIdx));
    toList.splice(targetIdx, 0, moved);

    this._ui.selectedNodeId = toNodeId;
    this._render();
    this._announce(`Moved ${moved.label} to ${toNode.title}`);
    this._emitChange();
  }

  _moveBlockInSlot(nodeId, slotKey, blockUid, delta) {
    const node = this._state.nodes.find((n) => n.id === nodeId);
    if (!node || !node.slots?.[slotKey]) return;
    const list = node.slots[slotKey];
    const idx = list.findIndex((b) => b.uid === blockUid);
    const nextIdx = idx + delta;
    if (idx < 0 || nextIdx < 0 || nextIdx >= list.length) return;
    const [moved] = list.splice(idx, 1);
    list.splice(nextIdx, 0, moved);
    this._render();
    const dirAttr = delta < 0 ? 'up' : 'down';
    const focusTarget = this.shadowRoot.querySelector(
      `.snapped-block[data-block-uid="${blockUid}"] .mini-btn[data-move="${dirAttr}"]`,
    );
    focusTarget?.focus({ preventScroll: true });
    this._announce(`Moved ${moved.label} ${delta < 0 ? 'up' : 'down'} to position ${nextIdx + 1}`);
    this._emitChange();
  }

  _removeBlockFromSlot(nodeId, slotKey, blockUid) {
    const node = this._state.nodes.find((n) => n.id === nodeId);
    if (!node || !node.slots?.[slotKey]) return;
    const removed = node.slots[slotKey].find((b) => b.uid === blockUid);
    node.slots[slotKey] = node.slots[slotKey].filter((b) => b.uid !== blockUid);
    this._render();
    if (removed) this._announce(`Removed ${removed.label}`);
    this._emitChange();
  }

  _connectPorts(fromNodeId, fromPort, toNodeId, toPort) {
    if (fromNodeId === toNodeId) return;
    const exists = this._state.wires.some(
      (w) =>
        w.fromNodeId === fromNodeId &&
        w.fromPort === fromPort &&
        w.toNodeId === toNodeId &&
        w.toPort === toPort,
    );
    if (exists) return;

    const fromNode = this._state.nodes.find((n) => n.id === fromNodeId);
    const fromArch = fromNode ? CARD_ARCHETYPES[fromNode.type] : null;
    const portDef = fromArch?.ports.find((p) => p.id === fromPort);

    const wire = {
      id: uid('wire'),
      fromNodeId,
      fromPort,
      toNodeId,
      toPort,
      label: portDef?.defaultWireLabel || 'Then',
    };
    this._state.wires.push(wire);
    this._ui.selectedWireId = wire.id;
    this._ui.selectedNodeId = null;
    this._ui.connectingPort = null;
    this._render();
    this._announce(`Connected ${fromNode?.title || 'card'} with label ${wire.label}`);
    this._emitChange();
  }

  _deleteWire(wireId) {
    this._state.wires = this._state.wires.filter((w) => w.id !== wireId);
    if (this._ui.selectedWireId === wireId) this._ui.selectedWireId = null;
    this._render();
    this._announce('Connection removed');
    this._emitChange();
  }

  // ==================== GEOMETRY & WIRES ====================

  _getPortWorldCenter(nodeId, portId) {
    const node = this._state.nodes.find((n) => n.id === nodeId);
    const portEl = this.shadowRoot.querySelector(
      `.bb-card[data-node-id="${nodeId}"] .port-handle[data-port-id="${portId}"]`,
    );
    const worldEl = this.shadowRoot.querySelector('.bb-world');
    if (portEl && worldEl) {
      const pRect = portEl.getBoundingClientRect();
      const wRect = worldEl.getBoundingClientRect();
      return {
        x: (pRect.left + pRect.width / 2 - wRect.left) / this._view.scale,
        y: (pRect.top + pRect.height / 2 - wRect.top) / this._view.scale,
      };
    }
    if (node) {
      const isIn = portId === 'in';
      return { x: node.x + (isIn ? 0 : 348), y: node.y + 40 };
    }
    return { x: 0, y: 0 };
  }

  _computeBezier(p1, p2) {
    const dx = Math.abs(p2.x - p1.x);
    const cpOffset = Math.max(64, dx * 0.48);
    const c1 = { x: p1.x + cpOffset, y: p1.y };
    const c2 = { x: p2.x - cpOffset, y: p2.y };
    const d = `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
    const mid = {
      x: 0.125 * p1.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * p2.x,
      y: 0.125 * p1.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * p2.y,
    };
    return { d, mid };
  }

  _wireStrokeColor(wire) {
    if (wire.fromPort === 'role-out') return 'var(--bb-role-accent)';
    if (wire.fromPort === 'else') return 'var(--bb-cond-accent)';
    return 'var(--bb-workflow-accent)';
  }

  _renderWires() {
    const svg = this.shadowRoot.querySelector('.bb-wires-svg');
    const pillsLayer = this.shadowRoot.querySelector('.bb-wire-pills');
    if (!svg || !pillsLayer) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    svg.innerHTML = '';
    pillsLayer.innerHTML = '';

    for (const wire of this._state.wires) {
      const p1 = this._getPortWorldCenter(wire.fromNodeId, wire.fromPort);
      const p2 = this._getPortWorldCenter(wire.toNodeId, wire.toPort);
      const { d, mid } = this._computeBezier(p1, p2);
      const color = this._wireStrokeColor(wire);
      const isSelected = this._ui.selectedWireId === wire.id;
      const isSimActive = this._ui.simActiveWires.has(wire.id);

      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('class', `wire-group${isSelected ? ' selected' : ''}`);
      g.dataset.wireId = wire.id;

      const glow = document.createElementNS(svgNS, 'path');
      glow.setAttribute('class', 'wire-glow');
      glow.setAttribute('d', d);
      glow.setAttribute('stroke', color);

      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('class', `wire-path${isSimActive ? ' sim-active' : ''}`);
      path.setAttribute('d', d);
      path.setAttribute('stroke', color);

      const hit = document.createElementNS(svgNS, 'path');
      hit.setAttribute('class', 'wire-hit');
      hit.setAttribute('d', d);
      hit.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this._ui.selectedWireId = wire.id;
        this._ui.selectedNodeId = null;
        this._updateSelectionClasses();
      });

      g.append(glow, path, hit);
      svg.append(g);

      const pill = document.createElement('div');
      const toneClass =
        wire.fromPort === 'role-out'
          ? 'tone-role'
          : wire.fromPort === 'else'
          ? 'tone-else'
          : '';
      pill.className = `wire-pill ${toneClass}${isSelected ? ' selected' : ''}`;
      pill.style.left = `${mid.x}px`;
      pill.style.top = `${mid.y}px`;
      pill.dataset.wireId = wire.id;
      pill.innerHTML = `
        <span>${escapeHtml(wire.label || 'Then')}</span>
        <button type="button" class="wire-pill-delete" aria-label="Delete ${escapeHtml(wire.label || 'wire')} connection" title="Delete wire">×</button>
      `;
      pill.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.wire-pill-delete')) return;
        e.stopPropagation();
        this._ui.selectedWireId = wire.id;
        this._ui.selectedNodeId = null;
        this._updateSelectionClasses();
      });
      pill.querySelector('.wire-pill-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this._deleteWire(wire.id);
      });
      pillsLayer.append(pill);
    }

    if (this._livePreviewWireEl) {
      svg.append(this._livePreviewWireEl);
    }
  }

  _applyCanvasTransform() {
    const dotGrid = this.shadowRoot.querySelector('.bb-dot-grid');
    const world = this.shadowRoot.querySelector('.bb-world');
    const shell = this.shadowRoot.querySelector('.bb-shell');
    if (!dotGrid || !world || !shell) return;

    const { dotSpacing, dotSize, dotOpacity, dotColor, canvasBg } = this._state.settings;
    shell.style.setProperty('--bb-canvas-bg', canvasBg);

    const tile = Math.max(6, Number(dotSpacing) || 20) * this._view.scale;
    const radius = Math.max(0.5, (Number(dotSize) || 1.5) * 0.5) * this._view.scale;
    const rgba = hexToRgba(dotColor, dotOpacity);
    const posX = this._view.panX - tile / 2;
    const posY = this._view.panY - tile / 2;

    dotGrid.style.backgroundImage = `radial-gradient(circle, ${rgba} ${radius}px, transparent ${radius + 0.4}px)`;
    dotGrid.style.backgroundSize = `${tile}px ${tile}px`;
    dotGrid.style.backgroundPosition = `${posX}px ${posY}px`;

    world.style.transform = `translate(${this._view.panX}px, ${this._view.panY}px) scale(${this._view.scale})`;
  }

  _updateSelectionClasses() {
    this.shadowRoot.querySelectorAll('.bb-card').forEach((el) => {
      el.classList.toggle('selected', el.dataset.nodeId === this._ui.selectedNodeId);
    });
    this.shadowRoot.querySelectorAll('.wire-group').forEach((el) => {
      el.classList.toggle('selected', el.dataset.wireId === this._ui.selectedWireId);
    });
    this.shadowRoot.querySelectorAll('.wire-pill').forEach((el) => {
      el.classList.toggle('selected', el.dataset.wireId === this._ui.selectedWireId);
    });
  }

  _applySimulationClasses() {
    this.shadowRoot.querySelectorAll('.bb-card').forEach((el) => {
      const id = el.dataset.nodeId;
      el.classList.toggle('sim-active', this._ui.simActiveNodes.has(id));
      el.classList.toggle('sim-visited', this._ui.simVisitedNodes.has(id));
    });
    this.shadowRoot.querySelectorAll('.snapped-block').forEach((el) => {
      el.classList.toggle('sim-pulse', this._ui.simActiveBlocks.has(el.dataset.blockUid));
    });
    this.shadowRoot.querySelectorAll('.wire-group').forEach((g) => {
      const p = g.querySelector('.wire-path');
      p?.classList.toggle('sim-active', this._ui.simActiveWires.has(g.dataset.wireId));
    });
  }

  // ==================== FULL & PARTIAL RENDERS ====================

  _render() {
    const root = this.shadowRoot;
    root.innerHTML = `
      <style>${STYLES}</style>
      <div class="bb-shell${this._ui.paletteCollapsed ? ' palette-collapsed' : ''}">
        <div class="visually-hidden bb-live-region" aria-live="polite"></div>

        <aside class="bb-palette" aria-label="Blueprint Palette">
          <div class="palette-top">
            <div class="palette-title-row">
              <p class="palette-step-label">1. Add Card to Board</p>
              <button type="button" class="icon-btn" data-action="toggle-palette" title="Collapse palette" aria-label="Collapse palette">
                ${renderIcon('chevronLeft', 15)}
              </button>
            </div>
            <div class="palette-launcher-grid">
              ${this._renderCardLaunchersHtml()}
            </div>
          </div>

          <div class="palette-blocks-header">
            <p class="palette-step-label">2. Snap Blocks into Cards</p>
            <div class="palette-search-wrap">
              <span class="palette-search-icon">${renderIcon('search', 14)}</span>
              <input type="search" class="palette-search" placeholder="Search permissions, triggers, actions..." value="${escapeHtml(this._ui.paletteQuery)}" aria-label="Filter palette blocks" />
            </div>
            <div class="palette-tabs" role="tablist" aria-label="Block Categories">
              ${this._renderPaletteTabsHtml()}
            </div>
          </div>

          <div class="palette-scroll">
            ${this._renderPaletteBlocksHtml()}
          </div>
        </aside>

        <main class="bb-viewport" tabindex="0" aria-label="Blueprint Dot Canvas">
          <div class="bb-dot-grid" aria-hidden="true"></div>
          <div class="bb-world">
            <svg class="bb-wires-svg" aria-hidden="true"></svg>
            <div class="bb-nodes-layer"></div>
            <div class="bb-wire-pills"></div>
          </div>

          <div class="bb-palette-reopen"></div>
          <div class="bb-bottom-dock"></div>
          <div class="bb-sim-toast-slot"></div>
          <div class="bb-help-slot"></div>
          <div class="bb-popover-slot"></div>
        </main>
      </div>
    `;

    this._renderNodes();
    this._applyCanvasTransform();
    this._renderHudOnly();
    this._renderSimToast();
    this._renderHelpCard();
    this._renderSlotMenu();
    this._bindRootEvents();
    requestAnimationFrame(() => this._renderWires());
  }

  _renderCardLaunchersHtml() {
    return (this._palette.cards || [])
      .map(
        (c) => `
      <button type="button" class="card-launcher palette-item-draggable tone-${escapeHtml(c.type)}" data-palette-kind="card" data-card-type="${escapeHtml(c.type)}" title="Click or drag to add ${escapeHtml(c.label)}">
        <span class="launcher-badge">${renderIcon(c.icon, 15)}</span>
        <span class="launcher-name">+ ${escapeHtml(c.shortLabel || c.label)}</span>
      </button>`,
      )
      .join('');
  }

  _renderPaletteTabsHtml() {
    const tabs = [
      { id: 'all', label: 'All' },
      { id: 'permissions', label: 'Roles' },
      { id: 'triggers', label: 'Triggers' },
      { id: 'conditions', label: 'Rules' },
      { id: 'actions', label: 'Actions' },
    ];
    return tabs
      .map(
        (t) =>
          `<button type="button" role="tab" class="palette-tab" data-tab="${t.id}" aria-selected="${this._ui.paletteTab === t.id}">${t.label}</button>`,
      )
      .join('');
  }

  _renderPaletteBlocksHtml() {
    const tab = this._ui.paletteTab;
    const q = this._ui.paletteQuery.trim().toLowerCase();
    const sections = [];

    const matchQuery = (label, sub = '') =>
      !q || label.toLowerCase().includes(q) || sub.toLowerCase().includes(q);

    const blockGroups = [
      { key: 'permissions', title: 'Role Permissions' },
      { key: 'triggers', title: 'Workflow Triggers' },
      { key: 'conditions', title: 'Conditions & Checks' },
      { key: 'actions', title: 'Actions' },
    ];

    for (const grp of blockGroups) {
      if (tab !== 'all' && tab !== grp.key) continue;
      const items = (this._palette[grp.key] || []).filter((item) =>
        matchQuery(item.label, `${item.paramLabel || ''} ${item.defaultParam || ''}`),
      );
      if (!items.length) continue;

      sections.push(`
        <section>
          <h3 class="palette-group-title"><span>${grp.title}</span><span>Drag to slot</span></h3>
          <div class="palette-list">
            ${items
              .map(
                (item) => `
              <button type="button" class="palette-item palette-item-draggable tone-${escapeHtml(item.type)}" data-palette-kind="block" data-block-group="${grp.key}" data-block-id="${escapeHtml(item.id)}">
                <span class="palette-item-icon">${renderIcon(item.icon, 15)}</span>
                <span class="palette-item-body">
                  <span class="palette-item-label">${escapeHtml(item.label)}</span>
                  <span class="palette-item-sub">${escapeHtml(item.paramLabel || 'Value')}: ${escapeHtml(item.defaultParam || 'Default')}</span>
                </span>
                <span class="palette-item-grip">${renderIcon('grip', 14)}</span>
              </button>`,
              )
              .join('')}
          </div>
        </section>
      `);
    }

    if (!sections.length) {
      return `<div style="font-size:12.5px; color:var(--bb-text-soft); text-align:center; padding:24px 8px;">No matching blocks for "${escapeHtml(this._ui.paletteQuery)}".</div>`;
    }
    return sections.join('');
  }

  _renderNodes() {
    const layer = this.shadowRoot.querySelector('.bb-nodes-layer');
    if (!layer) return;
    layer.innerHTML = '';

    for (const node of this._state.nodes) {
      const arch = CARD_ARCHETYPES[node.type] || CARD_ARCHETYPES.workflow;
      const card = document.createElement('article');
      card.className = `bb-card card-type-${node.type}${this._ui.selectedNodeId === node.id ? ' selected' : ''}`;
      card.dataset.nodeId = node.id;
      card.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;

      const isEditingTitle = this._ui.editingNodeTitleId === node.id;
      const inPort = arch.ports.find((p) => p.dir === 'in');
      const outPorts = arch.ports.filter((p) => p.dir === 'out');

      card.innerHTML = `
        <div class="card-accent-bar"></div>
        <header class="card-header">
          ${inPort ? `<div class="port-anchor-in">${this._renderPortHandleHtml(node.id, inPort)}</div>` : ''}
          <button type="button" class="card-drag-handle" aria-label="Move ${escapeHtml(node.title)} card. Use arrow keys to move." title="Keyboard move with arrow keys">
            ${renderIcon('grip', 15)}
          </button>
          <div class="card-title-wrap">
            <div class="card-badge-row">
              <span class="card-badge">${renderIcon(node.type === 'role' ? 'shield' : node.type === 'workflow' ? 'git-branch' : 'zap', 11)} ${arch.badge}</span>
            </div>
            ${
              isEditingTitle
                ? `<input type="text" class="card-title-input" value="${escapeHtml(node.title)}" aria-label="Edit card title" />`
                : `<h3 class="card-title-display" title="Double-click to rename">${escapeHtml(node.title)}</h3>`
            }
          </div>
          <div class="card-header-actions">
            <button type="button" class="icon-btn" data-card-action="rename" aria-label="Rename ${escapeHtml(node.title)}" title="Rename card">
              ${renderIcon('pencil', 13)}
            </button>
            <button type="button" class="icon-btn" data-card-action="duplicate" aria-label="Duplicate ${escapeHtml(node.title)}" title="Duplicate card">
              ${renderIcon('copy', 13)}
            </button>
            <button type="button" class="icon-btn danger" data-card-action="delete" aria-label="Delete ${escapeHtml(node.title)}" title="Delete card">
              ${renderIcon('trash', 13)}
            </button>
          </div>
        </header>

        <div class="card-body">
          ${arch.slots.map((slotDef) => this._renderSlotHtml(node, slotDef)).join('')}
        </div>

        ${
          outPorts.length
            ? `<footer class="card-outputs">
                ${outPorts
                  .map(
                    (p) => `
                  <div class="output-port-row">
                    <span class="output-pill-label port-${p.id}">${escapeHtml(p.label)} &rarr;</span>
                    <div class="port-anchor-out">${this._renderPortHandleHtml(node.id, p)}</div>
                  </div>`,
                  )
                  .join('')}
              </footer>`
            : ''
        }
      `;

      this._bindCardEvents(card, node);
      layer.append(card);

      if (isEditingTitle) {
        const input = card.querySelector('.card-title-input');
        requestAnimationFrame(() => {
          input?.focus();
          input?.select();
        });
      }
    }

    this._applySimulationClasses();
  }

  _renderSlotHtml(node, slotDef) {
    const blocks = node.slots?.[slotDef.key] || [];
    if (blocks.length === 0) {
      return `
        <div class="card-slot is-empty" data-node-id="${node.id}" data-slot-key="${slotDef.key}" data-accepts="${slotDef.accepts}">
          <div class="slot-empty-left">
            <span class="slot-dot ${slotDef.accepts}"></span>
            <span class="slot-empty-text">${escapeHtml(slotDef.emptyHint)}</span>
          </div>
          <button type="button" class="slot-add-btn" data-slot-add="${slotDef.key}" aria-label="Add ${slotDef.accepts} to ${escapeHtml(node.title)}">+ Add</button>
        </div>
      `;
    }

    return `
      <div class="card-slot is-populated" data-node-id="${node.id}" data-slot-key="${slotDef.key}" data-accepts="${slotDef.accepts}">
        <div class="slot-header">
          <span class="slot-label">
            <span class="slot-dot ${slotDef.accepts}"></span>
            ${escapeHtml(slotDef.label)}
          </span>
          <button type="button" class="slot-add-btn" data-slot-add="${slotDef.key}" aria-label="Add ${slotDef.accepts} to ${escapeHtml(node.title)}">+ Add</button>
        </div>
        <div class="slot-blocks">
          ${blocks
            .map((blk, idx) => this._renderSnappedBlockHtml(node.id, slotDef.key, blk, idx, blocks.length))
            .join('')}
        </div>
      </div>
    `;
  }

  _renderSnappedBlockHtml(nodeId, slotKey, blk, idx, total) {
    const isEditingParam =
      this._ui.editingBlockRef &&
      this._ui.editingBlockRef.nodeId === nodeId &&
      this._ui.editingBlockRef.slotKey === slotKey &&
      this._ui.editingBlockRef.blockUid === blk.uid;

    return `
      <div class="snapped-block tone-${escapeHtml(blk.type)}" data-node-id="${nodeId}" data-block-uid="${blk.uid}" data-block-type="${escapeHtml(blk.type)}" data-slot-key="${slotKey}">
        <span class="snapped-block-icon palette-item-icon">${renderIcon(blk.icon, 14)}</span>
        <div class="snapped-block-content">
          <div class="snapped-block-label">${escapeHtml(blk.label)}</div>
          <div class="snapped-block-param-row">
            ${
              isEditingParam
                ? `<input type="text" class="param-input" value="${escapeHtml(blk.param || '')}" aria-label="Edit ${escapeHtml(blk.paramLabel || 'value')}" />`
                : `<button type="button" class="param-chip" data-edit-param="${blk.uid}" title="Click to edit parameter">
                     <span class="param-chip-key">${escapeHtml(blk.paramLabel || 'Value')}:</span>
                     <span class="param-chip-val">${escapeHtml(blk.param || 'Configure')}</span>
                   </button>`
            }
          </div>
        </div>
        <div class="snapped-block-controls">
          <button type="button" class="mini-btn" data-move="up" ${idx === 0 ? 'disabled' : ''} aria-label="Move ${escapeHtml(blk.label)} up" title="Move up">${renderIcon('chevronUp', 13)}</button>
          <button type="button" class="mini-btn" data-move="down" ${idx === total - 1 ? 'disabled' : ''} aria-label="Move ${escapeHtml(blk.label)} down" title="Move down">${renderIcon('chevronDown', 13)}</button>
          <button type="button" class="mini-btn remove" data-remove-block="${blk.uid}" aria-label="Remove ${escapeHtml(blk.label)}" title="Remove block">×</button>
        </div>
      </div>
    `;
  }

  _renderPortHandleHtml(nodeId, port) {
    const isConnected = this._state.wires.some(
      (w) =>
        (port.dir === 'out' && w.fromNodeId === nodeId && w.fromPort === port.id) ||
        (port.dir === 'in' && w.toNodeId === nodeId && w.toPort === port.id),
    );
    const isSource =
      this._ui.connectingPort &&
      this._ui.connectingPort.nodeId === nodeId &&
      this._ui.connectingPort.portId === port.id;
    const isValidTarget =
      this._ui.connectingPort &&
      this._ui.connectingPort.nodeId !== nodeId &&
      port.dir === 'in';

    const cls = [
      'port-handle',
      `port-${port.id}`,
      isConnected ? 'connected' : '',
      isSource ? 'connect-source' : '',
      isValidTarget ? 'connect-target-valid' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `<button type="button" class="${cls}" data-node-id="${nodeId}" data-port-id="${port.id}" data-port-dir="${port.dir}" aria-label="${port.dir === 'out' ? 'Output' : 'Input'} port: ${escapeHtml(port.label)}" title="${port.dir === 'out' ? 'Drag to any target card to connect' : 'Connect incoming wire here'}"></button>`;
  }

  _renderHudOnly() {
    const reopen = this.shadowRoot.querySelector('.bb-palette-reopen');
    const dock = this.shadowRoot.querySelector('.bb-bottom-dock');
    if (!reopen || !dock) return;

    reopen.innerHTML = this._ui.paletteCollapsed
      ? `<div class="hud-pill"><button type="button" class="hud-btn" data-hud="expand-palette">${renderIcon('chevronRight', 14)} Show Palette</button></div>`
      : '';

    const pct = Math.round(this._view.scale * 100);
    dock.innerHTML = `
      <div class="hud-pill" role="toolbar" aria-label="Canvas Controls">
        <button type="button" class="hud-btn" data-hud="zoom-out" aria-label="Zoom out" title="Zoom out">${renderIcon('minus', 14)}</button>
        <span class="hud-zoom-readout">${pct}%</span>
        <button type="button" class="hud-btn" data-hud="zoom-in" aria-label="Zoom in" title="Zoom in">${renderIcon('plus', 14)}</button>
        <span class="hud-sep"></span>
        <button type="button" class="hud-btn" data-hud="fit-view" title="Fit all cards in view">${renderIcon('maximize', 14)} Fit View</button>
        <button type="button" class="hud-btn${this._state.settings.snapToDots ? ' active' : ''}" data-hud="toggle-snap" aria-pressed="${this._state.settings.snapToDots}">
          Snap to Dots
        </button>
        <span class="hud-sep"></span>
        <button type="button" class="hud-btn ${this._ui.simulating ? 'sim-running' : 'sim-primary'}" data-hud="simulate">
          ${renderIcon(this._ui.simulating ? 'square' : 'play', 13)}
          <span>${this._ui.simulating ? 'Stop Flow' : 'Simulate Flow'}</span>
        </button>
        <button type="button" class="hud-btn${this._ui.showHelp ? ' active' : ''}" data-hud="toggle-help" aria-label="Keyboard and usage help" title="Controls & Shortcuts">
          ${renderIcon('help', 14)}
        </button>
      </div>
    `;

    reopen.querySelector('[data-hud="expand-palette"]')?.addEventListener('click', () => {
      this._ui.paletteCollapsed = false;
      this._render();
    });
    dock.querySelector('[data-hud="zoom-out"]')?.addEventListener('click', () => this.zoomOut());
    dock.querySelector('[data-hud="zoom-in"]')?.addEventListener('click', () => this.zoomIn());
    dock.querySelector('[data-hud="fit-view"]')?.addEventListener('click', () => this.fitView());
    dock.querySelector('[data-hud="toggle-snap"]')?.addEventListener('click', () => {
      this.setDotSettings({ snapToDots: !this._state.settings.snapToDots });
    });
    dock.querySelector('[data-hud="simulate"]')?.addEventListener('click', () => {
      if (this._ui.simulating) this.stopSimulation();
      else this.simulateFlow();
    });
    dock.querySelector('[data-hud="toggle-help"]')?.addEventListener('click', () => {
      this._ui.showHelp = !this._ui.showHelp;
      this._renderHudOnly();
      this._renderHelpCard();
    });
  }

  _renderSimToast() {
    const slot = this.shadowRoot.querySelector('.bb-sim-toast-slot');
    if (!slot) return;
    if (!this._ui.simulating || !this._ui.simMessage) {
      slot.innerHTML = '';
      return;
    }
    slot.innerHTML = `
      <div class="sim-toast" role="status">
        <span class="sim-pulse-dot"></span>
        <span>${escapeHtml(this._ui.simMessage)}</span>
      </div>
    `;
  }

  _renderHelpCard() {
    const slot = this.shadowRoot.querySelector('.bb-help-slot');
    if (!slot) return;
    if (!this._ui.showHelp) {
      slot.innerHTML = '';
      return;
    }
    slot.innerHTML = `
      <div class="help-card" role="dialog" aria-label="Blueprint Builder Shortcuts">
        <h4>How to use buildaBoard</h4>
        <ul>
          <li><strong>Move cards</strong>: Drag anywhere on a card&apos;s header, or focus its <kbd>::</kbd> grip and press <kbd>Arrow</kbd> keys.</li>
          <li><strong>Rename cards</strong>: Double-click a card title or click its pencil icon.</li>
          <li><strong>Snap blocks</strong>: Drag blocks from the palette onto matching slots (or between cards), or click <strong>+ Add</strong> inside any slot.</li>
          <li><strong>Wire cards</strong>: Drag from a right-edge output port onto any target card (or click output, then click target card).</li>
          <li><strong>Navigate</strong>: Drag empty dot canvas to pan; scroll wheel to zoom; <kbd>Del</kbd> removes the selected card or wire.</li>
        </ul>
      </div>
    `;
  }

  _renderSlotMenu() {
    const container = this.shadowRoot.querySelector('.bb-popover-slot');
    if (!container) return;
    if (!this._ui.slotMenu) {
      container.innerHTML = '';
      return;
    }
    const { nodeId, slotKey, x, y } = this._ui.slotMenu;
    const node = this._state.nodes.find((n) => n.id === nodeId);
    const arch = node ? CARD_ARCHETYPES[node.type] : null;
    const slotDef = arch?.slots.find((s) => s.key === slotKey);
    if (!node || !slotDef) {
      container.innerHTML = '';
      return;
    }

    const items = this._palette[slotDef.accepts] || [];
    const safeLeft = Math.min(window.innerWidth - 280, Math.max(12, x));
    const safeTop = Math.min(window.innerHeight - 310, Math.max(12, y));

    container.innerHTML = `
      <div class="bb-popover" style="left:${safeLeft}px; top:${safeTop}px;" role="menu" aria-label="Add ${escapeHtml(slotDef.accepts)}">
        <div class="popover-header">Snap into ${escapeHtml(slotDef.label)}</div>
        ${items
          .map(
            (item) => `
          <button type="button" class="popover-option" role="menuitem" data-pick-id="${escapeHtml(item.id)}">
            <span class="snapped-block-icon palette-item-icon tone-${escapeHtml(item.type)}">${renderIcon(item.icon, 13)}</span>
            <span>${escapeHtml(item.label)}</span>
          </button>`,
          )
          .join('')}
      </div>
    `;

    container.querySelectorAll('.popover-option').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = items.find((i) => i.id === btn.dataset.pickId);
        if (item) this._addBlockToSlot(nodeId, slotKey, item);
      });
    });
  }

  // ==================== EVENT BINDING ====================

  _bindRootEvents() {
    const root = this.shadowRoot;
    const viewport = root.querySelector('.bb-viewport');
    const paletteSearch = root.querySelector('.palette-search');

    root.querySelector('[data-action="toggle-palette"]')?.addEventListener('click', () => {
      this._ui.paletteCollapsed = true;
      this._render();
    });

    paletteSearch?.addEventListener('input', (e) => {
      this._ui.paletteQuery = e.target.value;
      const scroll = root.querySelector('.palette-scroll');
      if (scroll) {
        scroll.innerHTML = this._renderPaletteBlocksHtml();
        this._bindPaletteDraggables();
      }
    });

    root.querySelectorAll('.palette-tab').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        this._ui.paletteTab = tabBtn.dataset.tab;
        root.querySelectorAll('.palette-tab').forEach((b) =>
          b.setAttribute('aria-selected', String(b.dataset.tab === this._ui.paletteTab)),
        );
        const scroll = root.querySelector('.palette-scroll');
        if (scroll) {
          scroll.innerHTML = this._renderPaletteBlocksHtml();
          this._bindPaletteDraggables();
        }
      });
    });

    this._bindPaletteDraggables();

    // Canvas pan & deselect
    viewport?.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.bb-card, .wire-pill, .bb-palette-reopen, .bb-bottom-dock, .help-card, .bb-popover')) {
        return;
      }
      if (e.button !== 0 && e.button !== 1) return;

      this._ui.selectedNodeId = null;
      this._ui.selectedWireId = null;
      this._ui.connectingPort = null;
      this._ui.slotMenu = null;
      this._updateSelectionClasses();
      this._renderSlotMenu();
      this._clearPortHighlights();

      const startX = e.clientX;
      const startY = e.clientY;
      const origPanX = this._view.panX;
      const origPanY = this._view.panY;
      const pointerId = e.pointerId;

      viewport.classList.add('panning');
      viewport.setPointerCapture(pointerId);

      const onMove = (mv) => {
        if (mv.pointerId !== pointerId) return;
        this._view.panX = origPanX + (mv.clientX - startX);
        this._view.panY = origPanY + (mv.clientY - startY);
        this._applyCanvasTransform();
      };

      const onEnd = (up) => {
        if (up.pointerId !== pointerId) return;
        viewport.classList.remove('panning');
        viewport.removeEventListener('pointermove', onMove);
        viewport.removeEventListener('lostpointercapture', onEnd);
      };

      viewport.addEventListener('pointermove', onMove);
      viewport.addEventListener('lostpointercapture', onEnd);
    });

    viewport?.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.09 : 1 / 1.09;
        this._zoomAroundPoint(factor, e.clientX, e.clientY);
      },
      { passive: false },
    );
  }

  _bindPaletteDraggables() {
    this.shadowRoot.querySelectorAll('.palette-item-draggable').forEach((itemEl) => {
      itemEl.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        const kind = itemEl.dataset.paletteKind;
        const startX = e.clientX;
        const startY = e.clientY;
        const pointerId = e.pointerId;
        let dragging = false;

        const payload =
          kind === 'card'
            ? { kind: 'card', cardType: itemEl.dataset.cardType }
            : {
                kind: 'block',
                block: (this._palette[itemEl.dataset.blockGroup] || []).find(
                  (b) => b.id === itemEl.dataset.blockId,
                ),
              };
        if (kind === 'block' && !payload.block) return;

        itemEl.setPointerCapture(pointerId);

        const cleanupSlotHighlight = () => {
          this.shadowRoot.querySelectorAll('.card-slot').forEach((s) => {
            s.classList.remove('accepting', 'drop-hover');
          });
        };

        const onMove = (mv) => {
          if (mv.pointerId !== pointerId) return;
          const dist = Math.hypot(mv.clientX - startX, mv.clientY - startY);
          if (!dragging && dist > 5) {
            dragging = true;
            this._createDragGhost(itemEl, mv.clientX, mv.clientY);
            if (payload.kind === 'block') {
              this.shadowRoot
                .querySelectorAll(`.card-slot[data-accepts="${payload.block.type}"]`)
                .forEach((s) => s.classList.add('accepting'));
            }
          }
          if (!dragging) return;

          if (this._dragGhostEl) {
            this._dragGhostEl.style.left = `${mv.clientX}px`;
            this._dragGhostEl.style.top = `${mv.clientY}px`;
          }

          if (payload.kind === 'block') {
            this.shadowRoot.querySelectorAll('.card-slot.drop-hover').forEach((s) => s.classList.remove('drop-hover'));
            const hovered = this._findSlotAtPoint(mv.clientX, mv.clientY, payload.block.type);
            hovered?.classList.add('drop-hover');
          }
        };

        const onEnd = (up) => {
          if (up.pointerId !== pointerId) return;
          itemEl.removeEventListener('pointermove', onMove);
          itemEl.removeEventListener('pointerup', onEnd);
          itemEl.removeEventListener('lostpointercapture', onCancel);
          this._removeDragGhost();
          cleanupSlotHighlight();

          if (dragging) {
            if (payload.kind === 'card') {
              const vp = this.shadowRoot.querySelector('.bb-viewport').getBoundingClientRect();
              if (up.clientX >= vp.left && up.clientX <= vp.right && up.clientY >= vp.top && up.clientY <= vp.bottom) {
                const worldPos = this._clientToWorld(up.clientX, up.clientY);
                this._createNode(payload.cardType, worldPos.x - 174, worldPos.y - 40);
              }
            } else {
              const slotEl = this._findSlotAtPoint(up.clientX, up.clientY, payload.block.type);
              if (slotEl) {
                const idx = this._computeInsertIndex(slotEl, up.clientY);
                this._addBlockToSlot(slotEl.dataset.nodeId, slotEl.dataset.slotKey, payload.block, idx);
              }
            }
          } else {
            if (payload.kind === 'card') {
              const vp = this.shadowRoot.querySelector('.bb-viewport').getBoundingClientRect();
              const center = this._clientToWorld(vp.left + vp.width / 2, vp.top + vp.height / 2);
              const jitter = (this._state.nodes.length % 5) * 20;
              this._createNode(payload.cardType, center.x - 174 + jitter, center.y - 120 + jitter);
            } else if (this._ui.selectedNodeId) {
              const selNode = this._state.nodes.find((n) => n.id === this._ui.selectedNodeId);
              const arch = selNode ? CARD_ARCHETYPES[selNode.type] : null;
              const matchSlot = arch?.slots.find((s) => s.accepts === payload.block.type);
              if (matchSlot) {
                this._addBlockToSlot(selNode.id, matchSlot.key, payload.block);
              } else {
                this._announce(`Selected card does not have a ${payload.block.type} slot. Drag onto a matching card.`);
              }
            }
          }
        };

        const onCancel = () => {
          itemEl.removeEventListener('pointermove', onMove);
          itemEl.removeEventListener('pointerup', onEnd);
          itemEl.removeEventListener('lostpointercapture', onCancel);
          this._removeDragGhost();
          cleanupSlotHighlight();
        };

        itemEl.addEventListener('pointermove', onMove);
        itemEl.addEventListener('pointerup', onEnd);
        itemEl.addEventListener('lostpointercapture', onCancel);
      });
    });
  }

  _findSlotAtPoint(clientX, clientY, blockType) {
    const stack = this.shadowRoot.elementsFromPoint(clientX, clientY);
    for (const el of stack) {
      const slot = el.closest?.(`.card-slot[data-accepts="${blockType}"]`);
      if (slot) return slot;
    }
    return null;
  }

  _computeInsertIndex(slotEl, clientY) {
    const items = [...slotEl.querySelectorAll('.snapped-block')];
    for (let i = 0; i < items.length; i += 1) {
      const r = items[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) return i;
    }
    return items.length;
  }

  _createDragGhost(sourceEl, x, y) {
    this._removeDragGhost();
    const ghost = sourceEl.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
    this.shadowRoot.querySelector('.bb-shell')?.append(ghost);
    this._dragGhostEl = ghost;
  }

  _removeDragGhost() {
    this._dragGhostEl?.remove();
    this._dragGhostEl = null;
  }

  _bindCardEvents(cardEl, node) {
    // Card click: either complete click-to-wire OR select card
    cardEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.port-handle')) return;
      if (
        this._ui.connectingPort &&
        this._ui.connectingPort.nodeId !== node.id &&
        !e.target.closest('button, input, select, textarea, a')
      ) {
        const arch = CARD_ARCHETYPES[node.type];
        const inPort = arch?.ports.find((p) => p.dir === 'in');
        if (inPort) {
          e.stopPropagation();
          this._connectPorts(this._ui.connectingPort.nodeId, this._ui.connectingPort.portId, node.id, inPort.id);
          return;
        }
      }
      this._ui.selectedNodeId = node.id;
      this._ui.selectedWireId = null;
      this._updateSelectionClasses();
    });

    // Dragging anywhere on .card-header (excluding action buttons, input, or port handle)
    const header = cardEl.querySelector('.card-header');
    const handle = cardEl.querySelector('.card-drag-handle');

    if (header) {
      header.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        const control = event.target.closest('button, input, select, textarea, a');
        if (control && control !== handle) return;

        event.stopPropagation();
        const startClientX = event.clientX;
        const startClientY = event.clientY;
        const startNodeX = node.x;
        const startNodeY = node.y;
        const pointerId = event.pointerId;
        let movedEnough = false;

        // Defer pointer capture until >4px move so double-clicking title works natively
        const onMove = (mv) => {
          if (mv.pointerId !== pointerId) return;
          const dxPx = mv.clientX - startClientX;
          const dyPx = mv.clientY - startClientY;
          if (!movedEnough && Math.hypot(dxPx, dyPx) > 4) {
            movedEnough = true;
            header.classList.add('dragging');
            handle?.classList.add('dragging');
            header.setPointerCapture(pointerId);
          }
          if (!movedEnough) return;

          const worldDx = dxPx / this._view.scale;
          const worldDy = dyPx / this._view.scale;
          node.x = this._snapCoord(startNodeX + worldDx);
          node.y = this._snapCoord(startNodeY + worldDy);
          cardEl.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
          this._renderWires();
        };

        const cleanup = () => {
          header.classList.remove('dragging');
          handle?.classList.remove('dragging');
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
          document.removeEventListener('pointercancel', onUp);
          header.removeEventListener('lostpointercapture', onUp);
        };

        const onUp = (endEv) => {
          if (endEv.pointerId !== pointerId) return;
          cleanup();
          if (movedEnough) {
            this._emitChange();
          }
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
        header.addEventListener('lostpointercapture', onUp);
      });
    }

    // Keyboard movement on focused grip button
    if (handle) {
      handle.addEventListener('keydown', (e) => {
        const step = (Number(this._state.settings.dotSpacing) || 20) * (e.shiftKey ? 3 : 1);
        let dx = 0;
        let dy = 0;
        let dir = '';
        if (e.key === 'ArrowLeft') { dx = -step; dir = 'left'; }
        else if (e.key === 'ArrowRight') { dx = step; dir = 'right'; }
        else if (e.key === 'ArrowUp') { dy = -step; dir = 'up'; }
        else if (e.key === 'ArrowDown') { dy = step; dir = 'down'; }
        else return;

        e.preventDefault();
        e.stopPropagation();
        node.x = this._snapCoord(node.x + dx);
        node.y = this._snapCoord(node.y + dy);
        cardEl.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
        this._renderWires();
        this._announce(`${node.title} moved ${dir}`);
        this._emitChange();
      });
    }

    // Rename on double-click of title OR pencil button
    const titleDisplay = cardEl.querySelector('.card-title-display');
    titleDisplay?.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this._ui.editingNodeTitleId = node.id;
      this._renderNodes();
    });

    cardEl.querySelector('[data-card-action="rename"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._ui.editingNodeTitleId = node.id;
      this._renderNodes();
    });

    const titleInput = cardEl.querySelector('.card-title-input');
    if (titleInput) {
      let settled = false;
      const commitTitle = () => {
        if (settled) return;
        settled = true;
        const nextVal = titleInput.value.trim();
        if (nextVal) node.title = nextVal;
        this._ui.editingNodeTitleId = null;
        this._renderNodes();
        requestAnimationFrame(() => this._renderWires());
        this._emitChange();
      };
      titleInput.addEventListener('blur', commitTitle);
      titleInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') commitTitle();
        else if (e.key === 'Escape') {
          settled = true;
          this._ui.editingNodeTitleId = null;
          this._renderNodes();
          requestAnimationFrame(() => this._renderWires());
        }
      });
    }

    // Card header actions (Duplicate / Delete)
    cardEl.querySelector('[data-card-action="duplicate"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._duplicateNode(node.id);
    });
    cardEl.querySelector('[data-card-action="delete"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._deleteNode(node.id);
    });

    // Slot "+ Add" buttons
    cardEl.querySelectorAll('.slot-add-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = btn.getBoundingClientRect();
        const slotKey = btn.dataset.slotAdd;
        const same =
          this._ui.slotMenu &&
          this._ui.slotMenu.nodeId === node.id &&
          this._ui.slotMenu.slotKey === slotKey;
        this._ui.slotMenu = same ? null : { nodeId: node.id, slotKey, x: rect.left, y: rect.bottom + 6 };
        this._renderSlotMenu();
      });
    });

    // Drag existing snapped block to reorder or move between compatible slots
    cardEl.querySelectorAll('.snapped-block').forEach((blockEl) => {
      blockEl.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('button, input, select, textarea, a')) return;

        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const pointerId = e.pointerId;
        const blockUid = blockEl.dataset.blockUid;
        const blockType = blockEl.dataset.blockType;
        const fromSlotKey = blockEl.dataset.slotKey;
        let dragging = false;

        const cleanupSlotHighlight = () => {
          blockEl.classList.remove('is-dragging-source');
          this.shadowRoot.querySelectorAll('.card-slot').forEach((s) => {
            s.classList.remove('accepting', 'drop-hover');
          });
        };

        const onMove = (mv) => {
          if (mv.pointerId !== pointerId) return;
          if (!dragging && Math.hypot(mv.clientX - startX, mv.clientY - startY) > 5) {
            dragging = true;
            blockEl.classList.add('is-dragging-source');
            this._createDragGhost(blockEl, mv.clientX, mv.clientY);
            this.shadowRoot
              .querySelectorAll(`.card-slot[data-accepts="${blockType}"]`)
              .forEach((s) => s.classList.add('accepting'));
            blockEl.setPointerCapture(pointerId);
          }
          if (!dragging) return;

          if (this._dragGhostEl) {
            this._dragGhostEl.style.left = `${mv.clientX}px`;
            this._dragGhostEl.style.top = `${mv.clientY}px`;
          }

          this.shadowRoot.querySelectorAll('.card-slot.drop-hover').forEach((s) => s.classList.remove('drop-hover'));
          const hovered = this._findSlotAtPoint(mv.clientX, mv.clientY, blockType);
          hovered?.classList.add('drop-hover');
        };

        const finish = (ev, cancelled = false) => {
          if (ev.pointerId !== pointerId) return;
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
          document.removeEventListener('pointercancel', onCancel);
          blockEl.removeEventListener('lostpointercapture', onCancel);
          this._removeDragGhost();

          const targetSlot = !cancelled && dragging ? this._findSlotAtPoint(ev.clientX, ev.clientY, blockType) : null;
          cleanupSlotHighlight();

          if (targetSlot) {
            const idx = this._computeInsertIndex(targetSlot, ev.clientY);
            this._relocateBlock(node.id, fromSlotKey, blockUid, targetSlot.dataset.nodeId, targetSlot.dataset.slotKey, idx);
          }
        };

        const onUp = (ev) => finish(ev, false);
        const onCancel = (ev) => finish(ev, true);

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onCancel);
        blockEl.addEventListener('lostpointercapture', onCancel);
      });
    });

    // Snapped Block actions (inline param edit, reorder up/down, remove)
    cardEl.querySelectorAll('[data-edit-param]').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const blockEl = chip.closest('.snapped-block');
        this._ui.editingBlockRef = {
          nodeId: node.id,
          slotKey: blockEl.dataset.slotKey,
          blockUid: chip.dataset.editParam,
        };
        this._renderNodes();
        const inp = this.shadowRoot.querySelector(`.snapped-block[data-block-uid="${chip.dataset.editParam}"] .param-input`);
        inp?.focus();
        inp?.select();
      });
    });

    const activeParamInput = cardEl.querySelector('.param-input');
    if (activeParamInput) {
      const ref = this._ui.editingBlockRef;
      let settled = false;
      const commitParam = () => {
        if (settled) return;
        settled = true;
        const blk = node.slots?.[ref.slotKey]?.find((b) => b.uid === ref.blockUid);
        if (blk) {
          blk.param = activeParamInput.value.trim() || blk.param;
        }
        this._ui.editingBlockRef = null;
        this._renderNodes();
        requestAnimationFrame(() => this._renderWires());
        this._emitChange();
      };
      activeParamInput.addEventListener('blur', commitParam);
      activeParamInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') commitParam();
        else if (e.key === 'Escape') {
          settled = true;
          this._ui.editingBlockRef = null;
          this._renderNodes();
          requestAnimationFrame(() => this._renderWires());
        }
      });
    }

    cardEl.querySelectorAll('[data-move]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const blockEl = btn.closest('.snapped-block');
        const delta = btn.dataset.move === 'up' ? -1 : 1;
        this._moveBlockInSlot(node.id, blockEl.dataset.slotKey, blockEl.dataset.blockUid, delta);
      });
    });

    cardEl.querySelectorAll('[data-remove-block]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const blockEl = btn.closest('.snapped-block');
        this._removeBlockFromSlot(node.id, blockEl.dataset.slotKey, btn.dataset.removeBlock);
      });
    });

    // Port wiring (Drag-to-wire with whole-card drop AND Click-to-wire)
    cardEl.querySelectorAll('.port-handle').forEach((portEl) => {
      portEl.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        const portDir = portEl.dataset.portDir;
        const portId = portEl.dataset.portId;

        if (this._ui.connectingPort && portDir === 'in' && this._ui.connectingPort.nodeId !== node.id) {
          this._connectPorts(this._ui.connectingPort.nodeId, this._ui.connectingPort.portId, node.id, portId);
          return;
        }

        if (portDir !== 'out') return;

        const startX = e.clientX;
        const startY = e.clientY;
        const pointerId = e.pointerId;
        let isDraggingWire = false;
        let hoveredTarget = null;

        portEl.setPointerCapture(pointerId);

        const highlightTargets = (active) => {
          this.shadowRoot.querySelectorAll('.port-handle[data-port-dir="in"]').forEach((p) => {
            if (p.dataset.nodeId !== node.id) {
              p.classList.toggle('connect-target-valid', active);
            }
            if (!active) p.classList.remove('connect-snap');
          });
          if (!active) {
            this.shadowRoot.querySelectorAll('.bb-card.wire-drop-target').forEach((c) => {
              c.classList.remove('wire-drop-target');
            });
          }
        };

        const onMove = (mv) => {
          if (mv.pointerId !== pointerId) return;
          if (!isDraggingWire && Math.hypot(mv.clientX - startX, mv.clientY - startY) > 4) {
            isDraggingWire = true;
            highlightTargets(true);
            const svgNS = 'http://www.w3.org/2000/svg';
            this._livePreviewWireEl = document.createElementNS(svgNS, 'path');
            this._livePreviewWireEl.setAttribute('class', 'wire-preview');
            this.shadowRoot.querySelector('.bb-wires-svg')?.append(this._livePreviewWireEl);
          }
          if (!isDraggingWire) return;

          const p1 = this._getPortWorldCenter(node.id, portId);
          let p2 = this._clientToWorld(mv.clientX, mv.clientY);

          // Reset snap indicators
          this.shadowRoot.querySelectorAll('.port-handle.connect-snap').forEach((el) => el.classList.remove('connect-snap'));
          this.shadowRoot.querySelectorAll('.bb-card.wire-drop-target').forEach((c) => c.classList.remove('wire-drop-target'));
          hoveredTarget = null;

          // 1) Whole-card drop hit-test first
          const stack = this.shadowRoot.elementsFromPoint(mv.clientX, mv.clientY);
          for (const el of stack) {
            const targetCard = el.closest?.('.bb-card');
            if (targetCard && targetCard.dataset.nodeId !== node.id) {
              const inPort = targetCard.querySelector('.port-handle[data-port-dir="in"]');
              if (inPort) {
                hoveredTarget = inPort;
                targetCard.classList.add('wire-drop-target');
                break;
              }
            }
          }

          // 2) Proximity snap to any input port within 32px
          if (!hoveredTarget) {
            let bestDist = 32;
            this.shadowRoot.querySelectorAll('.port-handle[data-port-dir="in"]').forEach((targetEl) => {
              if (targetEl.dataset.nodeId === node.id) return;
              const r = targetEl.getBoundingClientRect();
              const d = Math.hypot(mv.clientX - (r.left + r.width / 2), mv.clientY - (r.top + r.height / 2));
              if (d < bestDist) {
                bestDist = d;
                hoveredTarget = targetEl;
              }
            });
          }

          if (hoveredTarget) {
            hoveredTarget.classList.add('connect-snap');
            hoveredTarget.closest('.bb-card')?.classList.add('wire-drop-target');
            p2 = this._getPortWorldCenter(hoveredTarget.dataset.nodeId, hoveredTarget.dataset.portId);
          }

          const { d } = this._computeBezier(p1, p2);
          this._livePreviewWireEl?.setAttribute('d', d);
        };

        const onEnd = (up) => {
          if (up.pointerId !== pointerId) return;
          portEl.removeEventListener('pointermove', onMove);
          portEl.removeEventListener('pointerup', onEnd);
          portEl.removeEventListener('lostpointercapture', onCancel);
          this._livePreviewWireEl?.remove();
          this._livePreviewWireEl = null;
          highlightTargets(false);

          if (isDraggingWire) {
            if (hoveredTarget) {
              this._connectPorts(node.id, portId, hoveredTarget.dataset.nodeId, hoveredTarget.dataset.portId);
            }
          } else {
            const same =
              this._ui.connectingPort &&
              this._ui.connectingPort.nodeId === node.id &&
              this._ui.connectingPort.portId === portId;
            this._ui.connectingPort = same ? null : { nodeId: node.id, portId };
            this._clearPortHighlights();
            if (this._ui.connectingPort) {
              portEl.classList.add('connect-source');
              highlightTargets(true);
              this._announce('Click any target card or input port to connect, or press Escape to cancel');
            }
          }
        };

        const onCancel = () => {
          portEl.removeEventListener('pointermove', onMove);
          portEl.removeEventListener('pointerup', onEnd);
          portEl.removeEventListener('lostpointercapture', onCancel);
          this._livePreviewWireEl?.remove();
          this._livePreviewWireEl = null;
          highlightTargets(false);
        };

        portEl.addEventListener('pointermove', onMove);
        portEl.addEventListener('pointerup', onEnd);
        portEl.addEventListener('lostpointercapture', onCancel);
      });
    });
  }

  _clearPortHighlights() {
    this.shadowRoot.querySelectorAll('.port-handle').forEach((p) => {
      p.classList.remove('connect-source', 'connect-target-valid', 'connect-snap');
    });
    this.shadowRoot.querySelectorAll('.bb-card.wire-drop-target').forEach((c) => {
      c.classList.remove('wire-drop-target');
    });
  }

  _handleKeyDown(e) {
    const activeShadow = this.shadowRoot?.activeElement;
    const isTyping =
      (activeShadow && (activeShadow.tagName === 'INPUT' || activeShadow.tagName === 'TEXTAREA')) ||
      (document.activeElement &&
        document.activeElement !== this &&
        (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA'));
    if (isTyping) return;

    if (e.key === 'Escape') {
      if (this._ui.connectingPort || this._ui.slotMenu || this._ui.showHelp) {
        this._ui.connectingPort = null;
        this._ui.slotMenu = null;
        this._ui.showHelp = false;
        this._clearPortHighlights();
        this._renderSlotMenu();
        this._renderHudOnly();
        this._renderHelpCard();
      }
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!this.matches(':focus-within')) return;
      if (this._ui.selectedWireId) {
        e.preventDefault();
        this._deleteWire(this._ui.selectedWireId);
      } else if (this._ui.selectedNodeId) {
        e.preventDefault();
        this._deleteNode(this._ui.selectedNodeId);
      }
    }
  }

  _handleOutsidePointerDown(e) {
    if (!this._ui.slotMenu) return;
    const path = e.composedPath();
    const insidePopover = path.some((el) => el.classList?.contains('bb-popover') || el.classList?.contains('slot-add-btn'));
    if (!insidePopover) {
      this._ui.slotMenu = null;
      this._renderSlotMenu();
    }
  }
}

if (!customElements.get('builda-board')) {
  customElements.define('builda-board', BuildaBoardElement);
}

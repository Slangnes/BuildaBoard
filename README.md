[README.md](https://github.com/user-attachments/files/34820746/README.md)
# buildaBoard

A **zero-dependency, drop-in Web Component** (`<builda-board>`) for visually building **user roles, permission rules, and branching workflows** on an interactive dot-matrix blueprint canvas.

Drop `src/builda-board.js` into any plain HTML page, React, Vue, or Svelte app, define your application's own blocks via `setPalette()`, and persist the resulting graph as clean JSON via the `blueprint-change` event.

---

## What It Does

`buildaBoard` combines a snap-to-grid node editor with typed, Snap!-inspired magnetic block sockets inside each card:

- **Customizable Dot-Matrix Paper Canvas**: Smooth panning, mouse-wheel/HUD zooming (`40%`–`200%`), `Fit View`, and toggleable `Snap to Dots` alignment across light, blueprint, and dark themes (`dotSpacing`, `dotSize`, `dotOpacity`, `dotColor`, `canvasBg`).
- **Three Card Archetypes**:
  - **User Role (`role`)**: Holds **Allowed Capabilities** (`permissions`) and **Role Constraints** (`conditions`). Exposes `Assigned From` (`in`) and `Authorizes` (`role-out`) ports.
  - **Workflow Stage (`workflow`)**: Holds **When This Happens** (`triggers`), **Only If** (`conditions`), and **Actions to Run** (`actions`). Exposes `Allowed Role / Input` (`in`) and branching `Then` (`then`) / `On Reject` (`else`) ports.
  - **Outcome / Actions (`action-group`)**: Holds **Actions to Execute** (`actions`). Exposes `Run When Reached` (`in`) and `Next Step` (`then`) ports.
- **Typed Snap-In Block Sockets**: Blocks from the searchable, categorized palette (`Roles`, `Triggers`, `Rules`, `Actions`) only snap into compatible card slots. Each snapped block includes an inline editable parameter chip (for example `Scope`, `Limit`, `Window`, `Channel`, `To`, or `Route`), up/down reorder buttons, cross-card drag relocation, and one-click removal.
- **Smooth Cubic-Bezier Wires**: Connect output ports to target cards with real-time wire previews, whole-card drop hit-testing, proximity port snapping, and midpoint badge pills.
- **Built-In Flow Simulator**: Step-by-step wave execution trace (`simulateFlow()`) that highlights active cards, blocks, and wires in topological waves with live status banners.
- **Keyboard & Single-Pointer Accessible**: Every drag-and-drop workflow has a click or keyboard alternative — click card launchers to add cards, click a card slot's **`+ Add`** menu to snap blocks without dragging, click-to-wire ports, move focused cards via the `::` grip with `Arrow` keys (`Shift + Arrow` moves 3 grid steps), and inspect screen-reader announcements via an `aria-live="polite"` region.
- **Framework-Agnostic & Zero Dependencies**: Implemented as a single ES module (`src/builda-board.js`) using standard Custom Elements and Shadow DOM.

---

## Project Structure

```text
buildaBoard/
├── index.html            # Interactive demo playground (presets, themes, sliders, Live JSON drawer)
└── src/
    └── builda-board.js   # <builda-board> Web Component (BuildaBoardElement)
```

---

## How to Use It

### 1. Run the Included Demo (`index.html`)

Because `index.html` loads `src/builda-board.js` as an ES module (`<script type="module">`), serve the folder over a local HTTP server rather than opening `file://` directly:

```bash
# Node.js
npx serve .

# or Python
python -m http.server 8080
```

Then open `http://localhost:8080` (or the port printed by `serve`). In the demo top bar you can:
- Switch between built-in **Presets** (*Role-Based Approval Workflow*, *User Onboarding & Access Provisioning*, and *Blank Dot Canvas*).
- Switch **Paper** themes (*Paper White*, *Warm Blueprint*, *Dark Slate*) and adjust dot **Spacing** (`12px`–`32px`) and **Dot Size** (`1px`–`3px`).
- Run **Simulate Workflow** to watch execution waves traverse connected cards.
- Open **Live JSON & Drop-In Code** to inspect the serialized blueprint in real time or copy the embed snippet.

---

### 2. Drop `<builda-board>` Into Your App

Copy `src/builda-board.js` into your project, import it as a module, and configure your own domain palette and persistence handler:

```html
<!-- 1. Include the zero-dependency module -->
<script type="module" src="./src/builda-board.js"></script>

<!-- 2. Drop the element anywhere -->
<builda-board id="workflow-builder" style="height: 680px;"></builda-board>

<script type="module">
  const board = document.getElementById('workflow-builder');

  // 3. Expose your app's own permissions, triggers, conditions, and actions
  board.setPalette({
    permissions: [
      { id: 'billing-read', type: 'permissions', label: 'View Invoices', paramLabel: 'Scope', defaultParam: 'All Accounts', icon: 'eye' }
    ],
    triggers: [
      { id: 'invoice-paid', type: 'triggers', label: 'Invoice Paid', paramLabel: 'Min', defaultParam: '$500', icon: 'inbox' }
    ],
    conditions: [
      { id: 'vip-tier', type: 'conditions', label: 'Customer Tier', paramLabel: 'Tier', defaultParam: 'Enterprise', icon: 'award' }
    ],
    actions: [
      { id: 'grant-vip', type: 'actions', label: 'Unlock Feature Flag', paramLabel: 'Flag', defaultParam: 'priority-support', icon: 'zap' }
    ]
  });

  // 4. Listen for visual changes and persist JSON to your backend
  board.addEventListener('blueprint-change', (e) => {
    console.log('Updated blueprint:', e.detail);
  });
</script>
```

> **Note for React / Vue / Svelte:** Because `<builda-board>` is a standard Custom Element, import `./src/builda-board.js` once at app startup, render `<builda-board ref={...} />`, and call `.setPalette()`, `.setBlueprint()`, or attach an `addEventListener('blueprint-change', ...)` on the element reference.

---

### 3. Canvas Controls & Shortcuts

| Action | Mouse / Touch | Keyboard / Click Alternative |
| :--- | :--- | :--- |
| **Add a card** | Drag a card launcher (`+ User Role`, `+ Workflow`, `+ Outcome`) onto the canvas | Click a card launcher to insert at the viewport center |
| **Snap a block into a card** | Drag a block from the palette onto a highlighted compatible slot | Select a card & click a palette block, or click **`+ Add`** inside any card slot |
| **Reorder / move blocks** | Drag a snapped block within a slot or to a compatible slot on another card | Click the `▲` / `▼` buttons on the block |
| **Edit block parameter** | Click the parameter chip (e.g., `Scope: Own Workspace`) | Press `Enter` to commit or `Escape` to cancel |
| **Move a card** | Drag anywhere on the card header | Focus the `::` grip button and press `Arrow` keys (`Shift + Arrow` for 3× step) |
| **Rename a card** | Double-click the card title | Click the pencil icon (`Rename card`), type, and press `Enter` |
| **Duplicate / delete a card** | Click the copy or trash icon in the card header | Select a card and press `Delete` or `Backspace` |
| **Connect cards (wires)** | Drag from a right-edge output port onto any target card or input port | Click an output port, then click the target card or input port (`Escape` cancels) |
| **Delete a wire** | Click the `×` button on the wire's midpoint pill | Click a wire/pill to select it and press `Delete` or `Backspace` |
| **Pan & zoom canvas** | Drag empty dot canvas to pan; scroll wheel to zoom | Use the bottom floating HUD (`-`, `+`, `Fit View`) |

---

## Component API

### Methods (`BuildaBoardElement`)

| Method | Signature | Description |
| :--- | :--- | :--- |
| `getBlueprint()` | `() => BlueprintJSON` | Returns a deep clone of `{ metadata, settings, nodes, wires, palette }`. |
| `setBlueprint(data)` | `(BlueprintJSON) => void` | Loads a blueprint (and optional `palette`), fits all cards in view, and emits `blueprint-change`. |
| `setPalette(config)` | `(PaletteConfig, options?) => void` | Replaces one or more palette arrays (`cards`, `permissions`, `triggers`, `conditions`, `actions`) while keeping defaults for omitted keys. |
| `setDotSettings(patch)` | `(DotSettingsPatch) => void` | Updates `dotSpacing`, `dotSize`, `dotOpacity`, `dotColor`, `canvasBg`, and/or `snapToDots`. |
| `simulateFlow()` | `() => void` | Walks the graph in topological waves from entry nodes, pulsing active cards, blocks, and wires. |
| `stopSimulation()` | `() => void` | Stops any active simulation run and clears highlight states. |
| `fitView()` | `() => void` | Automatically pans and scales the viewport so all cards fit comfortably. |
| `resetView()` | `() => void` | Resets pan to `(60, 60)` and zoom to `100%`. |
| `zoomIn()` / `zoomOut()` | `() => void` | Steps zoom by `15%` around the viewport center. |

### Events

- **`blueprint-change`** (`CustomEvent`, `bubbles: true`, `composed: true`): Fired whenever nodes, slots, block parameters, card titles, wires, palette config, or dot settings change. `event.detail` contains the full blueprint JSON returned by `getBlueprint()`.

### Blueprint JSON Format

```json
{
  "metadata": { "name": "Role-Based Approval Workflow", "version": "1.0" },
  "settings": {
    "dotSpacing": 20,
    "dotSize": 1.5,
    "dotOpacity": 0.9,
    "dotColor": "#a0a0a0",
    "canvasBg": "#ffffff",
    "snapToDots": true
  },
  "nodes": [
    {
      "id": "node-role-editor",
      "type": "role",
      "title": "Content Editor",
      "x": 60,
      "y": 80,
      "slots": {
        "permissions": [
          {
            "uid": "blk-1",
            "id": "perm-view-dashboard",
            "type": "permissions",
            "label": "View Dashboard",
            "paramLabel": "Scope",
            "param": "Marketing",
            "icon": "eye"
          }
        ],
        "conditions": [
          {
            "uid": "blk-3",
            "id": "cond-2fa",
            "type": "conditions",
            "label": "2FA Verified",
            "paramLabel": "Required",
            "param": "Yes",
            "icon": "lock"
          }
        ]
      }
    }
  ],
  "wires": [
    {
      "id": "wire-1",
      "fromNodeId": "node-role-editor",
      "fromPort": "role-out",
      "toNodeId": "node-wf-review",
      "toPort": "in",
      "label": "Authorizes"
    }
  ]
}
```

### Theming & CSS Custom Properties

Add `theme="dark"` on `<builda-board>` for dark mode, or override CSS custom properties on `builda-board` (such as `--bb-radius`, `--bb-outer-border`, `--bb-canvas-bg`, `--bb-surface`, `--bb-role-accent`, `--bb-workflow-accent`, `--bb-action-accent`, and `--bb-cond-accent`).

> **Supported Icon Names** for custom palette blocks: `shield`, `git-branch`, `zap`, `eye`, `edit`, `pencil`, `check-circle`, `users`, `download`, `trash`, `inbox`, `refresh`, `user-plus`, `clock`, `bell`, `sliders`, `sun`, `lock`, `building`, `award`, `mail`, `user-check`, `check-square`, `message`, `file-text`, `globe`, `search`, `help`.

---

## Use Cases

1. **Role-Based Access Control (RBAC) & Approval Policies**
   Let workspace admins visually compose roles (*Contributor*, *Manager*, *Auditor*), attach scoped permissions (*Approve Requests up to `$5,000`*, *Export Reports as `CSV Only`*) and security constraints (*2FA Verified*, *During Business Hours*), and wire those roles into multi-stage review flows with separate `Then` (publish) and `On Reject` (return for revision / audit log) branches.

2. **Employee Onboarding & Automated Access Provisioning**
   Model HR-driven access pipelines: trigger on `New User Signed Up` (`Source: HR Sync`), verify `Same Department` and `2FA Verified`, grant a `Standard Role` with scoped permissions, and notify IT/HR while writing an audit entry.

3. **SaaS Billing, Tier Entitlements & Feature-Flag Automation**
   Expose your product's billing triggers (`Invoice Paid`), customer tier checks (`Customer Tier: Enterprise`), and provisioning actions (`Unlock Feature Flag`, `Webhook Call`, `Slack / Teams Ping`) via `setPalette()` so operations or account teams can customize upgrade workflows without shipping new code.

4. **Operations, QA & Shop-Floor Escalation Routing**
   Map operator and supervisor roles to inspection or form-submission stages (`Form Submitted`, `Record Status Changed`), gate automatic sign-off behind numeric thresholds (`Amount Under Threshold`) or shift windows, and route failures to manager escalation alerts.

5. **White-Label Rule Builder Inside Any Admin Console**
   Because `<builda-board>` enforces slot type-safety (`permissions`, `triggers`, `conditions`, `actions`) and outputs structured JSON on every edit, you can drop it straight into an internal admin portal or SaaS settings page and execute the exported graph on your backend.

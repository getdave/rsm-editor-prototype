# AI Agent Context for RSM Wireframe Prototype

This document provides context for AI coding assistants working on this codebase.

## Project Overview

This is a **React prototype** addressing WordPress Site Editor complexity through iterative UI exploration. Unlike conceptual redesigns, this prototype tests **practical, implementable improvements** that could be incrementally adopted in the real WordPress Site Editor.

**Primary Goals:**
1. **Simplify without reinventing** - Build on WordPress patterns users already understand
2. **Make complexity optional** - Use progressive disclosure so power features don't overwhelm basic workflows  
3. **Stay grounded in reality** - Every pattern must be feasible to ship in production WordPress
4. **Enable incremental adoption** - Changes should work independently, not require wholesale replacement

**Design Constraints:**
- Must respect WordPress's plugin/theme extensibility model
- Should feel familiar to existing WordPress users
- Must work with WordPress components and design system
- Should consider migration paths from current Site Editor

**What We're Testing:**
- How to organize pages, templates, and patterns more clearly
- How to distinguish system-generated vs. user-created content
- How to make advanced features accessible without cluttering common tasks
- How to improve information architecture without creating new mental models

## Architecture Principles

### State Management
- Uses **React Context** (`useAppState` hook) for global state
- No Redux, Zustand, or other state libraries
- Keep state minimal and co-located where possible
- URL state via React Router search params for things like `?inserter=true`

### Styling
- **Plain CSS only** - No Tailwind, CSS Modules, styled-components, or CSS-in-JS
- Styles organized in `src/styles/` with subdirectories:
  - `chrome/` - Persistent editor frame (sidebar, topbar)
  - `views/` - One CSS file per route (home, pages, etc.)
  - Root level - Shared styles (canvas, modals-base, utilities, etc.)
- `index.css` imports all CSS files in the correct order
- Use semantic class names (e.g., `.sidebar`, `.pp-row`, `.ct-toolbar`)
- WordPress component styles imported via `@wordpress/components/build-style/style.css`

### Components
- Functional components with hooks only (no class components)
- Keep components focused and single-purpose
- Use `@wordpress/components` for buttons, tooltips, button groups
- Use `@wordpress/icons` for all icons (never inline SVGs unless absolutely necessary)

### Routing
- React Router v6 for all navigation
- Routes defined in `src/router/routes.jsx`
- Use `useNavigate()` for programmatic navigation
- Use `useSearchParams()` for query parameters
- Never use window.location or hash-based routing

## Critical Technical Details

### React Version Constraint
**IMPORTANT:** This project uses React 18, NOT React 19, due to peer dependency constraints from `@wordpress/icons` and `@wordpress/components`. Do not upgrade React to v19.

### Vite Configuration
The `vite.config.js` includes critical deduplication config to prevent multiple React instances:

```javascript
resolve: {
  dedupe: ['react', 'react-dom', '@wordpress/element'],
  alias: {
    'react': path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom')
  }
}
```

**Do not remove or modify this configuration** - it prevents runtime errors with WordPress packages.

### Icon Usage
- Always import icons from `@wordpress/icons`
- Icons are React components: `import { home, page, settings } from '@wordpress/icons'`
- Render as JSX: `{home}` or `<span>{home}</span>`
- Set size with `iconSize` prop on WordPress Buttons, or wrap in a container with CSS sizing
- Common icons: `home`, `page`, `postList`, `navigation`, `siteLogo`, `styles`, `settings`, `chevronRight`, `chevronDown`, `chevronUp`, `plus`, `undo`, `redo`, `desktop`, `tablet`, `mobile`, `help`, `drawerRight`, `moreVertical`, `pencil`, `list`, `grid`

### Button Components
- Use `Button` from `@wordpress/components` for toolbar actions
- Use `ButtonGroup` to visually group related buttons
- Use plain HTML `<button>` for list items, cards, or custom-styled buttons (like "Add section")
- WordPress Buttons have built-in styling that may conflict with custom CSS

## File Organization

### Views (`src/components/views/`)
- **PreviewView.jsx** - Home/preview mode showing live site
- **EditingView.jsx** - Visual editing canvas with sections
- **PagesView.jsx** - Page management (list/grid, tabs, accordions)
- **SectionInserter.jsx** - Sidebar panel for adding sections

### Layouts (`src/layouts/`)
- **RootLayout.jsx** - Main layout with Topbar, Sidebar, and Outlet for route content

### Data (`src/data/`)
- **mockData.js** - All mock data (pages, sections, site info)
- Use this for prototype data - don't create separate JSON files

### State (`src/hooks/`)
- **useAppState.jsx** - Global state context and hook
- Available state: `sidebarCollapsed`, `currentPage`, `selectedDevice`, `siteTitle`, modal visibility, etc.

## Common Patterns

### Adding a New View
1. Create component in `src/components/views/`
2. Add route in `src/router/routes.jsx`
3. Add navigation item in `Sidebar.jsx` if needed
4. Use `useAppState()` for shared state
5. Add styles to new file `src/styles/views/your-view.css`
6. Import the new CSS file in `src/styles/index.css`

### Adding Modal/Dialog
1. Create component in `src/components/modals/`
2. Add state to `useAppState.jsx` for visibility (e.g., `showMyModal`, `openMyModal`, `closeMyModal`)
3. Render in `RootLayout.jsx` (modals live at root level)
4. Style with `.modal-overlay` and `.modal-content` pattern

### Common UI Patterns
Rather than documenting specific patterns here (which evolve as the prototype develops), explore the codebase to see current implementations. Look for:
- How state is managed (check `useAppState`)
- How routing works (check `routes.jsx`)
- How data structures are defined (check `mockData.js`)
- How components compose (read existing view files)

## Styling Guidelines

### CSS Organization

Styles are organized in `src/styles/` by UI area:

```
src/styles/
├── index.css              # Main entry (imports all files)
├── base.css               # Reset, fonts, body, root
├── chrome/                # Persistent editor frame
│   ├── sidebar.css        # Navigation, advanced menu
│   └── topbar.css         # Site identity, search, save
├── canvas.css             # All canvas-area (toolbar, editing, inserter)
├── modals-base.css        # Shared modal styles
├── views/                 # One file per route
│   ├── home.css           # PreviewView + ContentSuggestions
│   ├── pages.css          # PagesView + reading settings modal
│   └── [other-view].css   # Future views
├── templates-preview.css  # WP template hierarchy previews (Layer 2)
├── command-palette.css    # Command palette
├── floating.css           # Floating panels, tooltips
└── utilities.css          # Icons, badges, scrollbars
```

**Where to add new styles:**
- **View-specific styles** → `views/your-view.css`
- **Chrome updates** → `chrome/sidebar.css` or `chrome/topbar.css`
- **Canvas/editing** → `canvas.css`
- **Shared utilities** → `utilities.css`
- **New modals** → Modal base styles in `modals-base.css`, view-specific content in the view's CSS file

**Important:** After creating a new CSS file, import it in `src/styles/index.css` in the correct order.

### Class Naming Conventions
- Component prefix: `.sidebar`, `.topbar`, `.canvas`
- View prefix: `.pp-` for Pages Panel, `.edit-` for Editing view
- Modifier suffix: `.on`, `.sel`, `.show`, `.collapsed`
- Action prefix: `.add-`, `.sb-btn` (section bar button)

### Colors
- Background dark: `#1e1e1e`
- Background darker: `#2a2a2a`
- Primary blue: `#3858e9`
- Text light: `#bbb`, `#999`
- Text dark: `#1e1e1e`

### Layout
- Main layout: Flexbox with sidebar + main content
- Sidebar: Fixed width (258px expanded, 48px collapsed)
- Use `flex: 1` for flexible areas
- Use `flex-shrink: 0` for fixed elements

## Common Issues & Solutions

### Multiple React Instances Error
**Symptom:** `Cannot read properties of null (reading 'useState')` or `Cannot read properties of null (reading 'useContext')`

**Solution:** Ensure `vite.config.js` has dedupe config (see above). If adding new WordPress packages, restart dev server.

### Icons Not Showing
**Symptom:** Empty space where icon should be or `0x0px` rendering

**Solution:** Ensure parent has `display: flex` or `display: inline-flex` and explicit width/height. Icons need a sized container.

### Tooltips Not Styled
**Symptom:** Tooltips appear but have no styling

**Solution:** Import WordPress component styles in `main.jsx`:
```javascript
import '@wordpress/components/build-style/style.css';
```

### Sidebar Toggle Not Working
**Symptom:** Clicking edit button doesn't collapse sidebar

**Solution:** Check `RootLayout.jsx` has `useEffect` watching `location.pathname` for routes containing `/edit`.

### Add Section Buttons Not Appearing
**Symptom:** Buttons not visible on hover

**Solution:** Ensure using plain `<button className="add-sec">` NOT `<Button className="add-sec">`. WordPress Button component overrides custom CSS.

## Development Workflow

### Before Starting New Work

**CRITICAL: Always ask about branching strategy before starting new features.**

When a user requests work on a new feature or significant change, ALWAYS prompt:

> "Should I create a new branch for this work, or work directly on trunk?"

**Why this matters:**
- This prototype is a collaboration between multiple people
- Working on separate branches prevents conflicts
- Feature branches make it easier to review and discuss changes
- The main collaborator is a designer who may be working in parallel

**Recommended approach:**
```bash
# For new features or experiments
git checkout -b feature/descriptive-name

# For bug fixes
git checkout -b fix/issue-description

# For documentation
git checkout -b docs/what-changed
```

Only work directly on `trunk` for:
- Trivial typo fixes
- Emergency hotfixes
- Changes explicitly requested to go straight to trunk

### Working with Multiple Git Worktrees

Use **git worktrees** when you want several features (or agents) in parallel, each with its own checkout and dev server.

#### Agent workspaces and already-created checkouts

There are two setup commands:

- `npm run worktree:setup` only writes `.env.local`, assigns/reuses a stable port, and prints the preview URL.
- `npm run workspace:setup` runs `npm ci` first, then runs `worktree:setup`. Use this for fresh already-created agent workspaces and worktrees.

When an agent tool has already created a fresh checkout/workspace for you, run:

```bash
npm run workspace:setup
npm run dev
```

This installs dependencies with `npm ci`, writes **`.env.local`** with `VITE_PORT`, `VITE_WORKTREE_LABEL`, `VITE_WORKTREE_SLUG`, and `VITE_BRANCH_NAME`, and assigns a stable available port through `scripts/worktree.mjs`. The port registry is stored in the repository's Git common directory, which you can locate with `git rev-parse --git-common-dir`, so Cursor and manual worktrees share assignments and avoid port conflicts.

If the workspace should inherit unmanaged values from the main checkout's `.env.local`, pass the source checkout explicitly. Replace `/path/to/main/checkout` with the absolute path to that checkout:

```bash
ROOT_WORKTREE_PATH=/path/to/main/checkout npm run workspace:setup
npm run dev
```

After setup, always start the dev server and open the localhost preview in the browser. Use the preview URL printed by `npm run workspace:setup`, or read `VITE_PORT` from `.env.local` and open `http://localhost:$VITE_PORT/`. If the app binds to `127.0.0.1`, open `http://127.0.0.1:$VITE_PORT/` instead. If a browser cannot be opened automatically, report the exact preview URL.

#### Cursor worktrees (Agents Window, `/worktree`, CLI)

Cursor isolates agents in separate Git checkouts. This repo includes [`.cursor/worktrees.json`](.cursor/worktrees.json) so Cursor runs a proper setup when it creates a worktree:

- **`npm ci`** in the new checkout (Cursor [recommends installing dependencies per worktree](https://cursor.com/docs/configuration/worktrees) instead of symlinking `node_modules`).
- **`.env.local`** with a stable `VITE_PORT`, `VITE_WORKTREE_LABEL`, `VITE_WORKTREE_SLUG`, and `VITE_BRANCH_NAME` fallback.
- **Port allocation** through `scripts/worktree.mjs`, which coordinates all worktrees through `.git/rsm-worktree-ports.json`, reuses stable per-worktree ports, and avoids ports already in use. The main checkout conventionally stays on `5173`; worktrees use `5174-5973`.

Scripts live next to the config: [`.cursor/setup-worktree-unix.sh`](.cursor/setup-worktree-unix.sh), [`.cursor/setup-worktree-windows.ps1`](.cursor/setup-worktree-windows.ps1). If setup fails, use the editor **Output** panel and choose **Worktrees Setup** (per Cursor docs).

Editor commands: **`/worktree`**, **`/best-of-n`**, **`/apply-worktree`**, **`/delete-worktree`**. Full details: [Cursor — Worktrees](https://cursor.com/docs/configuration/worktrees).

#### Manual / CLI git worktrees (sibling folder)

**Create a worktree** from the main clone (run at the repo root):

```bash
npm run worktree:create -- feature/my-change
# or: bash scripts/create-worktree.sh feature/my-change
```

This adds a sibling directory `../rsm-prototyping-feature-my-change`, checks out branch `feature/my-change` (creating it if needed), writes **`.env.local`** with worktree metadata, copies any unmanaged keys from the main clone’s `.env.local` when present, assigns a stable available port, and runs **`npm ci`** in the new checkout. Per **[Cursor’s worktrees docs](https://cursor.com/docs/configuration/worktrees)**, do **not** symlink `node_modules` into worktrees — use a normal install (`npm ci` here; **pnpm**/**bun** are fine if you adapt the script).

**Run the dev server** in that directory:

```bash
cd ../rsm-prototyping-feature-my-change
npm run dev
```

Vite reads `VITE_PORT` from `.env.local`, so each worktree has its own localhost preview. The script prints the exact URL.

**List and manage worktrees**:

```bash
npm run worktree:list                           # See all worktrees
npm run worktree:cleanup -- feature/my-change   # Remove a worktree and clear its port assignment
npm run worktree:remove -- ../path-to-worktree  # Raw git worktree remove passthrough
```

**How you know which preview is which**

- Browser tab title in dev includes the branch and port.
- A **dev-only** icon in the **bottom-right** of the app expands to show branch, port, and preview URL details.

**Optional port override**:

```bash
npm run worktree:create -- feature/my-change 5180
```

For an existing clone, use `vite --port 5180` or `npm run dev:port -- 5180`.

**Remove a worktree** when done:

```bash
npm run worktree:cleanup -- feature/my-change
npm run worktree:cleanup -- feature/my-change --delete-branch   # also delete the branch
npm run worktree:cleanup -- feature/my-change --delete-branch --force
```

Stop the worktree's dev server with `Ctrl-C` before cleanup. The cleanup command removes the checkout and the local port registry entry; it does not kill running processes.

### Running the Prototype
```bash
npm run dev  # Starts on http://localhost:5173 (or VITE_PORT from .env.local)
```

### Making Changes
1. Edit files in `src/`
2. Vite HMR will update automatically
3. Check browser console for errors
4. Test in different views and states

### Adding Dependencies
- Prefer using existing dependencies
- If adding WordPress packages, check React 18 compatibility
- Always use exact versions from `package.json`

### Git Commits
- Use conventional commit format: `feat:`, `fix:`, `refactor:`, `style:`
- Write descriptive commit messages
- Commit frequently to your branch

## Key Files to Reference

### For Layout Changes
- `src/layouts/RootLayout.jsx` - Overall layout structure
- `src/components/Sidebar.jsx` - Main navigation
- `src/components/Topbar.jsx` - Top strip

### For Routing
- `src/router/routes.jsx` - All route definitions
- `src/hooks/useAppState.jsx` - Shared state

### For Styling
- `src/styles/index.css` - Main CSS entry (imports all files)
- `src/styles/chrome/` - Sidebar and topbar styles
- `src/styles/views/` - View-specific styles (one file per route)
- `src/styles/canvas.css` - Canvas-area styles (toolbar, editing, inserter)
- `src/styles/utilities.css` - Shared utilities (icons, badges, scrollbars)

### For Data
- `src/data/mockData.js` - Pages, sections, site data

### For WordPress Integration
- `vite.config.js` - Build configuration
- `src/main.jsx` - WordPress component styles import

## Testing Checklist

When making changes, verify:
- [ ] Works in both collapsed and expanded sidebar states
- [ ] Works in edit mode and preview mode
- [ ] Page navigation works (back/forward buttons)
- [ ] Device switcher updates correctly
- [ ] Modals open and close properly
- [ ] Accordions expand/collapse smoothly
- [ ] Icons render correctly
- [ ] Tooltips appear on hover
- [ ] Responsive to viewport changes
- [ ] Console has no errors

## Prototype Goals & Non-Goals

### Goals
- ✅ Test UI patterns that could ship in WordPress core
- ✅ Explore simplified workflows without breaking familiar concepts
- ✅ Validate information architecture improvements
- ✅ Enable rapid iteration on interface ideas
- ✅ Provide concrete examples for WordPress core discussions
- ✅ Demonstrate progressive disclosure of complexity
- ✅ Show incremental improvement paths (not "big bang" redesigns)

### Non-Goals
- ❌ Production-ready code (focus is on UX validation)
- ❌ Real WordPress integration (yet)
- ❌ Data persistence
- ❌ Authentication/authorization
- ❌ Performance optimization
- ❌ Comprehensive error handling
- ❌ Full accessibility compliance (though avoid obvious issues)
- ❌ Testing infrastructure
- ❌ Complete redesigns that ignore WordPress conventions

## Design Philosophy When Contributing

When adding features or making changes, consider:

**1. Practical Implementation Path**
- Could this be built in WordPress core with existing infrastructure?
- Does it require new primitives or can it use existing hooks/APIs?
- What's the simplest version that would still be valuable?

**2. Respectful of WordPress Patterns**
- Does it build on concepts users already understand?
- Will it make sense to plugin/theme developers?
- Could existing sites migrate to this pattern gradually?

**3. Progressive Disclosure**
- Can advanced features be hidden until needed?
- Do common workflows stay simple?
- Is there a clear path from beginner to power user?

**4. Clear Information Architecture**
- Does grouping make logical sense?
- Are relationships between concepts evident?
- Is the nomenclature consistent with WordPress terminology?

**5. Iterative Improvement**
- Can this ship independently of other changes?
- Does it make things better without requiring perfect?
- Is the value clear even in isolation?

## Working with this Codebase

### Do's
✅ Add new views and features that test practical UI patterns
✅ Iterate quickly on designs and workflows
✅ Use WordPress components and icons for realism
✅ Keep code simple and readable (this is a prototype)
✅ Add mock data to explore edge cases and different states
✅ Commit frequently with clear messages
✅ Consider "could this actually ship in WordPress?"
✅ Build on familiar WordPress patterns
✅ Use progressive disclosure to manage complexity

### Don'ts
❌ Don't upgrade React to v19 (WordPress packages constraint)
❌ Don't add complex state management libraries
❌ Don't add CSS frameworks or preprocessors
❌ Don't worry about production optimization
❌ Don't build real backend integration
❌ Don't spend time on comprehensive error handling
❌ Don't modify Vite dedupe configuration
❌ Don't propose "start from scratch" redesigns
❌ Don't invent new WordPress concepts when existing ones work
❌ Don't ignore WordPress extensibility requirements

## AI Assistant Tips

When working with this codebase:
1. **ALWAYS ask about branching before starting new features** - This is a collaborative project
2. Always check existing patterns before creating new ones
3. Read the component you're modifying fully before making changes
4. Test changes in the browser during development
5. Keep the prototype philosophy: simple, fast iteration, explore UX
6. When in doubt, reference similar existing components
7. Commit changes incrementally as you complete features
8. Don't over-engineer - this is a prototype, not production code

### Collaboration Workflow

This prototype has multiple contributors working in parallel:
- Ask about branch strategy at the start of each session
- Push branches to remote so others can see progress
- Keep commits atomic and well-described
- Don't force push to shared branches without confirmation

# Navigation View Implementation Plan

**Project:** RSM Prototype - Solving Site Editor Complexity  
**Feature:** Navigation View (`/navigation` route)  
**Date:** 5 May 2026  
**Status:** Planning  

**⚠️ Branch Strategy:** This work will be done on a new feature branch

---

## Status

**✅ IMPLEMENTED** - Core functionality complete as of commit e926fc4

**What's Working:**
- ✅ Three-panel progressive disclosure layout
- ✅ Menu list with search, sort, and location counts
- ✅ Main menu "Primary" badge
- ✅ Menu editor with hierarchical item display
- ✅ Add items via page picker (content pages only)
- ✅ Remove items with confirmation toast
- ✅ Reorder items with up/down arrow buttons
- ✅ Create new menus via modal
- ✅ Template part usage previews with area icons
- ✅ Empty states for all panels
- ✅ All CSS following prototype patterns

**Commits:**
1. `da8d2cc` - Read-only three-panel layout (Phases 1-2)
2. `8e56b66` - Interactive menu editing (Phases 5-7)
3. `e926fc4` - Menu creation (Phase 3)

---

## Overview

This plan implements the Navigation View as specified in the Second Brain note "RSM Prototype — Navigation View Spec". The view demonstrates the **discovery + editing model** for navigation menus, helping users understand what menus they have, where those menus are used, and how to manage their contents.

**Core Concept:** Make WordPress's implicit "primary menu" concept explicit by auto-detecting the Navigation block in the Header template part and surfacing it as "Main menu" — without requiring users to understand template parts or Navigation blocks.

---

## Architecture: Three-Panel Progressive Disclosure

```
┌──────────────┬──────────────────┬──────────────────┐
│  Panel 1     │  Panel 2         │  Panel 3         │
│  Menu List   │  Menu Editor     │  Menu Previews   │
│  (always     │  (when menu      │  (when menu      │
│   visible)   │   selected)      │   selected)      │
└──────────────┴──────────────────┴──────────────────┘
```

**Panel 1 - Menu List**: All menus, location counts, search/filter, sort controls  
**Panel 2 - Menu Editor**: Selected menu's items with add/remove/reorder capabilities  
**Panel 3 - Menu Previews**: Template parts where the selected menu is used

On first load, the Main menu is auto-selected so the full three-panel view appears immediately.

---

## Phase 1: Data Model & Mock Data

### Tasks

- [ ] Define `navigationMenus` data structure in `mockData.js`
- [ ] Define `templateParts` data structure for "used in" relationships
- [ ] Add menu state to `useAppState.jsx` (or decide on local-only state)
- [ ] Update page→menu relationship in existing `pages` data

### Data Structure Questions

**Q1: Menu Data Structure**  
Proposed structure:

```js
export const navigationMenus = [
  {
    id: "main-menu",
    name: "Main menu",
    isPrimary: true,
    items: [
      { 
        id: "m1", 
        pageId: "home", 
        label: "Home", 
        children: [] 
      },
      { 
        id: "m2", 
        pageId: "about", 
        label: "About", 
        children: [
          { 
            id: "m2a", 
            pageId: "about-our-story", 
            label: "Our Story", 
            children: [] 
          }
        ]
      },
    ],
    usedIn: ["header-main", "header-promo"] // template part IDs
  },
  // ... secondary menus
]
```

**Confirm:**
- Is this shape correct?
- Should menu items store `label` separately from page name (allowing custom labels)?
- How should we handle external links (out of scope for MVP)?

**Q2: Template Parts Mock Data**  
Proposed structure:

```js
export const templateParts = [
  {
    id: "header-main",
    name: "Main header",
    area: "header", // "header" | "footer" | "sidebar" | "general"
    icon: "layout" // or derive from area?
  },
]
```

**Confirm:**
- Add explicit template parts, or infer/derive them?
- Should icon be stored or derived from area?

**Q3: Page→Menu Relationship**  
Current `pages` data has `inMenu: true/false`. Options:

- **A)** Keep as-is (just indicates "is in some menu somewhere")
- **B)** Change to array: `menuIds: ["main-menu"]` 
- **C)** Remove entirely (relationship lives only in `navigationMenus[].items[]`)

**Recommendation:** Option C (single source of truth in `navigationMenus`)

**Q4: Secondary Menu Names**  
Need 2-3 secondary menus for demonstration. Should they be:

- Footer menu
- Mobile menu  
- Social links menu
- Utility menu
- Generic "Menu 2", "Menu 3"

**Recommendation:** Footer menu + Mobile menu (realistic use cases)

---

## Phase 2: Component Structure (Read-Only View)

### Tasks

- [ ] Create `NavigationView.jsx` in `src/components/views/`
- [ ] Create `MenuList.jsx` (Panel 1 component)
- [ ] Create `MenuEditor.jsx` (Panel 2 component)
- [ ] Create `MenuPreviews.jsx` (Panel 3 component)
- [ ] Update `routes.jsx` to replace placeholder
- [ ] Add base CSS for three-panel layout in `styles/index.css`

### Component Architecture Questions

**Q5: Panel Layout Mechanics**  
When a menu is selected:

- **A)** Panels 2+3 appear simultaneously (both visible at once)
- **B)** Panel 2 appears, then Panel 3 is a section within Panel 2

**Recommendation:** Option A (simultaneous, three columns)

**Q6: Main Menu Auto-Selection**  
How should auto-selection work on first load?

- **A)** Pure component state (selected on mount, no URL change)
- **B)** URL route params (`/navigation/main-menu`)
- **C)** URL search params (`/navigation?menu=main-menu`)

**Recommendation:** Option A (simpler for prototype, no routing complexity)

**Q7: Main Menu Visual Treatment**  
How to distinguish the Main menu in Panel 1 list?

- Pin to top (always first, regardless of sort)
- Add "Primary" or "Main" badge
- Both
- Different background color

**Recommendation:** Pin to top + subtle badge

---

## Phase 3: Panel 1 - Menu List Controls

### Tasks

- [ ] Implement search input (filters menu list)
- [ ] Add sort toggle (alphabetical vs. by location count)
- [ ] Add view toggle (compact/expanded) — **OPTIONAL**
- [ ] Implement "Add menu" button + creation flow
- [ ] Style "0 locations" muted treatment
- [ ] Handle menu selection/deselection

### Interaction Questions

**Q8: "Add Menu" Flow**  
When user clicks "Add menu" button:

- **A)** Inline input appears in Panel 1 list
- **B)** Create immediately as "Untitled menu", auto-select for editing
- **C)** Modal dialog with name input
- **D)** Other approach?

**Recommendation:** Option B (fastest path, matches prototype spirit)

**Q9: View Toggle (Compact/Expanded)**  
Spec says "nice-to-have, not MVP". Should we:

- **A)** Skip it entirely
- **B)** Include UI toggle but both modes identical (future-proof)
- **C)** Implement both visual modes

**Recommendation:** Option A (skip for MVP)

**Q10: Sort Persistence**  
Should sort preference persist across sessions or reset to default?

**Recommendation:** Reset to default (simpler, less state management)

---

## Phase 4: Panel 2 - Menu Editor (Display)

### Tasks

- [ ] Display hierarchical item list with visual indentation
- [ ] Show expand/collapse toggles for items with children
- [ ] Display page icons and labels
- [ ] Add back navigation button/arrow to deselect menu
- [ ] Show empty state when menu has no items

### Display Questions

**Q11: Back Navigation Behavior**  
When user clicks back arrow in Panel 2 header:

- **A)** Deselect menu → Panels 2+3 collapse/hide
- **B)** Keep menu selected → Panels 2+3 stay visible, refocus Panel 1

**Recommendation:** Option A (clearer state transition)

**Q12: Expand/Collapse Default State**  
For items with children:

- **A)** Default all collapsed (user expands to see)
- **B)** Default all expanded (user collapses to hide)
- **C)** Remember per-menu state

**Recommendation:** Option B (show all by default)

**Q13: Maximum Nesting Depth**  
How deep should menu hierarchy go?

- 2 levels only (parent → child)
- Arbitrary depth (parent → child → grandchild...)
- Real WordPress limit (arbitrary depth)

**Recommendation:** Support arbitrary depth (mirrors WordPress), but mock data uses 2 levels max

---

## Phase 5: Panel 2 - Adding Items

### Tasks

- [ ] Add "Add item" button at bottom of item list
- [ ] Build inline page picker panel with checkboxes
- [ ] Implement bulk add (select multiple pages)
- [ ] Update menu state when items added
- [ ] Handle already-added pages in picker

### Add Items Questions

**Q14: Page Picker Scope**  
Which pages should appear in the picker?

- **A)** All pages (content, dynamic, system)
- **B)** Only content pages
- **C)** Content + select system pages (exclude 404, etc.)
- **D)** Configurable filter in picker

**Recommendation:** Option C (show useful pages, hide technical ones)

**Q15: Page Picker Organization**  
How should pages be organized in picker?

- **A)** Flat alphabetical list
- **B)** Grouped by category (Content, Dynamic, System)
- **C)** Hierarchical (parent/child relationships)
- **D)** With search/filter capability

**Recommendation:** Option A initially, Option D if time permits (search adds usability)

**Q16: Already-Added Pages**  
If a page is already in the current menu:

- **A)** Show normally (allow duplicates — real WP behavior)
- **B)** Show disabled/checked (visual indicator)
- **C)** Hide entirely (can't add duplicates)

**Recommendation:** Option B (clearer for prototype, even though WP allows duplicates)

**Q17: Add Item Panel Position**  
Where does the page picker appear?

- **A)** Expands within Panel 2 (below item list)
- **B)** Overlays Panel 2 (modal-ish positioning)
- **C)** Appears as Panel 4 to the right (extends drill-down)

**Recommendation:** Option A (inline expansion, spec says "not a modal")

---

## Phase 6: Panel 2 - Removing Items

### Tasks

- [ ] Add remove (×) button on hover for each item
- [ ] Implement remove functionality
- [ ] Handle removing parent items with children
- [ ] Show removal feedback (toast notification)

### Remove Items Questions

**Q18: Remove Parent Item Behavior**  
When removing a parent item that has children:

- **A)** Remove parent only, promote children to top level
- **B)** Remove parent and all children (cascade delete)
- **C)** Show confirmation with options

**Recommendation:** Option B with simple confirmation ("Remove [Item] and its sub-items?")

**Q19: Remove Confirmation**  
Spec says "No confirmation needed for prototype purposes":

- **A)** Undo toast notification after removal
- **B)** Just remove immediately, no feedback
- **C)** Simple toast: "Item removed" (no undo)

**Recommendation:** Option C (polish without complexity)

---

## Phase 7: Panel 2 - Reordering Items

### Tasks

- [ ] Implement reorder UI (drag handles OR arrow buttons)
- [ ] Update item order in menu state
- [ ] Handle hierarchy changes (indent/outdent)
- [ ] Visual feedback during reordering

### Reorder Questions

**Q20: Reorder Mechanism**  
Spec says drag-and-drop can be deferred:

- **A)** Up/down arrow buttons only
- **B)** Drag-and-drop with drag handles
- **C)** Both (arrows for MVP, enhance with drag later)

**Recommendation:** Option A (arrows only for MVP — faster to implement)

**Q21: Hierarchy Changes via Arrows**  
If using arrow buttons, how to handle indent/outdent?

Example structure:
```
- Home
- About
  - Our Story
  - Our Team
- Gallery
```

Options:
- **A)** Add separate ← (outdent) and → (indent) buttons
- **B)** Drag onto parent to make child (requires drag-and-drop)
- **C)** Up/down only swaps position within same level

**Recommendation:** Option C for MVP (maintain hierarchy, only reorder within level)

---

## Phase 8: Panel 3 - Menu Previews

### Tasks

- [ ] Display template parts where menu is used
- [ ] Show placeholder preview thumbnails
- [ ] Handle empty state (0 locations)
- [ ] Style area-specific icons (header/footer)

### Preview Panel Questions

**Q22: Preview Thumbnail Design**  
Spec says "simple placeholder frame with the name":

- **A)** Gray box with icon + name centered
- **B)** Browser-frame-styled box with name in header area
- **C)** Miniature wireframe suggesting layout
- **D)** Just icon + name in a card (no "preview" frame)

**Recommendation:** Option A (simple, matches "placeholder" description)

**Q23: Template Part Icons**  
Should icons be:

- **A)** Same icon for all (generic `layout` icon)
- **B)** Area-specific (header icon for headers, footer for footers)
- **C)** Custom icon per template part in mock data

**Recommendation:** Option B (semantic clarity — `header` icon, `footer` icon)

**Q24: Preview Click Behavior**  
Spec says clicking is "out of scope":

- **A)** Do nothing (no cursor change, no hover state)
- **B)** Show hover state but no action (implies future functionality)
- **C)** Show tooltip "Edit [name]" but no action

**Recommendation:** Option B (hover state suggests it will be interactive later)

---

## Phase 9: Styling & Polish

### Tasks

- [ ] Add transitions for panel show/hide
- [ ] Style muted treatment for "0 locations" menus
- [ ] Style "Primary" badge/pinned treatment for Main menu
- [ ] Create empty states for all panels
- [ ] Responsive behavior (if needed)
- [ ] Hover states, focus states, active states
- [ ] Match existing prototype visual language

### Polish Questions

**Q25: Responsive/Mobile Behavior**  
Should Navigation view support mobile?

- **A)** Desktop-only (no mobile considerations)
- **B)** Stack panels vertically on small screens
- **C)** Use drawer/overlay pattern (Panel 1 visible, others slide over)

**Recommendation:** Option A (desktop-first prototype, like other views)

**Q26: Empty States**  
Which empty states to design for:

- **Zero menus exist** (unlikely) — Panel 1
- **Selected menu has no items** — Panel 2  
- **Selected menu has 0 locations** — Panel 3 (already spec'd)

Should zero-menus state auto-create Main menu or show "Create your first menu" prompt?

**Recommendation:** Auto-create Main menu on first mount (matches "auto-creation rule" in spec)

---

## Phase 10: Integration & Testing

### Tasks

- [ ] Test all interactions end-to-end
- [ ] Verify state management works correctly
- [ ] Test edge cases (empty menus, deeply nested items, long names)
- [ ] Cross-check integration points with PagesView
- [ ] Update AGENTS.md with Navigation view patterns
- [ ] Test search/filter with various inputs
- [ ] Test with 0, 1, 3, 10 menus

### Integration Questions

**Q27: PagesView Integration**  
Current PagesView has "Menu" column showing `inMenu` boolean. Should we:

- **A)** Update to show which specific menu(s) contain the page
- **B)** Keep as-is (simple boolean indicator)
- **C)** Make it interactive (click to manage menu membership)
- **D)** Remove the column entirely (navigation is now separate view)

**Recommendation:** Option B for now (keep existing column, defer deeper integration)

**Q28: Bidirectional Workflows**  
Spec mentions "bidirectional page ↔ menu workflows". Should prototype support:

- **A)** Navigation → Pages (e.g., "Add to menu" in PagesView)
- **B)** Just Navigation view for now
- **C)** Both directions in this iteration

**Recommendation:** Option B (focused scope, defer bidirectional until Navigation view is solid)

---

## Build Order (Recommended Sequence)

### Iteration 1: Read-Only Foundation (Quickest to reviewable state)
1. Phase 1: Mock data structure
2. Phase 2: Component structure + three-panel layout
3. Phase 4: Panel 2 display (read-only item list)
4. Phase 8: Panel 3 display (read-only previews)

**Checkpoint:** Three-panel view showing menus, items, and usage locations (no editing yet)

### Iteration 2: Menu Selection & Navigation
1. Phase 3: Menu list interactions (search, sort, select menu)
2. Panel 2: Back button behavior
3. Empty states for all three panels

**Checkpoint:** Can browse menus, see details, navigate back/forth

### Iteration 3: Item Management
1. Phase 5: Add items (page picker)
2. Phase 6: Remove items
3. Phase 7: Reorder items (arrow buttons)

**Checkpoint:** Full CRUD operations on menu items

### Iteration 4: Menu Management
1. Phase 3: Create new menus
2. Delete menus (if in scope)
3. Rename menus (if in scope)

**Checkpoint:** Full menu lifecycle management

### Iteration 5: Polish
1. Phase 9: Styling, transitions, visual polish
2. Phase 10: Testing, integration checks, documentation

**Checkpoint:** Polished, complete Navigation view ready for demo

---

## Success Criteria

✅ **Discovery**: User can see all menus and understand "Main menu" is primary  
✅ **Relationship visibility**: User can see where each menu is used (template parts)  
✅ **Health signal**: "0 locations" state visible and clear  
✅ **Item management**: User can add pages to menu via bulk checkbox selection  
✅ **Item management**: User can remove items and reorder within hierarchy level  
✅ **Progressive disclosure**: Three-panel drill-down reveals complexity gradually  
✅ **Realistic scope**: Demonstrates patterns feasible in real WordPress Site Editor  

---

## Out of Scope (Deferred)

❌ External links in menus  
❌ Drag-and-drop reordering (arrows only for MVP)  
❌ Custom menu item labels different from page names  
❌ Hierarchy manipulation (indent/outdent)  
❌ Editing template parts from preview click  
❌ Bidirectional workflows with PagesView  
❌ Rename/delete menu functionality  
❌ Mobile/responsive behavior  
❌ Keyboard navigation / accessibility features  

---

## Questions Requiring Decisions (28 Total)

| Priority | # | Topic | Status |
|----------|---|-------|--------|
| 🔴 High | Q1 | Menu data structure | ⏳ Needs decision |
| 🔴 High | Q2 | Template parts mock data | ⏳ Needs decision |
| 🔴 High | Q3 | Page→menu relationship | ⏳ Needs decision |
| 🟡 Medium | Q4 | Secondary menu names | ⏳ Needs decision |
| 🔴 High | Q5 | Panel layout mechanics | ⏳ Needs decision |
| 🟢 Low | Q6 | Auto-selection URL strategy | ⏳ Needs decision |
| 🟡 Medium | Q7 | Main menu visual treatment | ⏳ Needs decision |
| 🟡 Medium | Q8 | "Add menu" flow | ⏳ Needs decision |
| 🟢 Low | Q9 | View toggle | ⏳ Needs decision |
| 🟢 Low | Q10 | Sort persistence | ⏳ Needs decision |
| 🟡 Medium | Q11 | Back button behavior | ⏳ Needs decision |
| 🟢 Low | Q12 | Expand/collapse default | ⏳ Needs decision |
| 🟢 Low | Q13 | Nesting depth | ⏳ Needs decision |
| 🟡 Medium | Q14 | Page picker scope | ⏳ Needs decision |
| 🟡 Medium | Q15 | Page picker organization | ⏳ Needs decision |
| 🟢 Low | Q16 | Already-added pages | ⏳ Needs decision |
| 🟡 Medium | Q17 | Add item panel position | ⏳ Needs decision |
| 🟡 Medium | Q18 | Remove parent behavior | ⏳ Needs decision |
| 🟢 Low | Q19 | Remove confirmation | ⏳ Needs decision |
| 🔴 High | Q20 | Reorder mechanism | ⏳ Needs decision |
| 🟡 Medium | Q21 | Hierarchy via arrows | ⏳ Needs decision |
| 🟡 Medium | Q22 | Preview thumbnail design | ⏳ Needs decision |
| 🟢 Low | Q23 | Template part icons | ⏳ Needs decision |
| 🟢 Low | Q24 | Preview click behavior | ⏳ Needs decision |
| 🟢 Low | Q25 | Responsive behavior | ⏳ Needs decision |
| 🟢 Low | Q26 | Empty states | ⏳ Needs decision |
| 🟢 Low | Q27 | PagesView integration | ⏳ Needs decision |
| 🟢 Low | Q28 | Bidirectional workflows | ⏳ Needs decision |

**Priority Key:**  
🔴 **High** = Blocks implementation start  
🟡 **Medium** = Affects UX/architecture significantly  
🟢 **Low** = Can be decided during implementation

---

## Next Steps

1. **Review this plan** with Francisco/stakeholders
2. **Resolve 🔴 High priority questions** (Q1, Q2, Q3, Q5, Q20)
3. **Create feature branch** for Navigation view work
4. **Start Iteration 1** (read-only foundation)

---

## Notes

- This plan is based on the spec in "RSM Prototype — Navigation View Spec" (Second Brain)
- Follows RSM mindset: bias toward shipping, fast decisions, avoid rabbit holes
- Designed for incremental development with clear checkpoints
- All patterns must be implementable in real WordPress Site Editor

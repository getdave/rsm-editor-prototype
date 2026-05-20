import { createContext, useCallback, useContext, useState } from 'react';
import {
  initialReadingSettings,
  navigationMenus as navigationMenusInitial,
  pageDesigns as pageDesignsData,
  pages as pagesData,
} from '../data/mockData';
import { MAIN_MENU_ID } from '../constants/navigation';
import {
  buildDefaultNavLayout,
  buildVisibleAdminNavItems,
} from '../constants/adminNav';
import {
  appendTopLevelPageIfMissing,
  removeItemsByPageId,
  removePageFromAllMenus,
} from '../utils/mainMenuTree';

/** Mirrors WP Reading settings — homepage displays latest posts vs static page */
export const READING_DISPLAY_LATEST = 'latest';
export const READING_DISPLAY_STATIC = 'static';

const AppStateContext = createContext(null);

/**
 * Reconcile a nav layout against the current base item set: drop item entries
 * no longer in the base set, append base items missing from the layout. Section
 * headings are always preserved.
 */
function reconcileNavLayout(layout, baseIds) {
  const presentIds = new Set(
    layout.filter((entry) => entry.kind === 'item').map((entry) => entry.id),
  );
  const filtered = layout.filter(
    (entry) => entry.kind === 'section' || baseIds.has(entry.id),
  );
  const missing = [...baseIds].filter((id) => !presentIds.has(id));
  if (missing.length === 0 && filtered.length === layout.length) {
    return layout;
  }
  return [
    ...filtered,
    ...missing.map((id) => ({ kind: 'item', id, hidden: false })),
  ];
}

/** Move a layout entry from one index to another (flat reorder). */
function moveLayoutEntry(layout, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= layout.length ||
    toIndex >= layout.length
  ) {
    return layout;
  }
  const next = [...layout];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Delete a section heading. Its member items (the contiguous item entries that
 * follow it until the next heading) are released back to their default-order
 * positions among the remaining items.
 */
function deleteSectionFromLayout(layout, sectionId, defaultLayout) {
  const idx = layout.findIndex(
    (entry) => entry.kind === 'section' && entry.id === sectionId,
  );
  if (idx === -1) {
    return layout;
  }
  let end = idx + 1;
  while (end < layout.length && layout[end].kind === 'item') {
    end += 1;
  }
  const members = layout.slice(idx + 1, end);
  const without = [...layout.slice(0, idx), ...layout.slice(end)];

  const defaultOrder = new Map(defaultLayout.map((entry, i) => [entry.id, i]));
  for (const member of members) {
    const memberRank = defaultOrder.get(member.id) ?? Infinity;
    let insertAt = without.length;
    for (let i = 0; i < without.length; i += 1) {
      const entry = without[i];
      if (
        entry.kind === 'item' &&
        (defaultOrder.get(entry.id) ?? Infinity) > memberRank
      ) {
        insertAt = i;
        break;
      }
    }
    without.splice(insertAt, 0, member);
  }
  return without;
}

export function AppStateProvider({ children }) {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sidebar customizer — in-place edit mode for the main admin nav. `navLayout`
  // is a flat, ordered array of { kind: 'item', id, hidden } and
  // { kind: 'section', id, label } entries that drives both the normal sidebar
  // render and the editor. In-memory only (resets on reload).
  const [navEditMode, setNavEditMode] = useState(false);
  const [navLayout, setNavLayout] = useState(() =>
    buildDefaultNavLayout(initialReadingSettings.homepageDisplayMode),
  );

  // Pages state (mutable for adding new pages and renames in the editor)
  const [pages, setPages] = useState(pagesData);

  const [navigationMenus, setNavigationMenus] = useState(navigationMenusInitial);

  // Contextual page-design targets (template-backed surfaces surfaced by intent).
  // These are static mock records, so read them directly to avoid stale HMR state.
  const pageDesigns = pageDesignsData;

  // Current page
  const [currentPage, setCurrentPage] = useState(pages[0]); // Home page

  // Homepage configuration. Kept global so Home, Pages, and Content all resolve
  // the same front-page/posts-page state.
  const [homepageDisplayMode, setHomepageDisplayModeRaw] = useState(
    initialReadingSettings.homepageDisplayMode,
  );
  const [frontPageId, setFrontPageId] = useState(
    initialReadingSettings.frontPageId,
  );
  const [postsPageId, setPostsPageId] = useState(
    initialReadingSettings.postsPageId,
  );

  // Where the user came from when entering the Block Editor — drives the
  // split-Exit button label/destination. null when not inside the editor.
  const [editorReferrer, setEditorReferrer] = useState(null);

  // Recently edited pages — used by the Exit popover's "Recent documents"
  // group. Most-recent first, deduplicated, capped at 3.
  const [recentPages, setRecentPages] = useState([]);

  // When true (only inside the editor), the chrome sidebar expands back to
  // full width and the Block Editor slides off-screen to the right.
  const [menuExpanded, setMenuExpanded] = useState(false);
  
  // Site identity
  const [siteTitle, setSiteTitle] = useState('My Photography Site');
  
  // Modal state
  const [siteIdentityModalOpen, setSiteIdentityModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [addPageModalOpen, setAddPageModalOpen] = useState(false);
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);

  // Site visibility status — drives the header indicator dot.
  const [siteStatus] = useState('live');
  
  // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  // Site settings (mirrors WP General Settings — backs the DataForm in the
  // Settings modal so prototype edits round-trip until a refresh).
  const [siteSettings, setSiteSettings] = useState({
    tagline: '',
    siteIcon: '',
    wpAddress: 'https://pistachio-paradise.mystagingwebsite.com',
    siteAddress: 'https://pistachio-paradise.mystagingwebsite.com',
    adminEmail: 'francisco.vera@automattic.com',
    membership: false,
    defaultRole: 'subscriber',
    siteLanguage: 'en_US',
    timezone: 'UTC+0',
    dateFormat: 'F j, Y',
    timeFormat: 'g:i a',
    weekStartsOn: 'monday',
  });

  // Save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Device preview state
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  
  // Pages view mode (list/grid)
  const [pagesViewMode, setPagesViewMode] = useState('grid');

  // Block Editor: List View panel and block inspector sidebar (WordPress-style)
  const [listViewOpen, setListViewOpen] = useState(false);
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false);

  const toggleListView = () => {
    setListViewOpen((prev) => !prev);
  };

  const toggleSettingsSidebar = () => {
    setSettingsSidebarOpen((prev) => !prev);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Setting the homepage display mode can change the base nav set (Posts
  // appears/disappears), so reconcile navLayout in the same handler: drop
  // entries no longer in the base set and append newly-available base items.
  // Sections are always preserved. Done at event time (not in an effect).
  const setHomepageDisplayMode = useCallback((next) => {
    setHomepageDisplayModeRaw(next);
    const resolved = typeof next === 'function' ? null : next;
    if (resolved == null) {
      return;
    }
    const baseIds = new Set(
      buildVisibleAdminNavItems(resolved).map((item) => item.id),
    );
    setNavLayout((prev) => reconcileNavLayout(prev, baseIds));
  }, []);

  const enterNavEditMode = () => setNavEditMode(true);
  const exitNavEditMode = () => setNavEditMode(false);

  const toggleNavItemVisibility = (id) => {
    setNavLayout((prev) =>
      prev.map((entry) =>
        entry.kind === 'item' && entry.id === id
          ? { ...entry, hidden: !entry.hidden }
          : entry,
      ),
    );
  };

  const reorderNavLayout = (fromIndex, toIndex) => {
    setNavLayout((prev) => moveLayoutEntry(prev, fromIndex, toIndex));
  };

  const addNavSection = () => {
    setNavLayout((prev) => [
      ...prev,
      { kind: 'section', id: `section-${Date.now()}`, label: 'New section' },
    ]);
  };

  const renameNavSection = (id, label) => {
    setNavLayout((prev) =>
      prev.map((entry) =>
        entry.kind === 'section' && entry.id === id
          ? { ...entry, label }
          : entry,
      ),
    );
  };

  const deleteNavSection = (id) => {
    setNavLayout((prev) =>
      deleteSectionFromLayout(
        prev,
        id,
        buildDefaultNavLayout(homepageDisplayMode),
      ),
    );
  };

  const openSiteIdentityModal = () => {
    setSiteIdentityModalOpen(true);
  };

  const closeSiteIdentityModal = () => {
    setSiteIdentityModalOpen(false);
  };

  const openSettingsModal = () => {
    setSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setSettingsModalOpen(false);
  };

  const openCommandPalette = () => {
    setCommandPaletteOpen(true);
  };

  const closeCommandPalette = () => {
    setCommandPaletteOpen(false);
  };

  const openAddPageModal = () => {
    setAddPageModalOpen(true);
  };

  const closeAddPageModal = () => {
    setAddPageModalOpen(false);
  };

  const openUnsavedChangesModal = () => {
    setUnsavedChangesModalOpen(true);
  };

  const closeUnsavedChangesModal = () => {
    setUnsavedChangesModalOpen(false);
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
  };

  const dismissSnackbar = () => {
    setSnackbarMessage(null);
  };

  const addPage = (newPage) => {
    setPages(prev => [...prev, newPage]);
  };

  const deletePage = (pageId) => {
    setNavigationMenus((prev) => removePageFromAllMenus(prev, pageId));
    setPages((prev) => {
      const next = prev.filter((p) => p.id !== pageId);
      setCurrentPage((cur) => {
        if (!cur || cur.id !== pageId) return cur;
        const fallback =
          next.find((p) => p.category === 'content') ?? next[0] ?? null;
        return fallback;
      });
      return next;
    });
    setRecentPages((prev) => prev.filter((p) => p.id !== pageId));
  };

  /** Keeps `pages[].isFrontPage` / `isPostsPage` aligned with Reading-style ids (prototype only). */
  const syncReadingPageMarkers = useCallback((frontId, postsId) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.category !== "content") return p;
        const next = { ...p };
        if (frontId && p.id === frontId) next.isFrontPage = true;
        else delete next.isFrontPage;
        if (postsId && p.id === postsId) next.isPostsPage = true;
        else delete next.isPostsPage;
        return next;
      }),
    );
  }, []);

  const addPageToMainMenu = (page) => {
    if (!page?.id) return;
    setNavigationMenus((prev) =>
      prev.map((menu) =>
        menu.id === MAIN_MENU_ID
          ? {
              ...menu,
              items: appendTopLevelPageIfMissing(menu.items || [], page),
            }
          : menu,
      ),
    );
    setPages((list) =>
      list.map((p) => (p.id === page.id ? { ...p, inMenu: true } : p)),
    );
  };

  const removePageFromMainMenu = (pageId) => {
    if (!pageId) return;
    setNavigationMenus((prev) =>
      prev.map((menu) =>
        menu.id === MAIN_MENU_ID
          ? {
              ...menu,
              items: removeItemsByPageId(menu.items || [], pageId),
            }
          : menu,
      ),
    );
    setPages((list) =>
      list.map((p) => (p.id === pageId ? { ...p, inMenu: false } : p)),
    );
  };

  const markDirty = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const save = () => {
    setHasUnsavedChanges(false);
    // Actual save logic would go here
  };

  const setCurrentPageName = (name) => {
    setCurrentPage((p) => ({ ...p, name }));
    setPages((list) => list.map((p) => (p.id === currentPage.id ? { ...p, name } : p)));
  };

  const setPageStatus = (pageId, status) => {
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, status } : p)),
    );
    setCurrentPage((cur) =>
      cur && cur.id === pageId ? { ...cur, status } : cur,
    );
  };

  const activateCollectionTemplate = (pageId) => {
    const sourcePage = pages.find((p) => p.id === pageId);
    const activatedPage = sourcePage ? { ...sourcePage } : null;
    if (activatedPage) {
      delete activatedPage.collectionState;
      activatedPage.authorDisplay = 'John Doe';
    }

    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        const activePage = { ...p };
        delete activePage.collectionState;
        activePage.authorDisplay = 'John Doe';
        return activePage;
      }),
    );
    setCurrentPage((cur) => {
      if (!cur || cur.id !== pageId) return cur;
      const activePage = { ...cur };
      delete activePage.collectionState;
      activePage.authorDisplay = 'John Doe';
      return activePage;
    });
    return activatedPage;
  };

  // Wrap setCurrentPage so picking a page also lands it in the recents
  // list. Stable insertion order with FIFO eviction:
  //   - First time a page is opened, it joins at position 1 (top).
  //   - Existing entries shift down; cap at 6 evicts the bottom entry.
  //   - Re-visiting a page already in the list does NOT change order, so
  //     positions stay predictable as the user hops between docs.
  const selectPage = (page) => {
    if (!page) return;
    setCurrentPage(page);
    setRecentPages((prev) => {
      if (prev.some((p) => p.id === page.id)) return prev;
      return [page, ...prev].slice(0, 6);
    });
  };

  const toggleMenuExpanded = () => {
    setMenuExpanded((prev) => !prev);
  };

  const value = {
    // Sidebar state
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,

    // Sidebar customizer
    navEditMode,
    enterNavEditMode,
    exitNavEditMode,
    navLayout,
    toggleNavItemVisibility,
    reorderNavLayout,
    addNavSection,
    renameNavSection,
    deleteNavSection,

    // Pages state
    pages,
    addPage,
    setPageStatus,
    deletePage,
    syncReadingPageMarkers,
    activateCollectionTemplate,
    addPageToMainMenu,
    removePageFromMainMenu,

    // Navigation menus (shared with Navigation screen + main-menu actions from Pages)
    navigationMenus,
    setNavigationMenus,

    // Contextual page-design targets
    pageDesigns,

    // Homepage configuration
    homepageDisplayMode,
    setHomepageDisplayMode,
    frontPageId,
    setFrontPageId,
    postsPageId,
    setPostsPageId,

    // Current page
    currentPage,
    setCurrentPage,
    selectPage,
    setCurrentPageName,

    // Editor referrer (set by RootLayout)
    editorReferrer,
    setEditorReferrer,

    // Recent docs
    recentPages,

    // Menu-expanded state for in-editor chrome sidebar
    menuExpanded,
    setMenuExpanded,
    toggleMenuExpanded,
    
    // Site identity
    siteTitle,
    setSiteTitle,
    
    // Modal state
    siteIdentityModalOpen,
    openSiteIdentityModal,
    closeSiteIdentityModal,
    settingsModalOpen,
    openSettingsModal,
    closeSettingsModal,
    commandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    addPageModalOpen,
    openAddPageModal,
    closeAddPageModal,
    unsavedChangesModalOpen,
    openUnsavedChangesModal,
    closeUnsavedChangesModal,

    // Site status
    siteStatus,

    // Snackbar state
    snackbarMessage,
    showSnackbar,
    dismissSnackbar,

    // Site settings
    siteSettings,
    setSiteSettings,

    // Save state
    hasUnsavedChanges,
    markDirty,
    save,
    
    // Device preview state
    selectedDevice,
    setSelectedDevice,
    
    // Pages view mode
    pagesViewMode,
    setPagesViewMode,

    // Block Editor panels
    listViewOpen,
    setListViewOpen,
    toggleListView,
    settingsSidebarOpen,
    setSettingsSidebarOpen,
    toggleSettingsSidebar,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- app state hook intentionally lives beside its provider in this prototype.
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}

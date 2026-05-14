import { createContext, useContext, useState } from 'react';
import { pages as pagesData } from '../data/mockData';

/** Mirrors WP Reading settings — homepage displays latest posts vs static page */
export const READING_DISPLAY_LATEST = 'latest';
export const READING_DISPLAY_STATIC = 'static';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pages state (mutable for adding new pages and renames in the editor)
  const [pages, setPages] = useState(pagesData);

  // Current page
  const [currentPage, setCurrentPage] = useState(pages[0]); // Home page

  // Where the user came from when entering the edit canvas — drives the
  // split-Exit button label/destination. null when not inside the editor.
  const [editorReferrer, setEditorReferrer] = useState(null);

  // Recently edited pages — used by the Exit popover's "Recent documents"
  // group. Most-recent first, deduplicated, capped at 3.
  const [recentPages, setRecentPages] = useState([]);

  // When true (only inside the editor), the chrome sidebar expands back to
  // full width and the canvas slides off-screen to the right.
  const [menuExpanded, setMenuExpanded] = useState(false);
  
  // Site identity
  const [siteTitle, setSiteTitle] = useState('My Photography Site');
  
  // Modal state
  const [siteIdentityModalOpen, setSiteIdentityModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [addPageModalOpen, setAddPageModalOpen] = useState(false);

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

  // Reading / homepage (Configure homepage in Pages — drives Posts nav visibility)
  const [homepageDisplayMode, setHomepageDisplayMode] = useState(
    READING_DISPLAY_STATIC,
  );
  const [frontPageId, setFrontPageId] = useState(
    () => pagesData.find((p) => p.isFrontPage)?.id ?? 'home',
  );
  const [postsPageId, setPostsPageId] = useState(
    () => pagesData.find((p) => p.isPostsPage)?.id ?? 'blog',
  );

  // Edit canvas: List View panel and block inspector sidebar (WordPress-style)
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

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
  };

  const dismissSnackbar = () => {
    setSnackbarMessage(null);
  };

  const addPage = (newPage) => {
    setPages(prev => [...prev, newPage]);
  };

  const markDirty = () => {
    setHasUnsavedChanges(true);
  };

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

    // Pages state
    pages,
    addPage,
    setPageStatus,

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

    // Reading / homepage
    homepageDisplayMode,
    setHomepageDisplayMode,
    frontPageId,
    setFrontPageId,
    postsPageId,
    setPostsPageId,

    // Edit canvas panels
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

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}

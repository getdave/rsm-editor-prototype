import { createContext, useContext, useState } from 'react';
import { pages } from '../data/mockData';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Current page
  const [currentPage, setCurrentPage] = useState(pages[0]); // Home page
  
  // Site identity
  const [siteTitle, setSiteTitle] = useState('My Photography Site');
  
  // Modal state
  const [siteIdentityModalOpen, setSiteIdentityModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // User identity (display only — no auth wired yet)
  const [userName] = useState('Fran');

  // Site visibility status — drives the header indicator dot.
  const [siteStatus] = useState('live');

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

  const markDirty = () => {
    setHasUnsavedChanges(true);
  };

  const save = () => {
    setHasUnsavedChanges(false);
    // Actual save logic would go here
  };

  const value = {
    // Sidebar state
    sidebarCollapsed,
    toggleSidebar,
    
    // Current page
    currentPage,
    setCurrentPage,
    
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

    // User identity
    userName,

    // Site status
    siteStatus,

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
    setPagesViewMode
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

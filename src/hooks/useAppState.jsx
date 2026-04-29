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
  
  // Save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Device preview state
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  
  // Pages view mode (list/grid)
  const [pagesViewMode, setPagesViewMode] = useState('list');

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const openSiteIdentityModal = () => {
    setSiteIdentityModalOpen(true);
  };

  const closeSiteIdentityModal = () => {
    setSiteIdentityModalOpen(false);
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

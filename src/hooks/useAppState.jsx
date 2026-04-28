import { createContext, useContext, useState, useEffect } from 'react';
import { pages } from '../data/mockData';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  // View state
  const [currentView, setCurrentView] = useState('preview');
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Current page
  const [currentPage, setCurrentPage] = useState(pages[0]); // Home page
  
  // Modal state
  const [siteIdentityModalOpen, setSiteIdentityModalOpen] = useState(false);
  
  // Save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-collapse sidebar when entering editing mode
  useEffect(() => {
    if (currentView === 'editing' || currentView === 'inserter') {
      if (!sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    } else {
      // Auto-expand when returning to managing mode
      if (sidebarCollapsed) {
        setSidebarCollapsed(false);
      }
    }
  }, [currentView]);

  // Update unsaved changes when entering editing mode
  useEffect(() => {
    if (currentView === 'editing' || currentView === 'inserter') {
      setHasUnsavedChanges(true);
    }
  }, [currentView]);

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

  const goToView = (view) => {
    setCurrentView(view);
  };

  const value = {
    // View state
    currentView,
    setCurrentView: goToView,
    
    // Sidebar state
    sidebarCollapsed,
    toggleSidebar,
    
    // Current page
    currentPage,
    setCurrentPage,
    
    // Modal state
    siteIdentityModalOpen,
    openSiteIdentityModal,
    closeSiteIdentityModal,
    
    // Save state
    hasUnsavedChanges,
    markDirty,
    save
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

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import Sidebar from '../components/Sidebar';
import SiteIdentityModal from '../components/modals/SiteIdentityModal';
import SettingsModal from '../components/modals/SettingsModal';
import PagesFloatingPanel from '../components/modals/PagesFloatingPanel';

function RootLayout() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppState();

  // Auto-collapse sidebar when entering edit mode
  useEffect(() => {
    const isEditRoute = location.pathname.includes('/edit');
    
    if (isEditRoute && !sidebarCollapsed) {
      // Collapse sidebar when entering edit mode
      toggleSidebar();
    } else if (!isEditRoute && sidebarCollapsed) {
      // Expand sidebar when leaving edit mode
      toggleSidebar();
    }
  }, [location.pathname]);

  return (
    <>
      <div className="body">
        <Sidebar />
        <main className="main">
          <Outlet />
        </main>
      </div>
      <SiteIdentityModal />
      <SettingsModal />
      <PagesFloatingPanel />
    </>
  );
}

export default RootLayout;

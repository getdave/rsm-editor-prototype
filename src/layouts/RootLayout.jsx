import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Snackbar } from '@wordpress/components';
import { useAppState } from '../hooks/useAppState';
import Sidebar from '../components/Sidebar';
import SiteEditorHeader from '../components/SiteEditorHeader';
import CommandPalette from '../components/CommandPalette';
import SiteIdentityModal from '../components/modals/SiteIdentityModal';
import SettingsModal from '../components/modals/SettingsModal';
import AddPageModal from '../components/modals/AddPageModal';
import PagesFloatingPanel from '../components/modals/PagesFloatingPanel';

const EDIT_ROUTE_PATTERN = /\/pages\/[^/]+\/edit$/;

function RootLayout() {
  const location = useLocation();
  const {
    sidebarCollapsed,
    toggleSidebar,
    snackbarMessage,
    dismissSnackbar,
    setEditorReferrer,
  } = useAppState();

  const isEditCanvas = EDIT_ROUTE_PATTERN.test(location.pathname);
  const prevPathRef = useRef(location.pathname);

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

  // Capture the route the user was on before entering the edit canvas so the
  // split-Exit button knows where to take them back. Cleared on exit.
  useEffect(() => {
    const isEdit = EDIT_ROUTE_PATTERN.test(location.pathname);
    const wasEdit = EDIT_ROUTE_PATTERN.test(prevPathRef.current);
    if (isEdit && !wasEdit) {
      setEditorReferrer(prevPathRef.current);
    } else if (!isEdit) {
      setEditorReferrer(null);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <>
      {!isEditCanvas && <SiteEditorHeader />}
      <div className="body">
        {!isEditCanvas && <Sidebar />}
        <main className="main">
          <Outlet />
        </main>
      </div>
      <SiteIdentityModal />
      <SettingsModal />
      <AddPageModal />
      <PagesFloatingPanel />
      <CommandPalette />
      {snackbarMessage && (
        <Snackbar onDismiss={dismissSnackbar}>
          {snackbarMessage}
        </Snackbar>
      )}
    </>
  );
}

export default RootLayout;

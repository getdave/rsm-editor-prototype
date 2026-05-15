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
import UnsavedChangesModal from '../components/modals/UnsavedChangesModal';
import DevBranchIndicator from '../components/shared/DevBranchIndicator';

const EDIT_ROUTE_PATTERN = /\/pages\/[^/]+\/edit$/;

function RootLayout() {
  const location = useLocation();
  const {
    snackbarMessage,
    dismissSnackbar,
    setSidebarCollapsed,
    setEditorReferrer,
    setMenuExpanded,
    menuExpanded,
    markDirty,
  } = useAppState();

  const isEditCanvas = EDIT_ROUTE_PATTERN.test(location.pathname);
  const prevPathRef = useRef(location.pathname);

  // Collapse the chrome sidebar to its narrow 48px form when entering the
  // editor; expand it back when leaving. Idempotent so React StrictMode's
  // double-fire in dev doesn't flip the state twice. Always reset
  // menu-expanded on route change so navigating between recent docs (or
  // exiting the editor) closes the menu cleanly.
  useEffect(() => {
    const isEdit = EDIT_ROUTE_PATTERN.test(location.pathname);
    setSidebarCollapsed(isEdit);
    setMenuExpanded(false);
  }, [location.pathname]);

  // Capture the route the user was on before entering the edit canvas so the
  // split-Exit button knows where to take them back. Cleared on exit. Also
  // marks the prototype dirty on entry — entering the editor implies the
  // user is about to make changes, which enables both Save buttons.
  useEffect(() => {
    const isEdit = EDIT_ROUTE_PATTERN.test(location.pathname);
    const wasEdit = EDIT_ROUTE_PATTERN.test(prevPathRef.current);
    if (isEdit && !wasEdit) {
      setEditorReferrer(prevPathRef.current);
      markDirty();
    } else if (!isEdit) {
      setEditorReferrer(null);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <>
      <div className={`app-shell ${isEditCanvas ? 'is-edit-canvas' : ''} ${menuExpanded ? 'is-menu-expanded' : ''}`}>
        <SiteEditorHeader />
        <div className="body">
          <Sidebar />
          <main className="main">
            <Outlet />
          </main>
        </div>
      </div>
      <SiteIdentityModal />
      <SettingsModal />
      <AddPageModal />
      <PagesFloatingPanel />
      <UnsavedChangesModal />
      <CommandPalette />
      {snackbarMessage && (
        <Snackbar onDismiss={dismissSnackbar}>
          {snackbarMessage}
        </Snackbar>
      )}
      <DevBranchIndicator />
    </>
  );
}

export default RootLayout;

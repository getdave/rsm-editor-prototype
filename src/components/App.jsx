import { AppStateProvider, useAppState } from '../hooks/useAppState';
import { Button } from '@wordpress/components';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import PreviewView from './views/PreviewView';
import PagesView from './views/PagesView';
import EditingView from './views/EditingView';
import SiteIdentityModal from './modals/SiteIdentityModal';
import PagesFloatingPanel from './modals/PagesFloatingPanel';
import { chevronLeft, chevronRight } from '@wordpress/icons';

function AppContent() {
  const { currentView, sidebarCollapsed, toggleSidebar } = useAppState();

  return (
    <>
      <Topbar />
      <div className="body">
        <Sidebar />
        {/* Floating sidebar toggle */}
        <Button 
          className="sidebar-toggle" 
          onClick={toggleSidebar}
          icon={sidebarCollapsed ? chevronRight : chevronLeft}
          iconSize={20}
        />
        <main className="main">
          {currentView === 'preview' && <PreviewView />}
          {currentView === 'pages' && <PagesView />}
          {(currentView === 'editing' || currentView === 'inserter') && <EditingView />}
        </main>
      </div>
      <SiteIdentityModal />
      <PagesFloatingPanel />
    </>
  );
}

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;

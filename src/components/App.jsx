import { AppStateProvider, useAppState } from '../hooks/useAppState';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import PreviewView from './views/PreviewView';
import PagesView from './views/PagesView';
import EditingView from './views/EditingView';
import SiteIdentityModal from './modals/SiteIdentityModal';
import PagesFloatingPanel from './modals/PagesFloatingPanel';

function AppContent() {
  const { currentView, sidebarCollapsed, toggleSidebar } = useAppState();

  const icons = {
    chevronLeft: 'M14.6 7l-1.2-1L8 12l5.4 6 1.2-1-4.6-5z',
    chevronRight: 'M10.6 6L9.4 7l4.6 5-4.6 5 1.2 1 5.4-6z'
  };

  const WPIcon = ({ path, ...props }) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d={path} />
    </svg>
  );

  return (
    <>
      <Topbar />
      <div className="body">
        <Sidebar />
        {/* Floating sidebar toggle */}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <WPIcon 
            path={sidebarCollapsed ? icons.chevronRight : icons.chevronLeft} 
            style={{ width: 12, height: 12, fill: 'currentColor' }} 
          />
        </button>
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

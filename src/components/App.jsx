import { AppStateProvider, useAppState } from '../hooks/useAppState';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import PreviewView from './views/PreviewView';
import PagesView from './views/PagesView';
import EditingView from './views/EditingView';
import SiteIdentityModal from './modals/SiteIdentityModal';
import PagesFloatingPanel from './modals/PagesFloatingPanel';

function AppContent() {
  const { currentView } = useAppState();

  return (
    <>
      <Topbar />
      <div className="body">
        <Sidebar />
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

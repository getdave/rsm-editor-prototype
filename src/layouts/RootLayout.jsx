import { Outlet } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import SiteIdentityModal from '../components/modals/SiteIdentityModal';
import PagesFloatingPanel from '../components/modals/PagesFloatingPanel';

function RootLayout() {
  return (
    <>
      <Topbar />
      <div className="body">
        <Sidebar />
        <main className="main">
          <Outlet />
        </main>
      </div>
      <SiteIdentityModal />
      <PagesFloatingPanel />
    </>
  );
}

export default RootLayout;

import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import PreviewView from '../components/views/PreviewView';
import PagesView from '../components/views/PagesView';
import EditingView from '../components/views/EditingView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <PreviewView /> },
      { path: 'pages', element: <PagesView /> },
      { path: 'pages/:pageId/edit', element: <EditingView /> },
      { path: 'templates', element: <div style={{ padding: '20px' }}>Templates view coming soon</div> },
      { path: 'posts', element: <div style={{ padding: '20px' }}>Posts view coming soon</div> },
      { path: 'navigation', element: <div style={{ padding: '24px', maxWidth: '520px', lineHeight: 1.5 }}><strong>Navigation</strong> (coming soon)&nbsp;— drag pages into your <strong>Main Menu</strong> and manage additional menus. Assigned pages match the <strong>Menu</strong> column on the Pages screen.</div> },
      { path: 'media', element: <div style={{ padding: '20px' }}>Media view coming soon</div> },
      { path: 'design', element: <div style={{ padding: '20px' }}>Design view coming soon</div> },
      { path: 'plugins', element: <div style={{ padding: '20px' }}>Plugins view coming soon</div> },
    ],
  },
]);

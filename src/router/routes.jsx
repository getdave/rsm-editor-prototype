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
      { path: 'posts', element: <div style={{ padding: '20px' }}>Posts view coming soon</div> },
      { path: 'media', element: <div style={{ padding: '20px' }}>Media view coming soon</div> },
      { path: 'design', element: <div style={{ padding: '20px' }}>Design view coming soon</div> },
      { path: 'plugins', element: <div style={{ padding: '20px' }}>Plugins view coming soon</div> },
    ],
  },
]);

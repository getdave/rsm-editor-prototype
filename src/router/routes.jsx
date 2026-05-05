import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import PreviewView from '../components/views/PreviewView';
import PagesView from '../components/views/PagesView';
import EditingView from '../components/views/EditingView';
import StylesView from '../components/views/StylesView';
import VariationsPanel from '../components/views/styles/VariationsPanel';
import ColorsPanel from '../components/views/styles/ColorsPanel';
import TypographyPanel from '../components/views/styles/TypographyPanel';
import BackgroundPanel from '../components/views/styles/BackgroundPanel';
import ShadowsPanel from '../components/views/styles/ShadowsPanel';
import LayoutPanel from '../components/views/styles/LayoutPanel';
import ThemesInstalledView from '../components/views/ThemesInstalledView';
import ThemesBrowseView from '../components/views/ThemesBrowseView';

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
      {
        path: 'design',
        children: [
          { index: true, element: <Navigate to="styles" replace /> },
          {
            path: 'styles',
            element: <StylesView />,
            children: [
              { index: true, element: <VariationsPanel /> },
              { path: 'colors', element: <ColorsPanel /> },
              { path: 'typography', element: <TypographyPanel /> },
              { path: 'background', element: <BackgroundPanel /> },
              { path: 'shadows', element: <ShadowsPanel /> },
              { path: 'layout', element: <LayoutPanel /> },
            ],
          },
          {
            path: 'themes',
            children: [
              { index: true, element: <Navigate to="installed" replace /> },
              { path: 'installed', element: <ThemesInstalledView /> },
              { path: 'browse', element: <ThemesBrowseView /> },
            ],
          },
        ],
      },
      { path: 'plugins', element: <div style={{ padding: '20px' }}>Plugins view coming soon</div> },
    ],
  },
]);

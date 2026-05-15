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
import NavigationView from '../components/views/NavigationView';
import PlaceholderAdminView from '../components/views/PlaceholderAdminView';

import PostsRouteGate from './PostsRouteGate';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <PreviewView /> },
      { path: 'pages', element: <PagesView /> },
      { path: 'pages/static', element: <PagesView /> },
      { path: 'pages/collections', element: <PagesView /> },
      { path: 'pages/:pageId/edit', element: <EditingView /> },
      {
        path: 'templates',
        element: (
          <PlaceholderAdminView
            title="Templates"
            description="Templates view coming soon."
          />
        ),
      },
      { path: 'posts', element: <PostsRouteGate /> },
      { path: 'navigation', element: <NavigationView /> },
      {
        path: 'patterns',
        element: (
          <PlaceholderAdminView
            title="Patterns"
            description="Patterns view coming soon."
          />
        ),
      },
      {
        path: 'media',
        element: (
          <PlaceholderAdminView
            title="Media"
            description="Media view coming soon."
          />
        ),
      },
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
      {
        path: 'plugins',
        element: (
          <PlaceholderAdminView
            title="Plugins"
            description="Plugins view coming soon."
          />
        ),
      },
    ],
  },
]);

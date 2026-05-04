import { Fragment, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { Tooltip } from '@wordpress/components';
import {
  home,
  page as pageIcon,
  postList,
  navigation,
  styles,
  settings,
  chevronRight,
  chevronLeft,
  chevronUp,
  chevronDown,
  wordpress,
  brush,
  color,
} from '@wordpress/icons';

const ADMIN_NAV_ITEMS = [
  { kind: 'item', id: 'home', icon: home, label: 'Home', path: '/', tip: "View your site's home page" },
  { kind: 'item', id: 'posts', icon: postList, label: 'Posts', path: '/posts', tip: 'Manage Posts on your site' },
  { kind: 'item', id: 'pages', icon: pageIcon, label: 'Pages', path: '/pages', tip: "View your site's Pages" },
  { kind: 'item', id: 'navigation', icon: navigation, label: 'Navigation', path: '/navigation', tip: 'Assign pages to your Main Menu and manage other menus' },
  { kind: 'item', id: 'design', icon: styles, label: 'Design', path: '/design', tip: 'Modify your site design and styling', chevron: true },
];

const DESIGN_NAV_ITEMS = [
  { kind: 'back', id: 'back', icon: chevronLeft, label: 'Back', path: '/', tip: 'Back to admin' },
  { kind: 'header', id: 'design-header', title: 'Design', description: 'Customize the styles of your whole site' },
  {
    kind: 'group',
    id: 'styles-group',
    items: [
      { kind: 'item', id: 'styles', icon: styles, label: 'Styles', path: '/design/styles', tip: 'Site-wide styles' },
    ],
  },
  {
    kind: 'group',
    id: 'themes-group',
    items: [
      { kind: 'group-parent', id: 'themes-parent', icon: brush, label: 'Themes', tip: 'Themes' },
      { kind: 'group-child', id: 'themes-installed', label: 'Installed', path: '/design/themes/installed' },
      { kind: 'group-child-last', id: 'themes-browse', label: 'Browse', path: '/design/themes/browse' },
    ],
  },
  {
    kind: 'group',
    id: 'style-elements-group',
    items: [
      { kind: 'group-parent', id: 'style-elements-parent', icon: color, label: 'Style elements', tip: 'Style elements' },
      { kind: 'group-child', id: 'colors', label: 'Colors', href: '#' },
      { kind: 'group-child', id: 'fonts', label: 'Fonts', href: '#' },
      { kind: 'group-child', id: 'background', label: 'Background', href: '#' },
      { kind: 'group-child', id: 'shadows', label: 'Shadows', href: '#' },
      { kind: 'group-child-last', id: 'layout', label: 'Layout', href: '#' },
    ],
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed } = useAppState();
  const isDesignSection = location.pathname.startsWith('/design');
  const [collapsedGroups, setCollapsedGroups] = useState({
    'themes-group': true,
    'style-elements-group': true,
  });

  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isItemActive = (itemPath) => {
    if (!itemPath) return false;
    if (itemPath === '/') {
      return !isDesignSection && (location.pathname === '/' || location.pathname.includes('/edit'));
    }
    if (itemPath === '/design') {
      return location.pathname.startsWith('/design');
    }
    return location.pathname === itemPath;
  };

  const renderItem = (item) => {
    if (item.kind === 'back') {
      return (
        <Tooltip text={item.tip} placement="right">
          <div className="ni" onClick={() => navigate(item.path)}>
            <span className="ni-ico">{item.icon}</span>
            <span className="ni-label">{item.label}</span>
          </div>
        </Tooltip>
      );
    }
    if (item.kind === 'header') {
      return (
        <div className="ni-section-header">
          <h2 className="ni-section-title">{item.title}</h2>
          <p className="ni-section-desc">{item.description}</p>
        </div>
      );
    }
    if (item.kind === 'item') {
      return (
        <Tooltip text={item.tip} placement="right">
          <div
            className={`ni ${item.chevron ? 'ni-with-chevron' : ''} ${isItemActive(item.path) ? 'on' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="ni-ico">{item.icon}</span>
            <span className="ni-label">{item.label}</span>
            {item.chevron && <span className="ni-chevron">{chevronRight}</span>}
          </div>
        </Tooltip>
      );
    }
    if (item.kind === 'group-child' || item.kind === 'group-child-last') {
      const connector = item.kind === 'group-child-last' ? '└' : '├';
      const hasPath = !!item.path;
      const href = hasPath ? item.path : item.href || '#';
      const isOn = hasPath && isItemActive(item.path);
      const handleClick = hasPath
        ? (e) => {
            e.preventDefault();
            navigate(item.path);
          }
        : undefined;
      return (
        <a
          href={href}
          className={`ni ni-child ${isOn ? 'on' : ''}`}
          onClick={handleClick}
        >
          <span className="ni-ico" aria-hidden="true">{connector}</span>
          <span className="ni-label">{item.label}</span>
        </a>
      );
    }
    if (item.kind === 'group') {
      const isCollapsed = !!collapsedGroups[item.id];
      const parent = item.items.find((c) => c.kind === 'group-parent');
      const children = item.items.filter((c) => c.kind !== 'group-parent');
      return (
        <div className="ni-group">
          {parent && (
            <Tooltip text={parent.tip} placement="right">
              <div
                className="ni ni-with-chevron ni-group-parent"
                onClick={() => toggleGroup(item.id)}
                role="button"
                aria-expanded={!isCollapsed}
              >
                <span className="ni-ico">{parent.icon}</span>
                <span className="ni-label">{parent.label}</span>
                <span className="ni-chevron">
                  {isCollapsed ? chevronDown : chevronUp}
                </span>
              </div>
            </Tooltip>
          )}
          {!isCollapsed &&
            children.map((child) => (
              <Fragment key={child.id}>{renderItem(child)}</Fragment>
            ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className={`sidebar-nav-slider ${isDesignSection ? 'is-design' : ''}`}>
        <nav className="admin-root-nav sidebar-nav-pane sidebar-nav-pane-admin">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Fragment key={item.id}>{renderItem(item)}</Fragment>
          ))}
        </nav>
        <nav className="admin-root-nav design-nav sidebar-nav-pane sidebar-nav-pane-design">
          {DESIGN_NAV_ITEMS.map((item) => (
            <Fragment key={item.id}>{renderItem(item)}</Fragment>
          ))}
        </nav>
      </div>

      {/* Dashboard link + sidebar customization */}
      <div className="sidebar-bottom">
        <Tooltip text="Return to WordPress dashboard" placement="top">
          <button type="button" className="sb-dashboard">
            <span className="sb-dashboard-ico" aria-hidden="true">{wordpress}</span>
            <span className="sb-dashboard-label">Dashboard</span>
          </button>
        </Tooltip>
        <Tooltip text="Customize navigation" placement="top">
          <button
            type="button"
            className="sb-customize"
            aria-label="Customize navigation"
          >
            {settings}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default Sidebar;

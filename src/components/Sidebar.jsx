import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState, READING_DISPLAY_LATEST } from '../hooks/useAppState';
import { Tooltip } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import {
  home,
  page as pageIcon,
  postList,
  navigation,
  styles,
  settings,
  menu,
  chevronLeft,
  chevronRight,
  chevronUp,
  chevronDown,
  wordpress,
  arrowLeft,
  color,
  typography,
  background,
  shadow,
  layout,
  tool,
  addTemplate,
  symbolFilled,
} from '@wordpress/icons';

/** Root admin nav — Posts inserted after Pages only when homepage shows latest posts */
const ADMIN_NAV_ITEM_POSTS = Object.freeze({
  kind: 'item',
  id: 'posts',
  icon: postList,
  label: 'Posts',
  path: '/posts',
  tip: 'Manage Posts on your site',
});

const ADMIN_NAV_ITEMS_BASE = [
  { kind: 'item', id: 'home', icon: home, label: 'Home', path: '/', tip: "View your site's home page" },
  { kind: 'item', id: 'pages', icon: pageIcon, label: 'Pages', path: '/pages', tip: "View your site's Pages" },
  { kind: 'item', id: 'navigation', icon: navigation, label: 'Navigation', path: '/navigation', tip: 'Assign pages to your Main Menu and manage other menus' },
  { kind: 'item', id: 'design', icon: styles, label: 'Design', path: '/design', tip: 'Modify your site design and styling', chevron: true },
];

function buildVisibleAdminNavItems(homepageDisplayMode) {
  if (homepageDisplayMode === READING_DISPLAY_LATEST) {
    return [
      ADMIN_NAV_ITEMS_BASE[0],
      ADMIN_NAV_ITEMS_BASE[1],
      ADMIN_NAV_ITEM_POSTS,
      ADMIN_NAV_ITEMS_BASE[2],
      ADMIN_NAV_ITEMS_BASE[3],
    ];
  }
  return [...ADMIN_NAV_ITEMS_BASE];
}

/** Sub-links under Advanced — icons + indent (no tree-line connectors) */
const ADVANCED_SUB_NAV_ITEMS = Object.freeze([
  {
    id: 'advanced-posts',
    label: 'Posts',
    path: '/posts',
    tip: 'Manage posts on your site',
    icon: postList,
  },
  {
    id: 'advanced-templates',
    label: 'Templates',
    path: '/templates',
    tip: 'Edit templates that control how your site renders',
    icon: addTemplate,
  },
  {
    id: 'advanced-patterns',
    label: 'Patterns',
    path: '/patterns',
    tip: 'Reusable sets of blocks for layouts and sections',
    icon: symbolFilled,
  },
]);

/** Advanced submenu — omit Posts when it already appears in the root nav */
function buildVisibleAdvancedSubNavItems(homepageDisplayMode) {
  if (homepageDisplayMode === READING_DISPLAY_LATEST) {
    return ADVANCED_SUB_NAV_ITEMS.filter((row) => row.id !== 'advanced-posts');
  }
  return [...ADVANCED_SUB_NAV_ITEMS];
}

const ADVANCED_ROUTE_PREFIXES = ['/posts', '/templates', '/patterns'];

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
    id: 'style-elements-group',
    items: [
      { kind: 'item', id: 'colors', icon: color, label: 'Colors', path: '/design/styles/colors', tip: 'Colors' },
      { kind: 'item', id: 'fonts', icon: typography, label: 'Fonts', path: '/design/styles/typography', tip: 'Fonts' },
      { kind: 'item', id: 'background', icon: background, label: 'Background', path: '/design/styles/background', tip: 'Background' },
      { kind: 'item', id: 'shadows', icon: shadow, label: 'Shadows', path: '/design/styles/shadows', tip: 'Shadows' },
      { kind: 'item', id: 'layout', icon: layout, label: 'Layout', path: '/design/styles/layout', tip: 'Layout' },
    ],
  },
];

const EDIT_ROUTE_PATTERN = /^\/pages\/[^/]+\/edit$/;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    recentPages,
    menuExpanded,
    setMenuExpanded,
    toggleMenuExpanded,
    selectPage,
    homepageDisplayMode,
    editorReferrer,
  } = useAppState();
  const visibleAdminNavItems = useMemo(
    () => buildVisibleAdminNavItems(homepageDisplayMode),
    [homepageDisplayMode],
  );
  const visibleAdvancedSubNavItems = useMemo(
    () => buildVisibleAdvancedSubNavItems(homepageDisplayMode),
    [homepageDisplayMode],
  );
  const isDesignSection = location.pathname.startsWith('/design');
  const isEditCanvas = EDIT_ROUTE_PATTERN.test(location.pathname);
  const activePathname =
    isEditCanvas && editorReferrer ? editorReferrer : location.pathname;
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const sidebarNestedNavHidden = isEditCanvas
    ? sidebarCollapsed && !menuExpanded
    : sidebarCollapsed;

  useEffect(() => {
    if (!sidebarNestedNavHidden) {
      return;
    }
    queueMicrotask(() => {
      setAdvancedExpanded(false);
    });
  }, [sidebarNestedNavHidden]);

  /** Collapsed chrome: first interaction expands the sidebar/menu and opens Advanced */
  const handleAdvancedParentActivate = () => {
    if (sidebarNestedNavHidden) {
      if (isEditCanvas) {
        setMenuExpanded(true);
      } else {
        setSidebarCollapsed(false);
      }
      setAdvancedExpanded(true);
      return;
    }
    setAdvancedExpanded((prev) => !prev);
  };

  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Direct navigation. RootLayout's route effect resets menuExpanded.
  const navigateSmooth = (target) => {
    navigate(target);
  };

  const isItemActive = (itemPath) => {
    if (!itemPath) return false;
    if (itemPath === '/') {
      return !isDesignSection && activePathname === '/';
    }
    if (itemPath === '/design') {
      return activePathname.startsWith('/design');
    }
    if (itemPath === '/pages') {
      return activePathname.startsWith('/pages');
    }
    return activePathname === itemPath;
  };

  const advancedRoutePrefixesForHighlight = useMemo(() => {
    if (homepageDisplayMode === READING_DISPLAY_LATEST) {
      return ADVANCED_ROUTE_PREFIXES.filter((p) => p !== '/posts');
    }
    return ADVANCED_ROUTE_PREFIXES;
  }, [homepageDisplayMode]);

  const isAdvancedChildRouteActive = advancedRoutePrefixesForHighlight.some(
    (prefix) =>
      location.pathname === prefix || location.pathname.startsWith(`${prefix}/`),
  );

  const renderItem = (item) => {
    if (item.kind === 'back') {
      return (
        <Tooltip text={item.tip} placement="right">
          <div className="ni" onClick={() => navigate(item.path)}>
            <span className="ni-ico">{item.icon}</span>
            <Text variant="body-md" className="ni-label">{item.label}</Text>
          </div>
        </Tooltip>
      );
    }
    if (item.kind === 'header') {
      return (
        <Stack direction="column" gap="xs" className="ni-section-header">
          <Text variant="heading-lg" className="ni-section-title">{item.title}</Text>
          <Text variant="body-sm" className="ni-section-desc">{item.description}</Text>
        </Stack>
      );
    }
    if (item.kind === 'item') {
      // Dummy link variant: when item.href is set, render as <a> with no
      // navigation. Reuses existing .ni-child anchor reset.
      if (item.href) {
        return (
          <Tooltip text={item.tip} placement="right">
            <a href={item.href} className="ni ni-child">
              <span className="ni-ico">{item.icon}</span>
              <Text variant="body-md" className="ni-label">{item.label}</Text>
            </a>
          </Tooltip>
        );
      }
      return (
        <Tooltip text={item.tip} placement="right">
          <div
            className={`ni ${item.chevron ? 'ni-with-chevron' : ''} ${isItemActive(item.path) ? 'on' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="ni-ico">{item.icon}</span>
            <Text variant="body-md" className="ni-label">{item.label}</Text>
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
          <Text variant="body-md" className="ni-label">{item.label}</Text>
        </a>
      );
    }
    if (item.kind === 'group') {
      const isCollapsed = !!collapsedGroups[item.id];
      const parent = item.items.find((c) => c.kind === 'group-parent');
      const children = item.items.filter((c) => c.kind !== 'group-parent');
      return (
        <Stack direction="column" className="ni-group">
          {parent && (
            <Tooltip text={parent.tip} placement="right">
              <div
                className="ni ni-with-chevron ni-group-parent"
                onClick={() => toggleGroup(item.id)}
                role="button"
                aria-expanded={!isCollapsed}
              >
                <span className="ni-ico">{parent.icon}</span>
                <Text variant="body-md" className="ni-label">{parent.label}</Text>
                <span className="ni-chevron">
                  {isCollapsed ? chevronDown : chevronUp}
                </span>
              </div>
            </Tooltip>
          )}
          {(!parent || !isCollapsed) &&
            children.map((child) => (
              <Fragment key={child.id}>{renderItem(child)}</Fragment>
            ))}
        </Stack>
      );
    }
    return null;
  };

  const renderAdvancedSection = () => {
    const showChildren = advancedExpanded && !sidebarNestedNavHidden;
    return (
      <Stack direction="column" gap="xs" className="sb-advanced-block">
        <Tooltip text="Less common tools beyond everyday editing." placement="right">
          <div
            className={`ni ni-with-chevron ni-group-parent sb-advanced-parent ${
              isAdvancedChildRouteActive ? 'on' : ''
            }`}
            role="button"
            tabIndex={0}
            aria-expanded={showChildren}
            onClick={handleAdvancedParentActivate}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAdvancedParentActivate();
              }
            }}
          >
            <span className="ni-ico">{tool}</span>
            <Text variant="body-md" className="ni-label">Advanced</Text>
            <span className="ni-chevron">
              {showChildren ? chevronDown : chevronUp}
            </span>
          </div>
        </Tooltip>
        {showChildren &&
          visibleAdvancedSubNavItems.map((row) => {
            const isOn = isItemActive(row.path);
            return (
              <Tooltip key={row.id} text={row.tip} placement="right">
                <a
                  href={row.path}
                  className={`ni ni-child sb-advanced-sub ${isOn ? 'on' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(row.path);
                  }}
                >
                  <span className="ni-ico">{row.icon}</span>
                  <Text variant="body-md" className="ni-label">{row.label}</Text>
                </a>
              </Tooltip>
            );
          })}
      </Stack>
    );
  };

  // Inside the editor the sidebar shows three sections: a menu-toggle
  // button (top, 64px), the root nav (middle), and recent documents
  // (bottom, flex-grow). Reuses the same .sidebar / .sidebar.collapsed
  // / .admin-root-nav / .ni / .sb-customize classes.
  if (isEditCanvas) {
    const isCollapsed = sidebarCollapsed && !menuExpanded;
    return (
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Section 1 — 64px-tall row that aligns with .canvas-toolbar.
            Collapsed: hamburger button pinned to the leftmost 48px column.
            Expanded: a .ni-styled "Hide menu" action that mirrors the
            other root-nav items (icon + label) and collapses the menu. */}
        {menuExpanded ? (
          <nav className="admin-root-nav editor-sidebar-section editor-sidebar-toggle-row">
            <Tooltip text="Hide menu" placement="right">
              <div
                className="ni"
                role="button"
                tabIndex={0}
                onClick={toggleMenuExpanded}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMenuExpanded();
                  }
                }}
              >
                <span className="ni-ico">{chevronLeft}</span>
                <Text variant="body-md" className="ni-label">Hide menu</Text>
              </div>
            </Tooltip>
          </nav>
        ) : (
          <Stack
            direction="row"
            align="center"
            justify="center"
            className="sidebar-bottom editor-sidebar-section editor-sidebar-hamburger"
          >
            <Tooltip text="Expand menu" placement="right">
              <button
                type="button"
                className="sb-customize"
                aria-label="Expand menu"
                aria-expanded={menuExpanded}
                onClick={toggleMenuExpanded}
              >
                {menu}
              </button>
            </Tooltip>
          </Stack>
        )}

        {/* Section 2 — root nav icons. */}
        <nav className="admin-root-nav editor-sidebar-section editor-sidebar-root-nav">
          {visibleAdminNavItems.map((item) => (
            <Tooltip key={item.id} text={item.tip} placement="right">
              <div
                className={`ni ${isItemActive(item.path) ? 'on' : ''}`}
                onClick={() => navigateSmooth(item.path)}
              >
                <span className="ni-ico">{item.icon}</span>
                <Text variant="body-md" className="ni-label">{item.label}</Text>
              </div>
            </Tooltip>
          ))}
        </nav>

        {/* Section 3 — recent documents. Heading only when expanded so it
            doesn't wrap awkwardly inside the 48px strip. Reuses the same
            uppercase MenuGroup heading style as the Exit popover. */}
        {!isCollapsed && (
          <Text
            variant="body-sm"
            className="components-menu-group__label editor-sidebar-recent-heading"
          >
            Recent documents
          </Text>
        )}
        <nav className="admin-root-nav editor-sidebar-section editor-sidebar-recent-list">
          {recentPages.map((p) => (
            <Tooltip key={p.id} text={p.name} placement="right">
              <div
                className="ni"
                onClick={() => {
                  selectPage(p);
                  navigateSmooth(`/pages/${p.id}/edit`);
                }}
              >
                <span className="ni-ico">{pageIcon}</span>
                <Text variant="body-md" className="ni-label">{p.name}</Text>
              </div>
            </Tooltip>
          ))}
        </nav>

        <nav
          className="admin-root-nav editor-sidebar-section editor-sidebar-advanced-dock"
          aria-label="Advanced"
        >
          {renderAdvancedSection()}
        </nav>
      </div>
    );
  }

  return (
    <div
      className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${
        isDesignSection ? 'is-design-section' : ''
      }`}
    >
      <div className={`sidebar-nav-slider ${isDesignSection ? 'is-design' : ''}`}>
        <nav className="admin-root-nav sidebar-nav-pane sidebar-nav-pane-admin">
          {visibleAdminNavItems.map((item) => (
            <Fragment key={item.id}>{renderItem(item)}</Fragment>
          ))}
        </nav>
        <nav className="admin-root-nav design-nav sidebar-nav-pane sidebar-nav-pane-design">
          {DESIGN_NAV_ITEMS.map((item) => (
            <Fragment key={item.id}>{renderItem(item)}</Fragment>
          ))}
        </nav>
      </div>

      {!isDesignSection && (
        <nav className="admin-root-nav sidebar-advanced-dock" aria-label="Advanced">
          {renderAdvancedSection()}
        </nav>
      )}

      {/* WP Admin link + sidebar customization. Hidden in the design section. */}
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        gap="sm"
        className="sidebar-bottom"
      >
        <Tooltip text="Return to the WordPress dashboard" placement="top">
          <button
            type="button"
            className="sb-dashboard"
            onClick={() =>
              alert(
                'This would take you back to WP Admin, but this is a prototype.',
              )
            }
          >
            <Stack direction="row" align="center" gap="sm" className="sb-dashboard-inner">
              <span className="sb-dashboard-ico-wrap" aria-hidden="true">
                <span className="sb-dashboard-ico-layer sb-dashboard-ico-layer--wp">{wordpress}</span>
                <span className="sb-dashboard-ico-layer sb-dashboard-ico-layer--arrow">{arrowLeft}</span>
              </span>
              <Text variant="body-md" className="sb-dashboard-label">WP Admin</Text>
            </Stack>
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
      </Stack>
    </div>
  );
}

export default Sidebar;

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState, READING_DISPLAY_LATEST } from '../hooks/useAppState';
import { Tooltip } from '@wordpress/components';
// eslint-disable-next-line @wordpress/use-recommended-components -- Sidebar nav depends on WP UI Button CSS vars; swapping components would be a visual refactor.
import { Button, Stack, Text } from '@wordpress/ui';
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
  { kind: 'item', id: 'content', icon: postList, label: 'Content', path: '/content', tip: 'Manage content and page designs' },
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

/** Sub-links under Advanced — icons + indent (no tree-line connectors).
    Used by the Block Editor sidebar variant which keeps inline expand/collapse. */
const ADVANCED_SUB_NAV_ITEMS = Object.freeze([
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

const ADVANCED_ROUTE_PREFIXES = ['/templates', '/patterns'];

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

const ADVANCED_NAV_ITEMS = [
  { kind: 'back', id: 'back', icon: chevronLeft, label: 'Back', path: '/', tip: 'Back to admin' },
  { kind: 'header', id: 'advanced-header', title: 'Advanced', description: 'Configure advanced tools of your site' },
  {
    kind: 'group',
    id: 'advanced-group',
    items: [
      { kind: 'item', id: 'templates', icon: addTemplate, label: 'Templates', path: '/templates', tip: 'Edit templates that control how your site renders' },
      { kind: 'item', id: 'patterns', icon: symbolFilled, label: 'Patterns', path: '/patterns', tip: 'Reusable sets of blocks for layouts and sections' },
    ],
  },
];

const EDIT_ROUTE_PATTERN = /^\/(?:pages|page-designs|templates)\/[^/]+\/edit$/;

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
  const isDesignSection = location.pathname.startsWith('/design');
  const isAdvancedSection = ADVANCED_ROUTE_PREFIXES.some(
    (prefix) =>
      location.pathname === prefix || location.pathname.startsWith(`${prefix}/`),
  );
  const isEditCanvas = EDIT_ROUTE_PATTERN.test(location.pathname);
  const activePathname =
    isEditCanvas && editorReferrer ? editorReferrer : location.pathname;
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const homePreviewResetCountRef = useRef(0);

  const sidebarNestedNavHidden = isEditCanvas
    ? sidebarCollapsed && !menuExpanded
    : sidebarCollapsed;

  useEffect(() => {
    if (sidebarNestedNavHidden) {
      const raf = window.requestAnimationFrame(() => {
        setAdvancedExpanded(false);
      });
      return () => window.cancelAnimationFrame(raf);
    }
    return undefined;
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
    if (target === '/') {
      homePreviewResetCountRef.current += 1;
      navigate('/', {
        state: { homePreviewResetCount: homePreviewResetCountRef.current },
      });
      return;
    }
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
    if (itemPath === '/content') {
      return (
        activePathname.startsWith('/content') ||
        activePathname.startsWith('/page-designs')
      );
    }
    return activePathname === itemPath;
  };

  const isAdvancedChildRouteActive = isAdvancedSection;

  const renderItem = (item) => {
    if (item.kind === 'back') {
      return (
        <Tooltip text={item.tip} placement="right">
          <Button
            tone="neutral"
            variant="minimal"
            size="compact"
            className="ni"
            onClick={() => navigateSmooth(item.path)}
          >
            <span className="ni-ico">{item.icon}</span>
            <span className="ni-label">{item.label}</span>
          </Button>
        </Tooltip>
      );
    }
    if (item.kind === 'header') {
      return (
        <Stack direction="column" gap="xs" className="ni-section-header">
          <Text variant="heading-lg" className="ni-section-title">{item.title}</Text>
          <Text variant="body-md" className="ni-section-desc">{item.description}</Text>
        </Stack>
      );
    }
    if (item.kind === 'item') {
      // Dummy link variant: when item.href is set, render as <a> with no
      // navigation.
      if (item.href) {
        return (
          <Tooltip text={item.tip} placement="right">
            <Button
              tone="neutral"
              variant="minimal"
              size="compact"
              className="ni ni-child"
              nativeButton={false}
              render={<a href={item.href} />}
            >
              <span className="ni-ico">{item.icon}</span>
              <span className="ni-label">{item.label}</span>
            </Button>
          </Tooltip>
        );
      }
      return (
        <Tooltip text={item.tip} placement="right">
          <Button
            tone="neutral"
            variant="minimal"
            size="compact"
            aria-pressed={isItemActive(item.path)}
            className={`ni ${item.chevron ? 'ni-with-chevron' : ''}`}
            onClick={() => navigateSmooth(item.path)}
          >
            <span className="ni-ico">{item.icon}</span>
            <span className="ni-label">{item.label}</span>
            {item.chevron && <span className="ni-chevron">{chevronRight}</span>}
          </Button>
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
        <Button
          tone="neutral"
          variant="minimal"
          size="compact"
          aria-pressed={isOn}
          className="ni ni-child"
          nativeButton={false}
          render={<a href={href} />}
          onClick={handleClick}
        >
          <span className="ni-ico" aria-hidden="true">{connector}</span>
          <span className="ni-label">{item.label}</span>
        </Button>
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
              <Button
                tone="neutral"
                variant="minimal"
                size="compact"
                aria-expanded={!isCollapsed}
                className="ni ni-with-chevron ni-group-parent"
                onClick={() => toggleGroup(item.id)}
              >
                <span className="ni-ico">{parent.icon}</span>
                <span className="ni-label">{parent.label}</span>
                <span className="ni-chevron">
                  {isCollapsed ? chevronDown : chevronUp}
                </span>
              </Button>
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
          <Button
            tone="neutral"
            variant="minimal"
            size="compact"
            aria-pressed={isAdvancedChildRouteActive}
            aria-expanded={showChildren}
            className="ni ni-with-chevron ni-group-parent sb-advanced-parent"
            onClick={handleAdvancedParentActivate}
          >
            <span className="ni-ico">{tool}</span>
            <span className="ni-label">Advanced</span>
            <span className="ni-chevron">
              {advancedExpanded ? chevronDown : chevronUp}
            </span>
          </Button>
        </Tooltip>
        {showChildren &&
          ADVANCED_SUB_NAV_ITEMS.map((row) => {
            const isOn = isItemActive(row.path);
            return (
              <Tooltip key={row.id} text={row.tip} placement="right">
                <Button
                  tone="neutral"
                  variant="minimal"
                  size="compact"
                  aria-pressed={isOn}
                  className="ni ni-child sb-advanced-sub"
                  nativeButton={false}
                  render={<a href={row.path} />}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(row.path);
                  }}
                >
                  <span className="ni-ico">{row.icon}</span>
                  <span className="ni-label">{row.label}</span>
                </Button>
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
              <Button
                tone="neutral"
                variant="minimal"
                size="compact"
                className="ni"
                onClick={toggleMenuExpanded}
              >
                <span className="ni-ico">{chevronLeft}</span>
                <span className="ni-label">Hide menu</span>
              </Button>
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
              <Button
                tone="neutral"
                variant="minimal"
                size="compact"
                className="ni sb-customize"
                aria-label="Expand menu"
                aria-expanded={menuExpanded}
                onClick={toggleMenuExpanded}
              >
                <span className="ni-ico">{menu}</span>
              </Button>
            </Tooltip>
          </Stack>
        )}

        {/* Section 2 — root nav icons. */}
        <nav className="admin-root-nav editor-sidebar-section editor-sidebar-root-nav">
          {visibleAdminNavItems.map((item) => (
            <Tooltip key={item.id} text={item.tip} placement="right">
              <Button
                tone="neutral"
                variant="minimal"
                size="compact"
                aria-pressed={isItemActive(item.path)}
                className="ni"
                onClick={() => navigateSmooth(item.path)}
              >
                <span className="ni-ico">{item.icon}</span>
                <span className="ni-label">{item.label}</span>
              </Button>
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
              <Button
                tone="neutral"
                variant="minimal"
                size="compact"
                className="ni"
                onClick={() => {
                  selectPage(p);
                  navigateSmooth(`/pages/${p.id}/edit`);
                }}
              >
                <span className="ni-ico">{pageIcon}</span>
                <span className="ni-label">{p.name}</span>
              </Button>
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
      } ${isAdvancedSection ? 'is-advanced-section' : ''}`}
    >
      <div
        className={`sidebar-nav-slider ${isDesignSection ? 'is-design' : ''} ${
          isAdvancedSection ? 'is-advanced' : ''
        }`}
      >
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
        <nav
          className="admin-root-nav advanced-nav sidebar-nav-pane sidebar-nav-pane-advanced"
          aria-label="Advanced"
        >
          {ADVANCED_NAV_ITEMS.map((item) => (
            <Fragment key={item.id}>{renderItem(item)}</Fragment>
          ))}
        </nav>
      </div>

      {!isDesignSection && !isAdvancedSection && (
        <nav className="admin-root-nav sidebar-advanced-dock" aria-label="Advanced">
          <Tooltip text="Configure advanced tools of your site" placement="right">
            <Button
              tone="neutral"
              variant="minimal"
              size="compact"
              className="ni ni-with-chevron sb-advanced-parent"
              onClick={() => navigate('/templates')}
            >
              <span className="ni-ico">{tool}</span>
              <span className="ni-label">Advanced</span>
              <span className="ni-chevron">{chevronRight}</span>
            </Button>
          </Tooltip>
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
          <Button
            tone="neutral"
            variant="minimal"
            size="compact"
            className="ni sb-dashboard"
            onClick={() =>
              alert(
                'This would take you back to WP Admin, but this is a prototype.',
              )
            }
          >
            <span className="ni-ico">{wordpress}</span>
            <span className="ni-label">WP Admin</span>
          </Button>
        </Tooltip>
        <Tooltip text="Customize navigation" placement="top">
          <Button
            tone="neutral"
            variant="minimal"
            size="compact"
            className="ni sb-customize"
            aria-label="Customize navigation"
          >
            <span className="ni-ico">{settings}</span>
          </Button>
        </Tooltip>
      </Stack>
    </div>
  );
}

export default Sidebar;

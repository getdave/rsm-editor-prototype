import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { Tooltip } from '@wordpress/components';
// eslint-disable-next-line @wordpress/use-recommended-components -- Sidebar nav depends on WP UI Button CSS vars; swapping components would be a visual refactor.
import { Button, Stack, Text } from '@wordpress/ui';
import {
  page as pageIcon,
  settings,
  menu,
  file,
  chevronLeft,
  chevronRight,
  chevronUp,
  chevronDown,
  wordpress,
  layout,
  tool,
  addTemplate,
  symbolFilled,
} from '@wordpress/icons';
import {
  buildVisibleAdminNavItems,
  getAdminNavItemById,
} from '../constants/adminNav';
import SidebarNavCustomizer from './sidebar/SidebarNavCustomizer';

/** Id of the Menu container whose items own the given route, or null. */
function findMenuIdForPath(layout, pathname, mode) {
  const match = layout.find(
    (e) =>
      e.kind === 'section' &&
      e.type === 'menu' &&
      (e.items ?? []).some((it) => {
        const def = getAdminNavItemById(it.id, mode);
        return def && def.path !== '/' && pathname.startsWith(def.path);
      }),
  );
  return match ? match.id : null;
}

/** Sub-links under Advanced — icons + indent (no tree-line connectors).
    Used by the Block Editor sidebar variant which keeps inline expand/collapse. */
const ADVANCED_SUB_NAV_ITEMS = Object.freeze([
  {
    id: 'advanced-patterns',
    label: 'Patterns',
    path: '/patterns',
    tip: 'Reusable sets of blocks for layouts and sections',
    icon: symbolFilled,
  },
  {
    id: 'advanced-template-parts',
    label: 'Template Parts',
    path: '/template-parts',
    tip: 'Reusable headers, footers, and template areas',
    icon: layout,
  },
  {
    id: 'advanced-templates',
    label: 'Templates',
    path: '/templates',
    tip: 'Edit templates that control how your site renders',
    icon: addTemplate,
  },
]);

const ADVANCED_ROUTE_PREFIXES = ['/patterns', '/template-parts', '/templates'];

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
    navEditMode,
    enterNavEditMode,
    navLayout,
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
  // Root-sidebar drilldown: which Menu container's pane is open. Initialized
  // from the route so a deep-link/reload opens the owning menu.
  const [activeMenuId, setActiveMenuId] = useState(() =>
    findMenuIdForPath(navLayout, location.pathname, homepageDisplayMode),
  );
  // A collapsed sidebar shows no drilldown (but remembers the selection).
  const effectiveMenuId = sidebarCollapsed ? null : activeMenuId;
  const activeMenu = navLayout.find(
    (e) => e.kind === 'section' && e.type === 'menu' && e.id === effectiveMenuId,
  );

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
      const handleBack = () => {
        if (advancedExpanded) {
          setAdvancedExpanded(false);
        }
        if (!isAdvancedSection) {
          return;
        }
        navigate(item.path);
      };
      return (
        <Tooltip text={item.tip} placement="right">
          <Button
            tone="neutral"
            variant="minimal"
            size="compact"
            className="ni"
            onClick={handleBack}
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

  /** Resolve a container's visible member items to their full definitions. */
  const visibleMemberItems = (entry) =>
    (entry.items ?? [])
      .filter((it) => !it.hidden)
      .map((it) => getAdminNavItemById(it.id, homepageDisplayMode))
      .filter(Boolean);

  /** Render one top-level navLayout entry in the root pane (per container type). */
  const renderRootEntry = (entry) => {
    if (entry.kind !== 'section') {
      if (entry.hidden) return null;
      const item = getAdminNavItemById(entry.id, homepageDisplayMode);
      if (!item) return null;
      return <Fragment key={entry.id}>{renderItem(item)}</Fragment>;
    }

    const type = entry.type ?? 'folder';

    // Menu — a drilldown row that opens the menu's pane. Shown even if empty.
    if (type === 'menu') {
      const name = entry.label || 'New Menu';
      const items = visibleMemberItems(entry);
      const isOn = items.some((it) => isItemActive(it.path));
      return (
        <Tooltip key={entry.id} text={name} placement="right">
          <Button
            tone="neutral"
            variant="minimal"
            size="compact"
            aria-pressed={isOn}
            aria-expanded={effectiveMenuId === entry.id}
            className="ni ni-with-chevron"
            onClick={() => {
              if (sidebarCollapsed) setSidebarCollapsed(false);
              setActiveMenuId(entry.id);
            }}
          >
            <span className="ni-ico">{menu}</span>
            <span className="ni-label">{name}</span>
            <span className="ni-chevron">{chevronRight}</span>
          </Button>
        </Tooltip>
      );
    }

    // Group / Folder — items rendered inline (Folder adds a heading).
    const items = visibleMemberItems(entry);
    if (items.length === 0) return null;
    if (type === 'folder') {
      const name = entry.label || 'New Folder';
      return (
        <div
          key={entry.id}
          className="sidebar-nav-section-group"
          role="group"
          aria-label={name}
        >
          <Text
            variant="body-sm"
            className="components-menu-group__label sidebar-nav-section-label"
          >
            <span className="sidebar-nav-section-icon" aria-hidden="true">
              {file}
            </span>
            {name}
          </Text>
          {items.map((item) => (
            <Fragment key={item.id}>{renderItem(item)}</Fragment>
          ))}
        </div>
      );
    }
    return (
      <div
        key={entry.id}
        className="sidebar-nav-section-group sidebar-nav-section-group--plain"
        role="group"
      >
        {items.map((item) => (
          <Fragment key={item.id}>{renderItem(item)}</Fragment>
        ))}
      </div>
    );
  };

  /** Render the drilldown pane for the open Menu (Back row + title + items). */
  const renderMenuPane = (menuEntry) => {
    if (!menuEntry) return null;
    const name = menuEntry.label || 'New Menu';
    return (
      <>
        <Tooltip text="Back" placement="right">
          <Button
            tone="neutral"
            variant="minimal"
            size="compact"
            className="ni"
            onClick={() => setActiveMenuId(null)}
          >
            <span className="ni-ico">{chevronLeft}</span>
            <span className="ni-label">Back</span>
          </Button>
        </Tooltip>
        <Stack direction="column" gap="xs" className="ni-section-header">
          <Text variant="heading-lg" className="ni-section-title">
            {name}
          </Text>
        </Stack>
        {visibleMemberItems(menuEntry).map((item) => (
          <Fragment key={item.id}>{renderItem(item)}</Fragment>
        ))}
      </>
    );
  };

  // Inside the editor the sidebar shows three sections: a menu-toggle
  // button (top, 64px), the root nav (middle), and recent documents
  // (bottom, flex-grow). Reuses the same .sidebar / .sidebar.collapsed
  // / .admin-root-nav / .ni / .sb-customize classes.
  // Sidebar customizer edit mode — only reachable from the root admin view.
  // Replaces the whole sidebar body with the editable list + footer controls.
  if (navEditMode && !isEditCanvas) {
    return (
      <div className="sidebar sidebar-customizing">
        <SidebarNavCustomizer />
      </div>
    );
  }

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
        effectiveMenuId ? 'is-menu-open' : ''
      }`}
    >
      <div className={`sidebar-nav-slider ${effectiveMenuId ? 'is-menu' : ''}`}>
        <nav className="admin-root-nav sidebar-nav-pane sidebar-nav-pane-root">
          {navLayout.map(renderRootEntry)}
        </nav>
        <nav
          className="admin-root-nav sidebar-nav-pane sidebar-nav-pane-menu"
          aria-label={activeMenu ? activeMenu.label || 'Menu' : 'Menu'}
        >
          {renderMenuPane(activeMenu)}
        </nav>
      </div>

      {/* WP Admin link + sidebar customization. Hidden while a menu is open. */}
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
            onClick={enterNavEditMode}
          >
            <span className="ni-ico">{settings}</span>
          </Button>
        </Tooltip>
      </Stack>
    </div>
  );
}

export default Sidebar;

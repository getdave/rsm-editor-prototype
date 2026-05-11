import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { Tooltip, Button } from '@wordpress/components';
import { Page } from '@wordpress/admin-ui';
import { navigationMenus as initialMenus, pages } from '../../data/mockData';
import { useAppState } from '../../hooks/useAppState';
import PreviewCanvas from '../shared/PreviewCanvas';
import MenuEditor from '../navigation/MenuEditor';
import AddMenuModal from '../navigation/AddMenuModal';

function NavigationView() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState(initialMenus);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [previewPage, setPreviewPage] = useState(
    () => pages.find((p) => p.isFrontPage) || pages[0],
  );
  const { sidebarCollapsed, toggleSidebar } = useAppState();

  const [view, setView] = useState({
    type: 'list',
    search: '',
    filters: [],
    page: 1,
    perPage: 50,
    sort: {
      field: 'name',
      direction: 'asc',
    },
    titleField: 'name',
    fields: ['locations'],
    layout: { density: 'compact' },
  });

  const selectedMenu = menus.find(menu => menu.id === selectedMenuId);

  // Auto-collapse sidebar when drilling into a menu; restore when back at list.
  // Depends only on selectedMenuId so toggling the sidebar manually on those routes does not fight this effect.
  useEffect(() => {
    if (selectedMenuId && !sidebarCollapsed) {
      toggleSidebar();
    } else if (!selectedMenuId && sidebarCollapsed) {
      toggleSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional selectedMenuId-only coupling (see above)
  }, [selectedMenuId]);

  const updateMenu = (menuId, updates) => {
    setMenus(prev => prev.map(menu =>
      menu.id === menuId ? { ...menu, ...updates } : menu
    ));
  };

  const addMenu = (menuName) => {
    const newMenu = {
      id: `menu-${Date.now()}`,
      name: menuName,
      isPrimary: false,
      items: [],
      usedIn: [],
    };
    setMenus(prev => [...prev, newMenu]);
    setSelectedMenuId(newMenu.id);
  };

  const fields = useMemo(
    () => [
      {
        id: 'name',
        header: 'Menu name',
        getValue: ({ item }) => item.name,
        render: ({ item }) => (
          <span>
            {item.name}
            {item.isPrimary && (
              <Tooltip text="The menu that is currently assigned to the Header template part">
                <span className="nav-menu-badge">Primary</span>
              </Tooltip>
            )}
          </span>
        ),
        enableSorting: true,
        enableGlobalSearch: false,
      },
      {
        id: 'locations',
        header: 'Locations',
        getValue: ({ item }) => item.usedIn.length,
        render: ({ item }) => {
          const count = item.usedIn.length;
          const text = count === 0 ? '0 locations' : count === 1 ? '1 location' : `${count} locations`;
          return (
            <span className={count === 0 ? 'nav-dv-locations-zero' : 'nav-dv-locations'}>
              {text}
            </span>
          );
        },
        enableSorting: true,
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        id: 'view',
        label: 'Edit',
        isPrimary: true,
        callback: (items) => {
          setSelectedMenuId(items[0].id);
        },
      },
    ],
    []
  );

  const { data: processedData, paginationInfo } = useMemo(
    () => filterSortAndPaginate(menus, view, fields),
    [menus, view, fields]
  );

  const stageContent = (
    <div className="nav-inner nav-dataviews">
      <DataViews
        data={processedData}
        fields={fields}
        view={view}
        onChangeView={setView}
        actions={actions}
        paginationInfo={paginationInfo}
        defaultLayouts={{ list: {}, table: {} }}
      >
        <DataViews.Layout />
      </DataViews>
    </div>
  );

  const canvasContent = (
    <PreviewCanvas
      page={previewPage}
      onEdit={() =>
        navigate(`/pages/${previewPage.id}/edit?inserter=patterns`)
      }
      onPageChange={setPreviewPage}
    />
  );

  const pageActions = (
    <Button
      variant="secondary"
      onClick={() => setShowAddMenuModal(true)}
    >
      Add menu
    </Button>
  );

  return (
    <>
      <div className="nav-panel show">
        {!selectedMenu ? (
          <div className="split-view list">
            <Page
              className="split-view-stage nav-content-frame"
              title="Navigation"
              actions={pageActions}
              showSidebarToggle={false}
            >
              {stageContent}
            </Page>
            <div
              className="split-view-canvas nav-preview-frame"
              role="region"
              aria-label="Preview"
            >
              {canvasContent}
            </div>
          </div>
        ) : (
          <div className="split-view list">
            <MenuEditor
              menu={selectedMenu}
              onUpdateMenu={(updates) => updateMenu(selectedMenuId, updates)}
              onBack={() => setSelectedMenuId(null)}
            />
            <div
              className="split-view-canvas nav-preview-frame"
              role="region"
              aria-label="Preview"
            >
              {canvasContent}
            </div>
          </div>
        )}
      </div>
      {showAddMenuModal && (
        <AddMenuModal
          onClose={() => setShowAddMenuModal(false)}
          onAddMenu={addMenu}
        />
      )}
    </>
  );
}

export default NavigationView;

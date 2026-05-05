import { useState, useMemo, useEffect } from 'react';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { navigationMenus as initialMenus } from '../../data/mockData';
import { useAppState } from '../../hooks/useAppState';
import MenuEditor from '../navigation/MenuEditor';
import MenuPreviews from '../navigation/MenuPreviews';
import AddMenuModal from '../navigation/AddMenuModal';

function NavigationView() {
  const [menus, setMenus] = useState(initialMenus);
  const [selectedMenuId, setSelectedMenuId] = useState('main-menu');
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
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
    layout: { density: 'compact' },
  });

  const selectedMenu = menus.find(menu => menu.id === selectedMenuId);

  // Auto-collapse sidebar when menu is selected
  useEffect(() => {
    if (selectedMenuId && !sidebarCollapsed) {
      toggleSidebar();
    } else if (!selectedMenuId && sidebarCollapsed) {
      toggleSidebar();
    }
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
          <div className="nav-dv-name">
            {item.name}
            {item.isPrimary && (
              <span className="nav-menu-badge">Primary</span>
            )}
          </div>
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

  return (
    <div className="nav-view">
      {!selectedMenu ? (
        <div className="nav-panel nav-menu-list">
          <div className="nav-panel-header">
            <h2 className="nav-panel-title">Navigation</h2>
            <button
              className="nav-add-menu-btn components-button is-secondary"
              onClick={() => setShowAddMenuModal(true)}
            >
              Add menu
            </button>
          </div>

          <div className="nav-dataviews-wrapper">
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
        </div>
      ) : (
        <>
          <MenuEditor
            menu={selectedMenu}
            onUpdateMenu={(updates) => updateMenu(selectedMenuId, updates)}
            onBack={() => setSelectedMenuId(null)}
          />
          <MenuPreviews menu={selectedMenu} />
        </>
      )}
      {showAddMenuModal && (
        <AddMenuModal
          onClose={() => setShowAddMenuModal(false)}
          onAddMenu={addMenu}
        />
      )}
    </div>
  );
}

export default NavigationView;

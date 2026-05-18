import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { Tooltip, Button } from '@wordpress/components';
import { trash } from '@wordpress/icons';
import { Page } from '@wordpress/admin-ui';
import PreviewCanvas from '../shared/PreviewCanvas';
import MenuEditor from '../navigation/MenuEditor';
import AddMenuModal from '../navigation/AddMenuModal';
import DeleteMenuConfirmModal from '../modals/DeleteMenuConfirmModal';
import { useAppState } from '../../hooks/useAppState';

function NavigationView() {
  const navigate = useNavigate();
  const {
    navigationMenus: menus,
    setNavigationMenus,
    pages: appPages,
  } = useAppState();
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [forceShowList, setForceShowList] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [menuPendingDelete, setMenuPendingDelete] = useState(null);
  const [previewPage, setPreviewPage] = useState(
    () => appPages.find((p) => p.isFrontPage) ?? appPages[0] ?? null,
  );
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

  const resolvedMenuId =
    menus.length === 1 && menus[0] && !forceShowList
      ? menus[0].id
      : selectedMenuId;

  const selectedMenu =
    resolvedMenuId != null
      ? menus.find((menu) => menu.id === resolvedMenuId)
      : null;

  const updateMenu = (menuId, updates) => {
    setNavigationMenus(prev => prev.map(menu =>
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
    setNavigationMenus(prev => [...prev, newMenu]);
    setSelectedMenuId(newMenu.id);
    setForceShowList(false);
  };

  const deleteMenu = (menuId) => {
    setNavigationMenus((prev) => prev.filter((m) => m.id !== menuId));
    if (selectedMenuId === menuId) {
      setSelectedMenuId(null);
      setForceShowList(true);
    }
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
          setForceShowList(false);
        },
      },
      {
        id: 'delete-menu',
        label: 'Delete',
        icon: trash,
        callback: (items) => {
          setMenuPendingDelete(items[0]);
        },
      },
    ],
    []
  );

  const { data: processedData, paginationInfo } = useMemo(
    () => filterSortAndPaginate(menus, view, fields),
    [menus, view, fields]
  );

  /** Menu rows — matches editor order and labels; drives preview header nav. */
  const previewHeaderNavItems = useMemo(() => {
    const menuForPreview =
      selectedMenu ?? menus.find((m) => m.isPrimary) ?? menus[0];
    if (!menuForPreview?.items?.length) {
      return [];
    }

    const mapPreviewItem = (item) => ({
      id: item.id,
      label: item.label,
      ...(item.pageId != null ? { pageId: item.pageId } : {}),
      ...(item.url != null ? { url: item.url } : {}),
      children: (item.children || []).map(mapPreviewItem),
    });

    return menuForPreview.items.map(mapPreviewItem);
  }, [selectedMenu, menus]);

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
        previewPage &&
        navigate(`/pages/${previewPage.id}/edit?inserter=patterns`)
      }
      onPageChange={setPreviewPage}
      headerNavItems={previewHeaderNavItems}
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
              onUpdateMenu={(updates) => updateMenu(resolvedMenuId, updates)}
              onBack={() => {
                setSelectedMenuId(null);
                setForceShowList(true);
              }}
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
      {menuPendingDelete ? (
        <DeleteMenuConfirmModal
          menu={menuPendingDelete}
          onClose={() => setMenuPendingDelete(null)}
          onConfirm={() => {
            deleteMenu(menuPendingDelete.id);
            setMenuPendingDelete(null);
          }}
        />
      ) : null}
    </>
  );
}

export default NavigationView;

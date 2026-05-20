import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { Button, ToggleControl } from '@wordpress/components';
import { trash } from '@wordpress/icons';
import { Page } from '@wordpress/admin-ui';
import PreviewCanvas from '../shared/PreviewCanvas';
import MenuEditor from '../navigation/MenuEditor';
import AddMenuModal from '../navigation/AddMenuModal';
import RenameMenuModal from '../navigation/RenameMenuModal';
import DeleteMenuConfirmModal from '../modals/DeleteMenuConfirmModal';
import { useAppState } from '../../hooks/useAppState';
import { MAIN_MENU_ID } from '../../constants/navigation';

function NavigationView() {
  const navigate = useNavigate();
  const {
    navigationMenus: menus,
    setNavigationMenus,
    pages: appPages,
  } = useAppState();
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [menuPendingRename, setMenuPendingRename] = useState(null);
  const [menuPendingDelete, setMenuPendingDelete] = useState(null);
  const [highlightMenus, setHighlightMenus] = useState(true);
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

  const selectedMenu =
    selectedMenuId != null
      ? menus.find((menu) => menu.id === selectedMenuId)
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
      items: [],
      usedIn: [],
    };
    setNavigationMenus(prev => [...prev, newMenu]);
    setSelectedMenuId(newMenu.id);
  };

  const deleteMenu = (menuId) => {
    setNavigationMenus((prev) => prev.filter((m) => m.id !== menuId));
    if (selectedMenuId === menuId) {
      setSelectedMenuId(null);
    }
  };

  const renameMenu = (menuId, menuName) => {
    updateMenu(menuId, { name: menuName });
  };

  const fields = useMemo(
    () => [
      {
        id: 'name',
        header: 'Menu name',
        getValue: ({ item }) => item.name,
        render: ({ item }) => <span>{item.name}</span>,
        enableSorting: true,
        enableGlobalSearch: false,
      },
      {
        id: 'locations',
        header: 'Used in',
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
        id: 'rename-menu',
        label: 'Rename',
        callback: (items) => {
          setMenuPendingRename(items[0]);
        },
      },
      {
        id: 'delete-menu',
        label: () => (
          <span className="nav-dataviews-action-delete">Delete</span>
        ),
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

  const shouldSpotlightHeaderNavigation =
    highlightMenus && (selectedMenu?.usedIn.includes('header-main') ?? false);

  /** Menu rows — matches editor order and labels; drives preview header nav. */
  const previewHeaderNavItems = useMemo(() => {
    const menuForPreview =
      selectedMenu ?? menus.find((m) => m.id === MAIN_MENU_ID) ?? menus[0];
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
        onChangeSelection={(ids) => {
          if (ids.length === 1) {
            setSelectedMenuId(ids[0]);
          }
        }}
        defaultLayouts={{ list: {} }}
        isItemClickable={() => true}
        onClickItem={(item) => {
          setSelectedMenuId(item.id);
        }}
        getItemId={(item) => item.id}
      >
        <div className="nav-dv-scroll">
          <DataViews.Layout />
          <DataViews.Pagination />
        </div>
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
      spotlightHeaderNavigation={shouldSpotlightHeaderNavigation}
      toolbarControls={
        selectedMenu ? (
          <ToggleControl
            __nextHasNoMarginBottom
            className="nav-highlight-menus-toggle"
            label="Highlight menus"
            checked={highlightMenus}
            onChange={setHighlightMenus}
          />
        ) : null
      }
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
              title="Navigation Menus"
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
              onPreviewItem={setPreviewPage}
              onBack={() => {
                setSelectedMenuId(null);
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
      {menuPendingRename ? (
        <RenameMenuModal
          menu={menuPendingRename}
          onClose={() => setMenuPendingRename(null)}
          onSave={(menuName) => {
            renameMenu(menuPendingRename.id, menuName);
            setMenuPendingRename(null);
          }}
        />
      ) : null}
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

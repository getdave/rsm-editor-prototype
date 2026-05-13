import { useState, useMemo, useCallback } from 'react';
import { Modal } from '@wordpress/components';
import { DataViewsPicker, filterSortAndPaginate } from '@wordpress/dataviews';
import { home, page as pageIcon, postList } from '@wordpress/icons';
import { collectPageIdsInMenu } from './navigationUtils';

const VIEW_PICKER_GRID = 'pickerGrid';

/** Picker grid + picker table only — @wordpress/dataviews does not ship list/activity variants for DataViewsPicker. */
const INITIAL_VIEW = {
  type: VIEW_PICKER_GRID,
  search: '',
  filters: [],
  page: 1,
  perPage: 50,
  sort: undefined,
  titleField: 'name',
  mediaField: 'media',
  fields: ['inThisMenu'],
  showMedia: true,
};

const DEFAULT_PICKER_LAYOUTS = {
  pickerGrid: {
    badgeFields: ['inThisMenu'],
    layout: { previewSize: 60 },
  },
  pickerTable: {},
};

/**
 * Mount only when open; parent passes a changing `key` so internal picker state resets per open.
 */
function AddPagesToMenuModal({ onClose, pages, menuItems, onConfirm }) {
  const [view, setView] = useState(() => ({ ...INITIAL_VIEW }));
  const [selection, setSelection] = useState([]);

  const pageIdSet = useMemo(
    () => collectPageIdsInMenu(menuItems),
    [menuItems],
  );

  const fields = useMemo(
    () => [
      {
        id: 'media',
        label: 'Icon',
        render: ({ item }) => (
          <span className="nav-add-pages-picker-thumb">
            <span className="nav-add-pages-picker-thumb-icon">
              {item.isFrontPage
                ? home
                : item.isPostsPage
                  ? postList
                  : pageIcon}
            </span>
            {item.isFrontPage ? (
              <span className="nav-add-pages-picker-thumb-overlay nav-add-pages-picker-thumb-overlay--home">
                Homepage
              </span>
            ) : item.isPostsPage ? (
              <span className="nav-add-pages-picker-thumb-overlay nav-add-pages-picker-thumb-overlay--posts">
                Posts page
              </span>
            ) : null}
          </span>
        ),
        enableSorting: false,
        enableHiding: false,
        filterBy: false,
        enableGlobalSearch: false,
      },
      {
        id: 'name',
        type: 'text',
        label: 'Title',
        enableHiding: false,
        enableGlobalSearch: true,
        render: ({ item }) => (
          <span className="nav-add-pages-picker-title">{item.name}</span>
        ),
      },
      {
        id: 'inThisMenu',
        type: 'text',
        label: 'Menu',
        enableSorting: false,
        enableHiding: false,
        filterBy: false,
        enableGlobalSearch: false,
        render: ({ item }) =>
          item.inThisMenu ? (
            <span className="nav-add-pages-picker-badge nav-add-pages-picker-badge--in">
              In this menu
            </span>
          ) : (
            <span className="nav-add-pages-picker-badge nav-add-pages-picker-badge--out">
              Not linked yet
            </span>
          ),
      },
    ],
    [],
  );

  const dataWithFlags = useMemo(
    () =>
      pages.map((p) => ({
        ...p,
        inThisMenu: pageIdSet.has(p.id),
      })),
    [pages, pageIdSet],
  );

  const { data: processedData, paginationInfo } = useMemo(
    () => filterSortAndPaginate(dataWithFlags, view, fields),
    [dataWithFlags, view, fields],
  );

  const actions = useMemo(
    () => [
      {
        id: 'cancel',
        label: 'Cancel',
        supportsBulk: true,
        callback() {
          onClose();
        },
      },
      {
        id: 'confirm',
        label: 'Add to menu',
        isPrimary: true,
        supportsBulk: true,
        callback(items) {
          if (!items?.length) {
            onClose();
            return;
          }
          onConfirm(items);
        },
      },
    ],
    [onClose, onConfirm],
  );

  const handleChangeView = useCallback((newView) => {
    setView((prev) => {
      const merged = { ...prev, ...newView };
      const type = merged.type;
      return {
        ...merged,
        fields: ['inThisMenu'],
        // Thumbnail/media only in grid; table (and any non-grid picker layout) is title + data columns only.
        showMedia: type === VIEW_PICKER_GRID,
      };
    });
  }, []);

  return (
    <Modal
      className="nav-add-pages-modal"
      title="Add pages to menu"
      onRequestClose={onClose}
      isFullScreen={false}
      size="fill"
    >
      <div className="nav-add-pages-picker-root">
        <DataViewsPicker
          search
          searchLabel="Search pages"
          actions={actions}
          selection={selection}
          onChangeSelection={setSelection}
          getItemId={(item) => item.id}
          paginationInfo={paginationInfo}
          data={processedData}
          view={view}
          fields={fields}
          onChangeView={handleChangeView}
          config={{ perPageSizes: [10, 25, 50, 100] }}
          itemListLabel="Pages"
          defaultLayouts={DEFAULT_PICKER_LAYOUTS}
        />
      </div>
    </Modal>
  );
}

export default AddPagesToMenuModal;

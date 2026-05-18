import { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  privateApis as componentsPrivateApis,
} from '@wordpress/components';
import { DataViewsPicker, filterSortAndPaginate } from '@wordpress/dataviews';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import {
  archive,
  category,
  customLink,
  file,
  home,
  image,
  page as pageIcon,
  postList,
  store,
  tag,
} from '@wordpress/icons';
import heroImage from '../../assets/hero.png';
import { navigationAdvancedTargets } from '../../data/mockData';
import PageLayoutWireframeThumb from '../shared/PageLayoutWireframeThumb';
import AddLinkPopover from './AddLinkPopover';
import { collectPageIdsInMenu, collectUrlsInMenu } from './navigationUtils';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
  'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
  '@wordpress/edit-site',
);
const { Tabs } = unlock(componentsPrivateApis);

const VIEW_PICKER_GRID = 'pickerGrid';
const VIEW_PICKER_TABLE = 'pickerTable';
const TYPE_PAGES = 'pages';
const TYPE_CONTENT = 'content';
const TYPE_LISTING_PAGES = 'collections';
const TYPE_TAXONOMY = 'taxonomy';
const TYPE_MEDIA = 'media';
const TYPE_CUSTOM_URL = 'custom-url';
const PAGE_TAB_STATIC = 'static';
const PAGE_TAB_DYNAMIC = 'dynamic';
const PAGE_PICKER_FIELDS = ['status', 'inThisMenu'];

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
  fields: [...PAGE_PICKER_FIELDS],
  showMedia: true,
};

const DEFAULT_PICKER_LAYOUTS = {
  pickerGrid: {
    badgeFields: ['status', 'inThisMenu'],
    layout: { previewSize: 88 },
  },
  pickerTable: {},
};

const NAV_ITEM_GROUPS = [
  {
    id: TYPE_PAGES,
    title: 'Pages',
    description: 'Site pages and page-like content.',
    icon: pageIcon,
  },
  {
    id: TYPE_CONTENT,
    title: 'Content',
    description: 'Posts, products, and other individual content.',
    icon: postList,
  },
  {
    id: TYPE_TAXONOMY,
    title: 'Categories & tags',
    description: 'Categories, tags, brands, and other term archives.',
    icon: category,
  },
  {
    id: TYPE_MEDIA,
    title: 'Media',
    description: 'Media files and downloads.',
    icon: image,
  },
  {
    id: TYPE_CUSTOM_URL,
    title: 'Custom link',
    description: 'Any URL, email, phone, anchor, or relative link.',
    icon: customLink,
  },
];

const PAGE_SUB_TABS = [
  {
    id: PAGE_TAB_STATIC,
    title: 'Static',
    itemListLabel: 'Static pages',
    searchLabel: 'Search static pages',
  },
  {
    id: PAGE_TAB_DYNAMIC,
    title: 'Dynamic',
    itemListLabel: 'Listing pages',
    searchLabel: 'Search listing pages',
  },
];

const SOURCE_TYPE_ICON = {
  post: postList,
  product: store,
  category,
  tag,
  brand: store,
  'product-category': category,
  'product-tag': tag,
  'post-type-archive': archive,
  'generated-page': archive,
  media: image,
  'media-image': image,
  'media-document': file,
};

const ADVANCED_DEFAULT_LAYOUTS = {
  pickerGrid: {
    badgeFields: ['typeLabel', 'inThisMenu'],
    layout: { previewSize: 120 },
  },
  pickerTable: {},
};

function createAdvancedView(groupId) {
  const isMediaGroup = groupId === TYPE_MEDIA;
  return {
    type: isMediaGroup ? VIEW_PICKER_GRID : VIEW_PICKER_TABLE,
    search: '',
    filters: [],
    page: 1,
    perPage: 25,
    sort: { field: 'name', direction: 'asc' },
    titleField: 'name',
    mediaField: 'media',
    descriptionField: 'linkLabel',
    fields: isMediaGroup
      ? ['typeLabel', 'inThisMenu']
      : ['typeLabel', 'linkLabel', 'inThisMenu'],
    layout: {
      badgeFields: ['typeLabel', 'inThisMenu'],
      previewSize: isMediaGroup ? 140 : 120,
    },
    showMedia: isMediaGroup,
    showDescription: false,
  };
}

/** Site pages only — excludes dynamic/template routes (`category: dynamic` in mock data). */
function filterPickerContentPages(pagesList) {
  return pagesList.filter((p) => p.category === 'content');
}

function selectedItemsFromIds(items, selectedIds) {
  const selectedIdSet = new Set(selectedIds);
  return items.filter((item) => selectedIdSet.has(item.id));
}

function typeElementsForRows(items) {
  const seen = new Set();
  const elements = [];
  for (const item of items) {
    if (seen.has(item.sourceType)) {
      continue;
    }
    seen.add(item.sourceType);
    elements.push({ value: item.sourceType, label: item.typeLabel });
  }
  return elements;
}

function thumbnailForTarget(target) {
  if (target.thumbnail === 'hero') {
    return heroImage;
  }
  return target.thumbnail;
}

function normalizeAdvancedViewForGroup(groupId, nextView) {
  const isMediaGroup = groupId === TYPE_MEDIA;
  const type = nextView.type ?? (isMediaGroup ? VIEW_PICKER_GRID : VIEW_PICKER_TABLE);
  const isGrid = type === VIEW_PICKER_GRID;
  return {
    ...nextView,
    type,
    titleField: 'name',
    mediaField: 'media',
    descriptionField: 'linkLabel',
    fields: isGrid
      ? ['typeLabel', 'inThisMenu']
      : ['typeLabel', 'linkLabel', 'inThisMenu'],
    layout: {
      ...(nextView.layout || {}),
      badgeFields: ['typeLabel', 'inThisMenu'],
      previewSize:
        nextView.layout?.previewSize ?? (isMediaGroup ? 140 : 120),
    },
    showMedia: isMediaGroup || isGrid,
    showDescription: false,
  };
}

function createTargetFields(typeElements) {
  return [
    {
      id: 'media',
      label: 'Preview',
      render: ({ item, config }) => {
        const isCompact = config?.sizes === '32px';
        return (
          <span
            className={[
              'nav-add-pages-picker-thumb',
              'nav-add-pages-picker-thumb--advanced',
              item.media ? 'nav-add-pages-picker-thumb--image' : '',
              isCompact ? 'nav-add-pages-picker-thumb--compact' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {item.media ? (
              <img src={item.media} alt="" />
            ) : (
              <span className="nav-add-pages-picker-thumb-icon">
                {item.icon}
              </span>
            )}
          </span>
        );
      },
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
      id: 'sectionLabel',
      type: 'text',
      label: 'Group',
      enableHiding: false,
      enableGlobalSearch: true,
    },
    {
      id: 'sourceType',
      type: 'text',
      label: 'Type',
      elements: typeElements,
      enableSorting: false,
      enableHiding: false,
      enableGlobalSearch: false,
      filterBy: {
        isPrimary: true,
        operators: ['isAny'],
      },
      render: ({ item }) => item.typeLabel,
    },
    {
      id: 'typeLabel',
      type: 'text',
      label: 'Type',
      enableSorting: false,
      enableHiding: false,
      filterBy: false,
      enableGlobalSearch: true,
      render: ({ item }) => (
        <span className="nav-add-menu-items-type-label">
          {item.typeLabel}
        </span>
      ),
    },
    {
      id: 'linkLabel',
      type: 'text',
      label: 'Link',
      enableSorting: false,
      filterBy: false,
      enableGlobalSearch: true,
      render: ({ item }) => (
        <span className="nav-add-menu-items-url">{item.linkLabel}</span>
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
  ];
}

/**
 * Mount only when open; parent passes a changing `key` so internal picker state resets per open.
 */
function AddPagesToMenuModal({ onClose, pages, menuItems, onConfirm }) {
  const [selectedGroupId, setSelectedGroupId] = useState(TYPE_PAGES);
  const [selectedPageTabId, setSelectedPageTabId] = useState(PAGE_TAB_STATIC);
  const [pageView, setPageView] = useState(() => ({ ...INITIAL_VIEW }));
  const [pageSelection, setPageSelection] = useState([]);
  const [listingPageView, setListingPageView] = useState(() =>
    createAdvancedView(TYPE_LISTING_PAGES),
  );
  const [listingPageSelection, setListingPageSelection] = useState([]);
  const [advancedView, setAdvancedView] = useState(() =>
    createAdvancedView(TYPE_CONTENT),
  );
  const [advancedSelection, setAdvancedSelection] = useState([]);

  const pageIdSet = useMemo(
    () => collectPageIdsInMenu(menuItems),
    [menuItems],
  );
  const urlSet = useMemo(
    () => collectUrlsInMenu(menuItems),
    [menuItems],
  );

  const activeType = useMemo(
    () =>
      NAV_ITEM_GROUPS.find((type) => type.id === selectedGroupId) ??
      NAV_ITEM_GROUPS[0],
    [selectedGroupId],
  );

  const contentPagesOnly = useMemo(
    () => filterPickerContentPages(pages),
    [pages],
  );

  const isPageGridLayout = pageView.type === VIEW_PICKER_GRID;

  const pageFields = useMemo(
    () => [
      {
        id: 'media',
        label: 'Icon',
        render: ({ item }) => (
          <span
            className={
              isPageGridLayout
                ? 'pp-media-thumb pp-media-thumb--grid'
                : 'pp-media-thumb'
            }
          >
            {isPageGridLayout ? (
              <PageLayoutWireframeThumb page={item} />
            ) : (
              <span
                className="pp-media-thumb-icon"
                style={{ color: '#999', display: 'flex' }}
              >
                {item.isFrontPage
                  ? home
                  : item.isPostsPage
                    ? postList
                    : pageIcon}
              </span>
            )}
            {item.isFrontPage ? (
              <span className="pp-front-page-overlay">
                Homepage
              </span>
            ) : item.isPostsPage ? (
              <span className="pp-posts-page-overlay">
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
        render: ({ item }) => {
          const docIcon = item.isFrontPage
            ? home
            : item.isPostsPage
              ? postList
              : pageIcon;
          const isLive = item.status !== 'draft';
          return (
            <span className="pp-title-cell-inner">
              <span
                className={`pp-title-glyph-icon${item.isPostsPage ? ' pp-title-glyph-icon--posts' : ''}`}
                aria-hidden="true"
                title={
                  item.isFrontPage
                    ? 'Homepage'
                    : item.isPostsPage
                      ? 'Posts page'
                      : undefined
                }
              >
                {docIcon}
              </span>
              <span className="pp-title-cell-name">{item.name}</span>
              <span
                className={`url-dot${isLive ? '' : ' url-draft-dot'}`}
                role="status"
                aria-label={isLive ? 'Page is live' : 'Page is a draft'}
              />
            </span>
          );
        },
      },
      {
        id: 'status',
        type: 'text',
        label: 'Status',
        enableSorting: false,
        enableHiding: false,
        filterBy: false,
        enableGlobalSearch: false,
        render: ({ item }) =>
          item.status === 'draft' ? (
            <span className="pp-badge pp-draft">Draft</span>
          ) : (
            <span className="pp-badge pp-live">Published</span>
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
            <span className="pp-badge pp-nav">
              In this menu
            </span>
          ) : (
            <span className="pp-menu-empty">
              —
            </span>
          ),
      },
    ],
    [isPageGridLayout],
  );

  const pageRows = useMemo(
    () =>
      contentPagesOnly.map((p) => ({
        ...p,
        inThisMenu: pageIdSet.has(p.id),
      })),
    [contentPagesOnly, pageIdSet],
  );

  const listingPageRows = useMemo(
    () =>
      navigationAdvancedTargets
        .filter((target) => target.group === TYPE_LISTING_PAGES)
        .map((target) => ({
          ...target,
          icon: SOURCE_TYPE_ICON[target.sourceType] ?? archive,
          media: thumbnailForTarget(target),
          navLabel: target.name,
          navPageId: target.pageId,
          navUrl: target.url,
          linkLabel: target.url ?? 'Linked page',
          inThisMenu: target.pageId
            ? pageIdSet.has(target.pageId)
            : urlSet.has(target.url),
        })),
    [pageIdSet, urlSet],
  );

  const advancedRows = useMemo(
    () =>
      navigationAdvancedTargets
        .filter((target) => target.group === selectedGroupId)
        .map((target) => ({
          ...target,
          icon: SOURCE_TYPE_ICON[target.sourceType] ?? activeType.icon,
          media: thumbnailForTarget(target),
          navLabel: target.name,
          navPageId: target.pageId,
          navUrl: target.url,
          linkLabel: target.url ?? 'Linked page',
          inThisMenu: target.pageId
            ? pageIdSet.has(target.pageId)
            : urlSet.has(target.url),
        })),
    [selectedGroupId, activeType.icon, pageIdSet, urlSet],
  );

  const advancedTypeElements = useMemo(
    () => typeElementsForRows(advancedRows),
    [advancedRows],
  );

  const listingPageTypeElements = useMemo(
    () => typeElementsForRows(listingPageRows),
    [listingPageRows],
  );

  const advancedFields = useMemo(
    () => createTargetFields(advancedTypeElements),
    [advancedTypeElements],
  );

  const listingPageFields = useMemo(
    () => createTargetFields(listingPageTypeElements),
    [listingPageTypeElements],
  );

  const selectedAdvancedItems = useMemo(
    () => selectedItemsFromIds(advancedRows, advancedSelection),
    [advancedRows, advancedSelection],
  );

  const selectedListingPageItems = useMemo(
    () => selectedItemsFromIds(listingPageRows, listingPageSelection),
    [listingPageRows, listingPageSelection],
  );

  const { data: processedPageData, paginationInfo: pagePaginationInfo } = useMemo(
    () => filterSortAndPaginate(pageRows, pageView, pageFields),
    [pageRows, pageView, pageFields],
  );

  const {
    data: processedListingPageData,
    paginationInfo: listingPagePaginationInfo,
  } = useMemo(
    () => filterSortAndPaginate(listingPageRows, listingPageView, listingPageFields),
    [listingPageRows, listingPageView, listingPageFields],
  );

  const {
    data: processedAdvancedData,
    paginationInfo: advancedPaginationInfo,
  } = useMemo(
    () => filterSortAndPaginate(advancedRows, advancedView, advancedFields),
    [advancedRows, advancedView, advancedFields],
  );

  const pageActions = useMemo(
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
        callback() {
          const itemsToAdd = selectedItemsFromIds(pageRows, pageSelection);
          if (itemsToAdd.length) {
            onConfirm(itemsToAdd);
          }
        },
      },
    ],
    [onClose, onConfirm, pageRows, pageSelection],
  );

  const advancedActions = useMemo(
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
        callback() {
          const itemsToAdd = selectedAdvancedItems;
          if (itemsToAdd.length) {
            onConfirm(itemsToAdd);
          }
        },
      },
    ],
    [onClose, onConfirm, selectedAdvancedItems],
  );

  const listingPageActions = useMemo(
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
        callback() {
          if (selectedListingPageItems.length) {
            onConfirm(selectedListingPageItems);
          }
        },
      },
    ],
    [onClose, onConfirm, selectedListingPageItems],
  );

  const handlePageChangeView = useCallback((newView) => {
    setPageView((prev) => {
      const merged = { ...prev, ...newView };
      const type = merged.type;
      return {
        ...merged,
        fields: [...PAGE_PICKER_FIELDS],
        // Thumbnail/media only in grid; table (and any non-grid picker layout) is title + data columns only.
        showMedia: type === VIEW_PICKER_GRID,
      };
    });
  }, []);

  const handleAdvancedChangeView = useCallback(
    (newView) => {
      setAdvancedView((prev) =>
        normalizeAdvancedViewForGroup(selectedGroupId, {
          ...prev,
          ...newView,
        }),
      );
    },
    [selectedGroupId],
  );

  const handleListingPageChangeView = useCallback((newView) => {
    setListingPageView((prev) =>
      normalizeAdvancedViewForGroup(TYPE_LISTING_PAGES, {
        ...prev,
        ...newView,
      }),
    );
  }, []);

  const selectPageTab = (tabId) => {
    setSelectedPageTabId(tabId);
    setPageSelection([]);
    setListingPageSelection([]);
  };

  const selectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setAdvancedSelection([]);
    if (groupId !== TYPE_PAGES) {
      setPageSelection([]);
      setListingPageSelection([]);
      setAdvancedView(createAdvancedView(groupId));
    }
  };

  const addCustomUrl = ({ label, url }) => {
    onConfirm([
      {
        id: `custom-url-${Date.now()}`,
        navLabel: label,
        navUrl: url,
        sourceType: 'custom-url',
      },
    ]);
  };

  return (
    <Modal
      className="nav-add-pages-modal"
      title="Add menu items"
      onRequestClose={onClose}
      isFullScreen={false}
      size="fill"
    >
      <div className="nav-add-pages-picker-root">
        <Tabs
          orientation="vertical"
          selectedTabId={selectedGroupId}
          onSelect={selectGroup}
        >
          <div className="nav-add-menu-items-layout">
            <Tabs.TabList
              className="nav-add-menu-items-tablist"
              aria-label="Content types"
            >
              {NAV_ITEM_GROUPS.map((type) => (
                <Tabs.Tab
                  key={type.id}
                  tabId={type.id}
                  className="nav-add-menu-items-tab"
                >
                  <span
                    className="nav-add-menu-items-tab__icon"
                    aria-hidden="true"
                  >
                    {type.icon}
                  </span>
                  <span className="nav-add-menu-items-tab__title">
                    {type.title}
                  </span>
                </Tabs.Tab>
              ))}
            </Tabs.TabList>

            <div className="nav-add-menu-items-panels">
              {NAV_ITEM_GROUPS.map((type) => (
                <Tabs.TabPanel
                  key={type.id}
                  tabId={type.id}
                  focusable={false}
                  className="nav-add-menu-items-panel"
                >
                  <div className="nav-add-menu-items-panel__header">
                    <h2>{type.title}</h2>
                    <p>{type.description}</p>
                  </div>

                  {type.id === TYPE_PAGES ? (
                    <>
                      <div className="nav-add-pages-subtabs-row">
                        <div
                          className="nav-add-pages-subtabs"
                          role="tablist"
                          aria-label="Page types"
                        >
                          {PAGE_SUB_TABS.map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              role="tab"
                              aria-selected={selectedPageTabId === tab.id}
                              className={`nav-add-pages-subtab${selectedPageTabId === tab.id ? ' is-active' : ''}`}
                              onClick={() => selectPageTab(tab.id)}
                            >
                              {tab.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      {selectedPageTabId === PAGE_TAB_STATIC ? (
                        <DataViewsPicker
                          search
                          searchLabel="Search static pages"
                          actions={pageActions}
                          selection={pageSelection}
                          onChangeSelection={setPageSelection}
                          getItemId={(item) => item.id}
                          paginationInfo={pagePaginationInfo}
                          data={processedPageData}
                          view={pageView}
                          fields={pageFields}
                          onChangeView={handlePageChangeView}
                          config={{ perPageSizes: [10, 25, 50, 100] }}
                          itemListLabel="Static pages"
                          defaultLayouts={DEFAULT_PICKER_LAYOUTS}
                        />
                      ) : (
                        <DataViewsPicker
                          search
                          searchLabel="Search listing pages"
                          actions={listingPageActions}
                          selection={listingPageSelection}
                          onChangeSelection={setListingPageSelection}
                          getItemId={(item) => item.id}
                          paginationInfo={listingPagePaginationInfo}
                          data={processedListingPageData}
                          view={listingPageView}
                          fields={listingPageFields}
                          onChangeView={handleListingPageChangeView}
                          config={{ perPageSizes: [10, 25, 50, 100] }}
                          itemListLabel="Listing pages"
                          defaultLayouts={ADVANCED_DEFAULT_LAYOUTS}
                        />
                      )}
                    </>
                  ) : null}

                  {type.id !== TYPE_PAGES && type.id !== TYPE_CUSTOM_URL ? (
                    <DataViewsPicker
                      search
                      searchLabel={`Search ${type.title.toLowerCase()}`}
                      actions={advancedActions}
                      selection={advancedSelection}
                      onChangeSelection={setAdvancedSelection}
                      getItemId={(item) => item.id}
                      paginationInfo={advancedPaginationInfo}
                      data={processedAdvancedData}
                      view={advancedView}
                      fields={advancedFields}
                      onChangeView={handleAdvancedChangeView}
                      config={{ perPageSizes: [10, 25, 50, 100] }}
                      itemListLabel={type.title}
                      defaultLayouts={ADVANCED_DEFAULT_LAYOUTS}
                    />
                  ) : null}

                  {type.id === TYPE_CUSTOM_URL ? (
                    <div className="nav-add-pages-custom-link">
                      <AddLinkPopover
                        showBack={false}
                        onBack={() => selectGroup(TYPE_PAGES)}
                        onCancel={onClose}
                        onSave={addCustomUrl}
                      />
                    </div>
                  ) : null}
                </Tabs.TabPanel>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </Modal>
  );
}

export default AddPagesToMenuModal;

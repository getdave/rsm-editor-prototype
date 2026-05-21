import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Modal,
  Tooltip,
  privateApis as componentsPrivateApis,
} from '@wordpress/components';
import { DataViewsPicker, filterSortAndPaginate } from '@wordpress/dataviews';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import {
  archive,
  category,
  chevronDown,
  chevronUp,
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
const TYPE_ARCHIVE_DESTINATIONS = 'collections';
const TYPE_TAXONOMY = 'taxonomy';
const TYPE_MEDIA = 'media';
const TYPE_CUSTOM_URL = 'custom-url';
const PAGE_PICKER_FIELDS = ['typeLabel', 'linkLabel', 'status', 'inThisMenu'];

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
  showDescription: false,
};

const DEFAULT_PICKER_LAYOUTS = {
  pickerGrid: {
    badgeFields: ['typeLabel', 'inThisMenu'],
    layout: { previewSize: 264 },
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

function ModalPickerViewOptionsToggle({ isOpen, onToggle }) {
  return (
    <Button
      variant="tertiary"
      className="nav-add-picker-view-options-toggle"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      View options
      <span className="nav-add-picker-view-options-chevron">
        {isOpen ? chevronUp : chevronDown}
      </span>
    </Button>
  );
}

function ModalPickerChrome({
  isOpen,
  onToggle,
  searchLabel,
  showToggleRow = true,
}) {
  return (
    <>
      {showToggleRow ? (
        <div className="nav-add-picker-view-options-row">
          <ModalPickerViewOptionsToggle
            isOpen={isOpen}
            onToggle={onToggle}
          />
        </div>
      ) : null}
      {isOpen ? (
        <>
          <div className="nav-add-picker-toolbar-row-options">
            <DataViewsPicker.Search label={searchLabel} />
            <DataViewsPicker.FiltersToggle />
            <DataViewsPicker.LayoutSwitcher />
            <DataViewsPicker.ViewConfig />
          </div>
          <DataViewsPicker.FiltersToggled className="nav-add-picker-filters" />
        </>
      ) : null}
      <div className="nav-add-picker-scroll">
        <DataViewsPicker.Layout />
      </div>
      <DataViewsPicker.BulkActionToolbar />
    </>
  );
}

/** Site pages only — excludes dynamic/template routes (`category: dynamic` in mock data). */
function filterPickerContentPages(pagesList) {
  return pagesList.filter((p) => p.category === 'content');
}

function selectedItemsFromIds(items, selectedIds) {
  const selectedIdSet = new Set(selectedIds);
  return items.filter((item) => selectedIdSet.has(item.id));
}

function typeElementsForRows(items, valueKey = 'sourceType') {
  const seen = new Set();
  const elements = [];
  for (const item of items) {
    const value = item[valueKey];
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    elements.push({ value, label: item.typeLabel });
  }
  return elements;
}

function thumbnailForTarget(target) {
  if (target.thumbnail === 'hero') {
    return heroImage;
  }
  return target.thumbnail;
}

function urlForPageSlug(slug) {
  if (!slug) {
    return undefined;
  }
  if (slug === 'home') {
    return '/';
  }
  return `/${slug.replace(/^\/+|\/+$/g, '')}/`;
}

function linkLabelForTarget(target, pageUrlById) {
  return target.url ?? pageUrlById.get(target.pageId) ?? '';
}

function slugFromUrl(url) {
  if (!url) {
    return '';
  }
  return url.replace(/^\/+|\/+$/g, '');
}

function configuredArchivePageForTarget(target, pagesList) {
  if (target.archivePageRole === 'posts') {
    return pagesList.find((page) => page.isPostsPage);
  }
  if (target.archivePageRole === 'shop') {
    return pagesList.find((page) => page.isShopPage);
  }
  return undefined;
}

function typeLabelForPage(page) {
  if (page.isPostsPage) {
    return 'Posts page';
  }
  if (page.isShopPage) {
    return 'Shop page';
  }
  return 'Page';
}

function rowForContentPage(page, { pageUrlById, pageIdSet }) {
  return {
    ...page,
    navLabel: page.name,
    navPageId: page.id,
    linkLabel: pageUrlById.get(page.id) ?? '',
    typeLabel: typeLabelForPage(page),
    inThisMenu: pageIdSet.has(page.id),
  };
}

function isLinkableArchiveDestination(target, pagesList) {
  return (
    target.group === TYPE_ARCHIVE_DESTINATIONS &&
    target.sourceType === 'post-type-archive' &&
    Boolean(target.url) &&
    !configuredArchivePageForTarget(target, pagesList)
  );
}

function rowForNavigationTarget(target, { fallbackIcon, pageUrlById, pagesList, pageIdSet, urlSet }) {
  const archivePage = configuredArchivePageForTarget(target, pagesList);
  const navPageId = archivePage?.id ?? target.pageId;
  const navUrl = target.url;
  const name = archivePage?.name ?? target.name;
  const previewPage = archivePage ?? {
    id: target.pageId ?? target.id,
    slug: slugFromUrl(navUrl),
    name,
    type: 'Dynamic Page',
    isLive: true,
    isSystem: false,
    isDynamic: true,
    isArchiveListing: true,
    category: 'dynamic',
    status: 'live',
    authorDisplay: target.authorDisplay ?? 'WordPress',
    sourceType: target.sourceType,
  };
  return {
    ...target,
    name,
    icon: SOURCE_TYPE_ICON[target.sourceType] ?? fallbackIcon,
    media: thumbnailForTarget(target),
    navLabel: name,
    navPageId,
    navUrl,
    previewPage,
    status: archivePage?.status ?? target.status ?? 'live',
    isLive: archivePage?.isLive ?? (target.status !== 'draft'),
    isFrontPage: archivePage?.isFrontPage ?? false,
    isPostsPage: archivePage?.isPostsPage ?? false,
    isShopPage: archivePage?.isShopPage ?? false,
    authorDisplay: archivePage?.authorDisplay ?? target.authorDisplay ?? 'WordPress',
    linkLabel: linkLabelForTarget({ ...target, pageId: navPageId }, pageUrlById),
    inThisMenu: navPageId ? pageIdSet.has(navPageId) : urlSet.has(navUrl),
  };
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
  const [pageView, setPageView] = useState(() => ({ ...INITIAL_VIEW }));
  const [pageSelection, setPageSelection] = useState([]);
  const [advancedView, setAdvancedView] = useState(() =>
    createAdvancedView(TYPE_CONTENT),
  );
  const [advancedSelection, setAdvancedSelection] = useState([]);
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);

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

  const pageUrlById = useMemo(
    () => new Map(pages.map((page) => [page.id, urlForPageSlug(page.slug)])),
    [pages],
  );

  const isPageGridLayout = pageView.type === VIEW_PICKER_GRID;

  const pageRows = useMemo(
    () => [
      ...contentPagesOnly.map((page) =>
        rowForContentPage(page, { pageUrlById, pageIdSet }),
      ),
      ...navigationAdvancedTargets
        .filter((target) => isLinkableArchiveDestination(target, pages))
        .map((target) =>
          rowForNavigationTarget(target, {
            fallbackIcon: archive,
            pageUrlById,
            pagesList: pages,
            pageIdSet,
            urlSet,
          }),
        ),
    ],
    [contentPagesOnly, pageIdSet, pageUrlById, pages, urlSet],
  );

  const pageTypeElements = useMemo(
    () => typeElementsForRows(pageRows, 'typeLabel'),
    [pageRows],
  );

  const pageFields = useMemo(
    () => [
      {
        id: 'media',
        label: 'Icon',
        render: ({ item }) => {
          const previewPage = item.previewPage ?? item;
          const fallbackIcon =
            item.sourceType === 'post-type-archive' ? archive : pageIcon;
          return (
            <span
              className={
                isPageGridLayout
                  ? 'pp-media-thumb pp-media-thumb--grid'
                  : 'pp-media-thumb'
              }
            >
              {isPageGridLayout ? (
                <PageLayoutWireframeThumb page={previewPage} />
              ) : (
                <span
                  className="pp-media-thumb-icon"
                  style={{ color: '#999', display: 'flex' }}
                >
                  {item.isFrontPage
                    ? home
                    : item.isPostsPage
                      ? postList
                      : item.isShopPage
                        ? store
                        : fallbackIcon}
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
              ) : item.isShopPage ? (
                <span className="nav-add-shop-page-overlay">
                  Shop page
                </span>
              ) : null}
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
        render: ({ item }) => {
          const fallbackIcon =
            item.sourceType === 'post-type-archive' ? archive : pageIcon;
          const docIcon = item.isFrontPage
            ? home
            : item.isPostsPage
              ? postList
              : item.isShopPage
                ? store
                : fallbackIcon;
          const isLive = item.status !== 'draft';
          const statusLabel = isLive ? 'Page is published' : 'Page is a draft';
          return (
            <span className="pp-title-cell-inner">
              <span
                className={`pp-title-glyph-icon${item.isPostsPage ? ' pp-title-glyph-icon--posts' : ''}${item.isShopPage ? ' nav-add-title-glyph-icon--shop' : ''}`}
                aria-hidden="true"
                title={
                  item.isFrontPage
                    ? 'Homepage'
                    : item.isPostsPage
                      ? 'Posts page'
                      : item.isShopPage
                        ? 'Shop page'
                        : item.sourceType === 'post-type-archive'
                          ? 'Post type archive'
                          : undefined
                }
              >
                {docIcon}
              </span>
              <span className="pp-title-cell-name">{item.name}</span>
              <Tooltip text={statusLabel} placement="top">
                <span
                  className={`url-dot${isLive ? '' : ' url-draft-dot'}`}
                  role="status"
                  aria-label={statusLabel}
                />
              </Tooltip>
            </span>
          );
        },
      },
      {
        id: 'typeLabel',
        type: 'text',
        label: 'Type',
        elements: pageTypeElements,
        enableSorting: false,
        enableHiding: false,
        filterBy: {
          isPrimary: true,
          operators: ['isAny'],
        },
        enableGlobalSearch: true,
        render: ({ item }) => (
          <span
            className={`pp-badge nav-add-dynamic-page-type${item.isPostsPage || item.isShopPage ? ' nav-add-dynamic-page-type--sync' : ''}`}
          >
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
    [isPageGridLayout, pageTypeElements],
  );

  const advancedRows = useMemo(
    () =>
      navigationAdvancedTargets
        .filter((target) => target.group === selectedGroupId)
        .map((target) =>
          rowForNavigationTarget(target, {
            fallbackIcon: activeType.icon,
            pageUrlById,
            pagesList: pages,
            pageIdSet,
            urlSet,
          }),
        ),
    [selectedGroupId, activeType.icon, pageIdSet, pageUrlById, pages, urlSet],
  );

  const advancedTypeElements = useMemo(
    () => typeElementsForRows(advancedRows),
    [advancedRows],
  );

  const advancedFields = useMemo(
    () => createTargetFields(advancedTypeElements),
    [advancedTypeElements],
  );

  const selectedAdvancedItems = useMemo(
    () => selectedItemsFromIds(advancedRows, advancedSelection),
    [advancedRows, advancedSelection],
  );

  const { data: processedPageData, paginationInfo: pagePaginationInfo } = useMemo(
    () => filterSortAndPaginate(pageRows, pageView, pageFields),
    [pageRows, pageView, pageFields],
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

  const handlePageChangeView = useCallback((newView) => {
    setPageView((prev) => {
      const merged = { ...prev, ...newView };
      const type = merged.type;
      return {
        ...merged,
        fields: [...PAGE_PICKER_FIELDS],
        // Thumbnail/media only in grid; table (and any non-grid picker layout) is title + data columns only.
        showMedia: type === VIEW_PICKER_GRID,
        showDescription: false,
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

  const selectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setAdvancedSelection([]);
    if (groupId !== TYPE_PAGES) {
      setPageSelection([]);
      setAdvancedView(createAdvancedView(groupId));
    }
  };

  const addCustomUrl = ({ label, url }) => {
    onConfirm([
      {
        id: `custom-url-${Date.now()}`,
        name: label,
        navLabel: label,
        navUrl: url,
        sourceType: 'custom-url',
        typeLabel: 'Custom link',
        status: 'live',
        isLive: true,
        linkLabel: url,
      },
    ]);
  };

  const showCreatePageNotImplemented = () => {
    alert('This would create a new page, but this is a prototype.');
  };

  const toggleViewOptions = () => {
    setViewOptionsOpen((isOpen) => !isOpen);
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
                    <div className="nav-add-menu-items-panel__header-copy">
                      <h2>{type.title}</h2>
                      <p>{type.description}</p>
                    </div>
                    {type.id === TYPE_PAGES ? (
                      <Button
                        variant="secondary"
                        onClick={showCreatePageNotImplemented}
                      >
                        Create page
                      </Button>
                    ) : null}
                  </div>

                  {type.id === TYPE_PAGES ? (
                    <DataViewsPicker
                      search
                      searchLabel="Search pages"
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
                      itemListLabel="Pages"
                      defaultLayouts={DEFAULT_PICKER_LAYOUTS}
                    >
                      <ModalPickerChrome
                        isOpen={viewOptionsOpen}
                        onToggle={toggleViewOptions}
                        searchLabel="Search pages"
                      />
                    </DataViewsPicker>
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
                    >
                      <ModalPickerChrome
                        isOpen={viewOptionsOpen}
                        onToggle={toggleViewOptions}
                        searchLabel={`Search ${type.title.toLowerCase()}`}
                      />
                    </DataViewsPicker>
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

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Modal,
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
const TYPE_LISTING_PAGES = 'collections';
const TYPE_TAXONOMY = 'taxonomy';
const TYPE_MEDIA = 'media';
const TYPE_CUSTOM_URL = 'custom-url';
const PAGE_TAB_STATIC = 'static';
const PAGE_TAB_DYNAMIC = 'dynamic';
const PAGE_PICKER_FIELDS = ['status', 'inThisMenu'];
const DYNAMIC_PAGE_PICKER_FIELDS = ['typeLabel', 'linkLabel', 'inThisMenu'];

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

const DYNAMIC_PAGE_PICKER_LAYOUTS = {
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
    itemListLabel: 'Dynamic pages',
    searchLabel: 'Search dynamic pages',
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

function createDynamicPageView() {
  return {
    ...INITIAL_VIEW,
    perPage: 25,
    sort: { field: 'name', direction: 'asc' },
    descriptionField: 'linkLabel',
    fields: [...DYNAMIC_PAGE_PICKER_FIELDS],
    layout: {
      badgeFields: ['typeLabel', 'inThisMenu'],
      previewSize: 264,
    },
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
    status: archivePage?.status ?? 'live',
    isLive: archivePage?.isLive ?? true,
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

function createDynamicPageFields(typeElements, isGridLayout) {
  return [
    {
      id: 'media',
      label: 'Icon',
      render: ({ item }) => {
        const previewPage = item.previewPage ?? item;
        return (
          <span
            className={
              isGridLayout
                ? 'pp-media-thumb pp-media-thumb--grid'
                : 'pp-media-thumb'
            }
          >
            {isGridLayout ? (
              <PageLayoutWireframeThumb page={previewPage} />
            ) : (
              <span
                className="pp-media-thumb-icon"
                style={{ color: '#999', display: 'flex' }}
              >
                {item.isPostsPage
                  ? postList
                  : item.isShopPage
                    ? store
                    : archive}
              </span>
            )}
            {item.isPostsPage ? (
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
        const docIcon = item.isPostsPage
          ? postList
          : item.isShopPage
            ? store
            : archive;
        const isLive = item.status !== 'draft';
        return (
          <span className="pp-title-cell-inner">
            <span
              className={`pp-title-glyph-icon${item.isPostsPage ? ' pp-title-glyph-icon--posts' : ''}${item.isShopPage ? ' nav-add-title-glyph-icon--shop' : ''}`}
              aria-hidden="true"
              title={
                item.isPostsPage
                  ? 'Posts page'
                  : item.isShopPage
                    ? 'Shop page'
                    : 'Archive'
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
      id: 'typeLabel',
      type: 'text',
      label: 'Type',
      elements: typeElements,
      enableSorting: false,
      enableHiding: false,
      filterBy: {
        isPrimary: true,
        operators: ['isAny'],
      },
      enableGlobalSearch: true,
      render: ({ item }) => (
        <span className="pp-badge nav-add-dynamic-page-type">
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
          <span className="pp-badge pp-nav">
            In this menu
          </span>
        ) : (
          <span className="pp-menu-empty">
            —
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
    createDynamicPageView(),
  );
  const [listingPageSelection, setListingPageSelection] = useState([]);
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
  const isListingPageGridLayout = listingPageView.type === VIEW_PICKER_GRID;

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
                    : item.isShopPage
                      ? store
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
            ) : item.isShopPage ? (
              <span className="nav-add-shop-page-overlay">
                Shop page
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
              : item.isShopPage
                ? store
                : pageIcon;
          const isLive = item.status !== 'draft';
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
        .map((target) =>
          rowForNavigationTarget(target, {
            fallbackIcon: archive,
            pageUrlById,
            pagesList: pages,
            pageIdSet,
            urlSet,
          }),
        ),
    [pageIdSet, pageUrlById, pages, urlSet],
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

  const listingPageTypeElements = useMemo(
    () => typeElementsForRows(listingPageRows, 'typeLabel'),
    [listingPageRows],
  );

  const advancedFields = useMemo(
    () => createTargetFields(advancedTypeElements),
    [advancedTypeElements],
  );

  const listingPageFields = useMemo(
    () => createDynamicPageFields(listingPageTypeElements, isListingPageGridLayout),
    [listingPageTypeElements, isListingPageGridLayout],
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
    setListingPageView((prev) => {
      const merged = {
        ...prev,
        ...newView,
      };
      return {
        ...merged,
        fields: [...DYNAMIC_PAGE_PICKER_FIELDS],
        showMedia: merged.type === VIEW_PICKER_GRID,
        showDescription: false,
      };
    });
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
                        <ModalPickerViewOptionsToggle
                          isOpen={viewOptionsOpen}
                          onToggle={toggleViewOptions}
                        />
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
                        >
                          <ModalPickerChrome
                            isOpen={viewOptionsOpen}
                            onToggle={toggleViewOptions}
                            searchLabel="Search static pages"
                            showToggleRow={false}
                          />
                        </DataViewsPicker>
                      ) : (
                        <DataViewsPicker
                          search
                          searchLabel="Search dynamic pages"
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
                          itemListLabel="Dynamic pages"
                          defaultLayouts={DYNAMIC_PAGE_PICKER_LAYOUTS}
                        >
                          <ModalPickerChrome
                            isOpen={viewOptionsOpen}
                            onToggle={toggleViewOptions}
                            searchLabel="Search dynamic pages"
                            showToggleRow={false}
                          />
                        </DataViewsPicker>
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
